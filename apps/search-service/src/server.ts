import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5007;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'search-service', description: 'Fast Discovery & Search', timestamp: new Date().toISOString() });
});

app.get('/api/v1/search', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the Fast Discovery & Search' });
});

app.listen(port, () => {
  console.log(`[search-service]: Server is running at http://localhost:${port}`);
});
