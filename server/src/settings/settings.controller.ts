import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentTenantId } from '../share/decorators/current-tenant-id.decorator';
import { Roles } from '../share/decorators/roles.decorator';
import { AuthGuard } from '../share/guards/auth.guard';
import { RolesGuard } from '../share/guards/roles.guard';
import { TenantGuard } from '../share/guards/tenant.guard';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateWorkPatternDto } from './dto/create-work-pattern.dto';
import {
  DepartmentResponseDto,
  WorkPatternResponseDto,
} from './dto/settings-response.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard, TenantGuard)
@Roles('tenant_admin')
@Controller('api/v1/admin')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // --- 部署 ---

  @Post('departments')
  @ApiOperation({ summary: '部署作成' })
  @ApiCreatedResponse({ type: DepartmentResponseDto })
  createDepartment(
    @Body() dto: CreateDepartmentDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.settingsService.createDepartment(dto, tenantId);
  }

  @Get('departments')
  @ApiOperation({ summary: '部署一覧' })
  @ApiOkResponse({ type: [DepartmentResponseDto] })
  findDepartments(@CurrentTenantId() tenantId: string) {
    return this.settingsService.findDepartments(tenantId);
  }

  @Patch('departments/:id')
  @ApiOperation({ summary: '部署更新' })
  @ApiOkResponse({ type: DepartmentResponseDto })
  updateDepartment(
    @Param('id') id: string,
    @Body() dto: CreateDepartmentDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.settingsService.updateDepartment(id, dto, tenantId);
  }

  // --- 勤務形態 ---

  @Post('work-patterns')
  @ApiOperation({ summary: '勤務形態作成' })
  @ApiCreatedResponse({ type: WorkPatternResponseDto })
  createWorkPattern(
    @Body() dto: CreateWorkPatternDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.settingsService.createWorkPattern(dto, tenantId);
  }

  @Get('work-patterns')
  @ApiOperation({ summary: '勤務形態一覧' })
  @ApiOkResponse({ type: [WorkPatternResponseDto] })
  findWorkPatterns(@CurrentTenantId() tenantId: string) {
    return this.settingsService.findWorkPatterns(tenantId);
  }

  @Patch('work-patterns/:id')
  @ApiOperation({ summary: '勤務形態更新' })
  @ApiOkResponse({ type: WorkPatternResponseDto })
  updateWorkPattern(
    @Param('id') id: string,
    @Body() dto: CreateWorkPatternDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.settingsService.updateWorkPattern(id, dto, tenantId);
  }
}
