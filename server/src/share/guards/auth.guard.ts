import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { FirebaseService } from '../../firebase/firebase.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader: string | undefined = request.headers['authorization']

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is missing or invalid')
    }

    const token = authHeader.slice(7)

    let decoded: { uid: string }
    try {
      decoded = await this.firebase.verifyIdToken(token)
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }

    const user = await this.prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { tenant: true },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is inactive')
    }

    if (user.tenant && user.tenant.status === 'suspended') {
      throw new ForbiddenException('Tenant is suspended')
    }

    request.user = {
      userId: user.id,
      tenantId: user.tenantId ?? null,
      role: user.role,
    }

    return true
  }
}
