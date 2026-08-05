import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck, X, KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { openGoogleAccountPicker } from '../utils/googleAuthHelper';

const AuthModal = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    googleAuth,
    sendOtp,
    verifyOtpRegister,
    verifyOtpResetPassword,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleAuthSubmit = () => {
    setError('');
    openGoogleAccountPicker(
      async (googleUserData) => {
        setLoading(true);
        try {
          const res = await googleAuth({ email: googleUserData.email, name: googleUserData.name });
          toast.success(res.message || `🎉 Signed in as ${googleUserData.name}!`);
          handleClose();
        } catch (err) {
          setError(err.message || 'Google Sign-In failed.');
        } finally {
          setLoading(false);
        }
      },
      (errMessage) => {
        setError(errMessage || 'Google Sign-In cancelled.');
      }
    );
  };

  const handleClose = () => {
    setShowAuthModal(false);
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setNewPassword('');
    setName('');
    setOtp('');
    setOtpSent(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      handleClose();
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP for Registration
  const handleRequestRegisterOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await sendOtp(email, 'registration');
      setOtpSent(true);
      if (res.devOtp) {
        setOtp(res.devOtp);
        setSuccessMsg(`🔑 Demo OTP Code: ${res.devOtp} (Auto-filled)`);
        toast.success(`🔑 Demo OTP Code: ${res.devOtp} (Auto-filled)`, { duration: 6000 });
      } else {
        setSuccessMsg(res.message || `Verification code sent to ${email}`);
        toast.success(`✉ Verification code sent to ${email}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyRegisterOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtpRegister({ name, email, password, otp });
      toast.success('🎉 Account registered and verified successfully!');
      handleClose();
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP for Forgot Password
  const handleRequestForgotOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await sendOtp(email, 'forgot_password');
      setOtpSent(true);
      if (res.devOtp) {
        setOtp(res.devOtp);
        setSuccessMsg(`🔑 Demo OTP Code: ${res.devOtp} (Auto-filled)`);
        toast.success(`🔑 Demo OTP Code: ${res.devOtp} (Auto-filled)`, { duration: 6000 });
      } else {
        setSuccessMsg(res.message || `Password reset code sent to ${email}`);
        toast.success(`✉ Reset code sent to ${email}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtpResetPassword({ email, otp, newPassword });
      toast.success('🎉 Password reset successfully!');
      setSuccessMsg(res.message || 'Password reset! You can now sign in.');
      setOtpSent(false);
      setAuthModalMode('login');
      setPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-blue-100 shadow-2xl overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />

            <div className="p-8 space-y-6">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Logo + Title */}
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center font-black text-white text-lg shadow-md">
                    F
                  </div>
                </div>
                <h2 className="text-lg font-black text-blue-950 tracking-tight">
                  {authModalMode === 'login'
                    ? 'Sign In to Continue'
                    : authModalMode === 'register'
                    ? otpSent ? 'Verify Gmail OTP Code' : 'Create Verified Account'
                    : otpSent ? 'Verify Reset OTP Code' : 'Reset Your Password'}
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  {authModalMode === 'login'
                    ? 'Access your pharmacy orders, wishlist and prescriptions'
                    : authModalMode === 'register'
                    ? otpSent
                      ? `We sent a 6-digit code to ${email}`
                      : 'Join Fouad Pharmacies with email OTP security'
                    : otpSent
                      ? `Enter the 6-digit reset code sent to ${email}`
                      : 'Enter your email to receive a password reset OTP code'}
                </p>
              </div>

              {/* Tab switcher */}
              {authModalMode !== 'forgot' && !otpSent && (
                <div className="flex bg-blue-50/70 border border-blue-100 rounded-xl p-1">
                  <button
                    onClick={() => { setAuthModalMode('login'); setError(''); setSuccessMsg(''); setOtpSent(false); }}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      authModalMode === 'login'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthModalMode('register'); setError(''); setSuccessMsg(''); setOtpSent(false); }}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      authModalMode === 'register'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* ── GOOGLE AUTH BUTTON ── */}
              {authModalMode !== 'forgot' && !otpSent && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleAuthSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-extrabold border border-slate-200 rounded-xl shadow-2xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] text-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest absolute">Or</span>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              {authModalMode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-blue-50/40 border border-blue-100 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => { setAuthModalMode('forgot'); setError(''); setSuccessMsg(''); setOtpSent(false); }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-blue-50/40 border border-blue-100 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer border border-blue-400/30"
                  >
                    <span>{loading ? 'Signing in...' : 'Sign In to Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* REGISTER FORM STEP 1: Enter details */}
              {authModalMode === 'register' && !otpSent && (
                <form onSubmit={handleRequestRegisterOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="•••••••• (min 6 chars)"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-black hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <span>{loading ? 'Sending Code...' : 'Send Verification OTP Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* REGISTER FORM STEP 2: Verify OTP */}
              {authModalMode === 'register' && otpSent && (
                <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 text-center">
                      ENTER 6-DIGIT VERIFICATION CODE
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.5em] text-xl font-black py-3 bg-blue-50/60 border-2 border-blue-200 rounded-xl text-blue-900 placeholder:tracking-normal focus:outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <span>{loading ? 'Verifying...' : 'Verify Code & Create Account'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex justify-between items-center text-xs pt-1 font-bold">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-slate-500 hover:text-black cursor-pointer"
                    >
                      ← Change Details
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestRegisterOtp}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}

              {/* FORGOT PASSWORD FORM STEP 1: Enter details */}
              {authModalMode === 'forgot' && !otpSent && (
                <form onSubmit={handleRequestForgotOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-blue-50/40 border border-blue-100 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 6 characters)"
                        className="w-full pl-10 pr-4 py-3 bg-blue-50/40 border border-blue-100 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer border border-blue-400/30"
                  >
                    <span>{loading ? 'Sending Reset OTP...' : 'Send Password Reset OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setAuthModalMode('login'); setError(''); setSuccessMsg(''); setOtpSent(false); }}
                      className="text-xs font-bold text-slate-500 hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* FORGOT PASSWORD FORM STEP 2: Verify OTP */}
              {authModalMode === 'forgot' && otpSent && (
                <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 text-center">
                      ENTER 6-DIGIT RESET CODE
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.5em] text-xl font-black py-3 bg-blue-50/60 border-2 border-blue-200 rounded-xl text-blue-900 placeholder:tracking-normal focus:outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer border border-blue-400/30"
                  >
                    <span>{loading ? 'Verifying...' : 'Verify Code & Reset Password'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex justify-between items-center text-xs pt-1 font-bold">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-slate-500 hover:text-black cursor-pointer"
                    >
                      ← Change Details
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestForgotOtp}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;


