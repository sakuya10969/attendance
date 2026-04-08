import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from '../share/decorators/current-user.decorator'
import { Roles } from '../share/decorators/roles.decorator'
import { AuthGuard } from '../share/guards/auth.guard'
import { RolesGuard } from '../share/guards/roles.guard'
import type { CurrentUser } from '../share/types/current-user.type'
import { AuditLogsService } from './audit-logs.service'

@ApiTags('audit-logs')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/v1')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get('system/audit-logs')
  @Roles('system_admin')
  @ApiOperation({ summary: '全体監査ログ一覧（system_admin）' })
  findAllSystem(
    @Query('action') action?: string,
    @Query('actor_id') actorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditLogsService.findAll({ action, actorId, from, to, page, limit })
  }

  @Get('admin/audit-logs')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'テナント内監査ログ一覧（tenant_admin）' })
  findAllTenant(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('action') action?: string,
    @Query('actor_id') actorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditLogsService.findAll({
      tenantId: currentUser.tenantId!,
      action,
      actorId,
      from,
      to,
      page,
      limit,
    })
  }
}
