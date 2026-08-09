import mongoose from 'mongoose';

// Job Schema
const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  responsibilities: { type: String },
  requiredSkills: [String],
  preferredSkills: [String],
  jobType: {
    type: String,
    enum: ['Full Time', 'Internship', 'Internship + Full Time', 'Contract'],
    required: true
  },
  location: String,
  workMode: {
    type: String,
    enum: ['Onsite', 'Remote', 'Hybrid'],
    required: true
  },
  ctc: { type: Number, required: true }, // CTC in LPA, e.g., 8.5
  salaryRange: String,
  variablePay: Number,
  experience: String,
  vacancies: Number
}, { timestamps: true });

// Drive Schema
const driveSchema = new mongoose.Schema({
  name: { type: String, required: true },
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
  description: { type: String, required: true },
  driveDate: { type: Date, required: true },
  registrationStart: { type: Date, required: true },
  registrationEnd: { type: Date, required: true },
  location: String,
  mode: {
    type: String,
    enum: ['Onsite', 'Remote', 'Hybrid'],
    required: true
  },
  vacancies: Number,
  eligibilityCriteria: {
    minCgpa: { type: Number, default: 0 },
    minTenthPercentage: { type: Number, default: 0 },
    minTwelfthPercentage: { type: Number, default: 0 },
    maxBacklogs: { type: Number, default: 0 },
    allowedDepartments: [String], // e.g. ["CSE", "IT"]
    allowedDegrees: [String], // e.g. ["B.Tech", "MCA"]
    allowedGraduationYears: [Number], // e.g. [2026]
    genderRestriction: { type: String, default: 'All' }
  },
  selectionProcess: [String],
  status: {
    type: String,
    enum: [
      'Draft',
      'Pending Approval',
      'Approved',
      'Upcoming',
      'Registration Open',
      'Registration Closed',
      'In Progress',
      'Completed',
      'Cancelled'
    ],
    default: 'Draft'
  }
}, { timestamps: true });

// Drive Round Schema
const driveRoundSchema = new mongoose.Schema({
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  roundNumber: { type: Number, required: true },
  roundName: { type: String, required: true },
  roundType: {
    type: String,
    enum: [
      'Registration',
      'Aptitude Test',
      'Coding Test',
      'Technical Test',
      'Communication Test',
      'Group Discussion',
      'Case Study',
      'Presentation',
      'Technical Interview',
      'Managerial Interview',
      'HR Interview',
      'Assessment',
      'Other'
    ],
    required: true
  },
  description: String,
  date: Date,
  startTime: String,
  endTime: String,
  duration: Number, // in minutes
  location: String,
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    required: true
  },
  maxScore: { type: Number, default: 100 },
  passingScore: { type: Number, default: 40 },
  instructions: String,
  meetingLink: String,
  venue: String,
  contactPerson: String,
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
}, { timestamps: true });

export const Job = mongoose.model('Job', jobSchema);
export const Drive = mongoose.model('Drive', driveSchema);
export const DriveRound = mongoose.model('DriveRound', driveRoundSchema);
