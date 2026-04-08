import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '山田花子（改）' })
  @IsOptional()
  @IsString()
  name?: string
}
