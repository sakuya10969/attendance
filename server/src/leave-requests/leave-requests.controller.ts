import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { ActionMessageResponseDto } from '../share/dto/action-message-response.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import {
  LeaveRequestAdminListResponseDto,
  LeaveRequestListResponseDto,
  LeaveRequestResponseDto,
} from './dto/leave-request-response.dto';
import { LeaveRequestsService } from './leave-requests.service';

@ApiTags('leave-requests')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard, TenantGuard)
@Controller('api/v1')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Post('leave-requests')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '休暇申請作成' })
  @ApiCreatedResponse({ type: LeaveRequestResponseDto })
  create(
    @Body() dto: CreateLeaveRequestDto,
    @GetCurrentUser() currentUser: CurrentUser,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.leaveRequestsService.create(
      dto,
      currentUser.userId,
      tenantId,
    );
  }

  @Get('leave-requests')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '自身の休暇申請一覧' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: LeaveRequestListResponseDto })
  findMine(
    @GetCurrentUser() currentUser: CurrentUser,
    @CurrentTenantId() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaveRequestsService.findMine(currentUser.userId, tenantId, {
      page,
      limit,
    });
  }

  @Get('admin/leave-requests')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'テナント内申請一覧（tenant_admin）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: LeaveRequestAdminListResponseDto })
  findAllAdmin(
    @CurrentTenantId() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaveRequestsService.findAllAdmin(tenantId, { page, limit });
  }

  @Post('admin/leave-requests/:id/approve')
  @Roles('tenant_admin')
  @ApiOperation({ summary: '承認' })
  @ApiOkResponse({ type: ActionMessageResponseDto })
  approve(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.leaveRequestsService.approve(
      id,
      tenantId,
      currentUser.userId,
    );
  }

  @Post('admin/leave-requests/:id/reject')
  @Roles('tenant_admin')
  @ApiOperation({ summary: '差し戻し' })
  @ApiOkResponse({ type: ActionMessageResponseDto })
  reject(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.leaveRequestsService.reject(
      id,
      tenantId,
      currentUser.userId,
    );
  }
}
