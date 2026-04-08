import { ApiProperty } from '@nestjs/swagger'
import { AttendanceEmployeeResponseDto } from '../../attendance/dto/attendance-response.dto'

export class LeaveRequestResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  employeeId!: string

  @ApiProperty({ enum: ['paid', 'unpaid', 'sick', 'other'] })
  leaveType!: string

  @ApiProperty({ format: 'date-time' })
  startDate!: string

  @ApiProperty({ format: 'date-time' })
  endDate!: string

  @ApiProperty({ nullable: true })
  reason!: string | null

  @ApiProperty({ enum: ['pending', 'approved', 'rejected'] })
  status!: string

  @ApiProperty({ nullable: true })
  reviewedBy!: string | null

  @ApiProperty({ format: 'date-time', nullable: true })
  reviewedAt!: string | null

  @ApiProperty({ format: 'date-time' })
  createdAt!: string
}

export class LeaveRequestAdminItemResponseDto extends LeaveRequestResponseDto {
  @ApiProperty({ type: () => AttendanceEmployeeResponseDto })
  employee!: AttendanceEmployeeResponseDto
}

export class LeaveRequestListResponseDto {
  @ApiProperty({ type: () => [LeaveRequestResponseDto] })
  data!: LeaveRequestResponseDto[]

  @ApiProperty()
  total!: number

  @ApiProperty()
  page!: number

  @ApiProperty()
  limit!: number
}

export class LeaveRequestAdminListResponseDto {
  @ApiProperty({ type: () => [LeaveRequestAdminItemResponseDto] })
  data!: LeaveRequestAdminItemResponseDto[]

  @ApiProperty()
  total!: number

  @ApiProperty()
  page!: number

  @ApiProperty()
  limit!: number
}
