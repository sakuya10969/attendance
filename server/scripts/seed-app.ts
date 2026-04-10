import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { FirebaseService } from '../src/firebase/firebase.service'
import { PrismaService } from '../src/prisma/prisma.service'
import { appSeedUsers, tenantSeed } from './data/dev-seed-data'
import {
  memberScenarios,
  type MemberAttendanceScenario,
  type MemberScenario,
} from './data/dev-member-scenarios'

const DAY_MS = 24 * 60 * 60 * 1000

function atUtc(date: Date, hours: number, minutes = 0) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
      0,
      0,
    ),
  )
}

function asDateOnly(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
}

function offsetDate(baseDate: Date, offsetDays: number) {
  return asDateOnly(new Date(baseDate.getTime() + offsetDays * DAY_MS))
}

async function findOrCreateDepartment(
  prisma: PrismaService,
  tenantId: string,
  name: string,
) {
  return (
    (await prisma.department.findFirst({
      where: { tenantId, name },
    })) ??
    prisma.department.create({
      data: { tenantId, name },
    })
  )
}

async function seedUsersAndEmployees(
  prisma: PrismaService,
  firebase: FirebaseService,
  tenantId: string,
) {
  const firebaseUsers = await Promise.all(
    appSeedUsers.map(async (seedUser) => {
      const authUser = await firebase.getUserByEmail(seedUser.email)
      return [seedUser.email, authUser.uid] as const
    }),
  )
  const uidByEmail = new Map(firebaseUsers)

  const departments = await Promise.all(
    tenantSeed.departments.map((name) =>
      findOrCreateDepartment(prisma, tenantId, name),
    ),
  )
  const departmentIdByName = new Map(
    departments.map((department) => [department.name, department.id]),
  )

  const standardWorkPattern =
    (await prisma.workPattern.findFirst({
      where: { tenantId, name: tenantSeed.workPattern.name },
    })) ??
    (await prisma.workPattern.create({
      data: {
        tenantId,
        name: tenantSeed.workPattern.name,
        startTime: tenantSeed.workPattern.startTime,
        endTime: tenantSeed.workPattern.endTime,
        breakMinutes: tenantSeed.workPattern.breakMinutes,
      },
    }))

  const createdUsers = new Map<string, string>()
  const createdEmployees = new Map<string, string>()

  for (const seedUser of appSeedUsers) {
    const firebaseUid = uidByEmail.get(seedUser.email)

    if (!firebaseUid) {
      throw new Error(`Missing Firebase UID for ${seedUser.email}. Run seed-auth first.`)
    }

    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: {
        email: seedUser.email,
        name: seedUser.name,
        role: seedUser.role,
        tenantId,
        isActive: true,
      },
      create: {
        firebaseUid,
        email: seedUser.email,
        name: seedUser.name,
        role: seedUser.role,
        tenantId,
        isActive: true,
      },
    })
    createdUsers.set(seedUser.email, user.id)

    const employee = await prisma.employee.upsert({
      where: {
        tenantId_employeeNumber: {
          tenantId,
          employeeNumber: seedUser.employeeNumber,
        },
      },
      update: {
        userId: user.id,
        name: seedUser.name,
        departmentId: departmentIdByName.get(seedUser.departmentName) ?? null,
        workPatternId: standardWorkPattern.id,
        joinedAt: new Date('2025-04-01T00:00:00.000Z'),
      },
      create: {
        tenantId,
        userId: user.id,
        employeeNumber: seedUser.employeeNumber,
        name: seedUser.name,
        departmentId: departmentIdByName.get(seedUser.departmentName) ?? null,
        workPatternId: standardWorkPattern.id,
        joinedAt: new Date('2025-04-01T00:00:00.000Z'),
      },
    })
    createdEmployees.set(seedUser.email, employee.id)
  }

  return {
    createdUsers,
    createdEmployees,
  }
}

