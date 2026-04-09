import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5011;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'integration-service', description: 'External API Gateways', timestamp: new Date().toISOString() });
});

app.get('/api/v1/integration', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the External API Gateways' });
});

app.listen(port, () => {
  console.log(`[integration-service]: Server is running at http://localhost:${port}`);
});
