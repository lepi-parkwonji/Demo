import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuth } from '../auth/decorators/admin-auth.decorator';
import { SiteService } from './site.service';
import { UpdateSiteSettingsDTO } from './dtos/site-settings.dto';
import { UpsertSitePageDTO } from './dtos/site-page.dto';

@ApiTags('site')
@ApiBearerAuth()
@Controller('site')
export class SiteController {
  constructor(private siteService: SiteService) {}

  @Get('business')
  @AdminAuth()
  getSettings() {
    return this.siteService.getSettings();
  }

  @Patch('business')
  @AdminAuth()
  updateSettings(@Body() dto: UpdateSiteSettingsDTO) {
    return this.siteService.updateSettings(dto);
  }

  @Get('terms')
  @AdminAuth()
  listPages() {
    return this.siteService.listPages();
  }

  @Get('pages/:slug')
  @AdminAuth()
  getPage(@Param('slug') slug: string) {
    return this.siteService.getPage(slug);
  }

  @Put('pages/:slug')
  @AdminAuth()
  upsertPage(@Param('slug') slug: string, @Body() dto: UpsertSitePageDTO) {
    return this.siteService.upsertPage(slug, dto);
  }
}
