import { ApiProperty } from '@nestjs/swagger';

export class TenantUserCountResponseDto {
  @ApiProperty()
  users!: number;
}

export class TenantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['active', 'suspended'] })
  status!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class TenantWithCountResponseDto extends TenantResponseDto {
  @ApiProperty({ type: () => TenantUserCountResponseDto })
  _count!: TenantUserCountResponseDto;
}

export class TenantListResponseDto {
  @ApiProperty({ type: () => [TenantWithCountResponseDto] })
  data!: TenantWithCountResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
