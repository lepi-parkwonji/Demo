// ACCESS_TOKEN_EXPIRES_IN은 auth.module.ts JwtModule 기본 만료 시간으로도 쓰인다.
// refreshToken은 accessToken보다 길게 설정해 무중단 재발급을 가능하게 한다.
export const ACCESS_TOKEN_EXPIRES_IN = '1h';
export const REFRESH_TOKEN_EXPIRES_IN = '7d';

// JWT payload에 포함되는 도메인 구분자
export const TOKEN_TYPE = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;

// HttpExceptionFilter, BaseAuthGuard, TokenExpiredException이 이 코드를 공유한다.
// 클라이언트는 code 값으로 분기해 자동 재발급 등 처리를 구현한다.
export const AUTH_ERROR_CODE = {
  TOKEN_MISSING: 'TOKEN_MISSING', // Authorization 헤더 없음
  TOKEN_EXPIRED: 'TOKEN_EXPIRED', // 서명은 유효하나 만료된 토큰
  TOKEN_INVALID: 'TOKEN_INVALID', // 서명 불일치 또는 위조된 토큰
} as const;
