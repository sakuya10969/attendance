import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { TenantResponseDto } from './tenant-response.dto';

export class CreateTenantResponseDto {
  @ApiProperty({ type: () => TenantResponseDto })
  tenant!: TenantResponseDto;

  @ApiProperty({ type: () => UserResponseDto })
  adminUser!: UserResponseDto;
}
