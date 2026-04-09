import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory data store for the miniature microservice (Mock DB)
const hospitals = [
  { id: '1', name: 'Atelier Central', address: '123 Medical Way', totalBeds: 250, availableBeds: 45 },
  { id: '2', name: 'Atelier West Wing', address: '456 West Blvd', totalBeds: 120, availableBeds: 12 },
];

const departments = [
  { id: '1', hospitalId: '1', name: 'Cardiology', head: 'Dr. John Doe' },
  { id: '2', hospitalId: '1', name: 'Neurology', head: 'Dr. Sarah Smith' },
  { id: '3', hospitalId: '2', name: 'Orthopedics', head: 'Dr. Alice Johnson' },
];

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'hospital-service', timestamp: new Date().toISOString() });
});

// Get all hospitals
app.get('/api/v1/hospitals', (req: Request, res: Response) => {
  res.status(200).json({ hospitals });
});

// Get specific hospital by ID
app.get('/api/v1/hospitals/:id', (req: Request, res: Response) => {
  const hospital = hospitals.find(h => h.id === req.params.id);
  if (!hospital) {
    res.status(404).json({ error: 'Hospital not found' });
  } else {
    res.status(200).json({ hospital });
  }
});

// Get departments for a hospital
app.get('/api/v1/hospitals/:id/departments', (req: Request, res: Response) => {
  const depts = departments.filter(d => d.hospitalId === req.params.id);
  res.status(200).json({ departments: depts });
});

app.listen(port, () => {
  console.log(`[hospital-service]: Server is running at http://localhost:${port}`);
});
