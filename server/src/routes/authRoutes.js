const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/send-otp', sendOTP);
router.post('/verify-otp-register', verifyOTPRegister);
router.post('/verify-otp-reset-password', verifyOTPResetPassword);
router.put('/change-password', authenticateToken, changePassword);
router.put('/profile', authenticateToken, updateProfile);
router.get('/me', authenticateToken, getMe);

// Admin only routes
router.get('/users', authenticateToken, authorizeRoles('Admin'), getUsers);
router.put('/users/:id/role', authenticateToken, authorizeRoles('Admin'), updateUserRole);

module.exports = router;
