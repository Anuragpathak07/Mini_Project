import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'prescription-service', description: 'Digital Prescriptions', timestamp: new Date().toISOString() });
});

app.get('/api/v1/prescription', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the Digital Prescriptions' });
});

app.listen(port, () => {
  console.log(`[prescription-service]: Server is running at http://localhost:${port}`);
});
