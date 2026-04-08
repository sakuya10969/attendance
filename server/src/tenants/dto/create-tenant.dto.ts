import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateTenantDto {
  @ApiProperty({ example: '株式会社サンプル' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  adminEmail: string

  @ApiProperty({ example: '田中太郎' })
  @IsString()
  @IsNotEmpty()
  adminName: string
}
