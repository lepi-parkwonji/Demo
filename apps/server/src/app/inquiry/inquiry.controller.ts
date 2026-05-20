import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AdminAuth } from '../auth/decorators/admin-auth.decorator';
import { AuthService } from '../auth/auth.service';
import { OffsetSearchOptionDTO } from '../../libs/dtos/search-option.dto';
import { ApiPaginatedResponse } from '../../libs/swagger/api-paginated-response.decorator';
import { ApiSearchQuery } from '../../libs/swagger/api-search-query.decorator';
import { AnswerInquiryDTO } from './dtos/answer-inquiry.dto';
import { CreateInquiryDTO } from './dtos/create-inquiry.dto';
import { InquiryResponseDTO } from './dtos/inquiry-response.dto';
import { InquiryService } from './inquiry.service';

@ApiTags('Inquiry')
@Controller('inquiry')
export class InquiryController {
  constructor(
    private readonly inquiryService: InquiryService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: '문의 목록 검색 (관리자)',
    description: '전체 문의 목록을 검색합니다.',
  })
  @ApiPaginatedResponse(InquiryResponseDTO)
  @ApiSearchQuery()
  @Get('search')
  @AdminAuth()
  search(@Query() dto: OffsetSearchOptionDTO) {
    return this.inquiryService.search(dto);
  }

  @ApiOperation({
    summary: '문의 상세 조회 (관리자)',
    description: '문의 상세 내용을 조회합니다.',
  })
  @ApiOkResponse({ type: InquiryResponseDTO })
  @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  @AdminAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inquiryService.findOne(id);
  }

  @ApiOperation({
    summary: '문의 등록',
    description: '문의를 등록합니다. 비밀글은 카카오 로그인 후 작성 가능합니다.',
  })
  @ApiOkResponse({ type: InquiryResponseDTO })
  @ApiBody({ type: CreateInquiryDTO })
  @Post()
  create(@Body() dto: CreateInquiryDTO, @Req() req: Request) {
    return this.inquiryService.create(dto, this.tryGetCustomerId(req));
  }

  @ApiOperation({
    summary: '문의 답변 등록 (관리자)',
    description: '문의에 답변을 등록합니다.',
  })
  @ApiOkResponse({ type: InquiryResponseDTO })
  @ApiBody({ type: AnswerInquiryDTO })
  @ApiParam({ name: 'id', type: Number })
  @Patch(':id/answer')
  @AdminAuth()
  answer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AnswerInquiryDTO,
  ) {
    return this.inquiryService.answer(id, dto);
  }

  @ApiOperation({
    summary: '문의 공개 여부 토글 (관리자)',
    description: '답변된 문의의 공개 여부를 변경합니다.',
  })
  @ApiOkResponse({ type: InquiryResponseDTO })
  @ApiParam({ name: 'id', type: Number })
  @Patch(':id/expose')
  @AdminAuth()
  toggleExpose(@Param('id', ParseIntPipe) id: number) {
    return this.inquiryService.toggleExpose(id);
  }

  @ApiOperation({
    summary: '문의 삭제 (관리자)',
    description: '문의를 소프트 삭제합니다.',
  })
  @ApiOkResponse({ type: InquiryResponseDTO })
  @ApiParam({ name: 'id', type: Number })
  @Delete(':id')
  @AdminAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inquiryService.remove(id);
  }

  // 선택적 인증: 토큰이 있으면 customerId를 추출하고 없거나 유효하지 않으면 undefined 반환
  private tryGetCustomerId(req: Request): string | undefined {
    const token = this.authService.extractAccessTokenFromHeader(req);
    if (!token) return undefined;
    try {
      return this.authService.verifyToken<{ sub: string }>(token).sub;
    } catch {
      return undefined;
    }
  }
}
