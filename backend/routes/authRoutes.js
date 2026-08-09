import express from 'express';
import { register, login, refresh, forgotPassword, resetPassword, getAllUsers, toggleUserStatus, deleteUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Admin User Management CRUD endpoints
router.get('/users', protect, authorizeRoles('ADMIN'), getAllUsers);
router.put('/users/:id/status', protect, authorizeRoles('ADMIN'), toggleUserStatus);
router.delete('/users/:id', protect, authorizeRoles('ADMIN'), deleteUser);

export default router;
