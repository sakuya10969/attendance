import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from '../share/decorators/current-user.decorator'
import { Roles } from '../share/decorators/roles.decorator'
import { AuthGuard } from '../share/guards/auth.guard'
import { RolesGuard } from '../share/guards/roles.guard'
import type { CurrentUser } from '../share/types/current-user.type'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'

@ApiTags('users')
@UseGuards(AuthGuard, RolesGuard)
@Roles('tenant_admin')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'ユーザー作成' })
  create(@Body() dto: CreateUserDto, @GetCurrentUser() currentUser: CurrentUser) {
    return this.usersService.create(dto, currentUser.tenantId!, currentUser.userId)
  }

  @Get()
  @ApiOperation({ summary: 'テナント内ユーザー一覧' })
  findAll(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll(currentUser.tenantId!, { page, limit })
  }

  @Get(':id')
  @ApiOperation({ summary: 'ユーザー詳細' })
  findOne(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.usersService.findOne(id, currentUser.tenantId!)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ユーザー更新（氏名変更）' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.usersService.update(id, dto, currentUser.tenantId!)
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'ロール変更' })
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.usersService.updateRole(id, dto, currentUser.tenantId!, currentUser.userId)
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'ユーザー無効化' })
  deactivate(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.usersService.deactivate(id, currentUser.tenantId!, currentUser.userId)
  }
}
