import express from 'express';
import { getApplicationDetails, updateApplicationStatus } from '../controllers/applicationController.js';
import Application from '../models/Application.js';  // Ensure to import Application model
import { authMiddleware, agentRoleMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to get applications for a specific job
router.get('/:jobId/applications', authMiddleware, agentRoleMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if jobId is provided
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Fetch applications for this job and populate necessary fields
    const applications = await Application.find({ job: jobId })
      .populate('user', 'name email')  // Populate user details (name and email)
      .populate('profile', 'bio skills linkedin')  // Populate profile details (optional fields)
      .populate('job', 'title company location')  // Populate job details (optional fields)
      .exec();

    // If no applications found, return a 404 response
    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applicants found for this job.' });
    }

    // Return applications with populated user, profile, and job details
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
