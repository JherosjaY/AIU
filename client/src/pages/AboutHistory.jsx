import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookOpen, History, Award, Globe, Rocket, ChevronLeft } from 'lucide-react'
import AuraConsultant from '../components/AuraConsultant'

function AboutHistory() {
    const navigate = useNavigate()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const timeline = [
        {
            year: "2018",
            title: "The Genesis",
            desc: "Aura Integrated University was conceptualized as a response to the growing need for specialized digital tech education in the region.",
            icon: <Rocket size={24} />,
            color: "bg-blue-500"
        },
        {
            year: "2020",
            title: "Digital Integration",
            desc: "Successfully launched the first fully-integrated LMS and AI-assisted enrollment system, setting a new regional standard for higher education.",
            icon: <Globe size={24} />,
            color: "bg-indigo-600"
        },
        {
            year: "2023",
            title: "Global Recognition",
            desc: "Ranked among the top innovative universities for AI research and practical application in Southeast Asia.",
            icon: <Award size={24} />,
            color: "bg-yellow-500"
        },
        {
            year: "2026",
            title: "The Future is Aura",
            desc: "Inauguration of the Aura Integrated Building, a state-of-the-art campus designed for the Next Generation of leaders.",
            icon: <History size={24} />,
            color: "bg-[#1e40af]"
        }
    ]

    return (
        <div className="min-h-screen bg-[#001f3f] text-white font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-blue-900">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 blur-[120px] rounded-full"></div>
            </div>

            {/* Smooth Glassmorphic Header - Natural Blurring Zone */}
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
                            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.4em] text-blue-300 opacity-80">Institutional Legacy</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-5xl mx-auto px-6 pt-40 pb-24 space-y-20">
                {/* Hero section */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-6 py-1.5 rounded-full bg-[#1e40af]/10 border border-[#1e40af]/20 text-[#1e40af] text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]"
                    >
                        Our Journey
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black tracking-tighter leading-tight md:leading-none text-white italic"
                    >
                        The Chronicles of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">Aura AIU.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-blue-100/70 text-sm md:text-lg font-bold italic"
                    >
                        A decade of innovation, architectural excellence, and community-driven impact.
                    </motion.p>
                </div>

                {/* Timeline */}
                <div className="relative space-y-16 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-blue-900 before:via-[#1e40af] before:to-indigo-900">
                    {timeline.map((item, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                        >
                            {/* Dot */}
                            <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white bg-white shadow-xl text-white md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 z-10 shrink-0">
                                <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center shadow-inner`}>
                                    {item.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-4rem)] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <time className="font-black text-2xl md:text-3xl text-yellow-400 tracking-tighter italic">{item.year}</time>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white mb-4 uppercase tracking-tight text-left italic">{item.title}</h3>
                                <p className="text-blue-100/70 font-medium leading-relaxed italic text-left uppercase text-[10px] md:text-xs">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Closing section */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-[#1e40af] text-white text-center space-y-6 shadow-3xl relative overflow-hidden mx-4 md:mx-0"
                >
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <h2 className="text-2xl md:text-5xl font-black tracking-tighter leading-tight italic uppercase">And the story continues with you.</h2>
                    <p className="text-blue-100 text-sm md:text-xl font-bold italic opacity-80 max-w-2xl mx-auto uppercase">Be part of our next chapter. Start your digital journey today.</p>
                    <button 
                        onClick={() => navigate('/register')}
                        className="px-10 md:px-12 py-4 md:py-5 bg-yellow-400 text-blue-900 rounded-full font-black text-lg md:text-xl active:scale-95 transition-all shadow-2xl shadow-yellow-900/30 uppercase italic"
                    >
                        Enroll Now!
                    </button>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="py-12 text-center border-t border-white/10 mt-16 max-w-7xl mx-auto">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-300">© 2026 Aura Integrated University. Precision Academic Ecosystem.</p>
            </footer>

            <AuraConsultant />
        </div>
    )
}

export default AboutHistory
