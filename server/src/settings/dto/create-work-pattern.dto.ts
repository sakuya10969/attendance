import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateWorkPatternDto {
  @ApiProperty({ example: '通常勤務' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '09:00:00', description: '所定開始時刻（HH:MM:SS）' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '18:00:00', description: '所定終了時刻（HH:MM:SS）' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({ example: 60, description: '所定休憩時間（分）' })
  @IsOptional()
  @IsInt()
  @Min(0)
  breakMinutes?: number;
}
