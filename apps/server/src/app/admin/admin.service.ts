import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../../prisma/prisma.service';
import { TokensDTO } from '../../libs/dtos/tokens.dto';
import { AuthUtil } from '../auth/auth.util';
import { AdminDTO } from './dtos/admin.dto';
import { AdminSignInDTO } from './dtos/admin-sign-in.dto';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from '../auth/auth.constants';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private authUtil: AuthUtil) {}

  async signin(dto: AdminSignInDTO): Promise<TokensDTO> {
    const admin = await this.prisma.admin.findUnique({ where: { username: dto.username } });
    if (!admin || !this.authUtil.compareHash(dto.password, admin.password))
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');

    return {
      accessToken: this.authUtil.createToken({ sub: admin.id }, ACCESS_TOKEN_EXPIRES_IN),
      refreshToken: this.authUtil.createToken({ sub: admin.id }, REFRESH_TOKEN_EXPIRES_IN),
    };
  }

  async getMe(id: number): Promise<AdminDTO> {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new UnauthorizedException();
    return plainToInstance(AdminDTO, admin);
  }

  createAccessToken(id: number): Pick<TokensDTO, 'accessToken'> {
    return { accessToken: this.authUtil.createToken({ sub: id }, ACCESS_TOKEN_EXPIRES_IN) };
  }
}
