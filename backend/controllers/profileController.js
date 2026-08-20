import { Student, User } from '../models/User.js';
import { logAuditEvent } from '../middleware/auditMiddleware.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Manager/Admin)
export const getStudents = async (req, res) => {
  const { search, department, degree, minCgpa, maxBacklogs } = req.query;
  let query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  if (department) {
    query.department = department;
  }
  if (degree) {
    query.degree = degree;
  }
  if (minCgpa) {
    query.cgpa = { $gte: parseFloat(minCgpa) };
  }
  if (maxBacklogs) {
    query.activeBacklogs = { $lte: parseInt(maxBacklogs) };
  }

  try {
    const students = await Student.find(query).populate('user', 'email isVerified');
    return res.json({ success: true, count: students.length, students });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve students' });
  }
};

// @desc    Get student profile by ID
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    if (req.params.id === 'me') {
      const studentProfile = await Student.findOne({ user: req.user._id });
      if (!studentProfile) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }
      return res.json({ success: true, student: studentProfile });
    }

    // If student is fetching, verify resource ownership or role
    if (req.user.role === 'STUDENT') {
      const student = await Student.findById(req.params.id).populate('user', 'email name');
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }
      return res.json({ success: true, student });
    }

    const student = await Student.findById(req.params.id).populate('user', 'email isVerified');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    return res.json({ success: true, student });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get student profile by User ID (for peer lookups in chat)
// @route   GET /api/students/user/:userId
// @access  Private
export const getStudentProfileByUserId = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.params.userId }).populate('user', 'email name');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    return res.json({ success: true, student });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private
export const updateStudentProfile = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Verify ownership: Student user can only edit their own profile
    if (req.user.role === 'STUDENT' && student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const oldCgpa = student.cgpa;
    const oldBacklogs = student.activeBacklogs;

    student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Audit logs for academic modifications
    if (req.body.cgpa !== undefined || req.body.activeBacklogs !== undefined) {
      await logAuditEvent(req, {
        action: 'Update Academic Profile',
        entity: 'Student',
        entityId: student._id.toString(),
        oldValue: { cgpa: oldCgpa, activeBacklogs: oldBacklogs },
        newValue: { cgpa: student.cgpa, activeBacklogs: student.activeBacklogs }
      });
    }

    return res.json({ success: true, message: 'Profile updated successfully', student });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// @desc    Upload student resume
// @route   POST /api/students/resume
// @access  Private (Student)
export const uploadResume = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Capture file details from request
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
    const fileName = req.file ? req.file.originalname : (req.body.fileName || 'resume.pdf');

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'No file uploaded or file URL provided' });
    }

    student.resume = {
      fileName,
      fileUrl,
      uploadDate: new Date(),
      version: student.resume && student.resume.version ? student.resume.version + 1 : 1,
      status: 'ACTIVE'
    };

    await student.save();

    await logAuditEvent(req, {
      action: 'Upload Resume',
      entity: 'Student',
      entityId: student._id.toString(),
      newValue: { resume: student.resume }
    });

    return res.json({ success: true, message: 'Resume uploaded successfully', resume: student.resume });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Resume upload failed' });
  }
};

// @desc    Upload/add verification documents
// @route   POST /api/students/documents
// @access  Private (Student)
export const uploadDocument = async (req, res) => {
  const { name, fileUrl } = req.body;
  
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const documentUrl = req.file ? `/uploads/${req.file.filename}` : fileUrl;
    if (!documentUrl) {
      return res.status(400).json({ success: false, message: 'Please upload a document file' });
    }

    // Check if document already exists, then update it, else push
    const docIndex = student.documents.findIndex(d => d.name === name);
    if (docIndex > -1) {
      student.documents[docIndex].fileUrl = documentUrl;
      student.documents[docIndex].status = 'PENDING';
      student.documents[docIndex].remarks = '';
    } else {
      student.documents.push({
        name,
        fileUrl: documentUrl,
        status: 'PENDING'
      });
    }

    await student.save();
    return res.json({ success: true, message: `${name} uploaded for verification`, documents: student.documents });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Document upload failed' });
  }
};

// @desc    Verify student document
// @route   PUT /api/students/:id/documents/verify
// @access  Private (Manager/Admin)
export const verifyDocument = async (req, res) => {
  const { documentId, status, remarks } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const doc = student.documents.id(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const oldStatus = doc.status;
    doc.status = status;
    doc.remarks = remarks || '';

    await student.save();

    await logAuditEvent(req, {
      action: 'Verify Student Document',
      entity: 'Student',
      entityId: student._id.toString(),
      oldValue: { docName: doc.name, status: oldStatus },
      newValue: { docName: doc.name, status: doc.status, remarks: doc.remarks }
    });

    return res.json({ success: true, message: `Document verification status updated to ${status}`, student });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to verify document' });
  }
};

// @desc    Upload student profile photo
// @route   POST /api/students/photo
// @access  Private (Student)
export const uploadPhoto = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a photo file to upload' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    student.photo = fileUrl;
    await student.save();

    return res.json({ success: true, message: 'Profile photo uploaded successfully', photo: fileUrl, student });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Profile photo upload failed' });
  }
};
