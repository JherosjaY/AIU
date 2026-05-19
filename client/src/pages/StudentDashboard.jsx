import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, 
    BookOpen, 
    ShieldCheck, 
    LogOut, 
    Bell, 
    Calendar,
    FileText,
    Zap,
    ChevronRight,
    Award,
    Clock,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL, { authFetch } from '../api';

const COURSE_MAP = {
    "BSIT": "Bachelor of Science in Information Technology",
    "BSCRIM": "Bachelor of Science in Criminology & Justice",
    "BSENTREP": "Bachelor of Science in Entrepreneurship",
    "BSED": "Bachelor of Secondary Education",
    "BSHM": "Bachelor of Science in Hospitality Management",
    "BPA": "Bachelor of Public Administration"
};

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await authFetch(`${API_BASE_URL}/enrollments/me`);
                const data = await res.json();
                if (data.success) {
                    setProfile(data.data);
                }
            } catch (err) {
                console.error("Registry Sync Failure:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-blue-700" size={40} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-700 animate-pulse">Syncing Registry...</p>
                </div>
            </div>
        );
    }



    return (
        <div className="light-theme min-h-screen bg-[#f8fafc] text-gray-900 font-sans selection:bg-blue-100 relative overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/40 blur-[120px] rounded-full"></div>
            </div>

            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 md:py-6 bg-white/70 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex justify-between items-center text-blue-700">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-[#1e40af] p-2 rounded-xl shadow-lg shadow-blue-800/20 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="text-white" size={20} />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg font-black italic tracking-tighter text-gray-900 uppercase italic leading-none">Aura <span className="text-blue-700">Portal</span></span>
                            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-400 mt-1">Student Environment</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white border border-gray-200 hover:bg-rose-50 hover:border-rose-200 transition-all font-bold text-[9px] uppercase tracking-widest text-gray-500 hover:text-rose-600 shadow-sm"
                    >
                        <span className="hidden sm:inline">Sign Out</span> <LogOut size={12} />
                    </button>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20 space-y-6 md:space-y-12">
                
                {/* Welcome Hero */}
                <section className="relative overflow-hidden p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] bg-white border border-gray-100 shadow-[0_45px_110px_-10px_rgba(30,64,175,0.12)] md:shadow-[0_65px_140px_-20px_rgba(30,64,175,0.1)]">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none text-blue-900 hidden md:block">
                        <User size={300} strokeWidth={1} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 relative z-10">
                        <div className="space-y-3 md:space-y-4">
                            <div className="inline-flex items-center gap-3 px-3 md:px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[8px] md:text-[10px] font-bold tracking-widest uppercase italic border-dashed">
                                Institutional Access Verified
                            </div>
                            <h1 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-gray-900">
                                Welcome, <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">{profile?.firstName || 'Scholar'}.</span>
                            </h1>
                            <p className="text-gray-400 text-[10px] md:text-sm font-bold italic uppercase tracking-widest leading-none mt-1 md:mt-2">
                                ID: {user?.authId || 'AIU-STUDENT-PROSPECT'}
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 border border-gray-100 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-6 shadow-inner w-full md:w-auto overflow-hidden">
                            <div className="text-right flex-1 md:flex-none">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Local Server Time</p>
                                <p className="text-xl md:text-2xl font-black italic tracking-tighter mt-1 text-gray-900">{currentTime.toLocaleTimeString()}</p>
                            </div>
                            <div className="w-[1px] h-12 bg-gray-200"></div>
                            <div className="text-blue-600 shrink-0">
                                <Clock size={24} md:size={28} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Status Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    
                    {/* Enrollment Card */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] space-y-6 md:space-y-8 group transition-all shadow-[0_45px_110px_-10px_rgba(30,64,175,0.1)] md:shadow-[0_65px_140px_-20px_rgba(30,64,175,0.08)] hover:shadow-2xl hover:shadow-blue-900/10"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-current flex items-center justify-center">
                            <ShieldCheck size={28} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl md:text-2xl font-bold italic uppercase tracking-tighter text-gray-900">Enrollment Status</h3>
                            <div className="inline-block px-4 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-blue-900/10">
                                Officially Enrolled
                            </div>
                            <p className="text-gray-400 text-sm font-semibold leading-relaxed italic">
                                Your admission profile has been fully validated and authorized by the Registrar.
                            </p>
                        </div>
                    </motion.div>

                    {/* Academic Program Card */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] space-y-6 md:space-y-8 group transition-all shadow-[0_45px_110px_-10px_rgba(30,64,175,0.1)] md:shadow-[0_65px_140px_-20px_rgba(30,64,175,0.08)] hover:shadow-2xl hover:shadow-blue-900/10"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <BookOpen size={28} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold italic uppercase tracking-tighter text-gray-900">Academic Path</h3>
                            <div className="text-xl font-bold text-blue-700 italic uppercase">{COURSE_MAP[profile?.course] || profile?.course || 'Processing...'}</div>
                            <p className="text-gray-400 text-sm font-semibold leading-relaxed italic">
                                Institutional Cycle 2026-2027 • AI-Managed Admittance.
                            </p>
                        </div>
                    </motion.div>

                    {/* Institutional Notice Card */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] space-y-6 md:space-y-8 group transition-all shadow-[0_45px_110px_-10px_rgba(30,64,175,0.1)] md:shadow-[0_65px_140px_-20px_rgba(30,64,175,0.08)] hover:shadow-2xl hover:shadow-blue-900/10"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <Bell size={28} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold italic uppercase tracking-tighter text-gray-900">Latest Notice</h3>
                            <div className="space-y-2">
                                <p className="text-gray-800 font-bold text-sm uppercase tracking-widest italic leading-tight">Welcome Orientation</p>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">May 15, 2026 • AIU Grand Hall</p>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Academic Subjects Mockup */}
                <section className="space-y-6 pt-12">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-blue-700 rounded-full"></div>
                            <h3 className="text-2xl font-bold italic uppercase tracking-tighter text-gray-900">Current Semester Load</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full border border-gray-200">1st Semester • 2026</span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { code: 'IT101', name: 'Intro to Computing', room: 'Lab 201', time: '08:00 AM', color: 'blue' },
                            { code: 'IT102', name: 'Comp Programming 1', room: 'Lab 203', time: '10:30 AM', color: 'indigo' },
                            { code: 'IT103', name: 'Discrete Math', room: 'Rm 402', time: '01:00 PM', color: 'emerald' },
                            { code: 'IT104', name: 'Networking 1', room: 'Rm 301', time: '02:30 PM', color: 'amber' },
                            { code: 'IT105', name: 'Database Systems', room: 'Lab 202', time: '04:00 PM', color: 'violet' }
                        ].map((subject, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-${subject.color}-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-${subject.color}-500/10 transition-all`} />
                                
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{subject.code}</span>
                                    <div className={`p-2 rounded-xl bg-gray-50 text-gray-300 group-hover:text-${subject.color}-600 group-hover:bg-${subject.color}-50 transition-all`}>
                                        <BookOpen size={16} />
                                    </div>
                                </div>
                                
                                <h4 className="text-lg font-bold italic tracking-tight text-gray-900 mb-2">{subject.name}</h4>
                                
                                <div className="flex flex-col gap-2 border-t border-gray-50 pt-4 mt-4">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                        <Calendar size={12} /> Mon / Wed / Fri
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1">
                                        <Clock size={12} className={`text-${subject.color}-600`} /> {subject.time} • {subject.room}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Quick Actions / Resources */}
                <div className="grid md:grid-cols-2 gap-8 pt-12">
                     <button className="flex items-center justify-between p-10 bg-white border border-gray-100 rounded-[3rem] hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 border border-gray-100">
                                <FileText size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-lg font-bold italic uppercase text-gray-900 leading-none">Admission Slip</h4>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2 block">Institutional PDF</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                     </button>

                     <button className="flex items-center justify-between p-10 bg-white border border-gray-100 rounded-[3rem] hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-amber-600 border border-gray-100">
                                <Award size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-lg font-bold italic uppercase text-gray-900 leading-none">Scholarship Status</h4>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2 block">Full Academic Grant</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-amber-600 group-hover:bg-amber-50 transition-all">
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                     </button>
                </div>

            </main>

            <footer className="py-8 md:py-12 text-center border-t border-gray-100 mt-10 md:mt-20 px-6">
                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.5em] text-gray-300 leading-relaxed">© 2026 Aura Integrated University. Your Academic Journey Starts Now.</p>
            </footer>
        </div>
    );
};

export default StudentDashboard;
