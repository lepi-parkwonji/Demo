import { PaginatedResult } from '@demo-shop/common';
import { PageInfoDTO } from './page-info.dto';

export class OffsetPaginationDTO<T> implements PaginatedResult<T> {
  items: T[];
  pageInfo: PageInfoDTO;
}
