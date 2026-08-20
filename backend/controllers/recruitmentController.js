import mongoose from 'mongoose';
import { Application, RoundResult, Interview, Placement, Offer } from '../models/Recruitment.js';
import { Student, Company } from '../models/User.js';
import { Drive, DriveRound } from '../models/JobDrive.js';
import { logAuditEvent } from '../middleware/auditMiddleware.js';
import { sendRealTimeNotification } from '../services/socketService.js';
import { Notification } from '../models/System.js';
import { createAndSendNotification } from '../services/notificationService.js';

// ==================== APPLICATION CONTROLLERS ====================

export const applyToDrive = async (req, res) => {
  const { driveId } = req.body;

  try {
    // 1. Get student profile
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found. Please setup profile.' });
    }

    // 2. Get placement drive
    const drive = await Drive.findById(driveId).populate('job');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    // 3. Double-check registration window
    const now = new Date();
    if (now < drive.registrationStart || now > drive.registrationEnd) {
      return res.status(400).json({ success: false, message: 'Registration window is closed for this drive.' });
    }

    // 4. Double-check Eligibility Engine
    const criteria = drive.eligibilityCriteria;
    let eligible = true;
    let reasons = [];

    if (student.cgpa < criteria.minCgpa) {
      eligible = false;
      reasons.push(`CGPA is ${student.cgpa}, minimum is ${criteria.minCgpa}`);
    }
    if (student.activeBacklogs > criteria.maxBacklogs) {
      eligible = false;
      reasons.push(`Active backlogs: ${student.activeBacklogs}, max allowed: ${criteria.maxBacklogs}`);
    }
    if (criteria.allowedDepartments && criteria.allowedDepartments.length > 0 && !criteria.allowedDepartments.includes(student.department)) {
      eligible = false;
      reasons.push(`Department ${student.department} is not permitted.`);
    }

    if (!eligible) {
      return res.status(400).json({
        success: false,
        message: 'You do not meet the eligibility criteria for this drive.',
        reasons
      });
    }

    // 5. Create application
    const application = await Application.create({
      student: student._id,
      company: drive.company,
      job: drive.job._id,
      drive: drive._id,
      resume: {
        fileName: student.resume?.fileName || 'default_resume.pdf',
        fileUrl: student.resume?.fileUrl || ''
      },
      status: 'Applied',
      currentRound: 1
    });

    // Create system notification for Recruiter
    const recruiterUser = await Company.findById(drive.company).select('user');
    if (recruiterUser) {
      await createAndSendNotification({
        recipientId: recruiterUser.user,
        senderId: req.user._id,
        type: 'APPLICATION_NEW',
        title: 'New Student Application',
        message: `${student.name} applied for your drive: ${drive.name}`,
        link: `/company/applications`
      });
    }

    return res.status(201).json({ success: true, message: 'Applied to placement drive successfully', application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this placement drive.' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Application submission failed.' });
  }
};

