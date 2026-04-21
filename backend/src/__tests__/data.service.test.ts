import type { Item } from '../services/data.service';

const mockItems: Item[] = [
  { id: 1, name: 'alpha', status: 'ACTIVE', description: 'desc', delta: 10, createdOn: 1000 },
  { id: 2, name: 'beta', status: 'COMPLETED', description: 'desc', delta: 20, createdOn: 2000 },
];

function mockFetchSuccess(items: Item[] = mockItems) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ output: items }),
  } as unknown as Response);
}

function mockFetchFailure(status = 500, statusText = 'Internal Server Error') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
  } as unknown as Response);
}

let getData: () => Promise<Item[]>;

beforeEach(() => {
  jest.resetModules();
  ({ getData } = require('../services/data.service'));
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getData', () => {
  it('calls fetch on every invocation', async () => {
    mockFetchSuccess();
    await getData();
    await getData();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('returns parsed items from GCS response', async () => {
    mockFetchSuccess();
    const items = await getData();
    expect(items).toEqual(mockItems);
  });

  it('throws with descriptive message when GCS returns non-200', async () => {
    mockFetchFailure(503, 'Service Unavailable');
    await expect(getData()).rejects.toThrow('Failed to fetch GCS data: 503 Service Unavailable');
  });
});
