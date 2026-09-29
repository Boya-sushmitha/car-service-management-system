import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { getCars, getServices } from '../services/api';
import ServiceProgressTracker from '../components/ServiceProgressTracker';

const statusMeta = (s) => {
  const map = {
    pending:     { label: 'Request Submitted', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: 'document' },
    accepted:    { label: 'Accepted',          color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: 'check' },
    in_progress: { label: 'In Progress',       color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: 'wrench' },
    completed:   { label: 'Completed',         color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: 'flag' },
    rejected:    { label: 'Rejected',          color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: 'x' },
  };
  return map[s] || { label: s, color: 'var(--text-muted)', bg: 'transparent', icon: 'doc' };
};

export default function GarageStatus() {
  const { user } = useContext(AuthContext);
  const [cars, setCars]         = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = () =>
    Promise.all([getCars(), getServices()])
      .then(([c, s]) => { setCars(c.data); setServices(s.data); setLastRefresh(new Date()); })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const myServices = user?.is_staff
    ? services
    : services.filter(s => s.requested_by === user?.id || s.requested_by_username === user?.username);

  const carMap    = Object.fromEntries(cars.map(c => [c.id, c]));
  const inGarage  = myServices.filter(s => s.status === 'in_progress');
  const completed = myServices.filter(s => s.status === 'completed');
  const pending   = myServices.filter(s => s.status === 'pending');

  return (
    <>
      <Navbar />
      <div>
        <div className="page-header">
          <div>
            <h2 className="page-title">🏬 Garage Status</h2>
            <p className="page-subtitle">
              Live status of all service requests · Last updated: {lastRefresh.toLocaleTimeString()}
              <button
                onClick={fetchData}
                style={{ marginLeft: 12, background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}
              >
                🔄 Refresh
              </button>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading garage status...</div>
        ) : (
          <>
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              {[
                { icon: '⏳', value: pending.length,    label: 'Pending Requests',      color: '#f59e0b' },
                { icon: '🔧', value: inGarage.length,   label: 'Currently In Progress', color: '#3b82f6' },
                { icon: '🏁', value: completed.length,  label: 'Completed',             color: '#8b5cf6' },
                { icon: '📋', value: myServices.length, label: 'Total Requests',        color: '#10b981' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {myServices.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">🏬</div>
                  <p className="empty-state-text">
                    {user?.is_staff
                      ? 'No service requests found.'
                      : 'You have no service requests. Go to "Request Service" to submit one.'}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {myServices.map(svc => {
                  const meta     = statusMeta(svc.status);
                  const rejected = svc.status === 'rejected';
                  const car      = carMap[svc.car];

                  return (
                    <div
                      key={svc.id}
                      className="gs-card"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--glass-border)',
                        borderLeft: `4px solid ${meta.color}`,
                        borderRadius: 16,
                        overflow: 'hidden',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 2px 24px rgba(0,0,0,0.25)',
                        transition: 'box-shadow 0.3s ease, transform 0.25s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${meta.color}33`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 2px 24px rgba(0,0,0,0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Card Top Bar */}
                      <div style={{
                        padding: '16px 22px',
                        background: meta.bg,
                        borderBottom: `1px solid ${meta.color}22`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 10,
                            background: `${meta.color}22`,
                            border: `1px solid ${meta.color}44`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20,
                          }}>🚗</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                              {car ? `${car.make} ${car.model}` : `Car #${svc.car}`}
                              {car && (
                                <code style={{
                                  marginLeft: 8, fontSize: 11,
                                  background: 'rgba(255,255,255,0.08)',
                                  padding: '2px 7px', borderRadius: 5,
                                  color: 'var(--text-secondary)', fontFamily: 'monospace',
                                }}>
                                  {car.plate_number}
                                </code>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                              📅 {svc.service_date}
                              {user?.is_staff && (
                                <span style={{ marginLeft: 10 }}>
                                  👤 <strong style={{ color: 'var(--text-primary)' }}>{svc.requested_by_username}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: meta.bg,
                          border: `1px solid ${meta.color}55`,
                          borderRadius: 20, padding: '5px 14px',
                        }}>
                          <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: meta.color, display: 'inline-block',
                            animation: svc.status === 'in_progress' ? 'gs-blink 1.4s ease-in-out infinite' : 'none',
                          }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '18px 22px' }}>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.5 }}>
                          📝 {svc.description}
                        </p>

                        {(svc.mechanic || svc.cost > 0 || svc.pickup_date || svc.pickup_details) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                            {svc.mechanic && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                                🔩 {svc.mechanic}
                              </span>
                            )}
                            {svc.cost > 0 && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                                💰 ₹{Number(svc.cost).toLocaleString('en-IN')}
                              </span>
                            )}
                            {svc.pickup_date && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                                📅 Ready by: {svc.pickup_date}
                              </span>
                            )}
                            {svc.pickup_details && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#818cf8', fontWeight: 600 }}>
                                🚐 {svc.pickup_details}
                              </span>
                            )}
                          </div>
                        )}

                        {!rejected ? (
                          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px 8px' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                              Service Progress
                            </div>
                            <ServiceProgressTracker status={svc.status} />
                          </div>
                        ) : (
                          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            ❌ This service request was rejected by the admin. Please submit a new request if needed.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes gs-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}
