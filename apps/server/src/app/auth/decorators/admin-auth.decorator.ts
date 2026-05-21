import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

// 관리자 인증이 필요한 엔드포인트에 단일 데코레이터로 적용한다.
export function AdminAuth() {
  return applyDecorators(
    UseGuards(AdminAuthGuard),
    ApiBearerAuth(),
  );
}
