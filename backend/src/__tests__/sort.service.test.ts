import { sortItems } from '../services/sort.service';
import type { Item } from '../services/data.service';

const items: Item[] = [
  { id: 3, name: 'charlie', status: 'ACTIVE', description: '', delta: 0, createdOn: 3000 },
  { id: 1, name: 'alpha', status: 'ACTIVE', description: '', delta: 0, createdOn: 1000 },
  { id: 2, name: 'bravo', status: 'ACTIVE', description: '', delta: 0, createdOn: 2000 },
];

describe('sortItems — by id', () => {
  it('sorts by id ascending', () => {
    const result = sortItems(items, 'id', 'asc');
    expect(result.map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it('sorts by id descending', () => {
    const result = sortItems(items, 'id', 'desc');
    expect(result.map((i) => i.id)).toEqual([3, 2, 1]);
  });
});

describe('sortItems — by name', () => {
  it('sorts by name ascending', () => {
    const result = sortItems(items, 'name', 'asc');
    expect(result.map((i) => i.name)).toEqual(['alpha', 'bravo', 'charlie']);
  });

  it('sorts by name descending', () => {
    const result = sortItems(items, 'name', 'desc');
    expect(result.map((i) => i.name)).toEqual(['charlie', 'bravo', 'alpha']);
  });
});

describe('sortItems — by createdOn', () => {
  it('sorts by createdOn ascending', () => {
    const result = sortItems(items, 'createdOn', 'asc');
    expect(result.map((i) => i.createdOn)).toEqual([1000, 2000, 3000]);
  });

  it('sorts by createdOn descending', () => {
    const result = sortItems(items, 'createdOn', 'desc');
    expect(result.map((i) => i.createdOn)).toEqual([3000, 2000, 1000]);
  });
});

describe('sortItems — defaults', () => {
  it('returns items unchanged when no sortBy provided', () => {
    const result = sortItems(items);
    expect(result.map((i) => i.id)).toEqual([3, 1, 2]);
  });

  it('defaults to ascending order when order not provided', () => {
    const result = sortItems(items, 'id');
    expect(result.map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it('does not mutate the original array', () => {
    const original = [...items];
    sortItems(items, 'id', 'asc');
    expect(items).toEqual(original);
  });
});
