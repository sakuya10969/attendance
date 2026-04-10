import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { FirebaseService } from '../src/firebase/firebase.service'
import { PrismaService } from '../src/prisma/prisma.service'

const DAY_MS = 24 * 60 * 60 * 1000

const seedUsers = [
  {
    email: 'dev-admin@example.com',
    name: 'Dev Admin',
    role: 'tenant_admin',
    employeeNumber: 'A-001',
    departmentName: 'Operations',
  },
  {
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'tenant_admin',
    employeeNumber: 'A-002',
    departmentName: 'Operations',
  },
  {
    email: 'member1@example.com',
    name: 'Member One',
    role: 'tenant_user',
    employeeNumber: 'A-003',
    departmentName: 'Storefront',
  },
] as const

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
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  })

  const firebase = app.get(FirebaseService)
  const prisma = app.get(PrismaService)

  try {
    firebase.assertDevelopmentSeedAllowed('app')

    const firebaseUsers = await Promise.all(
      seedUsers.map(async (seedUser) => {
        const authUser = await firebase.getUserByEmail(seedUser.email)
        return [seedUser.email, authUser.uid] as const
      }),
    )
    const uidByEmail = new Map(firebaseUsers)

    const tenantName = 'Development Tenant'
    const tenant =
      (await prisma.tenant.findFirst({
        where: { name: tenantName },
      })) ??
      (await prisma.tenant.create({
        data: { name: tenantName, status: 'active' },
      }))

    const operationsDepartment = await findOrCreateDepartment(
      prisma,
      tenant.id,
      'Operations',
    )
    const storefrontDepartment = await findOrCreateDepartment(
      prisma,
      tenant.id,
      'Storefront',
    )

    const standardWorkPattern =
      (await prisma.workPattern.findFirst({
        where: { tenantId: tenant.id, name: 'Standard Day' },
      })) ??
      (await prisma.workPattern.create({
        data: {
          tenantId: tenant.id,
          name: 'Standard Day',
          startTime: '09:00',
          endTime: '18:00',
          breakMinutes: 60,
        },
      }))

    const departmentIdByName = new Map<string, string>([
      [operationsDepartment.name, operationsDepartment.id],
      [storefrontDepartment.name, storefrontDepartment.id],
    ])

    const createdUsers = new Map<string, string>()
    const createdEmployees = new Map<string, string>()

    for (const seedUser of seedUsers) {
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
          tenantId: tenant.id,
          isActive: true,
        },
        create: {
          firebaseUid,
          email: seedUser.email,
          name: seedUser.name,
          role: seedUser.role,
          tenantId: tenant.id,
          isActive: true,
        },
      })
      createdUsers.set(seedUser.email, user.id)

      const employee = await prisma.employee.upsert({
        where: {
          tenantId_employeeNumber: {
            tenantId: tenant.id,
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
          tenantId: tenant.id,
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

    const now = new Date()
    const today = asDateOnly(now)
    const twoDaysAgo = asDateOnly(new Date(today.getTime() - DAY_MS * 2))
    const threeDaysAgo = asDateOnly(new Date(today.getTime() - DAY_MS * 3))
    const fourDaysAgo = asDateOnly(new Date(today.getTime() - DAY_MS * 4))
    const fiveDaysAgo = asDateOnly(new Date(today.getTime() - DAY_MS * 5))
    const nextWeek = asDateOnly(new Date(today.getTime() + DAY_MS * 7))
    const nextWeekPlusOne = asDateOnly(new Date(today.getTime() + DAY_MS * 8))

    const memberEmployeeId = createdEmployees.get('member1@example.com')
    const managerUserId = createdUsers.get('manager@example.com')

    if (!memberEmployeeId || !managerUserId) {
      throw new Error('Seed user linkage is incomplete.')
    }

    const completedAttendance = await prisma.attendance.upsert({
      where: {
        tenantId_employeeId_date: {
          tenantId: tenant.id,
          employeeId: memberEmployeeId,
          date: twoDaysAgo,
        },
      },
      update: {
        clockIn: atUtc(twoDaysAgo, 0, 0),
        clockOut: atUtc(twoDaysAgo, 9, 30),
        status: 'completed',
        isOvernight: false,
      },
      create: {
        tenantId: tenant.id,
        employeeId: memberEmployeeId,
        date: twoDaysAgo,
        clockIn: atUtc(twoDaysAgo, 0, 0),
        clockOut: atUtc(twoDaysAgo, 9, 30),
        status: 'completed',
        isOvernight: false,
      },
    })

    const existingBreak = await prisma.breakRecord.findFirst({
      where: {
        attendanceId: completedAttendance.id,
        startTime: atUtc(twoDaysAgo, 4, 0),
      },
    })

    if (existingBreak) {
      await prisma.breakRecord.update({
        where: { id: existingBreak.id },
        data: { endTime: atUtc(twoDaysAgo, 5, 0) },
      })
    } else {
      await prisma.breakRecord.create({
        data: {
          attendanceId: completedAttendance.id,
          startTime: atUtc(twoDaysAgo, 4, 0),
          endTime: atUtc(twoDaysAgo, 5, 0),
        },
      })
    }

    await prisma.attendance.upsert({
      where: {
        tenantId_employeeId_date: {
          tenantId: tenant.id,
          employeeId: memberEmployeeId,
          date: threeDaysAgo,
        },
      },
      update: {
        clockIn: atUtc(threeDaysAgo, 0, 15),
        clockOut: atUtc(threeDaysAgo, 8, 45),
        status: 'completed',
        isOvernight: false,
      },
      create: {
        tenantId: tenant.id,
        employeeId: memberEmployeeId,
        date: threeDaysAgo,
        clockIn: atUtc(threeDaysAgo, 0, 15),
        clockOut: atUtc(threeDaysAgo, 8, 45),
        status: 'completed',
        isOvernight: false,
      },
    })

    const correctionAttendance = await prisma.attendance.upsert({
      where: {
        tenantId_employeeId_date: {
          tenantId: tenant.id,
          employeeId: memberEmployeeId,
          date: fourDaysAgo,
        },
      },
      update: {
        clockIn: atUtc(fourDaysAgo, 0, 30),
        clockOut: atUtc(fourDaysAgo, 8, 0),
        status: 'completed',
        isOvernight: false,
      },
      create: {
        tenantId: tenant.id,
        employeeId: memberEmployeeId,
        date: fourDaysAgo,
        clockIn: atUtc(fourDaysAgo, 0, 30),
        clockOut: atUtc(fourDaysAgo, 8, 0),
        status: 'completed',
        isOvernight: false,
      },
    })

    const holidayAttendance = await prisma.attendance.upsert({
      where: {
        tenantId_employeeId_date: {
          tenantId: tenant.id,
          employeeId: memberEmployeeId,
          date: fiveDaysAgo,
        },
      },
      update: {
        clockIn: null,
        clockOut: null,
        status: 'holiday',
        isOvernight: false,
      },
      create: {
        tenantId: tenant.id,
        employeeId: memberEmployeeId,
        date: fiveDaysAgo,
        clockIn: null,
        clockOut: null,
        status: 'holiday',
        isOvernight: false,
      },
    })

    const existingCorrection = await prisma.clockCorrection.findFirst({
      where: {
        tenantId: tenant.id,
        attendanceId: correctionAttendance.id,
        requestedBy: memberEmployeeId,
      },
    })

    if (existingCorrection) {
      await prisma.clockCorrection.update({
        where: { id: existingCorrection.id },
        data: {
          originalClockIn: correctionAttendance.clockIn,
          originalClockOut: correctionAttendance.clockOut,
          correctedClockIn: atUtc(fourDaysAgo, 0, 0),
          correctedClockOut: atUtc(fourDaysAgo, 8, 30),
          reason: 'Seeded correction request for admin review.',
          status: 'pending',
          reviewedBy: null,
          reviewedAt: null,
        },
      })
    } else {
      await prisma.clockCorrection.create({
        data: {
          tenantId: tenant.id,
          attendanceId: correctionAttendance.id,
          requestedBy: memberEmployeeId,
          originalClockIn: correctionAttendance.clockIn,
          originalClockOut: correctionAttendance.clockOut,
          correctedClockIn: atUtc(fourDaysAgo, 0, 0),
          correctedClockOut: atUtc(fourDaysAgo, 8, 30),
          reason: 'Seeded correction request for admin review.',
          status: 'pending',
        },
      })
    }

    const existingLeaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        tenantId: tenant.id,
        employeeId: memberEmployeeId,
        startDate: nextWeek,
        endDate: nextWeekPlusOne,
      },
    })

    if (existingLeaveRequest) {
      await prisma.leaveRequest.update({
        where: { id: existingLeaveRequest.id },
        data: {
          leaveType: 'paid',
          reason: 'Seeded paid leave request.',
          status: 'pending',
          reviewedBy: null,
          reviewedAt: null,
        },
      })
    } else {
      await prisma.leaveRequest.create({
        data: {
          tenantId: tenant.id,
          employeeId: memberEmployeeId,
          leaveType: 'paid',
          startDate: nextWeek,
          endDate: nextWeekPlusOne,
          reason: 'Seeded paid leave request.',
          status: 'pending',
        },
      })
    }

    await prisma.closingRecord.upsert({
      where: {
        tenantId_yearMonth: {
          tenantId: tenant.id,
          yearMonth: `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}`,
        },
      },
      update: {
        closedBy: managerUserId,
        closedAt: atUtc(holidayAttendance.date, 12, 0),
        status: 'reopened',
      },
      create: {
        tenantId: tenant.id,
        yearMonth: `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}`,
        closedBy: managerUserId,
        closedAt: atUtc(holidayAttendance.date, 12, 0),
        status: 'reopened',
      },
    })

    console.log(`Seeded app data for tenant: ${tenant.name} (${tenant.id})`)
    for (const seedUser of seedUsers) {
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
