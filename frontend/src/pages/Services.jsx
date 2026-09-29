import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { getCars, getServices, createService, deleteService } from '../services/api';
import { SERVICE_PRICES, calculateServiceCost } from '../utils/servicePrices';

const STATUS_STEPS = [
  { key: 'pending',     icon: '📋', label: 'Submitted',   color: 'var(--warning)' },
  { key: 'accepted',    icon: '✅', label: 'Accepted',    color: 'var(--success)' },
  { key: 'in_progress', icon: '🔧', label: 'In Progress', color: 'var(--info)' },
  { key: 'completed',   icon: '🏁', label: 'Completed',   color: 'var(--accent-primary)' },
];
const REJECTED_META = { icon: '❌', label: 'Rejected', color: 'var(--danger)' };

const getStatusMeta = (s) => {
  if (s === 'rejected') return REJECTED_META;
  return STATUS_STEPS.find(st => st.key === s) || { icon: '📋', label: s, color: 'var(--text-muted)' };
};

const SERVICE_OPTIONS = Object.keys(SERVICE_PRICES);

const RECOMMENDED_SERVICES = {
  good_condition: ['Car Inspection & Checks', 'Car Tyre Service', 'Air Conditioning Service'],
  needs_service:  ['Car Engine Service', 'Car Brake Service', 'Headlight & Bulb Check'],
  under_repair:   ['General Repair Service', 'Car Electronic Services'],
  not_in_use:     ['Car Inspection & Checks', 'General Repair Service'],
};

const BLANK = { car: '', selectedServices: [], customNote: '', service_date: '' };

