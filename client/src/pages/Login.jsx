import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      switch (data.user.role) {
        case 'Customer':
          navigate('/store');
          break;
        case 'Pharmacist':
          navigate('/orders');
          break;
        case 'Cashier':
          navigate('/pos');
          break;
        case 'Admin':
        default:
          navigate('/dashboard');
          break;
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await forgotPassword(email, newPassword);
      setSuccessMsg(res.message || 'Password reset successfully! You can now sign in.');
      toast.success('Password reset successfully!');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Soft Ambient Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl border border-blue-100 p-8 sm:p-10 shadow-2xl relative z-10 space-y-6"
      >
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center font-black text-white text-xl shadow-lg">
              F
            </div>
          </div>
          <h1 className="font-serif font-black tracking-[0.25em] bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 bg-clip-text text-transparent text-xl uppercase leading-none">
            FOUAD
          </h1>
          <p className="text-[10px] font-sans font-extrabold tracking-[0.35em] text-blue-600 uppercase">
            PHARMACIES
          </p>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-extrabold text-blue-700 uppercase tracking-wider mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            {isForgotMode ? 'Password Reset Portal' : 'Licensed Digital Pharmacy Portal'}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span>⚠</span>
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

        {/* LOGIN FORM */}
        {!isForgotMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>EMAIL ADDRESS</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email..."
                className="w-full px-4 py-3 bg-blue-50/40 border border-blue-100 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>PASSWORD</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setIsForgotMode(true); setError(''); setSuccessMsg(''); }}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black font-semibold placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-black hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* FORGOT PASSWORD FORM */
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>REGISTERED EMAIL ADDRESS</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-blue-50/40 border border-blue-100 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>NEW PASSWORD</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min. 6 characters)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black font-semibold placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setIsForgotMode(false); setError(''); setSuccessMsg(''); }}
                className="text-xs font-bold text-slate-500 hover:text-blue-600 hover:underline cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 font-semibold">
          New customer?{' '}
          <Link
            to="/register"
            className="text-rose-600 font-extrabold hover:underline ml-1"
          >
            Create Free Account
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

export default Login;

