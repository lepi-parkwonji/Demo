import { HttpException, HttpStatus } from '@nestjs/common';
import { AUTH_ERROR_CODE } from '../auth.constants';

// jwt expired 메시지로 구분되는 만료 케이스만 전담한다.
// TOKEN_INVALID와 분리한 이유: 클라이언트가 만료 시에만 자동 재발급을 시도해야 하기 때문이다.
export class TokenExpiredException extends HttpException {
  constructor() {
    super(
      {
        code: AUTH_ERROR_CODE.TOKEN_EXPIRED,
        message: '인증이 만료되었습니다.',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