export const getApplications = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        query.student = student._id;
      }
    } else if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (company) {
        query.company = company._id;
      }
    }

    const { driveId, status } = req.query;
    if (driveId) query.drive = driveId;
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('student', 'name studentId cgpa department batch resume')
      .populate('company', 'name logo')
      .populate('job', 'title ctc location')
      .populate('drive', 'name driveDate status');

    return res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve applications' });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student')
      .populate('company', 'name logo website recruiterName recruiterEmail recruiterPhone')
      .populate('job')
      .populate('drive');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application details not found' });
    }

    // Compile recruitment timeline
    const roundResults = await RoundResult.find({
      student: application.student._id,
      drive: application.drive._id
    }).populate('round', 'roundNumber roundName roundType');

    const interviews = await Interview.find({
      student: application.student._id,
      drive: application.drive._id
    }).populate('round', 'roundNumber roundName');

    const placements = await Placement.find({
      student: application.student._id,
      drive: application.drive._id
    });

    return res.json({
      success: true,
      application,
      timeline: {
        roundResults,
        interviews,
        placements: placements[0] || null
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error retrieving application tracking details' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { status, remarks } = req.body;

  try {
    const application = await Application.findById(req.params.id).populate('student');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const oldStatus = application.status;
    application.status = status;
    if (remarks) application.remarks = remarks;
    await application.save();

    // Alert the student
    const studentUser = await Student.findById(application.student._id).select('user');
    if (studentUser) {
      await createAndSendNotification({
        recipientId: studentUser.user,
        senderId: req.user._id,
        type: 'APPLICATION_STATUS',
        title: 'Application Status Update',
        message: `Your application status has been changed to: ${status}`,
        link: `/student/applications`
      });
    }

    await logAuditEvent(req, {
      action: 'Update Application Status',
      entity: 'Application',
      entityId: application._id.toString(),
      oldValue: { status: oldStatus },
      newValue: { status }
    });

    return res.json({ success: true, message: `Application status updated to ${status}`, application });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// ==================== ROUND RESULTS CONTROLLERS ====================

export const submitRoundResult = async (req, res) => {
  const { studentId, driveId, roundId, score, maxScore, result, remarks } = req.body;

  try {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    const round = await DriveRound.findById(roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Drive round not found' });
    }

    // 1. Create/Update result
    const roundResult = await RoundResult.findOneAndUpdate(
      { student: studentId, drive: driveId, round: roundId },
      {
        score,
        maxScore,
        percentage,
        result,
        remarks,
        evaluator: req.user.email,
        updatedDate: new Date()
      },
      { upsert: true, new: true }
    );

    // 2. Fetch the corresponding application to update its progress
    const application = await Application.findOne({ student: studentId, drive: driveId });
    if (application) {
      if (result === 'Pass') {
        // Automatically promote to next round
        application.currentRound = round.roundNumber + 1;
        application.status = 'In Progress';
        await application.save();
      } else if (result === 'Fail') {
        application.status = 'Rejected';
        await application.save();
      }
    }

    // 3. Notify student
    const student = await Student.findById(studentId);
    if (student) {
      await createAndSendNotification({
        recipientId: student.user,
        senderId: req.user._id,
        type: 'ROUND_RESULT',
        title: `Round Result: ${round.roundName}`,
        message: `Your result for ${round.roundName} is published: ${result}. Score: ${score}/${maxScore}`,
        link: `/student/results`
      });
    }

    await logAuditEvent(req, {
      action: 'Submit Round Result',
      entity: 'RoundResult',
      entityId: roundResult._id.toString(),
      newValue: { studentId, driveId, roundId, score, result }
    });

    return res.json({ success: true, message: 'Round result submitted successfully', roundResult });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to record round score' });
  }
};

// ==================== INTERVIEW CONTROLLERS ====================

export const scheduleInterview = async (req, res) => {
  const { studentId, driveId, roundId, interviewer, date, time, duration, mode, location, meetingLink, notes } = req.body;

  try {
    let companyId;
    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      companyId = company._id;
    } else {
      companyId = req.body.companyId;
    }

    const interview = await Interview.create({
      student: studentId,
      company: companyId,
      drive: driveId,
      round: roundId,
      interviewer,
      date,
      time,
      duration,
      mode,
      location,
      meetingLink,
      notes
    });

    // Notify student
    const student = await Student.findById(studentId);
    if (student) {
      await createAndSendNotification({
        recipientId: student.user,
        senderId: req.user._id,
        type: 'INTERVIEW_SCHEDULED',
        title: 'Interview Scheduled',
        message: `You have an interview scheduled on ${new Date(date).toLocaleDateString()} at ${time}. Mode: ${mode}`,
        link: `/student/interviews`
      });
    }

    return res.status(201).json({ success: true, message: 'Interview scheduled successfully', interview });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to schedule interview' });
  }
};

export const getInterviews = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) query.student = student._id;
    } else if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (company) query.company = company._id;
    }

    const interviews = await Interview.find(query)
      .populate('student', 'name studentId department cgpa phone email')
      .populate('company', 'name logo')
      .populate('drive', 'name')
      .populate('round', 'roundName roundNumber');

    return res.json({ success: true, count: interviews.length, interviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve interview slots' });
  }
};

// ==================== PLACEMENT CONTROLLERS ====================

export const createPlacement = async (req, res) => {
  const { studentId, driveId, jobId, companyId, salaryPackage, baseSalary, variableSalary, location, joiningDate } = req.body;

  try {
    // 1. Create final placement record
    const placement = await Placement.create({
      student: studentId,
      company: companyId,
      job: jobId,
      drive: driveId,
      package: salaryPackage,
      baseSalary,
      variableSalary,
      location,
      joiningDate,
      offerDate: new Date(),
      offerStatus: 'Offer Received',
      placementStatus: 'Selected'
    });

    // 2. Mark application status as Selected
    await Application.findOneAndUpdate(
      { student: studentId, drive: driveId },
      { status: 'Selected' }
    );

    // 3. Notify student
    const student = await Student.findById(studentId);
    if (student) {
      await createAndSendNotification({
        recipientId: student.user,
        senderId: req.user._id,
        type: 'PLACEMENT_SELECTED',
        title: 'Congratulations! You are selected!',
        message: `You have received a placement offer from company. Package: ${salaryPackage} LPA. Check details inside your dashboard.`,
        link: `/student/placements`
      });
    }

    return res.status(201).json({ success: true, message: 'Placement selection recorded successfully', placement });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to record selection' });
  }
};

export const getPlacements = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) query.student = student._id;
    } else if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (company) query.company = company._id;
    }

    const placements = await Placement.find(query)
      .populate('student', 'name studentId department cgpa email phone')
      .populate('company', 'name logo website')
      .populate('job', 'title code ctc')
      .populate('drive', 'name');

    return res.json({ success: true, count: placements.length, placements });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve placements' });
  }
};

