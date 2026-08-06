import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
          <p className="text-gray-500 mt-1 text-sm">Update your account password</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required minLength={6} />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ChangePassword;