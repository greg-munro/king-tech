import { processQuery } from '../services/query.service';
import type { Item } from '../services/data.service';

const items: Item[] = [
  { id: 3, name: 'gallant_curie', status: 'ACTIVE', description: '', delta: 0, createdOn: 3000 },
  { id: 1, name: 'vibrant_hypatia', status: 'COMPLETED', description: '', delta: 0, createdOn: 1000 },
  { id: 2, name: 'gallant_newton', status: 'ACTIVE', description: '', delta: 0, createdOn: 2000 },
  { id: 4, name: 'boring_jones', status: 'PENDING', description: '', delta: 0, createdOn: 4000 },
];

describe('processQuery — pipeline order', () => {
  it('returns all items with no params', () => {
    const result = processQuery(items, {});
    expect(result.total).toBe(4);
  });

  it('applies search before status filter', () => {
    // 'gallant' matches id 3 + 2, both ACTIVE — status filter should narrow to those
    const result = processQuery(items, { search: 'gallant', status: 'ACTIVE' });
    expect(result.total).toBe(2);
    result.data.forEach((item) => expect(item.status).toBe('ACTIVE'));
  });

  it('applies sort after filtering', () => {
    // filter to ACTIVE (id 3 + 2), then sort by id asc → [2, 3]
    const result = processQuery(items, { status: 'ACTIVE', sortBy: 'id', order: 'asc' });
    expect(result.data.map((i) => i.id)).toEqual([2, 3]);
  });

  it('paginates the sorted filtered set', () => {
    // 4 items, limit 2, page 2 → last 2 items
    const result = processQuery(items, { sortBy: 'id', order: 'asc', page: 2, limit: 2 });
    expect(result.data.map((i) => i.id)).toEqual([3, 4]);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
  });

  it('returns empty data and correct metadata when nothing matches', () => {
    const result = processQuery(items, { search: 'zzznomatch' });
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
