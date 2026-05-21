import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, MapPin, CheckCircle2, ChevronRight,
  Save, RefreshCw, Upload, UserCircle, GraduationCap, X, Sparkles,
  ShieldAlert, Edit3, Send, Mail, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import API_BASE_URL from '../api'

const COURSE_MAP = {
  "BSIT": "Bachelor of Science in Information Technology",
  "BSCRIM": "Bachelor of Science in Criminology & Justice",
  "BSENTREP": "Bachelor of Science in Entrepreneurship",
  "BSED": "Bachelor of Secondary Education",
  "BSHM": "Bachelor of Science in Hospitality Management",
  "BPA": "Bachelor of Public Administration"
};

const inputCls = "w-full bg-white border-gray-300 border-2 rounded-xl md:rounded-2xl px-5 py-3.5 md:py-4 text-sm md:text-base font-bold !text-black caret-blue-700 placeholder:!text-gray-500 focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10 transition-all outline-none shadow-sm hover:shadow-md hover:border-gray-400"
const selectCls = "w-full bg-white border-gray-300 border-2 rounded-xl md:rounded-2xl px-5 py-3.5 md:py-4 text-sm md:text-base font-bold !text-black caret-blue-700 focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10 transition-all outline-none shadow-sm hover:shadow-md appearance-none cursor-pointer hover:border-gray-400 pr-12 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:18px_18px] bg-[right_1.25rem_center] bg-no-repeat transition-all"
const labelCls = "text-[10px] md:text-[11px] font-black !text-black uppercase tracking-[0.2em] mb-2 block"

