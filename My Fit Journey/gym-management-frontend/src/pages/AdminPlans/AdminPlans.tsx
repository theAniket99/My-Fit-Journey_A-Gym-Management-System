import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './AdminPlans.css';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  active: boolean;
}

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create plan form state
  const initialNewPlan = {
    name: '',
    description: '',
    price: 0,
    durationInDays: 1,
    active: true,
  };
  const [newPlan, setNewPlan] = useState(initialNewPlan);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit plan form state
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editPlanForm, setEditPlanForm] = useState({
    name: '',
    description: '',
    price: 0,
    durationInDays: 1,
    active: true,
  });

  // Delete confirmation state
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);

  // Fetch plans from backend
  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Plan[]>('/api/admin/plans');
      setPlans(response.data);
    } catch {
      setError('Failed to load plans.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle Create Plan submission
  const handleCreatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPlan.name.trim()) return setError('Plan name is required');
    if (newPlan.price <= 0) return setError('Price must be greater than zero');
    if (newPlan.durationInDays <= 0) return setError('Duration must be at least 1 day');

    try {
      await api.post('/api/admin/plans', newPlan);
      setSuccess('Plan created successfully.');
      setShowCreateForm(false);
      setNewPlan(initialNewPlan);
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create plan.');
    }
  };

  // Open the edit modal
  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setEditPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationInDays: plan.durationInDays,
      active: plan.active,
    });
    setError(null);
    setSuccess(null);
  };

  // Handle Edit Plan submission
  const handleEditPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPlan) return;

    if (!editPlanForm.name.trim()) return setError('Plan name is required');
    if (editPlanForm.price <= 0) return setError('Price must be greater than zero');
    if (editPlanForm.durationInDays <= 0) return setError('Duration must be at least 1 day');

    try {
      await api.put(`/api/admin/plans/${editingPlan.id}`, editPlanForm);
      setSuccess('Plan updated successfully.');
      setEditingPlan(null);
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update plan.');
    }
  };

  // Confirm delete modal open
  const confirmDeletePlan = (plan: Plan) => {
    setDeletingPlan(plan);
  };

  // Handle Plan deletion
  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    try {
      await api.delete(`/api/admin/plans/${deletingPlan.id}`);
      setSuccess(`Plan "${deletingPlan.name}" has been deleted.`);
      setDeletingPlan(null);
      fetchPlans();
    } catch {
      setError('Failed to delete plan.');
    }
  };

  return (
    <div className="admin-plan-management">
      <h1>Admin – Plan Management</h1>

      {/* Success and Error Messages */}
      {success && <div className="success-msg">{success}</div>}
      {error && <div className="error-msg">{error}</div>}

      {/* Create Plan Button */}
      <button className="create-plan-btn" onClick={() => setShowCreateForm(true)}>
        + Create New Plan
      </button>

      {/* Create Plan Form */}
      {showCreateForm && (
        <form className="plan-form" onSubmit={handleCreatePlan}>
          <h2>Create New Plan</h2>
          <label>
            Name:
            <input
              type="text"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              rows={3}
            />
          </label>
          <label>
            Price:
            <input
              type="number"
              min={0}
              step={0.01}
              value={newPlan.price}
              onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </label>
          <label>
            Duration (days):
            <input
              type="number"
              min={1}
              value={newPlan.durationInDays}
              onChange={(e) => setNewPlan({ ...newPlan, durationInDays: parseInt(e.target.value) || 1 })}
              required
            />
          </label>
          <label className="checkbox-label">
            Active:
            <input
              type="checkbox"
              checked={newPlan.active}
              onChange={(e) => setNewPlan({ ...newPlan, active: e.target.checked })}
            />
          </label>
          <div>
            <button type="submit">Create Plan</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Edit Plan Form */}
      {editingPlan && (
        <form className="plan-form" onSubmit={handleEditPlan}>
          <h2>Edit Plan: {editingPlan.name}</h2>
          <label>
            Name:
            <input
              type="text"
              value={editPlanForm.name}
              onChange={(e) => setEditPlanForm({ ...editPlanForm, name: e.target.value })}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              value={editPlanForm.description}
              onChange={(e) => setEditPlanForm({ ...editPlanForm, description: e.target.value })}
              rows={3}
            />
          </label>
          <label>
            Price:
            <input
              type="number"
              min={0}
              step={0.01}
              value={editPlanForm.price}
              onChange={(e) => setEditPlanForm({ ...editPlanForm, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </label>
          <label>
            Duration (days):
            <input
              type="number"
              min={1}
              value={editPlanForm.durationInDays}
              onChange={(e) => setEditPlanForm({ ...editPlanForm, durationInDays: parseInt(e.target.value) || 1 })}
              required
            />
          </label>
          <label className="checkbox-label">
            Active:
            <input
              type="checkbox"
              checked={editPlanForm.active}
              onChange={(e) => setEditPlanForm({ ...editPlanForm, active: e.target.checked })}
            />
          </label>
          <div>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditingPlan(null)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlan && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete plan "{deletingPlan.name}"?</p>
            <div>
              <button className="modal-confirm" onClick={handleDeletePlan}>Yes, Delete</button>
              <button className="modal-cancel" onClick={() => setDeletingPlan(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Plans Table */}
      {loading ? (
        <p>Loading plans...</p>
      ) : (
        <table className="plan-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Duration (days)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan={6}>No plans found.</td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td>{plan.description}</td>
                  <td>₹{plan.price}</td>
                  <td>{plan.durationInDays}</td>
                  <td className={plan.active ? 'status-active' : 'status-inactive'}>
                    {plan.active ? 'Active' : 'Inactive'}
                  </td>
                  <td>
                    <button onClick={() => openEditModal(plan)}>Edit</button>
                    <button className="modal-confirm" onClick={() => confirmDeletePlan(plan)}>
                      Delete
                    </button>
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

export default AdminPlans;
