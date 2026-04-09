FROM node:18-alpine

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
