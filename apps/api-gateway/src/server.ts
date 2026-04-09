import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

// Health Check for the Gateway itself
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Configure Proxy Routes mapping to the internal microservices
const serviceRoutes = [
  // New Microservices
  { context: '/api/v1/hospitals', target: 'http://localhost:5001' },
  { context: '/api/v1/appointment', target: 'http://localhost:5002' },
  { context: '/api/v1/prescription', target: 'http://localhost:5003' },
  { context: '/api/v1/notification', target: 'http://localhost:5004' },
  { context: '/api/v1/communication', target: 'http://localhost:5005' },
  { context: '/api/v1/analytics', target: 'http://localhost:5006' },
  { context: '/api/v1/search', target: 'http://localhost:5007' },
  { context: '/api/v1/event', target: 'http://localhost:5008' },
  { context: '/api/v1/cache', target: 'http://localhost:5009' },
  { context: '/api/v1/audit', target: 'http://localhost:5010' },
  { context: '/api/v1/integration', target: 'http://localhost:5011' },
  { context: '/api/v1/storage', target: 'http://localhost:5012' },
  
  // Connect raw AI fastAPI backend
  { context: '/ai', target: 'http://localhost:8000', pathRewrite: { '^/ai': '' } },
  
  // Legacy Monolith fallback for Core logic until fully migrated
  { context: '/api/v1', target: 'http://localhost:5000' }
];

// Apply proxies
serviceRoutes.forEach(({ context, target, pathRewrite }) => {
  app.use(context, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    logger: console
  }));
});

app.listen(port, () => {
  console.log(`[api-gateway]: Gateway is routing traffic securely on http://localhost:${port}`);
  console.log(`[api-gateway]: All external client traffic should hit Port ${port} from now on.`);
});
