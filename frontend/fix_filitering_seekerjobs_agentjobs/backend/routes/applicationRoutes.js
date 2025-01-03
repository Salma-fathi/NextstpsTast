import express from 'express';
import { getApplicationDetails, updateApplicationStatus } from '../controllers/applicationController.js';
import { authMiddleware, agentRoleMiddleware } from '../middlewares/authMiddleware.js'; 

const router = express.Router();
// Route to get application details
router.get('/:applicationId', authMiddleware, agentRoleMiddleware, getApplicationDetails);

// Route to update application status (Authenticated agent only)
router.put('/:applicationId/status', authMiddleware, agentRoleMiddleware, updateApplicationStatus);

export default router;
