import express from 'express';
import { getApplicationDetails, updateApplicationStatus } from '../controllers/applicationController.js';
import Application from '../models/Application.js';  // Ensure to import Application model
import { authMiddleware, agentRoleMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to get applications for a specific job
router.get('/:jobId/applications', authMiddleware, agentRoleMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Fetch applications for this job
    const applications = await Application.find({ job: jobId })
      .populate('user', 'name email')  // Ensure the user is populated with 'name' and 'email'
      .exec();

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applicants found for this job.' });
    }

    return res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to get application details (one specific application)
router.get('/:applicationId', authMiddleware, agentRoleMiddleware, getApplicationDetails);

// Route to update application status (Authenticated agent only)
router.put('/:applicationId/status', authMiddleware, agentRoleMiddleware, updateApplicationStatus);

export default router;
