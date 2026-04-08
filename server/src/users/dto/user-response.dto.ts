import { ApiProperty } from '@nestjs/swagger';

export class UserSummaryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['system_admin', 'tenant_admin', 'tenant_user'] })
  role!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class UserResponseDto extends UserSummaryResponseDto {
  @ApiProperty()
  firebaseUid!: string;

  @ApiProperty({ nullable: true })
  tenantId!: string | null;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class UserListResponseDto {
  @ApiProperty({ type: () => [UserSummaryResponseDto] })
  data!: UserSummaryResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
