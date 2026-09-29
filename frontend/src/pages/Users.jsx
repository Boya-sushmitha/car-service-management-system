import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getUsers, toggleUserStatus } from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = () => {
    getUsers()
      .then(res => setUsers(res.data))
      .catch(err => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    if (user.username === 'admin') {
      alert("Cannot toggle status of main admin account.");
      return;
    }
    const confirmMessage = user.is_active 
      ? `Are you sure you want to deactivate user "${user.username}"?`
      : `Are you sure you want to activate user "${user.username}"?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await toggleUserStatus(user.id);
      fetchUsers();
    } catch (err) {
      alert("Failed to update user status: " + (err.response?.data?.error || err.message));
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.first_name && u.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.last_name && u.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Navbar />
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="page-title">User Accounts</h2>
            <p className="page-subtitle">{users.length} registered users in system</p>
          </div>
          <div>
            <input 
              type="text" 
              placeholder="🔍 Search users..." 
              className="form-input" 
              style={{ width: '260px', margin: 0 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p className="empty-state-text">No user accounts found matching search.</p>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <tr key={user.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{user.username}</td>
                    <td>{user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : '—'}</td>
                    <td>{user.email || '—'}</td>
                    <td>
                      {user.is_staff ? (
                        <span className="badge badge-purple">Admin</span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>User</span>
                      )}
                    </td>
                    <td>
                      {user.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-warning">Pending Activation</span>
                      )}
                    </td>
                    <td>
                      {user.username === 'admin' ? (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>System Protected</span>
                      ) : (
                        <button 
                          className={`btn btn-sm ${user.is_active ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.is_active ? 'Deactivate' : '🔒 Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
