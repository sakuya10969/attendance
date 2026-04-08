import { ApiProperty } from '@nestjs/swagger'
import { AttendanceEmployeeResponseDto, AttendanceResponseDto } from '../../attendance/dto/attendance-response.dto'

export class ClockCorrectionResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  attendanceId!: string

  @ApiProperty()
  requestedBy!: string

  @ApiProperty({ format: 'date-time', nullable: true })
  originalClockIn!: string | null

  @ApiProperty({ format: 'date-time', nullable: true })
  originalClockOut!: string | null

  @ApiProperty({ format: 'date-time', nullable: true })
  correctedClockIn!: string | null

  @ApiProperty({ format: 'date-time', nullable: true })
  correctedClockOut!: string | null

  @ApiProperty()
  reason!: string

  @ApiProperty({ enum: ['pending', 'approved', 'rejected'] })
  status!: string

  @ApiProperty({ nullable: true })
  reviewedBy!: string | null

  @ApiProperty({ format: 'date-time', nullable: true })
  reviewedAt!: string | null

  @ApiProperty({ format: 'date-time' })
  createdAt!: string
}

export class ClockCorrectionMineItemResponseDto extends ClockCorrectionResponseDto {
  @ApiProperty({ type: () => AttendanceResponseDto })
  attendance!: AttendanceResponseDto
}

export class ClockCorrectionAdminItemResponseDto extends ClockCorrectionResponseDto {
  @ApiProperty({ type: () => AttendanceResponseDto })
  attendance!: AttendanceResponseDto

  @ApiProperty({ type: () => AttendanceEmployeeResponseDto })
  employee!: AttendanceEmployeeResponseDto
}

export class ClockCorrectionListResponseDto {
  @ApiProperty({ type: () => [ClockCorrectionMineItemResponseDto] })
  data!: ClockCorrectionMineItemResponseDto[]

  @ApiProperty()
  total!: number

  @ApiProperty()
  page!: number

  @ApiProperty()
  limit!: number
}

export class ClockCorrectionAdminListResponseDto {
  @ApiProperty({ type: () => [ClockCorrectionAdminItemResponseDto] })
  data!: ClockCorrectionAdminItemResponseDto[]

  @ApiProperty()
  total!: number

  @ApiProperty()
  page!: number

  @ApiProperty()
  limit!: number
}
