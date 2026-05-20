import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminAuth } from '../auth/decorators/admin-auth.decorator';
import { OffsetSearchOptionDTO } from '../../libs/dtos/search-option.dto';
import { ApiPaginatedResponse } from '../../libs/swagger/api-paginated-response.decorator';
import { ApiSearchQuery } from '../../libs/swagger/api-search-query.decorator';
import { NoticeService } from './notice.service';
import { CreateNoticeDTO } from './dtos/create-notice.dto';
import { UpdateNoticeDTO } from './dtos/update-notice.dto';
import { NoticeResponseDTO } from './dtos/notice-response.dto';

@ApiTags('notice')
@Controller('notice')
export class NoticeController {
  constructor(private noticeService: NoticeService) {}

  @ApiPaginatedResponse(NoticeResponseDTO) @ApiSearchQuery()
  @Get('search')
  search(@Query() dto: OffsetSearchOptionDTO) {
    return this.noticeService.search(dto);
  }

  @ApiOkResponse({ type: NoticeResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.findOne(id);
  }

  @ApiBearerAuth() @ApiOkResponse({ type: NoticeResponseDTO }) @ApiBody({ type: CreateNoticeDTO })
  @Post()
  @AdminAuth()
  create(@Body() dto: CreateNoticeDTO) {
    return this.noticeService.create(dto);
  }

  @ApiBearerAuth() @ApiOkResponse({ type: NoticeResponseDTO }) @ApiBody({ type: UpdateNoticeDTO }) @ApiParam({ name: 'id', type: Number })
  @Patch(':id')
  @AdminAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNoticeDTO) {
    return this.noticeService.update(id, dto);
  }

  @ApiBearerAuth() @ApiOkResponse({ type: NoticeResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Delete(':id')
  @AdminAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.remove(id);
  }

  @ApiBearerAuth() @ApiOkResponse({ type: NoticeResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Patch(':id/pin')
  @AdminAuth()
  togglePin(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.togglePin(id);
  }

  @ApiBearerAuth() @ApiOkResponse({ type: NoticeResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Patch(':id/expose')
  @AdminAuth()
  toggleExpose(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.toggleExpose(id);
  }
}
