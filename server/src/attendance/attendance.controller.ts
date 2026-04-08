import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUser } from '../share/decorators/current-user.decorator';
import { CurrentTenantId } from '../share/decorators/current-tenant-id.decorator';
import { Roles } from '../share/decorators/roles.decorator';
import { AuthGuard } from '../share/guards/auth.guard';
import { RolesGuard } from '../share/guards/roles.guard';
import { TenantGuard } from '../share/guards/tenant.guard';
import type { CurrentUser } from '../share/types/current-user.type';
import { AttendanceService } from './attendance.service';
import {
  AttendanceListResponseDto,
  AttendanceResponseDto,
  AttendanceSummaryResponseDto,
  BreakRecordResponseDto,
} from './dto/attendance-response.dto';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard, TenantGuard)
@Controller('api/v1')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // --- 打刻（tenant_user） ---

  @Post('attendance/clock-in')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '出勤打刻' })
  @ApiCreatedResponse({ type: AttendanceResponseDto })
  clockIn(
    @GetCurrentUser() currentUser: CurrentUser,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.attendanceService.clockIn(currentUser.userId, tenantId);
  }

  @Post('attendance/clock-out')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '退勤打刻' })
  @ApiOkResponse({ type: AttendanceResponseDto })
  clockOut(
    @GetCurrentUser() currentUser: CurrentUser,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.attendanceService.clockOut(currentUser.userId, tenantId);
  }

  @Post('attendance/break/start')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '休憩開始' })
  @ApiCreatedResponse({ type: BreakRecordResponseDto })
  breakStart(
    @GetCurrentUser() currentUser: CurrentUser,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.attendanceService.breakStart(currentUser.userId, tenantId);
  }

  @Post('attendance/break/end')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '休憩終了' })
  @ApiOkResponse({ type: BreakRecordResponseDto })
  breakEnd(
    @GetCurrentUser() currentUser: CurrentUser,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.attendanceService.breakEnd(currentUser.userId, tenantId);
  }

  @Get('attendance/today')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '本日の勤怠状態取得' })
  @ApiOkResponse({ type: AttendanceResponseDto })
  getToday(
    @GetCurrentUser() currentUser: CurrentUser,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.attendanceService.getToday(currentUser.userId, tenantId);
  }

  // --- 自身の勤怠一覧（tenant_user） ---

  @Get('attendance')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '自身の勤怠一覧（月指定）' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: AttendanceListResponseDto })
  findMine(
    @CurrentTenantId() tenantId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.attendanceService.findAll(tenantId, {
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      page,
      limit,
    });
  }

  @Get('attendance/summary')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '自身の月次集計' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiOkResponse({ type: AttendanceSummaryResponseDto })
  getMySummary(
    @CurrentTenantId() tenantId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.attendanceService.getSummary(tenantId, {
      year: Number(year),
      month: Number(month),
    });
  }

  // --- テナント内全従業員（tenant_admin） ---

  @Get('admin/attendance')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'テナント内全従業員の勤怠一覧（tenant_admin）' })
  @ApiQuery({ name: 'employee_id', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: AttendanceListResponseDto })
  findAllAdmin(
    @CurrentTenantId() tenantId: string,
    @Query('employee_id') employeeId?: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.attendanceService.findAll(tenantId, {
      employeeId,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      page,
      limit,
    });
  }

  @Get('admin/attendance/summary')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'テナント内月次集計（tenant_admin）' })
  @ApiQuery({ name: 'employee_id', required: false, type: String })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiOkResponse({ type: AttendanceSummaryResponseDto })
  getAdminSummary(
    @CurrentTenantId() tenantId: string,
    @Query('employee_id') employeeId?: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.attendanceService.getSummary(tenantId, {
      employeeId,
      year: Number(year),
      month: Number(month),
    });
  }
}
