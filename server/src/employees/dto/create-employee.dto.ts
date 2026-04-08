import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  employeeNumber: string;

  @ApiProperty({ example: '山田太郎' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2024-04-01' })
  @IsDateString()
  joinedAt: string;

  @ApiPropertyOptional({ description: '紐付けるユーザーID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '部署ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: '勤務形態ID' })
  @IsOptional()
  @IsString()
  workPatternId?: string;
}
