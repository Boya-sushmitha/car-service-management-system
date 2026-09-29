import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { login as apiLogin } from '../services/api';
import Navbar from '../components/Navbar';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Check credentials and verify they are staff
      const res = await apiLogin({ username: adminId, password });
      if (!res.data.user.is_staff) {
        setError('Access Denied: Only administrators can log in here.');
        return;
      }
      // Log in via AuthContext
      await login({ username: adminId, password });
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - var(--navbar-height))', marginTop: 'var(--navbar-height)', background: 'var(--bg-primary)' }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '36px', textAlign: 'center' }}>
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Admin Login</h2>
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              color: 'var(--danger)', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px', 
              fontSize: '14px', 
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Admin ID</label>
              <input 
                className="form-input" 
                type="text" 
                required 
                value={adminId} 
                onChange={e => setAdminId(e.target.value)} 
                placeholder="Enter Admin ID"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <input 
                className="form-input" 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Enter Password"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '12px',
                fontSize: '16px'
              }} 
              disabled={loading}
            >
              {loading ? 'Logging in...' : (
                <>
                  <span>🔒</span>
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
