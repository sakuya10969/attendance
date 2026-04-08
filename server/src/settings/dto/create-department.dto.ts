import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: '開発部' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
