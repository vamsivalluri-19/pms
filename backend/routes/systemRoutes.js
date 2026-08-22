import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getAiRecommendations,
  analyzeStudentResume,
  chatbotQuery,
  getChatbotHistory,
  runMockInterview,
  getStudentDashboardStats,
  getCompanyDashboardStats,
  getManagerDashboardStats,
  getAdminDashboardStats,
  getAuditLogs,
  getPublicStats,
  getAcademicSettings,
  createAcademicSetting,
  deleteAcademicSetting,
  createStaffTicket,
  getStaffTickets,
  getPublicStaffVerify,
  getSystemSettings,
  updateSystemSettings,
  clearSystemCache,
  triggerSystemBackup
} from '../controllers/systemController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Notifications
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markAsRead);
router.put('/notifications/read-all', protect, markAllAsRead);

// AI features
router.post('/ai/chatbot', protect, chatbotQuery);
router.get('/ai/chatbot/history', protect, getChatbotHistory);
router.get('/ai/recommendations', protect, getAiRecommendations);
router.get('/ai/resume-analyzer', protect, analyzeStudentResume);
router.post('/ai/mock-interview', protect, runMockInterview);

// Statistics / Dashboards
router.get('/stats/public', getPublicStats);
router.get('/stats/student', protect, authorizeRoles('STUDENT'), getStudentDashboardStats);
router.get('/stats/company', protect, authorizeRoles('COMPANY'), getCompanyDashboardStats);
router.get('/stats/manager', protect, authorizeRoles('PLACEMENT_MANAGER'), getManagerDashboardStats);
router.get('/stats/admin', protect, authorizeRoles('ADMIN'), getAdminDashboardStats);

// Audit logs
router.get('/audit-logs', protect, authorizeRoles('ADMIN'), getAuditLogs);

// Academic settings configurations (Admin CRUD)
router.get('/academic-settings', protect, getAcademicSettings); // Publicly readable by logged in users
router.post('/academic-settings', protect, authorizeRoles('ADMIN'), createAcademicSetting);
router.delete('/academic-settings/:type/:id', protect, authorizeRoles('ADMIN'), deleteAcademicSetting);

// Global System Settings (Admin Only)
router.get('/system-settings', protect, getSystemSettings);
router.put('/system-settings', protect, authorizeRoles('ADMIN'), updateSystemSettings);
router.post('/system-settings/clear-cache', protect, authorizeRoles('ADMIN'), clearSystemCache);
router.post('/system-settings/backup', protect, authorizeRoles('ADMIN'), triggerSystemBackup);

// Staff Tickets
router.get('/staff-tickets/public/verify/:id', getPublicStaffVerify);
router.post('/staff-tickets', protect, authorizeRoles('PLACEMENT_MANAGER', 'ADMIN'), createStaffTicket);
router.get('/staff-tickets', protect, authorizeRoles('PLACEMENT_MANAGER', 'ADMIN'), getStaffTickets);

export default router;

