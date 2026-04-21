import type { Item } from './data.service';
import { filterItems } from './filter.service';
import { sortItems } from './sort.service';
import { paginate } from './pagination.service';
import type { PaginatedResult } from './pagination.service';

export interface QueryParams {
  search?: string;
  status?: string;
  sortBy?: 'id' | 'name' | 'createdOn';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export function processQuery(items: Item[], params: QueryParams): PaginatedResult {
  const filtered = filterItems(items, params.search, params.status);
  const sorted = sortItems(filtered, params.sortBy, params.order);
  const result = paginate(sorted, params.page, params.limit);
  return result;
}
