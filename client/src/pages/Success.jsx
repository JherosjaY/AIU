import { useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, Info, Mail, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

function Success() {
  const location = useLocation()
  const [successData, setSuccessData] = useState(location.state)

  useEffect(() => {
    // If no state from router (new tab), check localStorage
    if (!successData) {
      const cached = localStorage.getItem('aura_success_data');
      if (cached) {
        try {
          setSuccessData(JSON.parse(cached));
          localStorage.removeItem('aura_success_data'); // One-time use
        } catch (e) {
          console.error("Failed to parse success data");
        }
      }
    }
  }, [successData]);

  const handleClose = () => {
    window.close();
    // Fallback instruction for browser security limitations
    alert("Please close this tab manually from your browser.");
  };

  // Strict Routing: If no data found in router state or localStorage, redirect to landing
  if (!successData || !successData.firstName) {
    return <Navigate to="/" replace />
  }

  return <SuccessContent successData={successData} handleClose={handleClose} />
}

function SuccessContent({ successData, handleClose }) {
  const { firstName, lastName, course, email } = successData;
  return (
    <div className="relative flex flex-col min-h-screen overflow-y-auto font-sans bg-[#F8FAFC]">

      {/* ── BACKGROUND LAYER ── */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img src="/campus.png" alt="Campus Background" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-[480px] w-full bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_40px_80px_rgba(30,64,175,0.1)] border border-blue-50 relative overflow-hidden text-center"
        >
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[80px] -mr-12 -mt-12 border-b border-l border-emerald-100/30" />

          {/* Premium Success Icon */}
          <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm relative z-10">
            <BadgeCheck size={44} className="text-emerald-600 drop-shadow-sm" />
          </div>

          {/* High Prestige Header */}
          <div className="mb-6 relative z-10">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-tight mb-2">
              Institutional <br />
              <span className="text-blue-700">Admission Filed</span>
            </h1>
            <div className="flex items-center justify-center gap-2 opacity-30">
              <div className="h-[1px] w-6 bg-slate-400" />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Aura Official Registry</p>
              <div className="h-[1px] w-6 bg-slate-400" />
            </div>
          </div>

          {/* Detailed Message Box */}
          <div className="bg-slate-50 rounded-[1.5rem] p-6 md:p-8 border border-slate-100 mb-6 text-left relative">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 border border-blue-100 shadow-sm">
                <Mail size={20} />
              </div>
              <div className="space-y-3">
                <p className="text-[13px] text-slate-700 font-bold leading-relaxed italic">
                  "Thank you, {firstName}. Your application for <span className="text-blue-700 underline decoration-blue-200 underline-offset-4">{course}</span> has been logged."
                </p>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Confirmation and instructions will be sent to your email: <span className="text-blue-700 font-bold select-all">{email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* The Instruction Action */}
          <div className="space-y-4">
            <button
              onClick={handleClose}
              className="w-full py-4 rounded-[1.25rem] bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <XCircle size={16} /> Close This Tab/Page
            </button>
            
            <div className="flex items-center justify-center gap-2 py-2 text-amber-600 border-y border-amber-100/50">
              <Info size={12} className="shrink-0" />
              <p className="text-[8px] font-black uppercase tracking-widest leading-none">
                You may now safely close this window to end your session.
              </p>
            </div>
          </div>

          {/* Footer Security Note */}
          <p className="mt-8 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
            Institutional Registry Protocol finalized. System is ready for safe disconnection.
          </p>
        </motion.div>
        
        {/* Subtle Bottom Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="mt-6 flex items-center gap-2"
        >
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Secure Connection Established</span>
        </motion.div>
      </div>
    </div>
  )
}

export default Success
