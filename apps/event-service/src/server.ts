import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5008;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'event-service', description: 'RabbitMQ Async Event Driver', timestamp: new Date().toISOString() });
});

app.get('/api/v1/event', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the RabbitMQ Async Event Driver' });
});

app.listen(port, () => {
  console.log(`[event-service]: Server is running at http://localhost:${port}`);
});
