import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware.js'; // Correct import path

const router = express.Router();

// Example route protected by authentication
router.get('/profile', authMiddleware, (req, res) => {
  // Logic to return the profile data
  res.json({ message: 'Profile data' });
});

// Example route protected by authentication and role (for seekers)
router.get('/seeker-profile', authMiddleware, roleMiddleware('seeker'), (req, res) => {
  // Logic to return seeker profile data
  res.json({ message: 'Seeker Profile data' });
});

export default router;
