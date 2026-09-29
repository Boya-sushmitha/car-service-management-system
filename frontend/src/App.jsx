import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Cars from './pages/Cars';
import Services from './pages/Services';
import Users from './pages/Users';
import Profile from './pages/Profile';
import GarageStatus from './pages/GarageStatus';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AboutUs from './pages/AboutUs';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}><div className="spinner"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const DashboardLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  return (
    <div className="app-layout">
      {user && <Sidebar />}
      <main className="main-content" style={{ marginLeft: user ? 'var(--sidebar-width)' : 0 }}>
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}><div className="spinner"></div></div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/about-us" element={<AboutUs />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/cars" element={<ProtectedRoute><DashboardLayout><Cars /></DashboardLayout></ProtectedRoute>} />
      <Route path="/garage-status" element={<ProtectedRoute><DashboardLayout><GarageStatus /></DashboardLayout></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute><DashboardLayout><Services /></DashboardLayout></ProtectedRoute>} />
      <Route path="/profile" element={<Navigate to="/settings" replace />} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><DashboardLayout><Users /></DashboardLayout></ProtectedRoute>} />
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
