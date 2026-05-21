import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { compareSync } from 'bcryptjs';
import { Request } from 'express';
import { TokenExpiredException } from './exceptions/token-expired.exception';
import { AUTH_ERROR_CODE } from './auth.constants';

// JWT 발급·검증과 비밀번호 해시 비교를 담당하는 인증 공통 서비스.
// 도메인 서비스(AdminService, CustomerService)에서 주입받아 사용한다.
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // expiresIn을 호출부에서 지정해 accessToken / refreshToken 만료 시간을 분리한다.
  createToken<T extends object>(payload: T, expiresIn: string | number): string {
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn as SignOptions['expiresIn'],
    });
  }

  // 만료(TOKEN_EXPIRED)와 위조(TOKEN_INVALID)를 다른 예외로 던져
  // 클라이언트가 자동 재발급 여부를 판단할 수 있게 한다.
  verifyToken<T extends object>(token: string): T {
    try {
      return this.jwtService.verify<T>(token);
    } catch (error) {
      if (error instanceof Error && error.message === 'jwt expired')
        throw new TokenExpiredException();
      throw new HttpException(
        {
          code: AUTH_ERROR_CODE.TOKEN_INVALID,
          message: '유효하지 않은 토큰입니다.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // bcrypt는 단방향 해시라 평문과 저장된 해시를 직접 비교한다.
  // Admin 로컬 로그인 전용이며 OAuth 고객 인증에는 사용되지 않는다.
  compareHash(plain: string, hash: string): boolean {
    return compareSync(plain, hash);
  }

  // 'Bearer <token>' 형식만 허용하고 그 외는 null을 반환해 가드에서 TOKEN_MISSING으로 처리한다.
  extractAccessTokenFromHeader(request: Request): string | null {
    const authorization = request.headers['authorization'];
    if (!authorization || !authorization.startsWith('Bearer ')) return null;
    return authorization.split(' ')[1];
  }
}
