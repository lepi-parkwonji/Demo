import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../libs/decorators/auth.decorator';
import { SiteService } from './site.service';
import { UpdateSiteSettingsDTO } from './dtos/site-settings.dto';
import { UpsertSitePageDTO } from './dtos/site-page.dto';

@ApiTags('site')
@ApiBearerAuth()
@Controller('site')
export class SiteController {
  constructor(private siteService: SiteService) {}

  @Get('business')
  @Auth()
  getSettings() {
    return this.siteService.getSettings();
  }

  @Patch('business')
  @Auth()
  updateSettings(@Body() dto: UpdateSiteSettingsDTO) {
    return this.siteService.updateSettings(dto);
  }

  @Get('terms')
  @Auth()
  listPages() {
    return this.siteService.listPages();
  }

  @Get('pages/:slug')
  @Auth()
  getPage(@Param('slug') slug: string) {
    return this.siteService.getPage(slug);
  }

  @Put('pages/:slug')
  @Auth()
  upsertPage(@Param('slug') slug: string, @Body() dto: UpsertSitePageDTO) {
    return this.siteService.upsertPage(slug, dto);
  }
}
