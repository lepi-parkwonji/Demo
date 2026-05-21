import { Injectable, NotFoundException } from '@nestjs/common';
import { Faq, Prisma } from '@generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResult } from '@demo-shop/common';
import { OffsetSearchOptionDTO } from '../../libs/dtos/search-option.dto';
import { paginate } from '../../libs/utils/paginate';
import { CreateFaqDTO } from './dtos/create-faq.dto';
import { UpdateFaqDTO } from './dtos/update-faq.dto';

const SYSTEM_AUTHOR_ID = 1;

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  private buildSearchWhere(query?: string): Prisma.FaqWhereInput {
    return {
      deletedAt: null,
      ...(query && {
        OR: [
          { question: { contains: query } },
          { answer: { contains: query } },
        ],
      }),
    };
  }

  async search(dto: OffsetSearchOptionDTO): Promise<PaginatedResult<Faq>> {
    const { pageNo, pageSize, query } = dto;
    return paginate(this.prisma.faq, this.buildSearchWhere(query), pageNo, pageSize, [{ isPinned: 'desc' }, { createdAt: 'desc' }]);
  }

  async searchPublic(dto: OffsetSearchOptionDTO): Promise<PaginatedResult<Faq>> {
    const { pageNo, pageSize, query } = dto;
    return paginate(this.prisma.faq, { ...this.buildSearchWhere(query), isExposed: true }, pageNo, pageSize, [{ isPinned: 'desc' }, { createdAt: 'desc' }]);
  }

  async findOne(id: number) {
    const faq = await this.prisma.faq.findFirst({ where: { id, deletedAt: null } });
    if (!faq) throw new NotFoundException('FAQ를 찾을 수 없습니다.');
    return faq;
  }

  async findOnePublic(id: number) {
    const faq = await this.prisma.faq.findFirst({
      where: { id, deletedAt: null, isExposed: true },
    });
    if (!faq) throw new NotFoundException('FAQ를 찾을 수 없습니다.');
    return faq;
  }

  async create(dto: CreateFaqDTO) {
    return this.prisma.faq.create({ data: { ...dto, authorId: SYSTEM_AUTHOR_ID } });
  }

  async update(id: number, dto: UpdateFaqDTO) {
    await this.findOne(id);
    return this.prisma.faq.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.faq.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async togglePin(id: number) {
    const faq = await this.findOne(id);
    return this.prisma.faq.update({ where: { id }, data: { isPinned: !faq.isPinned } });
  }

  async toggleExpose(id: number) {
    const faq = await this.findOne(id);
    return this.prisma.faq.update({ where: { id }, data: { isExposed: !faq.isExposed } });
  }
}
