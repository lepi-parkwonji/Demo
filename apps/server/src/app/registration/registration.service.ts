import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Registration } from '@generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { OffsetPaginationDTO } from '../../libs/dtos/offset-pagination.dto';
import { CreateRegistrationDTO } from './dtos/create-registration.dto';
import { UpdateRegistrationDTO } from './dtos/update-registration.dto';
import { RegistrationSearchOptionDTO } from './dtos/registration-search-option.dto';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  private buildWhere(dto: RegistrationSearchOptionDTO): Prisma.RegistrationWhereInput {
    return {
      deletedAt: null,
      ...(dto.fairName && { fairName: { contains: dto.fairName } }),
      ...(dto.query && {
        OR: [
          { name: { contains: dto.query } },
          { contact: { contains: dto.query } },
          { reservationNo: { contains: dto.query } },
        ],
      }),
    };
  }

  async search(dto: RegistrationSearchOptionDTO): Promise<OffsetPaginationDTO<Registration>> {
    const { pageNo, pageSize } = dto;
    const where = this.buildWhere(dto);
    const skip = (pageNo - 1) * pageSize;
    const [totalItems, items] = await Promise.all([
      this.prisma.registration.count({ where }),
      this.prisma.registration.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
    ]);
    return {
      items,
      pageInfo: { pageNo, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) },
    };
  }

  async findOne(id: number) {
    const reg = await this.prisma.registration.findFirst({ where: { id, deletedAt: null } });
    if (!reg) throw new NotFoundException('사전 등록 정보를 찾을 수 없습니다.');
    return reg;
  }

  async findByReservationNo(reservationNo: string) {
    const reg = await this.prisma.registration.findFirst({
      where: { reservationNo, deletedAt: null },
    });
    if (!reg) throw new NotFoundException('예약번호를 찾을 수 없습니다.');
    return reg;
  }

  async updateByReservationNo(reservationNo: string, dto: UpdateRegistrationDTO) {
    const reg = await this.findByReservationNo(reservationNo);
    return this.prisma.registration.update({ where: { id: reg.id }, data: dto });
  }

  async create(dto: CreateRegistrationDTO) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const reservationNo = `REG-${ts}-${rand}`;
    return this.prisma.registration.create({
      data: { ...dto, reservationNo, marketingConsent: dto.marketingConsent ?? false },
    });
  }

  async update(id: number, dto: UpdateRegistrationDTO) {
    await this.findOne(id);
    return this.prisma.registration.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.registration.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
