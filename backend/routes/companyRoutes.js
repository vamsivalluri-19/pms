import express from 'express';
import {
  getCompanies,
  getCompanyById,
  updateCompanyProfile,
  approveCompany
} from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getCompanies);
router.get('/:id', protect, getCompanyById);
router.put('/:id', protect, authorizeRoles('COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'), updateCompanyProfile);
router.put('/:id/approve', protect, authorizeRoles('PLACEMENT_MANAGER', 'ADMIN'), approveCompany);

export default router;
