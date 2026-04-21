import express from 'express';
import itemsRouter from './routes/items.route';

const app = express();
const PORT = 8001;

app.use(express.json());
app.use('/items', itemsRouter);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
