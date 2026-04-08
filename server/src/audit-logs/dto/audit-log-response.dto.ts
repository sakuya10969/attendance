import { ApiProperty } from '@nestjs/swagger'

export class AuditLogActorResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  email!: string
}

export class AuditLogResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ nullable: true })
  tenantId!: string | null

  @ApiProperty()
  actorId!: string

  @ApiProperty()
  action!: string

  @ApiProperty()
  targetType!: string

  @ApiProperty({ nullable: true })
  targetId!: string | null

  @ApiProperty({ nullable: true, additionalProperties: true })
  detail!: Record<string, unknown> | null

  @ApiProperty({ format: 'date-time' })
  createdAt!: string

  @ApiProperty({ type: () => AuditLogActorResponseDto })
  actor!: AuditLogActorResponseDto
}

export class AuditLogListResponseDto {
  @ApiProperty({ type: () => [AuditLogResponseDto] })
  data!: AuditLogResponseDto[]

  @ApiProperty()
  total!: number

  @ApiProperty()
  page!: number

  @ApiProperty()
  limit!: number
}
