import express from 'express';
import {
  applyToDrive,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  submitRoundResult,
  scheduleInterview,
  getInterviews,
  createPlacement,
  getPlacements,
  updatePlacementStatus,
  uploadOfferLetter,
  getOffers,
  getPublicApplicationVerify,
  generateDriveTickets
} from '../controllers/recruitmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Application endpoints
router.post('/applications', protect, authorizeRoles('STUDENT'), applyToDrive);
router.get('/applications', protect, getApplications);
router.get('/applications/public/verify/:id', getPublicApplicationVerify);
router.get('/applications/:id', protect, getApplicationById);
router.put('/applications/:id/status', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), updateApplicationStatus);
router.post('/applications/drives/:driveId/generate-tickets', protect, authorizeRoles('PLACEMENT_MANAGER', 'ADMIN'), generateDriveTickets);

// Scorecard results endpoints
router.post('/results', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), submitRoundResult);

// Interview scheduling endpoints
router.post('/interviews', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), scheduleInterview);
router.get('/interviews', protect, getInterviews);

// Placements endpoints
router.post('/placements', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), createPlacement);
router.get('/placements', protect, getPlacements);
router.put('/placements/:id', protect, updatePlacementStatus);

// Offer Letters endpoints
router.post('/offers', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), upload.single('offer'), uploadOfferLetter);
router.get('/offers', protect, getOffers);

export default router;