async function upsertAttendanceScenario(
  prisma: PrismaService,
  tenantId: string,
  employeeId: string,
  baseDate: Date,
  scenario: MemberScenario,
) {
  if (!('attendance' in scenario)) {
    return null
  }

  const attendanceScenario: MemberAttendanceScenario = scenario
  const attendanceDate = offsetDate(baseDate, -scenario.daysAgo)
  const attendance = await prisma.attendance.upsert({
    where: {
      tenantId_employeeId_date: {
        tenantId,
        employeeId,
        date: attendanceDate,
      },
    },
    update: {
      clockIn:
        attendanceScenario.attendance.clockInHour === undefined
          ? null
          : atUtc(
              attendanceDate,
              attendanceScenario.attendance.clockInHour,
              attendanceScenario.attendance.clockInMinute ?? 0,
            ),
      clockOut:
        attendanceScenario.attendance.clockOutHour === undefined
          ? null
          : atUtc(
              attendanceDate,
              attendanceScenario.attendance.clockOutHour,
              attendanceScenario.attendance.clockOutMinute ?? 0,
            ),
      status: attendanceScenario.attendance.status,
      isOvernight: false,
    },
    create: {
      tenantId,
      employeeId,
      date: attendanceDate,
      clockIn:
        attendanceScenario.attendance.clockInHour === undefined
          ? null
          : atUtc(
              attendanceDate,
              attendanceScenario.attendance.clockInHour,
              attendanceScenario.attendance.clockInMinute ?? 0,
            ),
      clockOut:
        attendanceScenario.attendance.clockOutHour === undefined
          ? null
          : atUtc(
              attendanceDate,
              attendanceScenario.attendance.clockOutHour,
              attendanceScenario.attendance.clockOutMinute ?? 0,
            ),
      status: attendanceScenario.attendance.status,
      isOvernight: false,
    },
  })

  const breakWindow = attendanceScenario.attendance.breakWindow
  if (!breakWindow) {
    return attendance
  }

  const breakStart = atUtc(
    attendanceDate,
    breakWindow.startHour,
    breakWindow.startMinute ?? 0,
  )
  const existingBreak = await prisma.breakRecord.findFirst({
    where: {
      attendanceId: attendance.id,
      startTime: breakStart,
    },
  })

  const breakEnd =
    breakWindow.endHour === undefined
      ? null
      : atUtc(attendanceDate, breakWindow.endHour, breakWindow.endMinute ?? 0)

  if (existingBreak) {
    await prisma.breakRecord.update({
      where: { id: existingBreak.id },
      data: { endTime: breakEnd },
    })
  } else {
    await prisma.breakRecord.create({
      data: {
        attendanceId: attendance.id,
        startTime: breakStart,
        endTime: breakEnd,
      },
    })
  }

  return attendance
}

async function upsertClockCorrectionScenario(
  prisma: PrismaService,
  tenantId: string,
  employeeId: string,
  attendanceId: string,
  attendanceClockIn: Date | null,
  attendanceClockOut: Date | null,
  date: Date,
  scenario: MemberScenario,
) {
  if (!('clockCorrection' in scenario) || !scenario.clockCorrection) {
    return
  }

  const existingCorrection = await prisma.clockCorrection.findFirst({
    where: {
      tenantId,
      attendanceId,
      requestedBy: employeeId,
    },
  })

  const payload = {
    originalClockIn: attendanceClockIn,
    originalClockOut: attendanceClockOut,
    correctedClockIn: atUtc(
      date,
      scenario.clockCorrection.correctedClockInHour,
      scenario.clockCorrection.correctedClockInMinute ?? 0,
    ),
    correctedClockOut: atUtc(
      date,
      scenario.clockCorrection.correctedClockOutHour,
      scenario.clockCorrection.correctedClockOutMinute ?? 0,
    ),
    reason: scenario.clockCorrection.reason,
    status: scenario.clockCorrection.status,
    reviewedBy: null,
    reviewedAt: null,
  }

  if (existingCorrection) {
    await prisma.clockCorrection.update({
      where: { id: existingCorrection.id },
      data: payload,
    })
    return
  }

  await prisma.clockCorrection.create({
    data: {
      tenantId,
      attendanceId,
      requestedBy: employeeId,
      ...payload,
    },
  })
}

