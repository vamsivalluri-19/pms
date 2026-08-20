import express from 'express';
import { getChatContacts, getChatMessages, sendChatMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/contacts', protect, getChatContacts);
router.get('/messages/:contactId', protect, getChatMessages);
router.post('/messages', protect, sendChatMessage);

export default router;
