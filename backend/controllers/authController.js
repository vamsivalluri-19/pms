import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, Student, Company, PlacementManager, Admin } from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../config/jwt.js';
import { sendEmail } from '../services/emailService.js';
import { logAuditEvent } from '../middleware/auditMiddleware.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { email, password, role, profileData } = req.body;

  try {
    // Admin registration check
    if (role === 'ADMIN') {
      if (email !== 'vamsivalluri52@gmail.com' || password !== 'Vamsi@1912') {
        return res.status(400).json({ success: false, message: 'Invalid registration credentials for Admin role.' });
      }
    }
    if (email === 'vamsivalluri52@gmail.com') {
      if (role !== 'ADMIN' || password !== 'Vamsi@1912') {
        return res.status(400).json({ success: false, message: 'This email is reserved for Admin role only with specific password.' });
      }
    }

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      isVerified: true // Automatically verify for ease of testing
    });

    // 4. Create Role Profile
    let profile = null;
    if (role === 'STUDENT') {
      const studentIdExists = await Student.findOne({ studentId: profileData.studentId });
      if (studentIdExists) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ success: false, message: 'Student ID already exists' });
      }
      profile = await Student.create({
        user: user._id,
        name: profileData.name,
        studentId: profileData.studentId,
        cgpa: profileData.cgpa || 0,
        tenthPercentage: profileData.tenthPercentage || 0,
        twelfthPercentage: profileData.twelfthPercentage || 0,
        degree: profileData.degree || 'B.Tech',
        department: profileData.department || 'CSE',
        batch: profileData.batch || '2022-2026',
        graduationYear: profileData.graduationYear || 2026
      });
    } else if (role === 'COMPANY') {
      profile = await Company.create({
        user: user._id,
        name: profileData.name,
        recruiterName: profileData.recruiterName,
        recruiterEmail: profileData.recruiterEmail || email,
        recruiterPhone: profileData.recruiterPhone || '',
        verificationStatus: 'PENDING' // Company needs approval by placement manager
      });
    } else if (role === 'PLACEMENT_MANAGER') {
      profile = await PlacementManager.create({
        user: user._id,
        name: profileData.name,
        department: profileData.department
      });
    } else if (role === 'ADMIN') {
      profile = await Admin.create({
        user: user._id,
        name: profileData.name || 'Vamsi Valluri',
        phone: profileData.phone || '6301231575',
        address: profileData.address || 'Kandipadu, Guntur (Dt), Andhra Pradesh'
      });
    }

    // 5. Audit log
    await logAuditEvent(req, {
      action: 'Register User',
      entity: 'User',
      entityId: user._id.toString(),
      newValue: { email, role }
    });

    // 6. Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      profile
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error. Registration failed.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Admin access intercept
    if (email === 'vamsivalluri52@gmail.com') {
      if (password !== 'Vamsi@1912') {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      let user = await User.findOne({ email });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = await User.create({
          email,
          password: hashedPassword,
          role: 'ADMIN',
          isVerified: true
        });
      } else {
        // Enforce role and password update if out of sync
        let outOfSync = false;
        if (user.role !== 'ADMIN') {
          user.role = 'ADMIN';
          outOfSync = true;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          outOfSync = true;
        }
        if (outOfSync) {
          await user.save();
        }
      }

      // Check or create admin profile
      let adminProfile = await Admin.findOne({ user: user._id });
      if (!adminProfile) {
        adminProfile = await Admin.create({
          user: user._id,
          name: 'Vamsi Valluri',
          phone: '6301231575',
          address: 'Kandipadu, Guntur (Dt), Andhra Pradesh'
        });
      } else {
        // Make sure it has updated details
        adminProfile.name = 'Vamsi Valluri';
        adminProfile.phone = '6301231575';
        adminProfile.address = 'Kandipadu, Guntur (Dt), Andhra Pradesh';
        await adminProfile.save();
      }
    }

    // 1. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // If role is ADMIN, only vamsivalluri52@gmail.com is allowed
    if (user.role === 'ADMIN' && email !== 'vamsivalluri52@gmail.com') {
      return res.status(401).json({ success: false, message: 'Admin access denied for this account' });
    }

    // 2. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 3. Load profile
    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === 'COMPANY') {
      profile = await Company.findOne({ user: user._id });
    } else if (user.role === 'PLACEMENT_MANAGER') {
      profile = await PlacementManager.findOne({ user: user._id });
    } else if (user.role === 'ADMIN') {
      profile = await Admin.findOne({ user: user._id });
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      profile
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error. Login failed.' });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'supersecurerefreshsecretkey0123456789');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    const accessToken = generateAccessToken(user);
    return res.json({ success: true, accessToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3050';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>Please click on the link below or paste it into your browser to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'PlaceTrack - Password Reset Request',
      html: message
    });

    return res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error. Password reset request failed.' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error. Password reset failed.' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
};

export const toggleUserStatus = async (req, res) => {
  const { isVerified } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const oldStatus = user.isVerified;
    user.isVerified = isVerified;
    await user.save();

    await logAuditEvent(req, {
      action: 'Toggle User Verification Status',
      entity: 'User',
      entityId: user._id.toString(),
      oldValue: { isVerified: oldStatus },
      newValue: { isVerified: user.isVerified }
    });

    return res.json({ success: true, message: `User active status set to ${isVerified}`, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error updating user status' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);
    
    if (user.role === 'STUDENT') await Student.deleteOne({ user: user._id });
    else if (user.role === 'COMPANY') await Company.deleteOne({ user: user._id });
    else if (user.role === 'PLACEMENT_MANAGER') await PlacementManager.deleteOne({ user: user._id });
    else if (user.role === 'ADMIN') await Admin.deleteOne({ user: user._id });

    await logAuditEvent(req, {
      action: 'Delete User Account',
      entity: 'User',
      entityId: user._id.toString(),
      oldValue: { email: user.email, role: user.role }
    });

    return res.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};
