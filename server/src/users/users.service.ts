import { Injectable, NotFoundException } from '@nestjs/common'
import { AuditLogsService } from '../audit-logs/audit-logs.service'
import { FirebaseService } from '../firebase/firebase.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateUserDto, tenantId: string, actorId: string) {
    const firebaseUser = await this.firebase.createOrGetUser(dto.email, dto.name)

    const existingUser = await this.prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
    })

    let user
    if (existingUser) {
      user = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: { tenantId, role: dto.role ?? 'tenant_user' },
      })
    } else {
      user = await this.prisma.user.create({
        data: {
          firebaseUid: firebaseUser.uid,
          email: dto.email,
          name: dto.name,
          role: dto.role ?? 'tenant_user',
          tenantId,
        },
      })
    }

    await this.auditLogs.record({
      tenantId,
      actorId,
      action: 'user.create',
      targetType: 'user',
      targetId: user.id,
      detail: { email: dto.email, role: user.role },
    })

    return user
  }

  async findAll(tenantId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where: { tenantId } }),
    ])

    return { data, total, page, limit }
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async update(id: string, dto: UpdateUserDto, tenantId: string) {
    await this.findOne(id, tenantId)
    return this.prisma.user.update({ where: { id }, data: dto })
  }

  async updateRole(id: string, dto: UpdateRoleDto, tenantId: string, actorId: string) {
    const user = await this.findOne(id, tenantId)

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
    })

    await this.auditLogs.record({
      tenantId,
      actorId,
      action: 'user.role_change',
      targetType: 'user',
      targetId: id,
      detail: { previousRole: user.role, newRole: dto.role },
    })

    return updated
  }

  async deactivate(id: string, tenantId: string, actorId: string) {
    await this.findOne(id, tenantId)

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    await this.auditLogs.record({
      tenantId,
      actorId,
      action: 'user.deactivate',
      targetType: 'user',
      targetId: id,
    })

    return updated
  }
}
