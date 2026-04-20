import { Item } from './data.service';

export interface QueryParams {
  search?: string;
  status?: string;
  sortBy?: 'id' | 'name' | 'createdOn';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResult {
  data: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Stub — full pipeline wired in Day 2
export function processQuery(items: Item[], params: QueryParams): PaginatedResult {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const data = items.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
