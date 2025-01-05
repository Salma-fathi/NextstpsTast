import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { getJobDetails } from './controllers/jobController.js';
import bodyParser from 'body-parser';
import helmet from 'helmet';  // For security headers
import multer from 'multer';  // Import multer for file uploads
import upload from './middlewares/upload.js';  // Import multer upload config
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import User  from './models/User.js';  // Corrected the import path with .js extension
import Application from './models/Application.js';  // Default import for Application

dotenv.config();
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(helmet());  // Add security headers

// Ensure the 'uploads' directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Uploads directory created');
}

// Resolve current directory path using import.meta.url for ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // Serve files in the uploads folder

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Serve static files (e.g., images, CSS, JS) from the frontend folder
const frontendPath = path.resolve('C:/Users/misre/OneDrive/سطح المكتب/traiing/frontend');
app.use(express.static(frontendPath));

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);  // Job-related routes
app.use('/api/applications', applicationRoutes);  // Application-related routes

// Middleware for handling file upload (Profile Image)
const multerUpload = multer({ dest: 'uploads/' });  // Set destination for multer uploads

app.post('/api/profile/upload', multerUpload.single('profileImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Normalize file path (convert backslashes to forward slashes)
  const filePath = req.file.path.replace(/\\/g, '/'); // Replacing backslashes with forward slashes

  // Save file path in database (ensure that the file path is saved with forward slashes)
  User.updateOne({ _id: req.user._id }, { $set: { profileImage: filePath } })
    .then(() => res.status(200).json({ message: 'Profile image uploaded successfully.' }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Middleware for handling file upload (Resume for Job Application)
app.post('/api/applications/:jobId/apply', multerUpload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Resume is required.' });
  }

  // Normalize file path for resume
  const resumePath = req.file.path.replace(/\\/g, '/'); // Replacing backslashes with forward slashes

  const newApplication = new Application({
    job: req.params.jobId,  // Assuming jobId comes from the route parameters
    user: req.user._id,     // Assuming user ID comes from authenticated user
    resume: resumePath,     // Store the normalized resume file path
    status: 'applied',
  });

  await newApplication.save();
  return res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
});

// Route to view job details
app.get('/api/jobs/:jobId', getJobDetails);

// Catch-all route for serving index.html for single-page app routing
app.get('*', (req, res) => {
  const indexPath = path.resolve(frontendPath, 'index.html');
  console.log('Serving index.html from:', indexPath);
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
