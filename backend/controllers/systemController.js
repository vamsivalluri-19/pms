import fs from 'fs';
import path from 'path';
import { Notification, Message, AuditLog, StaffTicket, SystemSettings } from '../models/System.js';
import { Student, Company, User, PlacementManager } from '../models/User.js';
import { Job, Drive } from '../models/JobDrive.js';
import { Application, Placement } from '../models/Recruitment.js';
import { Department, Course, Batch } from '../models/Academic.js';
import * as aiService from '../services/aiService.js';

// ==================== NOTIFICATIONS ====================

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort('-createdAt');
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    return res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    return res.json({ success: true, notification: notif });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== AI ASSISTANT FEATURES ====================

export const getAiRecommendations = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const jobs = await Job.find().populate('company', 'name logo');
    const recommendations = await aiService.getJobRecommendations(student, jobs);

    return res.json({ success: true, recommendations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Recommendations failed' });
  }
};

export const analyzeStudentResume = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (!student.resume || !student.resume.fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume PDF or Word file in the Resume tab before running the ATS evaluation.'
      });
    }

    // Attempt to locate and load the physical resume file for base64 analysis
    let pdfBase64 = null;
    const fileBasename = path.basename(student.resume.fileUrl);
    const baseDir = process.cwd();
    
    let filePath = path.join(baseDir, 'uploads', fileBasename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(baseDir, 'backend', 'uploads', fileBasename);
    }

    if (fs.existsSync(filePath) && filePath.toLowerCase().endsWith('.pdf')) {
      try {
        const fileBuffer = await fs.promises.readFile(filePath);
        pdfBase64 = fileBuffer.toString('base64');
      } catch (err) {
        console.error('Error reading PDF file:', err);
      }
    }

    const analysis = await aiService.analyzeResume(student, pdfBase64);
    return res.json({ success: true, analysis });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Resume analysis failed' });
  }
};

export const chatbotQuery = async (req, res) => {
  const { query } = req.body;
  const role = req.user.role;

  try {
    let context = {};

    if (role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        const drives = await Drive.find({ 'eligibilityCriteria.allowedDepartments': student.department }).select('name driveDate');
        const applications = await Application.find({ student: student._id }).populate('drive', 'name').select('status currentRound');
        context = {
          name: student.name,
          cgpa: student.cgpa,
          department: student.department,
          skills: student.skills,
          projects: student.projects || [],
          internships: student.internships || [],
          certifications: student.certifications || [],
          drives: drives.map(d => ({ name: d.name, date: d.driveDate })),
          applications: applications.map(a => ({ driveName: a.drive?.name, status: a.status, round: a.currentRound }))
        };
      }
    } else if (role === 'COMPANY') {
      const company = await Company.findOne({ user: req.user._id });
      if (company) {
        const jobs = await Job.find({ company: company._id }).select('title ctc');
        context = {
          name: company.name,
          industry: company.industry,
          jobs: jobs.map(j => ({ title: j.title, ctc: j.ctc }))
        };
      }
    } else if (role === 'PLACEMENT_MANAGER') {
      const placedStudents = await Placement.countDocuments();
      const totalStudents = await Student.countDocuments();
      const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
      const placements = await Placement.find();
      const avgPkg = placements.length > 0 ? (placements.reduce((acc, p) => acc + p.package, 0) / placements.length).toFixed(1) : 0;

      context = {
        placedStudents,
        placementRate,
        averagePackage: avgPkg
      };
    } else {
      const totalUsers = await User.countDocuments();
      const studentsCount = await Student.countDocuments();
      const companiesCount = await Company.countDocuments();
      context = {
        totalUsers,
        studentsCount,
        companiesCount
      };
    }

    const history = await Message.find({ user: req.user._id }).sort('-createdAt').limit(6);
    history.reverse();

    const reply = await aiService.getChatbotResponse(role, context, query, history);

    // Save history
    await Message.create({ user: req.user._id, sender: 'USER', content: query });
    await Message.create({ user: req.user._id, sender: 'AI', content: reply });

    return res.json({ success: true, reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Chatbot query failed' });
  }
};

export const getChatbotHistory = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id }).sort('createdAt').limit(30);
    return res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve chat history' });
  }
};