export default function RequestService() {
  const { user } = useContext(AuthContext);
  const [cars, setCars]         = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  const fetchData = () =>
    Promise.all([getCars(), getServices()])
      .then(([c, s]) => { setCars(c.data); setServices(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { fetchData(); }, []);

  // My services = services submitted by this user
  const myServices = services.filter(
    s => s.requested_by === user?.id || s.requested_by_username === user?.username
  );

  const myCars = cars.filter(
    c => c.submitted_by === user?.id || c.submitted_by_username === user?.username
  );

  const toggleService = (opt) => {
    setForm(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(opt)
        ? prev.selectedServices.filter(s => s !== opt)
        : [...prev.selectedServices, opt]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.selectedServices.length === 0) { setError('Please select at least one service option.'); return; }
    setSaving(true);
    const description = form.selectedServices.join(', ') + (form.customNote ? ` — ${form.customNote}` : '');
    const defaultCost = calculateServiceCost(form.selectedServices);
    try {
      await createService({ car: form.car, service_date: form.service_date, description, cost: defaultCost });
      setShowForm(false);
      setForm(BLANK);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.car?.[0] || 'Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this service request?')) return;
    try { await deleteService(id); fetchData(); }
    catch (err) { alert('Failed to cancel.'); }
  };

  return (
    <>
      <Navbar onAdd={() => setShowForm(true)} addLabel="+ Request Service" />
      <div>
        <div className="page-header">
          <div>
            <h2 className="page-title">🔧 Request Service</h2>
            <p className="page-subtitle">Submit a service request and track its status in real time</p>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : (
          <>
            {/* ─── My Active Requests with Status Tracker ─── */}
            {myServices.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontSize: 16 }}>
                  🚦 My Service Requests
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {myServices.map(svc => {
                    const meta     = getStatusMeta(svc.status);
                    const curIdx   = STATUS_STEPS.findIndex(s => s.key === svc.status);
                    const rejected = svc.status === 'rejected';
                    const carObj   = cars.find(c => c.id === svc.car);

                    const progressBar = rejected ? (
                      <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                        ❌ This service request was rejected by the admin.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {STATUS_STEPS.map((step, idx) => {
                          const done    = idx <= curIdx;
                          const current = idx === curIdx;
                          return (
                            <React.Fragment key={step.key}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 auto' }}>
                                <div style={{
                                  width: 36, height: 36, borderRadius: '50%',
                                  background: done ? step.color : 'var(--bg-primary)',
                                  border: `2px solid ${done ? step.color : 'var(--glass-border)'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 16, transition: 'all 0.3s',
                                  boxShadow: current ? `0 0 14px color-mix(in srgb, ${step.color} 50%, transparent)` : 'none',
                                }}>
                                  {done ? step.icon : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>○</span>}
                                </div>
                                <span style={{ fontSize: 10, fontWeight: current ? 700 : 400, color: done ? step.color : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                  {step.label}
                                </span>
                              </div>
                              {idx < STATUS_STEPS.length - 1 && (
                                <div style={{ flex: 1, height: 3, marginBottom: 18, background: idx < curIdx ? step.color : 'var(--glass-border)', transition: 'background 0.4s' }} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    );



                    return (
                      <div key={svc.id} style={{
                        background: 'var(--bg-card)',
                        border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
                        borderRadius: 14, padding: '20px 24px',
                      }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div style={{ flex: 1, paddingRight: 16 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                              🚗 {carObj ? `${carObj.make} ${carObj.model}` : `Car #${svc.car}`}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                              📝 {svc.description}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                              {svc.pickup_date ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                                  📅 Ready by: <strong>{svc.pickup_date}</strong>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', color: 'var(--text-muted)', padding: '5px 12px', borderRadius: 20, fontSize: 13 }}>
                                  📅 Pickup date not set yet
                                </div>
                              )}
                              {svc.pickup_details && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                                  🚐 {svc.pickup_details}
                                </div>
                              )}
                              {svc.cost > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                                  💰 Amount: ₹{Number(svc.cost).toLocaleString('en-IN')}
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', color: 'var(--text-muted)', padding: '5px 12px', borderRadius: 20, fontSize: 13 }}>
                                  💰 Amount pending
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              background: `color-mix(in srgb, ${meta.color} 15%, transparent)`, color: meta.color,
                              borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700,
                              border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
                            }}>
                              {meta.icon} {meta.label}
                            </span>
                            {svc.status === 'pending' && (
                              <button onClick={() => handleDelete(svc.id)} className="btn btn-sm btn-danger">Cancel</button>
                            )}
                          </div>
                        </div>
                        {/* Progress Tracker */}
                        {progressBar}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Empty State ─── */}
            {myServices.length === 0 && (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">🔧</div>
                  <p className="empty-state-text">No service requests yet. Click "Request Service" to submit one.</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── Submit Request Modal ─── */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">🔧 Submit Service Request</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
                  {error}
                </div>
              )}

              {myCars.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🚗</div>
                  <p>You have no registered cars. Please add car details first from the sidebar.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Select Your Car *</label>
                    <select className="form-select" name="car" value={form.car} onChange={e => setForm(p => ({ ...p, car: e.target.value }))} required>
                      <option value="">-- Choose a car --</option>
                      {myCars.map(c => (
                        <option key={c.id} value={c.id}>{c.make} {c.model} ({c.plate_number})</option>
                      ))}
                    </select>
                    {form.car && (() => {
                      const selectedCar = myCars.find(c => String(c.id) === String(form.car));
                      if (selectedCar && selectedCar.status && RECOMMENDED_SERVICES[selectedCar.status]) {
                        return (
                          <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', marginBottom: 6 }}>💡 Recommended based on car condition:</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                              {RECOMMENDED_SERVICES[selectedCar.status].join(' • ')}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Date * <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(today or future only)</span></label>
                    <input
                      className="form-input"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={form.service_date}
                      onChange={e => setForm(p => ({ ...p, service_date: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label" style={{ margin: 0 }}>Select Services Required *</label>
                      {form.selectedServices.length > 0 && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', background: 'rgba(16,185,129,0.12)', padding: '2px 10px', borderRadius: 12, border: '1px solid rgba(16,185,129,0.3)' }}>
                          Total Amount: ₹{calculateServiceCost(form.selectedServices)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                      {SERVICE_OPTIONS.map(opt => {
                        const selected = form.selectedServices.includes(opt);
                        const price = SERVICE_PRICES[opt];
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleService(opt)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 20,
                              fontSize: 12.5,
                              fontWeight: selected ? 700 : 500,
                              cursor: 'pointer',
                              border: `1.5px solid ${selected ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                              background: selected ? 'rgba(99,102,241,0.18)' : 'var(--bg-primary)',
                              color: selected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                              transition: 'all 0.18s',
                            }}
                          >
                            {selected ? '✓ ' : ''}{opt} <span style={{ opacity: 0.8, fontSize: 11, marginLeft: 4 }}>(₹{price})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Additional Notes (optional)</label>
                    <input
                      className="form-input"
                      placeholder="Any extra details..."
                      value={form.customNote}
                      onChange={e => setForm(p => ({ ...p, customNote: e.target.value }))}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Submitting...' : '🔧 Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
