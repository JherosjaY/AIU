import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, GraduationCap, ArrowRight } from 'lucide-react'

function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Retrieve the email passed from Register.jsx, fallback if not found
  const userEmail = location.state?.email || "your email address"

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="flex items-center justify-center min-h-screen p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-3xl p-10 md:p-12 text-center shadow-xl shadow-blue-900/5 border border-gray-100"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 1, bounce: 0.5 }}
            className="w-24 h-24 mx-auto bg-green-50 rounded-[2rem] flex items-center justify-center mb-10 border border-green-100 shadow-inner relative"
          >
            {/* Animated Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute inset-0 rounded-[2rem] border-2 border-green-200 pointer-events-none"
            />
            
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                d="M20 6L9 17L4 12"
              />
            </svg>
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            Admission Secured
          </h1>
          
          <p className="text-gray-500 leading-relaxed mb-10 text-base">
            Congratulations! Your application has been successfully submitted. We will contact you at <span className="text-blue-700 font-semibold">{userEmail}</span> once our registrars have reviewed your information.
          </p>

          <button 
            onClick={() => navigate('/login')}
            className="group w-full bg-blue-700 hover:bg-blue-600 text-white py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 active:scale-[0.98]"
          >
            Proceed to Login Terminal
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-blue-300" />
          </button>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">
              Need help? Contact admissions at <span className="text-blue-600 underline">aiu.admissions.official@gmail.com</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Success
