import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js'; // Auth routes including forgot-password, reset-password
import profileRoutes from './routes/profile.js'; // Profile routes

dotenv.config();
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json()); // Use express.json() instead of body-parser

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);  // Auth routes
app.use('/api/profile', profileRoutes);  // Profile routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
