import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchItems } from './client';

function mockFetchSuccess(body: object = {}) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => body,
  }));
}

function mockFetchFailure(status: number, statusText: string) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
  }));
}

function capturedUrl(): string {
  return (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchItems — URL construction', () => {
  it('calls /items with no query params when called with no arguments', async () => {
    mockFetchSuccess();
    await fetchItems();
    expect(capturedUrl()).toBe('/items?');
  });

  it('appends search param when provided', async () => {
    mockFetchSuccess();
    await fetchItems({ search: 'gallant' });
    expect(capturedUrl()).toContain('search=gallant');
  });

  it('appends status param when provided', async () => {
    mockFetchSuccess();
    await fetchItems({ status: 'COMPLETED' });
    expect(capturedUrl()).toContain('status=COMPLETED');
  });

  it('appends sortBy and order params when provided', async () => {
    mockFetchSuccess();
    await fetchItems({ sortBy: 'name', order: 'desc' });
    const url = capturedUrl();
    expect(url).toContain('sortBy=name');
    expect(url).toContain('order=desc');
  });

  it('appends page and limit as strings', async () => {
    mockFetchSuccess();
    await fetchItems({ page: 2, limit: 20 });
    const url = capturedUrl();
    expect(url).toContain('page=2');
    expect(url).toContain('limit=20');
  });

  it('omits undefined params from the URL', async () => {
    mockFetchSuccess();
    await fetchItems({ search: undefined, status: undefined });
    const url = capturedUrl();
    expect(url).not.toContain('search');
    expect(url).not.toContain('status');
  });

  it('omits empty string params from the URL', async () => {
    mockFetchSuccess();
    await fetchItems({ search: '', status: '' });
    const url = capturedUrl();
    expect(url).not.toContain('search');
    expect(url).not.toContain('status');
  });
});

describe('fetchItems — response handling', () => {
  it('returns parsed JSON on a 200 response', async () => {
    const mockData = { data: [], total: 0, page: 1, limit: 20, totalPages: 0, statusCounts: {} };
    mockFetchSuccess(mockData);
    const result = await fetchItems();
    expect(result).toEqual(mockData);
  });

  it('throws a descriptive error on a non-200 response', async () => {
    mockFetchFailure(404, 'Not Found');
    await expect(fetchItems()).rejects.toThrow('API error: 404 Not Found');
  });
});
