import express from 'express';
import itemsRouter from './routes/items.route';
import { getData } from './services/data.service';

const app = express();
const PORT = 8001;

app.use(express.json());

app.use('/items', itemsRouter);

// Warm cache on startup before accepting requests
getData()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Backend running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to load data on startup:', err);
    process.exit(1);
  });
