import { ApiProperty } from '@nestjs/swagger';
import { PageInfo } from '@demo-shop/common';

export class PageInfoDTO implements PageInfo {
  @ApiProperty({ type: Number }) pageNo!: number;
  @ApiProperty({ type: Number }) pageSize!: number;
  @ApiProperty({ type: Number }) totalItems!: number;
  @ApiProperty({ type: Number }) totalPages!: number;
}
