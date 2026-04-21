import { processQuery } from '../services/query.service';
import type { Item } from '../services/data.service';

// Generate n items with predictable values for assertions
function makeItems(n: number): Item[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `item-${i + 1}`,
    status: 'ACTIVE',
    description: `description-${i + 1}`,
    delta: i,
    createdOn: 1000000 + i,
  }));
}

describe('processQuery — pagination', () => {
  it('returns first 20 items by default', () => {
    const items = makeItems(50);
    const result = processQuery(items, {});
    expect(result.data).toHaveLength(20);
    expect(result.data[0].id).toBe(1);
  });

  it('returns correct slice for page 2', () => {
    const items = makeItems(50);
    const result = processQuery(items, { page: 2, limit: 20 });
    expect(result.data).toHaveLength(20);
    expect(result.data[0].id).toBe(21);
  });

  it('returns correct totalPages', () => {
    const items = makeItems(50);
    const result = processQuery(items, { limit: 20 });
    expect(result.totalPages).toBe(3);
  });

  it('returns correct total count', () => {
    const items = makeItems(50);
    const result = processQuery(items, {});
    expect(result.total).toBe(50);
  });

  it('returns empty data array when page is beyond total', () => {
    const items = makeItems(20);
    const result = processQuery(items, { page: 5, limit: 20 });
    expect(result.data).toHaveLength(0);
  });

  it('respects custom limit', () => {
    const items = makeItems(50);
    const result = processQuery(items, { limit: 10 });
    expect(result.data).toHaveLength(10);
    expect(result.totalPages).toBe(5);
  });

  it('returns all items when limit exceeds total', () => {
    const items = makeItems(5);
    const result = processQuery(items, { limit: 20 });
    expect(result.data).toHaveLength(5);
    expect(result.totalPages).toBe(1);
  });

  it('returns empty data and zero totalPages for empty dataset', () => {
    const result = processQuery([], {});
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
