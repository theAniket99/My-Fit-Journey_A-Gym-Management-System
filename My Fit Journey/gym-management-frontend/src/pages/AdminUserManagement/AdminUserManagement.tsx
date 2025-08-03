import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './AdminUserManagement.css';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'MEMBER' | 'TRAINER' | 'ADMIN';
  active: boolean;
}

const roles = ['ALL', 'MEMBER', 'TRAINER', 'ADMIN'] as const;

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<typeof roles[number]>('ALL');

  // Create user form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const initialNewUser = {
    username: '',
    fullName: '',
    email: '',
    role: '' as User['role'] | '',
    password: '',
  };
  const [newUser, setNewUser] = useState(initialNewUser);

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    username: '',
    fullName: '',
    email: '',
    role: '' as User['role'] | '',
    password: '',
  });

  // Delete confirmation state
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Fetch users, filtered by role if applicable
  const fetchUsers = async (roleFilter: typeof roles[number] = filterRole) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/admin/users';
      if (roleFilter !== 'ALL') {
        url += `?role=${roleFilter}`;
      }
      const response = await api.get<User[]>(url);
      setUsers(response.data);
    } catch {
      setError('Failed to load users.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole, success]);

  // Toggle active status (suspend/reactivate)
  const handleToggleActive = async (user: User) => {
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/api/admin/users/${user.id}/active?active=${!user.active}`);
      setSuccess(`User "${user.username}" is now ${!user.active ? 'active' : 'suspended'}.`);
      fetchUsers();
    } catch {
      setError('Failed to update user status.');
    }
  };

  // Create user handler
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newUser.role) {
      setError('Role is required');
      return;
    }
    if (!newUser.password) {
      setError('Password is required');
      return;
    }

    try {
      await api.post('/api/admin/users', newUser);
      setSuccess('User created!');
      setShowCreateForm(false);
      setNewUser(initialNewUser);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user.');
    }
  };

  // Open edit modal and prefill form
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditUserForm({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: '',
    });
    setError(null);
    setSuccess(null);
  };

  // Edit user handler
  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    setError(null);
    setSuccess(null);

    const roleToSend = editUserForm.role !== '' ? editUserForm.role : undefined;

    const updatePayload: Partial<User & { password?: string }> = {
      username: editUserForm.username,
      fullName: editUserForm.fullName,
      email: editUserForm.email,
      role: roleToSend,
    };
    if (editUserForm.password.trim() !== '') {
      updatePayload.password = editUserForm.password;
    }

    try {
      await api.put(`/api/admin/users/${editingUser.id}`, updatePayload);
      setSuccess(`User "${updatePayload.username}" updated successfully.`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user.');
    }
  };

  // Open delete confirmation dialog
  const confirmDeleteUser = (user: User) => {
    setDeletingUser(user);
  };

  // Delete user handler
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/api/admin/users/${deletingUser.id}`);
      setSuccess(`User "${deletingUser.username}" has been deleted.`);
      setDeletingUser(null);
      fetchUsers();
    } catch {
      setError('Failed to delete user.');
    }
  };

  return (
    <div className="admin-user-management-container">
      <h1>Admin Dashboard – User Management</h1>

      {/* Filter */}
      <div className="filter-container" style={{ marginBottom: '1rem' }}>
        <label htmlFor="roleFilter">Filter by Role: </label>
        <select
          id="roleFilter"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as typeof roles[number])}
        >
          {roles.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption}
            </option>
          ))}
        </select>
      </div>

      {/* Create user button */}
      <button onClick={() => setShowCreateForm(true)} style={{ marginBottom: '1rem' }}>
        + Create User
      </button>

      {/* Create User Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateUser}
          style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '16px' }}
        >
          <h2>Create New User</h2>
          <div>
            <label>
              Username:
              <input
                required
                value={newUser.username}
                onChange={(e) => setNewUser((u) => ({ ...u, username: e.target.value }))}
              />
            </label>
          </div>
          <div>
            <label>
              Full Name:
              <input
                required
                value={newUser.fullName}
                onChange={(e) => setNewUser((u) => ({ ...u, fullName: e.target.value }))}
              />
            </label>
          </div>
          <div>
            <label>
              Email:
              <input
                required
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
              />
            </label>
          </div>
          <div>
            <label>
              Role:
              <select
                required
                value={newUser.role}
                onChange={(e) =>
                  setNewUser((u) => ({
                    ...u,
                    role: e.target.value as User['role'],
                  }))
                }
              >
                <option value="">Select</option>
                <option value="MEMBER">MEMBER</option>
                <option value="TRAINER">TRAINER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Password:
              <input
                required
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button type="submit">Create</button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewUser(initialNewUser);
                setError(null);
                setSuccess(null);
              }}
              style={{ marginLeft: '8px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <form
          onSubmit={handleEditUser}
          style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '16px' }}
        >
          <h2>Edit User: {editingUser.username}</h2>
          <div>
            <label>
              Username:
              <input
                required
                value={editUserForm.username}
                onChange={(e) => setEditUserForm((f) => ({ ...f, username: e.target.value }))}
              />
            </label>
          </div>
          <div>
            <label>
              Full Name:
              <input
                required
                value={editUserForm.fullName}
                onChange={(e) => setEditUserForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </label>
          </div>
          <div>
            <label>
              Email:
              <input
                required
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
          </div>
          <div>
            <label>
              Role:
              <select
                required
                value={editUserForm.role}
                onChange={(e) => setEditUserForm((f) => ({ ...f, role: e.target.value as User['role'] }))}
              >
                <option value="">Select</option>
                <option value="MEMBER">MEMBER</option>
                <option value="TRAINER">TRAINER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Password: <em>(leave blank to keep current password)</em>
              <input
                type="password"
                value={editUserForm.password}
                onChange={(e) => setEditUserForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="New password"
              />
            </label>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button type="submit">Save Changes</button>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              style={{ marginLeft: '8px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete user "{deletingUser.username}"?</p>
            <button onClick={handleDeleteUser} style={{ marginRight: '8px' }}>
              Yes, Delete
            </button>
            <button onClick={() => setDeletingUser(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Success and Error Messages */}
      {success && <div className="success" style={{ marginBottom: '1rem' }}>{success}</div>}
      {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* User Table */}
      {loading ? (
        <p>Loading Users...</p>
      ) : (
        <table className="user-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '8px' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.fullName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
                  <td
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      color: user.active ? 'green' : 'red',
                      fontWeight: 'bold',
                    }}
                  >
                    {user.active ? 'Active' : 'Suspended'}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button onClick={() => openEditModal(user)}>Edit</button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      style={{
                        backgroundColor: user.active ? '#ffc107' : '#28a745',
                        color: user.active ? '#000' : '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        marginLeft: '8px',
                      }}
                    >
                      {user.active ? 'Suspend' : 'Reactivate'}
                    </button>
                    <button
                      onClick={() => setDeletingUser(user)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        marginLeft: '8px',
                      }}
                    >
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

export default AdminUserManagement;
