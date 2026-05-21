import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerService, CustomerProfile } from './customer.service';
import { InquiryService } from '../inquiry/inquiry.service';
import { CreateInquiryDTO } from '../inquiry/dtos/create-inquiry.dto';
import { GetCustomer } from '../auth/decorators/get-customer.decorator';
import { CustomerAuth } from '../auth/decorators/customer-auth.decorator';
import type { CustomerJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { KakaoLoginDto } from './dtos/kakao-login.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { CustomerDTO } from './dtos/customer.dto';
import { TokensDTO } from '../../libs/dtos/tokens.dto';

@ApiTags('Client')
@Controller('client')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly inquiryService: InquiryService,
  ) {}

  @ApiOperation({
    summary: '카카오 로그인 URL 조회',
    description: '카카오 OAuth 인가 코드 요청 URL을 반환합니다.',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        url: { type: 'string' },
      },
    },
  })
  @Get('auth/kakao-url')
  getKakaoLoginUrl(@Query('redirectUri') redirectUri: string): { url: string } {
    return this.customerService.getKakaoLoginUrl(redirectUri);
  }

  @ApiOperation({
    summary: '카카오 로그인',
    description: '인가 코드로 카카오 로그인 후 JWT 토큰을 발급합니다.',
  })
  @ApiOkResponse({ type: TokensDTO })
  @Post('auth/kakao')
  kakaoLogin(@Body() body: KakaoLoginDto): Promise<TokensDTO> {
    return this.customerService.kakaoLogin(body.code, body.redirectUri);
  }

  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 로그인한 고객 정보를 반환합니다.',
  })
  @ApiOkResponse({ type: CustomerDTO })
  @Get('me')
  @CustomerAuth()
  getMe(@GetCustomer() payload: CustomerJwtPayload): Promise<CustomerProfile> {
    return this.customerService.getMe(payload.sub);
  }

  @ApiOperation({
    summary: '닉네임 변경',
    description: '고객 닉네임을 변경합니다.',
  })
  @Patch('me')
  @CustomerAuth()
  updateMe(
    @Body() dto: UpdateCustomerDto,
    @GetCustomer() payload: CustomerJwtPayload,
  ): Promise<void> {
    return this.customerService.updateMe(payload.sub, dto.nickname);
  }

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
  @CustomerAuth()
  async logout(@GetCustomer() payload: CustomerJwtPayload): Promise<{ message: string }> {
    await this.customerService.logout(payload.sub);
    return { message: '로그아웃 되었습니다.' };
  }

  @ApiOperation({
    summary: '문의 등록',
    description: '고객 문의를 등록합니다.',
  })
  @Post('inquiries')
  @CustomerAuth()
  createInquiry(
    @Body() dto: CreateInquiryDTO,
    @GetCustomer() payload: CustomerJwtPayload,
  ) {
    return this.inquiryService.create(dto, payload.sub);
  }

  @ApiOperation({
    summary: '문의 상세 조회',
    description: '본인이 작성한 문의를 조회합니다.',
  })
  @Get('inquiries/:id')
  @CustomerAuth()
  findOneInquiry(
    @Param('id', ParseIntPipe) id: number,
    @GetCustomer() payload: CustomerJwtPayload,
  ) {
    return this.inquiryService.findOneByCustomer(id, payload.sub);
  }
}
