import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUsers, toggleUserStatus, getCars, updateCar, getServices, updateServiceStatus } from '../services/api';
import { calculateServiceCost } from '../utils/servicePrices';

const STATUS_OPTIONS = [
  { value: 'pending_check',  label: '⏳ Checking Pending Stage', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { value: 'good_condition', label: '✅ Good Condition',        color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { value: 'needs_service',  label: '🔧 Needs Service',         color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { value: 'under_repair',   label: '🛠️ Under Repair',          color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { value: 'not_in_use',     label: '🚫 Not In Use',            color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
];

const SVC_STATUS = [
  { value: 'pending',     label: '⏳ Pending',     color: '#f59e0b' },
  { value: 'accepted',    label: '✅ Accepted',    color: '#10b981' },
  { value: 'rejected',    label: '❌ Rejected',    color: '#ef4444' },
  { value: 'in_progress', label: '🔧 In Progress', color: '#3b82f6' },
  { value: 'completed',   label: '🏁 Completed',   color: '#8b5cf6' },
];

const carStatusMeta  = (s) => STATUS_OPTIONS.find(o => o.value === s) || { label: s, color: '#64748b', bg: 'transparent' };
const svcStatusMeta  = (s) => SVC_STATUS.find(o => o.value === s) || { label: s, color: '#64748b' };

const getNextDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users,    setUsers]    = useState([]);
  const [cars,     setCars]     = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading,  setLoading]  = useState(true);

  // Car status draft per car
  const [carStatusDraft, setCarStatusDraft] = useState({});
  const [updatingCar,    setUpdatingCar]    = useState(null);

  // Service status draft per service
  const [svcStatusDraft, setSvcStatusDraft] = useState({});
  const [svcPickupDateDraft, setSvcPickupDateDraft] = useState({});
  const [svcPickupDetailsDraft, setSvcPickupDetailsDraft] = useState({});
  const [svcCostDraft, setSvcCostDraft] = useState({});
  const [updatingSvc, setUpdatingSvc] = useState(null);

  const fetchAll = () =>
    Promise.all([getUsers(), getCars(), getServices()])
      .then(([u, c, s]) => { setUsers(u.data); setCars(c.data); setServices(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!user || !user.is_staff) { navigate('/admin-login'); return; }
    fetchAll();
  }, [user, navigate]);

  const handleLogout = () => { logout(); navigate('/admin-login'); };

  /* ── Toggle user active ── */
  const handleToggleUser = async (u) => {
    if (!window.confirm(`${u.is_active ? 'Deactivate' : 'Activate'} user "${u.username}"?`)) return;
    try { await toggleUserStatus(u.id); const r = await getUsers(); setUsers(r.data); }
    catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
  };

  /* ── Update vehicle status ── */
  const handleUpdateCarStatus = async (car, forceStatus = null) => {
    const newStatus = forceStatus || carStatusDraft[car.id] || car.status;
    if (newStatus === car.status) { alert('Select a different status first.'); return; }
    if (!window.confirm(`Update "${car.make} ${car.model}" decision status to "${newStatus.replace('_', ' ')}"?`)) return;
    setUpdatingCar(car.id);
    try {
      await updateCar(car.id, { status: newStatus });
      await fetchAll();
      setCarStatusDraft(p => { const n = { ...p }; delete n[car.id]; return n; });
    } catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
    finally { setUpdatingCar(null); }
  };

  /* ── Accept / Reject service request ── */
  const handleQuickSvcAction = async (svcId, newStatus) => {
    const label = newStatus === 'accepted' ? 'Accept' : 'Reject';
    if (!window.confirm(`${label} this service request?`)) return;
    setUpdatingSvc(svcId);
    try { await updateServiceStatus(svcId, newStatus); await fetchAll(); }
    catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
    finally { setUpdatingSvc(null); }
  };

  /* ── Update service status (progress) ── */
  const handleUpdateSvcStatus = async (svc) => {
    const newStatus = svcStatusDraft[svc.id] || svc.status;
    if (newStatus === svc.status) { alert('Select a different status first.'); return; }
    if (!window.confirm(`Update service status to "${newStatus}"?`)) return;
    setUpdatingSvc(svc.id);
    try {
      await updateServiceStatus(svc.id, newStatus, {
        pickup_date: svcPickupDateDraft[svc.id] || svc.pickup_date,
        pickup_details: svcPickupDetailsDraft[svc.id] || svc.pickup_details,
        cost: svcCostDraft[svc.id] !== undefined ? svcCostDraft[svc.id] : svc.cost,
      });
      await fetchAll();
      setSvcStatusDraft(p => { const n = { ...p }; delete n[svc.id]; return n; });
      setSvcPickupDateDraft(p => { const n = { ...p }; delete n[svc.id]; return n; });
      setSvcPickupDetailsDraft(p => { const n = { ...p }; delete n[svc.id]; return n; });
      setSvcCostDraft(p => { const n = { ...p }; delete n[svc.id]; return n; });
    } catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
    finally { setUpdatingSvc(null); }
  };

  const pendingUsers   = users.filter(u => !u.is_active && !u.is_staff);
  const pendingCars    = cars.filter(c => !c.status || c.status === 'pending_check');
  const pendingSvcs    = services.filter(s => s.status === 'pending');
  const activeSvcs     = services.filter(s => ['accepted', 'in_progress'].includes(s.status));
  const activeUsers    = users.filter(u => u.is_active && !u.is_staff);

  const carMap = Object.fromEntries(cars.map(c => [c.id, c]));

  const tabs = [
    { id: 'overview',     label: '📊 Overview' },
    { id: 'users',        label: '👥 User Accounts' },
    { id: 'vehicles',     label: '🚗 Vehicle Approval',  badge: pendingCars.length },
    { id: 'svc_requests', label: '📥 Service Requests',  badge: pendingSvcs.length },
    { id: 'svc_update',   label: '🔄 Service Update',    badge: activeSvcs.length },
  ];

  const navBtn = (onClick, children, extra = {}) => (
    <button onClick={onClick} className="btn btn-ghost btn-sm" style={extra}>{children}</button>
  );
  const Badge = ({ n }) => n > 0 ? <span className="badge badge-danger" style={{ padding: '2px 6px', fontSize: 10 }}>{n}</span> : null;

  // We are using standard tables now, no need for custom TH/TR components.


  return (
    <>
      <div className="app-layout">
        {/* Simple Sidebar for Admin Dashboard (can be replaced by standard sidebar if preferred, but for now we keep it minimal or use standard) */}
        {/* We'll just use a layout similar to standard pages but full width if we don't include sidebar here, or we can use standard Sidebar if we want. Wait, AdminDashboard doesn't use standard DashboardLayout. Let's make it a standard page. */}
        {/* Wait, the original had its own header and tabs. */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
          {/* ── Navbar ── */}
          <header className="navbar" style={{ position: 'sticky', width: '100%', left: 0 }}>
            <div className="navbar-title">
              <h1>Admin Dashboard</h1>
              <p>System control panel</p>
            </div>
            <div className="navbar-actions">
              <Link to="/" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>🏠 Home</Link>
              {navBtn(() => setActiveTab('svc_requests'), <><span>📥 Service Requests</span><Badge n={pendingSvcs.length} /></>)}
              {navBtn(handleLogout, '🚪 Logout', { background: 'rgba(239,68,68,0.2)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.4)' })}
            </div>
          </header>

          <div style={{ padding: 'calc(var(--navbar-height) + 32px) 32px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            {/* ── Welcome Hero ── */}
            <div className="card" style={{ marginBottom: 28, textAlign: 'center', background: 'var(--accent-gradient)', color: 'white' }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🛡️</div>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px' }}>Welcome, {user?.username}!</h1>
              <p style={{ opacity: 0.9, fontSize: 14, margin: '0 0 24px' }}>Review service requests, manage user accounts, approve vehicles, and control the system.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
                <button onClick={() => setActiveTab('svc_requests')} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 24, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}>
                  📥 Review Service Requests {pendingSvcs.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 'bold' }}>{pendingSvcs.length}</span>}
                </button>
                <button onClick={() => setActiveTab('svc_update')} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 24, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}>
                  🔄 Update Service Progress {activeSvcs.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 'bold' }}>{activeSvcs.length}</span>}
                </button>
              </div>
            </div>

            {/* ── Stats Graph ── */}
            <div className="stats-graph-container" style={{ marginBottom: 32, background: 'var(--bg-card)', padding: 32, borderRadius: 16, border: '1px solid var(--glass-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>📈 System Activity Overview</h3>
                <div 
                  onClick={() => setActiveTab('users')}
                  style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '8px 16px', borderRadius: 20, fontWeight: 'bold', fontSize: 14, cursor: 'pointer', border: '1px solid rgba(59,130,246,0.2)', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                >
                  👥 Total Registered Users: {users.length}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: 220, gap: 24, position: 'relative', borderBottom: '2px solid var(--glass-border)', paddingBottom: 10 }}>
                {/* Grid lines background */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0, opacity: 0.1, pointerEvents: 'none' }}>
                  {[1,2,3,4].map(i => <div key={i} style={{ borderBottom: '1px dashed var(--text-primary)', width: '100%' }} />)}
                </div>
                
                {[
                  { value: users.length,          label: 'Total Users', color: '#3b82f6' },
                  { value: cars.length,            label: 'Vehicles', color: '#10b981' },
                  { value: activeSvcs.length,      label: 'In Progress', color: '#f59e0b' },
                  { value: services.filter(s=>s.status==='completed').length, label: 'Completed', color: '#8b5cf6' },
                ].map((s, i) => {
                  const maxVal = Math.max(users.length, cars.length, services.length, 1);
                  const heightPct = (s.value / maxVal) * 100;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 1 }}>
                      <div style={{ background: 'var(--bg-primary)', border: `1px solid ${s.color}40`, color: s.color, padding: '4px 10px', borderRadius: 8, fontSize: 14, fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {s.value}
                      </div>
                      <div style={{ width: '100%', maxWidth: 70, height: `${heightPct}%`, minHeight: 8, background: `linear-gradient(to top, ${s.color}, ${s.color}90)`, borderRadius: '8px 8px 0 0', transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 15px ${s.color}30` }}></div>
                      <div style={{ fontSize: 13, textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Tab Nav ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`}>
                  {t.label} {t.badge > 0 && <Badge n={t.badge} />}
                </button>
              ))}
            </div>

            {/* ── Panels ── */}
            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : (
              <div className="card" style={{ padding: 0 }}>
                {/* ── Overview ── */}
                {activeTab === 'overview' && (
                  <div style={{ padding: 28 }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontSize: 16 }}>📋 System Overview</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                      {[
                        { hdr: '👥 User Accounts',   rows: [['Total', users.length],['Active',activeUsers.length],['Pending',pendingUsers.length]] },
                        { hdr: '🚗 Vehicles',        rows: [['Total',cars.length],['Good Condition',cars.filter(c=>c.status==='good_condition').length],['Needs Service',cars.filter(c=>c.status==='needs_service').length],['Under Repair',cars.filter(c=>c.status==='under_repair').length],['Not In Use',cars.filter(c=>c.status==='not_in_use').length]] },
                        { hdr: '🔧 Service Requests', rows: [['Total',services.length],['Pending Review',pendingSvcs.length],['In Progress',activeSvcs.length],['Completed',services.filter(s=>s.status==='completed').length]] },
                        { hdr: '📊 Quick Stats',     rows: [['Total Users',users.length],['Total Vehicles',cars.length],['Total Services',services.length]] },
                      ].map(card => (
                        <div key={card.hdr} style={{ background: 'var(--bg-secondary)', border: `1px solid var(--glass-border)`, borderRadius: 12, padding: 16 }}>
                          <div style={{ color: 'var(--accent-primary)', fontWeight: 700, marginBottom: 10, fontSize: 14 }}>{card.hdr}</div>
                          {card.rows.map(([lbl, val]) => (
                            <div key={lbl} style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 5 }}>
                              {lbl}: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── User Accounts ── */}
                {activeTab === 'users' && (
                  <>
                    <div className="page-header" style={{ padding: '18px 24px', margin: 0, borderBottom: '1px solid var(--glass-border)' }}>
                      <div>
                        <div className="page-title" style={{ fontSize: 16 }}>👥 User Accounts Management</div>
                        <div className="page-subtitle">{users.filter(u => u.username !== 'admin' && u.username !== 'testuser').length} total users registered in the system</div>
                      </div>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                      <table>
                        <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th></tr></thead>
                        <tbody>
                          {users.filter(u => u.username !== 'admin' && u.username !== 'testuser').map((u) => (
                            <tr key={u.id}>
                              <td>{u.id}</td>
                              <td><div style={{ fontWeight: 600 }}>{u.username}</div><div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.first_name} {u.last_name}</div></td>
                              <td>{u.email || '—'}</td>
                              <td>{u.is_staff ? <span className="badge badge-purple">Admin</span> : <span className="badge badge-ghost">User</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}


                {activeTab === 'vehicles' && (
                  <>
                    <div className="page-header" style={{ padding: '18px 24px', margin: 0, borderBottom: '1px solid var(--glass-border)' }}>
                      <div>
                        <div className="page-title" style={{ fontSize: 16 }}>🚗 Vehicle Status & Admin Decision Management</div>
                        <div className="page-subtitle">{cars.length} vehicles registered · {pendingCars.length} pending admin decision</div>
                      </div>
                    </div>
                    {cars.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">🚗</div>
                        <p className="empty-state-text">No vehicles registered yet.</p>
                      </div>
                    ) : (
                      <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                          <thead><tr><th>#</th><th>Vehicle</th><th>Plate</th><th>Submitted By</th><th>Current Status</th><th>Admin Decision & Update</th><th>Action</th></tr></thead>
                          <tbody>
                            {cars.map((car, i) => {
                              const meta      = carStatusMeta(car.status);
                              const draft     = carStatusDraft[car.id] || car.status;
                              const changed   = draft !== car.status;
                              const isPending = !car.status || car.status === 'pending_check';
                              const busy      = updatingCar === car.id;
                              return (
                                <tr key={car.id} style={{ background: isPending ? 'rgba(245,158,11,0.06)' : 'transparent' }}>
                                  <td>{i+1}</td>
                                  <td><div style={{ fontWeight: 600 }}>{car.make} {car.model}</div><div style={{ fontSize: 12 }}>{car.year}</div></td>
                                  <td><code style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{car.plate_number}</code></td>
                                  <td>👤 {car.submitted_by_username || '—'}</td>
                                  <td><span className="badge" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span></td>
                                  <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                      <select value={draft} onChange={e => setCarStatusDraft(p => ({ ...p, [car.id]: e.target.value }))} className="form-select" style={{ minWidth: 140, padding: '6px 10px' }}>
                                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                      </select>
                                      {isPending && (
                                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                                          <button onClick={() => handleUpdateCarStatus(car, 'good_condition')} disabled={busy} className="btn btn-sm btn-primary" style={{ padding: '3px 8px', fontSize: 11 }}>
                                            {busy ? '⏳' : '✅ Approve (Good)'}
                                          </button>
                                          <button onClick={() => handleUpdateCarStatus(car, 'needs_service')} disabled={busy} className="btn btn-sm btn-ghost" style={{ padding: '3px 8px', fontSize: 11, borderColor: '#f59e0b', color: '#f59e0b' }}>
                                            {busy ? '⏳' : '🔧 Needs Service'}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <button onClick={() => handleUpdateCarStatus(car)} disabled={!changed || busy} className={`btn btn-sm ${changed ? 'btn-primary' : 'btn-ghost'}`} style={{ minWidth: 88 }}>
                                      {busy ? '⏳ Saving...' : changed ? '✔ Update' : 'No Change'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {/* ── Service Requests ── */}
                {activeTab === 'svc_requests' && (
                  <>
                    <div className="page-header" style={{ padding: '18px 24px', margin: 0, borderBottom: '1px solid var(--glass-border)' }}>
                      <div>
                        <div className="page-title" style={{ fontSize: 16 }}>📥 Service Requests — Accept / Reject</div>
                        <div className="page-subtitle">{pendingSvcs.length} pending review · Review and accept or reject incoming requests</div>
                      </div>
                    </div>
                    {services.filter(s => ['pending','accepted','rejected'].includes(s.status)).length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p className="empty-state-text">No service requests to review.</p>
                      </div>
                    ) : (
                      <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                          <thead><tr><th>#</th><th>Vehicle</th><th>Requested By</th><th>Service Date</th><th>Description</th><th>Status</th><th>Action</th></tr></thead>
                          <tbody>
                            {services.filter(s => ['pending','accepted','rejected'].includes(s.status)).map((svc, i) => {
                              const car  = carMap[svc.car];
                              const meta = svcStatusMeta(svc.status);
                              const busy = updatingSvc === svc.id;
                              return (
                                <tr key={svc.id}>
                                  <td>{i+1}</td>
                                  <td><div style={{ fontWeight: 600, fontSize: 13 }}>{car ? `${car.make} ${car.model}` : `Car #${svc.car}`}</div><div style={{ fontSize: 11 }}>{car?.plate_number}</div></td>
                                  <td>👤 {svc.requested_by_username}</td>
                                  <td>📅 {svc.service_date}</td>
                                  <td style={{ maxWidth: 200 }}><span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{svc.description}</span></td>
                                  <td><span className="badge" style={{ color: meta.color, background: `${meta.color}22` }}>{meta.label}</span></td>
                                  <td>
                                    {svc.status === 'pending' ? (
                                      <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => handleQuickSvcAction(svc.id, 'accepted')} disabled={busy} className="btn btn-sm btn-primary">
                                          {busy ? '⏳' : '✅ Accept'}
                                        </button>
                                        <button onClick={() => handleQuickSvcAction(svc.id, 'rejected')} disabled={busy} className="btn btn-sm btn-danger">
                                          {busy ? '⏳' : '❌ Reject'}
                                        </button>
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: 12 }}>{svc.status === 'accepted' ? 'Accepted ✅' : 'Rejected ❌'}</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {/* ── Service Update ── */}
                {activeTab === 'svc_update' && (
                  <>
                    <div className="page-header" style={{ padding: '18px 24px', margin: 0, borderBottom: '1px solid var(--glass-border)' }}>
                      <div>
                        <div className="page-title" style={{ fontSize: 16 }}>🔄 Service Progress Update</div>
                        <div className="page-subtitle">{activeSvcs.length} active services · Update status: Accepted → In Progress → Completed</div>
                      </div>
                    </div>
                    {services.filter(s => ['accepted','in_progress','completed'].includes(s.status)).length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">🔧</div>
                        <p className="empty-state-text">No accepted services to update. Accept service requests first.</p>
                      </div>
                    ) : (
                      <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                          <thead><tr><th>#</th><th>Vehicle</th><th>Date</th><th>Current Status</th><th>Update Status</th><th>Pickup Date, Details & Amount</th><th>Action</th></tr></thead>
                          <tbody>
                            {services.filter(s => ['accepted','in_progress','completed'].includes(s.status)).map((svc, i) => {
                              const car   = carMap[svc.car];
                              const meta  = svcStatusMeta(svc.status);
                              const draft = svcStatusDraft[svc.id] || svc.status;
                              const pickupDateDraft = svcPickupDateDraft[svc.id] !== undefined ? svcPickupDateDraft[svc.id] : (svc.pickup_date || '');
                              const pickupDetailsDraft = svcPickupDetailsDraft[svc.id] !== undefined ? svcPickupDetailsDraft[svc.id] : (svc.pickup_details || '');
                              const defaultAutoCost = (svc.cost && Number(svc.cost) > 0) ? svc.cost : calculateServiceCost(svc.description);
                              const costDraft = svcCostDraft[svc.id] !== undefined ? svcCostDraft[svc.id] : (defaultAutoCost || '');

                              const chg = draft !== svc.status || pickupDateDraft !== (svc.pickup_date || '') || pickupDetailsDraft !== (svc.pickup_details || '') || String(costDraft) !== String(svc.cost || '');
                              const busy  = updatingSvc === svc.id;
                              return (
                                <tr key={svc.id}>
                                  <td>{i+1}</td>
                                  <td><div style={{ fontWeight: 600 }}>{car ? `${car.make} ${car.model}` : `Car #${svc.car}`}</div><div style={{ fontSize: 11 }}>{car?.plate_number}</div></td>
                                  <td>📅 {svc.service_date}</td>
                                  <td><span className="badge" style={{ color: meta.color, background: `${meta.color}22` }}>{meta.label}</span></td>
                                  <td>
                                    <select value={draft} onChange={e => setSvcStatusDraft(p => ({ ...p, [svc.id]: e.target.value }))} className="form-select" style={{ minWidth: 140, padding: '6px 10px' }}>
                                      {SVC_STATUS.filter(o => !['pending','rejected'].includes(o.value)).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                      <input type="date" className="form-input" style={{ padding: '4px 8px', fontSize: 12 }} min={getNextDate(svc.service_date)} value={pickupDateDraft} onChange={e => setSvcPickupDateDraft(p => ({ ...p, [svc.id]: e.target.value }))} />
                                      <select className="form-select" style={{ padding: '4px 8px', fontSize: 12 }} value={pickupDetailsDraft} onChange={e => setSvcPickupDetailsDraft(p => ({ ...p, [svc.id]: e.target.value }))}>
                                        <option value="">-- Select Details --</option>
                                        <option value="Home Delivery">Home Delivery</option>
                                        <option value="Express Pickup">Express Pickup</option>
                                        <option value="Standard Pickup">Standard Pickup</option>
                                        <option value="Owner Pickup">Owner Pickup</option>
                                      </select>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: 6, padding: '4px 8px' }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>₹</span>
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          placeholder="Enter Amount"
                                          className="form-input"
                                          style={{ padding: '2px 4px', fontSize: 12, border: 'none', background: 'transparent', width: 90 }}
                                          value={costDraft}
                                          onChange={e => {
                                            const val = e.target.value;
                                            if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                              setSvcCostDraft(p => ({ ...p, [svc.id]: val }));
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <button onClick={() => handleUpdateSvcStatus(svc)} disabled={!chg || busy} className={`btn btn-sm ${chg ? 'btn-primary' : 'btn-ghost'}`} style={{ minWidth: 90 }}>
                                      {busy ? '⏳ Saving...' : chg ? '✔ Update' : 'No Change'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
