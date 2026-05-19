import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Register from './pages/Register'
import AdmissionRequirements from './pages/AdmissionRequirements'
import AboutHistory from './pages/AboutHistory'
import AboutPhilosophy from './pages/AboutPhilosophy'
import ProgramDetail from './pages/ProgramDetail'
import Programs from './pages/Programs'
import ScrollToTop from './components/ScrollToTop'
import Success from './pages/Success'
import AcademicCalendar from './pages/AcademicCalendar'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Wait for session hydration
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student-dashboard'} replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student-dashboard'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/admissions/requirements" element={<AdmissionRequirements />} />
          <Route path="/about/history" element={<AboutHistory />} />
          <Route path="/about/philosophy" element={<AboutPhilosophy />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />
          <Route path="/success" element={<Success />} />
          <Route path="/calendar" element={<AcademicCalendar />} />
          <Route path="/admin" element={
            <div className="light-theme">
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            </div>
          } />
          <Route path="/student-dashboard" element={
            <div className="light-theme">
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            </div>
          } />
          {/* Catch-all Route for 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
