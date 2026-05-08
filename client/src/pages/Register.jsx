import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, CheckCircle2, ChevronRight,
  MessageSquare, FileText, Save, RefreshCw, Upload, UserCircle, BadgeCheck,
  Type, Map, Compass, Building, GraduationCap, X, Sparkles,
  ShieldCheck, Zap, Briefcase, ShieldAlert, Users,
  Search, Trash2, Edit3, AlertCircle, Send, LogIn
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

const inputCls = "w-full bg-gray-50 border-gray-100 border-2 rounded-xl md:rounded-2xl px-5 py-3.5 md:py-4 text-sm md:text-base font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md"
const selectCls = "w-full bg-gray-50 border-gray-100 border-2 rounded-xl md:rounded-2xl px-5 py-3.5 md:py-4 text-sm md:text-base font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md appearance-none cursor-pointer"
const labelCls = "text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block"

function Register() {
  const navigate = useNavigate()
  const [view, setView] = useState('form') // 'form', 'review'
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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courseQuotas, setCourseQuotas] = useState([])
  const [isMobile, setIsMobile] = useState(false)

  // 🌍 ENVIRONMENT DETECTION: Optimize for mobile performance
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [formData, setFormData] = useState({
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
    document: '', reportCard: '',
    consent: false
  })

  // 🏛️ REAL-TIME REGISTRY SYNC
  useEffect(() => {
    const fetchQuotas = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/quotas');
        const data = await res.json();
        setCourseQuotas(data);
      } catch (err) {
        console.error("Quota Fetch Failure:", err);
      }
    };
    fetchQuotas();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { if (isChatOpen) { scrollToBottom() } }, [messages, isChatOpen])

  const titleCase = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/(^|[\s-])\S/g, m => m.toUpperCase());
  };

  const handleManualInput = (e) => {
    let { name, value } = e.target;
    if (['phone', 'fatherContact', 'motherContact', 'emergencyContact'].includes(name)) {
      value = value.replace(/\D/g, '');
    } else if (name !== 'email' && name !== 'facebookLink') {
      value = titleCase(value);
    }
    setFormData({ ...formData, [name]: value })
  }

  const handleTempInput = (e) => {
    let { name, value } = e.target;
    if (['phone', 'fatherContact', 'motherContact', 'emergencyContact'].includes(name)) {
      value = value.replace(/\D/g, '');
    } else if (name !== 'email' && name !== 'facebookLink') {
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

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) { navigate('/success', { state: { email: formData.email } }) }
      else { alert('❌ Error: ' + data.message) }
    } catch (error) {
      console.error('Submission Error:', error)
      alert('❌ Failed to connect to server. Check if backend is running!')
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
      const res = await fetch(`${API_BASE_URL}/consult`, { // Using purely advisory endpoint
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, history: apiHistory })
      })
      const data = await res.json()
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking)
        return [...filtered, { role: 'aura', text: data.success ? data.reply : "I am currently undergoing maintenance. Please ask again later." }]
      })
    } catch (error) {
       setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking)
        return [...filtered, { role: 'aura', text: "Connection cut. Please check your network." }]
      })
    } finally {
      setIsChatting(false)
    }
  }

  const isStepComplete = (index) => {
    if (view === 'review') return true;
    switch(index) {
      case 0: return ['course','firstName','lastName','middleName','birthday','gender','civilStatus','citizenship','homeProvince','homeCity','homeBarangay','postalCode','birthProvince','birthCity','birthBarangay'].every(f => formData[f] && formData[f].toString().trim() !== '');
      case 1: return ['phone','email'].every(f => formData[f] && formData[f].toString().trim() !== '');
      case 2: return ['fatherName','motherName','emergencyName','emergencyContact','emergencyRelation'].every(f => formData[f] && formData[f].toString().trim() !== '');
      case 3: return ['primarySchool','secondarySchool','document','consent'].every(f => (f === 'consent' ? formData[f] : (formData[f] && formData[f].toString().trim() !== '')));
      default: return false;
    }
  }

  const stepLabels = [
    { n: 1, l: 'IDENTITY' },
    { n: 2, l: 'CONTACT' },
    { n: 3, l: 'FAMILY' },
    { n: 4, l: 'ACADEMIC' }
  ];

  const renderStepper = () => (
    <div className="flex items-start justify-center max-w-lg mx-auto mb-10">
      {stepLabels.map((step, i) => {
        const complete = isStepComplete(i);
        const active = (view === 'form' && activeStep === i) || (view === 'review' && i === 3);
        return (
          <div key={i} className="flex items-start flex-1">
            <div className="flex flex-col items-center w-full" onClick={() => view === 'form' && setActiveStep(i)} style={{ cursor: view === 'form' ? 'pointer' : 'default' }}>
              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 ${complete ? 'bg-emerald-500 text-white' : active ? 'bg-blue-700 text-white shadow-md shadow-blue-200' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                {complete ? <CheckCircle2 size={14} md:size={16} /> : step.n}
              </div>
              <span className={`hidden md:block mt-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${active ? 'text-gray-900' : complete ? 'text-emerald-600' : 'text-gray-400'}`}>{step.l}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`h-0.5 flex-1 mt-[16px] md:mt-[18px] -mx-1 md:-mx-2 rounded-full transition-colors duration-500 ${isStepComplete(i) ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderField = (f) => (
    <div key={f.name} className={`space-y-1.5 ${f.halfWidth ? '' : f.fullWidth ? 'md:col-span-2' : ''}`}>
      <label className={labelCls}>{f.label}</label>
      {f.type === 'select' ? (
        <select name={f.name} value={formData[f.name]} onChange={handleManualInput} className={selectCls}>
          <option value="">Select {f.label.toLowerCase()}...</option>
          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input name={f.name} value={formData[f.name]} onChange={handleManualInput} placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`} className={inputCls} />
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
    if (docString.startsWith('[')) {
      try {
         const arr = JSON.parse(docString);
         return `${arr.length} Document(s) Uploaded`;
      } catch(e) {}
    }
    return docString;
  }

  return (
    <div className="light-theme flex flex-col h-screen bg-gray-50 overflow-hidden relative font-sans">
      
      {/* ── Overlay Branding ── */}
      <div className={`absolute top-4 md:top-6 left-4 md:left-10 z-50 pointer-events-none transition-all duration-300 ${isChatOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>
        <div className={`flex items-center gap-2 text-blue-800 font-black italic tracking-tighter text-sm md:text-lg ${isMobile ? 'bg-white' : 'bg-white/80 backdrop-blur-md'} px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl shadow-sm border border-gray-200/50`}>
          <GraduationCap size={18} md:size={22} className="text-blue-700" />
          Aura Enrollment
        </div>
      </div>

      <div className={`absolute top-4 md:top-6 right-4 md:right-10 transition-all duration-300 ${isChatOpen ? 'z-30 opacity-0 pointer-events-none' : 'z-[60] opacity-100'}`}>
        <button 
          onClick={() => navigate('/login')} 
          className={`text-[11px] md:text-[13px] font-bold transition-all duration-300 flex items-center gap-2 py-2 md:py-2.5 px-4 md:px-5 rounded-xl md:rounded-2xl shadow-sm ${isMobile ? 'bg-blue-50' : 'backdrop-blur-md border border-blue-100 bg-blue-50/80'} text-blue-800 hover:bg-blue-100 hover:shadow-md`}
        >
          <span className="hidden md:inline">Portal Login</span><span className="md:hidden">Login</span> <LogIn size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Bottom Right: Aura AI Toggler ── */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-10 z-[60]">
        <AnimatePresence>
          {!isChatOpen && (
            <motion.button 
              initial={isMobile ? { scale: 1 } : { opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={isMobile ? { scale: 1 } : { opacity: 0, scale: 0.9, y: 20 }}
              onClick={() => setIsChatOpen(true)} 
              className={`w-14 h-14 md:w-auto md:h-auto md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 md:py-3.5 md:px-6 rounded-full md:rounded-3xl shadow-[0_15px_45px_rgba(29,78,216,0.35)] ${isMobile ? 'bg-blue-700' : 'backdrop-blur-md border border-blue-600/30 bg-blue-700'} text-white hover:bg-blue-600 hover:-translate-y-1`}
            >
              <Sparkles size={18} md:size={16} /> <span className="hidden md:inline">Ask Aura</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden relative mt-8 md:mt-4">
        
        {/* Main Content Area (Form / Review) */}
        <div className="flex-1 overflow-y-auto w-full transition-all duration-300 pt-16 md:pt-14 pb-28 md:pb-0">
          <AnimatePresence mode="wait">

            {/* ════════ MANUAL FORM ════════ */}
            {view === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-10 w-full">
                <div className="max-w-3xl mx-auto space-y-2">
                  <div className="text-center mb-6 md:mb-10">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-2 md:mb-3">Start Your Journey</h2>
                    <p className="text-xs md:text-sm text-gray-500">Complete your registration to access the student portal and begin enrollment.</p>
                  </div>
                  {renderStepper()}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                      {/* STEP 0 */}
                      {activeStep === 0 && (<>
                        <SectionHeader icon={<GraduationCap size={18} />} title="Basic Identification" />
                        <div className="md:col-span-2 space-y-1.5">
                          <label className={labelCls}>Academic Program</label>
                          <select name="course" value={formData.course} onChange={handleManualInput} className={selectCls}>
                            <option value="">Select program...</option>
                            {courseQuotas.length > 0 ? (
                              courseQuotas.map(q => {
                                const isFull = q.currentCount >= q.maxSlots;
                                return (
                                  <option key={q.courseAbbr} value={q.courseAbbr} disabled={isFull}>
                                    {q.courseAbbr} - {COURSE_MAP[q.courseAbbr]} {isFull ? '(Class Full)' : ''}
                                  </option>
                                )
                              })
                            ) : (
                              Object.entries(COURSE_MAP).map(([abbr, full]) => <option key={abbr} value={abbr}>{abbr} - {full}</option>)
                            )}
                          </select>
                        </div>
                        {[
                          { name: 'firstName', label: 'First Name' },
                          { name: 'lastName', label: 'Last Name' },
                          { name: 'middleName', label: 'Middle Name' },
                          { name: 'birthday', label: 'Date of Birth', placeholder: 'MM/DD/YYYY' },
                          { name: 'civilStatus', label: 'Civil Status', type: 'select', options: ['Single', 'Married', 'Separated', 'Widowed'] },
                          { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
                          { name: 'citizenship', label: 'Citizenship' },
                        ].map(renderField)}

                        <SectionHeader icon={<ShieldAlert size={18} />} title="Emergency Contact" />
                        {[
                          { name: 'emergencyName', label: 'Contact Person', fullWidth: true },
                          { name: 'emergencyContact', label: 'Contact Number', halfWidth: true },
                          { name: 'emergencyRelation', label: 'Relationship', halfWidth: true },
                        ].map(renderField)}

                        <SectionHeader icon={<MapPin size={18} />} title="Birthplace & Residence" />
                        {[
                          { name: 'birthProvince', label: 'Birth Province' },
                          { name: 'birthCity', label: 'Birth City' },
                          { name: 'birthBarangay', label: 'Birth Barangay' },
                          { name: 'homeProvince', label: 'Home Province' },
                          { name: 'homeCity', label: 'Home City' },
                          { name: 'homeBarangay', label: 'Home Barangay' },
                          { name: 'postalCode', label: 'Postal Code' },
                        ].map(renderField)}
                      </>)}

                      {/* STEP 1 */}
                      {activeStep === 1 && (<>
                        <SectionHeader icon={<Mail size={18} />} title="Contact Details" />
                        {[
                          { name: 'phone', label: 'Primary Contact Number', placeholder: 'e.g. 09123456789' },
                          { name: 'email', label: 'Email Address', placeholder: 'e.g. name@email.com' },
                        ].map(renderField)}
                      </>)}

                      {/* STEP 2 */}
                      {activeStep === 2 && (<>
                        <SectionHeader icon={<UserCircle size={18} />} title="Family Details" />
                        {[
                          { name: 'fatherName', label: "Father's Full Name" },
                          { name: 'fatherOccupation', label: "Father's Occupation" },
                          { name: 'fatherContact', label: "Father's Contact" },
                          { name: 'motherName', label: "Mother's Full Name" },
                          { name: 'motherOccupation', label: "Mother's Occupation" },
                          { name: 'motherContact', label: "Mother's Contact" },
                        ].map(renderField)}
                      </>)}

                      {/* STEP 3 */}
                      {activeStep === 3 && (<>
                        <SectionHeader icon={<GraduationCap size={18} />} title="Educational History" />
                        {[
                          { name: 'primarySchool', label: 'Last Primary School' },
                          { name: 'primaryYear', label: 'Year Graduated' },
                          { name: 'secondarySchool', label: 'Last Secondary School' },
                          { name: 'secondaryYear', label: 'Year Graduated' },
                        ].map(renderField)}
                        <div className="md:col-span-2 space-y-6 pt-4">
                          <div className="space-y-2">
                            <label className={labelCls}>Academic Verification (Required for Enrollment)</label>
                            <label className={`w-full flex items-center justify-center gap-4 py-4 rounded-2xl text-sm font-bold transition-all border-2 border-dashed cursor-pointer shadow-sm ${formData.reportCard ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50/30'}`}>
                              <Upload size={20} className={formData.reportCard ? 'animate-pulse' : ''} /> 
                              {formData.reportCard ? 'Transcript Secured ✓' : 'Upload Transcript / Report Card'}
                              <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'reportCard')} className="hidden" />
                            </label>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-2 italic text-balance">Ensure your grades are clearly visible for institutional verification.</p>
                          </div>

                          <div className="space-y-2 pt-2">
                            <label className={labelCls}>Birth Identification Protocol</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <label className={`flex items-center justify-center gap-3 py-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${formData.document && formData.document !== 'Personal Delivery' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}>
                                <Upload size={16} /> {formData.document && formData.document !== 'Personal Delivery' ? 'Record Uploaded ✓' : 'Certification of Birth'}
                                <input type="file" multiple accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'document')} className="hidden" />
                              </label>
                              <button type="button" onClick={() => setFormData(prev => ({ ...prev, document: 'Personal Delivery' }))} className={`flex items-center justify-center gap-3 py-3.5 rounded-xl text-xs font-bold transition-all border ${formData.document === 'Personal Delivery' ? 'bg-blue-700/5 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}>
                                <RefreshCw size={16} /> Physical Delivery
                              </button>
                            </div>
                          </div>
                        </div>
                      </>)}

                      {/* NAVIGATION */}
                      <div className="md:col-span-2 pt-6 mt-4 border-t border-gray-100">
                        {activeStep < 3 ? (
                          <div className="flex items-center justify-between gap-4">
                            {activeStep > 0 ? (
                              <button onClick={() => setActiveStep(prev => prev - 1)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-all flex items-center gap-2">
                                <ArrowLeft size={16} /> Back
                              </button>
                            ) : <div />}
                            <button
                              disabled={(() => { const req = { 0: ['course','firstName','lastName','middleName','birthday','gender','civilStatus','citizenship','homeProvince','homeCity','homeBarangay','postalCode','birthProvince','birthCity','birthBarangay'], 1: ['phone','email'], 2: ['fatherName','motherName','emergencyName','emergencyContact'] }; return req[activeStep]?.some(f => !formData[f] || formData[f].toString().trim() === ''); })()}
                              onClick={() => setActiveStep(prev => prev + 1)}
                              className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${(() => { const req = { 0: ['course','firstName','lastName','middleName','birthday','gender','civilStatus','citizenship','homeProvince','homeCity','homeBarangay','postalCode','birthProvince','birthCity','birthBarangay'], 1: ['phone','email'], 2: ['fatherName','motherName','emergencyName','emergencyContact'] }; return req[activeStep]?.some(f => !formData[f] || formData[f].toString().trim() === ''); })() ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-blue-700 text-white hover:bg-blue-600 active:scale-[0.98] shadow-sm'}`}
                            >
                              Continue <ChevronRight size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="p-6 rounded-xl bg-amber-50 border border-amber-200">
                              <label className="flex items-start gap-4 cursor-pointer">
                                <div className="relative mt-0.5">
                                  <input type="checkbox" name="consent" checked={formData.consent} onChange={(e) => setFormData(prev => ({...prev, consent: e.target.checked}))} className="peer w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 transition-all cursor-pointer" />
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Data Privacy Act of 2012 (R.A. 10173)</h5>
                                  <p className="text-xs text-amber-700 leading-relaxed">I hereby give my explicit consent to the collection, processing, and disclosure of my personal data for the purpose of enrollment and other academic services.</p>
                                </div>
                              </label>
                            </div>
                            <div className="flex flex-row gap-3">
                              <button onClick={() => setActiveStep(prev => prev - 1)} className="flex-1 px-4 py-3.5 rounded-xl bg-gray-100 text-gray-600 text-[11px] md:text-sm font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span><span className="sm:hidden">Back</span>
                              </button>
                              <button
                                disabled={!formData.consent || ['primarySchool', 'primaryYear', 'secondarySchool', 'secondaryYear', 'document'].some(f => !formData[f] || formData[f].trim() === '')}
                                onClick={() => setView('review')}
                                className={`flex-[2] py-3.5 rounded-xl font-semibold text-[11px] md:text-sm transition-all flex items-center justify-center gap-2 ${(formData.consent && !['primarySchool','primaryYear','secondarySchool','secondaryYear','document'].some(f => !formData[f] || formData[f].trim() === '')) ? 'bg-blue-700 text-white hover:bg-blue-600 active:scale-[0.98] shadow-sm' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                              >
                                Review <span className="hidden sm:inline">Application</span> <ChevronRight size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════ REVIEW ════════ */}
            {view === 'review' && (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-10 w-full">
                <div className="max-w-3xl mx-auto space-y-8">
                  {renderStepper()}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Admission Summary</h2>
                    <p className="text-sm text-gray-500 mt-1">Academic Year 2026-2027</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      {[
                        { label: 'Selected Program', value: formData.course ? `${formData.course} - ${COURSE_MAP[formData.course] || ''}` : '', full: true },
                        { label: 'Full Name', value: `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`, full: true },
                        { label: 'Birth Date', value: formData.birthday },
                        { label: 'Birthplace', value: formData.birthBarangay ? `${formData.birthBarangay}, ${formData.birthCity}, ${formData.birthProvince}` : '' },
                        { label: 'Citizenship', value: formData.citizenship },
                        { label: 'Gender / Status', value: `${formData.gender || ''} / ${formData.civilStatus || ''}` },
                        { label: 'Phone', value: formData.phone },
                        { label: 'Email', value: formData.email },
                        { label: 'Home Address', value: formData.homeBarangay ? `${formData.homeBarangay}, ${formData.homeCity}, ${formData.homeProvince}` : '', full: true },
                        { label: 'Father', value: formData.fatherName ? `${formData.fatherName} (${formData.fatherOccupation || ''})` : '' },
                        { label: 'Mother', value: formData.motherName ? `${formData.motherName} (${formData.motherOccupation || ''})` : '' },
                        { label: 'Emergency Contact', value: formData.emergencyName ? `${formData.emergencyName} (${formData.emergencyRelation || ''})` : '' },
                        { label: 'Emergency No.', value: formData.emergencyContact },
                        { label: 'Secondary School', value: formData.secondarySchool ? `${formData.secondarySchool} (${formData.secondaryYear || ''})` : '' },
                        { label: 'Primary School', value: formData.primarySchool ? `${formData.primarySchool} (${formData.primaryYear || ''})` : '' },
                        { label: 'Requirement', value: formatDocumentInfo(formData.document), full: true },
                        { label: 'Data Privacy Consent', value: formData.consent ? 'Consented ✓' : 'Pending' },
                      ].map((f, i) => (
                        <div key={i} className={`${f.full ? 'md:col-span-2' : ''}`}>
                          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{f.label}</label>
                          <div className={`text-sm font-medium py-2 border-b border-gray-100 ${f.value ? 'text-gray-900' : 'text-gray-300 italic'}`}>
                            {f.value || 'Not provided'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row gap-3 pt-4">
                    <button onClick={() => { setTempData({ ...formData }); setIsEditing(true); }} className="flex-1 bg-white border border-gray-300 text-gray-600 py-3.5 rounded-xl font-semibold text-[11px] md:text-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-all">
                      <Edit3 size={16} /> <span className="hidden sm:inline">Modify Data</span><span className="sm:hidden">Edit</span>
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className={`flex-[2] bg-blue-700 hover:bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-[11px] md:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}>
                      {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      {isSubmitting ? 'Wait...' : 'Submit'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ════════ COLLAPSIBLE CHAT SIDEBAR ════════ */}
        <AnimatePresence>
          {isChatOpen && (
             <motion.div 
               initial={isMobile ? { x: '100%' } : { x: '100%', opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={isMobile ? { x: '100%' } : { x: '100%', opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
               transition={isMobile ? { type: 'just' } : { type: 'spring', damping: 28, stiffness: 220 }}
               className="fixed md:static inset-0 md:inset-auto right-0 w-full md:w-96 border-l border-gray-200 bg-white flex flex-col shrink-0 shadow-2xl z-[150] h-full"
             >
                <div className="px-5 py-4 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center font-bold text-white text-sm">A</div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">Aura Assistant</div>
                      <div className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">AI Consultant</div>
                    </div>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50 custom-scrollbar">
                  {messages.map((m, i) => (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-blue-700 text-white rounded-br-md' : 'bg-white text-gray-700 border border-gray-200 rounded-bl-md'}`}>
                        {m.isThinking ? <span className="flex items-center gap-2 text-blue-600 font-medium text-xs"><RefreshCw size={12} className="animate-spin" /> Aura is typing...</span> : m.text}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendChat} className="p-4 bg-white border-t border-gray-200 shrink-0 flex gap-2">
                   <input 
                     type="text" 
                     value={currentInput} 
                     onChange={(e) => setCurrentInput(e.target.value)} 
                     placeholder="Ask Aura a question..." 
                     className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-400" 
                   />
                   <button 
                     type="submit" 
                     disabled={!currentInput.trim() || isChatting} 
                     className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-100 disabled:text-gray-300 text-white w-12 rounded-xl flex items-center justify-center transition-all active:scale-95"
                   >
                     <Send size={18} strokeWidth={2.5} />
                   </button>
                </form>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════ EDIT MODAL ════════ */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Modify Data</h2>
                  <span className="text-xs text-gray-400 font-medium">Edit your registration details</span>
                </div>
                <button onClick={() => setIsEditing(false)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                {/* Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><User size={16} className="text-blue-700" /><h4 className="text-sm font-bold text-gray-900">Personal Identity</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[{ n: 'firstName', l: 'First Name' }, { n: 'lastName', l: 'Last Name' }, { n: 'middleName', l: 'Middle Name' }, { n: 'birthday', l: 'Birth Date' }].map(f => (
                      <div key={f.n} className="space-y-1.5"><label className={labelCls}>{f.l}</label><input name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={inputCls} /></div>
                    ))}
                    {[{ n: 'civilStatus', l: 'Civil Status', options: ['Single','Married','Separated','Widowed'] }, { n: 'gender', l: 'Gender', options: ['Male','Female','Other'] }].map(f => (
                      <div key={f.n} className="space-y-1.5"><label className={labelCls}>{f.l}</label><select name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={selectCls}><option value="">Select</option>{f.options.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                    ))}
                    <div className="md:col-span-2 space-y-1.5"><label className={labelCls}>Citizenship</label><input name="citizenship" value={tempData.citizenship || ''} onChange={handleTempInput} className={inputCls} /></div>
                  </div>
                </div>
                {/* Location */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><MapPin size={16} className="text-blue-700" /><h4 className="text-sm font-bold text-gray-900">Origin & Residence</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[{ n:'birthProvince',l:'Birth Province' },{ n:'birthCity',l:'Birth City' },{ n:'birthBarangay',l:'Birth Barangay' },{ n:'homeProvince',l:'Home Province' },{ n:'homeCity',l:'Home City' },{ n:'homeBarangay',l:'Home Barangay' },{ n:'postalCode',l:'Postal Code' },{ n:'phone',l:'Phone' },{ n:'email',l:'Email' }].map(f => (
                      <div key={f.n} className="space-y-1.5"><label className={labelCls}>{f.l}</label><input name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={inputCls} /></div>
                    ))}
                  </div>
                </div>
                {/* Family */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><ShieldAlert size={16} className="text-blue-700" /><h4 className="text-sm font-bold text-gray-900">Family & Emergency</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ n:'fatherName',l:'Father' },{ n:'motherName',l:'Mother' },{ n:'emergencyName',l:'Emergency Contact' },{ n:'emergencyContact',l:'Emergency No.' }].map(f => (
                      <div key={f.n} className="space-y-1.5"><label className={labelCls}>{f.l}</label><input name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={inputCls} /></div>
                    ))}
                  </div>
                </div>
                {/* Academic */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><GraduationCap size={16} className="text-blue-700" /><h4 className="text-sm font-bold text-gray-900">Academic & Requirements</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ n:'primarySchool',l:'Primary School' },{ n:'primaryYear',l:'Primary Year' },{ n:'secondarySchool',l:'Secondary School' },{ n:'secondaryYear',l:'Secondary Year' }].map(f => (
                      <div key={f.n} className="space-y-1.5"><label className={labelCls}>{f.l}</label><input name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={inputCls} /></div>
                    ))}
                    <div className="space-y-1.5">
                      <label className={labelCls}>Course</label>
                      <select name="course" value={(() => { const val = (tempData.course || '').toLowerCase(); const match = Object.entries(COURSE_MAP).find(([code, full]) => code.toLowerCase() === val || full.toLowerCase() === val); return match ? match[1] : ''; })()} onChange={handleTempInput} className={selectCls}>
                        <option value="">Select</option>
                        {Object.entries(COURSE_MAP).map(([code, full]) => <option key={code} value={full}>{full} ({code})</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4 shrink-0">
                <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={saveEdits} className="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"><Save size={16} /> Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Register
