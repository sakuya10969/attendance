import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user?.tenantId) {
      throw new ForbiddenException(
        'This endpoint requires a tenant-scoped user',
      );
    }

    return true;
  }
}
