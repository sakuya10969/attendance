import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from '../share/decorators/current-user.decorator'
import { AuthGuard } from '../share/guards/auth.guard'
import type { CurrentUser } from '../share/types/current-user.type'
import { PrismaService } from '../prisma/prisma.service'

@ApiTags('auth')
@UseGuards(AuthGuard)
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  @ApiOperation({ summary: '現在のユーザー情報取得' })
  async me(@GetCurrentUser() currentUser: CurrentUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
      },
    })
    return user
  }
}
