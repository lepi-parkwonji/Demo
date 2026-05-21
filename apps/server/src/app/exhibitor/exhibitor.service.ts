import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ExhibitorStatus } from '@generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { OffsetPaginationDTO } from '../../libs/dtos/offset-pagination.dto';
import { CreateExhibitorDTO } from './dtos/create-exhibitor.dto';
import { UpdateExhibitorDTO } from './dtos/update-exhibitor.dto';

export interface ExhibitorSearchOptions {
  pageNo: number;
  pageSize: number;
  query?: string;
  status?: ExhibitorStatus;
  scheduleId?: number;
}

const exhibitorInclude = { schedule: { select: { fairName: true } } } as const;

type ExhibitorWithSchedule = Prisma.ExhibitorGetPayload<{ include: typeof exhibitorInclude }>;
type ExhibitorResponse = Omit<ExhibitorWithSchedule, 'schedule'> & { scheduleFairName: string };

@Injectable()
export class ExhibitorService {
  constructor(private prisma: PrismaService) {}

  private buildWhere(options: Omit<ExhibitorSearchOptions, 'pageNo' | 'pageSize'>): Prisma.ExhibitorWhereInput {
    return {
      deletedAt: null,
      ...(options.status && { status: options.status }),
      ...(options.scheduleId && { scheduleId: options.scheduleId }),
      ...(options.query && {
        OR: [
          { companyName: { contains: options.query } },
          { managerName: { contains: options.query } },
          { contact: { contains: options.query } },
        ],
      }),
    };
  }

  private toResponse(exhibitor: ExhibitorWithSchedule): ExhibitorResponse {
    const { schedule, ...rest } = exhibitor;
    return { ...rest, scheduleFairName: schedule?.fairName ?? '' };
  }

  async search(options: ExhibitorSearchOptions): Promise<OffsetPaginationDTO<ExhibitorResponse>> {
    const { pageNo, pageSize } = options;
    const where = this.buildWhere(options);
    const skip = (pageNo - 1) * pageSize;
    const [totalItems, items] = await Promise.all([
      this.prisma.exhibitor.count({ where }),
      this.prisma.exhibitor.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' }, include: exhibitorInclude }),
    ]);
    return {
      items: items.map(e => this.toResponse(e)),
      pageInfo: { pageNo, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) },
    };
  }

  async findOne(id: number) {
    const exhibitor = await this.prisma.exhibitor.findFirst({ where: { id, deletedAt: null }, include: exhibitorInclude });
    if (!exhibitor) throw new NotFoundException('참가 업체를 찾을 수 없습니다.');
    return this.toResponse(exhibitor);
  }

  async create(dto: CreateExhibitorDTO) {
    const { options, representativeName, businessRegNumber, managerName, contact, email, ...rest } = dto;
    const exhibitor = await this.prisma.exhibitor.create({
      data: {
        ...rest,
        representativeName: representativeName ?? '',
        businessRegNumber: businessRegNumber ?? '',
        managerName: managerName ?? '',
        contact: contact ?? '',
        email: email ?? '',
        options: options ?? [],
      },
      include: exhibitorInclude,
    });
    return this.toResponse(exhibitor);
  }

  async update(id: number, dto: UpdateExhibitorDTO) {
    await this.findOne(id);
    const exhibitor = await this.prisma.exhibitor.update({
      where: { id },
      data: dto,
      include: exhibitorInclude,
    });
    return this.toResponse(exhibitor);
  }

  async remove(id: number) {
    await this.findOne(id);
    const exhibitor = await this.prisma.exhibitor.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: exhibitorInclude,
    });
    return this.toResponse(exhibitor);
  }
}
