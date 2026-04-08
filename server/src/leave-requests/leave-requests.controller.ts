import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from '../share/decorators/current-user.decorator'
import { Roles } from '../share/decorators/roles.decorator'
import { AuthGuard } from '../share/guards/auth.guard'
import { RolesGuard } from '../share/guards/roles.guard'
import type { CurrentUser } from '../share/types/current-user.type'
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto'
import { LeaveRequestsService } from './leave-requests.service'

@ApiTags('leave-requests')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/v1')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Post('leave-requests')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '休暇申請作成' })
  create(@Body() dto: CreateLeaveRequestDto, @GetCurrentUser() currentUser: CurrentUser) {
    return this.leaveRequestsService.create(dto, currentUser.userId, currentUser.tenantId!)
  }

  @Get('leave-requests')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '自身の休暇申請一覧' })
  findMine(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaveRequestsService.findMine(currentUser.userId, currentUser.tenantId!, {
      page,
      limit,
    })
  }

  @Get('admin/leave-requests')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'テナント内申請一覧（tenant_admin）' })
  findAllAdmin(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaveRequestsService.findAllAdmin(currentUser.tenantId!, { page, limit })
  }

  @Post('admin/leave-requests/:id/approve')
  @Roles('tenant_admin')
  @ApiOperation({ summary: '承認' })
  approve(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.leaveRequestsService.approve(id, currentUser.tenantId!, currentUser.userId)
  }

  @Post('admin/leave-requests/:id/reject')
  @Roles('tenant_admin')
  @ApiOperation({ summary: '差し戻し' })
  reject(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.leaveRequestsService.reject(id, currentUser.tenantId!, currentUser.userId)
  }
}
