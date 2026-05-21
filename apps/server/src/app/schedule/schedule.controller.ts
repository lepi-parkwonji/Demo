import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ScheduleStatus } from '@generated/prisma';
import { AdminAuth } from '../auth/decorators/admin-auth.decorator';
import { ApiPaginatedResponse } from '../../libs/swagger/api-paginated-response.decorator';
import { ApiSearchQuery } from '../../libs/swagger/api-search-query.decorator';
import { CreateScheduleDTO } from './dtos/create-schedule.dto';
import { UpdateScheduleDTO } from './dtos/update-schedule.dto';
import { ScheduleResponseDTO } from './dtos/schedule-response.dto';
import { ScheduleService } from './schedule.service';

@ApiTags('schedule')
@ApiBearerAuth()
@Controller('schedule')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @ApiPaginatedResponse(ScheduleResponseDTO) @ApiSearchQuery()
  @ApiQuery({ name: 'status', required: false, enum: ScheduleStatus })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'region', required: false, type: String })
  @Get('search')
  @AdminAuth()
  search(
    @Query('pageNo') pageNo = 1,
    @Query('pageSize') pageSize = 10,
    @Query('query') query?: string,
    @Query('status') status?: ScheduleStatus,
    @Query('year') year?: string,
    @Query('region') region?: string,
  ) {
    return this.scheduleService.search({
      pageNo: +pageNo,
      pageSize: +pageSize,
      query,
      status,
      year: year ? +year : undefined,
      region,
    });
  }

  @ApiOkResponse({ type: ScheduleResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  @AdminAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.findOne(id);
  }

  @ApiOkResponse({ type: ScheduleResponseDTO }) @ApiBody({ type: CreateScheduleDTO })
  @Post()
  @AdminAuth()
  create(@Body() dto: CreateScheduleDTO) {
    return this.scheduleService.create(dto);
  }

  @ApiOkResponse({ type: ScheduleResponseDTO }) @ApiBody({ type: UpdateScheduleDTO }) @ApiParam({ name: 'id', type: Number })
  @Patch(':id')
  @AdminAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateScheduleDTO) {
    return this.scheduleService.update(id, dto);
  }

  @ApiOkResponse({ type: ScheduleResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Delete(':id')
  @AdminAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }

  @ApiOkResponse({ type: ScheduleResponseDTO }) @ApiParam({ name: 'id', type: Number })
  @Patch(':id/expose')
  @AdminAuth()
  toggleExpose(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.toggleExpose(id);
  }
}
