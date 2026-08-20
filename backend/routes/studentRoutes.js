import express from 'express';
import {
  getStudents,
  getStudentById,
  updateStudentProfile,
  uploadResume,
  uploadDocument,
  verifyDocument,
  uploadPhoto,
  getStudentProfileByUserId
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('PLACEMENT_MANAGER', 'ADMIN'), getStudents);
router.get('/user/:userId', protect, getStudentProfileByUserId);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, updateStudentProfile);

router.post('/photo', protect, authorizeRoles('STUDENT'), upload.single('photo'), uploadPhoto);
router.post('/resume', protect, authorizeRoles('STUDENT'), upload.single('resume'), uploadResume);
router.post('/documents', protect, authorizeRoles('STUDENT'), upload.single('document'), uploadDocument);
router.put('/:id/documents/verify', protect, authorizeRoles('PLACEMENT_MANAGER', 'ADMIN'), verifyDocument);

export default router;
