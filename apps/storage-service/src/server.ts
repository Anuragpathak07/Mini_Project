import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5012;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'storage-service', description: 'File Upload & Secure S3 Abstraction', timestamp: new Date().toISOString() });
});

app.get('/api/v1/storage', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the File Upload & Secure S3 Abstraction' });
});

app.listen(port, () => {
  console.log(`[storage-service]: Server is running at http://localhost:${port}`);
});
