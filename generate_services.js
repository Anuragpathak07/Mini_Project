const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const services = [
  { name: 'appointment-service', port: 5002, desc: 'Appointment Scheduling & Queue' },
  { name: 'prescription-service', port: 5003, desc: 'Digital Prescriptions' },
  { name: 'notification-service', port: 5004, desc: 'Email/SMS/Push Notifications' },
  { name: 'communication-service', port: 5005, desc: 'Chat & Telemedicine' },
  { name: 'analytics-service', port: 5006, desc: 'Hospital Data & Analytics' },
  { name: 'search-service', port: 5007, desc: 'Fast Discovery & Search' },
  { name: 'event-service', port: 5008, desc: 'RabbitMQ Async Event Driver' },
  { name: 'cache-service', port: 5009, desc: 'Redis Cache Interface' },
  { name: 'audit-service', port: 5010, desc: 'HIPAA Activity Logs' },
  { name: 'integration-service', port: 5011, desc: 'External API Gateways' },
  { name: 'storage-service', port: 5012, desc: 'File Upload & Secure S3 Abstraction' }
];

const appsDir = path.join(__dirname, 'apps');
if (!fs.existsSync(appsDir)) fs.mkdirSync(appsDir);

services.forEach(service => {
  const serviceDir = path.join(appsDir, service.name);
  if (!fs.existsSync(serviceDir)) fs.mkdirSync(serviceDir);
  
  const srcDir = path.join(serviceDir, 'src');
  if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);

  // package.json
  const pkgJson = {
    name: service.name,
    version: "1.0.0",
    description: service.desc,
    main: "index.js",
    scripts: {
      "dev": "tsx watch src/server.ts",
      "build": "tsc",
      "start": "node dist/server.js"
    },
    dependencies: {
      "express": "^4.21.0",
      "cors": "^2.8.5",
      "dotenv": "^16.4.5",
      "zod": "^3.23.8"
    },
    devDependencies: {
      "typescript": "^5.6.2",
      "@types/node": "^22.5.4",
      "@types/express": "^4.17.21",
      "@types/cors": "^2.8.17",
      "tsx": "^4.19.1"
    }
  };
  fs.writeFileSync(path.join(serviceDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  // tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: "es2022",
      module: "commonjs",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      outDir: "./dist"
    },
    include: ["src/**/*"]
  };
  fs.writeFileSync(path.join(serviceDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));

  // server.ts
  const serverCode = `import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || ${service.port};

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: '${service.name}', description: '${service.desc}', timestamp: new Date().toISOString() });
});

app.get('/api/v1/${service.name.replace('-service', '')}', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the ${service.desc}' });
});

app.listen(port, () => {
  console.log(\`[${service.name}]: Server is running at http://localhost:\${port}\`);
});
`;
  fs.writeFileSync(path.join(srcDir, 'server.ts'), serverCode);
  console.log(`Generated ${service.name} on port ${service.port}`);
});

console.log('All services successfully scaffolded!');
