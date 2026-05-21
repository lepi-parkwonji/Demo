import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { BaseAuthGuard } from './base-auth.guard';

// 관리자 전용 가드. 검증된 페이로드를 request['admin']에 첨부한다.
// @AdminAuth() 데코레이터로 감싸져 있어 컨트롤러에서 직접 참조하지 않는다.
@Injectable()
export class AdminAuthGuard extends BaseAuthGuard {
  protected readonly logger = new Logger(AdminAuthGuard.name);
  protected readonly requestKey = 'admin' as const;

  constructor(authService: AuthService) {
    super(authService);
  }
}
