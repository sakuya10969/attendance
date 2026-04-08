import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from '../share/decorators/current-user.decorator'
import { Roles } from '../share/decorators/roles.decorator'
import { AuthGuard } from '../share/guards/auth.guard'
import { RolesGuard } from '../share/guards/roles.guard'
import type { CurrentUser } from '../share/types/current-user.type'
import { AttendanceService } from './attendance.service'

@ApiTags('attendance')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/v1')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // --- 打刻（tenant_user） ---

  @Post('attendance/clock-in')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '出勤打刻' })
  clockIn(@GetCurrentUser() currentUser: CurrentUser) {
    return this.attendanceService.clockIn(currentUser.userId, currentUser.tenantId!)
  }

  @Post('attendance/clock-out')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '退勤打刻' })
  clockOut(@GetCurrentUser() currentUser: CurrentUser) {
    return this.attendanceService.clockOut(currentUser.userId, currentUser.tenantId!)
  }

  @Post('attendance/break/start')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '休憩開始' })
  breakStart(@GetCurrentUser() currentUser: CurrentUser) {
    return this.attendanceService.breakStart(currentUser.userId, currentUser.tenantId!)
  }

  @Post('attendance/break/end')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '休憩終了' })
  breakEnd(@GetCurrentUser() currentUser: CurrentUser) {
    return this.attendanceService.breakEnd(currentUser.userId, currentUser.tenantId!)
  }

  @Get('attendance/today')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '本日の勤怠状態取得' })
  getToday(@GetCurrentUser() currentUser: CurrentUser) {
    return this.attendanceService.getToday(currentUser.userId, currentUser.tenantId!)
  }

  // --- 自身の勤怠一覧（tenant_user） ---

  @Get('attendance')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '自身の勤怠一覧（月指定）' })
  findMine(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // employeeId は自分のものに限定 → findAll で自分の employee を検索
    return this.attendanceService.findAll(currentUser.tenantId!, {
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      page,
      limit,
    })
  }

  @Get('attendance/summary')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '自身の月次集計' })
  getMySummary(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.attendanceService.getSummary(currentUser.tenantId!, {
      year: Number(year),
      month: Number(month),
    })
  }

  // --- テナント内全従業員（tenant_admin） ---

  @Get('admin/attendance')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'テナント内全従業員の勤怠一覧（tenant_admin）' })
  findAllAdmin(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('employee_id') employeeId?: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.attendanceService.findAll(currentUser.tenantId!, {
      employeeId,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      page,
      limit,
    })
  }

  @Get('admin/attendance/summary')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'テナント内月次集計（tenant_admin）' })
  getAdminSummary(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('employee_id') employeeId?: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.attendanceService.getSummary(currentUser.tenantId!, {
      employeeId,
      year: Number(year),
      month: Number(month),
    })
  }
}
