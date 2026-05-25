import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';   // ← add this import

// Layouts
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TGDashboard from './pages/TGDashboard';
import WardenDashboard from './pages/WardenDashboard';
import SecurityScanner from './pages/SecurityScanner';
import HODDashboard from './pages/HODDashboard';
import ApplyGatePass from './pages/ApplyGatePass';
import History from './pages/History';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children, allowedRoles, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    let rolePath;
    switch (user.role) {
      case 'Admin': rolePath = '/admin'; break;
      case 'Student': rolePath = '/student'; break;
      case 'TG': rolePath = '/tg'; break;
      case 'Warden': rolePath = '/warden'; break;
      case 'Security': rolePath = '/security/scanner'; break;
      case 'HOD': rolePath = '/hod'; break;
      default: rolePath = '/login';
    }
    return <Navigate to={rolePath} replace />;
  }
  
  return children;
};

// Layout wrapper component
const DashboardLayout = ({ user, sidebarOpen, toggleSidebar, children }) => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans">
      <Sidebar user={user} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="transition-all duration-300 lg:pl-72">
        <Navbar toggleSidebar={toggleSidebar} user={user} />
        <main className="min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resolveUserSession = useCallback(() => {
    try {
      const localUser = localStorage.getItem('user');
      if (localUser) {
        setUser(JSON.parse(localUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error resolving user session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    resolveUserSession();
  }, [resolveUserSession]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030712]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Home Page - Public */}
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to={`/${user.role.toLowerCase() === 'security' ? 'security/scanner' : user.role.toLowerCase()}`} replace />
            ) : (
              <HomePage />
            )
          } 
        />

        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={`/${user.role.toLowerCase() === 'security' ? 'security/scanner' : user.role.toLowerCase()}`} replace />
            ) : (
              <Login onLoginSuccess={resolveUserSession} />
            )
          } 
        />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['Admin']} user={user}>
              <DashboardLayout user={user} sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminDashboard />} />
                  <Route path="import" element={<AdminDashboard />} />
                  <Route path="gatepasses" element={<AdminDashboard />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute allowedRoles={['Student']} user={user}>
              <DashboardLayout user={user} sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                <Routes>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="apply" element={<ApplyGatePass />} />
                  <Route path="history" element={<History />} />
                  <Route path="*" element={<Navigate to="/student" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* TG Routes */}
        <Route 
          path="/tg/*" 
          element={
            <ProtectedRoute allowedRoles={['TG']} user={user}>
              <DashboardLayout user={user} sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                <Routes>
                  <Route path="/" element={<TGDashboard />} />
                  <Route path="students" element={<TGDashboard />} />
                  <Route path="*" element={<Navigate to="/tg" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Warden Routes */}
        <Route 
          path="/warden/*" 
          element={
            <ProtectedRoute allowedRoles={['Warden']} user={user}>
              <DashboardLayout user={user} sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                <Routes>
                  <Route path="/" element={<WardenDashboard />} />
                  <Route path="approved" element={<WardenDashboard />} />
                  <Route path="*" element={<Navigate to="/warden" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Security Routes */}
        <Route 
          path="/security/scanner" 
          element={
            <ProtectedRoute allowedRoles={['Security']} user={user}>
              <DashboardLayout user={user} sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                <SecurityScanner />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* HOD Routes */}
        <Route 
          path="/hod/*" 
          element={
            <ProtectedRoute allowedRoles={['HOD']} user={user}>
              <DashboardLayout user={user} sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
                <Routes>
                  <Route path="/" element={<HODDashboard />} />
                  <Route path="*" element={<Navigate to="/hod" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback – any unknown path */}
        <Route 
          path="*" 
          element={
            user ? (
              <Navigate to={`/${user.role.toLowerCase() === 'security' ? 'security/scanner' : user.role.toLowerCase()}`} replace />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;