import mongoose from 'mongoose';

// Application Schema
const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  resume: {
    fileName: String,
    fileUrl: String
  },
  appliedDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Rejected',
      'In Progress',
      'Selected',
      'Not Selected',
      'Withdrawn'
    ],
    default: 'Applied'
  },
  currentRound: { type: Number, default: 1 },
  remarks: String,
  hallTicketGenerated: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure student can apply to a drive only once
applicationSchema.index({ student: 1, drive: 1 }, { unique: true });

// Round Result Schema
const roundResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  round: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DriveRound',
    required: true
  },
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 100 },
  percentage: { type: Number, default: 0 },
  result: {
    type: String,
    enum: ['Pass', 'Fail', 'Absent', 'Pending', 'On Hold'],
    default: 'Pending'
  },
  remarks: String,
  evaluator: String,
  updatedDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Interview Schema
const interviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  round: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DriveRound',
    required: true
  },
  interviewer: String,
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 30 }, // in minutes
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    required: true
  },
  location: String,
  meetingLink: String,
  notes: String,
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled'
  }
}, { timestamps: true });

// Placement Schema
const placementSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  package: { type: Number, required: true }, // CTC in LPA, e.g. 10.5
  baseSalary: Number,
  variableSalary: Number,
  location: String,
  joiningDate: Date,
  offerDate: Date,
  offerStatus: {
    type: String,
    enum: ['Offer Received', 'Offer Accepted', 'Offer Rejected'],
    default: 'Offer Received'
  },
  placementStatus: {
    type: String,
    enum: ['Selected', 'Joined', 'Not Joined'],
    default: 'Selected'
  }
}, { timestamps: true });

// Offer Schema
const offerSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  offerLetter: String, // File URL
  joiningLetter: String, // File URL
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Application = mongoose.model('Application', applicationSchema);
export const RoundResult = mongoose.model('RoundResult', roundResultSchema);
export const Interview = mongoose.model('Interview', interviewSchema);
export const Placement = mongoose.model('Placement', placementSchema);
export const Offer = mongoose.model('Offer', offerSchema);
