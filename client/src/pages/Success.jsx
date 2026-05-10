import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, ChevronRight } from 'lucide-react'

function Success() {
  const navigate = useNavigate()
  const location = useLocation()

  // Strict Routing: If no registration state, redirect to landing
  if (!location.state || !location.state.firstName) {
    return <Navigate to="/" replace />
  }

  const { firstName, lastName, course, email } = location.state

  return (
    <div className="relative flex flex-col h-screen overflow-hidden font-sans">

      {/* ── BACKGROUND LAYER ── */}
      <div className="absolute inset-0 z-0">
        <img src="/campus.png" alt="Campus Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-[460px] w-full bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_45px_110px_rgba(0,0,0,0.18)] border border-white/50 relative overflow-hidden text-center"
        >
          {/* Premium Success Icon */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-sm">
            <BadgeCheck size={48} className="text-emerald-600 drop-shadow-sm" />
          </div>

          {/* High Prestige Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-[#1e3a8a] tracking-tighter italic uppercase leading-none drop-shadow-md mb-3">
              Application <br />
              <span className="text-blue-700">Received!</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] leading-relaxed">
              Official Institutional Registry
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 mb-10 text-left">
            <p className="text-xs text-gray-500 font-medium leading-relaxed italic mb-4">
              "Thank you for your application! We will send an update to your email once we are done reviewing your documents."
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px] font-bold gap-4">
                <span className="text-gray-400 uppercase tracking-widest min-w-16">Name:</span>
                <span className="text-gray-900 uppercase tracking-tighter text-right truncate">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold gap-4">
                <span className="text-gray-400 uppercase tracking-widest min-w-16">Course:</span>
                <span className="text-blue-700 uppercase tracking-tighter text-right truncate">{course}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold gap-4">
                <span className="text-gray-400 uppercase tracking-widest min-w-16">Email:</span>
                <span className="text-gray-900 font-medium tracking-tight text-right truncate lowercase">{email || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Next Step Button */}
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-4 rounded-2xl bg-blue-700 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            Back to Login <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">
            Please remember to check your Spam or Junk folder for our email update once we finish reviewing your documents.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Success
