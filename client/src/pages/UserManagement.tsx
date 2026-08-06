// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// const UserManagement = () => {
//   const [users, setUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editingUser, setEditingUser] = useState<any>(null);
// const [newEmail, setNewEmail] = useState('');
// const [newPassword, setNewPassword] = useState('');
// const [newName, setNewName] = useState('');
// const [newRole, setNewRole] = useState('accountant');
// const [creating, setCreating] = useState(false);

//   useEffect(() => { fetchUsers(); }, []);


//   const handleCreateUser = async () => {
//   if (!newName || !newEmail || !newPassword) {
//     toast.error('Fill all fields');
//     return;
//   }
//   setCreating(true);
//   try {
//     await api.post('/auth/register', { email: newEmail, password: newPassword, full_name: newName, role: newRole });
//     toast.success('User created');
//     setNewName(''); setNewEmail(''); setNewPassword('');
//     fetchUsers();
//   } catch (err: any) {
//     toast.error(err.response?.data?.error || 'Failed');
//   } finally {
//     setCreating(false);
//   }
// };

//   const fetchUsers = async () => {
//     try {
//       const response = await api.get('/auth/users');
//       setUsers(response.data);
//     } catch (error) { toast.error('Failed to load users'); }
//     finally { setLoading(false); }
//   };

//   const handleUpdate = async (id: number, role: string, is_active: boolean) => {
//     try {
//       await api.put(`/auth/users/${id}`, { role, is_active });
//       toast.success('User updated');
//       fetchUsers();
//     } catch (error) { toast.error('Update failed'); }
//   };

//   const handleResetPassword = async (id: number) => {
//     const newPass = prompt('Enter new password (min 6 characters):');
//     if (!newPass || newPass.length < 6) return;
//     try {
//       await api.post(`/auth/users/${id}/reset-password`, { newPassword: newPass });
//       toast.success('Password reset');
//     } catch (error) { toast.error('Reset failed'); }
//   };

//   return (
//     <Layout>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
//         <p className="text-gray-500 mt-1 text-sm">Manage system users and roles</p>
//       </div>

