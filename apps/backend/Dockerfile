FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
