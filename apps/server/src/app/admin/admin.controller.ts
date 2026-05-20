import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuth } from '../auth/decorators/admin-auth.decorator';
import { GetAdmin } from '../auth/decorators/get-admin.decorator';
import type { AdminJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { TokensDTO } from '../../libs/dtos/tokens.dto';
import { AdminDTO } from './dtos/admin.dto';
import { AdminSignInDTO } from './dtos/admin-sign-in.dto';
import { AdminService } from './admin.service';

/** 관리자 인증·프로필 엔드포인트. 로그인을 제외한 모든 라우트는 @AdminAuth() 가드로 보호한다. */
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── 인증 ────────────────────────────────────────────────────────────────────

  /** 인증 가드 없이 공개 접근 허용 */
  @ApiOperation({
    summary: '관리자 로그인',
    description: '아이디·비밀번호로 로그인하고 토큰을 발급합니다.',
  })
  @ApiOkResponse({ type: TokensDTO })
  @Post('signin')
  async signin(@Body() data: AdminSignInDTO): Promise<TokensDTO> {
    return this.adminService.signin(data);
  }

  /** Authorization 헤더에서 Bearer 토큰을 직접 추출해 서비스에 전달 */
  @ApiOperation({
    summary: '액세스 토큰 재발급',
    description: '리프레시 토큰으로 액세스 토큰을 재발급합니다.',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  @Post('refresh')
  @AdminAuth()
  async refresh(
    @GetAdmin() payload: AdminJwtPayload,
    @Headers('authorization') auth: string,
  ): Promise<Pick<TokensDTO, 'accessToken'>> {
    return this.adminService.refresh(payload.sub, auth.split(' ')[1]);
  }

  /** 로그아웃 후 고정 메시지 반환 */
  @ApiOperation({
    summary: '로그아웃',
    description: '리프레시 토큰을 무효화하고 로그아웃합니다.',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Post('logout')
  @AdminAuth()
  async logout(@GetAdmin() payload: AdminJwtPayload): Promise<{ message: string }> {
    await this.adminService.logout(payload.sub);
    return { message: '로그아웃 되었습니다.' };
  }

  // ─── 프로필 ───────────────────────────────────────────────────────────────────

  /** JWT payload의 sub(id)로 관리자 정보 조회 */
  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 로그인한 관리자 정보를 반환합니다.',
  })
  @ApiOkResponse({ type: AdminDTO })
  @Get('me')
  @AdminAuth()
  async me(@GetAdmin() payload: AdminJwtPayload): Promise<AdminDTO> {
    return this.adminService.getMe(payload.sub);
  }
}