//       {loading ? (
//         <div className="text-center py-12">Loading...</div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//   <h3 className="font-semibold mb-4">Add New User</h3>
//   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//     <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full Name" className="px-3 py-2 border rounded-lg text-sm" />
//     <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" className="px-3 py-2 border rounded-lg text-sm" />
//     <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password" className="px-3 py-2 border rounded-lg text-sm" />
//     <select value={newRole} onChange={e => setNewRole(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
//       <option value="accountant">Accountant</option>
//       <option value="hr_payroll">HR/Payroll</option>
//       <option value="manager">Manager</option>
//       <option value="auditor">Auditor</option>
//     </select>
//   </div>
//   <button onClick={handleCreateUser} disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
//     {creating ? 'Creating...' : '+ Create User'}
//   </button>
// </div>
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {users.map((u: any) => (
//                 <tr key={u.id}>
//                   <td className="px-6 py-3 font-medium">{u.full_name}</td>
//                   <td className="px-6 py-3 text-gray-600">{u.email}</td>
//                   <td className="px-6 py-3">
//                     <select
//                       value={u.role}
//                       onChange={(e) => handleUpdate(u.id, e.target.value, u.is_active)}
//                       className="px-2 py-1 border rounded text-xs"
//                     >
//                       <option value="admin">Admin</option>
//                       <option value="accountant">Accountant</option>
//                       <option value="hr_payroll">HR/Payroll</option>
//                       <option value="manager">Manager</option>
//                       <option value="auditor">Auditor</option>
//                     </select>
//                   </td>
//                   <td className="px-6 py-3">
//                     <button
//                       onClick={() => handleUpdate(u.id, u.role, !u.is_active)}
//                       className={`px-2 py-1 text-xs rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
//                     >
//                       {u.is_active ? 'Active' : 'Inactive'}
//                     </button>
//                   </td>
//                    <td className="px-6 py-3">
//   <div className="flex gap-2">
//     <button onClick={() => setEditingUser(u)} className="text-green-600 hover:text-green-800 text-xs font-medium">
//       ✏️ Edit
//     </button>

//   </div>
// </td>
//                   <td className="px-6 py-3">
//                     <button onClick={() => handleResetPassword(u.id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
//                       🔑 Reset Password
//                     </button>
//                   </td>
                 
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//       {editingUser && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//     <div className="absolute inset-0 bg-black/50" onClick={() => setEditingUser(null)} />
//     <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
//       <h3 className="text-lg font-bold mb-4">Edit User</h3>
//       <div className="space-y-4">
//         <input type="text" value={editingUser.full_name} onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Full Name" />
//         <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Email" />
//         <div className="flex gap-2">
//           <button onClick={() => {
//             api.put(`/auth/users/${editingUser.id}`, { role: editingUser.role, is_active: editingUser.is_active, full_name: editingUser.full_name, email: editingUser.email })
//               .then(() => { toast.success('Updated'); setEditingUser(null); fetchUsers(); })
//               .catch(() => toast.error('Failed'));
//           }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Save</button>
//           <button onClick={() => setEditingUser(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}
//     </Layout>
//   );
// };

// export default UserManagement;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('accountant');
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showResetModal, setShowResetModal] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async () => {
    if (!newName || !newEmail || !newPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setCreating(true);
    try {
      await api.post('/auth/register', { 
        email: newEmail.trim(), 
        password: newPassword, 
        full_name: newName.trim(), 
        role: newRole 
      });
      toast.success('User created successfully');
      setNewName(''); 
      setNewEmail(''); 
      setNewPassword('');
      setShowCreateForm(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) { 
      toast.error('Failed to load users'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdate = async (id: number, role: string, is_active: boolean) => {
    try {
      await api.put(`/auth/users/${id}`, { role, is_active });
      toast.success('User updated');
      fetchUsers();
    } catch (error) { 
      toast.error('Update failed'); 
    }
  };

  const handleResetPassword = (id: number) => {
    setShowResetModal(id);
    setResetPassword('');
  };

  const confirmResetPassword = async () => {
    if (!showResetModal || !resetPassword || resetPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      await api.post(`/auth/users/${showResetModal}/reset-password`, { 
        newPassword: resetPassword 
      });
      toast.success('Password reset successfully');
      setShowResetModal(null);
      setResetPassword('');
    } catch (error) { 
      toast.error('Reset failed'); 
    } finally {
      setResetting(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    try {
      await api.put(`/auth/users/${editingUser.id}`, { 
        role: editingUser.role, 
        is_active: editingUser.is_active, 
        full_name: editingUser.full_name, 
        email: editingUser.email 
      });
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) { 
      toast.error('Failed to update user'); 
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { color: string; icon: string }> = {
      admin: { color: 'bg-red-100 text-red-800', icon: '👑' },
      accountant: { color: 'bg-blue-100 text-blue-800', icon: '📊' },
      hr_payroll: { color: 'bg-purple-100 text-purple-800', icon: '💵' },
      manager: { color: 'bg-green-100 text-green-800', icon: '📋' },
      auditor: { color: 'bg-yellow-100 text-yellow-800', icon: '🔍' },
    };
    return badges[role] || { color: 'bg-gray-100 text-gray-800', icon: '👤' };
  };

  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
            <p className="text-gray-500 mt-1 text-sm">Manage system users and roles</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                     active:bg-blue-800 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            {showCreateForm ? '✕ Close Form' : '+ Add New User'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Users</p>
          <p className="text-lg lg:text-2xl font-bold text-blue-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Active</p>
          <p className="text-lg lg:text-2xl font-bold text-green-600">{activeUsers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Inactive</p>
          <p className="text-lg lg:text-2xl font-bold text-red-600">{inactiveUsers}</p>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>👤</span>
            <span>Add New User</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <input 
              type="text" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              placeholder="Full Name" 
              className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <input 
              type="email" 
              value={newEmail} 
              onChange={e => setNewEmail(e.target.value)} 
              placeholder="Email Address" 
              className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              placeholder="Password (min 6 chars)" 
              className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <select 
              value={newRole} 
              onChange={e => setNewRole(e.target.value)} 
              className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       appearance-none bg-white"
            >
              <option value="accountant">📊 Accountant</option>
              <option value="hr_payroll">💵 HR/Payroll</option>
              <option value="manager">📋 Manager</option>
              <option value="auditor">🔍 Auditor</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCreateUser} 
              disabled={creating} 
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium
                       hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                '+ Create User'
              )}
            </button>
            <button 
              onClick={() => setShowCreateForm(false)} 
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                       hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">👥</span>
          <p className="text-gray-500 font-medium">No users found</p>
          <p className="text-gray-400 text-sm mt-1">Create your first user to get started</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
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
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const roleBadge = getRoleBadge(u.role);
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-800">{u.full_name}</td>
                      <td className="px-6 py-3 text-gray-600 text-xs">{u.email}</td>
                      <td className="px-6 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdate(u.id, e.target.value, u.is_active)}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-xs
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="admin">👑 Admin</option>
                          <option value="accountant">📊 Accountant</option>
                          <option value="hr_payroll">💵 HR/Payroll</option>
                          <option value="manager">📋 Manager</option>
                          <option value="auditor">🔍 Auditor</option>
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleUpdate(u.id, u.role, !u.is_active)}
                          className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                            u.is_active 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setEditingUser(u)} 
                            className="text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleResetPassword(u.id)} 
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            🔑 Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {users.map((u) => {
              const roleBadge = getRoleBadge(u.role);
              return (
                <div
                  key={u.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          roleBadge.color.split(' ')[0]
                        }`}>
                          {roleBadge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">{u.full_name}</h4>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(u.id, u.role, !u.is_active);
                        }}
                        className={`px-2 py-1 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${
                          u.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${roleBadge.color}`}>
                        {roleBadge.icon} {u.role}
                      </span>
                    </div>

                    {/* Expandable Actions */}
                    {selectedUser?.id === u.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Role</span>
                          <select
                            value={u.role}
                            onChange={(e) => {
                              handleUpdate(u.id, e.target.value, u.is_active);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-xs"
                          >
                            <option value="admin">👑 Admin</option>
                            <option value="accountant">📊 Accountant</option>
                            <option value="hr_payroll">💵 HR/Payroll</option>
                            <option value="manager">📋 Manager</option>
                            <option value="auditor">🔍 Auditor</option>
                          </select>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingUser(u);
                            }}
                            className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium 
                                     hover:bg-green-100 transition-colors"
                          >
                            ✏️ Edit Details
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetPassword(u.id);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                                     hover:bg-blue-100 transition-colors"
                          >
                            🔑 Reset Password
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expand Indicator */}
                    <div className="flex justify-center mt-2">
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          selectedUser?.id === u.id ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Edit User</h3>
              <button 
                onClick={() => setEditingUser(null)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingUser.full_name} 
                  onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={editingUser.email} 
                  onChange={e => setEditingUser({...editingUser, email: e.target.value})} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleEditSave} 
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium
                           hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setEditingUser(null)} 
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                           hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowResetModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <span className="text-4xl mb-3 block">🔑</span>
              <h3 className="text-lg font-bold text-gray-800">Reset Password</h3>
              <p className="text-sm text-gray-500 mt-1">Enter a new password for this user</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={resetPassword} 
                  onChange={e => setResetPassword(e.target.value)} 
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowResetModal(null)} 
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                           hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmResetPassword} 
                  disabled={resetting || resetPassword.length < 6} 
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium
                           hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {resetting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagement;