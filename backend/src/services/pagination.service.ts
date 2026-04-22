import type { Item } from './data.service';

export interface PaginatedResult {
  data: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

export function paginate(items: Item[], page: number = 1, limit: number = 20): PaginatedResult {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const data = items.slice((page - 1) * limit, page * limit);

  const statusCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return { data, total, page, limit, totalPages, statusCounts };
}
