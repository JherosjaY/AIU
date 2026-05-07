import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, BookOpen, GraduationCap, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TIMELINE_DATA = [
  {
    month: "July 2026",
    title: "Official Admissions & Registration",
    dateRange: "July 1 - August 10",
    desc: "The portal opens for incoming freshmen, transferees, and continuing scholars for the institutional admissions process.",
    icon: <BookOpen className="text-blue-400" size={24} />
  },
  {
    month: "August 2026",
    title: "Start of Classes & Orientation",
    dateRange: "August 12, 2026",
    desc: "The official commencement of the semester. Formal university-wide orientation will be held across all colleges.",
    icon: <CalendarDays className="text-yellow-400" size={24} />,
    isHighlighted: true
  },
  {
    month: "October 2026",
    title: "Midterm Examinations",
    dateRange: "October 14 - 18",
    desc: "A rigorous assessment period for all students to evaluate mid-semester academic progress.",
    icon: <CheckCircle2 className="text-slate-400" size={24} />
  },
  {
    month: "December 2026",
    title: "Final Revalida & Break",
    dateRange: "December 14 - 20",
    desc: "The culmination of the academic term through final defense, culminating activities, and major assessments.",
    icon: <GraduationCap className="text-emerald-400" size={24} />
  }
];

function AcademicCalendar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white overflow-hidden relative selection:bg-yellow-400 selection:text-blue-900 font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0 flex items-center justify-center">
        <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-blue-600/20 blur-[150px] rounded-full absolute -top-40 -left-40"></div>
        <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-indigo-900/40 blur-[150px] rounded-full absolute bottom-0 right-[-20%]"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-12 transition-all duration-500 ${scrolled ? 'py-4 backdrop-blur-xl bg-[#0a0f1c]/80' : 'py-4 md:py-8'}`}>
        <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-blue-100/40 hover:text-white font-black text-[8px] md:text-xs uppercase tracking-widest transition-all bg-white/5 backdrop-blur-md px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl border border-white/5 hover:bg-white/10"
        >
            <ArrowLeft size={14} md:size={16} /> <span className="hidden sm:inline">Return to Portal</span><span className="sm:hidden">Portal</span>
        </button>
      </nav>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-32 pb-32">
        
        {/* Header Title */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16 md:mb-28 space-y-4"
        >
          <div className="inline-flex items-center justify-center gap-3 bg-yellow-400/10 border border-yellow-400/20 px-6 py-2 rounded-full mb-4 md:mb-6 text-yellow-400 font-black text-[8px] md:text-[10px] tracking-[0.5em] uppercase">
             <CalendarDays size={14} /> Official Schedule
          </div>
          <h1 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight md:leading-none">
            Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">Timeline</span>
          </h1>
          <p className="text-blue-100/50 font-bold uppercase tracking-widest text-[10px] md:text-sm max-w-2xl mx-auto italic mt-4 md:mt-6">
            Institutional Calendar for Academic Year 2026-2027
          </p>
          <motion.div 
             animate={{ y: [0, 10, 0] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="flex justify-center pt-6 md:pt-8 text-blue-100/20"
          >
             <ChevronDown size={24} md:size={32} />
          </motion.div>
        </motion.div>

        {/* Vertical Timeline */}
        <div className="relative">
          {/* Glowing Track Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-900 via-yellow-400/30 to-transparent transform md:-translate-x-1/2"></div>
          
          <div className="space-y-24 pt-10">
            {TIMELINE_DATA.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className={`flex flex-col md:flex-row items-start md:items-center relative w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  
                  {/* Timeline Node/Circle */}
                  <div className={`absolute left-8 md:left-1/2 transform -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-full flex items-center justify-center border-4 z-20 transition-all duration-700 shadow-2xl
                    ${item.isHighlighted 
                      ? 'bg-[#0a0f1c] border-yellow-400 shadow-[0_0_50px_rgba(251,191,36,0.6)] scale-110 md:scale-125' 
                      : 'bg-[#0a0f1c] border-blue-900 shadow-[0_0_20px_rgba(30,58,138,0.5)] hover:border-blue-700'
                    }`}
                  >
                    {item.isHighlighted && (
                      <span className="absolute inset-0 rounded-xl md:rounded-full bg-yellow-400/20 animate-ping" />
                    )}
                    <span className="relative z-10 scale-75 md:scale-100">{item.icon}</span>
                  </div>

                  {/* Content Card */}
                  <div className={`w-full pl-20 md:pl-0 md:w-1/2 ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
                    <div className={`bg-white/[0.02] backdrop-blur-xl border p-6 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-500 hover:bg-white/[0.04]
                      ${item.isHighlighted ? 'border-yellow-400/50 shadow-[0_20px_60px_-15px_rgba(251,191,36,0.15)] ring-1 ring-yellow-400/20' : 'border-white/5'}
                    `}>
                      <span className="text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase text-blue-300/40 italic block mb-2 md:mb-3">
                        {item.month}
                      </span>
                      <h3 className={`text-lg md:text-2xl lg:text-3xl font-black italic uppercase tracking-tighter mb-3 md:mb-4 
                        ${item.isHighlighted ? 'text-yellow-400' : 'text-white'}`}
                      >
                        {item.title}
                      </h3>
                      
                      {/* Highlighted Date */}
                      <div className={`inline-block px-4 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 md:mb-5 border border-dashed
                        ${item.isHighlighted ? 'bg-yellow-400/10 text-yellow-300 border-yellow-400/50' : 'bg-blue-900/20 text-blue-200 border-blue-800/50'}
                      `}>
                        {item.dateRange}
                      </div>
                      
                      <p className="text-blue-100/60 font-medium text-xs md:text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                </motion.div>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  );
}

export default AcademicCalendar;
