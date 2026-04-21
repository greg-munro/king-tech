import { filterItems } from '../services/filter.service';
import type { Item } from '../services/data.service';

const items: Item[] = [
  { id: 1, name: 'gallant_curie', status: 'ACTIVE', description: '', delta: 1, createdOn: 1000 },
  { id: 2, name: 'vibrant_hypatia', status: 'COMPLETED', description: '', delta: 2, createdOn: 2000 },
  { id: 3, name: 'Gallant_Newton', status: 'ACTIVE', description: '', delta: 3, createdOn: 3000 },
  { id: 4, name: 'boring_jones', status: 'PENDING', description: '', delta: 4, createdOn: 4000 },
];

describe('filterItems — search', () => {
  it('returns all items when no search term provided', () => {
    expect(filterItems(items)).toHaveLength(4);
  });

  it('matches items by name substring', () => {
    const result = filterItems(items, 'hypatia');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('is case-insensitive', () => {
    const result = filterItems(items, 'GALLANT');
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no name matches', () => {
    const result = filterItems(items, 'zzznomatch');
    expect(result).toHaveLength(0);
  });

  it('matches partial name', () => {
    const result = filterItems(items, 'bor');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });
});

describe('filterItems — status', () => {
  it('filters by exact status match', () => {
    const result = filterItems(items, undefined, 'ACTIVE');
    expect(result).toHaveLength(2);
    result.forEach((item) => expect(item.status).toBe('ACTIVE'));
  });

  it('returns empty array when no items match status', () => {
    const result = filterItems(items, undefined, 'CANCELLED');
    expect(result).toHaveLength(0);
  });

  it('returns all items when no status provided', () => {
    expect(filterItems(items, undefined, undefined)).toHaveLength(4);
  });
});

describe('filterItems — combined search and status', () => {
  it('applies search then status filter', () => {
    const result = filterItems(items, 'gallant', 'ACTIVE');
    expect(result).toHaveLength(2);
    result.forEach((item) => expect(item.status).toBe('ACTIVE'));
  });

  it('returns empty when search matches but status does not', () => {
    const result = filterItems(items, 'gallant', 'COMPLETED');
    expect(result).toHaveLength(0);
  });
});
