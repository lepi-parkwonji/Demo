import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExhibitorStatus } from '@generated/prisma';
import { AdminAuth } from '../auth/decorators/admin-auth.decorator';
import { ApiPaginatedResponse } from '../../libs/swagger/api-paginated-response.decorator';
import { ApiSearchQuery } from '../../libs/swagger/api-search-query.decorator';
import { CreateExhibitorDTO } from './dtos/create-exhibitor.dto';
import { UpdateExhibitorDTO } from './dtos/update-exhibitor.dto';
import { ExhibitorResponseDTO } from './dtos/exhibitor-response.dto';
import { ExhibitorService } from './exhibitor.service';

@ApiTags('exhibitor')
@ApiBearerAuth()
@Controller('exhibitor')
export class ExhibitorController {
  constructor(private exhibitorService: ExhibitorService) {}

  @ApiPaginatedResponse(ExhibitorResponseDTO) @ApiSearchQuery()
  @ApiQuery({ name: 'status', required: false, enum: ExhibitorStatus })
  @ApiQuery({ name: 'scheduleId', required: false, type: Number })
  @Get('search')
  @AdminAuth()
  search(
    @Query('pageNo') pageNo = 1,
    @Query('pageSize') pageSize = 10,
    @Query('query') query?: string,
    @Query('status') status?: ExhibitorStatus,
    @Query('scheduleId') scheduleId?: string,
  ) {
    return this.exhibitorService.search({
      pageNo: +pageNo,
      pageSize: +pageSize,
      query,
      status,
      scheduleId: scheduleId ? +scheduleId : undefined,
    });
  }

  @ApiOkResponse({ type: ExhibitorResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  @AdminAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitorService.findOne(id);
  }

  @ApiOkResponse({ type: ExhibitorResponseDTO }) @ApiBody({ type: CreateExhibitorDTO })
  @Post()
  @AdminAuth()
  create(@Body() dto: CreateExhibitorDTO) {
    return this.exhibitorService.create(dto);
  }

  @ApiOkResponse({ type: ExhibitorResponseDTO }) @ApiBody({ type: UpdateExhibitorDTO }) @ApiParam({ name: 'id', type: Number })
  @Patch(':id')
  @AdminAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExhibitorDTO) {
    return this.exhibitorService.update(id, dto);
  }

  @ApiOkResponse({ type: ExhibitorResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Delete(':id')
  @AdminAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitorService.remove(id);
  }
}
