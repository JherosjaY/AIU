import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Lock,
  User,
  ChevronRight,
  ArrowLeft,
  Info,
  BookOpen,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import API_BASE_URL from '../api'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [authId, setAuthId] = useState('')
  const [password, setPassword] = useState('')
  const [detectedRole, setDetectedRole] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Smart Role Detection System
  useEffect(() => {
    const rawId = authId.trim().toUpperCase()
    if (rawId === 'ADMIN' || rawId === 'ADMIN@AURA.EDU.PH' || rawId.match(/^ADM-[0-9]{3}$/)) {
      setDetectedRole('Administrator')
    } else if (rawId.match(/^[0-9]{2}-[0-9]{4}-[0-9]{3}$/) || rawId.endsWith('@AURA.EDU.PH')) {
      setDetectedRole('Student')
    } else if (rawId.match(/^F-[0-9]{4}$/)) {
      setDetectedRole('Faculty')
    } else {
      setDetectedRole(null)
    }
  }, [authId])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!authId || !password) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authId, password }),
      });

      const data = await response.json();

      if (data.success) {
        login(data.role, data.user.authId);
        if (data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        setError(data.message || 'Authentication Failed');
      }
    } catch (error) {
      console.error('Login Error:', error);
      setError("Server Error. Please try again later.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden text-left font-sans">

      {/* ── BACKGROUND LAYER ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/campus.png"
          alt="Campus Background"
          className="w-full h-full object-cover"
        />
        {/* Softened white overlay for high contrast */}
        <div className="absolute inset-0 bg-white/35 backdrop-blur-[1px]" />
      </div>



      {/* ── DESKTOP BRANDING HEADER ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 hidden md:block">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 bg-[#1e40af] rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 group font-black text-white">
            <BookOpen className="text-yellow-400" size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-black tracking-tighter leading-none text-blue-700 uppercase italic drop-shadow-sm">Aura Integrated University</span>
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white drop-shadow-md">Official Regional Portal</span>
          </div>
        </div>
      </nav>

      {/* ── Main Content (Fixed One-Screen View) ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 md:p-6 mt-8 md:mt-0 mb-4 md:mb-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-[440px] w-full"
        >
          {/* High Prestige Header (Tighter for Mobile) */}
          <div className="text-center mb-8 md:mb-12 cursor-default">
            <h1 className="text-3xl md:text-4xl font-black text-[#1e3a8a] tracking-tighter italic uppercase leading-none drop-shadow-md">
              Welcome <span className="text-blue-700">Back!</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-black text-white mt-4 md:mt-3 uppercase tracking-[0.4em] leading-relaxed drop-shadow-lg opacity-90">
              Sign in to access your student portal
            </p>
          </div>

          {/* Auth Card (Purified White with Mobile Spacing) */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_45px_110px_rgba(0,0,0,0.14)] border border-white/50 relative overflow-hidden mb-8 md:mb-0">
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* ID Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Aura Service ID
                </label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="text"
                    value={authId}
                    onChange={(e) => setAuthId(e.target.value.toUpperCase())}
                    placeholder="USER ID"
                    className="w-full bg-gray-50 border border-black/10 focus:border-blue-700 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-black !text-black caret-blue-700 uppercase placeholder:text-gray-300 tracking-widest"
                    required
                  />
                </div>
                {detectedRole && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 mt-2 ml-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{detectedRole} Account Verified</span>
                  </motion.div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Institutional Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-black/10 focus:border-blue-700 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-black !text-black caret-blue-700 tracking-widest placeholder:text-gray-300"
                    required
                  />
                </div>
              </div>

              {/* Action Row */}
              <div className="flex items-center justify-end pr-1">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[9px] font-black text-blue-700 uppercase tracking-widest hover:text-blue-800 transition-all underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl"
                  >
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest leading-none">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-700 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 active:scale-[0.98] transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <>Sign In <ChevronRight size={18} strokeWidth={2.5} /></>
                )}
              </button>
            </form>

            {/* Registration Redirect */}
            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">New Student?</p>
              <button
                onClick={() => navigate('/register')}
                className="text-sm font-black italic text-blue-700 hover:text-blue-800 transition-all uppercase"
              >
                Enroll Now →
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed Overlay Footer - Only on Desktop */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-50 shrink-0 py-8 text-center bg-gradient-to-t from-black/20 to-transparent">
        <p className="text-[10px] text-white font-bold uppercase tracking-[0.5em] shadow-sm opacity-80">
          &copy; 2026 Aura Integrated University. All rights reserved.
        </p>
      </div>

      {/* Floating Need Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] bg-blue-700 hover:bg-blue-600 text-white min-w-[3.5rem] md:px-6 py-3.5 md:py-3 rounded-full md:rounded-full shadow-2xl transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest active:scale-95"
      >
        <Info size={16} className="text-yellow-400" /> <span className="hidden md:inline">Need Help?</span>
      </button>

      {/* ── Help Dialog ── */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-xl border border-gray-200 relative"
            >
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-8 right-8 w-10 h-10 rounded-xl flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-all"
              >
                <X size={18} />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Info size={24} className="text-blue-700" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">Access Help</h3>
                </div>

                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Credential</span>
                    <span>Format</span>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700 uppercase">Students</span>
                      <code className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">NAME.LAST@AURA.EDU.PH</code>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-700 uppercase">Password</span>
                      <code className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded">AURA@2026####</code>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowHelp(false)}
                  className="w-full py-4 bg-blue-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 shadow-xl transition-all"
                >
                  Confirm Understanding
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── LOCAL STYLES ── */}
      <style>{`
        input {
          color: #000000 !important;
          caret-color: #1d4ed8 !important; /* blue-700 */
        }
        input::placeholder {
          color: #94a3b8 !important; /* Visible Slate-400 */
          opacity: 1 !important;
        }
      `}</style>

    </div>
  )
}

export default Login;
