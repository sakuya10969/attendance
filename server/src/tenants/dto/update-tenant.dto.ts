import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: '株式会社サンプル更新' })
  @IsOptional()
  @IsString()
  name?: string;
}
