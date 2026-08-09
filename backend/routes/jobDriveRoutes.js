import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  createDrive,
  getDrives,
  getPublicDrives,
  getDriveById,
  updateDrive,
  approveDrive,
  createRound,
  getRounds,
  updateRound,
  deleteRound
} from '../controllers/jobDriveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Job routes
router.post('/jobs', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), createJob);
router.get('/jobs', protect, getJobs);
router.get('/jobs/:id', protect, getJobById);
router.put('/jobs/:id', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), updateJob);
router.delete('/jobs/:id', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), deleteJob);

// Drive routes
router.get('/drives/public', getPublicDrives);
router.post('/drives', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), createDrive);
router.get('/drives', protect, getDrives);
router.get('/drives/:id', protect, getDriveById);
router.put('/drives/:id', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), updateDrive);
router.put('/drives/:id/approve', protect, authorizeRoles('PLACEMENT_MANAGER', 'ADMIN'), approveDrive);

// Drive Round routes
router.post('/drives/:driveId/rounds', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), createRound);
router.get('/drives/:driveId/rounds', protect, getRounds);
router.put('/rounds/:id', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), updateRound);
router.delete('/rounds/:id', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), deleteRound);

export default router;
