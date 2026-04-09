import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'notification-service', description: 'Email/SMS/Push Notifications', timestamp: new Date().toISOString() });
});

app.get('/api/v1/notification', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the Email/SMS/Push Notifications' });
});

app.listen(port, () => {
  console.log(`[notification-service]: Server is running at http://localhost:${port}`);
});
