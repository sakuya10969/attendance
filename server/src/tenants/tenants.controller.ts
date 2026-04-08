import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { Roles } from '../share/decorators/roles.decorator';
import { AuthGuard } from '../share/guards/auth.guard';
import { RolesGuard } from '../share/guards/roles.guard';
import type { CurrentUser } from '../share/types/current-user.type';
import { CreateTenantResponseDto } from './dto/create-tenant-response.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import {
  TenantListResponseDto,
  TenantResponseDto,
  TenantWithCountResponseDto,
} from './dto/tenant-response.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsService } from './tenants.service';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('system_admin')
@Controller('api/v1/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'テナント作成（初期管理者設定含む）' })
  @ApiCreatedResponse({ type: CreateTenantResponseDto })
  create(
    @Body() dto: CreateTenantDto,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.tenantsService.create(dto, currentUser.userId);
  }

  @Get()
  @ApiOperation({ summary: 'テナント一覧' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: TenantListResponseDto })
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.tenantsService.findAll({ status, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'テナント詳細' })
  @ApiOkResponse({ type: TenantWithCountResponseDto })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'テナント更新' })
  @ApiOkResponse({ type: TenantResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'テナント停止' })
  @ApiOkResponse({ type: TenantResponseDto })
  suspend(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.tenantsService.suspend(id, currentUser.userId);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'テナント再開' })
  @ApiOkResponse({ type: TenantResponseDto })
  resume(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.tenantsService.resume(id, currentUser.userId);
  }
}
