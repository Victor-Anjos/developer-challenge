import express from 'express';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});