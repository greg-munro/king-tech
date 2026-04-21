import type { Item } from './data.service';

export function filterItems(items: Item[], search?: string, status?: string): Item[] {
  let result = items;

  if (search) {
    const term = search.toLowerCase();
    result = result.filter((item) => item.name.toLowerCase().includes(term));
  }

  if (status) {
    result = result.filter((item) => item.status.toLowerCase() === status.toLowerCase());
  }

  return result;
}
