import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, 
    FileText, 
    CreditCard, 
    Wallet, 
    Building2, 
    BookOpen,
    Users2,
    GraduationCap,
    Clock,
    Phone,
    ChevronLeft,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuraConsultant from '../components/AuraConsultant';

const AdmissionRequirements = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('new');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#001f3f] text-white font-sans selection:bg-yellow-400 selection:text-blue-900 overflow-x-hidden text-center">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 blur-[120px] rounded-full"></div>
            </div>

            {/* Fixed Navigation Header - Natural Blurring Zone */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-4 md:px-8 bg-transparent ${scrolled ? 'backdrop-blur-2xl py-4' : 'py-4 md:py-8'}`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center text-left">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white/5 border border-white/10 transition-all font-black text-[8px] md:text-[10px] uppercase tracking-widest text-blue-100"
                    >
                        <ChevronLeft size={14} md:size={16} /> <span className="hidden sm:inline">Back to Portal</span><span className="sm:hidden">Back</span>
                    </button>
                    <div className="flex items-center gap-2 md:gap-3 transition-all hover:scale-[1.02]">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1e40af] rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 group font-black shrink-0">
                            <BookOpen className="text-yellow-400" size={20} md:size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm md:text-xl font-black tracking-tighter leading-none text-white uppercase italic drop-shadow-sm">Aura Integrated University</span>
                            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.4em] text-blue-300 opacity-80">Official Regional Portal</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-20 space-y-20">
                {/* Hero Title */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase">
                        <Zap size={14} className="fill-yellow-400" /> Shaping Global Leaders
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight md:leading-none italic uppercase">
                        Admission <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">Requirements.</span>
                    </h1>
                    <p className="text-blue-100/70 font-bold max-w-2xl mx-auto text-sm md:text-lg leading-relaxed italic text-center">
                        Precision academic onboarding for Academic Year 2026-2027. Secure your future at AIU.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-4">
                    <ToggleButton 
                        active={activeSection === 'new'} 
                        onClick={() => setActiveSection('new')}
                        icon={<Users2 size={18} />}
                        label="New Students"
                    />
                    <ToggleButton 
                        active={activeSection === 'existing'} 
                        onClick={() => setActiveSection('existing')}
                        icon={<GraduationCap size={18} />}
                        label="For Existing Students"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {activeSection === 'new' ? (
                        <motion.div 
                            key="new"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid lg:grid-cols-2 gap-8"
                        >
                            <RequirementCard title="Freshmen (New Enrollees)">
                                <RequirementItem text="Original Form 138 / SF9-SHS (Report Card)" />
                                <RequirementItem text="Original Form 137 / SF10-SHS (Permanent Record)" />
                                <RequirementItem text="PSA Issued Birth Certificate (Authenticated)" />
                                <RequirementItem text="Two (2) 2x2 colored photographs (White BG)" />
                                <RequirementItem text="Certificate of Good Moral Character" />
                                <RequirementItem text="Certificate of Residency (Valencia City) for TES Grantees" />
                            </RequirementCard>

                            <RequirementCard title="Transferees" isSecondary>
                                <RequirementItem text="Certificate of Transfer / Honorable Dismissal" />
                                <RequirementItem text="Official Transcript of Records (OTR)" />
                                <RequirementItem text="PSA Issued Birth Certificate" />
                                <RequirementItem text="Two (2) 2x2 colored photographs" />
                                <RequirementItem text="Certificate of Good Moral Character" />
                                <RequirementItem text="Course Credit Application Form" />
                            </RequirementCard>

                            <div className="lg:col-span-2 pt-8">
                                <ProcessSection />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="existing"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <RequirementCard title="Returning Students">
                                <RequirementItem text="Validated Student ID for current semester" />
                                <RequirementItem text="Copy of Grades from previous semester" />
                                <RequirementItem text="Clearance from Business & Accounting Office" />
                                <RequirementItem text="Updated Personal Information Sheet" />
                            </RequirementCard>
                            <ProcessSection isExisting />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Info */}
                <div className="pt-20 border-t border-white/10 grid md:grid-cols-3 gap-8 md:gap-12 text-blue-100/50">
                    <InfoCard icon={<Building2 size={16} />} title="Campus Location" desc="TS Building, 3535 Sayre Highway, Hagkol, Valencia City, Bukidnon" />
                    <InfoCard icon={<Clock size={16} />} title="Inquiry Hours" desc="Monday - Friday: 08:00 AM - 05:00 PM | Saturday: 08:00 AM - 12:00 PM" />
                    <InfoCard icon={<Phone size={16} />} title="Contact Support" desc="Phone: 0917-863-5883 | Email: aiu.admissions.official@gmail.com" />
                </div>
            </main>

            <footer className="py-12 text-center border-t border-white/10 mt-20">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-300">© 2026 Aura Integrated University. Precision Academic Ecosystem.</p>
            </footer>

            <AuraConsultant />
        </div>
    );
};

// Subcomponents
function ToggleButton({ active, onClick, icon, label }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center justify-center gap-3 px-4 md:px-8 py-3.5 md:py-4 rounded-2xl md:rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all flex-1 md:flex-none ${active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/40' : 'bg-white/5 text-blue-100/50 border border-white/5'}`}
        >
            {icon} {label}
        </button>
    );
}

