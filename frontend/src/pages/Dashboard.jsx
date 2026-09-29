import React, { useEffect, useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { getCars, getServices } from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Donut chart drawn with SVG — no external library
function DonutChart({ segments, size = 140, thickness = 28 }) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let offset = 0;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* background track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circumference;
        const gap  = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            style={{ filter: `drop-shadow(0 0 6px ${seg.color}80)`, transition: 'stroke-dasharray 0.8s ease' }}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// Animated bar chart
function BarGraph({ bars, maxH = 120 }) {
  const maxVal = Math.max(...bars.map(b => b.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: maxH, paddingBottom: 4 }}>
      {bars.map((b, i) => {
        const h = Math.max((b.value / maxVal) * maxH, b.value > 0 ? 8 : 0);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: b.color }}>{b.value > 0 ? b.value : ''}</span>
            <div style={{
              width: '100%', height: h,
              background: `linear-gradient(to top, ${b.color}, ${b.color}80)`,
              borderRadius: '6px 6px 0 0',
              boxShadow: `0 0 12px ${b.color}40`,
              transition: 'height 0.9s cubic-bezier(0.4,0,0.2,1)',
              minHeight: 4,
            }} />
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center', whiteSpace: 'nowrap' }}>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [cars, setCars]         = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getCars(), getServices()])
      .then(([carsRes, svcRes]) => { setCars(carsRes.data); setServices(svcRes.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const myCars     = cars.filter(c => c.submitted_by === user?.id || c.submitted_by_username === user?.username);
  const myServices = services.filter(s => s.requested_by === user?.id || s.requested_by_username === user?.username);

  const pending    = myServices.filter(s => s.status === 'pending').length;
  const accepted   = myServices.filter(s => s.status === 'accepted').length;
  const inProgress = myServices.filter(s => s.status === 'in_progress').length;
  const completed  = myServices.filter(s => s.status === 'completed').length;
  const rejected   = myServices.filter(s => s.status === 'rejected').length;
  const availableCars = myCars.filter(c => c.status === 'available').length;
  const totalSpent    = myServices.reduce((sum, s) => sum + parseFloat(s.cost || 0), 0);

  const donutSegs = [
    { label: 'Pending',     value: pending,    color: '#f59e0b' },
    { label: 'Accepted',    value: accepted,   color: '#10b981' },
    { label: 'In Progress', value: inProgress, color: '#3b82f6' },
    { label: 'Completed',   value: completed,  color: '#8b5cf6' },
    { label: 'Rejected',    value: rejected,   color: '#ef4444' },
  ].filter(s => s.value > 0);

  const barData = [
    { label: 'My Cars',      value: myCars.length,  color: '#6366f1' },
    { label: 'In Garage',    value: inProgress,     color: '#3b82f6' },
    { label: 'Completed',    value: completed,      color: '#10b981' },
    { label: 'Pending',      value: pending,        color: '#f59e0b' },
  ];

  return (
    <>
      <Navbar />
      <div>
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading dashboard...</div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              {[
                { icon: '🚗', value: myCars.length,                            label: 'My Cars',              sub: `${availableCars} available` },
                { icon: '🏬', value: inProgress,                               label: 'In Garage',            sub: 'Under active repair' },
                { icon: '🔧', value: myServices.length,                        label: 'My Garage Visits',     sub: 'Total service logs' },
                { icon: '💰', value: `₹${totalSpent.toLocaleString('en-IN')}`, label: 'Total Spent',          sub: 'Amount paid for services' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── Charts Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

              {/* Donut — Service Status Breakdown */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 28, border: '1px solid var(--glass-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>🍩 Service Status Breakdown</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Your service requests by stage</div>

                {myServices.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>No service data yet</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                    {/* Donut + centre label */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <DonutChart segments={donutSegs} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{myServices.length}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Total</div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      {[
                        { label: 'Pending',     value: pending,    color: '#f59e0b' },
                        { label: 'Accepted',    value: accepted,   color: '#10b981' },
                        { label: 'In Progress', value: inProgress, color: '#3b82f6' },
                        { label: 'Completed',   value: completed,  color: '#8b5cf6' },
                        { label: 'Rejected',    value: rejected,   color: '#ef4444' },
                      ].map(seg => (
                        <div key={seg.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, boxShadow: `0 0 6px ${seg.color}` }} />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{seg.label}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: seg.color }}>{seg.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bar — Activity Overview */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 28, border: '1px solid var(--glass-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>📊 Activity Overview</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Your vehicles &amp; service summary</div>
                <BarGraph bars={barData} />

                {/* Revenue highlight */}
                <div style={{ marginTop: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.1))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Amount Paid</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>₹{totalSpent.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ fontSize: 32 }}>💳</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
