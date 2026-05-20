import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../../prisma/prisma.service';
import { TokensDTO } from '../../libs/dtos/tokens.dto';
import { AuthService } from '../auth/auth.service';
import { AdminDTO } from './dtos/admin.dto';
import { AdminSignInDTO } from './dtos/admin-sign-in.dto';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from '../auth/auth.constants';

/** 관리자 인증·프로필 비즈니스 로직. 토큰 발급·검증은 AuthService에 위임한다. */
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  // ─── 인증 ────────────────────────────────────────────────────────────────────

  /** 아이디·비밀번호 검증 후 액세스·리프레시 토큰 발급 */
  async signin(dto: AdminSignInDTO): Promise<TokensDTO> {
    const admin = await this.prisma.admin.findUnique({ where: { username: dto.username } });
    if (!admin || !this.authService.compareHash(dto.password, admin.password))
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');

    const accessToken = this.authService.createToken({ sub: admin.id }, ACCESS_TOKEN_EXPIRES_IN);
    const refreshToken = this.authService.createToken({ sub: admin.id }, REFRESH_TOKEN_EXPIRES_IN);

    await this.setRefreshToken(admin.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /** DB 저장 토큰과 대조해 로그아웃 후 재사용 차단 */
  async refresh(id: number, token: string): Promise<Pick<TokensDTO, 'accessToken'>> {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin || admin.refreshToken !== token) throw new UnauthorizedException();
    return { accessToken: this.authService.createToken({ sub: id }, ACCESS_TOKEN_EXPIRES_IN) };
  }

  /** 리프레시 토큰 무효화 */
  async logout(id: number): Promise<void> {
    await this.setRefreshToken(id, null);
  }

  // ─── 프로필 ───────────────────────────────────────────────────────────────────

  /** 토큰의 sub(id)로 관리자 정보 조회 */
  async getMe(id: number): Promise<AdminDTO> {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new UnauthorizedException();
    return plainToInstance(AdminDTO, admin);
  }

  // ─── 내부 ────────────────────────────────────────────────────────────────────

  /** 트랜잭션으로 존재 확인 후 리프레시 토큰 원자적 갱신 */
  private async setRefreshToken(id: number, refreshToken: string | null): Promise<void> {
    await this.prisma.$transaction(async tx => {
      const admin = await tx.admin.findUnique({ where: { id } });
      if (!admin) throw new NotFoundException('해당 관리자를 찾을 수 없습니다.');
      await tx.admin.update({ where: { id }, data: { refreshToken } });
    });
  }
}
