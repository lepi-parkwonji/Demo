// JWT 서명 검증 후 디코딩되는 페이로드 구조.
// iat / exp: JWT 표준 클레임 (발급 시각 / 만료 시각, Unix timestamp)
// Admin sub는 Int PK(number), Customer sub는 UUID PK(string)으로 서로 다름.

export interface JwtPayload {
  sub: number | string;
  iat: number;
  exp: number;
}

// 관리자 토큰: sub = Admin.id (Int)
export interface AdminJwtPayload extends JwtPayload {
  sub: number;
}

// 고객 토큰: sub = Customer.id (UUID String)
export interface CustomerJwtPayload extends JwtPayload {
  sub: string;
}
