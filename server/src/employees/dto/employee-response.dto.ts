import { ApiProperty } from '@nestjs/swagger'
import { DepartmentResponseDto, WorkPatternResponseDto } from '../../settings/dto/settings-response.dto'

export class EmployeeUserResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  email!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ enum: ['system_admin', 'tenant_admin', 'tenant_user'], required: false })
  role?: string
}

export class EmployeeResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty({ nullable: true })
  userId!: string | null

  @ApiProperty()
  employeeNumber!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ nullable: true })
  departmentId!: string | null

  @ApiProperty({ nullable: true })
  workPatternId!: string | null

  @ApiProperty({ format: 'date-time' })
  joinedAt!: string

  @ApiProperty({ format: 'date-time' })
  createdAt!: string

  @ApiProperty({ type: () => DepartmentResponseDto, nullable: true })
  department!: DepartmentResponseDto | null

  @ApiProperty({ type: () => WorkPatternResponseDto, nullable: true })
  workPattern!: WorkPatternResponseDto | null

  @ApiProperty({ type: () => EmployeeUserResponseDto, nullable: true })
  user!: EmployeeUserResponseDto | null
}

export class EmployeeListResponseDto {
  @ApiProperty({ type: () => [EmployeeResponseDto] })
  data!: EmployeeResponseDto[]

  @ApiProperty()
  total!: number

  @ApiProperty()
  page!: number

  @ApiProperty()
  limit!: number
}
