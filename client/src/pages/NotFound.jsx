import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, Home, Search, AlertTriangle } from 'lucide-react';
import AuraConsultant from '../components/AuraConsultant';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white overflow-hidden relative flex flex-col pt-24 pb-12 px-6">
      
      {/* ─── PREMIUM BACKGROUND GLOWS ─── */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-white/5 blur-sm rotate-45 pointer-events-none"></div>

      {/* ─── MINIMAL NAVBAR OVERRIDE ─── */}
      <nav className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
             <span className="text-white font-black text-xl md:text-2xl font-serif">A</span>
          </div>
          <div>
            <h1 className="text-white font-black text-xl md:text-2xl tracking-tighter leading-none">
              Aura <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">Integrated</span>
            </h1>
          </div>
        </Link>
      </nav>

      {/* ─── MAIN 404 CONTENT ─── */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 text-center max-w-4xl mx-auto w-full">
        
        {/* Institutional Branding Icon */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: [0, -15, 0], opacity: 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150"></div>
          <div className="w-24 h-24 md:w-28 md:h-28 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 border-2 border-blue-400/30">
             <span className="text-white font-black text-4xl md:text-5xl font-serif">A</span>
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative inline-block"
        >
          <h1 className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-900/50">
            404
          </h1>
          <div className="absolute bottom-4 right-[-10px] md:right-[-20px] bg-red-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border border-red-400">
            Sector Unknown
          </div>
        </motion.div>

        {/* Informational Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 md:mt-10"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Institutional Record Not Found.
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            The quadrant of the Aura database you are trying to access does not exist, has been moved, or is restricted. Please verify your destination.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mt-12 w-full sm:w-auto"
        >
          <Link to="/" className="group relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <button className="relative w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-full shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 border border-blue-400/50 hover:border-blue-300">
              <Home size={20} />
              Return to Portal
            </button>
          </Link>
          
          <Link to="/programs" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all backdrop-blur-md flex items-center justify-center gap-3">
            <Search size={20} className="text-yellow-400" />
            Explore Programs
          </Link>
        </motion.div>

      </main>

      {/* Floating AI Consultant - Keeps theme consistent */}
      <AuraConsultant />
    </div>
  );
};

export default NotFound;
