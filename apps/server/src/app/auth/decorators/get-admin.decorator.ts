import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// AdminAuthGuard가 request['admin']에 첨부한 JwtPayload를 컨트롤러 파라미터로 주입한다.
// 타입은 express.d.ts에서 Request 인터페이스에 선언되어 있다.
export const GetAdmin = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request['admin'];
});
