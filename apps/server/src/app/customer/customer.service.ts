import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { Prisma } from '@generated/prisma';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TokensDTO } from '../../libs/dtos/tokens.dto';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, TOKEN_TYPE } from '../auth/auth.constants';
import {
  KAKAO_AUTH_URL,
  KAKAO_DEFAULT_NICKNAME,
  KAKAO_PROVIDER,
  KAKAO_TOKEN_URL,
  KAKAO_USER_URL,
} from './kakao.constants';

// 카카오 사용하는 필드만 선언
interface KakaoProfile {
  id: number;
  properties?: { nickname?: string; profile_image?: string };
  kakao_account?: { email?: string };
}

export interface CustomerProfile {
  id: string;
  nickname: string;
  email?: string;
  profileImage?: string;
}

@Injectable()
export class CustomerService {
  // 환경 변수는 인스턴스 생성 시 한 번만 읽는다
  private readonly clientId: string;
  private readonly clientSecret: string | undefined;

  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {
    this.clientId = process.env.KAKAO_CLIENT_ID ?? '';
    this.clientSecret = process.env.KAKAO_CLIENT_SECRET;
    if (!this.clientId) throw new Error('KAKAO_CLIENT_ID is not configured.');
  }

  getKakaoLoginUrl(redirectUri: string): { url: string } {
    const url =
      `${KAKAO_AUTH_URL}?client_id=${this.clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&prompt=login`;
    return { url };
  }

  async kakaoLogin(code: string, redirectUri: string): Promise<TokensDTO> {
    try {
      const kakaoToken = await this.fetchKakaoToken(code, redirectUri);
      const profile = await this.fetchKakaoProfile(kakaoToken);

      const kakaoId = String(profile.id);
      const nickname = profile.properties?.nickname ?? KAKAO_DEFAULT_NICKNAME;
      const email = profile.kakao_account?.email;
      const profileImage = profile.properties?.profile_image;

      // upsert + refreshToken 저장을 트랜잭션으로 묶어 원자성 보장
      const { accessToken, refreshToken } = await this.prisma.$transaction(async tx => {
        // 최초 로그인: 생성 / 재로그인: 카카오 관리 필드만 갱신 (nickname은 사용자 설정값이므로 보존)
        const customer = await tx.customer.upsert({
          where: { oauthId: kakaoId },
          create: { provider: KAKAO_PROVIDER, oauthId: kakaoId, nickname, email, profileImage },
          update: { email, profileImage },
        });

        // access/refresh 모두 customer.id(UUID)를 sub로 통일
        const access = this.authService.createToken(
          { sub: customer.id, type: TOKEN_TYPE.CUSTOMER },
          ACCESS_TOKEN_EXPIRES_IN,
        );
        const refresh = this.authService.createToken(
          { sub: customer.id, type: TOKEN_TYPE.CUSTOMER },
          REFRESH_TOKEN_EXPIRES_IN,
        );

        await tx.customer.update({
          where: { id: customer.id },
          data: { refreshToken: refresh },
        });

        return { accessToken: access, refreshToken: refresh };
      });

      return { accessToken, refreshToken };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { error_description?: string; msg?: string } | undefined;
        throw new UnauthorizedException(
          data?.error_description ?? data?.msg ?? '카카오 로그인에 실패했습니다.',
        );
      }
      throw error;
    }
  }

  async updateMe(customerId: string, nickname: string): Promise<void> {
    try {
      await this.prisma.customer.update({
        where: { id: customerId },
        data: { nickname },
      });
    } catch (error: unknown) {
      this.handleNotFound(error);
    }
  }

  async logout(customerId: string): Promise<void> {
    try {
      await this.prisma.customer.update({
        where: { id: customerId },
        data: { refreshToken: null },
      });
    } catch (error: unknown) {
      this.handleNotFound(error);
    }
  }

  async getMe(customerId: string): Promise<CustomerProfile> {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return {
      id: customer.id,
      nickname: customer.nickname,
      email: customer.email ?? undefined,
      profileImage: customer.profileImage ?? undefined,
    };
  }

  private async fetchKakaoToken(code: string, redirectUri: string): Promise<string> {
    const res = await axios.post(
      KAKAO_TOKEN_URL,
      {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        code,
      },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    return res.data.access_token as string;
  }

  private async fetchKakaoProfile(kakaoToken: string): Promise<KakaoProfile> {
    const res = await axios.get<KakaoProfile>(KAKAO_USER_URL, {
      headers: { Authorization: `Bearer ${kakaoToken}` },
    });
    return res.data;
  }

  // Prisma P2025(레코드 없음)를 NestJS NotFoundException으로 변환
  private handleNotFound(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    throw error;
  }
}
