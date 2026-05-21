import { Module } from '@nestjs/common';
import { NoticeModule } from '../notice/notice.module';
import { FaqModule } from '../faq/faq.module';
import { InquiryModule } from '../inquiry/inquiry.module';
import { GalleryModule } from '../gallery/gallery.module';
import { RegistrationModule } from '../registration/registration.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { SiteModule } from '../site/site.module';
import { BannerModule } from '../banner/banner.module';
import { PublicController } from './public.controller';

@Module({
  imports: [NoticeModule, FaqModule, InquiryModule, GalleryModule, RegistrationModule, ScheduleModule, SiteModule, BannerModule],
  controllers: [PublicController],
})
export class PublicModule {}
