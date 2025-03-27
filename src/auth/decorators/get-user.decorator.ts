import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: { user: User } = ctx.switchToHttp().getRequest();

    const user = request.user;

    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    return data && data in user ? user[data as keyof User] : user;
  },
);
