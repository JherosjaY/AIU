import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Phone,
  GraduationCap,
  FileText,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Trash2,
  MapPin,
  Sparkles,
  Zap,
  Menu,
  Plus,
  BookOpen,
  Palette,
  Edit3
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API_BASE_URL from '../api'

const COURSE_MAP = {
  "BSIT": "Bachelor of Science in Information Technology",
  "BSCRIM": "Bachelor of Science in Criminology & Justice",
  "BSENTREP": "Bachelor of Science in Entrepreneurship",
  "BSED": "Bachelor of Secondary Education",
  "BSHM": "Bachelor of Science in Hospitality Management",
  "BPA": "Bachelor of Public Administration"
};

export default function AdminDashboard() {
  const [enrollments, setEnrollments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL') // ALL, PENDING, APPROVED, REJECTED
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTab, setCurrentTab] = useState('RECORDS') // RECORDS, QUOTAS
  const [quotas, setQuotas] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isQualifiedReject, setIsQualifiedReject] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState(null)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [selectedCourseRoster, setSelectedCourseRoster] = useState(null)
  const [courseForm, setCourseForm] = useState({
    abbr: '', name: '', description: '', category: 'Technology',
    credits: 120, years: 4, iconName: 'Monitor', color: 'border-blue-600',
    highlights: 'Professional Training, Institutional Research, Global Standards', maxSlots: 50
  })

  const handleGlobalRefresh = async () => {
    try {
      await Promise.all([fetchEnrollments(), fetchQuotas()]);
    } finally {
      setIsRefreshing(false);
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    fetchEnrollments()
    fetchQuotas()

    // ON_RESUME Logic (Background Sync on Tab Focus)
    const onFocus = () => {
      fetchEnrollments();
      fetchQuotas();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [])

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isSidebarOpen])

  const fetchQuotas = async () => {
    // 🏛️ SWR LAYER: Load cached registry immediately
    const cached = localStorage.getItem('aura_quotas');
    if (cached) setQuotas(JSON.parse(cached));

    try {
      const res = await fetch(`${API_BASE_URL}/quotas`)
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setQuotas(data);
        localStorage.setItem('aura_quotas', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Fetch Quotas Error:', error)
    } finally {
      if (isLoading) setIsLoading(false);
    }
  }

  const syncQuotas = async () => {
    try {
      await fetch(`${API_BASE_URL}/quotas/sync`, { method: 'POST' })
      fetchQuotas()
    } catch (error) {
      console.error('Sync Error:', error)
    }
  }

  const handleUpdateQuota = async (abbr, maxSlots) => {
    try {
      const res = await fetch(`${API_BASE_URL}/quotas/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abbr, maxSlots })
      })
      if (res.ok) fetchQuotas()
    } catch (error) {
      console.error('Update Quota Error:', error)
    }
  }

  const fetchEnrollments = async () => {
    // 🏛️ SWR LAYER: Load cached dossier immediately
    const cached = localStorage.getItem('aura_enrollments');
    if (cached) setEnrollments(JSON.parse(cached));

    try {
      const res = await fetch(`${API_BASE_URL}/enrollments`)
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setEnrollments(data);
        localStorage.setItem('aura_enrollments', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Fetch Enrollments Error:', error)
    } finally {
      if (isLoading) setIsLoading(false);
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // 🏛️ OPTIMISTIC UI: Add to local state immediately
    const optimisticId = Date.now();
    const optimisticCourse = {
      ...courseForm,
      id: optimisticId,
      courseAbbr: courseForm.abbr,
      courseName: courseForm.name,
      currentCount: 0,
      isOptimistic: true // marker for visual feedback if needed
    };
    setQuotas([...quotas, optimisticCourse]);
    setShowCourseModal(false);

    try {
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      if (res.ok) {
        fetchQuotas();
        resetCourseForm();
      } else {
        // Rollback on error
        fetchQuotas();
      }
    } catch (error) {
      console.error("Create Course Error:", error);
      fetchQuotas();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // 🏛️ OPTIMISTIC UI: Update local state immediately
    const updatedQuotas = quotas.map(q =>
      q.id === editingCourse.id
        ? { ...q, ...courseForm, courseAbbr: courseForm.abbr, courseName: courseForm.name }
        : q
    );
    setQuotas(updatedQuotas);
    setShowCourseModal(false);

    try {
      const res = await fetch(`${API_BASE_URL}/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      if (res.ok) {
        setEditingCourse(null);
        fetchQuotas();
        resetCourseForm();
      } else {
        // Rollback on error
        fetchQuotas();
      }
    } catch (error) {
      console.error("Update Course Error:", error);
      fetchQuotas();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCourse = (id) => {
    setCourseToDelete(id);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseToDelete}`, { method: 'DELETE' });
      if (res.ok) fetchQuotas();
    } catch (error) {
      console.error("Delete Course Error:", error);
    } finally {
      setIsProcessing(false);
      setCourseToDelete(null);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      abbr: '', name: '', description: '', category: 'Technology',
      credits: 120, years: 4, iconName: 'Monitor', color: 'border-blue-600',
      highlights: 'Professional Training, Institutional Research, Global Standards', maxSlots: 50
    });
  };

  const openCourseEdit = (course) => {
    setEditingCourse(course);
    setCourseForm({
      abbr: course.courseAbbr,
      name: course.courseName || '',
      description: course.description || '',
      category: course.category || 'All',
      credits: course.credits || 120,
      years: course.years || 4,
      iconName: course.iconName || 'GraduationCap',
      color: course.color || 'border-blue-600',
      highlights: course.highlights || '',
      maxSlots: course.maxSlots || 50
    });
    setShowCourseModal(true);
  };

  const handleDelete = async (id) => {
    setStudentToDelete(id);
    setShowDeleteModal(true);
  };

  const updateStudentField = async (id, field, value) => {
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        const updated = await res.json();
        setEnrollments(prev => prev.map(e => e.id === id ? updated : e));
        if (selectedStudent?.id === id) setSelectedStudent(updated);
      }
    } catch (error) {
      console.error('Update Failed:', error);
    }
  };

  const downloadCSV = () => {
    const headers = ["ID", "Name", "Email", "Course", "Status", "AI Status", "AI Score", "Applied At"];
    const rows = enrollments.map(e => [
      e.id,
      `${e.firstName} ${e.lastName}`,
      e.email,
      e.course,
      e.status,
      e.aiStatus || 'N/A',
      e.aiScore || 0,
      new Date(e.createdAt).toLocaleDateString()
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aura_enrollment_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCourseRosterCSV = () => {
    if (!selectedCourseRoster) return;
    const roster = enrollments.filter(e => e.course === selectedCourseRoster);
    const headers = ["ID", "Name", "Email", "Status", "AI Status", "AI Score", "Applied At"];
    const rows = roster.map(e => [
      e.id,
      `${e.firstName} ${e.lastName}`,
      e.email,
      e.status,
      e.aiStatus || 'N/A',
      e.aiScore || 0,
      new Date(e.createdAt).toLocaleDateString()
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aura_${selectedCourseRoster}_roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executeDelete = async () => {
    if (!studentToDelete) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/${studentToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setEnrollments(prev => prev.filter(e => e.id !== studentToDelete));
        if (selectedStudent?.id === studentToDelete) setSelectedStudent(null);
        fetchQuotas();
        setShowDeleteModal(false);
        setStudentToDelete(null);
      } else {
        throw new Error("Purge failed. Access restricted.");
      }
    } catch (error) {
      console.error('Purge Error:', error);
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async (id, action, customReason = null, qualified = false) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      let endpoint = action === 'APPROVE' ? `/enrollments/${id}/approve` : `/enrollments/${id}/reject`;

      if (action === 'REJECT') {
        const params = new URLSearchParams();
        if (customReason) params.append('customReason', customReason);
        if (qualified) params.append('reasonType', 'qualified');
        endpoint += (endpoint.includes('?') ? '&' : '?') + params.toString();
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST' });
      const result = await res.json();

      if (res.ok) {
        setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : e));
        if (selectedStudent?.id === id) setSelectedStudent(prev => ({ ...prev, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' }));
        fetchQuotas(); // Update stats
        setShowRejectModal(false);
        setRejectReason('');
      } else if (result.error === 'QUOTA_REACHED') {
        setErrorMessage(result.message);
      } else {
        throw new Error(result.error || 'Action failed');
      }
    } catch (error) {
      console.error('Action Error:', error);
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerAuraEvaluation = async (id) => {
    setIsEvaluating(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/evaluate/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedStudent(prev => ({
          ...prev,
          aiDecision: data.decision,
          aiScore: data.fitnessScore,
          aiStrengths: data.strengths,
          aiAnalysis: data.justification,
          aiSuggestedCourse: data.suggestedCourse,
          aiStatus: data.aiStatus
        }));
        // Refresh list to show new labels
        fetchEnrollments();
      } else {
        alert("Aura Decision Engine encountered a synchronization error.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  }

  // Effect to map persistent DB fields to AI UI state
  useEffect(() => {
    if (selectedStudent && selectedStudent.aiStatus && !selectedStudent.aiDecision) {
      setSelectedStudent(prev => ({
        ...prev,
        aiDecision: (prev.aiStatus === 'QUALIFIED' || prev.aiStatus === 'READY') ? 'AUTHORIZE' : 'DENY',
        aiScore: prev.aiScore,
        aiAnalysis: prev.aiVerdict,
        aiSuggestedCourse: prev.aiSuggestedPivot
      }));
    }
  }, [selectedStudent?.id]);

  const [aiFilter, setAiFilter] = useState('ALL') // ALL, QUALIFIED, AT_RISK, INCOMPLETE

  const filteredData = enrollments.filter(e => {
    const matchesSearch = `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'ALL' || e.status === filter
    const matchesAi = aiFilter === 'ALL' || e.aiStatus === aiFilter
    return matchesSearch && matchesFilter && matchesAi
  })

  return (
    <div className="light-theme min-h-screen bg-slate-50 text-gray-900 font-sans overflow-hidden flex flex-col md:flex-row">

      {/* ── Mobile Top Header ── */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-[60]">
        <div className="flex items-center gap-3 text-blue-700">
          <GraduationCap size={20} />
          <h2 className="text-xl font-black italic tracking-tighter text-gray-900 leading-none uppercase">
            {currentTab === 'RECORDS' ? `${filter}` : 'Capacity'} <span className="text-blue-700">{currentTab === 'RECORDS' ? 'Enrollments' : 'Limits'}</span>
          </h2>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:text-blue-700 transition-all border border-gray-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Sidebar Backdrop (Mobile Only) ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-[90] pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - FIXED POSITION */}
      <aside className={`fixed left-0 top-0 bottom-0 w-80 bg-slate-100 border-r border-gray-200 flex flex-col p-8 z-[100] shadow-xl shadow-blue-900/5 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between md:block mb-8 md:mb-12 shrink-0 px-2 md:px-4">
          <div className="flex items-center gap-3 text-blue-700">
            <GraduationCap size={22} md:size={24} />
            <div className="flex flex-col md:block">
              <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] leading-none">Institutional <br className="hidden md:block" />Management</h4>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden w-10 h-10 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-95 transition-all"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="px-6 mb-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Main Menu</div>
          {[
            { id: 'RECORDS', label: 'Enrollments', icon: <Users size={18} /> },
            { id: 'QUOTAS', label: 'Course Slots', icon: <ShieldCheck size={18} /> },
            { id: 'PROGRAMS', label: 'Academic Programs', icon: <BookOpen size={18} /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full group flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${currentTab === item.id ? 'bg-white text-blue-700 shadow-xl shadow-blue-900/10 ring-1 ring-black/5' : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-xl hover:shadow-black/5'
                }`}
            >
              <div className={currentTab === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'}>{item.icon}</div>
              <span className="truncate">{item.label}</span>
              {currentTab === item.id && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all shrink-0" />}
            </button>
          ))}

          <div className="px-6 my-4 pt-4 border-t border-gray-100 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Status Filter</div>
          {[
            { id: 'ALL', label: 'All Students', icon: <Users size={18} /> },
            { id: 'PENDING', label: 'Pending', icon: <Clock size={14} /> },
            { id: 'APPROVED', label: 'Approved', icon: <CheckCircle size={14} /> },
            { id: 'REJECTED', label: 'Rejected', icon: <XCircle size={14} /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setFilter(item.id); setCurrentTab('RECORDS'); setIsSidebarOpen(false); setAiFilter('ALL'); }}
              className={`w-full group flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${filter === item.id && currentTab === 'RECORDS' && aiFilter === 'ALL' ? 'bg-white text-blue-700 shadow-lg shadow-blue-900/10 ring-1 ring-black/5' : 'text-gray-400 hover:bg-white hover:text-gray-900 hover:shadow-xl hover:shadow-black/5'
                }`}
            >
              <div className={filter === item.id && currentTab === 'RECORDS' && aiFilter === 'ALL' ? 'text-blue-600' : 'group-hover:text-gray-900'}>{item.icon}</div>
              <span className="truncate">{item.label}</span>
            </button>
          ))}

          <div className="px-6 my-4 pt-4 border-t border-gray-100 text-[9px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={12} /> Aura Analytics
          </div>
          {[
            { id: 'QUALIFIED', label: 'Qualified', icon: <ShieldCheck size={14} />, color: 'emerald' },
            { id: 'READY', label: 'Ready for Review', icon: <Clock size={14} />, color: 'blue' },
            { id: 'AT_RISK', label: 'High Risk', icon: <ShieldAlert size={14} />, color: 'rose' },
            { id: 'INCOMPLETE', label: 'Incomplete', icon: <FileText size={14} />, color: 'amber' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setAiFilter(item.id); setFilter('ALL'); setCurrentTab('RECORDS'); setIsSidebarOpen(false); }}
              className={`w-full group flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${aiFilter === item.id ? 'bg-white text-blue-700 shadow-lg shadow-blue-900/10 ring-1 ring-black/5' : 'text-gray-400 hover:bg-white hover:text-gray-900 hover:shadow-xl hover:shadow-black/5'
                }`}
            >
              <div className={aiFilter === item.id ? 'text-blue-600' : 'group-hover:text-gray-900'}>{item.icon}</div>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer Link - FIXED AT BOTTOM */}
        <button
          onClick={() => { setIsSidebarOpen(false); handleLogout(); }}
          className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-4 text-gray-400 hover:text-rose-600 font-bold text-[10px] uppercase tracking-[0.3em] transition-all px-6 py-2 group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-rose-50 transition-all">
            <LogOut size={16} />
          </div>
          LOGOUT SESSION
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen md:ml-80 relative overflow-hidden transition-all duration-300">
        <div className="p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 bg-white gap-6">
          <div className="hidden md:flex items-center gap-6">
            <h2 className="text-xl md:text-2xl font-bold italic uppercase tracking-tighter text-gray-900 leading-none">
              {currentTab === 'RECORDS' ? `${filter} Enrollments` : 'Course Capacity'}
            </h2>
            {currentTab === 'RECORDS' && (
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
              >
                <FileText size={14} /> Export CSV
              </button>
            )}
            {currentTab === 'QUOTAS' && (
              <div className="px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm flex items-center gap-2">
                2026-2027
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative flex-1 md:w-72 group">
              <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={14} md:size={16} />
              <input
                type="text"
                placeholder="SEARCH..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100 md:bg-white border border-gray-200 md:border-transparent rounded-xl py-3 px-10 md:px-12 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 font-bold text-[9px] md:text-[10px] tracking-widest transition-all"
              />
            </div>
            <button
              onClick={handleGlobalRefresh}
              disabled={isRefreshing}
              className={`p-3 rounded-xl transition-all border border-gray-200 md:border-transparent ${isRefreshing ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-inner' : 'bg-gray-50 md:bg-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100'
                }`}
            >
              <RefreshCw size={16} md:size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <div className="hidden md:block h-10 w-[1px] bg-gray-200 mx-2"></div>
            <div className="hidden md:block w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-[1px] shadow-lg shadow-blue-700/20">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center font-black italic text-lg text-blue-700">A</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 pb-40 custom-scrollbar">
          {currentTab === 'RECORDS' ? (
            <>
              {/* SYSTEM OVERVIEW STATS */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-1 md:px-0">
                {[
                  { label: 'Applicants', value: enrollments.length, icon: <Users size={16} md:size={20} />, color: 'blue' },
                  { label: 'Pending', value: enrollments.filter(e => e.status === 'PENDING').length, icon: <Clock size={16} md:size={20} />, color: 'amber' },
                  { label: 'Authorized', value: enrollments.filter(e => e.status === 'APPROVED').length, icon: <ShieldCheck size={16} md:size={20} />, color: 'emerald' },
                  { label: 'Vacancies', value: Array.isArray(quotas) ? quotas.reduce((acc, q) => acc + ((q.maxSlots || 0) - (q.currentCount || 0)), 0) : 0, icon: <Zap size={16} md:size={20} />, color: 'indigo' },
                ].map((stat, i) => {
                  const colorMap = {
                    blue: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600',
                    amber: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600',
                    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600',
                    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600'
                  };

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white border border-gray-100 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_15px_45px_rgba(30,64,175,0.06)] flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-0 group hover:shadow-2xl hover:shadow-blue-900/10 transition-all text-center md:text-left border-b-4 border-b-transparent hover:border-b-blue-600"
                    >
                      <div className="space-y-1 md:space-y-2 order-2 md:order-1">
                        <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <h4 className="text-xl md:text-3xl font-black italic tracking-tighter text-gray-900 leading-none">{stat.value}</h4>
                      </div>
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border group-hover:text-white transition-all order-1 md:order-2 ${colorMap[stat.color]}`}>
                        {stat.icon}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-6 opacity-30">
                  <RefreshCw size={48} className="animate-spin text-blue-600" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Synchronizing Records...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-6 opacity-20">
                  <Users size={64} className="text-gray-400" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em]">No Records Found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 pb-12">
                  {filteredData.map(student => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedStudent(student)}
                      className={`group relative bg-white border transition-all rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 text-left hover:shadow-2xl hover:shadow-blue-900/10 flex items-center gap-4 md:gap-10 cursor-pointer ${selectedStudent?.id === student.id ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
                        }`}
                    >
                      <div className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl shrink-0 flex items-center justify-center transition-all font-black text-lg md:text-2xl italic tracking-tighter ${student.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                          student.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {student.firstName[0]}{student.lastName[0]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                          <h3 className="text-sm md:text-xl font-bold italic uppercase tracking-tighter text-gray-900 truncate">{student.firstName} {student.lastName}</h3>
                          <div className={`w-fit text-[7px] md:text-[8px] font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase tracking-widest ${student.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                              student.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {student.status}
                          </div>

                          {/* AI PREDICTION TAG */}
                          {student.aiStatus && (
                            <div className={`w-fit text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.2em] flex items-center gap-1 shadow-sm border ${student.aiStatus === 'QUALIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                student.aiStatus === 'AT_RISK' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                  student.aiStatus === 'INCOMPLETE' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                              <Sparkles size={8} /> {student.aiStatus} {student.aiScore > 0 && `(${student.aiScore}%)`}
                            </div>
                          )}
                        </div>
                        <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight truncate">{student.course} • <span className="text-gray-500 lowercase">{student.email}</span></p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-3 md:pr-4 relative shrink-0">
                        <p className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">{new Date(student.createdAt).toLocaleDateString()}</p>
                        <div className="flex items-center gap-2 md:gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}
                            className="hidden md:flex p-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all active:scale-95 border border-rose-100"
                          >
                            <Trash2 size={15} />
                          </button>
                          <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-50 text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100">
                            <ChevronRight size={16} md:size={18} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : currentTab === 'PROGRAMS' ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-slate-900">Academic Programs</h2>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage institutional curriculums and courses</p>
                </div>
                <button
                  onClick={() => { resetCourseForm(); setEditingCourse(null); setShowCourseModal(true); }}
                  className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95"
                >
                  <Plus size={16} /> Add Program
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quotas.map(course => (
                  <motion.div
                    key={course.id}
                    layoutId={`course-${course.id}`}
                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 group relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 bg-blue-600 ${course.color ? course.color.replace('border-', 'bg-') : 'bg-blue-600'}`} />

                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600">
                        <BookOpen size={20} />
                      </div>
                      <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openCourseEdit(course)} className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-lg transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 bg-gray-50 text-gray-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded uppercase tracking-tighter">{course.courseAbbr}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.category}</span>
                      </div>
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-tight">{course.courseName || 'Unnamed Program'}</h3>
                      <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">{course.description || 'No description provided.'}</p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center relative z-10">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-sm font-black text-slate-900 leading-none">{course.credits}</div>
                          <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Credits</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-black text-slate-900 leading-none">{course.years}</div>
                          <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Years</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Capacity</div>
                        <div className="text-xs font-black text-blue-700">{course.currentCount}/{course.maxSlots}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* QUOTA MANAGEMENT VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {quotas.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-30">
                  <ShieldCheck size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Resource Quotas Not Initialized</p>
                </div>
              )}
              {quotas.map(q => {
                const percentage = Math.min((q.currentCount / q.maxSlots) * 100, 100);
                const isFull = q.currentCount >= q.maxSlots;

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-gray-200 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-2xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
                          {COURSE_MAP[q.courseAbbr] || q.courseAbbr}
                        </h4>
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-2">{q.courseAbbr} • Institutional Quota</p>
                      </div>
                      {isFull && (
                        <div className="px-2.5 py-1 bg-rose-50 text-rose-600 font-bold text-[8px] uppercase tracking-widest rounded-full animate-pulse border border-rose-100">
                          Capacity Reached
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px] font-bold italic">
                        <span className="text-gray-400 uppercase tracking-wide">Registration</span>
                        <span className={isFull ? 'text-rose-600' : 'text-blue-600'}>{q.currentCount} / {q.maxSlots}</span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 rounded-full ${isFull ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]' : 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.2)]'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-2">
                      <button
                        onClick={() => setSelectedCourseRoster(q.courseAbbr)}
                        className="px-4 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 text-gray-500 hover:text-blue-600 rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 relative group-hover:shadow-sm"
                      >
                        <Users size={12} />
                        View Students
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Adjust Max:</span>
                        <input
                          type="number"
                          defaultValue={q.maxSlots}
                          onBlur={(e) => handleUpdateQuota(q.courseAbbr, e.target.value)}
                          className="w-16 bg-gray-50 hover:bg-white border border-gray-100 focus:border-blue-500 rounded-lg px-2 py-1.5 text-[11px] font-bold text-blue-700 outline-none transition-all text-center"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Slide-over Detail Panel */}
        <AnimatePresence>
          {selectedStudent && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl z-[150] p-0 border-l border-gray-100 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 md:p-12 pb-4 md:pb-6 shrink-0">
                <button onClick={() => setSelectedStudent(null)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-400 transition-all"><XCircle size={18} /></button>
                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">Student Information</h4>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-12 pt-0 space-y-10 custom-scrollbar">
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-start gap-4 mb-8 shadow-sm overflow-hidden"
                    >
                      <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-rose-800 uppercase tracking-widest leading-none mb-1">Approval Blocked</h4>
                        <p className="text-[10px] font-semibold text-rose-600/80 leading-relaxed uppercase">{errorMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] border-2 border-blue-600 flex items-center justify-center text-2xl md:text-3xl font-black text-blue-700 shadow-xl shadow-blue-600/10 shrink-0">
                    {selectedStudent.firstName[0]}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg md:text-2xl font-black italic tracking-tighter text-gray-900 leading-none mb-1 md:mb-2">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-gray-400">Record ID:</span> AURA-{String(selectedStudent.id).padStart(4, '0')}
                    </p>
                  </div>
                </div>

                {/* 🏛️ AUDIT TIMELINE */}
                <div className="flex items-center gap-6 mb-8 px-1">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Date Registered</span>
                    <span className="text-[10px] font-bold text-gray-800">{new Date(selectedStudent.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="w-[1px] h-6 bg-gray-100" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Last Activity</span>
                    <span className="text-[10px] font-bold text-gray-600 italic">{new Date(selectedStudent.updatedAt || selectedStudent.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* 📜 INSTITUTIONAL REQUIREMENTS CHECKLIST */}
                <div className="mb-10 p-6 bg-slate-50/50 rounded-3xl border border-dashed border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Requirements Checklist</h4>
                    <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[8px] font-bold uppercase italic tracking-tighter">Institutional Audit</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: 'reqBirthCert', label: 'Original Birth Certificate' },
                      { id: 'reqReportCard', label: 'Student Report Card (SF9)' },
                      { id: 'reqGoodMoral', label: 'Good Moral Certificate' },
                    ].map((req) => (
                      <div
                        key={req.id}
                        onClick={() => updateStudentField(selectedStudent.id, req.id, !selectedStudent[req.id])}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedStudent[req.id] ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-gray-100 text-gray-400 grayscale hover:grayscale-0 hover:border-blue-200 hover:shadow-sm'
                          }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-tight">{req.label}</span>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${selectedStudent[req.id] ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white border-gray-200'
                          }`}>
                          {selectedStudent[req.id] && <CheckCircle size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 pb-20">
                  {/* 1. Institutional Identification */}
                  <div className="space-y-4 bg-blue-50/40 border border-blue-100 p-8 rounded-[2.5rem] shadow-sm">
                    <h5 className="text-[10px] font-bold text-blue-700 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 italic flex items-center gap-2">
                      <ShieldCheck size={14} /> Institutional Profile
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailItem label="Full Name" value={`${selectedStudent.firstName} ${selectedStudent.middleName || ''} ${selectedStudent.lastName}`} icon={<Users size={12} />} />
                      <DetailItem label="Citizenship" value={selectedStudent.citizenship} icon={<ShieldCheck size={12} />} />
                      <DetailItem label="Course Choice" value={selectedStudent.course} icon={<GraduationCap size={12} />} />
                      <DetailItem label="Gender" value={selectedStudent.gender} icon={<Users size={12} />} />
                      <DetailItem label="Birth Date" value={selectedStudent.birthday} icon={<Clock size={12} />} />
                      <DetailItem label="Civil Status" value={selectedStudent.civilStatus} icon={<Users size={12} />} />
                    </div>
                  </div>

                  {/* 2. Origin & Residence */}
                  <div className="space-y-4 bg-blue-50/40 border border-blue-100 p-8 rounded-[2.5rem] shadow-sm">
                    <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 italic flex items-center gap-2">
                      <MapPin size={14} /> Location Records
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1 md:col-span-2">
                        <DetailItem label="Primary Contact" value={selectedStudent.phone} icon={<Phone size={12} />} />
                      </div>
                      <DetailItem label="Home City" value={selectedStudent.homeCity} icon={<FileText size={12} />} />
                      <DetailItem label="Home Barangay" value={selectedStudent.homeBarangay} icon={<FileText size={12} />} />
                      <DetailItem label="Birth City" value={selectedStudent.birthCity} icon={<RefreshCw size={12} />} />
                      <DetailItem label="Postal Code" value={selectedStudent.postalCode} icon={<FileText size={12} />} />
                    </div>
                  </div>

                  {/* 3. Family Lineage & Safety */}
                  <div className="space-y-4 bg-blue-50/40 border border-blue-100 p-8 rounded-[2.5rem] shadow-sm">
                    <h5 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 italic flex items-center gap-2">
                      <Users size={14} /> Family & Emergency Dossier
                    </h5>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 space-y-3 text-left">
                          <DetailItem label="Father's Name" value={selectedStudent.fatherName} icon={<Users size={12} />} />
                          <DetailItem label="Occupation / Contact" value={`${selectedStudent.fatherOccupation} • ${selectedStudent.fatherContact}`} icon={<Phone size={12} />} />
                        </div>
                        <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 space-y-3 text-left">
                          <DetailItem label="Mother's Name" value={selectedStudent.motherName} icon={<Users size={12} />} />
                          <DetailItem label="Occupation / Contact" value={`${selectedStudent.motherOccupation} • ${selectedStudent.motherContact}`} icon={<Phone size={12} />} />
                        </div>
                      </div>
                      <div className="p-5 bg-blue-50/50 shadow-sm rounded-2xl border border-blue-100 space-y-3 text-left">
                        <div className="flex flex-row items-start justify-between gap-4">
                          <DetailItem label="Emergency Contact" value={selectedStudent.emergencyName} icon={<ShieldAlert size={12} />} />
                          <div className="px-2 md:px-3 py-1 bg-blue-600 text-white text-[7px] md:text-[8px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-blue-600/20 whitespace-nowrap">Authorized</div>
                        </div>
                        <DetailItem label="Emergency Contact Number" value={selectedStudent.emergencyContact} icon={<Phone size={12} />} />
                      </div>
                    </div>
                  </div>

                  {/* 4. Academic Pedigree */}
                  <div className="space-y-4 bg-blue-50/40 border border-blue-100 p-8 rounded-[2.5rem] shadow-sm">
                    <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 italic flex items-center gap-2">
                      <GraduationCap size={14} /> Schooling History
                    </h5>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailItem label="Primary" value={`${selectedStudent.primarySchool} (${selectedStudent.primaryYear})`} icon={<FileText size={12} />} />
                        <DetailItem label="Secondary" value={`${selectedStudent.secondarySchool} (${selectedStudent.secondaryYear})`} icon={<FileText size={12} />} />
                      </div>
                    </div>
                  </div>

                  {/* 5. Academic Requirements (Transcript / Report Card) */}
                  {selectedStudent.reportCard && selectedStudent.reportCard.startsWith('[') && (
                    <div className="space-y-4 bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem]">
                      <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 italic flex items-center justify-between">
                        <span className="flex items-center gap-2"><FileText size={14} /> Academic Requirements</span>
                        <span className="text-[8px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 uppercase">Transcript/Report Card</span>
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        {(() => {
                          try {
                            const images = JSON.parse(selectedStudent.reportCard);
                            return images.map((img, idx) => (
                              <div
                                key={idx}
                                className="relative group cursor-zoom-in"
                                onClick={() => { setPreviewContent(img); setIsPreviewOpen(true); }}
                              >
                                <img src={img} alt={`Academic-${idx}`} className="w-full h-32 rounded-xl border border-gray-200 shadow-sm object-cover transition-all group-hover:brightness-75 group-hover:border-blue-400" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                  <Search className="text-white" size={20} />
                                </div>
                              </div>
                            ));
                          } catch (e) { return <p className="text-[10px] italic text-gray-400">Failed to load academic records.</p> }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* 📝 ADMIN INTERNAL NOTES */}
                  <div className="mb-12 px-1">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Internal Registrar Notes</h4>
                    <textarea
                      value={selectedStudent.adminNotes || ''}
                      onChange={(e) => updateStudentField(selectedStudent.id, 'adminNotes', e.target.value)}
                      placeholder="Add institutional notations for this applicant..."
                      className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-[11px] font-medium text-gray-700 focus:outline-none focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all min-h-[100px] shadow-sm italic"
                    />
                  </div>

                  {/* 6. Birth Identification Dossier */}
                  <div className="space-y-4 bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem]">
                    <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 italic flex items-center justify-between">
                      <span className="flex items-center gap-2"><ShieldCheck size={14} /> Birth Identification</span>
                      <span className="text-[8px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase">Legal Documentation</span>
                    </h5>

                    {selectedStudent.document === 'Personal Delivery' ? (
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 flex flex-col items-center gap-3 text-center">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                          <RefreshCw size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest leading-none">Physical Delivery Protocol</p>
                          <p className="text-[9px] font-medium text-gray-400 uppercase mt-2 tracking-tighter italic">Student will submit physical certification in-person.</p>
                        </div>
                      </div>
                    ) : selectedStudent.document && selectedStudent.document.startsWith('[') ? (
                      <div className="grid grid-cols-2 gap-4">
                        {(() => {
                          try {
                            const images = JSON.parse(selectedStudent.document);
                            return images.map((img, idx) => (
                              <div key={idx} className="relative group cursor-zoom-in" onClick={() => window.open(img, '_blank')}>
                                <img src={img} alt={`BirthDoc-${idx}`} className="w-full h-32 rounded-xl border border-gray-200 shadow-sm object-cover transition-all group-hover:brightness-75 group-hover:border-blue-400" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                  <Search className="text-white" size={20} />
                                </div>
                              </div>
                            ));
                          } catch (e) { return <p className="text-[10px] italic text-gray-400">Failed to load birth records.</p> }
                        })()}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic px-2">No digital certification attached.</p>
                    )}
                  </div>

                  {/* 6. AURA DECISION SUPPORT */}
                  <div className="space-y-6 bg-white border-2 border-blue-50 p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] -mr-16 -mt-16" />

                    <h5 className="text-[10px] font-bold text-blue-800 uppercase tracking-[0.3em] border-b border-gray-100 pb-4 italic flex items-center justify-between relative z-10">
                      <span className="flex items-center gap-2"><Sparkles size={14} className="text-blue-600" /> Institutional Decision Support</span>
                      {!selectedStudent.aiDecision && (
                        <button
                          onClick={() => triggerAuraEvaluation(selectedStudent.id)}
                          disabled={isEvaluating}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                        >
                          {isEvaluating ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                          {isEvaluating ? 'Syncing Decision...' : 'Analyze Profile'}
                        </button>
                      )}
                    </h5>

                    {selectedStudent.aiDecision ? (
                      <div className="space-y-6 relative z-10">
                        {/* Match Gauge & Decision */}
                        <div className="flex items-center gap-8">
                          <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                              <motion.circle
                                cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                strokeDasharray={251.2}
                                initial={{ strokeDashoffset: 251.2 }}
                                animate={{ strokeDashoffset: 251.2 - (251.2 * selectedStudent.aiScore) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={selectedStudent.aiDecision === 'AUTHORIZE' ? 'text-emerald-500' : 'text-rose-500'}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xl font-black italic tracking-tighter leading-none"
                              >
                                {selectedStudent.aiScore}%
                              </motion.span>
                              <span className="text-[7px] font-bold uppercase text-gray-400">Match</span>
                            </div>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className={`w-fit px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm flex items-center gap-2 ${selectedStudent.aiDecision === 'AUTHORIZE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                              {selectedStudent.aiDecision === 'AUTHORIZE' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                              {selectedStudent.aiDecision === 'AUTHORIZE' ? 'Aura: Recommended' : 'Aura: High Risk Warning'}
                            </div>
                            <motion.p
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              className="text-[11px] font-medium text-gray-600 leading-relaxed italic border-l-2 border-blue-100 pl-4 py-1"
                            >
                              "{selectedStudent.aiAnalysis}"
                            </motion.p>
                          </div>
                        </div>

                        {/* Strengths & Suggested Course */}
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedStudent.aiStrengths?.map((s, i) => (
                              <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-400 rounded-full" /> {s}
                              </span>
                            ))}
                          </div>

                          {selectedStudent.aiSuggestedCourse && selectedStudent.aiSuggestedCourse !== selectedStudent.course && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
                              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                                <Sparkles size={18} />
                              </div>
                              <div>
                                <p className="text-[8px] font-bold text-amber-700 uppercase tracking-widest mb-0.5">Recommended Program Pivot</p>
                                <p className="text-[10px] font-bold text-amber-900 uppercase">Student fits better in <span className="underline">{selectedStudent.aiSuggestedCourse}</span></p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Follow Recommendations Actions */}
                        {selectedStudent.status === 'PENDING' && (
                          <div className="pt-2 flex gap-3">
                            <button
                              onClick={() => handleAction(selectedStudent.id, selectedStudent.aiDecision === 'AUTHORIZE' ? 'APPROVE' : 'REJECT')}
                              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 ${selectedStudent.aiDecision === 'AUTHORIZE'
                                  ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700'
                                  : 'bg-rose-600 text-white shadow-rose-500/20 hover:bg-rose-700'
                                }`}
                            >
                              Apply Recommendation
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-40 group-hover:opacity-100 transition-all">
                        <Zap size={32} className="text-blue-200 group-hover:text-blue-500 transition-all animate-pulse" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] max-w-[200px] leading-relaxed">Identity Verified. Awaiting Profile Verification.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-8 border-t border-gray-100 bg-white flex gap-4">
                {selectedStudent.status === 'PENDING' ? (
                  <>
                    <button
                      disabled={isProcessing}
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-rose-100 text-rose-600 bg-white hover:bg-rose-50 transition-all disabled:opacity-50"
                    >
                      Deny
                    </button>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleAction(selectedStudent.id, 'APPROVE')}
                      className="flex-[2] bg-blue-700 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                      Authorize
                    </button>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-gray-50 text-gray-400 italic bg-gray-50/50">
                    <ShieldCheck size={14} className="text-emerald-500" /> Validation Completed
                  </div>
                )}
                <button
                  onClick={() => handleDelete(selectedStudent.id)}
                  disabled={isProcessing}
                  className="p-5 bg-rose-50 hover:bg-rose-600 border border-rose-100 rounded-2xl text-rose-600 hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                  title="Permanently Purge Record"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRejectModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !isProcessing && setShowRejectModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
              >
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
                      <XCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tighter text-gray-900">Deny Admission</h3>
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em]">Institutional Notification</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for denial..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm min-h-[120px]"
                    />
                    <button
                      onClick={() => setIsQualifiedReject(!isQualifiedReject)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border ${isQualifiedReject ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-gray-50 border-gray-100'}`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest">Academic Unqualified Template</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowRejectModal(false)} className="py-4 bg-gray-50 rounded-2xl font-bold text-[11px] uppercase tracking-widest">Back</button>
                    <button onClick={() => handleAction(selectedStudent.id, 'REJECT', rejectReason, isQualifiedReject)} className="py-4 bg-rose-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest">Confirm</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !isProcessing && setShowDeleteModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 border border-rose-100">
                    <ShieldAlert size={32} />
                  </div>
                  <h3 className="text-2xl font-bold italic uppercase tracking-tighter">Critical Warning</h3>
                  <p className="text-sm text-gray-500 font-semibold">Permanently purge this record?</p>
                  <div className="w-full space-y-3">
                    <button onClick={executeDelete} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest">Purge Record</button>
                    <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold text-[11px] uppercase tracking-widest">Abort</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setIsPreviewOpen(false)}
            >
              <button className="absolute top-10 right-10 text-white/50 bg-white/10 p-4 rounded-2xl hover:text-white transition-all">
                <XCircle size={30} />
              </button>
              <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-5xl w-full h-full flex flex-col p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-[10px] font-black uppercase tracking-[0.4em]">Institutional Registry Preview</h3>
                  <a href={previewContent} download className="px-6 py-2 bg-white/10 hover:bg-white text-white hover:text-blue-900 rounded-full text-[10px] font-bold uppercase transition-all">Download</a>
                </div>
                <div className="flex-1 bg-white/5 rounded-[40px] overflow-hidden p-4 flex items-center justify-center border border-white/10">
                  <img src={previewContent} className="max-w-full max-h-full object-contain rounded-2xl" alt="Preview" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ── COURSE MODAL (Create/Edit) ── */}
        <AnimatePresence>
          {showCourseModal && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCourseModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-3xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
              >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                      {editingCourse ? 'Edit Academic Program' : 'Charter New Program'}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Program Specification & Metadata</p>
                  </div>
                  <button onClick={() => setShowCourseModal(false)} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-all"><XCircle size={20} /></button>
                </div>

                <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Program Abbreviation (e.g., BSIT)</label>
                      <input
                        required
                        disabled={!!editingCourse}
                        value={courseForm.abbr}
                        onChange={(e) => setCourseForm({ ...courseForm, abbr: e.target.value.toUpperCase() })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Program Title</label>
                      <input
                        required
                        value={courseForm.name}
                        onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Program Description (Aura Presentation)</label>
                    <textarea
                      rows="3"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Institutional Pillars (Comma-separated highlights)</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. AI Research, Software Engineering, Global Standards"
                      value={courseForm.highlights}
                      onChange={(e) => setCourseForm({ ...courseForm, highlights: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Category</label>
                      <select
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-bold outline-none"
                      >
                        {['Technology', 'Justice', 'Business', 'Education', 'Hospitality', 'Government', 'General'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Credits</label>
                      <input type="number" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-bold outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Years</label>
                      <input type="number" value={courseForm.years} onChange={(e) => setCourseForm({ ...courseForm, years: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-bold outline-none" />
                    </div>
                    <div className="space-y-3 pt-6 flex justify-center items-center">
                      <div className={`w-10 h-10 rounded-xl ${courseForm.color ? courseForm.color.replace('border-', 'bg-') : 'bg-blue-600'} bg-opacity-20 flex items-center justify-center text-blue-600`}>
                        <BookOpen size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Icon Reference (Lucide)</label>
                      <select value={courseForm.iconName} onChange={(e) => setCourseForm({ ...courseForm, iconName: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-bold outline-none">
                        {['Monitor', 'Scale', 'Rocket', 'Pencil', 'Hotel', 'Landmark', 'GraduationCap'].map(i => <option key={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Admission Quota (Max Slots)</label>
                      <input type="number" value={courseForm.maxSlots} onChange={(e) => setCourseForm({ ...courseForm, maxSlots: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 text-sm font-bold outline-none border border-gray-100" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      disabled={isProcessing}
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? 'SYNCHRONIZING REGISTRY...' : (editingCourse ? 'CONFIRM ARCHITECTURAL UPDATE' : 'AUTHORIZE PROGRAM CHARTER')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Course Confirmation Modal */}
        <AnimatePresence>
          {courseToDelete && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl border border-gray-100 text-center"
              >
                <div className="w-20 h-20 bg-rose-50 rounded-[1.5rem] flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-100 shadow-inner">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 mb-2">Delete Program?</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-8">
                  This action is irreversible. It will completely remove the quota designation for this course.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={confirmDeleteCourse}
                    disabled={isProcessing}
                    className="w-full bg-rose-600 text-white rounded-xl py-4 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'DELETING...' : 'CONFIRM DELETION'}
                  </button>
                  <button
                    onClick={() => setCourseToDelete(null)}
                    disabled={isProcessing}
                    className="w-full bg-gray-50 text-gray-400 border border-gray-100 hover:text-gray-900 hover:bg-white rounded-xl py-4 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Course Roster Dialog */}
        <AnimatePresence>
          {selectedCourseRoster && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCourseRoster(null)} className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-sm cursor-pointer" />

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="p-8 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-800 flex items-center gap-3">
                      <Users size={24} className="text-blue-600" />
                      {selectedCourseRoster} Master Roster
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Institutional Student Registry</p>
                  </div>
                  <button onClick={() => setSelectedCourseRoster(null)} className="p-2 bg-gray-100 rounded-full hover:bg-rose-100 hover:text-rose-600 text-gray-400 transition-all">
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                  {enrollments.filter(e => e.course === selectedCourseRoster).length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                      <Users size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">No students enrolled yet.</p>
                    </div>
                  ) : (
                    enrollments.filter(e => e.course === selectedCourseRoster).map(student => (
                      <div key={student.id} className="p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-900/5 transition-all flex items-center gap-4 group bg-white">
                        <div className="w-10 h-10 rounded-xl border border-blue-100 bg-blue-50 text-blue-600 font-black flex justify-center items-center shrink-0">
                          {student.firstName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-900 truncate uppercase">{student.firstName} {student.lastName}</p>
                          <p className="text-[9px] font-medium text-gray-400 truncate">{student.email}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border shrink-0 ${student.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            student.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                          {student.status}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedCourseRoster(null)}
                    className="py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all border border-transparent"
                  >
                    Close Roster
                  </button>
                  <button
                    onClick={downloadCourseRosterCSV}
                    className="py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95 transition-all flex justify-center items-center gap-2"
                  >
                    <FileText size={14} /> Generate CSV
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function DetailItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all shrink-0 shadow-sm border border-gray-100">
        {icon}
      </div>
      <div className="flex flex-col leading-tight min-w-0">
        <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</label>
        <span className="block text-[13px] font-bold italic tracking-tight text-gray-900 truncate">{value || 'N/A'}</span>
      </div>
    </div>
  )
}
