import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { AuditLogsService } from '../audit-logs/audit-logs.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto'

@Injectable()
export class LeaveRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  private async getEmployeeByUserId(userId: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { userId, tenantId } })
    if (!employee) throw new NotFoundException('Employee not found')
    return employee
  }

  async create(dto: CreateLeaveRequestDto, userId: string, tenantId: string) {
    const employee = await this.getEmployeeByUserId(userId, tenantId)

    const startDate = new Date(dto.startDate)
    const endDate = new Date(dto.endDate)

    if (startDate > endDate) {
      throw new BadRequestException('startDate must be before or equal to endDate')
    }

    return this.prisma.leaveRequest.create({
      data: {
        tenantId,
        employeeId: employee.id,
        leaveType: dto.leaveType,
        startDate,
        endDate,
        reason: dto.reason ?? null,
        status: 'pending',
      },
    })
  }

  async findMine(userId: string, tenantId: string, params: { page?: number; limit?: number }) {
    const employee = await this.getEmployeeByUserId(userId, tenantId)
    const { page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where: { employeeId: employee.id, tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leaveRequest.count({ where: { employeeId: employee.id, tenantId } }),
    ])

    return { data, total, page, limit }
  }

  async findAllAdmin(tenantId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where: { tenantId, status: 'pending' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { employee: { select: { id: true, name: true, employeeNumber: true } } },
      }),
      this.prisma.leaveRequest.count({ where: { tenantId, status: 'pending' } }),
    ])

    return { data, total, page, limit }
  }

  async approve(id: string, tenantId: string, actorId: string) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id, tenantId, status: 'pending' },
    })
    if (!request) throw new NotFoundException('Pending leave request not found')

    await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'approved', reviewedBy: actorId, reviewedAt: new Date() },
    })

    // 承認された日付範囲の勤怠レコードを holiday で作成
    const current = new Date(request.startDate)
    const end = new Date(request.endDate)
    while (current <= end) {
      const date = new Date(current)
      await this.prisma.attendance.upsert({
        where: {
          tenantId_employeeId_date: {
            tenantId,
            employeeId: request.employeeId,
            date,
          },
        },
        create: {
          tenantId,
          employeeId: request.employeeId,
          date,
          status: 'holiday',
        },
        update: { status: 'holiday' },
      })
      current.setDate(current.getDate() + 1)
    }

    await this.auditLogs.record({
      tenantId,
      actorId,
      action: 'leave_request.approve',
      targetType: 'leave_request',
      targetId: id,
      detail: { leaveType: request.leaveType, startDate: request.startDate, endDate: request.endDate },
    })

    return { message: 'Approved' }
  }

  async reject(id: string, tenantId: string, actorId: string) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id, tenantId, status: 'pending' },
    })
    if (!request) throw new NotFoundException('Pending leave request not found')

    await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'rejected', reviewedBy: actorId, reviewedAt: new Date() },
    })

    await this.auditLogs.record({
      tenantId,
      actorId,
      action: 'leave_request.reject',
      targetType: 'leave_request',
      targetId: id,
    })

    return { message: 'Rejected' }
  }
}
