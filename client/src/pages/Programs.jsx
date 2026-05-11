import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Monitor, 
    Scale, 
    Rocket, 
    Pencil, 
    Hotel, 
    Landmark,
    Search,
    ArrowRight,
    ChevronLeft,
    BookOpen,
    Zap,
    Sparkles,
    Users,
    GraduationCap
} from 'lucide-react';
import API_BASE_URL from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import AuraConsultant from '../components/AuraConsultant';

const Programs = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const programCategories = ['All', 'Technology', 'Justice', 'Business', 'Education', 'Hospitality', 'Government'];

    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const ICON_MAP = {
        Monitor: <Monitor size={32} />,
        Scale: <Scale size={32} />,
        Rocket: <Rocket size={32} />,
        Pencil: <Pencil size={32} />,
        Hotel: <Hotel size={32} />,
        Landmark: <Landmark size={32} />,
        GraduationCap: <GraduationCap size={32} />
    };

    useEffect(() => {
        const fetchPrograms = async () => {
            const FALLBACK_PROGRAMS = [
                { id: 'bsit', title: 'Information Technology', shortDesc: 'Master the architectural foundations of the digital world.', iconName: 'Monitor', category: 'Technology', acronym: 'BSIT', color: 'border-blue-600', stats: { years: '4', credits: '144' } },
                { id: 'bscs', title: 'Computer Science', shortDesc: 'Advanced algorithms and software engineering excellence.', iconName: 'Monitor', category: 'Technology', acronym: 'BSCS', color: 'border-cyan-600', stats: { years: '4', credits: '140' } },
                { id: 'ba', title: 'Business Administration', shortDesc: 'Strategic management and global commerce leadership.', iconName: 'Rocket', category: 'Business', acronym: 'BA', color: 'border-amber-600', stats: { years: '4', credits: '120' } },
                { id: 'bscrim', title: 'Criminology & Justice', shortDesc: 'Preparation for elite careers in law enforcement and public safety.', iconName: 'Scale', category: 'Justice', acronym: 'BSCRIM', color: 'border-indigo-600', stats: { years: '4', credits: '160' } },
                { id: 'bsentrep', title: 'Entrepreneurship', shortDesc: 'Incubating the next generation of business disruptors.', iconName: 'Rocket', category: 'Business', acronym: 'BSENTREP', color: 'border-yellow-500', stats: { years: '4', credits: '138' } },
                { id: 'bsed', title: 'Teacher Education', shortDesc: 'Developing pedagogical pioneers who are master communicators.', iconName: 'Pencil', category: 'Education', acronym: 'BSED', color: 'border-green-600', stats: { years: '4', credits: '152' } },
                { id: 'bshm', title: 'Hospitality Management', shortDesc: 'World-class training in luxury hotel and tourism operations.', iconName: 'Hotel', category: 'Hospitality', acronym: 'BSHM', color: 'border-rose-600', stats: { years: '4', credits: '148' } },
                { id: 'bpa', title: 'Public Administration', shortDesc: 'Ethics-based leadership training for governance.', iconName: 'Landmark', category: 'Government', acronym: 'BPA', color: 'border-purple-600', stats: { years: '4', credits: '140' } }
            ];

            // 🏛️ SWR LAYER: Load cached programs immediately
            const cached = localStorage.getItem('aura_programs_hub');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.length > 0) setPrograms(parsed);
                    else setPrograms(FALLBACK_PROGRAMS);
                } catch (e) { setPrograms(FALLBACK_PROGRAMS); }
            } else {
                setPrograms(FALLBACK_PROGRAMS);
            }

            try {
                // 🚀 Cache Buster: Force Fetch from Registry
                const res = await fetch(`${API_BASE_URL}/quotas?t=${Date.now()}`);
                const data = await res.json();
                if (res.ok && (Array.isArray(data) || (data.success && Array.isArray(data.quotas)))) {
                    const rawList = Array.isArray(data) ? data : data.quotas;
                    const formatted = rawList.map(p => ({
                        id: p.courseAbbr.toLowerCase(),
                        title: p.courseName || p.courseAbbr,
                        shortDesc: p.description || 'Institutional academic program.',
                        iconName: p.iconName || 'GraduationCap',
                        category: p.category || 'General',
                        acronym: p.courseAbbr,
                        color: p.color || 'border-blue-600',
                        stats: { years: p.years || '4', credits: p.credits || '120' }
                    }));
                    setPrograms(formatted);
                    localStorage.setItem('aura_programs_hub', JSON.stringify(formatted));
                }
            } catch (error) {
                console.error("Fetch Programs Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Initial fetch
        fetchPrograms();

        // ON_RESUME Logic (Background Sync on Tab Focus)
        const onFocus = () => {
            fetchPrograms();
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, []);

    const filteredPrograms = (programs || []).filter(p => {
        if (!p) return false;
        const titleMatch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const acronymMatch = (p.acronym || '').toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = (p.shortDesc || '').toLowerCase().includes(searchQuery.toLowerCase());
        const categoryMatch = activeTab === 'All' || p.category === activeTab;
        return categoryMatch && (titleMatch || acronymMatch || descMatch);
    });

    return (
        <div className="min-h-screen bg-[#001f3f] text-white font-sans selection:bg-yellow-400 selection:text-blue-900 overflow-x-hidden text-center">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 blur-[120px] rounded-full"></div>
            </div>



            {/* Natural Blurring Zone Header */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-4 md:px-8 bg-transparent ${scrolled ? 'backdrop-blur-2xl py-4' : 'py-4 md:py-8'} hidden md:block`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center text-left">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white/5 border border-white/10 transition-all font-black text-[8px] md:text-[10px] uppercase tracking-widest text-blue-100"
                    >
                        <ChevronLeft size={14} md:size={16} /> <span className="hidden sm:inline">Back to Portal</span><span className="sm:hidden">Back</span>
                    </button>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1e40af] rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 group font-black shrink-0">
                            <BookOpen className="text-yellow-400" size={20} md:size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm md:text-xl font-black tracking-tighter leading-none text-white uppercase italic">Aura Integrated University</span>
                            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.4em] text-blue-300 italic opacity-80">Programs Hub</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 md:pt-40 pb-20 space-y-16 md:space-y-20">
                {/* Hero section */}
                <div className="text-center space-y-6 md:space-y-8 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 md:px-6 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]"
                    >
                        <Zap size={14} className="inline mr-2 fill-yellow-400" /> Academic Ecosystem
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-tight md:leading-none text-white italic uppercase"
                    >
                        Expertise <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">Simplified.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-blue-100/70 text-sm md:text-lg font-bold italic uppercase opacity-80"
                    >
                        Choose your trajectory. AIU offers specialized programs designed for the global competitive landscape.
                    </motion.p>
                </div>

                {/* Filter & Search Bar */}
                <div className="space-y-10">
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-4 md:px-0">
                        {programCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-2xl md:rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${activeTab === cat ? 'bg-yellow-400 text-blue-900 shadow-xl shadow-yellow-900/20' : 'bg-white/5 text-blue-100/40 border border-white/5 hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-xl mx-auto relative group">
                        <input 
                            type="text"
                            placeholder="Find your future program..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-5 text-sm font-bold focus:bg-white/10 outline-none transition-all placeholder:text-blue-100/20 italic"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-100/20" size={20} />
                    </div>
                </div>

                {/* Programs Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                        {filteredPrograms.map((p) => (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ y: -15 }}
                                onClick={() => navigate(`/programs/${p.id}`)}
                                className={`bg-white rounded-r-[2.5rem] md:rounded-r-[3.5rem] rounded-l-[0.5rem] border-l-[12px] md:border-l-[28px] ${p.color} shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden min-h-[300px] md:min-h-[360px] flex flex-col items-start p-6 md:p-10 text-left`}
                            >
                                <div className="absolute left-[-18px] top-0 bottom-0 flex flex-col justify-around py-8 z-10">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="w-4 h-4 rounded-full bg-[#001f3f] shadow-inner border border-white/10"></div>
                                    ))}
                                </div>
                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #1e40af 31px, #1e40af 32px)' }}></div>
                                <div className="absolute left-10 top-0 bottom-0 w-[1.5px] bg-red-400 opacity-20"></div>

                                <div className="relative z-10 space-y-4 md:space-y-6 flex-grow">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-900 group-hover:bg-[#1e40af] group-hover:text-white transition-all duration-500 shadow-sm">
                                        {ICON_MAP[p.iconName] ? React.cloneElement(ICON_MAP[p.iconName], { size: 24, className: 'md:w-8 md:h-8' }) : <GraduationCap size={24} className="md:w-8 md:h-8" />}
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none italic uppercase">{p.title}</h3>
                                    <p className="text-slate-500 text-sm font-bold leading-relaxed italic uppercase opacity-70">
                                        {p.shortDesc}
                                    </p>
                                    
                                    <div className="flex gap-4 pt-4 border-t border-slate-100 flex-wrap">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter italic">
                                            <Sparkles size={12} /> {p.stats.credits} Credits
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter italic">
                                            <Users size={12} /> {p.stats.years} Years
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex justify-end pt-6">
                                    <div className="flex items-center gap-2 text-[#1e40af] font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                        View Syllabus <ArrowRight size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Final CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] bg-[#1e40af] text-white text-center space-y-6 md:space-y-8 shadow-3xl relative overflow-hidden mx-4 md:mx-0"
                >
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight italic uppercase">Ready to join the elite?</h2>
                        <p className="text-blue-100 text-sm md:text-xl font-bold italic opacity-80 max-w-2xl mx-auto uppercase">Our 2024 admissions are currently active. Secure your slot through our AI-assisted portal.</p>
                        <div className="flex justify-center pt-4">
                            <button 
                                onClick={() => navigate('/register')}
                                className="px-10 md:px-14 py-4 md:py-6 bg-yellow-400 text-blue-900 rounded-2xl md:rounded-full font-black text-lg md:text-2xl active:scale-95 transition-all shadow-2xl uppercase italic"
                            >
                                Enroll Now!
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 text-center border-t border-white/10 mt-20 text-center">
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em] text-blue-300/50 max-w-[250px] md:max-w-none mx-auto leading-relaxed italic text-center">
                    © 2026 Aura Integrated University <br className="md:hidden" /> Precision Academic Ecosystem.
                </p>
            </footer>

            <AuraConsultant />
        </div>
    );
};

export default Programs;
