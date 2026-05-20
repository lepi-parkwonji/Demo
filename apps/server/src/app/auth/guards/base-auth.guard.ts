import { CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { AUTH_ERROR_CODE } from '../auth.constants';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

// 토큰 추출 → 검증 → request 첨부의 공통 흐름을 정의한다.
// 도메인별 가드(AdminAuthGuard, CustomerAuthGuard)는 requestKey만 선언해 확장한다.
// 새 도메인 가드 추가 시 이 클래스를 상속하고 logger와 requestKey만 선언하면 된다.
export abstract class BaseAuthGuard implements CanActivate {
  protected abstract readonly logger: Logger;
  // request에 페이로드를 첨부할 키 — express.d.ts에 타입이 선언되어 있다.
  protected abstract readonly requestKey: 'admin' | 'customer';

  constructor(protected readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.authService.extractAccessTokenFromHeader(request);
    if (!token) {
      this.logger.debug('Access Token을 찾을 수 없습니다.');
      throw new HttpException(
        {
          code: AUTH_ERROR_CODE.TOKEN_MISSING,
          message: '토큰이 없습니다.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    // 검증 실패 시 verifyToken 내부에서 TOKEN_EXPIRED / TOKEN_INVALID 예외를 던진다.
    // union key 할당 시 TypeScript가 intersection을 요구하므로 Record 캐스팅으로 우회한다.
    const payload = this.authService.verifyToken<JwtPayload>(token);
    (request as unknown as Record<string, unknown>)[this.requestKey] = payload;
    return true;
  }
}
