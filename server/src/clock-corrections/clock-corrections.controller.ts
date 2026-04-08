import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from '../share/decorators/current-user.decorator'
import { Roles } from '../share/decorators/roles.decorator'
import { AuthGuard } from '../share/guards/auth.guard'
import { RolesGuard } from '../share/guards/roles.guard'
import type { CurrentUser } from '../share/types/current-user.type'
import { ClockCorrectionsService } from './clock-corrections.service'
import { CreateClockCorrectionDto } from './dto/create-clock-correction.dto'

@ApiTags('clock-corrections')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/v1')
export class ClockCorrectionsController {
  constructor(private readonly clockCorrectionsService: ClockCorrectionsService) {}

  @Post('clock-corrections')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '打刻修正申請作成' })
  create(@Body() dto: CreateClockCorrectionDto, @GetCurrentUser() currentUser: CurrentUser) {
    return this.clockCorrectionsService.create(dto, currentUser.userId, currentUser.tenantId!)
  }

  @Get('clock-corrections')
  @Roles('tenant_user', 'tenant_admin')
  @ApiOperation({ summary: '自身の修正申請一覧' })
  findMine(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.clockCorrectionsService.findMine(currentUser.userId, currentUser.tenantId!, {
      page,
      limit,
    })
  }

  @Get('admin/clock-corrections')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'テナント内申請一覧（tenant_admin）' })
  findAllAdmin(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.clockCorrectionsService.findAllAdmin(currentUser.tenantId!, { page, limit })
  }

  @Post('admin/clock-corrections/:id/approve')
  @Roles('tenant_admin')
  @ApiOperation({ summary: '承認' })
  approve(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.clockCorrectionsService.approve(id, currentUser.tenantId!, currentUser.userId)
  }

  @Post('admin/clock-corrections/:id/reject')
  @Roles('tenant_admin')
  @ApiOperation({ summary: '差し戻し' })
  reject(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.clockCorrectionsService.reject(id, currentUser.tenantId!, currentUser.userId)
  }
}
