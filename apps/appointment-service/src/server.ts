import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'appointment-service', description: 'Appointment Scheduling & Queue', timestamp: new Date().toISOString() });
});

app.get('/api/v1/appointment', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the Appointment Scheduling & Queue' });
});

app.listen(port, () => {
  console.log(`[appointment-service]: Server is running at http://localhost:${port}`);
});
