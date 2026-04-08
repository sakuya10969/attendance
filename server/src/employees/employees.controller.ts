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
import { CreateEmployeeDto } from './dto/create-employee.dto';
import {
  EmployeeListResponseDto,
  EmployeeResponseDto,
} from './dto/employee-response.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('tenant_admin')
@Controller('api/v1/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: '従業員作成' })
  @ApiCreatedResponse({ type: EmployeeResponseDto })
  create(
    @Body() dto: CreateEmployeeDto,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.employeesService.create(dto, currentUser.tenantId!);
  }

  @Get()
  @ApiOperation({ summary: '従業員一覧' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: EmployeeListResponseDto })
  findAll(
    @GetCurrentUser() currentUser: CurrentUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.employeesService.findAll(currentUser.tenantId!, {
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '従業員詳細' })
  @ApiOkResponse({ type: EmployeeResponseDto })
  findOne(@Param('id') id: string, @GetCurrentUser() currentUser: CurrentUser) {
    return this.employeesService.findOne(id, currentUser.tenantId!);
  }

  @Patch(':id')
  @ApiOperation({ summary: '従業員更新' })
  @ApiOkResponse({ type: EmployeeResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.employeesService.update(id, dto, currentUser.tenantId!);
  }
}
