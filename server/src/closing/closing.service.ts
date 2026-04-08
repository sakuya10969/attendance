import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { AuditLogsService } from '../audit-logs/audit-logs.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClosingDto } from './dto/create-closing.dto'

@Injectable()
export class ClosingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async close(dto: CreateClosingDto, tenantId: string, actorId: string) {
    const existing = await this.prisma.closingRecord.findUnique({
      where: { tenantId_yearMonth: { tenantId, yearMonth: dto.yearMonth } },
    })

    if (existing && existing.status === 'closed') {
      throw new BadRequestException(`${dto.yearMonth} is already closed`)
    }

    const record = await this.prisma.closingRecord.upsert({
      where: { tenantId_yearMonth: { tenantId, yearMonth: dto.yearMonth } },
      create: {
        tenantId,
        yearMonth: dto.yearMonth,
        closedBy: actorId,
        closedAt: new Date(),
        status: 'closed',
      },
      update: {
        closedBy: actorId,
        closedAt: new Date(),
        status: 'closed',
      },
    })

    await this.auditLogs.record({
      tenantId,
      actorId,
      action: 'closing.close',
      targetType: 'closing_record',
      targetId: record.id,
      detail: { yearMonth: dto.yearMonth },
    })

    return record
  }

  async reopen(id: string, tenantId: string, actorId: string) {
    const record = await this.prisma.closingRecord.findFirst({
      where: { id, tenantId },
    })

    if (!record) throw new NotFoundException('Closing record not found')
    if (record.status === 'reopened') {
      throw new BadRequestException('Already reopened')
    }

    const updated = await this.prisma.closingRecord.update({
      where: { id },
      data: { status: 'reopened' },
    })

    await this.auditLogs.record({
      tenantId,
      actorId,
      action: 'closing.reopen',
      targetType: 'closing_record',
      targetId: id,
      detail: { yearMonth: record.yearMonth },
    })

    return updated
  }

  async findAll(tenantId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.closingRecord.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { yearMonth: 'desc' },
        include: {
          closer: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.closingRecord.count({ where: { tenantId } }),
    ])

    return { data, total, page, limit }
  }
}
