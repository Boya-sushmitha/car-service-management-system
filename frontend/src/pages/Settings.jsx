import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { changePassword, deleteAccount } from '../services/api';

export default function Settings() {
  const { user } = useContext(AuthContext);
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  // Preferences state
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [prefSaved, setPrefSaved] = useState(false);

  // Delete account state
  const [deletingAccount, setDeletingAccount] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPassSuccess(res.data.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you ABSOLUTELY sure you want to permanently delete your account? This action cannot be undone.")) return;
    setDeletingAccount(true);
    try {
      await deleteAccount();
      logout();
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete account.');
      setDeletingAccount(false);
    }
  };

  return (
    <>
      <Navbar />
      <div>
        <div className="page-header">
          <div>
            <h2 className="page-title">Account & System Settings</h2>
            <p className="page-subtitle">Manage your profile details, update password, and configure application settings</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 700 }}>
          
          {/* Section 1: User Profile Details */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: '#fff', fontWeight: 700
              }}>
                {user?.username?.charAt(0).toUpperCase() || '👤'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>{user?.first_name || user?.last_name ? `${user?.first_name} ${user?.last_name}`.trim() : user?.username}</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>{user?.email || 'No email registered'}</p>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge ${user?.is_staff ? 'badge-purple' : 'badge-success'}`}>
                    {user?.is_staff ? 'Administrator' : 'Standard User'}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" type="text" readOnly value={user?.username || ''} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" readOnly value={user?.email || 'N/A'} disabled />
              </div>
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
          </div>

          {/* Section 2: Change Password Setup */}
          <div className="card">
            <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>🔑 Change Password</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>Update your login security credentials</p>
            </div>

            {passError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {passError}
              </div>
            )}
            {passSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                ✓ {passSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Old Password *</label>
                <input 
                  className="form-input" 
                  type="password" 
                  required 
                  value={oldPassword} 
                  onChange={e => setOldPassword(e.target.value)} 
                  placeholder="Enter current password" 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <input 
                    className="form-input" 
                    type="password" 
                    required 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="Enter new password" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <input 
                    className="form-input" 
                    type="password" 
                    required 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="Re-enter new password" 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', marginTop: 4 }} disabled={passLoading}>
                {passLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Section 3: Preferences & Notifications */}
          <div className="card">
            <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>⚙️ System Preferences</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>Configure general application settings</p>
            </div>

            {prefSaved && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                ✓ Preferences saved!
              </div>
            )}

            <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Theme</label>
                <select className="form-select" value={theme} onChange={e => setTheme(e.target.value)}>
                  <option value="dark">🌙 Dark</option>
                  <option value="light">☀️ Light</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Font Size</label>
                <select className="form-select" value={fontSize} onChange={e => setFontSize(e.target.value)}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>In-App Notifications</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Receive live alerts for vehicle status changes</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={e => setNotifications(e.target.checked)} 
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Email Notifications</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Get email reports for completed service appointments</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailAlerts} 
                  onChange={e => setEmailAlerts(e.target.checked)} 
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
              </div>

              <button type="submit" className="btn btn-ghost" style={{ width: 'fit-content', marginTop: 4 }}>
                Save Preferences
              </button>
            </form>
          </div>

          {/* Section 4: Danger Zone */}
          <div className="card" style={{ border: '1px solid var(--danger)' }}>
            <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--danger)' }}>⚠️ Danger Zone</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>Permanently delete your account and all associated data</p>
            </div>
            <p style={{ fontSize: 14, marginBottom: 16 }}>Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={handleDeleteAccount} className="btn btn-danger" disabled={deletingAccount}>
              {deletingAccount ? 'Deleting...' : 'Delete Account Permanently'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
