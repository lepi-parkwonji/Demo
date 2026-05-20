import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

/** 관리자 인증·프로필 기능을 제공하는 모듈. AuthModule을 주입받아 JWT 검증을 위임한다. */
@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AdminAuthGuard],
})
export class AdminModule {}
