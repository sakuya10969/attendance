import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClockCorrectionDto {
  @ApiProperty({ description: '対象勤怠レコードID' })
  @IsString()
  @IsNotEmpty()
  attendanceId: string;

  @ApiPropertyOptional({ description: '修正後出勤時刻（ISO8601）' })
  @IsOptional()
  @IsISO8601()
  correctedClockIn?: string;

  @ApiPropertyOptional({ description: '修正後退勤時刻（ISO8601）' })
  @IsOptional()
  @IsISO8601()
  correctedClockOut?: string;

  @ApiProperty({ description: '修正理由' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
