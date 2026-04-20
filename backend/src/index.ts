import express from 'express';
import itemsRouter from './routes/items.route';
import { loadData } from './services/data.service';

const app = express();
const PORT = 8001;

app.use(express.json());

app.use('/items', itemsRouter);

// Startup: fetch + cache GCS data, then begin listening
loadData()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Backend running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to load data on startup:', err);
    process.exit(1);
  });
