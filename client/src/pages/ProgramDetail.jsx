import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ArrowRight,
    GraduationCap,
    BookOpen,
    Terminal,
    Zap,
    Scale,
    Rocket,
    Pencil,
    Hotel,
    Landmark,
    Monitor
} from 'lucide-react';
import API_BASE_URL from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import AuraConsultant from '../components/AuraConsultant';

const ProgramDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [program, setProgram] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const ICON_MAP = {
        Monitor: <Monitor size={40} />,
        Scale: <Scale size={40} />,
        Rocket: <Rocket size={40} />,
        Pencil: <Pencil size={40} />,
        Hotel: <Hotel size={40} />,
        Landmark: <Landmark size={40} />,
        GraduationCap: <GraduationCap size={40} />,
        Terminal: <Terminal size={40} />
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/quotas`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Find the program by matching acronym (case-insensitive) or slug
                    const found = data.find(p => p.courseAbbr.toLowerCase() === id.toLowerCase() || (id.toLowerCase() === 'it' && p.courseAbbr === 'BSIT'));
                    if (found) {
                        setProgram({
                            title: found.courseName || found.courseAbbr,
                            icon: ICON_MAP[found.iconName] || <GraduationCap size={40} />,
                            description: found.description || 'Advanced institutional training for the next generation of industry leaders.',
                            highlights: (found.highlights || 'Global Standards, Research Excellence, Industry Integration').split(',').map(s => s.trim()),
                            color: found.color || 'border-blue-600',
                            stats: [
                                { label: 'DURATION', value: `${found.years || 4} YEARS` },
                                { label: 'TOTAL CREDITS', value: found.credits || 120 },
                                { label: 'CAPACITY', value: found.maxSlots || 50 }
                            ]
                        });
                    }
                }
            } catch (error) {
                console.error("Fetch Program Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProgram();
    }, [id]);

    if (isLoading) return <div className="min-h-screen bg-[#001f3f] flex items-center justify-center"><Zap size={40} className="text-yellow-400 animate-pulse" /></div>;

    if (!program) {
        return (
            <div className="min-h-screen bg-[#001f3f] flex flex-col items-center justify-center p-10 text-center">
                <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-4">404</h1>
                <p className="text-blue-100 font-bold uppercase tracking-widest mb-10">Program Not Found in Registry</p>
                <button onClick={() => navigate('/programs')} className="px-10 py-4 bg-yellow-400 text-blue-900 rounded-full font-black uppercase tracking-widest shadow-xl shadow-yellow-900/10">Back to Academic Page</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#001f3f] text-white font-sans selection:bg-yellow-400 selection:text-blue-900 overflow-x-hidden text-center">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 blur-[120px] rounded-full"></div>
            </div>



            {/* Smooth Glassmorphic Header - Natural Blurring Zone */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-4 md:px-10 bg-transparent ${scrolled ? 'backdrop-blur-2xl py-4' : 'py-6 md:py-10'} hidden md:block`}>
                <div className="flex justify-between items-center w-full">
                    <button
                        onClick={() => navigate('/programs')}
                        className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white/5 border border-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-blue-100"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-[#1e40af] p-2 rounded-xl shadow-lg group font-black text-white text-left">
                            <Zap className="text-yellow-400 fill-yellow-400" size={18} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-xl font-black tracking-tighter leading-none text-white uppercase italic text-left">Aura Academic</span>
                            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-blue-300 text-left italic">Program Specification</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 md:pt-40 pb-20 space-y-24">
                {/* Simplified Hero for Program */}
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="text-center md:text-left space-y-6 md:space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 md:px-6 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase"
                        >
                            Academic Specification
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase leading-none"
                        >
                            BS in <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">{program.title}.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-blue-100/70 text-sm md:text-lg font-bold leading-relaxed italic uppercase opacity-80"
                        >
                            {program.description}
                        </motion.p>

                        <div className="flex justify-center md:justify-start pt-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-yellow-400 text-blue-900 px-8 md:px-10 py-4 rounded-full font-black text-lg md:text-xl active:scale-95 transition-all shadow-2xl flex items-center gap-3 animate-pulse-bounce uppercase italic"
                            >
                                Enroll Now <ArrowRight />
                            </button>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center pt-10 md:pt-0"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-20 transition-opacity"></div>
                            <div className="w-64 h-64 md:w-80 md:h-80 rounded-[3rem] md:rounded-[4rem] bg-white/5 border border-white/10 flex items-center justify-center text-yellow-400 shadow-3xl transform rotate-3 transition-transform duration-500 backdrop-blur-3xl">
                                <div className="transform -rotate-3 transition-transform duration-500 scale-[2] md:scale-[2.5]">
                                    {program.icon}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Stats & Details */}
                <div className="grid md:grid-cols-3 gap-8">
                    {program.stats.map((stat, i) => (
                        <div key={i} className="p-8 rounded-[3rem] bg-white/5 border border-white/10 text-center space-y-2 transition-all hover:bg-white/10 hover:border-yellow-400/30">
                            <div className="text-4xl font-black text-white italic uppercase tracking-tighter">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 italic">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Institutional Pillars Section */}
                <div className="space-y-12">
                    <div className="flex items-center gap-6">
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                        <h2 className="text-2xl font-black italic uppercase tracking-widest text-blue-300 opacity-50">Institutional Pillars</h2>
                        <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {program.highlights.map((pillar, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="group p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] shadow-2xl"
                            >
                                <div className="bg-[#001f3f] p-8 rounded-[2.4rem] h-full flex flex-col items-center justify-center text-center space-y-4 border border-white/5 group-hover:border-yellow-400/20 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-yellow-400">
                                        <Zap size={20} />
                                    </div>
                                    <h4 className="text-lg font-black italic uppercase tracking-tight text-white leading-tight">{pillar}</h4>
                                    <p className="text-[10px] font-bold text-blue-300/40 uppercase tracking-widest">Aura Core Competency</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="py-12 px-6 text-center border-t border-white/10 mt-20">
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em] text-blue-300/50 max-w-[250px] md:max-w-none mx-auto leading-relaxed italic">
                    © 2026 Aura Integrated University <br className="md:hidden" /> Precision Academic Ecosystem.
                </p>
            </footer>

            <AuraConsultant />
        </div>
    );
};

export default ProgramDetail;
