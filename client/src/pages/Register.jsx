import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { openGoogleAccountPicker } from '../utils/googleAuthHelper';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { sendOtp, verifyOtpRegister, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleGoogleAuth = () => {
    setError('');
    openGoogleAccountPicker(
      async (googleUserData) => {
        setLoading(true);
        try {
          const res = await googleAuth({ email: googleUserData.email, name: googleUserData.name });
          toast.success(res.message || `🎉 Google registration successful! Welcome ${googleUserData.name}`);
          navigate('/store');
        } catch (err) {
          setError(err.message || 'Google Sign-Up failed.');
        } finally {
          setLoading(false);
        }
      },
      (errMessage) => {
        setError(errMessage || 'Google Sign-In cancelled.');
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await sendOtp(formData.email, 'registration');
      setOtpSent(true);
      if (res.devOtp) {
        setOtp(res.devOtp);
        setSuccessMsg(`🔑 Demo OTP Code: ${res.devOtp} (Auto-filled)`);
        toast.success(`🔑 Demo OTP Code: ${res.devOtp} (Auto-filled)`, { duration: 6000 });
      } else {
        setSuccessMsg(res.message || `Verification code sent to ${formData.email}`);
        toast.success(`✉ Verification OTP code sent to ${formData.email}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtpRegister({ ...formData, otp });
      toast.success('🎉 Account registered and verified successfully!');
      navigate('/store');
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-2xl relative z-10 space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1 text-rose-600">
            <svg className="w-9 h-9 fill-current text-rose-600" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h1 className="font-serif font-black tracking-[0.25em] text-black text-xl uppercase leading-none">
            FOUAD
          </h1>
          <p className="text-[10px] font-sans font-extrabold tracking-[0.35em] text-black uppercase">
            PHARMACIES
          </p>
          <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {otpSent ? 'Enter 6-Digit Email OTP' : 'Create Verified Customer Account'}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Step 1: User Details */}
        {!otpSent ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-extrabold border border-slate-200 rounded-xl shadow-2xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] text-xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest absolute">Or Register With Email</span>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Emma Watson"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black font-semibold placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. emma@example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black font-semibold placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="•••••••• (min 6 characters)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black font-semibold placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-black hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              <span>{loading ? 'Sending Code...' : 'Send Verification OTP Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          </div>
        ) : (
          /* Step 2: Verify OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 text-center">
                ENTER 6-DIGIT VERIFICATION CODE SENT TO YOUR EMAIL
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] text-xl font-black py-3.5 bg-blue-50/60 border-2 border-blue-200 rounded-xl text-blue-900 placeholder:tracking-normal focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              <span>{loading ? 'Verifying Account...' : 'Verify Code & Complete Registration'}</span>
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
                onClick={handleSendOtp}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 font-semibold">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-rose-600 font-extrabold hover:underline ml-1"
          >
            Sign In
          </Link>
          <div className="mt-2">
            <Link to="/store" className="text-slate-400 hover:text-black text-[11px] font-bold underline">
              Browse Store as Guest →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

