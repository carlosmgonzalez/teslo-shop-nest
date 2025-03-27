import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: { rawHeaders: string[] } = ctx.switchToHttp().getRequest();

    const rawHeaders = request.rawHeaders;

    if (!rawHeaders)
      throw new InternalServerErrorException('Somethin went wrong row headers');

    return rawHeaders;
  },
);
