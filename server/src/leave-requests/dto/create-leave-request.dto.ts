import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateLeaveRequestDto {
  @ApiProperty({ enum: ['paid', 'unpaid', 'sick', 'other'] })
  @IsIn(['paid', 'unpaid', 'sick', 'other'])
  leaveType: string

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  startDate: string

  @ApiProperty({ example: '2026-05-03' })
  @IsDateString()
  endDate: string

  @ApiPropertyOptional({ example: '私用のため' })
  @IsOptional()
  @IsString()
  reason?: string
}
