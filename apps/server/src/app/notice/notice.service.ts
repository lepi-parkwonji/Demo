import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Notice } from '@generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResult } from '@demo-shop/common';
import { OffsetSearchOptionDTO } from '../../libs/dtos/search-option.dto';
import { paginate } from '../../libs/utils/paginate';
import { CreateNoticeDTO } from './dtos/create-notice.dto';
import { UpdateNoticeDTO } from './dtos/update-notice.dto';

const SYSTEM_AUTHOR_ID = 1;

@Injectable()
export class NoticeService {
  constructor(private prisma: PrismaService) {}

  private buildSearchWhere(query?: string): Prisma.NoticeWhereInput {
    return {
      deletedAt: null,
      ...(query && {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
      }),
    };
  }

  async search(dto: OffsetSearchOptionDTO): Promise<PaginatedResult<Notice>> {
    const { pageNo, pageSize, query } = dto;
    return paginate(this.prisma.notice, this.buildSearchWhere(query), pageNo, pageSize, [{ isPinned: 'desc' }, { createdAt: 'desc' }]);
  }

  async searchPublic(dto: OffsetSearchOptionDTO): Promise<PaginatedResult<Notice>> {
    const { pageNo, pageSize, query } = dto;
    return paginate(this.prisma.notice, { ...this.buildSearchWhere(query), isExposed: true }, pageNo, pageSize, [{ isPinned: 'desc' }, { createdAt: 'desc' }]);
  }

  async findOne(id: number) {
    const notice = await this.prisma.notice.findFirst({ where: { id, deletedAt: null } });
    if (!notice) throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    return notice;
  }

  async findOnePublic(id: number) {
    const notice = await this.prisma.notice.findFirst({
      where: { id, deletedAt: null, isExposed: true },
    });
    if (!notice) throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    return notice;
  }

  async create(dto: CreateNoticeDTO) {
    return this.prisma.notice.create({ data: { ...dto, authorId: SYSTEM_AUTHOR_ID } });
  }

  async update(id: number, dto: UpdateNoticeDTO) {
    await this.findOne(id);
    return this.prisma.notice.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.notice.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async togglePin(id: number) {
    const notice = await this.findOne(id);
    return this.prisma.notice.update({ where: { id }, data: { isPinned: !notice.isPinned } });
  }

  async toggleExpose(id: number) {
    const notice = await this.findOne(id);
    return this.prisma.notice.update({ where: { id }, data: { isExposed: !notice.isExposed } });
  }
}
