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
    Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuraConsultant from '../components/AuraConsultant';

const ProgramDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // FULL ACADEMIC DATA REGISTRY
    const programsData = {
        'it': {
            title: 'Information Technology',
            icon: <Terminal size={40} />,
            description: 'Master the architectural foundations of the digital world. Our IT program integrates AI-driven development with robust systems engineering and digital infrastructure.',
            stats: [
                { label: 'AI CORES', value: '32+' },
                { label: 'TOTAL CREDITS', value: '144' },
                { label: 'INDUSTRY PROJECTS', value: '12' }
            ]
        },
        'criminology': {
            title: 'Criminology & Justice',
            icon: <Scale size={40} />,
            description: 'Preparation for elite careers in law enforcement and public safety. We cultivate disciplined leaders specialized in modern criminology and forensic science.',
            stats: [
                { label: 'TACTICAL DRILLS', value: '150+' },
                { label: 'TOTAL CREDITS', value: '138' },
                { label: 'FIELD INTERNSHIPS', value: '02' }
            ]
        },
        'entrepreneurship': {
            title: 'Entrepreneurship',
            icon: <Rocket size={40} />,
            description: 'Incubating the next generation of business disruptors. Our program focuses on startup ecosystem building, venture capital, and innovative leadership.',
            stats: [
                { label: 'STARTUP COHORTS', value: '05' },
                { label: 'TOTAL CREDITS', value: '132' },
                { label: 'SEED FUNDING', value: '1M+' }
            ]
        },
        'education': {
            title: 'Teacher Education',
            icon: <Pencil size={40} />,
            description: 'Developing pedagogical pioneers who are master communicators. Transform the future of learning through innovative teaching methodologies.',
            stats: [
                { label: 'PARTNER SCHOOLS', value: '25+' },
                { label: 'TOTAL CREDITS', value: '140' },
                { label: 'PRACTICUM CARE', value: '1YR' }
            ]
        },
        'hospitality': {
            title: 'Hospitality Management',
            icon: <Hotel size={40} />,
            description: 'World-class training in luxury hotel and tourism operations. Master the art of global service excellence in the modern hospitality landscape.',
            stats: [
                { label: 'GLOBAL PARTNERS', value: '50+' },
                { label: 'TOTAL CREDITS', value: '136' },
                { label: 'SMART LABS', value: '04' }
            ]
        },
        'public-admin': {
            title: 'Public Administration',
            icon: <Landmark size={40} />,
            description: 'Ethics-based leadership training for governance. We prepare public servants to lead with integrity in the complex world of policy and administration.',
            stats: [
                { label: 'GOV AGENCIES', value: '20+' },
                { label: 'TOTAL CREDITS', value: '130' },
                { label: 'POLICY BRIEFS', value: '08' }
            ]
        }
    };

    // Fallback logic for unknown programs + BSIT Alias
    const effectiveId = id === 'bsit' ? 'it' : id;
    const program = programsData[effectiveId] || {
        title: 'Academic Program',
        icon: <GraduationCap size={40} />,
        description: 'Advanced institutional training for the next generation of industry leaders.',
        stats: [
            { label: 'DURATION', value: '4 YEARS' },
            { label: 'CREDITS', value: '120+' },
            { label: 'INTERNSHIP', value: '6 MONTHS' }
        ]
    };

    return (
        <div className="min-h-screen bg-[#001f3f] text-white font-sans selection:bg-yellow-400 selection:text-blue-900 overflow-x-hidden text-center">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 blur-[120px] rounded-full"></div>
            </div>

            {/* Smooth Glassmorphic Header - Natural Blurring Zone */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-4 md:px-10 bg-transparent ${scrolled ? 'backdrop-blur-2xl py-4' : 'py-6 md:py-10'}`}>
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

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-20 space-y-24">
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
                        <div key={i} className="p-8 rounded-[3rem] bg-white/5 border border-white/10 text-center space-y-2 transition-all">
                            <div className="text-4xl font-black text-white italic uppercase">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 italic">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="py-12 text-center border-t border-white/10 mt-20">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-300">© 2026 Aura Integrated University. Precision Academic Ecosystem.</p>
            </footer>

            <AuraConsultant />
        </div>
    );
};

export default ProgramDetail;
