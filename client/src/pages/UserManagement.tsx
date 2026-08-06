import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
const [newEmail, setNewEmail] = useState('');
const [newPassword, setNewPassword] = useState('');
const [newName, setNewName] = useState('');
const [newRole, setNewRole] = useState('accountant');
const [creating, setCreating] = useState(false);

  useEffect(() => { fetchUsers(); }, []);


  const handleCreateUser = async () => {
  if (!newName || !newEmail || !newPassword) {
    toast.error('Fill all fields');
    return;
  }
  setCreating(true);
  try {
    await api.post('/auth/register', { email: newEmail, password: newPassword, full_name: newName, role: newRole });
    toast.success('User created');
    setNewName(''); setNewEmail(''); setNewPassword('');
    fetchUsers();
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Failed');
  } finally {
    setCreating(false);
  }
};

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (id: number, role: string, is_active: boolean) => {
    try {
      await api.put(`/auth/users/${id}`, { role, is_active });
      toast.success('User updated');
      fetchUsers();
    } catch (error) { toast.error('Update failed'); }
  };

  const handleResetPassword = async (id: number) => {
    const newPass = prompt('Enter new password (min 6 characters):');
    if (!newPass || newPass.length < 6) return;
    try {
      await api.post(`/auth/users/${id}/reset-password`, { newPassword: newPass });
      toast.success('Password reset');
    } catch (error) { toast.error('Reset failed'); }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <p className="text-gray-500 mt-1 text-sm">Manage system users and roles</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
  <h3 className="font-semibold mb-4">Add New User</h3>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full Name" className="px-3 py-2 border rounded-lg text-sm" />
    <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" className="px-3 py-2 border rounded-lg text-sm" />
    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password" className="px-3 py-2 border rounded-lg text-sm" />
    <select value={newRole} onChange={e => setNewRole(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
      <option value="accountant">Accountant</option>
      <option value="hr_payroll">HR/Payroll</option>
      <option value="manager">Manager</option>
      <option value="auditor">Auditor</option>
    </select>
  </div>
  <button onClick={handleCreateUser} disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
    {creating ? 'Creating...' : '+ Create User'}
  </button>
</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td className="px-6 py-3 font-medium">{u.full_name}</td>
                  <td className="px-6 py-3 text-gray-600">{u.email}</td>
                  <td className="px-6 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdate(u.id, e.target.value, u.is_active)}
                      className="px-2 py-1 border rounded text-xs"
                    >
                      <option value="admin">Admin</option>
                      <option value="accountant">Accountant</option>
                      <option value="hr_payroll">HR/Payroll</option>
                      <option value="manager">Manager</option>
                      <option value="auditor">Auditor</option>
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleUpdate(u.id, u.role, !u.is_active)}
                      className={`px-2 py-1 text-xs rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                   <td className="px-6 py-3">
  <div className="flex gap-2">
    <button onClick={() => setEditingUser(u)} className="text-green-600 hover:text-green-800 text-xs font-medium">
      ✏️ Edit
    </button>

  </div>
</td>
                  <td className="px-6 py-3">
                    <button onClick={() => handleResetPassword(u.id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                      🔑 Reset Password
                    </button>
                  </td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editingUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50" onClick={() => setEditingUser(null)} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <h3 className="text-lg font-bold mb-4">Edit User</h3>
      <div className="space-y-4">
        <input type="text" value={editingUser.full_name} onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Full Name" />
        <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Email" />
        <div className="flex gap-2">
          <button onClick={() => {
            api.put(`/auth/users/${editingUser.id}`, { role: editingUser.role, is_active: editingUser.is_active, full_name: editingUser.full_name, email: editingUser.email })
              .then(() => { toast.success('Updated'); setEditingUser(null); fetchUsers(); })
              .catch(() => toast.error('Failed'));
          }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Save</button>
          <button onClick={() => setEditingUser(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}
    </Layout>
  );
};

export default UserManagement;