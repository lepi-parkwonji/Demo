import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BannerType, CreateBannerDto, UpdateBannerDto } from './dtos/banner.dto';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  findAll(type?: BannerType) {
    return this.prisma.banner.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  findPublic(type: BannerType) {
    return this.prisma.banner.findMany({
      where: { type, isExposed: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: number) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('배너를 찾을 수 없습니다.');
    return banner;
  }

  create(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto });
  }

  async update(id: number, dto: UpdateBannerDto) {
    await this.findOne(id);
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.banner.delete({ where: { id } });
  }

  async toggleExpose(id: number) {
    const banner = await this.findOne(id);
    return this.prisma.banner.update({ where: { id }, data: { isExposed: !banner.isExposed } });
  }
}
