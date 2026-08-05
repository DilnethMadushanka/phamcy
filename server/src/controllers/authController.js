const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendOTPEmail } = require('../services/emailService');

// In-memory OTP store: key = `${email}:${type}`, value = { code, expiresAt }
const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Public self-registration ALWAYS defaults to Customer.
    // Only logged-in Admins can assign staff roles (Admin, Pharmacist, Cashier).
    let assignedRole = 'Customer';
    if (req.user && req.user.role === 'Admin' && role) {
      assignedRole = role;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password_hash,
      role: assignedRole,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'pharmacy_super_secret_jwt_key_2026',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.password_hash) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'pharmacy_super_secret_jwt_key_2026',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Server Auth Login Error:', error);
    res.status(500).json({ message: error.message || 'Login failed due to a server error' });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required for Google authentication' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ where: { email: cleanEmail } });

    // If user does not exist, auto-create customer account
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password_hash,
        role: 'Customer',
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'pharmacy_super_secret_jwt_key_2026',
      { expiresIn: '24h' }
    );

    res.json({
      message: '🎉 Google authentication successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['Admin', 'Pharmacist', 'Cashier', 'Customer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'registration' | 'forgot_password'

    if (!email || !type) {
      return res.status(400).json({ message: 'Email and type are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (type === 'registration') {
      const existingUser = await User.findOne({ where: { email: cleanEmail } });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
    } else if (type === 'forgot_password') {
      const user = await User.findOne({ where: { email: cleanEmail } });
      if (!user) {
        return res.status(404).json({ message: 'No account found with this email address' });
      }
    } else if (type === 'profile_update') {
      // Check if new email belongs to another user
      const existingUser = await User.findOne({ where: { email: cleanEmail } });
      if (existingUser && req.user && existingUser.id !== req.user.id) {
        return res.status(400).json({ message: 'Email address is already in use by another account' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid OTP type' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(`${cleanEmail}:${type}`, { code: otp, expiresAt });

    await sendOTPEmail(cleanEmail, otp, type);

    const isTransporterConfigured = !!(process.env.GMAIL_USER || process.env.EMAIL_USER);

    res.json({
      message: isTransporterConfigured
        ? `Verification code (OTP) sent to ${cleanEmail}`
        : `Verification code sent to ${cleanEmail}! (Demo Mode: Check server console or use auto-filled code)`,
      devOtp: isTransporterConfigured ? undefined : otp,
      isSimulated: !isTransporterConfigured,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP code', error: error.message });
  }
};

const verifyOTPRegister = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Name, email, password, and OTP code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const key = `${cleanEmail}:registration`;
    const stored = otpStore.get(key);

    if (!stored || stored.code !== String(otp).trim() || stored.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP verification code' });
    }

    // OTP verified -> remove from store
    otpStore.delete(key);

    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: cleanEmail,
      password_hash,
      role: 'Customer',
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'pharmacy_super_secret_jwt_key_2026',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Account verified and registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const verifyOTPResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const key = `${cleanEmail}:forgot_password`;
    const stored = otpStore.get(key);

    if (!stored || stored.code !== String(otp).trim() || stored.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP verification code' });
    }

    const user = await User.findOne({ where: { email: cleanEmail } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // OTP verified -> remove from store
    otpStore.delete(key);

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, otp } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : user.email;
    const isEmailChanged = cleanEmail !== user.email;

    // If changing email address, OTP verification is required
    if (isEmailChanged) {
      if (!otp) {
        return res.status(400).json({ message: 'OTP verification code is required to update email address' });
      }

      const key = `${cleanEmail}:profile_update`;
      const stored = otpStore.get(key);

      if (!stored || stored.code !== String(otp).trim() || stored.expiresAt < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP verification code' });
      }

      // Ensure new email is not taken by another user
      const existing = await User.findOne({ where: { email: cleanEmail } });
      if (existing && existing.id !== userId) {
        return res.status(400).json({ message: 'Email address is already in use by another user' });
      }

      // Delete OTP after verification
      otpStore.delete(key);
      user.email = cleanEmail;
    }

    user.name = name.trim();
    await user.save();

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'pharmacy_super_secret_jwt_key_2026',
      { expiresIn: '24h' }
    );

    res.json({
      message: isEmailChanged
        ? '🎉 Profile and email address updated successfully!'
        : '🎉 Profile name updated successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getMe,
  getUsers,
  updateUserRole,
  forgotPassword,
  changePassword,
  sendOTP,
  verifyOTPRegister,
  verifyOTPResetPassword,
  updateProfile,
};


