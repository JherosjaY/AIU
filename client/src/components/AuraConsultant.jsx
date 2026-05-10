import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, RefreshCw, ChevronRight } from 'lucide-react';
import API_BASE_URL from '../api';

// Global in-memory variables to persist state across React Router navigation.
// These will naturally reset on a hard browser refresh (Ctrl+Shift+R).
let globalMessages = [
    { role: 'assistant', content: "Kumusta! I am Aura, your Institutional Inquiry Consultant. Ask me anything about AIU programs, campus life, or the enrollment process! (Note: I am here to guide you; please fill out any forms manually.)" }
];
let globalIsOpen = false;

const AuraConsultant = () => {
    const [isOpen, setIsOpen] = useState(globalIsOpen);
    const [messages, setMessages] = useState(globalMessages);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Sync state changes back to global variables
    useEffect(() => { globalIsOpen = isOpen; }, [isOpen]);
    useEffect(() => { globalMessages = messages; }, [messages]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: isMobile ? "auto" : "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Fix: Include the immediately created userMessage because state updates are asynchronous
            const apiHistory = [...messages, userMessage].map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch(`${API_BASE_URL}/consult`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, history: apiHistory }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having a hard time connecting. Please try again later." }]);
            }
        } catch (error) {
            console.error('Consultation Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Mura'g naay error sa connection, dear. Check if the server is running." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div 
            className="fixed z-[200]"
            style={{
                bottom: `calc(${isMobile ? '1.5rem' : '2.5rem'} + env(safe-area-inset-bottom, 0px))`,
                right: `calc(${isMobile ? '1.5rem' : '2.5rem'} + env(safe-area-inset-right, 0px))`
            }}
        >
            {/* FAB Button */}
            <motion.div
                initial={isMobile ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={isMobile ? {} : { scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group cursor-pointer relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
                <div className="relative bg-[#1e40af] backdrop-blur-2xl border border-white/40 p-4 md:p-5 rounded-full shadow-[0_20px_60px_rgba(30,64,175,0.4)] transition-all duration-500 flex items-center justify-center">
                    {isOpen ? (
                        <X className="text-white w-6 h-6 md:w-8 md:h-8" />
                    ) : (
                        <Bot className="text-yellow-400 fill-yellow-400 w-6 h-6 md:w-8 md:h-8" />
                    )}
                </div>
                {!isOpen && (
                   <div className="absolute right-full mr-4 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 pointer-events-none mb-2">
                        <div className="bg-[#1e40af] text-white text-[9px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-2xl shadow-2xl border border-white/20 whitespace-nowrap backdrop-blur-xl">
                            Consult with Aura AI
                        </div>
                        <div className="w-2 h-2 bg-[#1e40af] rotate-45 -ml-1 border-r border-t border-white/20"></div>
                    </div>
                )}
                {!isOpen && <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 border-4 border-[#f8fafc] rounded-full shadow-lg"></div>}
            </motion.div>

            {/* Chat Dialog */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={isMobile ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={isMobile ? { opacity: 0 } : { opacity: 0, y: 100, scale: 0.8 }}
                        className={`absolute bottom-20 md:bottom-24 right-0 w-[88vw] sm:w-[400px] h-[75vh] sm:h-[600px] bg-[#0a0f1c] ${isMobile ? '' : 'backdrop-blur-2xl'} border border-white/10 rounded-[2.5rem] ${isMobile ? 'shadow-xl' : 'shadow-[0_40px_80px_rgba(0,0,0,0.6)]'} overflow-hidden flex flex-col text-left`}
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] border-b border-white/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                                <Bot className="text-yellow-400 fill-yellow-400" size={28} />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-lg tracking-tight leading-tight">Aura Consultant</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-blue-100/70 text-[10px] font-black uppercase tracking-widest">Institutional AI</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {messages.map((m, i) => (
                                <motion.div
                                    initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold leading-relaxed ${
                                            m.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-sm shadow-lg' 
                                            : `bg-white/5 text-slate-100 border border-white/10 rounded-tl-sm ${isMobile ? '' : 'backdrop-blur-sm'} shadow-xl`
                                        }`}
                                    >
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-sm border border-white/10 flex items-center gap-2">
                                        <RefreshCw size={14} className="animate-spin text-blue-400" />
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Aura is consulting...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 md:p-5 bg-black/20 border-t border-white/10 flex gap-3 items-center">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me about AIU programs or the enrollment process..."
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/20 placeholder:text-slate-500 transition-all min-w-0"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="w-12 h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all active:scale-95 group shrink-0"
                            >
                                <ChevronRight size={24} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};

export default AuraConsultant;
