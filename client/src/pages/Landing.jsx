import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowRight,
    BookOpen,
    ShieldCheck,
    Zap,
    Users,
    GraduationCap,
    Phone,
    CheckCircle,
    Award,
    Monitor,
    Scale,
    Rocket,
    Pencil,
    Hotel,
    Landmark,
    ChevronRight,
    ChevronDown,
    Quote,
    FileText,
    Menu,
    X,
    LogIn
} from 'lucide-react'
import AuraConsultant from '../components/AuraConsultant'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

function Landing() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [scrolled, setScrolled] = useState(false)
    const [admissionsOpen, setAdmissionsOpen] = useState(false)
    const [aboutOpen, setAboutOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mobileAdmissionsOpen, setMobileAdmissionsOpen] = useState(false)
    const [mobileAboutOpen, setMobileAboutOpen] = useState(false)

    const slides = [
        '/campus.png',
        '/campus_alt_1.png',
        '/campus_alt_2.png'
    ]

    useEffect(() => {
        // PROFESSIONAL SESSION MANAGEMENT:
        // Automatically logout user if they navigate back to landing page
        if (user) {
            logout();
        }

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 6000)

        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            clearInterval(timer)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [user, logout])

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] font-sans relative overflow-x-hidden text-left">

            {/* FLOATING NAVBAR */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 flex justify-center p-4 ${scrolled ? 'mt-2' : 'mt-4'}`}>
                <div className={`w-full max-w-7xl flex justify-between items-center px-8 py-3 rounded-full border transition-all duration-700 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl' : 'bg-white/10 backdrop-blur-md border-white/20 shadow-lg'}`}>
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-[#1e40af] rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 group font-black">
                            <BookOpen className="text-yellow-400" size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className={`text-base md:text-xl font-black tracking-tighter leading-none transition-colors ${scrolled ? 'text-[#1e40af]' : 'text-white'}`}>Aura Integrated University</span>
                            <span className={`text-[6px] md:text-[7px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-colors ${scrolled ? 'text-slate-400' : 'text-blue-100'}`}>Official Regional Portal</span>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-left">
                        <div className="relative group p-4" onMouseEnter={() => setAdmissionsOpen(true)} onMouseLeave={() => setAdmissionsOpen(false)}>
                            <div className={`flex items-center gap-2 cursor-pointer transition-colors ${scrolled ? 'text-slate-500 hover:text-[#1e40af]' : 'text-white/80 hover:text-white'}`}>
                                Admissions <ChevronRight size={10} className={`transform transition-transform ${admissionsOpen ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {admissionsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-3"
                                    >
                                        <div className="flex flex-col">
                                            <DropdownItem title="Admission Requirements" onClick={() => navigate('/admissions/requirements')} />
                                            <DropdownItem title="Aura Enrollment Portal" onClick={() => navigate('/register')} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button onClick={() => navigate('/programs')} className={`transition-colors ${scrolled ? 'text-slate-500 hover:text-[#1e40af]' : 'text-white/80 hover:text-white'}`}>Programs</button>
                        <div className="relative group p-4" onMouseEnter={() => setAboutOpen(true)} onMouseLeave={() => setAboutOpen(false)}>
                            <div className={`flex items-center gap-2 cursor-pointer transition-colors ${scrolled ? 'text-slate-500 hover:text-[#1e40af]' : 'text-white/80 hover:text-white'}`}>
                                About AIU <ChevronRight size={10} className={`transform transition-transform ${aboutOpen ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {aboutOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-3"
                                    >
                                        <div className="flex flex-col">
                                            <DropdownItem title="History" onClick={() => navigate('/about/history')} />
                                            <DropdownItem title="Mission & Vision" onClick={() => navigate('/about/philosophy')} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center">
                        <button onClick={() => navigate('/login')} className="bg-[#1e40af] text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all hover:bg-[#1e3a8a] active:scale-95">Portal Login</button>
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <div className="lg:hidden flex items-center">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`p-2.5 rounded-xl transition-all shadow-sm ${scrolled ? 'text-[#1e40af] bg-blue-50 border border-blue-100 hover:bg-blue-100' : 'text-white bg-white/20 border border-white/20 hover:bg-white/30 backdrop-blur-md'}`}
                        >
                            {mobileMenuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="absolute top-[85%] left-0 right-0 mt-4 mx-4 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-900/20 border border-slate-100/50 overflow-hidden flex flex-col p-3 lg:hidden z-50 text-left max-h-[80vh] overflow-y-auto custom-scrollbar"
                        >
                            {/* Admissions Accordion */}
                            <div className="flex flex-col">
                                <button 
                                    onClick={() => setMobileAdmissionsOpen(!mobileAdmissionsOpen)} 
                                    className={`p-4 flex items-center justify-between font-bold transition-all rounded-2xl ${mobileAdmissionsOpen ? 'bg-blue-50 text-[#1e40af]' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Admissions <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${mobileAdmissionsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {mobileAdmissionsOpen && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden flex flex-col pl-4 pb-2"
                                        >
                                            <button onClick={() => { setMobileMenuOpen(false); navigate('/admissions/requirements') }} className="p-3 text-sm font-bold text-slate-500 hover:text-[#1e40af] flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Admission Requirements
                                            </button>
                                            <button onClick={() => { setMobileMenuOpen(false); navigate('/register') }} className="p-3 text-sm font-bold text-slate-500 hover:text-[#1e40af] flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Aura Enrollment Portal
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button onClick={() => { setMobileMenuOpen(false); navigate('/programs') }} className="p-4 flex items-center justify-between text-slate-700 font-bold hover:bg-slate-50 transition-colors rounded-2xl">
                                Programs <ArrowRight size={16} className="text-slate-400" />
                            </button>

                            {/* About AIU Accordion */}
                            <div className="flex flex-col">
                                <button 
                                    onClick={() => setMobileAboutOpen(!mobileAboutOpen)} 
                                    className={`p-4 flex items-center justify-between font-bold transition-all rounded-2xl ${mobileAboutOpen ? 'bg-blue-50 text-[#1e40af]' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    About AIU <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${mobileAboutOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {mobileAboutOpen && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden flex flex-col pl-4 pb-2"
                                        >
                                            <button onClick={() => { setMobileMenuOpen(false); navigate('/about/history') }} className="p-3 text-sm font-bold text-slate-500 hover:text-[#1e40af] flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> History
                                            </button>
                                            <button onClick={() => { setMobileMenuOpen(false); navigate('/about/philosophy') }} className="p-3 text-sm font-bold text-slate-500 hover:text-[#1e40af] flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Mission & Vision
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            <div className="h-px bg-slate-100 my-2 mx-4"></div>
                            
                            <div className="p-2">
                                <button onClick={() => { setMobileMenuOpen(false); navigate('/login') }} className="w-full py-3.5 flex items-center justify-center gap-2 text-white font-black bg-[#1e40af] rounded-2xl shadow-lg shadow-blue-900/20 text-[11px] uppercase tracking-widest transition-all active:scale-95">
                                    <LogIn size={15} strokeWidth={2.5} /> Portal Login
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <div className="relative h-[920px] overflow-hidden flex items-center justify-center text-center">
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentSlide}
                            src={slides[currentSlide]}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2 }}
                            className="absolute inset-0 w-full h-full object-cover text-left"
                            style={{ filter: 'brightness(0.5)' }}
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/10 to-[#001f3f]/90 opacity-100 z-[15]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-20 max-w-5xl mx-auto px-6 w-full space-y-6 -mt-48 md:-mt-32 text-left md:text-center"
                >
                    <div className="flex flex-col items-start md:items-center gap-4 text-left md:text-center">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="inline-flex items-center gap-3 px-6 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-yellow-400 text-[10px] font-black tracking-[0.3em] uppercase"
                        >
                            <Zap size={14} className="fill-yellow-400" /> Shaping Global Leaders
                        </motion.div>
                        <h1 className="text-white font-black tracking-tighter leading-[1] md:leading-[0.95] drop-shadow-2xl text-left md:text-center w-full">
                            <span className="text-4xl sm:text-5xl md:text-8xl block">Education For The</span>
                            <span className="text-5xl sm:text-6xl md:text-8xl text-[#fbbf24] block mt-1 md:mt-0">Next Generation.</span>
                        </h1>
                        <p className="text-blue-50 text-base md:text-2xl font-bold max-w-3xl ml-0 md:mx-auto leading-relaxed drop-shadow-lg opacity-90 text-left md:text-center w-full">
                            Aura Integrated University is the pioneer of AI-First digital academic ecosystems.
                        </p>
                        <div className="pt-8 w-full flex justify-start md:justify-center">
                            <button onClick={() => navigate('/register')} className="w-full md:w-auto bg-[#fbbf24] text-[#1e40af] px-8 md:px-14 py-4 md:py-5 rounded-2xl md:rounded-full font-black text-lg md:text-2xl shadow-[0_20px_50px_rgba(251,191,36,0.4)] transition-all flex items-center justify-center gap-4 group active:scale-95 animate-pulse-bounce">
                                Begin Enrollment
                                <ArrowRight className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* PRONOUNCED CINEMATIC CURVE */}
                <div className="absolute bottom-[-1px] left-0 w-full leading-[0] z-20 h-64 pointer-events-none text-left">
                    <svg viewBox="0 0 1440 280" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_-50px_80px_rgba(0,0,0,0.5)]">
                        <path fill="#001f3f" d="M0,160L80,144C160,128,320,96,480,106.7C640,117,800,171,960,181.3C1120,192,1280,160,1360,144L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            {/* ACADEMIC CENTERS SECTION */}
            <section className="relative bg-[#001f3f] pb-32 -mt-1 z-20 text-left">
                
                {/* QUICK NAV BRIDGE */}
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: -176, opacity: 1 }} // -translate-y-44 = -176px
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-6xl mx-auto px-6 relative z-[100] text-left"
                >
                    <div className="grid grid-cols-2 md:flex bg-[#1e40af] rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_45px_110px_rgba(0,0,0,0.7)] border-4 border-white overflow-hidden backdrop-blur-xl">
                        <QuickNavLink icon={<GraduationCap size={22} />} value="98%" title="Employment Rate" className="border-r border-b md:border-b-0 border-white/10" />
                        <QuickNavLink icon={<Award size={24} />} value="4.9/5" title="Student Rating" className="border-b md:border-b-0 md:border-r border-white/10" />
                        <QuickNavLink icon={<ShieldCheck size={22} />} value="100%" title="Board Passers" className="border-r border-white/10" />
                        <QuickNavLink icon={<Zap size={22} />} value="AI-CORE" title="Digital Tech" />
                    </div>
                </motion.div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16 pt-12 text-left">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="space-y-4 text-white text-center text-left"
                    >
                        <div className="w-20 h-1.5 bg-[#fbbf24] mx-auto rounded-full shadow-[0_0_20px_rgba(251,191,36,0.6)]"></div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Academic Centers</h2>
                        <p className="text-slate-400 font-bold max-w-2xl mx-auto text-base md:text-lg italic text-center text-center">Excellence in localized expertise, globally recognized.</p>
                    </motion.div>
                    
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } },
                            hidden: {}
                        }}
                        className="flex overflow-x-auto pb-10 gap-6 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:snap-none px-6 md:px-0 -mx-6 md:mx-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        <EnhancedNotebookCard id="it" icon={<Monitor size={32} />} title="Information Technology" desc="Focused on AI research, software engineering, and digital infrastructure." />
                        <EnhancedNotebookCard id="criminology" icon={<Scale size={32} />} title="Criminology & Justice" desc="Preparation for elite careers in law enforcement and public safety." />
                        <EnhancedNotebookCard id="entrepreneurship" icon={<Rocket size={32} />} title="Entrepreneurship" desc="Incubating the next generation of business leaders." />
                        <EnhancedNotebookCard id="education" icon={<Pencil size={32} />} title="Teacher Education" desc="Developing educators who are master communicators." />
                        <EnhancedNotebookCard id="hospitality" icon={<Hotel size={32} />} title="Hospitality Management" desc="World-class training in hotel and tourism operations." />
                        <EnhancedNotebookCard id="public-admin" icon={<Landmark size={32} />} title="Public Administration" desc="Ethics-based leadership training for governance." />
                    </motion.div>
                </div>
            </section>

            {/* CINEMATIC TRANSITION TO WHITE (Faculties Section) */}
            <section className="relative pt-32 pb-48 bg-white overflow-hidden text-left">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#001f3f] to-white z-0 text-left"></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-24 text-left text-left">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-4 text-center"
                    >
                        <h4 className="text-[#1e40af] font-black text-xs uppercase tracking-[0.4em]">Faculty of Excellence</h4>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-tight italic">Elite Mentorship</h2>
                    </motion.div>

                    <div className="lg:hidden w-full overflow-hidden py-10 [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                        <motion.div 
                            animate={{ x: [0, "-50%"] }}
                            transition={{ 
                                duration: 25, 
                                repeat: Infinity, 
                                ease: "linear" 
                            }}
                            className="flex gap-6 w-max px-6"
                        >
                            {[
                                {
                                    name: "Elena Rodriguez, MIT", 
                                    dept: "Information Technology", 
                                    quote: "The future belongs to those who build the ecosystems of tomorrow.",
                                    initials: "ER"
                                },
                                {
                                    name: "Atty. Marcus Thorne", 
                                    dept: "College of Criminology", 
                                    quote: "Integrity and discipline are the true foundations of a just society.",
                                    initials: "MT"
                                },
                                {
                                    name: "Prof. Sarah Jenkins", 
                                    dept: "School of Business", 
                                    quote: "Innovation starts with identifying problems others chose to ignore.",
                                    initials: "SJ"
                                }
                            ].concat([
                                {
                                    name: "Elena Rodriguez, MIT", 
                                    dept: "Information Technology", 
                                    quote: "The future belongs to those who build the ecosystems of tomorrow.",
                                    initials: "ER"
                                },
                                {
                                    name: "Atty. Marcus Thorne", 
                                    dept: "College of Criminology", 
                                    quote: "Integrity and discipline are the true foundations of a just society.",
                                    initials: "MT"
                                },
                                {
                                    name: "Prof. Sarah Jenkins", 
                                    dept: "School of Business", 
                                    quote: "Innovation starts with identifying problems others chose to ignore.",
                                    initials: "SJ"
                                }
                            ]).map((prof, idx) => (
                                <ProfessorCard key={idx} {...prof} />
                            ))}
                        </motion.div>
                    </div>

                    <div className="hidden lg:grid lg:grid-cols-3 gap-10">
                        <ProfessorCard 
                            name="Elena Rodriguez, MIT" 
                            dept="Information Technology" 
                            quote="The future belongs to those who build the ecosystems of tomorrow."
                            initials="ER"
                        />
                        <ProfessorCard 
                            name="Atty. Marcus Thorne" 
                            dept="College of Criminology" 
                            quote="Integrity and discipline are the true foundations of a just society."
                            initials="MT"
                        />
                        <ProfessorCard 
                            name="Prof. Sarah Jenkins" 
                            dept="School of Business" 
                            quote="Innovation starts with identifying problems others chose to ignore."
                            initials="SJ"
                        />
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 py-20 space-y-32 text-left">
                {/* REGISTRATION ESSENTIALS */}
                 <motion.section 
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-20 text-white overflow-hidden relative shadow-[0_35px_80px_rgba(0,0,0,0.4)] mx-4 md:mx-0 border border-white/5"
                >
                    <div className="absolute top-0 right-[-150px] md:right-0 p-10 md:p-20 opacity-[0.03] pointer-events-none">
                        <FileText size={300} md:size={500} strokeWidth={1} />
                    </div>

                    <div className="relative z-10 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                        <div className="space-y-6 md:space-y-8 text-left">
                            <div className="inline-block bg-yellow-400/10 px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase border border-yellow-400/20 text-yellow-400">Institutional Guide</div>
                            <h2 className="text-4xl md:text-7xl font-black leading-[1.1] md:leading-tight drop-shadow-2xl text-left tracking-tighter italic">Essential <br /> Prerequisites</h2>
                            <motion.button 
                                whileHover={{ scale: 1.05, x: 10 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/admissions/requirements')} 
                                className="hidden lg:flex px-8 md:px-10 py-3.5 md:py-5 bg-white text-[#0f172a] rounded-full font-black text-sm md:text-xl shadow-2xl transition-all items-center gap-3 group w-fit"
                            >
                                See More <ArrowRight className="group-hover:translate-x-2 transition-transform w-4 h-4 md:w-6 md:h-6" />
                            </motion.button>
                        </div>
                        <div className="space-y-8 md:space-y-12">
                            <div className="space-y-4 md:space-y-6">
                                <h4 className="text-lg md:text-2xl font-black text-white uppercase tracking-widest border-l-4 border-[#fbbf24] pl-4 py-1 text-left">Incoming Freshmen</h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-4">
                                    <RequirementItem text="ACADEMIC TRANSCRIPT / REPORT CARD (Required)" isDark={false} />
                                    <RequirementItem text="ORIGINAL FORM 138 / SF9-SHS" isDark={false} />
                                    <RequirementItem text="ORIGINAL FORM 137 / SF10-SHS" isDark={false} />
                                    <RequirementItem text="PSA BIRTH CERTIFICATE" isDark={false} />
                                    <RequirementItem text="TWO (2) 2x2 PHOTOGRAPHS" isDark={false} />
                                    <RequirementItem text="GOOD MORAL CHARACTER" isDark={false} />
                                </ul>
                            </div>
                        </div>

                        {/* Mobile Only Button at the bottom */}
                        <motion.button 
                            whileHover={{ scale: 1.05, x: 10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/admissions/requirements')} 
                            className="lg:hidden w-full py-4 bg-white text-[#0f172a] rounded-2xl font-black text-base shadow-2xl transition-all flex items-center justify-center gap-3 group mt-6"
                        >
                            See More <ArrowRight className="group-hover:translate-x-2 transition-transform w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.section>
            </main>

            {/* FOOTER */}
            <footer className="bg-[#1e40af] text-white rounded-t-[4rem] md:rounded-t-[8rem] mt-10 pt-16 md:pt-24 pb-8 md:pb-12 relative overflow-hidden shadow-2xl text-left">
                <div className="absolute top-0 right-[-100px] md:right-0 p-10 md:p-32 opacity-[0.05] md:opacity-10 pointer-events-none text-left">
                    <Award size={300} md:size={400} strokeWidth={1} />
                </div>

                <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">
                    <div className="grid lg:grid-cols-5 gap-10 md:gap-12 lg:gap-8 items-start text-left">
                        <div className="lg:col-span-2 space-y-6 text-left">
                            <div className="flex items-center gap-4 md:gap-5 text-left group cursor-default">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-[#001f3f] rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 shrink-0 transform group-hover:scale-105 transition-all duration-500">
                                    <BookOpen className="text-yellow-400" size={24} md:size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg md:text-2xl font-black tracking-tighter uppercase italic drop-shadow-lg whitespace-nowrap">Aura Integrated University</h3>
                            </div>
                            <p className="text-blue-100 font-bold text-[10px] md:text-xs opacity-70 leading-relaxed italic max-w-sm">
                                The region's pioneer in AI-Integrated digital academic ecosystems. Shaping future global leaders with precision.
                            </p>
                        </div>

                        <div className="space-y-6 text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 border-b border-white/10 pb-4">Institutional Hub</h4>
                            <ul className="space-y-4 text-blue-100 font-black text-[10px] uppercase tracking-widest">
                                <li onClick={() => navigate('/register')} className="flex items-center gap-2 hover:text-yellow-400 transition-colors cursor-pointer"><ChevronRight size={14} /> Enrollment Portal</li>
                                <li onClick={() => navigate('/programs')} className="flex items-center gap-2 hover:text-yellow-400 transition-colors cursor-pointer"><ChevronRight size={14} /> Academic Programs</li>
                                <li onClick={() => navigate('/calendar')} className="flex items-center gap-2 hover:text-yellow-400 transition-colors cursor-pointer"><ChevronRight size={14} /> Academic Calendar</li>
                            </ul>
                        </div>

                        <div className="space-y-6 text-left border-t border-white/10 pt-8 md:border-t-0 md:pt-0">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 border-b border-white/10 pb-4">Our Presence</h4>
                            <div className="space-y-4 text-blue-50 font-black text-[10px] uppercase tracking-widest">
                                <p className="flex items-center gap-2"><Phone size={14} className="text-yellow-400" /> 0917-863-5883</p>
                                <p className="flex items-center gap-2 opacity-80 cursor-pointer hover:text-white transition-colors">aiu.admissions.official@gmail.com</p>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4 md:pt-0">
                            <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-8 border border-white/10 text-center space-y-6 shadow-2xl relative overflow-hidden group">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-100/50 group-hover:text-white transition-colors">Return to Zenith</h4>
                                <button 
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                                    className="w-full bg-white text-[#1e40af] py-4 md:py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-950 relative z-10 hover:bg-yellow-400 hover:text-blue-900 transition-all active:scale-95"
                                >
                                    Back to Top
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 md:mt-20 pt-8 border-t border-white/10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 opacity-60">
                        <p>© 2026 Aura Integrated University. Precision Academic Ecosystem.</p>
                    </div>
                </div>
            </footer>

            {/* AURA AI ASSISTANT FAB */}
            <AuraConsultant />
        </div>
    )
}

// Subcomponents
function DropdownItem({ title, onClick }) {
    return (
        <button 
            onClick={onClick}
            className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group text-left"
        >
            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-[#1e40af] transition-colors">
                <ChevronRight size={10} className="text-[#1e40af] group-hover:text-white" />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{title}</span>
        </button>
    )
}

function QuickNavLink({ icon, value, title, className = "" }) {
    return (
        <div className={`flex-1 flex flex-col items-center justify-center gap-1 py-8 md:py-10 transition-all duration-500 relative z-10 hover:bg-white/[0.05] cursor-default group ${className}`}>
            <div className="text-yellow-400/50 group-hover:text-yellow-400 group-hover:scale-110 transition-all mb-2">{icon}</div>
            <span className="text-3xl font-black italic text-white tracking-widest leading-none mb-1">{value}</span>
            <span className="text-[8px] font-black uppercase text-blue-100/30 tracking-[0.4em] transition-colors group-hover:text-white">{title}</span>
        </div>
    )
}

function EnhancedNotebookCard({ id, icon, title, desc }) {
    const navigate = useNavigate()
    return (
        <motion.div 
            variants={{
                visible: { opacity: 1, y: 0, scale: 1 },
                hidden: { opacity: 0, y: 50, scale: 0.9 }
            }}
            whileHover={{ y: -15, scale: 1.02 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate(`/programs/${id}`)}
            className="bg-white rounded-r-[3.5rem] rounded-l-[0.5rem] border-l-[28px] border-[#1e40af] shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer relative overflow-hidden min-h-[320px] flex flex-col items-start text-left hover:shadow-2xl hover:border-yellow-400 w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center md:snap-none"
        >
            <div className="absolute left-[-18px] top-0 bottom-0 flex flex-col justify-around py-8 z-10 text-left">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-[#001f3f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-white/10"></div>
                ))}
            </div>
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #1e40af 31px, #1e40af 32px)' }}></div>
            <div className="absolute left-10 top-0 bottom-0 w-[1.5px] bg-red-400 opacity-30 shadow-sm"></div>

            <div className="p-10 pl-16 relative z-10 h-full flex flex-col items-start text-left text-left text-left">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#1e40af] mb-8 transition-all duration-500 shadow-sm text-left">
                    {icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-none text-left">{title}</h3>
                <p className="text-slate-500 text-sm font-bold leading-relaxed text-left text-left">{desc}</p>
                <div className="mt-auto pt-6 w-full flex justify-end text-left">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center transition-colors">
                        <ArrowRight size={18} className="text-[#1e40af]" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function ProfessorCard({ name, dept, quote, initials }) {
    return (
        <motion.div 
            variants={{
                visible: { opacity: 1, y: 0, x: 0 },
                hidden: { opacity: 0, y: 50, x: -20 }
            }}
            transition={{ duration: 0.6 }}
            className="group relative w-[85vw] sm:w-[400px] lg:w-auto shrink-0 snap-center lg:snap-none"
        >
            <div className="bg-[#f8f8f8] p-12 rounded-[4rem] border border-slate-200 shadow-[0_30px_70px_rgba(15,23,42,0.04)] transition-all duration-500 h-full flex flex-col relative z-10 overflow-hidden transform">
                <div className="absolute top-[-20px] right-[-20px] text-[120px] font-black text-[#1e40af]/[0.03] select-none pointer-events-none transition-colors duration-700 leading-none">
                    {initials}
                </div>

                <div className="space-y-10 flex flex-col h-full text-left">
                    <div className="flex justify-between items-start">
                        <div className="w-24 h-24 rounded-[3rem] bg-[#1e40af] flex items-center justify-center text-white shadow-xl shadow-blue-900/20 shadow-inner transition-all duration-500">
                            <Users size={32} />
                        </div>
                        <div className="text-[#fbbf24] opacity-20 transition-opacity">
                            <Quote size={48} strokeWidth={3} />
                        </div>
                    </div>

                    <p className="text-slate-600 font-bold text-2xl leading-relaxed italic flex-grow tracking-tight text-left">
                        "{quote}"
                    </p>

                    <div className="pt-10 border-t-2 border-slate-200 relative text-left">
                        <div className="absolute top-0 left-0 w-12 h-1 bg-[#1e40af] rounded-full -translate-y-[1.5px]"></div>
                        <h5 className="text-3xl font-black text-slate-900 tracking-tighter leading-none text-left">{name}</h5>
                        <div className="flex items-center gap-3 mt-4 text-left">
                            <div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div>
                            <p className="text-[#1e40af] font-black text-[10px] uppercase tracking-[0.3em]">{dept}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function RequirementItem({ text, isDark = true }) {
    return (
        <li className={`flex items-start gap-4 text-sm font-bold leading-tight ${isDark ? 'text-slate-400' : 'text-slate-100'}`}>
            <CheckCircle size={18} className={`shrink-0 mt-0.5 ${isDark ? 'text-[#1e40af]' : 'text-[#fbbf24]'}`} /> 
            <span>{text}</span>
        </li>
    )
}

export default Landing
