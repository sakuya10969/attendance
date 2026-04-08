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
import { ClockCorrectionsService } from './clock-corrections.service';
import {
  ClockCorrectionAdminListResponseDto,
  ClockCorrectionListResponseDto,
  ClockCorrectionResponseDto,
} from './dto/clock-correction-response.dto';
import { CreateClockCorrectionDto } from './dto/create-clock-correction.dto';

@ApiTags('clock-corrections')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard, TenantGuard)
@Controller('api/v1')
export class ClockCorrectionsController {
  constructor(
    private readonly clockCorrectionsService: ClockCorrectionsService,
  ) {}

  @Post('clock-corrections')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '打刻修正申請作成' })
  @ApiCreatedResponse({ type: ClockCorrectionResponseDto })
  create(
    @Body() dto: CreateClockCorrectionDto,
    @GetCurrentUser() currentUser: CurrentUser,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.clockCorrectionsService.create(
      dto,
      currentUser.userId,
      tenantId,
    );
  }

  @Get('clock-corrections')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '自身の修正申請一覧' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: ClockCorrectionListResponseDto })
  findMine(
    @GetCurrentUser() currentUser: CurrentUser,
    @CurrentTenantId() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.clockCorrectionsService.findMine(
      currentUser.userId,
      tenantId,
      { page, limit },
    );
  }

  @Get('admin/clock-corrections')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'テナント内申請一覧（tenant_admin）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: ClockCorrectionAdminListResponseDto })
  findAllAdmin(
    @CurrentTenantId() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.clockCorrectionsService.findAllAdmin(tenantId, {
      page,
      limit,
    });
  }

  @Post('admin/clock-corrections/:id/approve')
  @Roles('tenant_admin')
  @ApiOperation({ summary: '承認' })
  @ApiOkResponse({ type: ActionMessageResponseDto })
  approve(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.clockCorrectionsService.approve(
      id,
      tenantId,
      currentUser.userId,
    );
  }

  @Post('admin/clock-corrections/:id/reject')
  @Roles('tenant_admin')
  @ApiOperation({ summary: '差し戻し' })
  @ApiOkResponse({ type: ActionMessageResponseDto })
  reject(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.clockCorrectionsService.reject(
      id,
      tenantId,
      currentUser.userId,
    );
  }
}
