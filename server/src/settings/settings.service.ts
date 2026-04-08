import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { CreateWorkPatternDto } from './dto/create-work-pattern.dto'

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- 部署 ---

  async createDepartment(dto: CreateDepartmentDto, tenantId: string) {
    return this.prisma.department.create({ data: { tenantId, name: dto.name } })
  }

  async findDepartments(tenantId: string) {
    return this.prisma.department.findMany({ where: { tenantId }, orderBy: { name: 'asc' } })
  }

  async updateDepartment(id: string, dto: Partial<CreateDepartmentDto>, tenantId: string) {
    const dept = await this.prisma.department.findFirst({ where: { id, tenantId } })
    if (!dept) throw new NotFoundException('Department not found')
    return this.prisma.department.update({ where: { id }, data: { name: dto.name } })
  }

  // --- 勤務形態 ---

  async createWorkPattern(dto: CreateWorkPatternDto, tenantId: string) {
    return this.prisma.workPattern.create({
      data: {
        tenantId,
        name: dto.name,
        startTime: dto.startTime,
        endTime: dto.endTime,
        breakMinutes: dto.breakMinutes ?? 60,
      },
    })
  }

  async findWorkPatterns(tenantId: string) {
    return this.prisma.workPattern.findMany({ where: { tenantId }, orderBy: { name: 'asc' } })
  }

  async updateWorkPattern(
    id: string,
    dto: Partial<CreateWorkPatternDto>,
    tenantId: string,
  ) {
    const pattern = await this.prisma.workPattern.findFirst({ where: { id, tenantId } })
    if (!pattern) throw new NotFoundException('Work pattern not found')

    return this.prisma.workPattern.update({
      where: { id },
      data: {
        name: dto.name,
        startTime: dto.startTime,
        endTime: dto.endTime,
        breakMinutes: dto.breakMinutes,
      },
    })
  }
}
