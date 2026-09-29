import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getBookings, createBooking, updateBooking, deleteBooking, getCars, getCustomers } from '../services/api';

const EMPTY = { car: '', customer: '', service_type: 'oil_change', booking_date: '', booking_time: '', status: 'pending', notes: '' };

const STATUS_COLORS = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-danger',
};

const SERVICE_LABELS = {
  oil_change: 'Oil Change',
  tire_rotation: 'Tire Rotation',
  brake_service: 'Brake Service',
  engine_check: 'Engine Check',
  full_service: 'Full Service',
  other: 'Other',
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = () => {
    Promise.all([getBookings(), getCars(), getCustomers()])
      .then(([bRes, cRes, cuRes]) => {
        setBookings(bRes.data);
        setCars(cRes.data);
        setCustomers(cuRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowModal(true); };
  const openEdit = (b) => { setForm(b); setEditId(b.id); setShowModal(true); };
  const closeModal = () => setShowModal(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await updateBooking(editId, form);
      else await createBooking(form);
      fetchAll();
      closeModal();
    } catch (err) {
      alert('Error: ' + JSON.stringify(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    await deleteBooking(id);
    fetchAll();
  };

  return (
    <>
      <Navbar onAdd={openAdd} addLabel="New Booking" />
      <div>
        <div className="page-header">
          <div>
            <h2 className="page-title">Bookings</h2>
            <p className="page-subtitle">{bookings.length} total appointments</p>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p className="empty-state-text">No bookings yet. Schedule one!</p>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{b.customer_display}</td>
                    <td>{b.car_display}</td>
                    <td>{SERVICE_LABELS[b.service_type] || b.service_type}</td>
                    <td>
                      <div>{b.booking_date}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.booking_time}</div>
                    </td>
                    <td><span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? '✏️ Edit Booking' : '📅 New Booking'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select className="form-select" name="customer" value={form.customer} onChange={handleChange} required>
                    <option value="">Select customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Car *</label>
                  <select className="form-select" name="car" value={form.car} onChange={handleChange} required>
                    <option value="">Select car...</option>
                    {cars.map(c => (
                      <option key={c.id} value={c.id}>{c.make} {c.model} ({c.plate_number})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Service Type *</label>
                <select className="form-select" name="service_type" value={form.service_type} onChange={handleChange}>
                  {Object.entries(SERVICE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input className="form-input" name="booking_date" type="date" value={form.booking_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input className="form-input" name="booking_time" type="time" value={form.booking_time} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional notes..." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Update Booking' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
