import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, MapPin, CheckCircle2, ChevronRight,
  Save, RefreshCw, Upload, UserCircle, GraduationCap, X, Sparkles,
  ShieldAlert, Edit3, Send, Mail
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

  // 🌍 ENVIRONMENT DETECTION
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
    reportCard: '',
    consent: false
  })

  // 🏛️ REAL-TIME REGISTRY SYNC
  useEffect(() => {
    const fetchQuotas = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/quotas`);
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
        navigate('/success', { 
          state: { 
            firstName: formData.firstName, 
            lastName: formData.lastName, 
            course: formData.course,
            email: formData.email
          },
          replace: true
        })
      }
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
      const res = await fetch(`${API_BASE_URL}/consult`, {
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
    const val = (index) => {
      if (view === 'review') return true;
      const r = { 
        0: ['course', 'firstName', 'lastName', 'middleName', 'birthday', 'gender', 'civilStatus', 'citizenship', 'homeProvince', 'homeCity', 'homeBarangay', 'postalCode', 'birthProvince', 'birthCity', 'birthBarangay', 'emergencyName', 'emergencyContact', 'emergencyRelation'], 
        1: ['phone', 'email'], 
        2: ['fatherName', 'motherName'],
        3: ['primarySchool', 'secondarySchool', 'document', 'consent']
      };
      const fields = r[index] || [];
      return fields.every(f => {
        const v = formData[f];
        if (f === 'consent') return !!v;
        if (v === undefined || v === null) return false;
        return v.toString().trim() !== '';
      });
    };
    return val(index);
  }

  const stepLabels = [
    { n: 1, l: 'IDENTITY' },
    { n: 2, l: 'CONTACT' },
    { n: 3, l: 'FAMILY' },
    { n: 4, l: 'ACADEMIC' }
  ];

  const renderStepper = () => (
    <div className="flex items-start justify-center max-w-lg mx-auto">
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
    if (docString.startsWith('[')) {
      try {
        const arr = JSON.parse(docString);
        return `${arr.length} Document(s) Uploaded`;
      } catch (e) { }
    }
    return docString;
  }

  return (
    <div className="relative flex flex-col h-screen overflow-hidden font-sans">
      
      {/* ── BACKGROUND LAYER ── */}
      <div className="absolute inset-0 z-0">
        <img src="/campus.png" alt="Campus Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" />
      </div>

      {/* ── LOCAL STYLES ── */}
      <style>{`
        .custom-register-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-register-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .custom-register-scroll::-webkit-scrollbar-thumb {
          background: #4b5563; /* Dark Grey */
          border-radius: 20px;
        }
        .custom-register-scroll::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
        /* FORCE INPUT & SELECT TEXT VISIBILITY */
        input, select {
          color: #000000 !important;
          caret-color: #1d4ed8 !important; /* blue-700 */
        }
        input::placeholder {
          color: #4b5563 !important; /* Visible Grey Placeholder */
          opacity: 1 !important;
        }
        /* FORCE SELECT OPTIONS VISIBILITY */
        select option {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

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
      <div className="flex-1 flex overflow-hidden relative items-center justify-center p-4">

        {/* Main Content Area */}
        <div className="max-w-3xl w-full transition-all duration-300 z-10">
          <AnimatePresence mode="wait">

            {/* ════════ MANUAL FORM ════════ */}
            {view === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <div className="space-y-2">
                    <div className="text-center mb-4 md:mb-6">
                      <h2 className="text-3xl md:text-5xl font-black text-[#1e3a8a] italic tracking-tighter uppercase mb-2 md:mb-3 drop-shadow-sm">Start Your <span className="text-blue-700">Journey</span></h2>
                      <p className="text-[10px] md:text-xs text-white font-bold uppercase tracking-[0.3em] drop-shadow-sm">Complete your registration to access the student portal and begin enrollment.</p>
                    </div>
                    
                    <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden flex flex-col max-h-[75vh] md:max-h-[620px]">
                      <div className="px-6 md:px-10 pt-8 pb-4 bg-white border-b border-gray-50 shrink-0 z-20">
                        {renderStepper()}
                      </div>
                      
                      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 custom-register-scroll">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
                                        {q.courseAbbr} - {q.courseName || COURSE_MAP[q.courseAbbr] || q.courseAbbr} {isFull ? '(Class Full)' : ''}
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

                          {activeStep === 1 && (<>
                            <SectionHeader icon={<Mail size={18} />} title="Your Contact Details" />
                            {[
                              { name: 'phone', label: 'Primary Contact Number', placeholder: 'e.g. 09123456789' },
                              { name: 'email', label: 'Email Address', placeholder: 'e.g. name@email.com' },
                            ].map(renderField)}
                          </>)}

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
                            
                            {/* DATA PRIVACY CONSENT (RA 10173) - Moved inside Scrollable grid */}
                            <div className="md:col-span-2 p-6 rounded-2xl bg-amber-50/70 border border-amber-200/50 mt-4">
                              <label className="flex items-start gap-4 cursor-pointer">
                                <div className="relative mt-0.5">
                                  <input type="checkbox" name="consent" checked={formData.consent} onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))} className="peer w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 transition-all cursor-pointer" />
                                </div>
                                <div>
                                  <h5 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Data Privacy Act of 2012 (R.A. 10173)</h5>
                                  <p className="text-[11px] text-amber-900/70 leading-relaxed font-medium italic">I hereby give my explicit consent to the collection, processing, and disclosure of my personal data for the purpose of enrollment and other academic services.</p>
                                </div>
                              </label>
                            </div>
                          </>)}
                        </div>
                      </div>

                      <div className="px-6 md:px-10 py-5 bg-gray-50/50 border-t border-gray-100 shrink-0">
                        {activeStep < 3 ? (
                          <div className="flex items-center justify-between gap-4">
                            {activeStep > 0 ? (
                              <button onClick={() => setActiveStep(prev => prev - 1)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-all flex items-center gap-2">
                                <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span><span className="sm:hidden">Back</span>
                              </button>
                            ) : (
                              <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-all flex items-center gap-2">
                                <ArrowLeft size={16} /> <span className="hidden sm:inline">Exit</span><span className="sm:hidden">Exit</span>
                              </button>
                            )}
                            {(() => {
                              const req = { 
                                0: ['course', 'firstName', 'lastName', 'middleName', 'birthday', 'gender', 'civilStatus', 'citizenship', 'homeProvince', 'homeCity', 'homeBarangay', 'postalCode', 'birthProvince', 'birthCity', 'birthBarangay', 'emergencyName', 'emergencyContact', 'emergencyRelation'], 
                                1: ['phone', 'email'], 
                                2: ['fatherName', 'motherName'] 
                              }; 
                              const currentFields = req[activeStep] || [];
                              const isStepInvalid = currentFields.some(f => !formData[f] || formData[f].toString().trim() === '');
                              
                              return (
                                <button
                                  disabled={isStepInvalid}
                                  onClick={() => setActiveStep(prev => prev + 1)}
                                  className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${isStepInvalid ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-blue-700 text-white hover:bg-blue-600 active:scale-[0.98] shadow-sm'}`}
                                >
                                  Continue <ChevronRight size={16} strokeWidth={2.5} />
                                </button>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="flex flex-row gap-3">
                            <button onClick={() => setActiveStep(prev => prev - 1)} className="flex-1 px-4 py-3.5 rounded-xl bg-gray-100 text-gray-600 text-[11px] md:text-sm font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                              <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span><span className="sm:hidden">Back</span>
                            </button>
                            <button
                              disabled={!formData.consent || ['primarySchool', 'primaryYear', 'secondarySchool', 'secondaryYear', 'document'].some(f => !formData[f] || formData[f].toString().trim() === '')}
                              onClick={() => setView('review')}
                              className={`flex-[2] py-3.5 rounded-xl font-semibold text-[11px] md:text-sm transition-all flex items-center justify-center gap-2 ${(formData.consent && !['primarySchool', 'primaryYear', 'secondarySchool', 'secondaryYear', 'document'].some(f => !formData[f] || formData[f].toString().trim() === '')) ? 'bg-blue-700 text-white hover:bg-blue-600 active:scale-[0.98] shadow-sm' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                            >
                              Review <span className="hidden sm:inline">Application</span> <ChevronRight size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
              </motion.div>
            )}

            {/* ════════ REVIEW ════════ */}
            {view === 'review' && (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <div className="space-y-2">
                  <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden flex flex-col max-h-[75vh] md:max-h-[620px]">
                    <div className="px-6 md:px-10 pt-8 pb-4 bg-white border-b border-gray-50 shrink-0 z-20">
                      {renderStepper()}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 custom-register-scroll">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-blue-700 italic tracking-tighter uppercase drop-shadow-sm">Admission Summary</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Academic Year 2026-2027</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        {[
                          { label: 'Selected Program', value: (() => { const q = courseQuotas.find(c => c.courseAbbr === formData.course); const fullName = q?.courseName || COURSE_MAP[formData.course] || ''; return formData.course ? `${formData.course} - ${fullName}` : ''; })(), full: true },
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
                    
                    <div className="px-6 md:px-10 py-5 bg-gray-50/50 border-t border-gray-100 shrink-0">
                      <div className="flex flex-row gap-3">
                        <button onClick={() => { setTempData({ ...formData }); setIsEditing(true); }} className="flex-1 bg-white border border-gray-300 text-gray-600 py-3.5 rounded-xl font-semibold text-[11px] md:text-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-all">
                          <Edit3 size={16} /> <span className="hidden sm:inline">Modify Data</span><span className="sm:hidden">Edit</span>
                        </button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className={`flex-[2] bg-blue-700 hover:bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-[11px] md:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}>
                          {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                          {isSubmitting ? 'Wait...' : 'Submit'}
                        </button>
                      </div>
                    </div>
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
              className="fixed inset-0 md:inset-auto md:top-0 md:right-0 md:bottom-0 w-full md:w-[380px] lg:w-[420px] border-l border-gray-200 bg-white flex flex-col shrink-0 shadow-2xl z-[150] md:h-screen"
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

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50 custom-register-scroll">
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

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-register-scroll">
                {/* Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><User size={16} className="text-blue-700" /><h4 className="text-sm font-bold text-gray-900">Personal Identity</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[{ n: 'firstName', l: 'First Name' }, { n: 'lastName', l: 'Last Name' }, { n: 'middleName', l: 'Middle Name' }, { n: 'birthday', l: 'Birth Date' }].map(f => (
                      <div key={f.n} className="space-y-1.5"><label className={labelCls}>{f.l}</label><input name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={inputCls} /></div>
                    ))}
                    {[{ n: 'civilStatus', l: 'Civil Status', options: ['Single', 'Married', 'Separated', 'Widowed'] }, { n: 'gender', l: 'Gender', options: ['Male', 'Female', 'Other'] }].map(f => (
                      <div key={f.n} className="space-y-1.5"><label className={labelCls}>{f.l}</label><select name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={selectCls}><option value="">Select</option>{f.options.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                    ))}
                    <div className="md:col-span-2 space-y-1.5"><label className={labelCls}>Citizenship</label><input name="citizenship" value={tempData.citizenship || ''} onChange={handleTempInput} className={inputCls} /></div>
                  </div>
                </div>
                {/* Location */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><MapPin size={16} className="text-blue-700" /><h4 className="text-sm font-bold text-gray-900">Origin & Residence</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[{ n: 'birthProvince', l: 'Birth Province' }, { n: 'birthCity', l: 'Birth City' }, { n: 'birthBarangay', l: 'Birth Barangay' }, { n: 'homeProvince', l: 'Home Province' }, { n: 'homeCity', l: 'Home City' }, { n: 'homeBarangay', l: 'Home Barangay' }, { n: 'postalCode', l: 'Postal Code' }, { n: 'phone', l: 'Phone' }, { n: 'email', l: 'Email' }].map(f => (
                      <div key={f.n} className="space-y-1.5"><label className={labelCls}>{f.l}</label><input name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={inputCls} /></div>
                    ))}
                  </div>
                </div>
                {/* Family */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><ShieldAlert size={16} className="text-blue-700" /><h4 className="text-sm font-bold text-gray-900">Family & Emergency</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ n: 'fatherName', l: 'Father' }, { n: 'motherName', l: 'Mother' }, { n: 'emergencyName', l: 'Emergency Contact' }, { n: 'emergencyContact', l: 'Emergency No.' }].map(f => (
                      <div key={f.n} className="space-y-1.5"><label className={labelCls}>{f.l}</label><input name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={inputCls} /></div>
                    ))}
                  </div>
                </div>
                {/* Academic */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><GraduationCap size={16} className="text-blue-700" /><h4 className="text-sm font-bold text-gray-900">Academic & Requirements</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ n: 'primarySchool', l: 'Primary School' }, { n: 'primaryYear', l: 'Primary Year' }, { n: 'secondarySchool', l: 'Secondary School' }, { n: 'secondaryYear', l: 'Secondary Year' }].map(f => (
                      <div key={f.n} className="space-y-1.5"><label className={labelCls}>{f.l}</label><input name={f.n} value={tempData[f.n] || ''} onChange={handleTempInput} className={inputCls} /></div>
                    ))}

                    {/* Transcript Upload */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className={labelCls}>Academic Verification (Upload Transcript / Report Card)</label>
                      <label className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold transition-all border-2 border-dashed cursor-pointer ${
                        tempData.reportCard ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50/30'
                      }`}>
                        <Upload size={18} className={tempData.reportCard ? 'animate-pulse' : ''} />
                        {tempData.reportCard ? 'Transcript Secured ✓ (Click to replace)' : 'Upload Transcript / Report Card'}
                        <input type="file" multiple accept="image/*" onChange={(e) => handleTempFileUpload(e, 'reportCard')} className="hidden" />
                      </label>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center italic">Ensure your grades are clearly visible for institutional verification.</p>
                    </div>

                    {/* Birth Cert Upload */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className={labelCls}>Birth Identification Protocol</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className={`flex items-center justify-center gap-3 py-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          tempData.document && tempData.document !== 'Personal Delivery' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                        }`}>
                          <Upload size={16} />
                          {tempData.document && tempData.document !== 'Personal Delivery' ? 'Record Uploaded ✓ (Click to replace)' : 'Certification of Birth'}
                          <input type="file" multiple accept="image/*,.pdf" onChange={(e) => handleTempFileUpload(e, 'document')} className="hidden" />
                        </label>
                        <button type="button" onClick={() => setTempData(prev => ({ ...prev, document: 'Personal Delivery' }))} className={`flex items-center justify-center gap-3 py-3.5 rounded-xl text-xs font-bold transition-all border ${
                          tempData.document === 'Personal Delivery' ? 'bg-blue-700/5 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                        }`}>
                          <RefreshCw size={16} /> Physical Delivery
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Course</label>
                      <select name="course" value={tempData.course || ''} onChange={handleTempInput} className={selectCls}>
                        <option value="">Select</option>
                        {courseQuotas.length > 0 ? (
                          courseQuotas.map(q => {
                            const isFull = q.currentCount >= q.maxSlots;
                            return (
                              <option key={q.courseAbbr} value={q.courseAbbr} disabled={isFull}>
                                {q.courseName || COURSE_MAP[q.courseAbbr] || q.courseAbbr} ({q.courseAbbr}){isFull ? ' — Class Full' : ''}
                              </option>
                            )
                          })
                        ) : (
                          Object.entries(COURSE_MAP).map(([code, full]) => <option key={code} value={code}>{full} ({code})</option>)
                        )}
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
