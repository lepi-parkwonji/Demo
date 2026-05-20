import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuth } from '../auth/decorators/admin-auth.decorator';
import { BannerService } from './banner.service';
import { BannerType, CreateBannerDto, UpdateBannerDto } from './dtos/banner.dto';

@ApiTags('banner')
@ApiBearerAuth()
@Controller('banners')
export class BannerController {
  constructor(private bannerService: BannerService) {}

  @Get()
  @AdminAuth()
  findAll(@Query('type') type?: BannerType) {
    return this.bannerService.findAll(type);
  }

  @Get(':id')
  @AdminAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.findOne(id);
  }

  @Post()
  @AdminAuth()
  create(@Body() dto: CreateBannerDto) {
    return this.bannerService.create(dto);
  }

  @Patch(':id')
  @AdminAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBannerDto) {
    return this.bannerService.update(id, dto);
  }

  @Patch(':id/toggle-expose')
  @AdminAuth()
  toggleExpose(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.toggleExpose(id);
  }

  @Delete(':id')
  @AdminAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.remove(id);
  }
}
