import { Repository, FindManyOptions } from 'typeorm';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function paginate<T>(
  repo: Repository<T>,
  page: number,
  limit: number,
  options?: FindManyOptions<T>,
): Promise<PaginatedResponse<T>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 500);
  const [data, total] = await repo.findAndCount({
    ...options,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  });
  return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
}
