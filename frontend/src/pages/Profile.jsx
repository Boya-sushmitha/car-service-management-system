import React, { useContext } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Navbar />
      <div>
        <div className="page-header">
          <div>
            <h2 className="page-title">User Profile</h2>
            <p className="page-subtitle">Manage your account information and preferences</p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, color: '#fff', fontWeight: 700
            }}>
              {user?.username?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 20 }}>{user?.first_name || user?.last_name ? `${user?.first_name} ${user?.last_name}`.trim() : user?.username}</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email || 'No email provided'}</p>
              <div style={{ marginTop: 8 }}>
                <span className={`badge ${user?.is_staff ? 'badge-purple' : 'badge-success'}`}>
                  {user?.is_staff ? 'Administrator' : 'Standard User'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" type="text" readOnly value={user?.username || ''} disabled />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" type="text" readOnly value={user?.first_name || 'N/A'} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" type="text" readOnly value={user?.last_name || 'N/A'} disabled />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" readOnly value={user?.email || 'N/A'} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <input className="form-input" type="text" readOnly value={user?.is_staff ? 'System Administrator' : 'User Account'} disabled />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
