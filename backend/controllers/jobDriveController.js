import { Job, Drive, DriveRound } from '../models/JobDrive.js';
import { Company, Student, User } from '../models/User.js';
import { logAuditEvent } from '../middleware/auditMiddleware.js';
import { createAndSendNotification } from '../services/notificationService.js';
import { Notification } from '../models/System.js';
import { sendRealTimeNotification } from '../services/socketService.js';

// ==================== JOB CONTROLLERS ====================

export const createJob = async (req, res) => {
  try {
    let companyId = req.body.company;

    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (!company) {
        return res.status(404).json({ success: false, message: 'Recruiter company profile not found' });
      }
      companyId = company._id;
    }

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const job = await Job.create({
      ...req.body,
      company: companyId
    });

    return res.status(201).json({ success: true, message: 'Job posting created', job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to create job posting' });
  }
};

export const getJobs = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (company) {
        query.company = company._id;
      }
    }
    const jobs = await Job.find(query).populate('company', 'name logo verificationStatus');
    return res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve jobs' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', 'name logo website industry headquarters description');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.json({ success: true, job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Role check: Recruiter can only modify their own company's jobs
    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (!company || job.company.toString() !== company._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized job edit' });
      }
    }

    job = await Job.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    return res.json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update job' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (!company || job.company.toString() !== company._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized job deletion' });
      }
    }

    await Job.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Job post deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to delete job' });
  }
};

// ==================== DRIVE CONTROLLERS ====================

export const createDrive = async (req, res) => {
  try {
    let companyId = req.body.company;

    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (!company) {
        return res.status(404).json({ success: false, message: 'Company profile not found' });
      }
      companyId = company._id;
    }

    const drive = await Drive.create({
      ...req.body,
      company: companyId,
      status: req.user.role === 'COMPANY' ? 'Pending Approval' : 'Approved'
    });

    return res.status(201).json({ success: true, message: 'Placement drive created successfully', drive });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to create drive' });
  }
};

export const getDrives = async (req, res) => {
  try {
    let query = {};
    const { status, company } = req.query;

    if (status) query.status = status;
    if (company) query.company = company;

    if (req.user && req.user.role === 'COMPANY') {
      const recruiterCompany = await Company.findOne({ user: req.user._id });
      if (recruiterCompany) {
        query.company = recruiterCompany._id;
      }
    }

    const drives = await Drive.find(query)
      .populate('company', 'name logo verificationStatus')
      .populate('job', 'title ctc location jobType');

    return res.json({ success: true, count: drives.length, drives });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve drives' });
  }
};

export const getPublicDrives = async (req, res) => {
  try {
    const drives = await Drive.find({ status: 'Approved' })
      .populate('company', 'name logo verificationStatus')
      .populate('job', 'title ctc location jobType')
      .limit(3);
    return res.json({ success: true, count: drives.length, drives });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve public drives' });
  }
};

