import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface RecordAuditLogParams {
  tenantId?: string | null
  actorId: string
  action: string
  targetType: string
  targetId?: string | null
  detail?: Record<string, any> | null
}

interface QueryAuditLogsParams {
  tenantId?: string
  action?: string
  actorId?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: RecordAuditLogParams) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: params.tenantId ?? null,
        actorId: params.actorId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        detail: (params.detail ?? undefined) as any,
      },
    })
  }

  async findAll(params: QueryAuditLogsParams) {
    const { tenantId, action, actorId, from, to, page = 1, limit = 50 } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (tenantId !== undefined) where.tenantId = tenantId
    if (action) where.action = { contains: action }
    if (actorId) where.actorId = actorId
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ])

    return { data, total, page, limit }
  }
}
