import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import fs from 'fs';
import path from 'path';
import { updateApplicationStatus } from './controllers/applicationController.js';
import bodyParser from 'body-parser';
import multer from 'multer';  // For handling file uploads
import helmet from 'helmet';  // For security headers
import { getJobDetails } from './controllers/jobController.js';

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
app.use(helmet());  // Add security headers

// Serve static files from the frontend folder
app.use(express.static(frontendPath));  // Serve static files (js, css, images) from the frontend folder

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Uploads directory created');
}

// File upload handling using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
  },
});

const upload = multer({ storage });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
//app.put('/api/applications/:applicationId/status', updateApplicationStatus);
app.use('/applications', applicationRoutes);
// Profile route with file upload
app.post('/api/profile', upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), (req, res) => {
  // Your createProfile logic here
});
app.get('/api/jobs/:jobId', getJobDetails);

// Catch-all route for serving index.html for single-page app routing
app.get('*', (req, res) => {
  const indexPath = path.resolve(frontendPath, 'index.html');
  console.log('Serving index.html from:', indexPath);  // Log the resolved index.html path
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.log('Error serving index.html:', err);
      res.status(500).send({ message: 'Internal server error' });
    }
  });
});

// Error handling middleware for catch-all API routes
app.use((err, req, res, next) => {
  const status = err.name && err.name === 'ValidationError' ? 400 : 500;
  res.status(status).send({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