async function upsertLeaveRequestScenario(
  prisma: PrismaService,
  tenantId: string,
  employeeId: string,
  reviewerUserId: string,
  baseDate: Date,
  scenario: MemberScenario,
) {
  if (!('leaveRequest' in scenario) || !scenario.leaveRequest) {
    return
  }

  const startDate = offsetDate(baseDate, scenario.leaveRequest.startOffsetDays)
  const endDate = offsetDate(baseDate, scenario.leaveRequest.endOffsetDays)
  const existingLeaveRequest = await prisma.leaveRequest.findFirst({
    where: {
      tenantId,
      employeeId,
      startDate,
      endDate,
    },
  })

  const isReviewed = scenario.leaveRequest.status !== 'pending'
  const payload = {
    leaveType: scenario.leaveRequest.leaveType,
    reason: scenario.leaveRequest.reason,
    status: scenario.leaveRequest.status,
    reviewedBy: isReviewed ? reviewerUserId : null,
    reviewedAt: isReviewed ? new Date() : null,
  }

  if (existingLeaveRequest) {
    await prisma.leaveRequest.update({
      where: { id: existingLeaveRequest.id },
      data: payload,
    })
    return
  }

  await prisma.leaveRequest.create({
    data: {
      tenantId,
      employeeId,
      startDate,
      endDate,
      ...payload,
    },
  })
}

async function seedMemberScenarios(
  prisma: PrismaService,
  tenantId: string,
  createdUsers: Map<string, string>,
  createdEmployees: Map<string, string>,
) {
  const today = asDateOnly(new Date())
  const managerUserId = createdUsers.get('manager@example.com')

  if (!managerUserId) {
    throw new Error('Manager user is required for review seeds.')
  }

  for (const scenario of memberScenarios) {
    const employeeId = createdEmployees.get(scenario.email)

    if (!employeeId) {
      throw new Error(`Missing employee for ${scenario.email}.`)
    }

    const attendance = await upsertAttendanceScenario(
      prisma,
      tenantId,
      employeeId,
      today,
      scenario,
    )

    if (attendance && 'clockCorrection' in scenario && scenario.clockCorrection) {
      const attendanceDate = offsetDate(today, -scenario.daysAgo)
      await upsertClockCorrectionScenario(
        prisma,
        tenantId,
        employeeId,
        attendance.id,
        attendance.clockIn,
        attendance.clockOut,
        attendanceDate,
        scenario,
      )
    }

    await upsertLeaveRequestScenario(
      prisma,
      tenantId,
      employeeId,
      managerUserId,
      today,
      scenario,
    )
  }

  await prisma.closingRecord.upsert({
    where: {
      tenantId_yearMonth: {
        tenantId,
        yearMonth: `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}`,
      },
    },
    update: {
      closedBy: managerUserId,
      closedAt: atUtc(today, 12, 0),
      status: 'reopened',
    },
    create: {
      tenantId,
      yearMonth: `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}`,
      closedBy: managerUserId,
      closedAt: atUtc(today, 12, 0),
      status: 'reopened',
    },
  })
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  })

  const firebase = app.get(FirebaseService)
  const prisma = app.get(PrismaService)

  try {
    firebase.assertDevelopmentSeedAllowed('app')

    const tenant =
      (await prisma.tenant.findFirst({
        where: { name: tenantSeed.name },
      })) ??
      (await prisma.tenant.create({
        data: { name: tenantSeed.name, status: 'active' },
      }))

    const { createdUsers, createdEmployees } = await seedUsersAndEmployees(
      prisma,
      firebase,
      tenant.id,
    )

    await seedMemberScenarios(prisma, tenant.id, createdUsers, createdEmployees)

    console.log(`Seeded app data for tenant: ${tenant.name} (${tenant.id})`)
    for (const seedUser of appSeedUsers) {
      console.log(`${seedUser.email} -> user + employee ready`)
    }
  } finally {
    await app.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
