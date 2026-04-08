import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { AuditLogsService } from '../audit-logs/audit-logs.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClockCorrectionDto } from './dto/create-clock-correction.dto'

@Injectable()
export class ClockCorrectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  private async getEmployeeByUserId(userId: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { userId, tenantId } })
    if (!employee) throw new NotFoundException('Employee not found')
    return employee
  }

  private async checkNotClosed(attendanceId: string, tenantId: string) {
    const attendance = await this.prisma.attendance.findFirst({
      where: { id: attendanceId, tenantId },
    })
    if (!attendance) throw new NotFoundException('Attendance record not found')

    // 締め処理チェック: 対象月の yearMonth が closed かどうか
    const yearMonth = `${attendance.date.getFullYear()}-${String(attendance.date.getMonth() + 1).padStart(2, '0')}`
    const closed = await this.prisma.closingRecord.findUnique({
      where: { tenantId_yearMonth: { tenantId, yearMonth } },
    })

    if (closed && closed.status === 'closed') {
      throw new BadRequestException('Cannot modify attendance for a closed period')
    }

    return attendance
  }

  async create(dto: CreateClockCorrectionDto, userId: string, tenantId: string) {
    const employee = await this.getEmployeeByUserId(userId, tenantId)
    const attendance = await this.checkNotClosed(dto.attendanceId, tenantId)

    return this.prisma.clockCorrection.create({
      data: {
        tenantId,
        attendanceId: attendance.id,
        requestedBy: employee.id,
        originalClockIn: attendance.clockIn,
        originalClockOut: attendance.clockOut,
        correctedClockIn: dto.correctedClockIn ? new Date(dto.correctedClockIn) : null,
        correctedClockOut: dto.correctedClockOut ? new Date(dto.correctedClockOut) : null,
        reason: dto.reason,
        status: 'pending',
      },
    })
  }

  async findMine(userId: string, tenantId: string, params: { page?: number; limit?: number }) {
    const employee = await this.getEmployeeByUserId(userId, tenantId)
    const { page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.clockCorrection.findMany({
        where: { requestedBy: employee.id, tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { attendance: true },
      }),
      this.prisma.clockCorrection.count({ where: { requestedBy: employee.id, tenantId } }),
    ])

    return { data, total, page, limit }
  }

  async findAllAdmin(tenantId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.clockCorrection.findMany({
        where: { tenantId, status: 'pending' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          attendance: true,
          employee: { select: { id: true, name: true, employeeNumber: true } },
        },
      }),
      this.prisma.clockCorrection.count({ where: { tenantId, status: 'pending' } }),
    ])

    return { data, total, page, limit }
  }

  async approve(id: string, tenantId: string, actorId: string) {
    const correction = await this.prisma.clockCorrection.findFirst({
      where: { id, tenantId, status: 'pending' },
    })
    if (!correction) throw new NotFoundException('Pending correction request not found')

    await this.prisma.$transaction([
      this.prisma.clockCorrection.update({
        where: { id },
        data: { status: 'approved', reviewedBy: actorId, reviewedAt: new Date() },
      }),
      this.prisma.attendance.update({
        where: { id: correction.attendanceId },
        data: {
          clockIn: correction.correctedClockIn ?? undefined,
          clockOut: correction.correctedClockOut ?? undefined,
        },
      }),
    ])

    await this.auditLogs.record({
      tenantId,
      actorId,
      action: 'clock_correction.approve',
      targetType: 'clock_correction',
      targetId: id,
      detail: {
        correctedClockIn: correction.correctedClockIn,
        correctedClockOut: correction.correctedClockOut,
      },
    })

    return { message: 'Approved' }
  }

  async reject(id: string, tenantId: string, actorId: string) {
    const correction = await this.prisma.clockCorrection.findFirst({
      where: { id, tenantId, status: 'pending' },
    })
    if (!correction) throw new NotFoundException('Pending correction request not found')

    await this.prisma.clockCorrection.update({
      where: { id },
      data: { status: 'rejected', reviewedBy: actorId, reviewedAt: new Date() },
    })

    await this.auditLogs.record({
      tenantId,
      actorId,
      action: 'clock_correction.reject',
      targetType: 'clock_correction',
      targetId: id,
    })

    return { message: 'Rejected' }
  }
}
