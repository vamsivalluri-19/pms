import express from 'express';
import {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  verifyOTP,
  resendOTP,
  googleLogin,
  googleRegister,
  getAuthProviders,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.get('/providers', getAuthProviders);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/google', googleLogin);
router.post('/google/register', googleRegister);

// Admin User Management CRUD endpoints
router.get('/users', protect, authorizeRoles('ADMIN'), getAllUsers);
router.put('/users/:id/status', protect, authorizeRoles('ADMIN'), toggleUserStatus);
router.delete('/users/:id', protect, authorizeRoles('ADMIN'), deleteUser);

// Password settings
router.put('/change-password', protect, changePassword);

export default router;
