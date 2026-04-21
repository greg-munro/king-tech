import type { Request } from 'express';
import { validateQuery } from '../utils/validateQuery';

// Minimal mock — validateQuery only reads req.query
function mockReq(query: Record<string, string>): Request {
  return { query } as unknown as Request;
}

describe('validateQuery — valid params', () => {
  it('returns no errors and empty params when no query string', () => {
    const { params, errors } = validateQuery(mockReq({}));
    expect(errors).toHaveLength(0);
    expect(params).toEqual({});
  });

  it('accepts search string', () => {
    const { params, errors } = validateQuery(mockReq({ search: 'foo' }));
    expect(errors).toHaveLength(0);
    expect(params.search).toBe('foo');
  });

  it('accepts status string', () => {
    const { params, errors } = validateQuery(mockReq({ status: 'ACTIVE' }));
    expect(errors).toHaveLength(0);
    expect(params.status).toBe('ACTIVE');
  });

  it.each(['id', 'name', 'createdOn'])('accepts valid sortBy value: %s', (sortBy) => {
    const { params, errors } = validateQuery(mockReq({ sortBy }));
    expect(errors).toHaveLength(0);
    expect(params.sortBy).toBe(sortBy);
  });

  it.each(['asc', 'desc'])('accepts valid order value: %s', (order) => {
    const { params, errors } = validateQuery(mockReq({ order }));
    expect(errors).toHaveLength(0);
    expect(params.order).toBe(order);
  });

  it('accepts valid page', () => {
    const { params, errors } = validateQuery(mockReq({ page: '3' }));
    expect(errors).toHaveLength(0);
    expect(params.page).toBe(3);
  });

  it('accepts valid limit', () => {
    const { params, errors } = validateQuery(mockReq({ limit: '50' }));
    expect(errors).toHaveLength(0);
    expect(params.limit).toBe(50);
  });
});

describe('validateQuery — invalid params', () => {
  it('rejects invalid sortBy', () => {
    const { errors } = validateQuery(mockReq({ sortBy: 'delta' }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/sortBy/);
  });

  it('rejects invalid order', () => {
    const { errors } = validateQuery(mockReq({ order: 'random' }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/order/);
  });

  it('rejects page = 0', () => {
    const { errors } = validateQuery(mockReq({ page: '0' }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/page/);
  });

  it('rejects negative page', () => {
    const { errors } = validateQuery(mockReq({ page: '-1' }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/page/);
  });

  it('rejects non-integer page', () => {
    const { errors } = validateQuery(mockReq({ page: '1.5' }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/page/);
  });

  it('rejects limit = 0', () => {
    const { errors } = validateQuery(mockReq({ limit: '0' }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/limit/);
  });

  it('rejects limit > 100', () => {
    const { errors } = validateQuery(mockReq({ limit: '101' }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/limit/);
  });

  it('accumulates multiple errors in one response', () => {
    const { errors } = validateQuery(mockReq({ sortBy: 'delta', order: 'sideways', page: '0' }));
    expect(errors).toHaveLength(3);
  });
});
