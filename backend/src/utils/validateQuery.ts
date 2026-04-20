import { Request } from 'express';
import { QueryParams } from '../services/query.service';

const VALID_SORT_FIELDS = ['id', 'name', 'createdOn'] as const;
const VALID_ORDER_VALUES = ['asc', 'desc'] as const;

export function validateQuery(req: Request): { params: QueryParams; errors: string[] } {
  const errors: string[] = [];
  const q = req.query;

  const params: QueryParams = {};

  // search
  if (q.search !== undefined) {
    params.search = String(q.search);
  }

  // status
  if (q.status !== undefined) {
    params.status = String(q.status);
  }

  // sortBy
  if (q.sortBy !== undefined) {
    const sortBy = String(q.sortBy);
    if (VALID_SORT_FIELDS.includes(sortBy as typeof VALID_SORT_FIELDS[number])) {
      params.sortBy = sortBy as QueryParams['sortBy'];
    } else {
      errors.push(`Invalid sortBy value: "${sortBy}". Must be one of: ${VALID_SORT_FIELDS.join(', ')}`);
    }
  }

  // order
  if (q.order !== undefined) {
    const order = String(q.order);
    if (VALID_ORDER_VALUES.includes(order as typeof VALID_ORDER_VALUES[number])) {
      params.order = order as QueryParams['order'];
    } else {
      errors.push(`Invalid order value: "${order}". Must be "asc" or "desc".`);
    }
  }

  // page
  if (q.page !== undefined) {
    const page = Number(q.page);
    if (!Number.isInteger(page) || page < 1) {
      errors.push(`Invalid page value: "${q.page}". Must be a positive integer.`);
    } else {
      params.page = page;
    }
  }

  // limit
  if (q.limit !== undefined) {
    const limit = Number(q.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      errors.push(`Invalid limit value: "${q.limit}". Must be an integer between 1 and 100.`);
    } else {
      params.limit = limit;
    }
  }

  return { params, errors };
}