function RequirementCard({ title, children, isSecondary = false }) {
    return (
        <div className={`bg-white/5 backdrop-blur-md border border-white/10 border-l-8 md:border-l-[12px] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl text-left ${isSecondary ? 'border-indigo-600' : 'border-blue-600'}`}>
            <h3 className="text-xl md:text-2xl font-black text-white mb-6 md:mb-8 tracking-tight italic uppercase">{title}</h3>
            <ul className="space-y-4">
                {children}
            </ul>
        </div>
    );
}

function RequirementItem({ text }) {
    return (
        <li className="flex items-start gap-4 text-left">
            <div className="mt-1 w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 size={12} className="text-blue-400" />
            </div>
            <span className="text-blue-100/70 font-bold text-sm leading-relaxed italic uppercase">{text}</span>
        </li>
    );
}

function ProcessSection({ isExisting = false }) {
    return (
        <div className="bg-[#1e40af] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/10 text-left">
            <div className="absolute top-0 right-0 p-10 md:p-20 opacity-[0.05] pointer-events-none rotate-12">
                <CreditCard size={200} md:size={300} />
            </div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                <div className="space-y-6 md:space-y-8">
                    <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black tracking-widest uppercase border border-white/20">Onboarding Protocol</div>
                    <h2 className="text-3xl md:text-5xl font-black leading-tight italic uppercase">Online <br /> Enrollment</h2>
                    <div className="space-y-4 md:space-y-5">
                        <ProcessStep number="01" text={isExisting ? "Provide Student ID (e.g. 02-19-0000)" : "Proceed to Pre-registration portal: Click [Enroll Now!]"} />
                        <ProcessStep number="02" text="Settle fees via Bank Transfer or G-Cash." />
                        <ProcessStep number="03" text="Submit proof of payment via AIU Messenger." />
                        <ProcessStep number="04" text="Submit physical requirements to the Registrar." />
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] border border-white/10 p-6 md:p-10 space-y-6 md:space-y-8 mt-4 md:mt-0">
                    <h4 className="text-lg md:text-xl font-black tracking-tight uppercase italic border-b border-white/10 pb-4">Payment Portals</h4>
                    <div className="space-y-5 md:space-y-6">
                        <PaymentItem icon={<Building2 size={24} />} title="Metrobank" desc="Acc: 2027202063132" />
                        <PaymentItem icon={<Wallet size={24} />} title="G-Cash" desc="Available on the AIU Hub" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProcessStep({ number, text }) {
    return (
        <div className="flex items-center gap-6 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-lg shadow-xl shrink-0 uppercase italic">{number}</div>
            <p className="text-sm font-bold text-blue-100/70 leading-relaxed italic uppercase">{text}</p>
        </div>
    );
}

function PaymentItem({ icon, title, desc }) {
    return (
        <div className="flex items-start gap-5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#001f3f] flex items-center justify-center text-yellow-400 shrink-0 shadow-lg border border-white/5">{icon}</div>
            <div>
                <h5 className="font-black text-sm uppercase tracking-widest text-white italic">{title}</h5>
                <p className="text-xs font-bold text-blue-200/50 mt-1 italic uppercase">{desc}</p>
            </div>
        </div>
    );
}

function InfoCard({ icon, title, desc }) {
    return (
        <div className="space-y-4 p-8 rounded-[2rem] bg-white/5 border border-white/5 transition-all text-left group">
            <div className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-widest">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">{icon}</div>
                {title}
            </div>
            <p className="text-xs font-bold leading-relaxed italic uppercase opacity-60">{desc}</p>
        </div>
    )
}

export default AdmissionRequirements;
