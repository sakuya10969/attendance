import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from '../share/decorators/current-user.decorator'
import { Roles } from '../share/decorators/roles.decorator'
import { AuthGuard } from '../share/guards/auth.guard'
import { RolesGuard } from '../share/guards/roles.guard'
import type { CurrentUser } from '../share/types/current-user.type'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { UpdateTenantDto } from './dto/update-tenant.dto'
import { TenantsService } from './tenants.service'

@ApiTags('tenants')
@UseGuards(AuthGuard, RolesGuard)
@Roles('system_admin')
@Controller('api/v1/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'テナント作成（初期管理者設定含む）' })
  create(@Body() dto: CreateTenantDto, @GetCurrentUser() currentUser: CurrentUser) {
    return this.tenantsService.create(dto, currentUser.userId)
  }

  @Get()
  @ApiOperation({ summary: 'テナント一覧' })
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.tenantsService.findAll({ status, page, limit })
  }

  @Get(':id')
  @ApiOperation({ summary: 'テナント詳細' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'テナント更新' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto)
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'テナント停止' })
  suspend(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.tenantsService.suspend(id, currentUser.userId)
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'テナント再開' })
  resume(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.tenantsService.resume(id, currentUser.userId)
  }
}
