import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from '../share/decorators/current-user.decorator'
import { Roles } from '../share/decorators/roles.decorator'
import { AuthGuard } from '../share/guards/auth.guard'
import { RolesGuard } from '../share/guards/roles.guard'
import type { CurrentUser } from '../share/types/current-user.type'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { CreateWorkPatternDto } from './dto/create-work-pattern.dto'
import { SettingsService } from './settings.service'

@ApiTags('settings')
@UseGuards(AuthGuard, RolesGuard)
@Roles('tenant_admin')
@Controller('api/v1/admin')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // --- 部署 ---

  @Post('departments')
  @ApiOperation({ summary: '部署作成' })
  createDepartment(@Body() dto: CreateDepartmentDto, @GetCurrentUser() currentUser: CurrentUser) {
    return this.settingsService.createDepartment(dto, currentUser.tenantId!)
  }

  @Get('departments')
  @ApiOperation({ summary: '部署一覧' })
  findDepartments(@GetCurrentUser() currentUser: CurrentUser) {
    return this.settingsService.findDepartments(currentUser.tenantId!)
  }

  @Patch('departments/:id')
  @ApiOperation({ summary: '部署更新' })
  updateDepartment(
    @Param('id') id: string,
    @Body() dto: CreateDepartmentDto,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.settingsService.updateDepartment(id, dto, currentUser.tenantId!)
  }

  // --- 勤務形態 ---

  @Post('work-patterns')
  @ApiOperation({ summary: '勤務形態作成' })
  createWorkPattern(
    @Body() dto: CreateWorkPatternDto,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.settingsService.createWorkPattern(dto, currentUser.tenantId!)
  }

  @Get('work-patterns')
  @ApiOperation({ summary: '勤務形態一覧' })
  findWorkPatterns(@GetCurrentUser() currentUser: CurrentUser) {
    return this.settingsService.findWorkPatterns(currentUser.tenantId!)
  }

  @Patch('work-patterns/:id')
  @ApiOperation({ summary: '勤務形態更新' })
  updateWorkPattern(
    @Param('id') id: string,
    @Body() dto: CreateWorkPatternDto,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.settingsService.updateWorkPattern(id, dto, currentUser.tenantId!)
  }
}
