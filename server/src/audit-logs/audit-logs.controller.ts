import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentTenantId } from '../share/decorators/current-tenant-id.decorator';
import { Roles } from '../share/decorators/roles.decorator';
import { AuthGuard } from '../share/guards/auth.guard';
import { RolesGuard } from '../share/guards/roles.guard';
import { TenantGuard } from '../share/guards/tenant.guard';
import { AuditLogListResponseDto } from './dto/audit-log-response.dto';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/v1')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get('system/audit-logs')
  @Roles('system_admin')
  @ApiOperation({ summary: '全体監査ログ一覧（system_admin）' })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'actor_id', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: AuditLogListResponseDto })
  findAllSystem(
    @Query('action') action?: string,
    @Query('actor_id') actorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditLogsService.findAll({
      action,
      actorId,
      from,
      to,
      page,
      limit,
    });
  }

  @Get('admin/audit-logs')
  @Roles('tenant_admin')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'テナント内監査ログ一覧（tenant_admin）' })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'actor_id', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: AuditLogListResponseDto })
  findAllTenant(
    @CurrentTenantId() tenantId: string,
    @Query('action') action?: string,
    @Query('actor_id') actorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditLogsService.findAll({
      tenantId,
      action,
      actorId,
      from,
      to,
      page,
      limit,
    });
  }
}
