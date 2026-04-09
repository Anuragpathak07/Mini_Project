const fs = require('fs');
const path = require('path');

const microservices = [
  'appointment-service', 'prescription-service', 'notification-service', 
  'communication-service', 'analytics-service', 'search-service', 
  'event-service', 'cache-service', 'audit-service', 'integration-service', 
  'storage-service', 'hospital-service'
];

const dockerfileTemplate = `FROM node:18-alpine

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install packages
RUN npm install

# Copy application source
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# Start the optimized artifact
CMD ["npm", "start"]
`;

const appsDir = path.join(__dirname, 'apps');

microservices.forEach(service => {
  const serviceDir = path.join(appsDir, service);
  if (fs.existsSync(serviceDir)) {
    fs.writeFileSync(path.join(serviceDir, 'Dockerfile'), dockerfileTemplate);
    
    // Create .dockerignore for hygiene
    const dockerignore = `node_modules
dist
.env
`;
    fs.writeFileSync(path.join(serviceDir, '.dockerignore'), dockerignore);
    console.log(`Generated Docker configs for: \${service}`);
  }
});
console.log('Automated microservice dockerization complete.');
