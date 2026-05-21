import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSiteSettingsDTO } from './dtos/site-settings.dto';
import { UpsertSitePageDTO } from './dtos/site-page.dto';

@Injectable()
export class SiteService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    return this.prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    });
  }

  async updateSettings(dto: UpdateSiteSettingsDTO) {
    return this.prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...dto },
      update: dto,
    });
  }

  async listPages() {
    return this.prisma.sitePage.findMany({ orderBy: { slug: 'asc' } });
  }

  async getPage(slug: string) {
    const page = await this.prisma.sitePage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('페이지를 찾을 수 없습니다.');
    return page;
  }

  async upsertPage(slug: string, dto: UpsertSitePageDTO) {
    return this.prisma.sitePage.upsert({
      where: { slug },
      create: { slug, ...dto, content: dto.content ?? '' },
      update: dto,
    });
  }
}
