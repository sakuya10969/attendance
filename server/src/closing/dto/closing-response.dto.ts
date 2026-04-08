import { ApiProperty } from '@nestjs/swagger'

export class ClosingCloserResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  email!: string
}

export class ClosingRecordResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  yearMonth!: string

  @ApiProperty()
  closedBy!: string

  @ApiProperty({ format: 'date-time' })
  closedAt!: string

  @ApiProperty({ enum: ['closed', 'reopened'] })
  status!: string
}

export class ClosingRecordListItemResponseDto extends ClosingRecordResponseDto {
  @ApiProperty({ type: () => ClosingCloserResponseDto })
  closer!: ClosingCloserResponseDto
}

export class ClosingRecordListResponseDto {
  @ApiProperty({ type: () => [ClosingRecordListItemResponseDto] })
  data!: ClosingRecordListItemResponseDto[]

  @ApiProperty()
  total!: number

  @ApiProperty()
  page!: number

  @ApiProperty()
  limit!: number
}
