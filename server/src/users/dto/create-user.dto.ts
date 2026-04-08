import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: '山田花子' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ enum: ['tenant_admin', 'tenant_user'], default: 'tenant_user' })
  @IsOptional()
  @IsIn(['tenant_admin', 'tenant_user'])
  role?: string = 'tenant_user'
}
