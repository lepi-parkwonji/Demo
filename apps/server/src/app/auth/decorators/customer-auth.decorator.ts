import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CustomerAuthGuard } from '../guards/customer-auth.guard';

// 고객 인증이 필요한 엔드포인트에 단일 데코레이터로 적용한다.
export function CustomerAuth() {
  return applyDecorators(
    UseGuards(CustomerAuthGuard),
    ApiBearerAuth(),
  );
}
