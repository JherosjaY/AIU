import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    ShieldCheck, 
    Lock, 
    ChevronRight, 
    CheckCircle2, 
    AlertCircle,
    Eye,
    EyeOff,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../api';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const t = params.get('token');
        if (!t) {
            navigate('/login');
        } else {
            setToken(t);
        }
    }, [location, navigate]);

    const handleReset = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters.');
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to reset password.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Institutional server unreachable. Please try again.');
        }
    };
    return (
        <div className="relative h-screen w-screen flex flex-col overflow-hidden text-left font-sans">
            
            {/* ── BACKGROUND LAYER ── */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/campus.png"
                    alt="Campus Background"
                    className="w-full h-full object-cover"
                />
                {/* Softened white overlay for high contrast */}
                <div className="absolute inset-0 bg-white/35 backdrop-blur-[1px]" />
            </div>





            <div className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-6 mt-20 md:mt-16 mb-10 md:mb-16">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-[440px] w-full"
                >
                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-white/50 text-center"
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                                    <CheckCircle2 size={32} md:size={40} className="text-emerald-600" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-gray-900 uppercase italic mb-4">
                                    Identity <span className="text-emerald-600">Restored.</span>
                                </h1>
                                <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium">
                                    Your institutional password has been successfully updated. You may now proceed to the portal.
                                </p>
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 rounded-2xl bg-blue-700 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 active:scale-[0.98]"
                                >
                                    Login to Portal
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-8">
                                <div className="text-center mb-6 md:mb-10 px-4">
                                    <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-[#1e3a8a] uppercase italic leading-none drop-shadow-md">
                                        Reset <span className="text-blue-700">Security.</span>
                                    </h1>
                                    <p className="text-[9px] md:text-[10px] font-black text-white mt-4 md:mt-3 uppercase tracking-[0.4em] leading-relaxed drop-shadow-lg opacity-90">
                                        Credential Update Protocol
                                    </p>
                                </div>

                                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-[0_45px_110px_rgba(0,0,0,0.14)] border border-white/50 relative overflow-hidden">
                                    <form className="space-y-6" onSubmit={handleReset}>
                                        <div className="space-y-5">
                                            {/* New Password */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                                                    <input 
                                                        type={showPassword ? "text" : "password"}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="w-full bg-gray-50 border border-black/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:bg-white focus:border-blue-700 focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-black !text-black caret-blue-700 placeholder:text-gray-200"
                                                        required
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 hover:text-blue-700 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                                                <div className="relative group">
                                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                                                    <input 
                                                        type={showPassword ? "text" : "password"}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="w-full bg-gray-50 border border-black/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:bg-white focus:border-blue-700 focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-black !text-black caret-blue-700 placeholder:text-gray-200"
                                                        required
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 hover:text-blue-700 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {status === 'error' && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600"
                                            >
                                                <AlertCircle size={18} className="shrink-0" />
                                                <p className="text-[10px] font-bold uppercase tracking-wider leading-tight">{message}</p>
                                            </motion.div>
                                        )}

                                        <button 
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-700 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 active:scale-[0.98] transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50"
                                        >
                                            {status === 'loading' ? (
                                                <RefreshCw className="animate-spin" size={18} />
                                            ) : (
                                                <>Update Password <ChevronRight size={18} strokeWidth={2.5} /></>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                    {/* ── LOCAL STYLES ── */}
                    <style>{`
                        input {
                            color: #000000 !important;
                            caret-color: #1d4ed8 !important; /* blue-700 */
                        }
                        input::placeholder {
                            color: #cbd5e1 !important; /* slate-300 */
                            opacity: 1 !important;
                        }
                    `}</style>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