export const updatePlacementStatus = async (req, res) => {
  const { offerStatus, placementStatus, joiningDate } = req.body;

  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement record not found' });
    }

    if (offerStatus) placement.offerStatus = offerStatus;
    if (placementStatus) placement.placementStatus = placementStatus;
    if (joiningDate) placement.joiningDate = joiningDate;

    await placement.save();
    return res.json({ success: true, message: 'Placement offer status updated successfully', placement });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update placement offer status' });
  }
};

// ==================== OFFER LETTERS CONTROLLERS ====================

export const uploadOfferLetter = async (req, res) => {
  const { studentId, driveId, companyId, offerLetterUrl, joiningLetterUrl } = req.body;

  try {
    const offerLetter = req.file ? `/uploads/${req.file.filename}` : offerLetterUrl;

    const offer = await Offer.create({
      student: studentId,
      company: companyId,
      drive: driveId,
      offerLetter,
      joiningLetter: joiningLetterUrl || '',
      status: 'Pending'
    });

    const student = await Student.findById(studentId);
    if (student) {
      await createAndSendNotification({
        recipientId: student.user,
        senderId: req.user._id,
        type: 'OFFER_LETTER_UPLOADED',
        title: 'Offer Letter Available',
        message: 'Your official placement offer letter has been uploaded. Download and review it.',
        link: `/student/documents`
      });
    }

    return res.status(201).json({ success: true, message: 'Offer letter document uploaded', offer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Offer upload failed' });
  }
};

export const getOffers = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) query.student = student._id;
    } else if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (company) query.company = company._id;
    }

    const offers = await Offer.find(query)
      .populate('student', 'name studentId department')
      .populate('company', 'name')
      .populate('drive', 'name');

    return res.json({ success: true, count: offers.length, offers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve offer details' });
  }
};

// @desc    Get public application details for QR verification
// @route   GET /api/applications/public/verify/:id
// @access  Public
export const getPublicApplicationVerify = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'student',
        select: 'name studentId department degree phone photo university',
        populate: {
          path: 'user',
          select: 'email'
        }
      })
      .populate('company', 'name logo')
      .populate('job', 'title location ctc')
      .populate('drive', 'name driveDate');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Verification Ticket not found' });
    }

    return res.json({ success: true, application });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error retrieving verification details' });
  }
};

// @desc    Generate all hall tickets for a specific drive and notify candidates
// @route   POST /api/applications/drives/:driveId/generate-tickets
// @access  Placement Manager, Admin
export const generateDriveTickets = async (req, res) => {
  const { driveId } = req.params;

  try {
    if (!driveId || !mongoose.Types.ObjectId.isValid(driveId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing Placement Drive ID' });
    }

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement Drive not found' });
    }

    // Update all applications for this drive
    const result = await Application.updateMany(
      { drive: driveId, status: { $ne: 'Rejected' } },
      { hallTicketGenerated: true }
    );

    if (result.matchedCount === 0) {
      return res.json({ success: true, message: 'No active student applications found for this drive.', count: 0 });
    }

    // Find all student details to send notification alerts
    const applications = await Application.find({ drive: driveId, status: { $ne: 'Rejected' } })
      .populate('student');

    // Create notifications bulk insert docs
    const notificationDocs = [];
    applications.forEach(app => {
      if (app.student && app.student.user) {
        notificationDocs.push({
          recipient: app.student.user,
          sender: req.user._id,
          type: 'TICKET_GENERATED',
          title: 'Hall Ticket Generated',
          message: `Your admission pass for the "${drive.name}" drive has been generated! You can now print/download it from your applications panel.`,
          link: '/student/applications'
        });
      }
    });

    if (notificationDocs.length > 0) {
      try {
        await Notification.insertMany(notificationDocs);
      } catch (err) {
        console.error('Error inserting notifications in bulk:', err);
      }
    }

    // Defer WebSocket dispatches to background tasks
    process.nextTick(() => {
      applications.forEach((app) => {
        if (app.student && app.student.user) {
          try {
            sendRealTimeNotification(app.student.user, {
              type: 'TICKET_GENERATED',
              title: 'Hall Ticket Generated',
              message: `Your admission pass for the "${drive.name}" drive has been generated!`
            });
          } catch (e) {
            console.error('Error sending real-time notification via WS:', e);
          }
        }
      });
    });

    try {
      await logAuditEvent(req, {
        action: 'Generate Hall Tickets Bulk',
        entity: 'Drive',
        entityId: driveId,
        newValue: { count: result.modifiedCount }
      });
    } catch (auditErr) {
      console.error('Audit event log failed:', auditErr);
    }

    return res.json({
      success: true,
      message: `Successfully generated ${result.modifiedCount} hall tickets for candidates. Notifications dispatched.`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error in generateDriveTickets:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate drive hall tickets' });
  }
};
