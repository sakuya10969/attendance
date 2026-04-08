import { ApiProperty } from '@nestjs/swagger';

export class BreakRecordResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  attendanceId!: string;

  @ApiProperty({ format: 'date-time' })
  startTime!: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  endTime!: string | null;
}

export class AttendanceEmployeeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  employeeNumber!: string;
}

export class AttendanceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  employeeId!: string;

  @ApiProperty({ format: 'date-time' })
  date!: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  clockIn!: string | null;

  @ApiProperty({ format: 'date-time', nullable: true })
  clockOut!: string | null;

  @ApiProperty({ enum: ['working', 'completed', 'holiday', 'absent'] })
  status!: string;

  @ApiProperty()
  isOvernight!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ type: () => [BreakRecordResponseDto] })
  breakRecords!: BreakRecordResponseDto[];
}

export class AttendanceListItemResponseDto extends AttendanceResponseDto {
  @ApiProperty({ type: () => AttendanceEmployeeResponseDto })
  employee!: AttendanceEmployeeResponseDto;
}

export class AttendanceListResponseDto {
  @ApiProperty({ type: () => [AttendanceListItemResponseDto] })
  data!: AttendanceListItemResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

export class AttendanceSummaryResponseDto {
  @ApiProperty()
  year!: number;

  @ApiProperty()
  month!: number;

  @ApiProperty()
  totalWorkMinutes!: number;

  @ApiProperty()
  totalBreakMinutes!: number;

  @ApiProperty()
  totalOvertimeMinutes!: number;

  @ApiProperty()
  totalNightMinutes!: number;

  @ApiProperty()
  presentDays!: number;

  @ApiProperty()
  absentDays!: number;

  @ApiProperty()
  holidayDays!: number;
}
