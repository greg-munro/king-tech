import { Router } from 'express';
import { getData } from '../services/data.service';
import { processQuery } from '../services/query.service';
import { validateQuery } from '../utils/validateQuery';

const router = Router();

router.get('/', (req, res) => {
  const { params, errors } = validateQuery(req);

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const items = getData();
  const result = processQuery(items, params);

  res.json(result);
});

export default router;
