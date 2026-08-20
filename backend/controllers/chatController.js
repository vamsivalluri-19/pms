import { ChatMessage } from '../models/System.js';
import { User } from '../models/User.js';
import { sendRealTimeChatMessage, broadcastGroupMessage } from '../services/socketService.js';

// @desc    Get contacts list for P2P/Support chat
// @route   GET /api/chat/contacts
// @access  Private
export const getChatContacts = async (req, res) => {
  try {
    const contacts = await User.find(
      { _id: { $ne: req.user._id } },
      'name email role'
    ).sort('name');

    return res.json({ success: true, contacts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve contacts' });
  }
};

// @desc    Get chat message logs with a specific receiver
// @route   GET /api/chat/messages/:contactId
// @access  Private
export const getChatMessages = async (req, res) => {
  const { contactId } = req.params;
  const currentUserId = req.user._id;

  try {
    let messages;
    if (contactId === 'group-chat') {
      messages = await ChatMessage.find({ receiver: null })
        .populate('sender', 'name email role')
        .sort('createdAt');
    } else {
      messages = await ChatMessage.find({
        $or: [
          { sender: currentUserId, receiver: contactId },
          { sender: contactId, receiver: currentUserId }
        ]
      }).sort('createdAt');

      // Mark incoming messages as read
      await ChatMessage.updateMany(
        { sender: contactId, receiver: currentUserId, isRead: false },
        { isRead: true }
      );
    }

    return res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
};

// @desc    Send a chat message to a recipient user
// @route   POST /api/chat/messages
// @access  Private
export const sendChatMessage = async (req, res) => {
  const { receiverId, message } = req.body;
  const senderId = req.user._id;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message body is required' });
  }

  try {
    let chatMsg;
    if (receiverId === 'group-chat') {
      chatMsg = await ChatMessage.create({
        sender: senderId,
        receiver: null, // receiver is null for group chat
        message
      });

      // Populate sender coordinates before broadcasting
      await chatMsg.populate('sender', 'name email role');

      // Broadcast group message
      broadcastGroupMessage(senderId, chatMsg);
    } else {
      chatMsg = await ChatMessage.create({
        sender: senderId,
        receiver: receiverId,
        message
      });

      // Send the message in real-time over websockets
      sendRealTimeChatMessage(receiverId, senderId, chatMsg);
    }

    return res.status(201).json({ success: true, message: chatMsg });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to send chat message' });
  }
};
