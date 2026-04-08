import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto, tenantId: string) {
    const existing = await this.prisma.employee.findUnique({
      where: {
        tenantId_employeeNumber: {
          tenantId,
          employeeNumber: dto.employeeNumber,
        },
      },
    });
    if (existing)
      throw new ConflictException(
        'Employee number already exists in this tenant',
      );

    return this.prisma.employee.create({
      data: {
        tenantId,
        employeeNumber: dto.employeeNumber,
        name: dto.name,
        joinedAt: new Date(dto.joinedAt),
        userId: dto.userId ?? null,
        departmentId: dto.departmentId ?? null,
        workPatternId: dto.workPatternId ?? null,
      },
      include: {
        department: true,
        workPattern: true,
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });
  }

  async findAll(tenantId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          department: true,
          workPattern: true,
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      this.prisma.employee.count({ where: { tenantId } }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      include: {
        department: true,
        workPattern: true,
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.employee.update({
      where: { id },
      data: {
        name: dto.name,
        departmentId: dto.departmentId,
        workPatternId: dto.workPatternId,
        userId: dto.userId,
      },
      include: {
        department: true,
        workPattern: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }
}