export const getDriveById = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id)
      .populate('company', 'name logo website headquarters description industry')
      .populate('job');

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }

    const rounds = await DriveRound.find({ drive: drive._id }).sort('roundNumber');

    // Run core Eligibility Engine for student requesting details
    let eligibility = { eligible: true, reasons: [] };

    if (req.user && req.user.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        const criteria = drive.eligibilityCriteria;
        
        if (student.cgpa < criteria.minCgpa) {
          eligibility.eligible = false;
          eligibility.reasons.push(`CGPA is ${student.cgpa}, minimum required is ${criteria.minCgpa}`);
        }
        if (student.tenthPercentage < criteria.minTenthPercentage) {
          eligibility.eligible = false;
          eligibility.reasons.push(`10th score is ${student.tenthPercentage}%, minimum required is ${criteria.minTenthPercentage}%`);
        }
        if (student.twelfthPercentage < criteria.minTwelfthPercentage) {
          eligibility.eligible = false;
          eligibility.reasons.push(`12th score is ${student.twelfthPercentage}%, minimum required is ${criteria.minTwelfthPercentage}%`);
        }
        if (student.activeBacklogs > criteria.maxBacklogs) {
          eligibility.eligible = false;
          eligibility.reasons.push(`Active backlogs: ${student.activeBacklogs}, maximum allowed is ${criteria.maxBacklogs}`);
        }
        if (criteria.allowedDepartments && criteria.allowedDepartments.length > 0) {
          if (!criteria.allowedDepartments.includes(student.department)) {
            eligibility.eligible = false;
            eligibility.reasons.push(`Department is ${student.department}. Allowed: ${criteria.allowedDepartments.join(', ')}`);
          }
        }
        if (criteria.allowedDegrees && criteria.allowedDegrees.length > 0) {
          if (!criteria.allowedDegrees.includes(student.degree)) {
            eligibility.eligible = false;
            eligibility.reasons.push(`Degree is ${student.degree}. Allowed: ${criteria.allowedDegrees.join(', ')}`);
          }
        }
        if (criteria.allowedGraduationYears && criteria.allowedGraduationYears.length > 0) {
          if (!criteria.allowedGraduationYears.includes(student.graduationYear)) {
            eligibility.eligible = false;
            eligibility.reasons.push(`Graduation year is ${student.graduationYear}. Allowed: ${criteria.allowedGraduationYears.join(', ')}`);
          }
        }
      } else {
        eligibility.eligible = false;
        eligibility.reasons.push('Academic profile has not been configured. Complete your profile fields first.');
      }
    }

    return res.json({ success: true, drive, rounds, eligibility });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateDrive = async (req, res) => {
  try {
    let drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (!company || drive.company.toString() !== company._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized drive modification' });
      }
    }

    drive = await Drive.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    return res.json({ success: true, message: 'Drive updated successfully', drive });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update drive' });
  }
};

export const approveDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id).populate('job');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    const oldStatus = drive.status;
    drive.status = req.body.status || 'Approved';
    await drive.save();

    await logAuditEvent(req, {
      action: 'Verify Placement Drive',
      entity: 'Drive',
      entityId: drive._id.toString(),
      oldValue: { status: oldStatus },
      newValue: { status: drive.status }
    });

    // Notify company & students if drive is approved
    if (drive.status === 'Approved') {
      // 1. Notify recruiter
      const company = await Company.findById(drive.company);
      if (company) {
        await createAndSendNotification({
          recipientId: company.user,
          senderId: req.user._id,
          type: 'DRIVE_APPROVED',
          title: 'Placement Drive Approved',
          message: `Your placement drive "${drive.name}" has been approved by the Placement Cell. Students can now view and apply.`,
          link: `/company/drives`
        });
      }

      // 2. Notify all students using bulk insert & async background processing to support 1,000,000+ users
      const students = await Student.find().select('user');
      const notificationDocs = students.map(student => ({
        recipient: student.user,
        sender: req.user._id,
        type: 'DRIVE_NEW',
        title: 'New Placement Drive Posted',
        message: `A new placement drive "${drive.name}" is open for registration. Deadline: ${new Date(drive.registrationEnd).toLocaleDateString()}.`,
        link: `/student/drives`
      }));

      if (notificationDocs.length > 0) {
        await Notification.insertMany(notificationDocs);
      }

      // Defer WebSockets & email dispatches to background tasks so server response is instant
      process.nextTick(() => {
        students.forEach(async (student) => {
          try {
            sendRealTimeNotification(student.user, {
              type: 'DRIVE_NEW',
              title: 'New Placement Drive Posted',
              message: `A new placement drive "${drive.name}" is open for registration.`
            });
          } catch (e) {
            console.error(e);
          }
        });
      });
    }

    return res.json({ success: true, message: `Drive status updated to ${drive.status}`, drive });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update drive status' });
  }
};

// ==================== ROUND CONTROLLERS ====================

export const createRound = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.driveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    const round = await DriveRound.create({
      ...req.body,
      drive: req.params.driveId
    });

    return res.status(201).json({ success: true, message: 'Recruitment round added', round });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to add round' });
  }
};

export const getRounds = async (req, res) => {
  try {
    const rounds = await DriveRound.find({ drive: req.params.driveId }).sort('roundNumber');
    return res.json({ success: true, count: rounds.length, rounds });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve rounds' });
  }
};

export const updateRound = async (req, res) => {
  try {
    const round = await DriveRound.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }
    return res.json({ success: true, message: 'Round details updated', round });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update round details' });
  }
};

export const deleteRound = async (req, res) => {
  try {
    const round = await DriveRound.findByIdAndDelete(req.params.id);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }
    return res.json({ success: true, message: 'Round deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to delete round' });
  }
};