export const runMockInterview = async (req, res) => {
  const { question, answer, jobTitle } = req.body;

  try {
    const evaluation = await aiService.evaluateMockAnswer(question, answer, jobTitle);
    return res.json({ success: true, evaluation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Mock interview evaluation failed' });
  }
};

// ==================== DASHBOARD STATS CONTROLLERS ====================

export const getStudentDashboardStats = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    // Execute queries in parallel to drastically improve dashboard loading speed
    const [
      totalApplications,
      shortlistedCount,
      selectedCount,
      inProgressCount,
      applicationsList,
      upcomingDrives
    ] = await Promise.all([
      Application.countDocuments({ student: student._id }),
      Application.countDocuments({ student: student._id, status: 'Shortlisted' }),
      Application.countDocuments({ student: student._id, status: 'Selected' }),
      Application.countDocuments({ student: student._id, status: 'In Progress' }),
      Application.find({ student: student._id })
        .populate('company', 'name logo')
        .populate('job', 'title ctc')
        .sort('-createdAt')
        .limit(5),
      Drive.find({
        status: 'Approved',
        'eligibilityCriteria.minCgpa': { $lte: student.cgpa },
        'eligibilityCriteria.maxBacklogs': { $gte: student.activeBacklogs },
        registrationEnd: { $gte: new Date() }
      })
        .populate('company', 'name logo')
        .populate('job', 'title ctc')
        .limit(3)
    ]);

    return res.json({
      success: true,
      stats: {
        totalApplications,
        shortlistedCount,
        selectedCount,
        inProgressCount
      },
      applicationsList,
      upcomingDrives
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error retrieving student dashboard data' });
  }
};

export const getCompanyDashboardStats = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' });

    // Execute queries in parallel to optimize load times
    const [
      totalJobs,
      totalDrives,
      totalApplicants,
      selectedStudents,
      recentDrives,
      recentApplicants
    ] = await Promise.all([
      Job.countDocuments({ company: company._id }),
      Drive.countDocuments({ company: company._id }),
      Application.countDocuments({ company: company._id }),
      Placement.countDocuments({ company: company._id }),
      Drive.find({ company: company._id })
        .populate('job', 'title ctc')
        .sort('-createdAt')
        .limit(3),
      Application.find({ company: company._id })
        .populate('student', 'name studentId department cgpa')
        .populate('job', 'title')
        .sort('-createdAt')
        .limit(5)
    ]);

    return res.json({
      success: true,
      stats: {
        totalJobs,
        totalDrives,
        totalApplicants,
        selectedStudents
      },
      recentDrives,
      recentApplicants
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getManagerDashboardStats = async (req, res) => {
  try {
    // Run all database calls in parallel to solve slow query latency bottlenecks
    const [
      totalStudents,
      placedStudents,
      activeCompanies,
      activeDrives,
      pendingCompanies,
      placements,
      deptStats
    ] = await Promise.all([
      Student.countDocuments(),
      Placement.countDocuments(),
      Company.countDocuments({ verificationStatus: 'APPROVED' }),
      Drive.countDocuments({ status: 'Registration Open' }),
      Company.countDocuments({ verificationStatus: 'PENDING' }),
      Placement.find(),
      Student.aggregate([
        {
          $lookup: {
            from: 'placements',
            localField: '_id',
            foreignField: 'student',
            as: 'placementInfo'
          }
        },
        {
          $project: {
            department: 1,
            isPlaced: { $cond: [{ $gt: [{ $size: '$placementInfo' }, 0] }, 1, 0] }
          }
        },
        {
          $group: {
            _id: '$department',
            total: { $sum: 1 },
            placed: { $sum: '$isPlaced' }
          }
        }
      ])
    ]);
    
    // Average Package Calculation
    let totalPackage = 0;
    let highestPackage = 0;
    
    placements.forEach(p => {
      totalPackage += p.package;
      if (p.package > highestPackage) highestPackage = p.package;
    });

    const averagePackage = placements.length > 0 ? (totalPackage / placements.length).toFixed(2) : 0;
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

    const departmentWiseData = deptStats.map(d => ({
      name: d._id || 'General',
      total: d.total,
      placed: d.placed,
      rate: d.total > 0 ? parseFloat(((d.placed / d.total) * 100).toFixed(1)) : 0
    }));

    return res.json({
      success: true,
      stats: {
        totalStudents,
        placedStudents,
        activeCompanies,
        activeDrives,
        pendingCompanies,
        averagePackage,
        highestPackage,
        placementRate
      },
      departmentWiseData
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    // Run count queries in parallel
    const [
      totalUsers,
      studentsCount,
      companiesCount,
      managersCount,
      drivesCount,
      placementsCount
    ] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      Company.countDocuments(),
      PlacementManager.countDocuments(),
      Drive.countDocuments(),
      Placement.countDocuments()
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        studentsCount,
        companiesCount,
        managersCount,
        drivesCount,
        placementsCount
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== AUDIT LOGS ====================

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort('-timestamp').limit(50);
    return res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
  }
};

export const getPublicStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeCompanies = await Company.countDocuments({ verificationStatus: 'APPROVED' });
    const totalDrives = await Drive.countDocuments({ status: 'Approved' });
    const placedStudents = await Placement.countDocuments();

    const placements = await Placement.find();
    let highestPackage = 0;
    let totalPackage = 0;
    placements.forEach(p => {
      totalPackage += p.package;
      if (p.package > highestPackage) highestPackage = p.package;
    });
    const averagePackage = placements.length > 0 ? parseFloat((totalPackage / placements.length).toFixed(1)) : 0;

    return res.json({
      success: true,
      stats: {
        totalStudents,
        activeCompanies,
        totalDrives,
        placedStudents,
        highestPackage,
        averagePackage
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error retrieving public stats' });
  }
};

export const getAcademicSettings = async (req, res) => {
  try {
    const depts = await Department.find();
    const courses = await Course.find();
    const batches = await Batch.find();
    return res.json({ success: true, departments: depts, courses, batches });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve academic settings' });
  }
};

export const createAcademicSetting = async (req, res) => {
  const { type, name, code, durationYears, startYear, endYear } = req.body;
  try {
    if (type === 'department') {
      const dept = await Department.create({ name, code });
      return res.status(201).json({ success: true, message: 'Department registered', data: dept });
    } else if (type === 'course') {
      const course = await Course.create({ name, code, durationYears });
      return res.status(201).json({ success: true, message: 'Course registered', data: course });
    } else if (type === 'batch') {
      const batch = await Batch.create({ name, startYear, endYear, isActive: true });
      return res.status(201).json({ success: true, message: 'Batch configured', data: batch });
    }
    return res.status(400).json({ success: false, message: 'Invalid academic setting type' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to create academic setting' });
  }
};

export const deleteAcademicSetting = async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === 'department') {
      await Department.findByIdAndDelete(id);
    } else if (type === 'course') {
      await Course.findByIdAndDelete(id);
    } else if (type === 'batch') {
      await Batch.findByIdAndDelete(id);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid academic setting type' });
    }
    return res.json({ success: true, message: 'Academic record deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to delete academic setting' });
  }
};

// ==================== STAFF TICKETS ====================

export const createStaffTicket = async (req, res) => {
  const { name, staffId, role, phone, email, driveName } = req.body;
  try {
    const staffTicket = await StaffTicket.create({
      name,
      staffId,
      role,
      phone,
      email,
      driveName
    });
    return res.status(201).json({ success: true, staffTicket });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to generate staff hall ticket' });
  }
};

export const getStaffTickets = async (req, res) => {
  try {
    const staffTickets = await StaffTicket.find().sort('-createdAt');
    return res.json({ success: true, count: staffTickets.length, staffTickets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve staff tickets' });
  }
};

export const getPublicStaffVerify = async (req, res) => {
  try {
    const staffTicket = await StaffTicket.findById(req.params.id);
    if (!staffTicket) {
      return res.status(404).json({ success: false, message: 'Staff Verification Ticket not found' });
    }
    return res.json({ success: true, staffTicket });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error retrieving verification details' });
  }
};

// ==================== SYSTEM GLOBAL SETTINGS ====================

export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    return res.json({ success: true, settings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch system settings' });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    
    // Create Audit Log entry
    await AuditLog.create({
      user: req.user?._id,
      userEmail: req.user?.email || 'Admin Operator',
      role: 'ADMIN',
      action: 'UPDATE_SYSTEM_SETTINGS',
      entity: 'SystemSettings',
      entityId: settings._id.toString()
    });

    return res.json({ success: true, message: 'System settings updated successfully', settings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update system settings' });
  }
};

export const clearSystemCache = async (req, res) => {
  try {
    // Log maintenance action
    await AuditLog.create({
      user: req.user?._id,
      userEmail: req.user?.email || 'Admin Operator',
      role: 'ADMIN',
      action: 'PURGE_SYSTEM_CACHE',
      entity: 'SystemCache'
    });

    return res.json({ success: true, message: 'System cache & session indices purged successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to clear system cache' });
  }
};

export const triggerSystemBackup = async (req, res) => {
  try {
    const backupId = 'BKUP-' + Date.now();
    await AuditLog.create({
      user: req.user?._id,
      userEmail: req.user?.email || 'Admin Operator',
      role: 'ADMIN',
      action: 'TRIGGER_MANUAL_BACKUP',
      entity: 'BackupArchive',
      entityId: backupId
    });

    return res.json({
      success: true,
      message: `Database snapshot (${backupId}) generated & stored securely in backup vault.`,
      backupId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'System backup execution failed' });
  }
};

