import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ACCESS_TOKEN_EXPIRES_IN } from './auth.constants';

// JWT 인프라 모듈. AuthService와 JwtModule을 export해
// 이 모듈을 import하는 도메인 모듈(AdminModule, CustomerModule)에서 사용 가능하게 한다.
@Module({
  imports: [
    // registerAsync로 환경변수 로드 이후 JWT_SECRET을 주입한다.
    // expiresIn은 createToken 호출부에서 override 가능하므로 기본값 역할을 한다.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
