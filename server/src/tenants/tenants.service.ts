import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateTenantDto, actorId: string) {
    const tenant = await this.prisma.tenant.create({
      data: { name: dto.name },
    });

    const firebaseUser = await this.firebase.createOrGetUser(
      dto.adminEmail,
      dto.adminName,
    );

    const existingUser = await this.prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
    });

    let adminUser;
    if (existingUser) {
      adminUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: { tenantId: tenant.id, role: 'tenant_admin' },
      });
    } else {
      adminUser = await this.prisma.user.create({
        data: {
          firebaseUid: firebaseUser.uid,
          email: dto.adminEmail,
          name: dto.adminName,
          role: 'tenant_admin',
          tenantId: tenant.id,
        },
      });
    }

    await this.auditLogs.record({
      actorId,
      action: 'tenant.create',
      targetType: 'tenant',
      targetId: tenant.id,
      detail: { tenantName: tenant.name, adminEmail: dto.adminEmail },
    });

    await this.auditLogs.record({
      tenantId: tenant.id,
      actorId,
      action: 'user.create',
      targetType: 'user',
      targetId: adminUser.id,
      detail: { email: dto.adminEmail, role: 'tenant_admin' },
    });

    return { tenant, adminUser };
  }

  async findAll(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { users: true } } },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async suspend(id: string, actorId: string) {
    const tenant = await this.findOne(id);
    if (tenant.status === 'suspended')
      throw new BadRequestException('Tenant is already suspended');

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { status: 'suspended' },
    });

    await this.auditLogs.record({
      actorId,
      action: 'tenant.suspend',
      targetType: 'tenant',
      targetId: id,
      detail: { previousStatus: 'active' },
    });

    return updated;
  }

  async resume(id: string, actorId: string) {
    const tenant = await this.findOne(id);
    if (tenant.status === 'active')
      throw new BadRequestException('Tenant is already active');

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { status: 'active' },
    });

    await this.auditLogs.record({
      actorId,
      action: 'tenant.resume',
      targetType: 'tenant',
      targetId: id,
      detail: { previousStatus: 'suspended' },
    });

    return updated;
  }
}
