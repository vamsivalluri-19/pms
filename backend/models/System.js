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

// StaffTicket Schema
const staffTicketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  staffId: { type: String, required: true },
  role: { type: String, required: true }, // e.g. Co-ordinator, Volunteer, Invigilator, Admin Officer
  phone: String,
  email: String,
  driveName: String
}, { timestamps: true });

export const StaffTicket = mongoose.model('StaffTicket', staffTicketSchema);

// ChatMessage Schema (for peer-to-peer and support chat)
const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// Global System Settings Schema
const systemSettingsSchema = new mongoose.Schema({
  institutionName: { type: String, default: 'PlaceTrack Institutional Control Centre' },
  adminEmail: { type: String, default: 'admin@institution.edu' },
  allowStudentRegistration: { type: Boolean, default: true },
  allowRecruiterRegistration: { type: Boolean, default: true },
  requireRecruiterApproval: { type: Boolean, default: true },
  sessionTimeoutMinutes: { type: Number, default: 60 },
  maxLoginAttempts: { type: Number, default: 5 },
  enable2FA: { type: Boolean, default: false },
  strictPasswordPolicy: { type: Boolean, default: true },
  emailNotificationsEnabled: { type: Boolean, default: true },
  systemAnnouncement: { type: String, default: 'Placement Drive Season 2026 is active. Ensure all student profiles are updated.' },
  minCgpaDefault: { type: Number, default: 6.5 },
  maxBacklogsDefault: { type: Number, default: 0 },
  maxOffersPerStudent: { type: Number, default: 2 },
  autoBackupSchedule: { type: String, default: 'Daily (02:00 AM)' },
  maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

