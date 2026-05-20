import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { BaseAuthGuard } from './base-auth.guard';

// 고객 전용 가드. 검증된 페이로드를 request['customer']에 첨부한다.
// OAuth(카카오 등) 로그인 후 발급한 자체 JWT를 검증하며,
// OAuth 제공자 토큰을 검증하는 것이 아님에 주의한다.
@Injectable()
export class CustomerAuthGuard extends BaseAuthGuard {
  protected readonly logger = new Logger(CustomerAuthGuard.name);
  protected readonly requestKey = 'customer' as const;

  constructor(authService: AuthService) {
    super(authService);
  }
}
