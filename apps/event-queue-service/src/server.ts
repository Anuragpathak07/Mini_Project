import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5008;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'event-queue-service', timestamp: new Date().toISOString() });
});

// Root metadata
app.get('/api/v1', (req: Request, res: Response) => {
  res.status(200).json({ 
    service: 'event-queue-service', 
    description: 'RabbitMQ based async communication' 
  });
});

app.listen(port, () => {
  console.log(`[event-queue-service]: Server is running at http://localhost:${port}`);
});
