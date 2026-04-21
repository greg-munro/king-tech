import type { Item } from './data.service';

type SortField = 'id' | 'name' | 'createdOn';
type SortOrder = 'asc' | 'desc';

export function sortItems(items: Item[], sortBy?: SortField, order: SortOrder = 'asc'): Item[] {
  if (!sortBy) return items;

  const direction = order === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name) * direction;
    }

    return (Number(a[sortBy]) - Number(b[sortBy])) * direction;
  });
}
