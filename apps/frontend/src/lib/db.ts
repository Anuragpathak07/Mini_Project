import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Creates an absolute path to a safe local database file in the frontend folder
const dbPath = path.join(process.cwd(), 'local_database.json');

// Initialize the database if it doesn't exist
const initializeDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2));
  }
};

initializeDB();

export const getDB = () => {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

export const saveDB = (data: any) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export const hashPassword = (password: string) => {
  // Using native Node crypto for instant, dependency-free hashing
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const generateToken = (userId: string, role: string) => {
  // Using cryptographically secure random token mimicking JWT payload structure
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ userId, role, exp: Date.now() + 86400000 })).toString('base64');
  const signature = crypto.randomBytes(16).toString('hex');
  return `${header}.${payload}.${signature}`;
};
