import React, { useEffect, useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { getCars, createCar, updateCar, deleteCar } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const EMPTY_CAR = { make: '', model: '', year: '', color: '', plate_number: '', status: 'pending_check', mileage: 0 };

const STATUS_META = {
  pending_check:  { label: '⏳ Checking Pending Stage', badge: 'badge-warning', color: '#f59e0b' },
  good_condition: { label: '✅ Good Condition',        badge: 'badge-success', color: '#10b981' },
  needs_service:  { label: '🔧 Needs Service',         badge: 'badge-warning', color: '#f59e0b' },
  under_repair:   { label: '🛠️ Under Repair',          badge: 'badge-info',    color: '#3b82f6' },
  not_in_use:     { label: '🚫 Not In Use',            badge: 'badge-danger',  color: '#ef4444' },
};

export default function Cars() {
  const { user } = useContext(AuthContext);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_CAR);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCars = () => {
    getCars()
      .then(r => setCars(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCars(); }, []);

  const openAdd = () => { setForm(EMPTY_CAR); setEditId(null); setShowModal(true); };
  const openEdit = (car) => { setForm(car); setEditId(car.id); setShowModal(true); };
  const closeModal = () => { setShowModal(false); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await updateCar(editId, form);
      else await createCar(form);
      fetchCars();
      closeModal();
    } catch (err) {
      alert('Error saving car: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this car?')) return;
    await deleteCar(id);
    fetchCars();
  };

  const myCars = user?.is_staff
    ? cars
    : cars.filter(c => c.submitted_by === user?.id || c.submitted_by_username === user?.username);

  return (
    <>
      <Navbar onAdd={openAdd} addLabel="Add Car" />
      <div>
        <div className="page-header">
          <div>
            <h2 className="page-title">Vehicle Inventory</h2>
            <p className="page-subtitle">{myCars.length} vehicle{myCars.length !== 1 ? 's' : ''} registered</p>
          </div>
        </div>

        {/* ── My Vehicle Condition Tracker (non-admin users) ── */}
        {!user?.is_staff && (() => {
          const myCars = cars.filter(c => c.submitted_by === user?.id || c.submitted_by_username === user?.username);
          if (myCars.length === 0) return null;
          return (
            <div className="card" style={{ marginBottom: 24, border: '1px solid var(--glass-border)', background: 'var(--bg-card)' }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>🚦 My Vehicles — Status &amp; Admin Decision</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Status of your registered vehicles through admin decision.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {myCars.map(car => {
                  const isPendingDec = !car.status || car.status === 'pending_check';
                  const meta  = STATUS_META[car.status] || { label: '⏳ Checking Pending Stage', color: '#f59e0b' };
                  const color = meta.color;

                  return (
                    <div key={car.id} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px 20px', border: `1px solid ${color}33` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{car.make} {car.model}</span>
                          <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>{car.year} · <code style={{ background: 'var(--bg-primary)', padding: '1px 6px', borderRadius: 4 }}>{car.plate_number}</code></span>
                        </div>
                        <span style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color, borderRadius: 20, padding: '5px 16px', fontSize: 12, fontWeight: 700, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}>
                          {meta.label}
                        </span>
                      </div>
                      
                      {/* Condition Step Track — Ends at Admin Decision */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 18 }}>
                        {/* Step 1: Checking Pending Stage */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 auto' }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: isPendingDec ? 'rgba(245,158,11,0.2)' : '#10b981',
                            border: `2px solid ${isPendingDec ? '#f59e0b' : '#10b981'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, transition: 'all 0.3s',
                            boxShadow: `0 0 12px ${isPendingDec ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)'}`,
                          }}>
                            {isPendingDec ? '⏳' : '🔍'}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: isPendingDec ? '#f59e0b' : '#10b981', textAlign: 'center' }}>
                            Checking Pending Stage
                          </span>
                        </div>

                        {/* Line connector to Admin Decision */}
                        <div style={{ flex: 1, height: 3, marginBottom: 18, background: isPendingDec ? 'var(--glass-border)' : '#10b981', transition: 'background 0.4s' }} />

                        {/* Step 2: Admin Decision (Final stage - nothing after this) */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 auto' }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: isPendingDec ? 'var(--bg-primary)' : `color-mix(in srgb, ${color} 25%, transparent)`,
                            border: `2px solid ${isPendingDec ? 'var(--glass-border)' : color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, transition: 'all 0.3s',
                            boxShadow: isPendingDec ? 'none' : `0 0 12px color-mix(in srgb, ${color} 50%, transparent)`,
                          }}>
                            {isPendingDec ? '⚖️' : meta.label.split(' ')[0]}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: isPendingDec ? 500 : 700, color: isPendingDec ? 'var(--text-muted)' : color, textAlign: 'center' }}>
                            {isPendingDec ? 'Awaiting Admin Decision' : meta.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading cars...</div>
        ) : myCars.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity:0.35}}>
                  <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h12l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="7.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="16.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <p className="empty-state-text">No cars added yet. Click "Add Car" to get started.</p>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Make &amp; Model</th>
                  <th>Year</th>
                  <th>Color</th>
                  <th>Plate</th>
                  <th>Mileage</th>
                  <th>Condition</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myCars.map((car, i) => {
                  const meta = STATUS_META[car.status] || { label: car.status, badge: 'badge-ghost' };
                  return (
                    <tr key={car.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{car.make} {car.model}</td>
                      <td>{car.year}</td>
                      <td>{car.color}</td>
                      <td><code style={{ background: 'var(--bg-card)', padding: '2px 7px', borderRadius: 4, fontSize: 12 }}>{car.plate_number}</code></td>
                      <td>{Number(car.mileage).toLocaleString()} km</td>
                      <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(car)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(car.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? '✏️ Edit Vehicle' : '🛻 Add New Vehicle'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Make *</label>
                  <select className="form-select" name="make" value={form.make} onChange={handleChange} required>
                    <option value="">-- Select Make --</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Ford">Ford</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="BMW">BMW</option>
                    <option value="Audi">Audi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Model *</label>
                  <input className="form-input" name="model" value={form.model} onChange={handleChange} required placeholder="e.g. Camry" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <input className="form-input" name="year" type="number" value={form.year} onChange={handleChange} required placeholder="2024" />
                </div>
                <div className="form-group">
                  <label className="form-label">Color *</label>
                  <input className="form-input" name="color" value={form.color} onChange={handleChange} required placeholder="e.g. Pearl White" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Plate Number *</label>
                  <input className="form-input" name="plate_number" value={form.plate_number} onChange={handleChange} required placeholder="MH01AB1234" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mileage (km)</label>
                  <input className="form-input" name="mileage" type="number" value={form.mileage} onChange={handleChange} placeholder="0" />
                </div>
              </div>
              {user?.is_staff && (
                <div className="form-group">
                  <label className="form-label">Condition Status</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                    {STATUSES.map(st => {
                      const sm       = STATUS_META[st];
                      const selected = form.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, status: st }))}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: `2px solid ${selected ? sm.color : 'var(--glass-border)'}`,
                            background: selected ? `color-mix(in srgb, ${sm.color} 18%, transparent)` : 'var(--bg-primary)',
                            color: selected ? sm.color : 'var(--text-secondary)',
                            fontWeight: selected ? 700 : 500,
                            fontSize: 13,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            boxShadow: selected ? `0 0 10px color-mix(in srgb, ${sm.color} 30%, transparent)` : 'none',
                          }}
                        >
                          {sm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Update Car' : 'Add Car'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
