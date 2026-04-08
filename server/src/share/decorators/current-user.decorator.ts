import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { CurrentUser } from '../types/current-user.type'

export const GetCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as CurrentUser
  },
)