function Register() {
  const navigate = useNavigate()
  const [view, setView] = useState('initial') // 'initial', 'form', 'review'
  const [activeStep, setActiveStep] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [tempData, setTempData] = useState({})

  // Aura Sidebar State
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'aura', text: "Maayong adlaw! I am Aura, your Institutional Inquiry Consultant. If you have questions about our programs or need help understanding the enrollment process, feel free to ask! (Please Note: I cannot record your data; ensure you type your details directly into the form fields.)" }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [isChatting, setIsChatting] = useState(false)
  const messagesEndRef = useRef(null)
  const formScrollRef = useRef(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courseQuotas, setCourseQuotas] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  
  // 🧠 AURA SELECTION INTELLIGENCE
  const [selectionBox, setSelectionBox] = useState({ visible: false, x: 0, y: 0, text: '' })
  const containerRef = useRef(null)

  // 🌍 ENVIRONMENT DETECTION
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const INITIAL_FORM_STATE = {
    firstName: '', lastName: '', middleName: '',
    phone: '', email: '', course: '', document: '',
    birthday: '', civilStatus: '', citizenship: '', gender: '',
    birthProvince: '', birthCity: '', birthBarangay: '',
    homeProvince: '', homeCity: '', homeBarangay: '', postalCode: '',
    fatherName: '', fatherContact: '', fatherOccupation: '',
    motherName: '', motherContact: '', motherOccupation: '',
    emergencyName: '', emergencyContact: '', emergencyRelation: '',
    primarySchool: '', primaryYear: '',
    secondarySchool: '', secondaryYear: '',
    previousSchool: '', previousCourse: '',
    reportCard: '',
    scheduleType: 'Weekdays',
    learningMode: 'Blended Learning',
    consent: false,
    studentType: 'NEW' // NEW, OLD, TRANSFEREE
  };

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // 🏛️ REAL-TIME REGISTRY SYNC
  useEffect(() => {
    const fetchQuotas = async () => {
      if (courseQuotas.length === 0) {
        const cached = localStorage.getItem('aura_quotas');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCourseQuotas(parsed);
            }
          } catch (e) {
            console.warn("Failed to parse cached quotas");
          }
        }
      }

      try {
        const res = await fetch(`${API_BASE_URL}/quotas?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCourseQuotas(data);
          localStorage.setItem('aura_quotas', JSON.stringify(data));
        } else if (data && data.success && Array.isArray(data.quotas)) {
          setCourseQuotas(data.quotas);
          localStorage.setItem('aura_quotas', JSON.stringify(data.quotas));
        }
      } catch (err) {
        console.error("Quota Fetch Failure:", err);
      }
    };
    fetchQuotas();
    const onFocus = () => fetchQuotas();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleTextSelection = (e) => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && text.length > 2 && text.length < 100) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionBox({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY - 10,
        text: text
      });
    } else {
      setSelectionBox(prev => ({ ...prev, visible: false }));
    }
  };

  const askAuraAboutSelection = () => {
    if (!selectionBox.text) return;
    setIsChatOpen(true);
    setCurrentInput(`Tell me about "${selectionBox.text}".`);
    setSelectionBox(prev => ({ ...prev, visible: false }));
    setTimeout(() => {
      document.getElementById('aura-chat-submit')?.click();
    }, 100);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => { if (isChatOpen) { scrollToBottom() } }, [messages, isChatOpen])

  // 🛡️ INSTITUTIONAL FUNNEL RESET: Auto-scroll to top on step transition
  useEffect(() => {
    if (formScrollRef.current) {
      formScrollRef.current.scrollTop = 0;
    }
  }, [activeStep, formData.studentType, view]);

  const titleCase = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/(^|[\s-])\S/g, m => m.toUpperCase());
  };

  const handleManualInput = (e) => {
    let { name, value } = e.target;
    if (['phone', 'fatherContact', 'motherContact', 'emergencyContact'].includes(name)) {
      value = value.replace(/\D/g, '');
    } else if (name === 'birthday') {
      const v = value.replace(/\D/g, '').slice(0, 8);
      if (v.length >= 5) {
        value = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
      } else if (v.length >= 3) {
        value = `${v.slice(0, 2)}/${v.slice(2)}`;
      } else {
        value = v;
      }
    } else if (name !== 'email') {
      value = titleCase(value);
    }
    setFormData({ ...formData, [name]: value })
  }

  const handleTempInput = (e) => {
    let { name, value } = e.target;
    if (['phone', 'fatherContact', 'motherContact', 'emergencyContact'].includes(name)) {
      value = value.replace(/\D/g, '');
    } else if (name === 'birthday') {
       const v = value.replace(/\D/g, '').slice(0, 8);
       if (v.length >= 5) {
         value = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
       } else if (v.length >= 3) {
         value = `${v.slice(0, 2)}/${v.slice(2)}`;
       } else {
         value = v;
       }
    } else if (name !== 'email') {
      value = titleCase(value);
    }
    setTempData(prev => ({ ...prev, [name]: value }))
  }

  const saveEdits = () => { setFormData(tempData); setIsEditing(false) }

  const processImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200; const MAX_HEIGHT = 1200;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = event.target.result;
      }
      reader.readAsDataURL(file);
    });
  }

  const handleFileUpload = (e, targetField) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    Promise.all(files.map(file => processImage(file))).then(base64Array => {
      setFormData(prev => ({ ...prev, [targetField]: JSON.stringify(base64Array) }));
    });
  }

  const handleTempFileUpload = (e, targetField) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    Promise.all(files.map(file => processImage(file))).then(base64Array => {
      setTempData(prev => ({ ...prev, [targetField]: JSON.stringify(base64Array) }));
    });
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) { 
        const successData = { firstName: formData.firstName, lastName: formData.lastName, course: formData.course, email: formData.email, studentType: formData.studentType };
        localStorage.setItem('aura_success_data', JSON.stringify(successData));
        navigate('/success', { state: successData });
      }
      else { alert('❌ Error: ' + data.message) }
    } catch (error) {
      console.error('Submission Error:', error)
      alert('❌ Failed to connect to server.')
    } finally { setIsSubmitting(false) }
  }

  const handleSendChat = async (e) => {
    e.preventDefault()
    if (!currentInput.trim() || isChatting) return
    const userMsg = { role: 'user', text: currentInput }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setCurrentInput('')
    setIsChatting(true)
    setMessages(prev => [...prev, { role: 'aura', text: '...', isThinking: true }])
    try {
      const apiHistory = newHistory.map(m => ({ role: m.role === 'aura' ? 'assistant' : 'user', content: m.text }))
      const res = await fetch(`${API_BASE_URL}/consult`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, history: apiHistory, step: activeStep })
      })
      const data = await res.json()
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking)
        return [...filtered, { role: 'aura', text: data.success ? data.reply : "I am currently undergoing maintenance." }]
      })
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking);
        return [...filtered, { role: 'aura', text: "Connection cut." }];
      })
    } finally { setIsChatting(false) }
  }

  const [randomizedSuggestions, setRandomizedSuggestions] = useState([])
  useEffect(() => {
    const allPool = ["Is middle name required?", "What is civil status?", "What documents to upload?", "Transferee requirements?", "Institutional email benefits?"];
    setRandomizedSuggestions(allPool.sort(() => Math.random() - 0.5).slice(0, 4));
  }, [activeStep]);

  const handleSuggestionClick = (suggestion) => {
    setCurrentInput(suggestion);
    setTimeout(() => { document.getElementById('aura-chat-submit')?.click(); }, 50);
  };

  const isStepComplete = (idx, forVisualCheck = false) => {
    if (view === 'review') return true;
    const r = formData.studentType === 'OLD' ? {
      0: ['firstName', 'lastName', 'birthday', 'phone', 'email', 'emergencyName', 'emergencyContact', 'emergencyRelation'], 
      1: ['course', 'scheduleType', 'learningMode', 'consent']
    } : {
      0: ['firstName', 'lastName', 'middleName', 'birthday', 'gender', 'civilStatus', 'citizenship', 'homeProvince', 'homeCity', 'homeBarangay', 'postalCode', 'birthProvince', 'birthCity', 'birthBarangay'], 
      1: ['phone', 'email'], 
      2: ['emergencyName', 'emergencyContact', 'emergencyRelation'], 
      3: formData.studentType === 'TRANSFEREE' 
        ? ['course', 'previousSchool', 'previousCourse', 'primarySchool', 'primaryYear', 'secondarySchool', 'secondaryYear', 'consent']
        : ['course', 'primarySchool', 'primaryYear', 'secondarySchool', 'secondaryYear', 'consent']
    };
    const fields = r[idx] || [];
    const isActuallyComplete = fields.every(f => {
      const v = formData[f];
      if (f === 'consent') return !!v;
      if (v === undefined || v === null) return false;
      return v.toString().trim() !== '';
    });
    return isActuallyComplete;
  };

  const stepLabels = formData.studentType === 'OLD' ? [
    { n: 1, l: 'VERIFICATION' },
    { n: 2, l: 'ACADEMIC' }
  ] : [
    { n: 1, l: 'IDENTITY' },
    { n: 2, l: 'CONTACT' },
    { n: 3, l: 'FAMILY' },
    { n: 4, l: 'ACADEMIC' }
  ];

  const renderStepper = () => (
    <div className="flex items-start justify-center max-w-lg mx-auto">
      {stepLabels.map((step, i) => {
        const complete = isStepComplete(i, true);
        const active = (view === 'form' && activeStep === i) || (view === 'review' && i === stepLabels.length - 1);
        return (
          <div key={i} className="flex items-start flex-1">
            <div className="flex flex-col items-center w-full" style={{ cursor: 'default' }}>
              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 ${complete ? 'bg-emerald-500 text-white' : active ? 'bg-blue-700 text-white shadow-md shadow-blue-200' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                {complete ? <CheckCircle2 size={14} /> : step.n}
              </div>
              <span className={`hidden md:block mt-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${active ? 'text-gray-900' : complete ? 'text-emerald-600' : 'text-gray-400'}`}>{step.l}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`h-0.5 flex-1 mt-[16px] md:mt-[18px] -mx-1 md:-mx-2 rounded-full transition-colors duration-500 ${isStepComplete(i, true) ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderField = (f) => (
    <div key={f.name} className={`space-y-1.5 ${f.halfWidth ? '' : f.fullWidth ? 'md:col-span-2' : ''}`}>
      <label className={labelCls}>{f.label || f.name}</label>
      {f.type === 'select' ? (
        <select name={f.name} value={formData[f.name] || ''} onChange={handleManualInput} className={selectCls}>
          <option value="">Select {(f.label || '').toLowerCase()}...</option>
          {f.options && f.options.map(o => <option key={o} value={o} className="!text-black">{o}</option>)}
        </select>
      ) : (
        <input name={f.name} value={formData[f.name] || ''} onChange={handleManualInput} placeholder={f.placeholder || `Enter ${(f.label || '').toLowerCase()}`} className={inputCls} />
      )}
    </div>
  );

  const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="md:col-span-2 flex items-center gap-3 pb-4 mb-2 border-b border-gray-100">
      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700 shrink-0">{icon}</div>
      <div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  const formatDocumentInfo = (docString) => {
    if (!docString) return '';
    try { if (docString.startsWith('[')) { const arr = JSON.parse(docString); return `${arr.length} Document(s) Uploaded`; } } catch (e) {}
    return docString;
  }

  return (
    <div ref={containerRef} onMouseUp={handleTextSelection} className="relative flex flex-col h-screen overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence>
        {selectionBox.visible && (
          <motion.button initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} onClick={askAuraAboutSelection} style={{ left: selectionBox.x, top: selectionBox.y }} className="fixed -translate-x-1/2 -translate-y-[calc(100%+15px)] z-[2000] flex items-center gap-2 bg-[#1e40af] text-white px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(30,58,138,0.4)] border border-white/20 hover:scale-105 transition-all outline-none">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Ask Aura</span>
          </motion.button>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="/campus.png" alt="Campus Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" />
      </div>

      <style>{`
        .custom-register-scroll::-webkit-scrollbar { width: 5px; }
        .custom-register-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-register-scroll::-webkit-scrollbar-thumb { background: #93c5fd; border-radius: 20px; }
        .custom-register-scroll::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        input, select { color: #000000 !important; caret-color: #1d4ed8 !important; }
        input::placeholder { color: #4b5563 !important; opacity: 1 !important; }
        select option { color: #000000 !important; background-color: #ffffff !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-10 z-[60]">
        {!isChatOpen && (
          <motion.button onClick={() => setIsChatOpen(true)} className="w-14 h-14 md:w-auto md:h-auto md:text-sm font-bold flex items-center justify-center gap-2 md:py-3.5 md:px-6 rounded-full md:rounded-3xl shadow-[0_15px_45px_rgba(29,78,216,0.35)] bg-blue-700 text-white hover:bg-blue-600">
            <Sparkles size={18} /> <span className="hidden md:inline">Ask Aura</span>
          </motion.button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden relative items-center justify-center p-4">
        <div className="max-w-3xl w-full z-10">
          <AnimatePresence mode="wait">
            {view === 'initial' && (
              <motion.div key="classify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl mx-auto py-10">
                <div className="text-center mb-12">
                   <h1 className="text-4xl md:text-6xl font-black text-[#1e3a8a] italic tracking-tighter uppercase mb-4 drop-shadow-lg">Institutional <span className="text-blue-700">Admissions</span></h1>
                   <p className="text-[10px] md:text-xs text-white font-black uppercase tracking-[0.4em] opacity-90 italic drop-shadow-md text-center">Professional Gateway &amp; Registry Protocol</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'NEW', title: 'New Student', desc: 'Freshman applicant initiating new academic journey.', icon: <Sparkles className="text-blue-600" />, action: () => { setFormData({...INITIAL_FORM_STATE, studentType: 'NEW'}); setActiveStep(0); setView('form'); window.dispatchEvent(new Event('focus')); } },
                    { id: 'OLD', title: 'Old Student', desc: 'Returning student continuing institutional residency.', icon: <RefreshCw className="text-emerald-600" />, action: () => { setFormData({...INITIAL_FORM_STATE, studentType: 'OLD'}); setActiveStep(0); setView('form'); window.dispatchEvent(new Event('focus')); } },
                    { id: 'TRANSFEREE', title: 'Transferee', desc: 'Migrating student carrying previous academic credits.', icon: <Zap className="text-amber-600" />, action: () => { setFormData({...INITIAL_FORM_STATE, studentType: 'TRANSFEREE'}); setActiveStep(0); setView('form'); window.dispatchEvent(new Event('focus')); } }
                  ].map((type) => (
                    <button key={type.id} onClick={type.action} className="group bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 border-2 border-white/20 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-left overflow-hidden h-[280px] flex flex-col justify-between hover:border-blue-600">
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 group-hover:rotate-6 transition-all border border-slate-100 shadow-sm shadow-blue-100">
                        {type.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic leading-tight">{type.title}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4 leading-relaxed line-clamp-2">{type.desc}</p>
                      </div>
                      <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-blue-700 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                        Identify &amp; Proceed <ChevronRight size={12} className="text-blue-400" />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-16 flex justify-center">
                  <button onClick={() => navigate('/login')} className="px-16 py-4 rounded-full bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all active:scale-95 shadow-2xl border border-blue-500/20">Portal Login</button>
                </div>
              </motion.div>
            )}

            {view === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <div className="space-y-2">
                    <div className="text-center mb-4 md:mb-6">
                      <h2 className="text-3xl md:text-5xl font-black text-[#1e3a8a] italic tracking-tighter uppercase mb-2 drop-shadow-sm">
                        {formData.studentType === 'NEW' ? (
                          <>Start Your <span className="text-blue-700">Journey</span></>
                        ) : formData.studentType === 'OLD' ? (
                          <>Welcome <span className="text-blue-700">Home</span></>
                        ) : (
                          <>Continue Your <span className="text-blue-700">Path</span></>
                        )}
                      </h2>
                      <p className="text-[10px] md:text-xs text-white font-bold uppercase tracking-[0.3em] drop-shadow-sm">
                        {formData.studentType === 'OLD' ? 'Verify your student registry to proceed.' : 'Complete your registration to access the student portal.'}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden flex flex-col relative transition-all duration-500 max-h-[75vh] md:max-h-[620px]">
                      <div className="px-6 md:px-10 pt-8 pb-4 bg-white border-b border-gray-50 shrink-0 z-20">
                        {renderStepper()}
                      </div>
                      <div ref={formScrollRef} className="flex-1 px-6 md:px-10 py-6 overflow-y-auto custom-register-scroll">
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 w-full ${formData.studentType === 'OLD' && activeStep === 0 ? 'max-w-xl mx-auto' : ''}`}>
                          {activeStep === 0 && (<>
                            <SectionHeader 
                              icon={formData.studentType === 'OLD' ? <RefreshCw size={18} /> : <GraduationCap size={18} />} 
                              title={formData.studentType === 'OLD' ? "Institutional Verification" : `${titleCase(formData.studentType.toLowerCase())} Identification`} 
                              subtitle={formData.studentType === 'OLD' ? "Please verify your existing student registry details." : `${titleCase(formData.studentType.toLowerCase())} identity background protocol.`}
                            />
                            {(formData.studentType === 'OLD' ? [
                              { name: 'firstName', label: 'First Name' }, 
                              { name: 'lastName', label: 'Last Name' }, 
                              { name: 'birthday', label: 'Date of Birth', placeholder: 'MM/DD/YYYY' }, 
                              { name: 'phone', label: 'Primary Contact Number' }, 
                              { name: 'email', label: 'Email Address', fullWidth: true },
                              { name: 'emergencyName', label: 'Emergency Contact Person', fullWidth: true },
                              { name: 'emergencyContact', label: 'Emergency Contact No.', halfWidth: true },
                              { name: 'emergencyRelation', label: 'Relationship', halfWidth: true }
                            ] : [
                              { name: 'firstName', label: 'First Name' }, 
                              { name: 'lastName', label: 'Last Name' }, 
                              { name: 'middleName', label: 'Middle Name' }, 
                              { name: 'birthday', label: 'Date of Birth', placeholder: 'MM/DD/YYYY' }, 
                              { name: 'civilStatus', label: 'Civil Status', type: 'select', options: ['Single', 'Married', 'Separated', 'Widowed'] }, 
                              { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] }, 
                              { name: 'citizenship', label: 'Citizenship' }
                            ]).map(renderField)}
                            {formData.studentType !== 'OLD' && (<>
                               <SectionHeader icon={<MapPin size={18} />} title="Birthplace & Residence" />
                               {[{ name: 'birthProvince', label: 'Birth Province' }, { name: 'birthCity', label: 'Birth City' }, { name: 'birthBarangay', label: 'Birth Barangay' }, { name: 'homeProvince', label: 'Home Province' }, { name: 'homeCity', label: 'Home City' }, { name: 'homeBarangay', label: 'Home Barangay' }, { name: 'postalCode', label: 'Postal Code' }].map(renderField)}
                            </>)}
                          </>)}
                          {(activeStep === 1 && formData.studentType !== 'OLD') && (<>
                            <SectionHeader icon={<Mail size={18} />} title="Your Contact Details" />
                            {[{ name: 'phone', label: 'Primary Contact Number' }, { name: 'email', label: 'Email Address' }].map(renderField)}
                          </>)}
                          {(activeStep === 2 && formData.studentType !== 'OLD') && (<>
                            <SectionHeader icon={<ShieldAlert size={18} />} title="Emergency Contact (Contact Person)" />
                            {[{ name: 'emergencyName', label: 'Full Name', fullWidth: true }, { name: 'emergencyContact', label: 'Contact Number', halfWidth: true }, { name: 'emergencyRelation', label: 'Relationship', halfWidth: true }].map(renderField)}
                            <SectionHeader icon={<UserCircle size={18} />} title="Family Details" />
                            {[{ name: 'fatherName', label: "Father's Full Name" }, { name: 'fatherOccupation', label: "Father's Occupation" }, { name: 'fatherContact', label: "Father's Contact" }, { name: 'motherName', label: "Mother's Full Name" }, { name: 'motherOccupation', label: "Mother's Occupation" }, { name: 'motherContact', label: "Mother's Contact" }].map(renderField)}
                          </>)}
                          {((activeStep === 3 && formData.studentType !== 'OLD') || (activeStep === 1 && formData.studentType === 'OLD')) && (<>
                            <SectionHeader 
                              icon={<GraduationCap size={18} />} 
                              title={formData.studentType === 'TRANSFEREE' ? "Transferee Academic Protocol" : "Academic Charter"} 
                              subtitle={formData.studentType === 'TRANSFEREE' ? "Final academic verification and transfer history." : "Institutional degree program and foundation records."}
                            />
                            <div className="md:col-span-2 space-y-6 bg-blue-50/20 p-6 rounded-[2rem] border border-blue-100/30">
                              <div className="space-y-1.5"><label className={labelCls}>Institutional Degree Program</label><select name="course" value={formData.course} onChange={handleManualInput} className={selectCls}><option value="">Select program...</option>{courseQuotas.map(q => <option key={q.courseAbbr} value={q.courseAbbr} disabled={q.currentCount >= q.maxSlots}>{q.courseAbbr} - {q.courseName || COURSE_MAP[q.courseAbbr]} {q.currentCount >= q.maxSlots ? '(Full)' : ''}</option>)}</select></div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><label className={labelCls}>Schedule</label><select name="scheduleType" value={formData.scheduleType} onChange={handleManualInput} className={selectCls}><option value="Weekdays">Weekdays</option><option value="Weekends">Weekends</option></select></div>
                                <div className="space-y-1.5"><label className={labelCls}>Mode</label><select name="learningMode" value={formData.learningMode} onChange={handleManualInput} className={selectCls}><option value="Blended Learning">Blended Learning</option><option value="Full On-Campus">Full On-Campus</option></select></div>
                              </div>
                            </div>
                            {formData.studentType === 'TRANSFEREE' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-6 bg-amber-50/30 rounded-3xl border border-amber-200/40 border-dashed md:col-span-2">
                                <SectionHeader icon={<RefreshCw size={18} />} title="Transfer Protocol" />
                                {[{ name: 'previousSchool', label: 'Last Institution' }, { name: 'previousCourse', label: 'Previous Course' }].map(renderField)}
                              </div>
                            )}
                            <div className="pt-2 border-t border-blue-100/30 mt-1 md:col-span-2">
                              <SectionHeader icon={<Save size={18} />} title="Educational Foundations" />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[{ name: 'primarySchool', label: 'Primary School' }, { name: 'primaryYear', label: 'Year' }, { name: 'secondarySchool', label: 'Secondary School' }, { name: 'secondaryYear', label: 'Year' }].map(renderField)}</div>
                            </div>
                            <div className="md:col-span-2 space-y-6 pt-4">
                               <label className={`w-full flex items-center justify-center gap-4 py-4 rounded-2xl text-sm font-bold border-2 border-dashed cursor-pointer ${formData.reportCard ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}><Upload size={20} /> {formData.reportCard ? 'Transcript Secured ✓' : 'Upload Transcript'}<input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'reportCard')} className="hidden" /></label>
                               <div className="grid grid-cols-2 gap-3"><label className={`flex items-center justify-center gap-3 py-3.5 rounded-xl text-xs font-bold border cursor-pointer ${formData.document && formData.document !== 'Personal Delivery' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}><Upload size={16} /> Birth Certificate <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'document')} className="hidden" /></label><button onClick={() => setFormData(p => ({ ...p, document: 'Personal Delivery' }))} className={`py-3.5 rounded-xl text-xs font-bold border ${formData.document === 'Personal Delivery' ? 'bg-blue-700 text-white' : 'bg-gray-50 text-gray-400'}`}>Physical Delivery</button></div>
                            </div>
                            <div className="md:col-span-2 p-5 rounded-2xl bg-amber-50/70 border border-amber-200/50 mt-4">
                              <label className="flex items-start gap-4 cursor-pointer">
                                <input type="checkbox" checked={formData.consent} onChange={(e) => setFormData(p => ({ ...p, consent: e.target.checked }))} className="mt-1 w-5 h-5 rounded border-amber-300 accent-amber-600" />
                                <div>
                                  <h5 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-2">R.A. 10173 — Data Privacy Act of 2012</h5>
                                  <p className="text-[11px] text-amber-900/80 leading-relaxed">I Agree, To give my consent to the collection, processing, and disclosure of my personal information to the Admissions Office of the <strong>Aura Integrated University (AIU)</strong> in accordance with R.A. 10173 (Data Privacy Act of 2012).</p>
                                </div>
                              </label>
                            </div>
                          </>)}
                        </div>
                      </div>
                      <div className="px-6 md:px-10 py-5 bg-gray-50/50 border-t border-gray-100 shrink-0">
                        {((formData.studentType === 'OLD' ? activeStep < 1 : activeStep < 3)) ? (
                          <div className="flex items-center justify-between gap-4">
                            <button onClick={() => activeStep > 0 ? setActiveStep(p => p - 1) : setView('initial')} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                            {(() => {
                                const req = formData.studentType === 'OLD' ? { 0: ['firstName', 'lastName', 'birthday', 'phone', 'email', 'emergencyName', 'emergencyContact', 'emergencyRelation'] } : { 0: ['firstName', 'lastName', 'middleName', 'birthday', 'gender', 'civilStatus', 'citizenship', 'homeProvince', 'homeCity', 'homeBarangay', 'postalCode', 'birthProvince', 'birthCity', 'birthBarangay'], 1: ['phone', 'email'], 2: ['emergencyName', 'emergencyContact', 'emergencyRelation'] }; 
                                const currentFields = req[activeStep] || [];
                                const isStepInvalid = currentFields.some(f => !formData[f] || formData[f].toString().trim() === '');
                                return (
                                  <button disabled={isStepInvalid} onClick={() => setActiveStep(p => p + 1)} className={`px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${isStepInvalid ? 'bg-gray-100 text-gray-300' : 'bg-blue-700 text-white shadow-blue-200'}`}>Continue <ChevronRight size={16} /></button>
                                );
                            })()}
                          </div>
                        ) : (
                          <div className="flex flex-row gap-3"><button onClick={() => setActiveStep(p => p - 1)} className="flex-1 px-4 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-semibold flex items-center justify-center gap-2"><ArrowLeft size={16} /> Back</button><button disabled={!isStepComplete(formData.studentType === 'OLD' ? 1 : 3)} onClick={() => setView('review')} className={`flex-[2] py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 ${isStepComplete(formData.studentType === 'OLD' ? 1 : 3) ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-300'}`}>Review Application <ChevronRight size={16} /></button></div>
                        )}
                      </div>
                    </div>
                </div>
              </motion.div>
            )}

            {view === 'review' && (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden flex flex-col max-h-[75vh] md:max-h-[620px]">
                  <div className="px-6 md:px-10 pt-8 pb-4 bg-white border-b border-gray-50 flex-shrink-0">{renderStepper()}</div>
                  <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 custom-register-scroll">
                    <div className="text-center mb-6"><h2 className="text-2xl font-black text-blue-700 italic uppercase">Admission Summary</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Classification: {formData.studentType}</p></div>
                    <div className="space-y-8">
                      {[
                        { title: 'Identity', fields: [{ label: 'Full Name', value: `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`, full: true }, { label: 'Date', value: formData.birthday }] },
                        { title: 'Contact', fields: [{ label: 'Phone', value: formData.phone }, { label: 'Email', value: formData.email }] },
                        { title: 'Academic', fields: [{ label: 'Program', value: formData.course, full: true }, ...(formData.studentType === 'TRANSFEREE' ? [{ label: 'Previous School', value: formData.previousSchool, full: true }] : [])] }
                      ].map((s, idx) => (
                        <div key={idx} className="space-y-3"><div className="flex items-center gap-3 border-b border-gray-100 pb-2"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full" /><h3 className="text-[10px] font-black text-blue-900 uppercase">{s.title}</h3></div><div className="grid grid-cols-2 gap-4">{s.fields.map((f, i) => <div key={i} className={f.full ? 'col-span-2' : ''}><label className="text-[9px] font-bold text-gray-400 uppercase">{f.label}</label><div className="text-sm font-bold">{f.value || 'None'}</div></div>)}</div></div>
                      ))}
                    </div>
                  </div>
                  <div className="px-6 md:px-10 py-5 bg-gray-50/50 border-t border-gray-100 flex gap-3"><button onClick={() => { setTempData({ ...formData }); setIsEditing(true); }} className="flex-1 bg-white border border-gray-300 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"><Edit3 size={14}/> Edit</button><button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] bg-blue-700 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">{isSubmitting ? 'Processing...' : 'Submit Application'}</button></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-[150] flex flex-col border-l border-gray-200">
               <div className="p-5 border-b flex justify-between items-center bg-white"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-200">A</div><div><div className="font-bold text-gray-900">Aura</div><div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Consultant</div></div></div><button onClick={() => setIsChatOpen(false)} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"><X size={16}/></button></div>
               <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30 custom-register-scroll">{messages.map((m, i) => <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] shadow-sm ${m.role === 'user' ? 'bg-blue-700 text-white rounded-br-sm' : 'bg-white text-gray-700 border border-gray-200 rounded-bl-sm'}`}>{m.isThinking ? '...' : m.text}</div></div>)}<div ref={messagesEndRef} /></div>
               <form onSubmit={handleSendChat} className="p-4 bg-white border-t flex gap-2"><input type="text" value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} placeholder="Ask Aura..." className="flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" /><button type="submit" className="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-lg"><Send size={18}/></button></form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
               <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Modify Registry Data</h2><button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20}/></button></div>
               <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-register-scroll">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[{ n: 'firstName', l: 'First Name' }, { n: 'lastName', l: 'Last Name' }, { n: 'birthday', l: 'Birth Date' }, { n: 'phone', l: 'Phone' }, { n: 'email', l: 'Email' }].map(f => <div key={f.n} className="space-y-2"><label className={labelCls}>{f.l}</label><input name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={inputCls} /></div>)}
                     {tempData.studentType === 'TRANSFEREE' && [{ n: 'previousSchool', l: 'Last Institution' }, { n: 'previousCourse', l: 'Previous Course' }].map(f => <div key={f.n} className="space-y-2"><label className={labelCls}>{f.l}</label><input name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={inputCls} /></div>)}
                  </div>
               </div>
               <div className="p-6 bg-gray-50 border-t flex gap-4"><button onClick={() => setIsEditing(false)} className="px-8 py-3 bg-white border font-bold text-gray-600 rounded-xl">Cancel</button><button onClick={saveEdits} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-bold font-black uppercase tracking-widest shadow-xl shadow-blue-200">Save Changes</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Register
