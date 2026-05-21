import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  GraduationCap,
  FileText,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Trash2,
  Sparkles,
  Zap,
  Menu,
  Plus,
  BookOpen,
  Edit3,
  MapPin,
  Phone,
  Printer,
  Mail
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API_BASE_URL, { authFetch } from '../api'

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
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [isEditingStudent, setIsEditingStudent] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [admissionForm, setAdmissionForm] = useState({
    yearLevel: '1ST YEAR'
  })

  const handleSelectStudent = async (student) => {
    if (!student) {
      setSelectedStudent(null);
      return;
    }

    // 🏛️ FETCH FULL STUDENT DATA
    try {
      const res = await authFetch(`${API_BASE_URL}/enrollments/${student.id}/full`);
      if (!res.ok) {
        // Fallback to partial data if endpoint doesn't exist
        const selection = { ...student };
        if (selection.aiStatus && !selection.aiDecision) {
          selection.aiDecision = (selection.aiStatus === 'QUALIFIED' || selection.aiStatus === 'READY') ? 'AUTHORIZE' : 'DENY';
          selection.aiAnalysis = selection.aiVerdict;
          selection.aiSuggestedCourse = selection.aiSuggestedPivot;
        }
        setSelectedStudent(selection);
        return;
      }

      const data = await res.json();
      const fullStudent = data.student || data;

      // 🏛️ PERSISTENT FIELD MAPPING
      if (fullStudent.aiStatus && !fullStudent.aiDecision) {
        fullStudent.aiDecision = (fullStudent.aiStatus === 'QUALIFIED' || fullStudent.aiStatus === 'READY') ? 'AUTHORIZE' : 'DENY';
        fullStudent.aiAnalysis = fullStudent.aiVerdict;
        fullStudent.aiSuggestedCourse = fullStudent.aiSuggestedPivot;
      }
      setSelectedStudent(fullStudent);
    } catch (error) {
      console.error('Failed to fetch full student data:', error);
      // Fallback to partial data
      const selection = { ...student };
      if (selection.aiStatus && !selection.aiDecision) {
        selection.aiDecision = (selection.aiStatus === 'QUALIFIED' || selection.aiStatus === 'READY') ? 'AUTHORIZE' : 'DENY';
        selection.aiAnalysis = selection.aiVerdict;
        selection.aiSuggestedCourse = selection.aiSuggestedPivot;
      }
      setSelectedStudent(selection);
    }
  }

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
    // 🏛️ GLOBAL REGISTRY REFRESH (Initial Load)
    fetchEnrollments()
    fetchQuotas()

    // 🔄 ON_RESUME Logic: Force background sync when the admin returns to the tab
    const onFocus = () => {
      console.log('--- AURA: Institutional Tab Focus Detected. Synchronizing Registry ---');
      fetchEnrollments();
      fetchQuotas();
    };

    window.addEventListener('focus', onFocus);

    // 📡 Optional: Heartbeat Polling (Every 60 seconds)
    const pollInterval = setInterval(() => {
      fetchEnrollments();
      fetchQuotas();
    }, 60000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(pollInterval);
    };
  }, [])

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isSidebarOpen])

  const fetchQuotas = async (forceNoCache = false) => {
    // 🏛️ SWR LAYER: Load cached registry immediately ONLY if state is empty
    if (!forceNoCache && quotas.length === 0) {
      const cached = localStorage.getItem('aura_quotas');
      if (cached) {
        try {
          setQuotas(JSON.parse(cached));
        } catch (e) { console.warn("Cache parse failed"); }
      }
    }

    try {
      // Add cache-buster to ensure we get fresh data from server/CDN
      const res = await authFetch(`${API_BASE_URL}/quotas?t=${Date.now()}`)
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

  const handleUpdateQuota = async (courseAbbr, maxSlots) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/quotas/${courseAbbr}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxSlots: parseInt(maxSlots) })
      });
      if (res.ok) fetchQuotas();
    } catch (error) {
      console.error('Update Quota Error:', error);
    }
  }



  const fetchEnrollments = async () => {
    // 🏛️ SWR LAYER: Load cached dossier immediately
    const cached = localStorage.getItem('aura_enrollments');
    if (cached) {
      try {
        setEnrollments(JSON.parse(cached));
      } catch (e) { console.warn("Cache parse failed"); }
    }

    try {
      // 🚀 Cache Buster: Force Fetch from Registry
      const res = await authFetch(`${API_BASE_URL}/enrollments?t=${Date.now()}`)
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
      isOptimistic: true
    };
    setQuotas([...quotas, optimisticCourse]);
    setShowCourseModal(false);

    try {
      const res = await authFetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      const result = await res.json();

      if (res.ok && result.success) {
        // 🏛️ DIRECT INJECTION: Replace optimistic item with actual DB item
        const newCourse = { ...result.data, currentCount: 0 };
        setQuotas(prev => {
          const filtered = prev.filter(q => q.id !== optimisticId);
          const final = [...filtered, newCourse].sort((a, b) => (a.id || 0) - (b.id || 0));
          localStorage.setItem('aura_quotas', JSON.stringify(final));
          return final;
        });
        resetCourseForm();
      } else {
        fetchQuotas(true); // Fallback to full fetch if error
      }
    } catch (error) {
      console.error("Create Course Error:", error);
      fetchQuotas(true);
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
      const res = await authFetch(`${API_BASE_URL}/courses/${editingCourse.id}`, {
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
      const res = await authFetch(`${API_BASE_URL}/courses/${courseToDelete}`, { method: 'DELETE' });
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
    if (!studentToDelete) return
    setIsProcessing(true)
    try {
      const res = await authFetch(`${API_BASE_URL}/enrollments/${studentToDelete}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (res.ok) {
        setEnrollments(prev => prev.filter(e => e.id !== studentToDelete))
        handleSelectStudent(null)
        setShowDeleteModal(false)
        setStudentToDelete(null)
        alert("Institutional Registry updated. Record permanently removed.")
      } else {
        // Capture specific server error keys
        const errorMessage = data.message || data.error || data.details || "Institutional access restriction: Purge failed."
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Deletion Error:", error)
      alert(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const updateStudentField = async (id, field, value) => {
    // 🏛️ OPTIMISTIC UI: Update local state immediately
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    if (selectedStudent?.id === id) {
      setSelectedStudent(prev => ({ ...prev, [field]: value }));
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (!res.ok) throw new Error("Sync failure");
    } catch (error) {
      console.error('Update Field Error:', error);
      // Rollback on failure if needed, or just let the next refresh handle it
    }
  };

  const handleAction = async (id, action, customReason = null, qualified = false) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      let endpoint = action === 'APPROVE' ? `/enrollments/${id}/approve` : `/enrollments/${id}/reject`;
      let bodyData = {};

      if (action === 'REJECT') {
        const params = new URLSearchParams();
        if (customReason) params.append('customReason', customReason);
        if (qualified) params.append('reasonType', 'qualified');
        endpoint += (endpoint.includes('?') ? '&' : '?') + params.toString();
      } else {
        bodyData = admissionForm;
      }

      const res = await authFetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'APPROVE' ? JSON.stringify(bodyData) : undefined
      });
      const result = await res.json();

      if (res.ok) {
        const updateData = { ...result.data, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', idNumber: result.idNumber };
        setEnrollments(prev => prev.map(e => e.id === id ? { ...e, ...updateData } : e));
        if (selectedStudent?.id === id) handleSelectStudent({ ...selectedStudent, ...updateData });
        fetchQuotas(); // Update stats
        setShowRejectModal(false);
        setShowApproveModal(false);
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

  const handleUpdateRegistry = async (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/enrollments/${selectedStudent?.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const result = await res.json();
      if (res.ok) {
        setEnrollments(prev => prev.map(e => e.id === selectedStudent.id ? { ...e, ...editFormData } : e));
        setSelectedStudent(prev => ({ ...prev, ...editFormData }));
        setIsEditingStudent(false);
      } else {
        throw new Error(result.message || "Institutional update failed.");
      }
    } catch (error) {
      console.error("Update Registry Error:", error);
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('enrollment-print-template');
    if (!printContent) {
      alert("Institutional Registry Error: Print Template not found.");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1100,height=900');
    if (!printWindow) {
      alert("Popup Blocked: Please allow popups for institutional printing.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Institutional Enrollment Charter - AIU</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page { 
              size: auto; 
              margin: 0mm !important; 
            }
            body { 
              margin: 0 !important; 
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body style="margin:0; padding:0;">
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };



  const triggerAuraEvaluation = async (id) => {
    setIsEvaluating(true)
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/evaluate/${id}`);
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

  const [aiFilter, setAiFilter] = useState('ALL')
  const filteredData = enrollments.filter(e => {
    const matchesSearch = `${e.firstName} ${e.lastName} ${e.email} ${e.course}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'ALL' || e.status === filter
    const matchesAi = aiFilter === 'ALL' || e.aiStatus === aiFilter
    return matchesSearch && matchesFilter && matchesAi
  })

  const filteredQuotas = quotas.filter(q => {
    const searchLow = search.toLowerCase()
    return (q.courseName || '').toLowerCase().includes(searchLow) ||
      (q.courseAbbr || '').toLowerCase().includes(searchLow) ||
      (q.category || '').toLowerCase().includes(searchLow)
  });

  return (
    <div className="light-theme h-screen flex flex-col md:flex-row bg-slate-50 text-gray-900 font-sans overflow-hidden">

      {/* ── Mobile Top Header ── */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 z-[60]">
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
      <main className="flex-1 flex flex-col min-h-0 md:ml-80 relative overflow-hidden transition-all duration-300">
        <div className="p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 bg-white gap-6 shrink-0 z-[40]">
          <div className="hidden md:flex items-center gap-6">
            <h2 className="text-xl md:text-2xl font-bold italic uppercase tracking-tighter text-gray-900 leading-none">
              {currentTab === 'RECORDS' ? `${filter} Enrollments` : currentTab === 'QUOTAS' ? 'Institutional Quotas' : 'Academic Programs'}
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

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder={currentTab === 'RECORDS' ? "Search Registry..." : "Search Programs..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-16 pr-6 py-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-gray-300"
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
                      onClick={() => handleSelectStudent(student)}
                      className={`group relative bg-white border transition-all rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 text-left hover:shadow-2xl hover:shadow-blue-900/10 flex items-center gap-4 md:gap-10 cursor-pointer ${selectedStudent?.id === student.id ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
                        }`}
                    >
                      <div className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl shrink-0 flex items-center justify-center transition-all font-black text-lg md:text-2xl italic tracking-tighter ${student.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                        student.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {student?.firstName?.[0] || 'A'}{student?.lastName?.[0] || ''}
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
                {filteredQuotas.map(course => (
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
              {filteredQuotas.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-30">
                  <ShieldCheck size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Resource Match Not Found</p>
                </div>
              )}
              {filteredQuotas.map(q => {
                const percentage = Math.min((q.currentCount / q.maxSlots) * 100, 100);
                const isFull = q.currentCount >= q.maxSlots;

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-gray-200 p-6 md:p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-gray-900 leading-none truncate">
                          {q.courseName || COURSE_MAP[q.courseAbbr] || q.courseAbbr}
                        </h4>
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-2 shrink-0">{q.courseAbbr} • Institutional Quota</p>
                      </div>
                      {isFull && (
                        <div className="shrink-0 px-2.5 py-1 bg-rose-50 text-rose-600 font-bold text-[8px] uppercase tracking-widest rounded-full animate-pulse border border-rose-100">
                          Full
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px] font-bold italic">
                        <span className="text-gray-400 uppercase tracking-wide text-[9px]">Registration</span>
                        <span className={isFull ? 'text-rose-600' : 'text-blue-600'}>{q.currentCount} / {q.maxSlots}</span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 rounded-full ${isFull ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]' : 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.2)]'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 mt-2">
                      <button
                        onClick={() => setSelectedCourseRoster(q.courseAbbr)}
                        className="flex-1 min-w-fit px-4 py-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 text-gray-500 hover:text-blue-600 rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 relative group-hover:shadow-sm"
                      >
                        <Users size={12} />
                        View Students
                      </button>
                      <div className="flex items-center gap-2 flex-grow justify-end">
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest hidden xs:block">Max:</span>
                        <input
                          type="number"
                          defaultValue={q.maxSlots}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val !== q.maxSlots) {
                              handleUpdateQuota(q.courseAbbr, val);
                            }
                          }}
                          className="w-16 bg-gray-50/50 hover:bg-white border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 rounded-lg px-2 py-2 text-[11px] font-bold text-blue-700 outline-none transition-all text-center shadow-inner"
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
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xl z-[200] p-4 md:p-10 flex items-center justify-center"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-[0_40px_120px_-20px_rgba(30,64,175,0.3)] border border-white/20 flex flex-col overflow-hidden relative"
              >
                {/* Close Button Floating */}
                <button
                  onClick={() => handleSelectStudent(null)}
                  className="absolute top-8 right-8 w-12 h-12 bg-gray-50 hover:bg-rose-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-600 transition-all z-[210] border border-gray-100 shadow-sm"
                >
                  <XCircle size={22} />
                </button>
                <div className="flex items-center justify-between p-8 md:p-12 pb-6 shrink-0 border-b border-gray-50 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.5em] leading-none">Institutional Dossier</h4>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Official Student Enrollment Registry</p>
                    </div>
                  </div>
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
                      {selectedStudent?.firstName?.[0] || 'A'}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg md:text-2xl font-black italic tracking-tighter text-gray-900 leading-none mb-1 md:mb-2">{selectedStudent?.firstName || 'Unknown'} {selectedStudent?.lastName || 'Student'}</h3>
                      <p className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-gray-400">Record ID:</span> AURA-{String(selectedStudent?.id || 0).padStart(4, '0')}
                      </p>
                    </div>
                  </div>

                  {/* 🏛️ AUDIT TIMELINE */}
                  <div className="flex items-center gap-6 mb-8 px-1">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Date Registered</span>
                      <span className="text-[10px] font-bold text-gray-800">{selectedStudent?.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '---'}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-gray-100" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Last Activity</span>
                      <span className="text-[10px] font-bold text-gray-600 italic">{selectedStudent ? new Date(selectedStudent.updatedAt || selectedStudent.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}</span>
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
                          onClick={() => selectedStudent?.id && updateStudentField(selectedStudent.id, req.id, !selectedStudent[req.id])}
                          className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedStudent?.[req.id] ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-gray-100 text-gray-400 grayscale hover:grayscale-0 hover:border-blue-200 hover:shadow-sm'
                            }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-tight">{req.label}</span>
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${selectedStudent?.[req.id] ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white border-gray-200'
                            }`}>
                            {selectedStudent?.[req.id] && <CheckCircle size={14} strokeWidth={3} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 pb-20">
                    {/* 1. Institutional Identification */}
                    <div className="space-y-4 bg-blue-50/40 border border-blue-100 p-8 rounded-[2.5rem] shadow-sm">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3 italic">
                        <h5 className="text-[10px] font-bold text-blue-700 uppercase tracking-[0.3em] flex items-center gap-2">
                          <ShieldCheck size={14} /> Institutional Profile
                        </h5>
                        <button
                          onClick={() => {
                            setEditFormData(selectedStudent);
                            setIsEditingStudent(true);
                          }}
                          className="px-3 py-1 bg-white border border-blue-100 rounded-lg text-[8px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Edit3 size={10} /> Edit Dossier
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem label="Full Name" value={`${selectedStudent?.firstName || ''} ${selectedStudent?.middleName || ''} ${selectedStudent?.lastName || ''}`} icon={<Users size={12} />} />
                        <DetailItem label="Personal Email" value={selectedStudent?.email} icon={<Mail size={12} />} />
                        <DetailItem label="Citizenship" value={selectedStudent?.citizenship} icon={<ShieldCheck size={12} />} />
                        <DetailItem label="Course Choice" value={selectedStudent?.course} icon={<GraduationCap size={12} />} />
                        <DetailItem label="Birth Date" value={selectedStudent?.birthday} icon={<Clock size={12} />} />
                        <DetailItem label="Civil Status" value={selectedStudent?.civilStatus} icon={<Users size={12} />} />
                      </div>
                    </div>

                    {/* 2. Origin & Residence */}
                    <div className="space-y-4 bg-blue-50/40 border border-blue-100 p-8 rounded-[2.5rem] shadow-sm">
                      <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 italic flex items-center gap-2">
                        <MapPin size={14} /> Location Records
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <DetailItem label="Primary Contact" value={selectedStudent?.phone} icon={<Phone size={12} />} />
                          <DetailItem label="Institutional Email" value={selectedStudent?.instEmail || 'NOT ALLOCATED'} icon={<Mail size={12} />} />
                        </div>
                        <DetailItem label="Home City / Province" value={`${selectedStudent?.homeCity || ''}, ${selectedStudent?.homeProvince || ''}`} icon={<FileText size={12} />} />
                        <DetailItem label="Home Barangay" value={selectedStudent?.homeBarangay} icon={<FileText size={12} />} />
                        <DetailItem label="Birth Locality" value={`${selectedStudent?.birthCity || ''}, ${selectedStudent?.birthProvince || ''}`} icon={<RefreshCw size={12} />} />
                        <DetailItem label="Postal Code" value={selectedStudent?.postalCode} icon={<FileText size={12} />} />
                      </div>
                    </div>

                    {/* 3. Family Lineage & Safety */}
                    <div className="space-y-4 bg-blue-50/40 border border-blue-100 p-8 rounded-[2.5rem] shadow-sm">
                      <h5 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 italic flex items-center gap-2">
                        <Users size={14} /> Family & Emergency Contacts
                      </h5>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 space-y-3 text-left">
                            <DetailItem label="Father's Name" value={selectedStudent?.fatherName} icon={<Users size={12} />} />
                            <DetailItem label="Father's Occupation" value={selectedStudent?.fatherOccupation} icon={<ShieldCheck size={12} />} />
                            <DetailItem label="Father's Contact" value={selectedStudent?.fatherContact} icon={<Phone size={12} />} />
                          </div>
                          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 space-y-3 text-left">
                            <DetailItem label="Mother's Name" value={selectedStudent?.motherName} icon={<Users size={12} />} />
                            <DetailItem label="Mother's Occupation" value={selectedStudent?.motherOccupation} icon={<ShieldCheck size={12} />} />
                            <DetailItem label="Mother's Contact" value={selectedStudent?.motherContact} icon={<Phone size={12} />} />
                          </div>
                        </div>
                        <div className="p-5 bg-blue-50/50 shadow-sm rounded-2xl border border-blue-100 space-y-3 text-left">
                          <div className="flex flex-row items-start justify-between gap-4">
                            <DetailItem label="Emergency Contact" value={selectedStudent?.emergencyName} icon={<ShieldAlert size={12} />} />
                            <div className="flex flex-col items-end gap-1">
                              <DetailItem label="Relationship" value={selectedStudent?.emergencyRelation} icon={<Users size={12} />} />
                              <div className="px-2 md:px-3 py-1 bg-blue-600 text-white text-[7px] md:text-[8px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-blue-600/20 whitespace-nowrap">Authorized</div>
                            </div>
                          </div>
                          <DetailItem label="Emergency No." value={selectedStudent?.emergencyContact} icon={<Phone size={12} />} />
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
                          <DetailItem label="Primary" value={`${selectedStudent?.primarySchool || ''} (${selectedStudent?.primaryYear || ''})`} icon={<FileText size={12} />} />
                          <DetailItem label="Secondary" value={`${selectedStudent?.secondarySchool || ''} (${selectedStudent?.secondaryYear || ''})`} icon={<FileText size={12} />} />
                        </div>
                      </div>
                    </div>

                    {/* 5. Academic Requirements (Transcript / Report Card) */}
                    {selectedStudent?.reportCard && selectedStudent?.reportCard?.startsWith('[') && (
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
                        value={selectedStudent?.adminNotes || ''}
                        onChange={(e) => selectedStudent?.id && updateStudentField(selectedStudent.id, 'adminNotes', e.target.value)}
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

                      {selectedStudent?.document === 'Personal Delivery' ? (
                        <div className="p-6 bg-white rounded-2xl border border-gray-100 flex flex-col items-center gap-3 text-center">
                          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <RefreshCw size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest leading-none">Physical Delivery Protocol</p>
                            <p className="text-[9px] font-medium text-gray-400 uppercase mt-2 tracking-tighter italic">Student will submit physical certification in-person.</p>
                          </div>
                        </div>
                      ) : selectedStudent?.document && selectedStudent?.document?.startsWith('[') ? (
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
                            onClick={() => selectedStudent?.id && triggerAuraEvaluation(selectedStudent.id)}
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
                                  {Math.round(selectedStudent.aiScore || 0)}%
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
                                "{selectedStudent?.aiAnalysis || 'Awaiting profile analysis...'}"
                              </motion.p>
                            </div>
                          </div>

                          {/* Strengths & Suggested Course */}
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-wrap gap-2">
                              {selectedStudent?.aiStrengths?.map((s, i) => (
                                <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                  <div className="w-1 h-1 bg-blue-400 rounded-full" /> {s}
                                </span>
                              ))}
                            </div>

                            {selectedStudent?.aiSuggestedCourse && selectedStudent?.aiSuggestedCourse !== selectedStudent?.course && (
                              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                                  <Sparkles size={18} />
                                </div>
                                <div>
                                  <p className="text-[8px] font-bold text-amber-700 uppercase tracking-widest mb-0.5">Recommended Program Pivot</p>
                                  <p className="text-[10px] font-bold text-amber-900 uppercase">Student fits better in <span className="underline">{selectedStudent?.aiSuggestedCourse}</span></p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Follow Recommendations Actions */}
                          {selectedStudent?.status === 'PENDING' && (
                            <div className="pt-2 flex gap-3">
                              <button
                                onClick={() => selectedStudent?.id && handleAction(selectedStudent.id, selectedStudent?.aiDecision === 'AUTHORIZE' ? 'APPROVE' : 'REJECT')}
                                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 ${selectedStudent?.aiDecision === 'AUTHORIZE'
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
                  {selectedStudent?.status === 'PENDING' ? (
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
                        onClick={() => setShowApproveModal(true)}
                        className="flex-[2] bg-blue-700 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                      >
                        {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                        Authorize
                      </button>
                    </>
                  ) : selectedStudent?.status === 'APPROVED' ? (
                    <div className="flex-1 flex gap-3">
                      <div className="flex-1 px-4 py-4 rounded-xl border border-emerald-100 bg-emerald-50 flex items-center justify-center gap-3">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <div className="flex flex-col leading-tight text-left">
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{selectedStudent?.idNumber || 'ID ALLOCATED'}</span>
                          <span className="text-[8px] font-bold text-emerald-600 uppercase">Institutional Validation Clear</span>
                        </div>
                      </div>
                      <button
                        onClick={handlePrint}
                        className="flex-[1.5] relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-all" />
                        <div className="relative h-full bg-[#001f3f] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/5">
                            <Printer size={16} className="group-hover:scale-110 transition-transform" />
                          </div>
                          Print Enrollment Form
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 px-4 py-4 rounded-xl border border-rose-100 bg-rose-50 flex items-center justify-center gap-3">
                      <XCircle size={16} className="text-rose-500" />
                      <div className="flex flex-col leading-tight text-left">
                        <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">ADMISSION DENIED</span>
                        <span className="text-[8px] font-bold text-rose-600 uppercase italic">Institutional Access Restriction</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => selectedStudent?.id && handleDelete(selectedStudent.id)}
                    disabled={isProcessing}
                    className="p-5 bg-rose-50 hover:bg-rose-600 border border-rose-100 rounded-2xl text-rose-600 hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                    title="You sure you wanna delete this student Record"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
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
                <p className="text-sm text-gray-500 font-semibold">You sure you wanna delete this Record?</p>
                <div className="w-full space-y-3">
                  <button
                    onClick={executeDelete}
                    disabled={isProcessing}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'SYNCHRONIZING...' : 'Delete Record'}
                  </button>
                  <button
                    onClick={() => !isProcessing && setShowDeleteModal(false)}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
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
                  <button onClick={() => selectedStudent?.id && handleAction(selectedStudent.id, 'REJECT', rejectReason, isQualifiedReject)} className="py-4 bg-rose-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest">Confirm</button>
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
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
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
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Program Title</label>
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
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
                        {student?.firstName?.[0] || 'A'}
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
                  Close
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

      {/* 🏛️ ADMISSION PROTOCOL MODAL (FINAL APPROVAL) */}
      <AnimatePresence>
        {showApproveModal && selectedStudent && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApproveModal(false)} className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-xl" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[3rem] p-10 max-w-lg w-full relative z-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-gray-100"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mb-6 border border-blue-100 shadow-inner">
                  <ShieldCheck size={36} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">Admission Protocol</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3">{selectedStudent?.firstName} {selectedStudent?.lastName}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Institutional Status</label>
                  <select
                    value={admissionForm?.yearLevel}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, yearLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none"
                  >
                    <option value="1ST YEAR">1ST YEAR ADMISSION</option>
                    <option value="2ND YEAR">2ND YEAR ADMISSION</option>
                    <option value="3RD YEAR">3RD YEAR ADMISSION</option>
                    <option value="4TH YEAR">4TH YEAR ADMISSION</option>
                  </select>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3">
                <button
                  onClick={() => handleAction(selectedStudent?.id, 'APPROVE')}
                  disabled={isProcessing}
                  className="w-full bg-blue-700 text-white rounded-[1.2rem] py-5 font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-700/30 hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <FileText size={16} />}
                  Complete Admission Flow
                </button>
                <button onClick={() => setShowApproveModal(false)} className="w-full py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all">Cancel Review</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🖋️ EDIT STUDENT REGISTRY (CORRECTIONS) */}
      <AnimatePresence>
        {isEditingStudent && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditingStudent(false)} className="absolute inset-0 bg-[#001f3f]/90 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 bg-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-blue-900 leading-none">Edit Institutional Record</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1.5">Registry Correction Protocol</p>
                </div>
                <button onClick={() => setIsEditingStudent(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
                  <XCircle size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* 🛡️ SECTION I: INSTITUTIONAL IDENTITY */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Institutional Identity</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                      <input type="text" value={editFormData.firstName || ''} onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Middle Name</label>
                      <input type="text" value={editFormData.middleName || ''} onChange={(e) => setEditFormData({ ...editFormData, middleName: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                      <input type="text" value={editFormData.lastName || ''} onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Birthday</label>
                      <input type="text" value={editFormData.birthday || ''} onChange={(e) => setEditFormData({ ...editFormData, birthday: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
                      <select value={editFormData.gender || ''} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Citizenship</label>
                      <input type="text" value={editFormData.citizenship || ''} onChange={(e) => setEditFormData({ ...editFormData, citizenship: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                    </div>
                  </div>
                </div>

                {/* 📞 SECTION II: CONTACT DOSSIER */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    <h3 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Contact Dossier</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Primary Email</label>
                      <input type="email" value={editFormData.email || ''} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                      <input type="text" value={editFormData.phone || ''} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                    </div>
                  </div>
                </div>

                {/* 👨‍👩‍👧‍👦 SECTION III: FAMILY LINEAGE */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                    <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Family Lineage</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Father's Name</label>
                      <input type="text" value={editFormData.fatherName || ''} onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Mother's Name</label>
                      <input type="text" value={editFormData.motherName || ''} onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                    </div>
                  </div>
                </div>

                {/* 🏛️ SECTION IV: ACADEMIC CHARTER */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                    <div className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                    <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Academic Charter</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Degree Program</label>
                      <select value={editFormData.course || ''} onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none">
                        {Object.keys(COURSE_MAP).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Schedule Preference</label>
                        <select value={editFormData.scheduleType || ''} onChange={(e) => setEditFormData({ ...editFormData, scheduleType: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none">
                          <option value="Weekdays">Weekdays</option>
                          <option value="Weekends">Weekends</option>
                          <option value="Night">Night</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Learning Mode</label>
                        <select value={editFormData.learningMode || ''} onChange={(e) => setEditFormData({ ...editFormData, learningMode: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none">
                          <option value="Blended Learning">Blended Learning</option>
                          <option value="Full On-Campus (Face-to-Face)">Full On-Campus (Face-to-Face)</option>
                          <option value="Full Distance Learning (Online)">Full Distance Learning (Online)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={handleUpdateRegistry}
                  disabled={isProcessing}
                  className="flex-[2] bg-blue-700 text-white rounded-xl py-4 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-700/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                  Confirm Registry Update
                </button>
                <button onClick={() => setIsEditingStudent(false)} className="flex-1 bg-white text-gray-400 border border-gray-100 rounded-xl py-4 font-bold text-[10px] uppercase tracking-widest">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🏛️ INSTITUTIONAL PRINT REGISTRY CHARTER (HIDDEN) */}
      <div id="enrollment-print-template" style={{ display: 'none' }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '8.5in',
          height: '100vh', 
          maxHeight: '11in',
          padding: '0.5in 0.7in', 
          margin: '0 auto', 
          background: 'white', 
          color: 'black', 
          fontFamily: "'Inter', sans-serif", 
          boxSizing: 'border-box', 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          overflow: 'hidden'
        }}>
          
          {/* 🏛️ INSTITUTIONAL Magnified HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '3px solid #1e40af', paddingBottom: '15px', marginBottom: '25px' }}>
            <div style={{ 
              width: '55px', 
              height: '55px', 
              backgroundColor: '#1e40af', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 12px 24px rgba(30, 64, 175, 0.2)',
              flexShrink: 0,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '900', letterSpacing: '-1.2px', color: '#1e40af', textTransform: 'uppercase', fontStyle: 'italic' }}>Aura Integrated University</h1>
              <p style={{ margin: '2px 0 0', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.4em', color: '#94a3b8' }}>Institutional Registry & Admission Portal</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#059669', textTransform: 'uppercase' }}>A.Y. 2026-2027</div>
              <div style={{ fontSize: '7px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase' }}>REF: AIU-REG-{selectedStudent?.id}</div>
            </div>
          </div>

          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Identity Bar - Optimized */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: '#f8fafc', 
              padding: '20px 25px', 
              border: '1.5px solid #e2e8f0', 
              borderRadius: '16px',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Institutional Identity Carrier</p>
                <h2 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: '900', color: '#001f3f', textTransform: 'uppercase' }}>{selectedStudent?.firstName} {selectedStudent?.lastName}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Official Student ID</p>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '900', color: '#10b981' }}>{selectedStudent?.idNumber || 'AUTH_PENDING'}</h3>
              </div>
            </div>

            {/* Information Grid Container - adaptive */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }}>
              
              {/* Left Column */}
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '900', color: '#000', textTransform: 'uppercase', borderBottom: '2px solid #1e40af', paddingBottom: '3px', width: 'fit-content' }}>I. Enrollment Profile</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Degree Program</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>{COURSE_MAP[selectedStudent?.course] || selectedStudent?.course}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                      <div>
                        <span style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Legal Status • Gender</span>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>{selectedStudent?.civilStatus} • {selectedStudent?.gender}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Birth Date</span>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#000' }}>{selectedStudent?.birthday}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '900', color: '#000', textTransform: 'uppercase', borderBottom: '2px solid #1e40af', paddingBottom: '3px', width: 'fit-content' }}>II. Scholastic Origin</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Primary Education</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>{selectedStudent?.primarySchool}</span>
                      <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', marginLeft: '5px' }}>{selectedStudent?.primaryYear}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Secondary Education</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>{selectedStudent?.secondarySchool}</span>
                      <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', marginLeft: '5px' }}>{selectedStudent?.secondaryYear}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '900', color: '#000', textTransform: 'uppercase', borderBottom: '2px solid #1e40af', paddingBottom: '3px', width: 'fit-content' }}>III. Contacts & Registry</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Institutional Email</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#000' }}>{selectedStudent?.instEmail}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Permanent Address</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>{selectedStudent?.homeBarangay}, {selectedStudent?.homeCity}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '900', color: '#000', textTransform: 'uppercase', borderBottom: '2px solid #1e40af', paddingBottom: '3px', width: 'fit-content' }}>IV. Emergency Protocols</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Verified Guardian</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#000', textTransform: 'uppercase' }}>{selectedStudent?.emergencyName}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Contact Primary</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#000' }}>{selectedStudent?.emergencyContact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Matrix - Smart Fit */}
            <div style={{ marginTop: 'auto', padding: '15px', border: '2px dashed #cbd5e1', borderRadius: '14px', background: '#f8fafc', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '8px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Schedule</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#000' }}>{selectedStudent?.scheduleType || 'MORNING'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '8px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Mode</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#000' }}>{selectedStudent?.learningMode || 'FULL ON-CAMPUS (FACE-TO-FACE)'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '8px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Date Verified</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#000' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
              </div>
            </div>
          </div>

          {/* Execution Section - adaptive Bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '40px', paddingBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '2px solid #000', paddingBottom: '6px', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#000' }}>{selectedStudent?.firstName} {selectedStudent?.lastName}</div>
              <div style={{ fontSize: '8px', fontWeight: '800', color: '#64748b', marginTop: '6px', textTransform: 'uppercase' }}>Registrant Signature</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '2px solid #000', paddingBottom: '6px', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#000' }}>Office of the Registrar</div>
              <div style={{ fontSize: '8px', fontWeight: '800', color: '#64748b', marginTop: '6px', textTransform: 'uppercase' }}>Institutional Seal</div>
            </div>
          </div>

          {/* Institutional adaptive Footer */}
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '7px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Aura Integrated University • Precision Academic Registry • AY-2026-2027 
              <span style={{ marginLeft: '10px', color: '#cbd5e1' }}>| GENERATED: {new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </p>
          </div>
        </div>
      </div>
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
        <span className="block text-[13px] font-bold italic tracking-tight text-gray-900 truncate">
          {(!value || value.toString().trim() === '' || value.toString().trim() === '•' || value.toString().trim() === '•' || value.toString().trim() === '•') ? 'N/A' : value}
        </span>
      </div>
    </div>
  )
}
