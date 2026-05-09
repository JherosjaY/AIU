import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, BookOpen, CheckCircle2, RefreshCw, AlertCircle, Info, X, HelpCircle, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import API_BASE_URL from '../api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMsg(data.message || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Forgot Password Error:', error)
      setStatus('error')
      setErrorMsg('Unable to reach the server. Please check your connection.')
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





      {/* ── Main Content (Centered One-Screen View) ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-6 mt-8 md:mt-0 mb-4 md:mb-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-[440px] w-full"
        >
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-white/50 text-center space-y-6"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                  <CheckCircle2 size={32} md:size={40} className="text-emerald-500" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-black text-[#1e3a8a] tracking-tighter italic uppercase leading-tight">
                    Check your <span className="text-emerald-600">Email.</span>
                  </h1>
                  <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                    A reset link has been dispatched to
                  </p>
                  <p className="text-xs md:text-sm font-black text-[#1e40af] uppercase tracking-tighter italic">
                    {email}
                  </p>
                </div>
                
                <div className="pt-4 space-y-3">
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-700 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 active:scale-[0.98] transition-all shadow-xl shadow-blue-900/10"
                  >
                    Return to Portal <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => { setStatus('idle'); setEmail(''); }}
                    className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                  >
                    Try a different email
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* High Prestige Header */}
                <div className="text-center mb-8 md:mb-10">
                  <h1 className="text-3xl md:text-4xl font-black text-[#1e3a8a] tracking-tighter italic uppercase leading-none drop-shadow-md">
                    Forgot <span className="text-blue-700">Password?</span>
                  </h1>
                  <p className="text-[9px] md:text-[10px] font-black text-white mt-4 md:mt-3 uppercase tracking-[0.4em] leading-relaxed drop-shadow-lg opacity-90">
                    Enter your email to receive recovery instructions
                  </p>
                </div>

                {/* Auth Card (Purified White) */}
                <div className="bg-white rounded-[2.5rem] p-9 md:p-10 shadow-[0_45px_110px_rgba(0,0,0,0.14)] border border-white/50 relative overflow-hidden">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Institutional Email Address
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value.toUpperCase())}
                          placeholder="NAME@GMAIL.COM"
                          className="w-full bg-gray-50 border border-black/10 focus:border-black/30 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all text-sm font-black !text-slate-900 uppercase placeholder:text-gray-300 tracking-widest"
                          required
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {status === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl"
                        >
                          <AlertCircle size={16} className="text-red-500 shrink-0" />
                          <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest leading-none">{errorMsg}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <button 
                      type="submit"
                      disabled={!email.trim() || status === 'loading'}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                        ${(!email.trim() || status === 'loading') 
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                          : 'bg-blue-700 text-white hover:bg-blue-600 active:scale-[0.98] shadow-xl shadow-blue-900/10'}`}
                    >
                      {status === 'loading' ? (
                        <><RefreshCw size={18} className="animate-spin" /> Verifying...</>
                      ) : (
                        <>Send Reset Link <ChevronRight size={18} strokeWidth={2.5} /></>
                      )}
                    </button>
                  </form>

                  {/* Back to Login Redirect */}
                  <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                    <button
                      onClick={() => navigate('/login')}
                      className="text-[10px] font-black text-gray-400 hover:text-blue-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                    >
                      <ArrowLeft size={12} /> Back to Portal Login
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                    <HelpCircle size={24} className="text-blue-700" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">Email Help</h3>
                </div>

                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">1</div>
                      <p className="text-[10px] text-gray-600 leading-relaxed font-bold uppercase tracking-widest">
                        Wait for <strong>3-5 minutes</strong> for delivery.
                      </p>
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-gray-200">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">2</div>
                      <p className="text-[10px] text-gray-600 leading-relaxed font-bold uppercase tracking-widest">
                        Check your <strong>Spam/Junk</strong> folder.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full py-4 bg-blue-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 shadow-xl transition-all"
                >
                  Got it, thanks!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ForgotPassword
