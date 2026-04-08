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
import { ClosingService } from './closing.service';
import { CreateClosingDto } from './dto/create-closing.dto';
import {
  ClosingRecordListResponseDto,
  ClosingRecordResponseDto,
} from './dto/closing-response.dto';

@ApiTags('closing')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard, TenantGuard)
@Roles('tenant_admin')
@Controller('api/v1/admin/closing')
export class ClosingController {
  constructor(private readonly closingService: ClosingService) {}

  @Post()
  @ApiOperation({ summary: '締め実行' })
  @ApiCreatedResponse({ type: ClosingRecordResponseDto })
  close(
    @Body() dto: CreateClosingDto,
    @CurrentTenantId() tenantId: string,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.closingService.close(dto, tenantId, currentUser.userId);
  }

  @Post(':id/reopen')
  @ApiOperation({ summary: '締め再開' })
  @ApiOkResponse({ type: ClosingRecordResponseDto })
  reopen(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @GetCurrentUser() currentUser: CurrentUser,
  ) {
    return this.closingService.reopen(id, tenantId, currentUser.userId);
  }

  @Get()
  @ApiOperation({ summary: '締め履歴一覧' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: ClosingRecordListResponseDto })
  findAll(
    @CurrentTenantId() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.closingService.findAll(tenantId, { page, limit });
  }
}
