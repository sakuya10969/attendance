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
import { CurrentTenantId } from '../share/decorators/current-tenant-id.decorator';
import { Roles } from '../share/decorators/roles.decorator';
import { AuthGuard } from '../share/guards/auth.guard';
import { RolesGuard } from '../share/guards/roles.guard';
import { TenantGuard } from '../share/guards/tenant.guard';
import type { CurrentUser } from '../share/types/current-user.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserListResponseDto,
  UserResponseDto,
  UserSummaryResponseDto,
} from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard, TenantGuard)
@Roles('tenant_admin')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'ユーザー作成' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(
    @Body() dto: CreateUserDto,
    @CurrentTenantId() tenantId: string,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.usersService.create(dto, tenantId, currentUser.userId);
  }

  @Get()
  @ApiOperation({ summary: 'テナント内ユーザー一覧' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: UserListResponseDto })
  findAll(
    @CurrentTenantId() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll(tenantId, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ユーザー詳細' })
  @ApiOkResponse({ type: UserSummaryResponseDto })
  findOne(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.usersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ユーザー更新（氏名変更）' })
  @ApiOkResponse({ type: UserResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.usersService.update(id, dto, tenantId);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'ロール変更' })
  @ApiOkResponse({ type: UserResponseDto })
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentTenantId() tenantId: string,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.usersService.updateRole(id, dto, tenantId, currentUser.userId);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'ユーザー無効化' })
  @ApiOkResponse({ type: UserResponseDto })
  deactivate(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.usersService.deactivate(id, tenantId, currentUser.userId);
  }
}
