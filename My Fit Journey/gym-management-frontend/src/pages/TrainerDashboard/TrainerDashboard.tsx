import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // added for logout navigation
import api from '../../services/api';
import './TrainerDashboard.css';

interface ClassSession {
  id: number;
  className: string;
  description?: string;
  scheduledAt: string; // ISO date string
  maxCapacity?: number;
  trainerId: number;
  trainerName?: string;
}

interface ClassBooking {
  bookingId: number;
  classSessionId: number;
  className: string;
  scheduledAt: string;
  active: boolean;
  bookedAt: string | null;
  present?: boolean; // attendance flag
  memberName?: string; // member's name (from backend DTO)
}

interface ModalProps {
  show: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, title, onClose, children }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <header className="modal-header">
          <h2 id="modalTitle">{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </header>
        <main className="modal-body">{children}</main>
      </div>
    </>
  );
};

const emptyForm = {
  className: '',
  description: '',
  scheduledAt: '', // empty string for new class creation
  maxCapacity: 0,
};

const TrainerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Modal & bookings state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classBookings, setClassBookings] = useState<ClassBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Format ISO string for datetime-local input
  const formatDateInput = (isoString: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fetch all trainer classes
  const fetchClasses = () => {
    setLoading(true);
    setError(null);
    api
      .get<ClassSession[]>('/api/trainer/classes')
      .then(res => {
        setClasses(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load classes.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch class bookings for modal
  const fetchClassBookings = async (classId: number) => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const res = await api.get<ClassBooking[]>(`/api/trainer/classes/${classId}/bookings`);
      setClassBookings(res.data);
    } catch {
      setBookingsError('Failed to load bookings.');
      setClassBookings([]);
    }
    setBookingsLoading(false);
  };

  // Open booked members modal
  const handleViewBookedMembers = (classId: number) => {
    setSelectedClassId(classId);
    setModalOpen(true);
    fetchClassBookings(classId);
  };

  // Close modal and reset
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClassId(null);
    setClassBookings([]);
    setBookingsError(null);
  };

  // Handle attendance toggle for a booking
  const handleToggleAttendance = async (bookingId: number, newValue: boolean) => {
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/api/trainer/classes/bookings/${bookingId}/attendance?present=${newValue}`);
      if (selectedClassId) fetchClassBookings(selectedClassId);
      setSuccess('Attendance updated successfully.');
    } catch {
      setError('Failed to update attendance.');
    }
  };

  // Form input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Create new class
  const handleCreate = async () => {
    setError(null);
    setSuccess(null);

    if (form.className.trim() === '') {
      setError('Class Name is required.');
      return;
    }
    if (form.scheduledAt === '') {
      setError('Scheduled Date/Time is required.');
      return;
    }

    try {
      await api.post('/api/trainer/classes', {
        className: form.className.trim(),
        description: form.description.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        maxCapacity: form.maxCapacity > 0 ? form.maxCapacity : null,
      });
      setSuccess('Class created successfully!');
      setForm(emptyForm);
      fetchClasses();
    } catch {
      setError('Failed to create class.');
    }
  };

  // Edit existing class: populate form
  const handleEdit = (cls: ClassSession) => {
    setEditingId(cls.id);
    setForm({
      className: cls.className,
      description: cls.description || '',
      scheduledAt: formatDateInput(cls.scheduledAt),
      maxCapacity: cls.maxCapacity || 0,
    });
    setError(null);
    setSuccess(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
  };

  // Update existing class
  const handleUpdate = async () => {
    if (!editingId) return;
    setError(null);
    setSuccess(null);

    if (form.className.trim() === '') {
      setError('Class Name is required.');
      return;
    }
    if (form.scheduledAt === '') {
      setError('Scheduled Date/Time is required.');
      return;
    }

    try {
      await api.put(`/api/trainer/classes/${editingId}`, {
        className: form.className.trim(),
        description: form.description.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        maxCapacity: form.maxCapacity > 0 ? form.maxCapacity : null,
      });
      setSuccess('Class updated successfully!');
      setEditingId(null);
      setForm(emptyForm);
      fetchClasses();
    } catch {
      setError('Failed to update class.');
    }
  };

  // Delete a class
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/api/trainer/classes/${id}`);
      setSuccess('Class deleted successfully!');
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      fetchClasses();
    } catch {
      setError('Failed to delete class.');
    }
  };

  // Logout button handler
  const handleLogout = () => {
    sessionStorage.removeItem('jwtToken');
    navigate('/login');
  };

  if (loading) return <p>Loading classes...</p>;

  return (
    <div className="trainer-dashboard">
      {/* Header with Logout */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Trainer Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      {/* Your existing content below */}

      <section className="classes-list">
        <h2>Your Class Sessions</h2>
        {classes.length === 0 ? (
          <p>No classes found. Create one below.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Description</th>
                <th>Scheduled At</th>
                <th>Max Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id}>
                  <td>{cls.className}</td>
                  <td>{cls.description || '-'}</td>
                  <td>{new Date(cls.scheduledAt).toLocaleString()}</td>
                  <td>{cls.maxCapacity ?? '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(cls)}>Edit</button>{' '}
                    <button onClick={() => handleDelete(cls.id)}>Delete</button>{' '}
                    <button onClick={() => handleViewBookedMembers(cls.id)}>View Booked Members</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="class-form">
        <h2>{editingId ? 'Edit Class' : 'Create New Class'}</h2>
        <label>
          Class Name*:
          <input
            type="text"
            name="className"
            value={form.className}
            onChange={handleInputChange}
            autoComplete="off"
          />
        </label>
        <label>
          Description:
          <textarea name="description" value={form.description} onChange={handleInputChange} />
        </label>
        <label>
          Scheduled At*:
          <input
            type="datetime-local"
            name="scheduledAt"
            value={form.scheduledAt}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Max Capacity:
          <input
            type="number"
            name="maxCapacity"
            min={0}
            value={form.maxCapacity}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                maxCapacity: Number(e.target.value),
              }))
            }
          />
        </label>
        {editingId ? (
          <>
            <button onClick={handleUpdate}>Update Class</button>
            <button onClick={cancelEdit}>Cancel</button>
          </>
        ) : (
          <button onClick={handleCreate}>Create Class</button>
        )}
      </section>

      {/* Booked Members Modal */}
      <Modal show={modalOpen} title="Booked Members" onClose={handleCloseModal}>
        {bookingsLoading ? (
          <p>Loading bookings...</p>
        ) : bookingsError ? (
          <p className="error">{bookingsError}</p>
        ) : classBookings.length === 0 ? (
          <p>No members have booked this class.</p>
        ) : (
          <table style={{ width: '100%', color: '#8cffdb' }}>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Booked At</th>
                <th>Status</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {classBookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td>{booking.memberName || 'Unknown Member'}</td>
                  <td>{booking.bookedAt ? new Date(booking.bookedAt).toLocaleString() : '-'}</td>
                  <td>{booking.active ? 'Active' : 'Cancelled'}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!booking.present}
                      disabled={!booking.active}
                      onChange={() => handleToggleAttendance(booking.bookingId, !booking.present)}
                      aria-label={`Mark attendance for ${booking.memberName || 'member'}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
};

export default TrainerDashboard;
