import { PaginatedResult } from '@demo-shop/common';

// delegate: any — Prisma의 findMany는 `SelectSubset<T, FindManyArgs>` 고차 제네릭을 반환하므로
// 어떤 인터페이스로도 구조적으로 할당 불가(함수 파라미터 반공변). 반환 타입은 PaginatedResult<T>로 보장.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function paginate<T>(
  delegate: any,
  where: unknown,
  pageNo: number,
  pageSize: number,
  orderBy: unknown,
): Promise<PaginatedResult<T>> {
  const skip = (pageNo - 1) * pageSize;
  const [totalItems, items] = await Promise.all([
    delegate.count({ where }),
    delegate.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
    }),
  ]);
  return {
    items,
    pageInfo: {
      pageNo,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
}
