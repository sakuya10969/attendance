import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private async getEmployeeByUserId(userId: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, tenantId },
    });
    if (!employee)
      throw new NotFoundException('Employee record not found for this user');
    return employee;
  }

  private getTodayDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  async clockIn(userId: string, tenantId: string) {
    const employee = await this.getEmployeeByUserId(userId, tenantId);
    const today = this.getTodayDate();

    const existing = await this.prisma.attendance.findUnique({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already clocked in today');
    }

    return this.prisma.attendance.create({
      data: {
        tenantId,
        employeeId: employee.id,
        date: today,
        clockIn: new Date(),
        status: 'working',
      },
      include: { breakRecords: true },
    });
  }

  async clockOut(userId: string, tenantId: string) {
    const employee = await this.getEmployeeByUserId(userId, tenantId);
    const today = this.getTodayDate();

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (!attendance || !attendance.clockIn) {
      throw new BadRequestException('Not clocked in yet');
    }

    if (attendance.clockOut) {
      throw new BadRequestException('Already clocked out');
    }

    const clockOut = new Date();
    const isOvernight =
      clockOut.toDateString() !== new Date(attendance.clockIn).toDateString();

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: { clockOut, isOvernight, status: 'completed' },
      include: { breakRecords: true },
    });
  }

  async breakStart(userId: string, tenantId: string) {
    const employee = await this.getEmployeeByUserId(userId, tenantId);
    const today = this.getTodayDate();

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId: employee.id,
          date: today,
        },
      },
      include: { breakRecords: true },
    });

    if (!attendance || attendance.status !== 'working') {
      throw new BadRequestException('Not in working status');
    }

    const ongoingBreak = attendance.breakRecords.find((b) => !b.endTime);
    if (ongoingBreak) {
      throw new BadRequestException('Break already in progress');
    }

    return this.prisma.breakRecord.create({
      data: {
        attendanceId: attendance.id,
        startTime: new Date(),
      },
    });
  }

  async breakEnd(userId: string, tenantId: string) {
    const employee = await this.getEmployeeByUserId(userId, tenantId);
    const today = this.getTodayDate();

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId: employee.id,
          date: today,
        },
      },
      include: { breakRecords: true },
    });

    if (!attendance) {
      throw new BadRequestException('No attendance record for today');
    }

    const ongoingBreak = attendance.breakRecords.find((b) => !b.endTime);
    if (!ongoingBreak) {
      throw new BadRequestException('No ongoing break');
    }

    return this.prisma.breakRecord.update({
      where: { id: ongoingBreak.id },
      data: { endTime: new Date() },
    });
  }

  async getToday(userId: string, tenantId: string) {
    const employee = await this.getEmployeeByUserId(userId, tenantId);
    const today = this.getTodayDate();

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId: employee.id,
          date: today,
        },
      },
      include: { breakRecords: true },
    });

    return attendance;
  }

  async findAll(
    tenantId: string,
    params: {
      employeeId?: string;
      year?: number;
      month?: number;
      page?: number;
      limit?: number;
    },
  ) {
    const { employeeId, year, month, page = 1, limit = 31 } = params;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (year && month) {
      const from = new Date(year, month - 1, 1);
      const to = new Date(year, month, 0);
      where.date = { gte: from, lte: to };
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          breakRecords: true,
          employee: { select: { id: true, name: true, employeeNumber: true } },
        },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getSummary(
    tenantId: string,
    params: { employeeId?: string; year: number; month: number },
  ) {
    const { employeeId, year, month } = params;
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);

    const where: any = { tenantId, date: { gte: from, lte: to } };
    if (employeeId) where.employeeId = employeeId;

    const records = await this.prisma.attendance.findMany({
      where,
      include: { breakRecords: true },
    });

    let totalWorkMinutes = 0;
    let totalBreakMinutes = 0;
    const totalOvertimeMinutes = 0;
    let totalNightMinutes = 0;
    let presentDays = 0;
    let absentDays = 0;
    let holidayDays = 0;

    for (const record of records) {
      if (record.status === 'holiday') {
        holidayDays++;
        continue;
      }
      if (record.status === 'absent') {
        absentDays++;
        continue;
      }
      if (!record.clockIn || !record.clockOut) continue;

      presentDays++;

      const workMs = record.clockOut.getTime() - record.clockIn.getTime();
      const breakMs = record.breakRecords
        .filter((b) => b.endTime)
        .reduce(
          (sum, b) => sum + (b.endTime!.getTime() - b.startTime.getTime()),
          0,
        );

      const netWorkMs = workMs - breakMs;
      totalWorkMinutes += Math.floor(netWorkMs / 60000);
      totalBreakMinutes += Math.floor(breakMs / 60000);

      // 深夜時間（22:00–5:00 JST = 13:00–20:00 UTC）
      const nightMs = this.calcNightMinutes(record.clockIn, record.clockOut);
      totalNightMinutes += nightMs;
    }

    return {
      year,
      month,
      totalWorkMinutes,
      totalBreakMinutes,
      totalOvertimeMinutes,
      totalNightMinutes,
      presentDays,
      absentDays,
      holidayDays,
    };
  }

  private calcNightMinutes(clockIn: Date, clockOut: Date): number {
    // 深夜帯: JST 22:00-05:00 = UTC 13:00-20:00
    const NIGHT_START_UTC = 13;
    const NIGHT_END_UTC = 20;

    let minutes = 0;
    const current = new Date(clockIn);

    while (current < clockOut) {
      const hour = current.getUTCHours();
      if (hour >= NIGHT_START_UTC || hour < NIGHT_END_UTC - 24) {
        minutes++;
      }
      current.setMinutes(current.getMinutes() + 1);
    }

    return minutes;
  }
}
