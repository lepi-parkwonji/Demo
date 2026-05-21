import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Schedule, ScheduleStatus } from '@generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { OffsetPaginationDTO } from '../../libs/dtos/offset-pagination.dto';
import { CreateScheduleDTO } from './dtos/create-schedule.dto';
import { UpdateScheduleDTO } from './dtos/update-schedule.dto';

export interface ScheduleSearchOptions {
  pageNo: number;
  pageSize: number;
  query?: string;
  status?: ScheduleStatus;
  year?: number;
  region?: string;
}

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  private buildWhere(options: Omit<ScheduleSearchOptions, 'pageNo' | 'pageSize'>): Prisma.ScheduleWhereInput {
    return {
      deletedAt: null,
      ...(options.status && { status: options.status }),
      ...(options.year && { year: options.year }),
      ...(options.region && { region: { contains: options.region } }),
      ...(options.query && {
        OR: [
          { fairName: { contains: options.query } },
          { place: { contains: options.query } },
        ],
      }),
    };
  }

  async search(options: ScheduleSearchOptions): Promise<OffsetPaginationDTO<Schedule>> {
    const { pageNo, pageSize } = options;
    const where = this.buildWhere(options);
    const skip = (pageNo - 1) * pageSize;
    const [totalItems, items] = await Promise.all([
      this.prisma.schedule.count({ where }),
      this.prisma.schedule.findMany({ where, skip, take: pageSize, orderBy: { startTime: 'asc' } }),
    ]);
    return {
      items,
      pageInfo: { pageNo, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) },
    };
  }

  async findOne(id: number) {
    const schedule = await this.prisma.schedule.findFirst({ where: { id, deletedAt: null } });
    if (!schedule) throw new NotFoundException('박람회 일정을 찾을 수 없습니다.');
    return schedule;
  }

  async create(dto: CreateScheduleDTO) {
    const { type, ...rest } = dto;
    return this.prisma.schedule.create({
      data: { ...rest, type: type ?? '', startTime: new Date(dto.startTime), endTime: new Date(dto.endTime) },
    });
  }

  async update(id: number, dto: UpdateScheduleDTO) {
    await this.findOne(id);
    const { startTime, endTime, ...rest } = dto;
    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...rest,
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.schedule.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async toggleExpose(id: number) {
    const schedule = await this.findOne(id);
    return this.prisma.schedule.update({ where: { id }, data: { isExposed: !schedule.isExposed } });
  }

  async searchPublic(): Promise<Schedule[]> {
    return this.prisma.schedule.findMany({
      where: { deletedAt: null, status: { in: ['PENDING', 'ONGOING'] } },
      orderBy: { startTime: 'asc' },
    });
  }
}
