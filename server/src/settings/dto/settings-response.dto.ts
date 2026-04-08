import { ApiProperty } from '@nestjs/swagger'

export class DepartmentResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  name!: string
}

export class WorkPatternResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  startTime!: string

  @ApiProperty()
  endTime!: string

  @ApiProperty()
  breakMinutes!: number
}
