import https from 'https';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, Student, Company, PlacementManager, Admin } from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../config/jwt.js';
import { sendEmail } from '../services/emailService.js';
import { logAuditEvent } from '../middleware/auditMiddleware.js';

export const getAuthProviders = (req, res) => {
  res.json({ success: true, providers: { password: true, google: Boolean(process.env.GOOGLE_CLIENT_ID) } });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { email, password, role, profileData = {} } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
    }

    // Admin creation is opt-in and configured through environment variables.
    // This avoids shipping privileged credentials in source code.
    if (role === 'ADMIN') {
      if (!process.env.ADMIN_BOOTSTRAP_SECRET || password !== process.env.ADMIN_BOOTSTRAP_SECRET || email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ success: false, message: 'Admin registration is not enabled for these credentials.' });
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

    // 3. Create User (Bypassing verification, set isVerified to true for all users)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      isVerified: true, // Auto-verify all roles to bypass OTP verification
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000 // 10 minutes
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

    // 6. Send Verification Email (if not Admin) - Bypassed for testing
    // All users are automatically verified now.

    // 7. Generate Tokens for Admin
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(201).json({
      success: true,
      isVerified: true,
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
    // 1. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 2. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 2b. Check email verification status - Bypassed for testing
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
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

    // Use the same short-lived OTP experience as account verification.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const message = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:16px;text-align:center">
        <h1 style="color:#0f172a">Reset your password</h1>
        <p style="color:#475569">Use this one-time code to create a new PlaceTrack password:</p>
        <div style="margin:28px 0;padding:16px;font-size:30px;font-weight:800;letter-spacing:6px;color:#4f46e5;background:#f1f5f9;border-radius:10px">${otp}</div>
        <p style="color:#94a3b8;font-size:13px">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    `;

    sendEmail({
      to: user.email,
      subject: 'PlaceTrack - Password Reset Request',
      html: message
    }).catch(err => console.error('Forgot password email background error:', err));

    const isMailUnconfigured = process.env.NODE_ENV !== 'production' || 
      !process.env.EMAIL_USER || 
      process.env.EMAIL_USER.includes('your_email') || 
      process.env.EMAIL_USER.includes('your_smtp');

    const resMessage = isMailUnconfigured 
      ? `A six-digit verification code has been generated! (For testing/demo, your OTP is: ${otp})` 
      : 'A six-digit verification code has been sent to your email.';

    return res.json({ success: true, message: resMessage, debugOtp: otp });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error. Password reset request failed.' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    let user;
    if (req.params.resetToken) {
      const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
      user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    } else {
      user = await User.findOne({ email: email?.toLowerCase(), otp, otpExpire: { $gt: Date.now() } });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.otp = undefined;
    user.otpExpire = undefined;

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

// @desc    Verify Registration/Login OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (Date.now() > user.otpExpire) {
      return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Fetch profile
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

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await logAuditEvent(req, {
      action: 'Verify User OTP',
      entity: 'User',
      entityId: user._id.toString(),
      newValue: { email: user.email, isVerified: true }
    });

    return res.json({
      success: true,
      message: 'Email verified successfully',
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
    return res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// @desc    Resend Verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Verify Your Email</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #1e293b; text-align: center;">
          <h2 style="margin-top: 0; color: #0f172a;">New Verification Code</h2>
          <p style="font-size: 15px; color: #475569; line-height: 1.5;">Here is your new 6-digit verification code:</p>
          <div style="margin: 30px 0; font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #4f46e5; background-color: #f1f5f9; padding: 15px 30px; display: inline-block; border-radius: 8px;">
            ${otp}
          </div>
          <p style="font-size: 13px; color: #94a3b8;">This code is valid for 10 minutes.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">This is an automated security code. Please do not reply directly.</p>
        </div>
      </div>
    `;

    sendEmail({
      to: user.email,
      subject: 'PlaceTrack - Verify Your Email Address',
      html: emailHtml
    }).catch(err => console.error('Resend OTP email background error:', err));

    const isMailUnconfigured = process.env.NODE_ENV !== 'production' || 
      !process.env.EMAIL_USER || 
      process.env.EMAIL_USER.includes('your_email') || 
      process.env.EMAIL_USER.includes('your_smtp');

    const resMessage = isMailUnconfigured 
      ? `Verification code has been regenerated! (For testing/demo, your OTP is: ${otp})` 
      : 'Verification code has been resent to your email.';

    return res.json({ success: true, message: resMessage, debugOtp: otp });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error. Failed to resend verification code.' });
  }
};
let googleCertsCache = null;
let googleCertsFetchTime = 0;

