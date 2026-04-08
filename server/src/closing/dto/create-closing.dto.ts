import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class CreateClosingDto {
  @ApiProperty({ example: '2026-04', description: '対象年月（YYYY-MM）' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'yearMonth must be in YYYY-MM format' })
  yearMonth: string
}
