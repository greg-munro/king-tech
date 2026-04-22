export interface Item {
  id: string | number;
  name: string;
  status: string;
  description: string;
  delta: number;
  createdOn: number;
}

export interface PaginatedResponse {
  data: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

export interface FetchItemsParams {
  search?: string;
  status?: string;
  sortBy?: 'id' | 'name' | 'createdOn';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function fetchItems(params: FetchItemsParams = {}): Promise<PaginatedResponse> {
  const query = new URLSearchParams();

  if (params.search)  query.set('search', params.search);
  if (params.status)  query.set('status', params.status);
  if (params.sortBy)  query.set('sortBy', params.sortBy);
  if (params.order)   query.set('order', params.order);
  if (params.page)    query.set('page', String(params.page));
  if (params.limit)   query.set('limit', String(params.limit));

  const res = await fetch(`/items?${query.toString()}`);

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
