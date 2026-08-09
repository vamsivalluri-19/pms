import mongoose from 'mongoose';

// Notification Schema
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: { type: String, required: true }, // e.g. DRIVE_APPROVED, APPLICATION_STATUS, INTERVIEW_SCHEDULED
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: String
}, { timestamps: true });

// Message Schema (for chat histories)
const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: String,
    enum: ['USER', 'AI'],
    required: true
  },
  content: { type: String, required: true }
}, { timestamps: true });

// AuditLog Schema
const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: String,
  role: String,
  action: { type: String, required: true }, // e.g., Update Round Result
  entity: String, // e.g., RoundResult
  entityId: String,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
export const Message = mongoose.model('Message', messageSchema);
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
