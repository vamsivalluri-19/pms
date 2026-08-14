import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'PLACEMENT_MANAGER', 'COMPANY', 'STUDENT'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpire: Date,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// Student Schema
const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  phone: String,
  dob: Date,
  gender: String,
  address: String,
  photo: String,
  studentId: { type: String, required: true, unique: true },
  university: { type: String, default: 'PlaceTrack University' },
  college: String,
  degree: String, // B.Tech, MCA, MBA
  department: String, // CSE, IT, ECE
  batch: String, // 2022-2026
  graduationYear: Number,
  currentSemester: Number,
  cgpa: { type: Number, required: true, min: 0, max: 10 },
  tenthPercentage: { type: Number, min: 0, max: 100 },
  twelfthPercentage: { type: Number, min: 0, max: 100 },
  diplomaPercentage: { type: Number, min: 0, max: 100 },
  activeBacklogs: { type: Number, default: 0 },
  totalBacklogs: { type: Number, default: 0 },
  skills: [String],
  projects: [{
    title: String,
    description: String,
    repoLink: String,
    liveLink: String
  }],
  internships: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  certifications: [{
    name: String,
    issuingOrg: String,
    issueDate: Date,
    credentialUrl: String
  }],
  achievements: [String],
  github: String,
  linkedin: String,
  portfolio: String,
  resume: {
    fileName: String,
    fileUrl: String,
    uploadDate: Date,
    version: { type: Number, default: 1 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
  },
  documents: [{
    name: String, // 10th Certificate, 12th Certificate, ID Proof, etc.
    fileUrl: String,
    status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
    remarks: String
  }]
}, { timestamps: true });
studentSchema.index({ user: 1 }, { unique: true });

// Company Schema
const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  logo: String,
  website: String,
  industry: String,
  description: String,
  headquarters: String,
  locations: [String],
  size: String,
  foundedYear: Number,
  recruiterName: { type: String, required: true },
  recruiterEmail: { type: String, required: true },
  recruiterPhone: String,
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    default: 'PENDING'
  }
}, { timestamps: true });
companySchema.index({ user: 1 }, { unique: true });

// Placement Manager Schema
const placementManagerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  phone: String,
  department: String
}, { timestamps: true });
placementManagerSchema.index({ user: 1 }, { unique: true });

// Admin Schema
const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  phone: String,
  address: String
}, { timestamps: true });
adminSchema.index({ user: 1 }, { unique: true });

export const User = mongoose.model('User', userSchema);
export const Student = mongoose.model('Student', studentSchema);
export const Company = mongoose.model('Company', companySchema);
export const PlacementManager = mongoose.model('PlacementManager', placementManagerSchema);
export const Admin = mongoose.model('Admin', adminSchema);
