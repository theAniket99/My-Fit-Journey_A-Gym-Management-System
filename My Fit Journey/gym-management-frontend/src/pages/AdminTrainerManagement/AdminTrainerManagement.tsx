import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './AdminTrainerManagement.css'; // ✅ Import CSS

interface Trainer {
  id: number;
  username: string;
  fullName: string;
  email: string;
  active: boolean;
  role: 'TRAINER';
}

const AdminTrainerManagement: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create Trainer form state
  const initialNewTrainer = {
    username: '',
    fullName: '',
    email: '',
    password: '',
  };
  const [newTrainer, setNewTrainer] = useState(initialNewTrainer);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit Trainer modal state
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [editTrainerForm, setEditTrainerForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
  });

  // Delete confirmation state
  const [deletingTrainer, setDeletingTrainer] = useState<Trainer | null>(null);

  // Fetch the list of trainers
  const fetchTrainers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Trainer[]>('/api/admin/trainers');
      setTrainers(response.data);
    } catch {
      setError('Failed to fetch trainers.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  // Create new trainer handler
  const handleCreateTrainer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newTrainer.username.trim() || !newTrainer.fullName.trim() || !newTrainer.email.trim() || !newTrainer.password.trim()) {
      setError('All fields are required.');
      return;
    }

    try {
      await api.post('/api/admin/trainers', newTrainer);
      setSuccess('Trainer created successfully.');
      setShowCreateForm(false);
      setNewTrainer(initialNewTrainer);
      fetchTrainers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create trainer.');
    }
  };

  // Open edit modal
  const openEditModal = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setEditTrainerForm({
      username: trainer.username,
      fullName: trainer.fullName,
      email: trainer.email,
      password: '',
    });
    setError(null);
    setSuccess(null);
  };

  // Edit trainer handler
  const handleEditTrainer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTrainer) return;

    setError(null);
    setSuccess(null);

    const updatePayload: { fullName: string; email: string; password?: string } = {
      fullName: editTrainerForm.fullName,
      email: editTrainerForm.email,
    };
    if (editTrainerForm.password.trim() !== '') {
      updatePayload.password = editTrainerForm.password;
    }

    try {
      await api.put(`/api/admin/trainers/${editingTrainer.id}`, updatePayload);
      setSuccess('Trainer updated successfully.');
      setEditingTrainer(null);
      fetchTrainers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update trainer.');
    }
  };

  // Toggle active/suspend
  const handleToggleActive = async (trainer: Trainer) => {
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/api/admin/users/${trainer.id}/active?active=${!trainer.active}`);
      setSuccess(`Trainer "${trainer.username}" is now ${!trainer.active ? 'active' : 'suspended'}.`);
      fetchTrainers();
    } catch {
      setError('Failed to update trainer status.');
    }
  };

  const confirmDeleteTrainer = (trainer: Trainer) => setDeletingTrainer(trainer);

  const handleDeleteTrainer = async () => {
    if (!deletingTrainer) return;
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/api/admin/trainers/${deletingTrainer.id}`);
      setSuccess(`Trainer "${deletingTrainer.username}" has been deleted.`);
      setDeletingTrainer(null);
      fetchTrainers();
    } catch {
      setError('Failed to delete trainer.');
    }
  };

  return (
    <div className="admin-trainer-management">
      <h1>Admin – Trainer Management</h1>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <button onClick={() => setShowCreateForm(true)}>+ Create New Trainer</button>

      {/* Create Trainer Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateTrainer} className="trainer-form">
          <h2>Create New Trainer</h2>
          <label>
            Username:
            <input type="text" value={newTrainer.username} onChange={(e) => setNewTrainer({ ...newTrainer, username: e.target.value })} required />
          </label>
          <label>
            Full Name:
            <input type="text" value={newTrainer.fullName} onChange={(e) => setNewTrainer({ ...newTrainer, fullName: e.target.value })} required />
          </label>
          <label>
            Email:
            <input type="email" value={newTrainer.email} onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })} required />
          </label>
          <label>
            Password:
            <input type="password" value={newTrainer.password} onChange={(e) => setNewTrainer({ ...newTrainer, password: e.target.value })} required />
          </label>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="submit">Create Trainer</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Edit Trainer Form */}
      {editingTrainer && (
        <form onSubmit={handleEditTrainer} className="trainer-form">
          <h2>Edit Trainer: {editingTrainer.username}</h2>
          <label>
            Username: <em>(not editable)</em>
            <input type="text" value={editTrainerForm.username} disabled />
          </label>
          <label>
            Full Name:
            <input type="text" value={editTrainerForm.fullName} onChange={(e) => setEditTrainerForm({ ...editTrainerForm, fullName: e.target.value })} required />
          </label>
          <label>
            Email:
            <input type="email" value={editTrainerForm.email} onChange={(e) => setEditTrainerForm({ ...editTrainerForm, email: e.target.value })} required />
          </label>
          <label>
            Password: <em>(leave blank to keep current)</em>
            <input type="password" value={editTrainerForm.password} onChange={(e) => setEditTrainerForm({ ...editTrainerForm, password: e.target.value })} placeholder="New password" />
          </label>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditingTrainer(null)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Delete Modal */}
      {deletingTrainer && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete trainer "{deletingTrainer.username}"?</p>
            <button className="delete-btn" onClick={handleDeleteTrainer}>Yes, Delete</button>
            <button onClick={() => setDeletingTrainer(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Trainers Table */}
      {loading ? (
        <p>Loading trainers...</p>
      ) : (
        <table className="trainer-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainers.length === 0 ? (
              <tr>
                <td colSpan={5}>No trainers found.</td>
              </tr>
            ) : (
              trainers.map((trainer) => (
                <tr key={trainer.id}>
                  <td>{trainer.username}</td>
                  <td>{trainer.fullName}</td>
                  <td>{trainer.email}</td>
                  <td className={trainer.active ? 'status-active' : 'status-suspended'}>
                    {trainer.active ? 'Active' : 'Suspended'}
                  </td>
                  <td>
                    <button onClick={() => openEditModal(trainer)}>Edit</button>
                    <button
                      onClick={() => handleToggleActive(trainer)}
                      className={trainer.active ? 'suspend-btn' : 'reactivate-btn'}
                    >
                      {trainer.active ? 'Suspend' : 'Reactivate'}
                    </button>
                    <button className="delete-btn" onClick={() => confirmDeleteTrainer(trainer)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTrainerManagement;
