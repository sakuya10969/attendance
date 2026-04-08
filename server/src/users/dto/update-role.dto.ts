import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

export class UpdateRoleDto {
  @ApiProperty({ enum: ['tenant_admin', 'tenant_user'] })
  @IsIn(['tenant_admin', 'tenant_user'])
  role: string
}
