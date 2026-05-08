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
  X
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
    const rawId = authId.trim().toUpperCase()

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
        alert(`❌ AUTHENTICATION ERROR: ${data.message || 'Verification Failed'}`);
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert("❌ SERVER ERROR: Could not reach the authentication portal. Please check your connection.");
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

      {/* ── Fixed Navigation (Elite Branding Overlay) ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-10 py-6 md:py-8 flex justify-between items-center bg-transparent">
        {/* Desktop: Logo/Branding as Home Link */}
        <button
          onClick={() => navigate('/')}
          className="hidden md:flex items-center gap-4 group cursor-pointer text-left transition-all hover:scale-[1.02]"
        >
          <div className="w-12 h-12 bg-[#1e40af] rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 group font-black shrink-0 transition-transform group-hover:scale-105">
            <BookOpen className="text-yellow-400" size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-black tracking-tighter text-[#1e40af] leading-none uppercase italic drop-shadow-sm">Aura Integrated University</span>
            <span className="text-[7px] font-black uppercase tracking-[0.5em] text-gray-700 mt-1 opacity-80 group-hover:text-blue-600 transition-colors">Official Regional Portal</span>
          </div>
        </button>

        {/* Mobile: Dedicated Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex md:hidden items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e40af]/10 border border-[#1e40af]/20 backdrop-blur-md transition-all font-black text-[10px] uppercase tracking-widest text-[#1e40af] active:scale-95"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </nav>

      {/* ── Main Content (Centered) ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-6 mt-20 md:mt-16 mb-10 md:mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-[440px] w-full"
        >
          {/* High Prestige Header */}
          <div className="text-center mb-6 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-[#1e3a8a] tracking-tighter italic uppercase leading-none drop-shadow-md">
              Welcome <span className="text-blue-700">Back!</span>
            </h1>
            <p className="text-[8px] md:text-[10px] font-black text-white mt-3 uppercase tracking-[0.4em] leading-relaxed drop-shadow-lg">
              Sign in to access your student portal
            </p>
          </div>

          {/* Auth Card (Purified White) */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-white/50 relative overflow-hidden">
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
                    className="w-full bg-gray-50 border border-black/10 focus:border-black/30 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all text-sm font-black !text-slate-900 uppercase placeholder:text-gray-300 tracking-widest"
                  />
                </div>
                {detectedRole && detectedRole === 'Student' && (
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
                    className="w-full bg-gray-50 border border-black/10 focus:border-black/30 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all text-sm font-black !text-slate-900 tracking-widest placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Utility Row */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                disabled={!detectedRole || !password}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                  ${(!detectedRole || !password)
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-blue-700 text-white hover:bg-blue-600 active:scale-[0.98] shadow-xl shadow-blue-900/10'}`}
              >
                Sign In <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </form>

            {/* Registration Redirect */}
            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase tracking-[0.2em]">New Student?</span>
              <button
                onClick={() => navigate('/register')}
                className="text-sm font-black text-blue-700 hover:text-blue-900 transition-all uppercase italic tracking-tighter"
              >
                Enroll Now →
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed Overlay Footer - Only on Desktop */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-50 shrink-0 py-8 text-center bg-gradient-to-t from-black/20 to-transparent">
        <p className="text-[10px] text-white font-bold uppercase tracking-[0.5em] drop-shadow-md">
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

                <p className="text-[10px] text-gray-400 text-center leading-relaxed font-bold uppercase tracking-widest">
                  Refer to your institutional authorization email <br /> for your specific credentials.
                </p>

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
    </div>
  )
}

export default Login
