import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import jobRoutes from './routes/jobRoutes.js';
import fs from 'fs';
import path from 'path';
import { updateApplicationStatus } from './controllers/applicationController.js';
import bodyParser from 'body-parser';

// Manually create __dirname equivalent for ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Explicitly resolve the absolute path for the frontend folder
const frontendPath = path.resolve('C:/Users/misre/OneDrive/سطح المكتب/traiing/frontend');  // Absolute path to frontend directory

// Log the frontend path to verify it's resolved correctly
console.log('Frontend path:', frontendPath);  // Ensure the path is correct

dotenv.config();
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Serve static files from the frontend folder
app.use(express.static(frontendPath));  // Serve static files (js, css, images) from the frontend folder

// Catch-all route for single-page app routing (e.g., index.html)
app.get('*', (req, res) => {
  // Resolve the full path to index.html correctly
  const indexPath = path.resolve(frontendPath, 'index.html');
  console.log('Serving index.html from:', indexPath);  // Log the resolved index.html path
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.log('Error serving index.html:', err);
      res.status(500).send({ message: 'Internal server error' });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.name && err.name === 'ValidationError' ? 400 : 500;
  res.status(status).send({ message: err.message });
});

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Uploads directory created');
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.put('/api/applications/:applicationId/status', updateApplicationStatus);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
