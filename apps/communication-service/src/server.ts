import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'communication-service', description: 'Chat & Telemedicine', timestamp: new Date().toISOString() });
});

app.get('/api/v1/communication', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the Chat & Telemedicine' });
});

app.listen(port, () => {
  console.log(`[communication-service]: Server is running at http://localhost:${port}`);
});
