import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { OffsetSearchOptionDTO } from '../../libs/dtos/search-option.dto';
import { NoticeService } from '../notice/notice.service';
import { FaqService } from '../faq/faq.service';
import { InquiryService } from '../inquiry/inquiry.service';
import { GalleryService } from '../gallery/gallery.service';
import { GallerySearchOptionDTO } from '../gallery/dtos/gallery-search-option.dto';
import { RegistrationService } from '../registration/registration.service';
import { CreateRegistrationDTO } from '../registration/dtos/create-registration.dto';
import { UpdateRegistrationDTO } from '../registration/dtos/update-registration.dto';
import { ScheduleService } from '../schedule/schedule.service';
import { SiteService } from '../site/site.service';
import { BannerService } from '../banner/banner.service';
import { BannerType } from '../banner/dtos/banner.dto';

@Controller('public')
export class PublicController {
  constructor(
    private noticeService: NoticeService,
    private faqService: FaqService,
    private inquiryService: InquiryService,
    private galleryService: GalleryService,
    private registrationService: RegistrationService,
    private scheduleService: ScheduleService,
    private siteService: SiteService,
    private bannerService: BannerService,
  ) {}

  @Get('notices')
  searchNotices(@Query() dto: OffsetSearchOptionDTO) {
    return this.noticeService.searchPublic(dto);
  }

  @Get('notices/:id')
  findOneNotice(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.findOnePublic(id);
  }

  @Get('faqs')
  searchFaqs(@Query() dto: OffsetSearchOptionDTO) {
    return this.faqService.searchPublic(dto);
  }

  @Get('faqs/:id')
  findOneFaq(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.findOnePublic(id);
  }

  @Get('inquiries')
  searchInquiries(@Query() dto: OffsetSearchOptionDTO) {
    return this.inquiryService.searchPublic(dto);
  }

  @Get('inquiries/:id')
  findOneInquiry(@Param('id', ParseIntPipe) id: number) {
    return this.inquiryService.findOnePublic(id);
  }

  @Get('galleries')
  searchGalleries(@Query() dto: GallerySearchOptionDTO) {
    return this.galleryService.searchPublic(dto);
  }

  @Get('galleries/:id')
  findOneGallery(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.findOnePublic(id);
  }

  @Get('schedules')
  getSchedules() {
    return this.scheduleService.searchPublic();
  }

  @Post('registrations')
  createRegistration(@Body() dto: CreateRegistrationDTO) {
    return this.registrationService.create(dto);
  }

  @Get('registrations/:reservationNo')
  findRegistration(@Param('reservationNo') reservationNo: string) {
    return this.registrationService.findByReservationNo(reservationNo);
  }

  @Patch('registrations/:reservationNo')
  updateRegistration(@Param('reservationNo') reservationNo: string, @Body() dto: UpdateRegistrationDTO) {
    return this.registrationService.updateByReservationNo(reservationNo, dto);
  }

  @Get('site-business')
  getSiteSettings() {
    return this.siteService.getSettings();
  }

  @Get('site-terms/:slug')
  getSitePage(@Param('slug') slug: string) {
    return this.siteService.getPage(slug);
  }

  @Get('banners')
  getBanners(@Query('type') type: BannerType) {
    return this.bannerService.findPublic(type);
  }
}
