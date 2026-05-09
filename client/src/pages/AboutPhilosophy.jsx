import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Target, Eye, Compass, ChevronLeft } from 'lucide-react'
import AuraConsultant from '../components/AuraConsultant'

function AboutPhilosophy() {
    const navigate = useNavigate()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-[#001f3f] text-white font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-blue-900 text-center">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 blur-[120px] rounded-full"></div>
            </div>



            {/* Smooth Glassmorphic Header - Natural Blurring Zone */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-4 md:px-8 bg-transparent ${scrolled ? 'backdrop-blur-2xl py-4' : 'py-4 md:py-8'} hidden md:block`}>
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
                            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.4em] text-blue-300 opacity-80">Identity & Purpose</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 md:pt-40 pb-16 space-y-24 text-center">
                {/* Hero Title */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-6 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]"
                    >
                        Foundation of Excellence
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-7xl font-black tracking-tighter leading-tight md:leading-none italic uppercase"
                    >
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">Philosophy.</span>
                    </motion.h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Mission */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] space-y-6 md:space-y-8 transition-all group text-left mx-4 md:mx-0"
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#1e40af] flex items-center justify-center text-white shadow-xl shadow-blue-900/50 transition-transform">
                            <Target size={24} md:size={32} />
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic">The Mission</h2>
                        <p className="text-slate-300 font-medium leading-relaxed italic uppercase text-[10px] md:text-xs opacity-70">
                            "To empower students through an AI-integrated academic ecosystem that fosters critical thinking, technological mastery, and ethical leadership in a rapidly evolving global landscape."
                        </p>
                    </motion.div>

                    {/* Vision */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] space-y-6 md:space-y-8 transition-all group lg:translate-y-12 text-left mx-4 md:mx-0"
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-yellow-400 flex items-center justify-center text-blue-900 shadow-xl shadow-yellow-900/50 transition-transform">
                            <Eye size={24} md:size={32} />
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic">The Vision</h2>
                        <p className="text-slate-300 font-medium leading-relaxed italic uppercase text-[10px] md:text-xs opacity-70">
                            "To be the premier global institution for digitial-first education, recognized for producing innovators who shape the future of technology and society with precision and humanity."
                        </p>
                    </motion.div>

                    {/* Philosophy */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] space-y-6 md:space-y-8 transition-all group lg:translate-y-24 text-left mx-4 md:mx-0"
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-900/50 transition-transform">
                            <Compass size={24} md:size={32} />
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic">Institutional Philosophy</h2>
                        <p className="text-slate-300 font-medium leading-relaxed italic uppercase text-[10px] md:text-xs opacity-70">
                            "Knowledge without application is stagnant; application without ethics is dangerous. We believe in the synergy of human intellect and artificial intelligence to solve the world's most complex challenges."
                        </p>
                    </motion.div>
                </div>

                {/* Core Values */}
                <section className="pt-16 md:pt-24 space-y-8 md:space-y-12">
                    <div className="text-center px-4">
                        <h3 className="text-2xl md:text-4xl font-black tracking-tight uppercase italic">Core Values</h3>
                        <div className="w-16 h-1 md:h-1.5 bg-yellow-400 mx-auto mt-4 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.5)]"></div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-left px-4 md:px-0">
                        <ValueCard title="Innovation" desc="Relentlessly pushing the boundaries of what's possible." />
                        <ValueCard title="Integrity" desc="Steadfast adherence to ethical principles and transparency." />
                        <ValueCard title="Inclusion" desc="Fostering a diverse community where every voice is heard." />
                        <ValueCard title="Intelligence" desc="Applying data-driven insights to achieve academic excellence." />
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 text-center border-t border-white/10 mt-20">
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em] text-blue-300/50 max-w-[250px] md:max-w-none mx-auto leading-relaxed italic">
                    © 2026 Aura Integrated University <br className="md:hidden" /> Precision Academic Ecosystem.
                </p>
            </footer>

            <AuraConsultant />
        </div>
    )
}

function ValueCard({ title, desc }) {
    return (
        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 transition-all group">
            <h4 className="text-xl font-black mb-3 text-yellow-400 uppercase tracking-widest italic">{title}</h4>
            <p className="text-blue-100/70 text-sm font-bold leading-relaxed italic uppercase opacity-60 text-xs">{desc}</p>
        </div>
    )
}

export default AboutPhilosophy