const getGooglePublicKeys = async () => {
  const now = Date.now();
  // Cache Google's public certs for 24 hours to minimize outgoing network requests
  if (googleCertsCache && (now - googleCertsFetchTime < 24 * 60 * 60 * 1000)) {
    return googleCertsCache;
  }

  return new Promise((resolve, reject) => {
    https.get('https://www.googleapis.com/oauth2/v1/certs', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            googleCertsCache = JSON.parse(data);
            googleCertsFetchTime = Date.now();
            resolve(googleCertsCache);
          } catch (e) {
            reject(new Error('Failed to parse Google public certificates'));
          }
        } else {
          reject(new Error(`Failed to fetch Google certificates, status: ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const getGoogleTokenInfo = async (credential) => {
  const decoded = jwt.decode(credential, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('Invalid Google credential token structure');
  }

  const kid = decoded.header.kid;
  const publicKeys = await getGooglePublicKeys();
  const cert = publicKeys[kid];
  if (!cert) {
    throw new Error('Google public key not found for token key identifier');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Google Sign-In is not configured');
  const payload = jwt.verify(credential, cert, {
    algorithms: ['RS256'],
    audience: clientId,
    issuer: ['accounts.google.com', 'https://accounts.google.com']
  });

  // Ensure compatibility with boolean and string representation of email_verified
  if (payload && payload.email_verified !== undefined) {
    payload.email_verified = payload.email_verified === true || payload.email_verified === 'true';
  }

  return payload;
};

// @desc    Google Sign-In / Authentication
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: 'Google credential ID token is required' });
  }

  try {
    // 1. Verify Google ID Token via Google API (using secure native helper)
    let payload;
    try {
      payload = await getGoogleTokenInfo(credential);
    } catch (err) {
      console.error('Google token verification error:', err.message);
      return res.status(400).json({ success: false, message: 'Invalid Google credential token' });
    }

    const { email, email_verified, name, picture } = payload;

    if (!email_verified) {
      return res.status(400).json({ success: false, message: 'Google email is not verified' });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // User does not exist, return a signal for frontend to capture profile info
      return res.json({
        success: true,
        isNewUser: true,
        email,
        name
      });
    }

    // User exists - log them in!
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Load profile
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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await logAuditEvent(req, {
      action: 'Google Login',
      entity: 'User',
      entityId: user._id.toString(),
      newValue: { email: user.email, role: user.role }
    });

    return res.json({
      success: true,
      isNewUser: false,
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
    console.error('Google OAuth error:', error);
    return res.status(500).json({ success: false, message: 'Google login failed due to server error' });
  }
};

// @desc    Register a new user via Google Sign-In
// @route   POST /api/auth/google/register
// @access  Public
export const googleRegister = async (req, res) => {
  const { credential, role, profileData } = req.body;

  if (!credential || !role || !profileData) {
    return res.status(400).json({ success: false, message: 'Credential token, role, and profile details are required' });
  }

  try {
    // 1. Verify Google ID Token (using secure native helper)
    let payload;
    try {
      payload = await getGoogleTokenInfo(credential);
    } catch (err) {
      console.error('Google token registration verification error:', err.message);
      return res.status(400).json({ success: false, message: 'Invalid Google credential token' });
    }

    const { email, email_verified, name } = payload;

    if (!email_verified) {
      return res.status(400).json({ success: false, message: 'Google email is not verified' });
    }

    // 2. Check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Account already exists with this email address' });
    }

    // 3. Create User (password-less, generate a secure random string since they log in via Google)
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      isVerified: true // Google email is verified
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
        name: profileData.name || name,
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
        recruiterName: profileData.recruiterName || name,
        recruiterEmail: email,
        recruiterPhone: profileData.recruiterPhone || '',
        verificationStatus: 'PENDING'
      });
    } else if (role === 'PLACEMENT_MANAGER') {
      profile = await PlacementManager.create({
        user: user._id,
        name: profileData.name || name,
        department: profileData.department
      });
    }

    // 5. Audit Log
    await logAuditEvent(req, {
      action: 'Register User via Google',
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
    console.error('Google register error:', error);
    return res.status(500).json({ success: false, message: 'Google registration failed due to server error' });
  }
};

// @desc    Change Password for logged-in user
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error. Password update failed.' });
  }
};
