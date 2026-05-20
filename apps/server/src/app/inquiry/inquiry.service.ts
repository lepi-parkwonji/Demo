import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Inquiry, Prisma } from '@generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResult } from '@demo-shop/common';
import { OffsetSearchOptionDTO } from '../../libs/dtos/search-option.dto';
import { paginate } from '../../libs/utils/paginate';
import { AnswerInquiryDTO } from './dtos/answer-inquiry.dto';
import { CreateInquiryDTO } from './dtos/create-inquiry.dto';

@Injectable()
export class InquiryService {
  constructor(private readonly prisma: PrismaService) {}

  private buildSearchWhere(query?: string): Prisma.InquiryWhereInput {
    return {
      deletedAt: null,
      ...(query && {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { authorName: { contains: query } },
        ],
      }),
    };
  }

  private maskPublicItem(item: Inquiry): Inquiry {
    const masked = item.isSecret
      ? { ...item, title: '비밀글입니다.', content: '', authorName: '비공개' }
      : { ...item };
    if (!item.isExposed) masked.answer = null;
    return masked;
  }

  // Prisma P2025(레코드 없음)를 NestJS NotFoundException으로 변환
  private handleNotFound(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }
    throw error;
  }

  async search(dto: OffsetSearchOptionDTO): Promise<PaginatedResult<Inquiry>> {
    const { pageNo, pageSize, query } = dto;
    return paginate(this.prisma.inquiry, this.buildSearchWhere(query), pageNo, pageSize, { createdAt: 'desc' });
  }

  async searchPublic(dto: OffsetSearchOptionDTO): Promise<PaginatedResult<Inquiry>> {
    const { pageNo, pageSize, query } = dto;
    const result = await paginate(this.prisma.inquiry, this.buildSearchWhere(query), pageNo, pageSize, { createdAt: 'desc' });
    return {
      ...result,
      items: result.items.map((item: Inquiry) => this.maskPublicItem(item)),
    };
  }

  async findOne(id: number): Promise<Inquiry> {
    const inquiry = await this.prisma.inquiry.findFirst({ where: { id, deletedAt: null } });
    if (!inquiry) throw new NotFoundException('문의를 찾을 수 없습니다.');
    return inquiry;
  }

  // ① findOne 재사용 — 중복 쿼리 제거
  async findOnePublic(id: number): Promise<Inquiry> {
    const inquiry = await this.findOne(id);
    if (inquiry.isSecret) throw new ForbiddenException('비밀글입니다.');
    return this.maskPublicItem(inquiry);
  }

  // ① findOne 재사용 — 중복 쿼리 제거
  async findOneByCustomer(id: number, customerId: string): Promise<Inquiry> {
    const inquiry = await this.findOne(id);
    if (inquiry.isSecret && inquiry.customerId !== customerId) {
      throw new ForbiddenException('비밀글입니다.');
    }
    return inquiry;
  }

  async create(dto: CreateInquiryDTO, customerId?: string): Promise<Inquiry> {
    // 비밀글은 작성자를 특정할 수 있어야 조회가 가능하므로 로그인 필수
    if (dto.isSecret && !customerId) {
      throw new BadRequestException('비밀글은 로그인 후 작성 가능합니다.');
    }
    return this.prisma.inquiry.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorName: dto.authorName,
        isSecret: dto.isSecret ?? false,
        isExposed: true,
        customerId: customerId ?? null,
      },
    });
  }

  async answer(id: number, dto: AnswerInquiryDTO): Promise<Inquiry> {
    // ② 소프트 삭제 레코드 답변 방지: update는 deletedAt 조건을 지원하지 않으므로 findOne으로 선검증
    await this.findOne(id);
    try {
      return await this.prisma.inquiry.update({
        where: { id },
        data: { answer: dto.answer, isAnswered: true },
      });
    } catch (error: unknown) {
      this.handleNotFound(error);
    }
  }

  async toggleExpose(id: number): Promise<Inquiry> {
    const inquiry = await this.findOne(id);
    if (!inquiry.isAnswered) {
      throw new ForbiddenException('답변된 문의만 공개 여부를 변경할 수 있습니다.');
    }
    return this.prisma.inquiry.update({
      where: { id },
      data: { isExposed: !inquiry.isExposed },
    });
  }

  async remove(id: number): Promise<Inquiry> {
    // ② 소프트 삭제 레코드 중복 삭제 방지: findOne으로 deletedAt: null 선검증
    await this.findOne(id);
    try {
      return await this.prisma.inquiry.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: unknown) {
      this.handleNotFound(error);
    }
  }
}
