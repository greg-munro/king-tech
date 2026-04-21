import type { Item } from './data.service';

export interface PaginatedResult {
  data: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate(items: Item[], page: number = 1, limit: number = 20): PaginatedResult {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const data = items.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
