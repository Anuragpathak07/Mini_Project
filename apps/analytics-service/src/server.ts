import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5006;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'analytics-service', description: 'Hospital Data & Analytics', timestamp: new Date().toISOString() });
});

app.get('/api/v1/analytics', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the Hospital Data & Analytics' });
});

app.listen(port, () => {
  console.log(`[analytics-service]: Server is running at http://localhost:${port}`);
});
