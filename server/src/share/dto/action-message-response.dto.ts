import { ApiProperty } from '@nestjs/swagger'

export class ActionMessageResponseDto {
  @ApiProperty({ example: 'Approved' })
  message!: string
}
