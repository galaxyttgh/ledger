import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Asset {
  id: number;
  code: string;
  name: string;
  class_name: string;
  purchase_date: string;
  purchase_cost: number;
  current_value: number;
  salvage_value: number;
  status: string;
  location: string;
  branch_name: string;
}

const Assets = () => {
    const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [depreciating, setDepreciating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchAssets(); }, []);


  const handleDispose = async (id: number) => {
  const value = prompt('Disposal value (₦):');
  const reason = prompt('Reason for disposal:');
  if (!value) return;
  try {
    await api.post(`/assets/${id}/dispose`, {
      disposal_date: new Date().toISOString().split('T')[0],
      disposal_value: parseFloat(value),
      reason: reason || 'Disposed',
    });
    toast.success('Asset disposed');
    fetchAssets();
  } catch (err: any) {
    toast.error('Disposal failed');
  }
};

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepreciate = async () => {
    setDepreciating(true);
    try {
      const response = await api.post('/assets/depreciate');
      setMessage(`✅ ${response.data.message} — ₦${response.data.total_depreciation.toLocaleString()}`);
      fetchAssets();
    } catch (error) {
      setMessage('❌ Depreciation failed');
    } finally {
      setDepreciating(false);
    }
  };

  const totalCost = assets.reduce((sum, a) => sum + Number(a.purchase_cost), 0);
  const totalValue = assets.reduce((sum, a) => sum + Number(a.current_value), 0);

  const handleDelete = async (id: number) => {
  if (!confirm('Delete this asset?')) return;
  try {
    await api.delete(`/assets/${id}`);
    fetchAssets();
  } catch (err: any) {
    alert(err.response?.data?.error || 'Delete failed');
  }
};

  return (
    <Layout>
   <div className="mb-6 flex justify-between items-center">
  <div>
    <h2 className="text-2xl font-bold text-gray-800">Fixed Asset Register</h2>
    <p className="text-gray-500 mt-1">Track assets and depreciation</p>
  </div>
  <div className="flex gap-2">
    <button
      onClick={() => navigate('/assets/new')}
      className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
    >
      + Add Asset
    </button>
    <button
      onClick={handleDepreciate}
      disabled={depreciating}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50"
    >
      {depreciating ? 'Running...' : '🏭 Run Depreciation'}
    </button>
  </div>
</div>

      {message && <p className="mb-4 text-sm font-medium">{message}</p>}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500">Total Assets</p>
          <p className="text-2xl font-bold">{assets.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500">Total Cost</p>
          <p className="text-2xl font-bold text-blue-900">₦{totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500">Current Value</p>
          <p className="text-2xl font-bold text-green-900">₦{totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-blue-900">{asset.code}</td>
                  <td className="px-6 py-3">{asset.name}</td>
                  <td className="px-6 py-3 text-gray-600">{asset.class_name}</td>
                  <td className="px-6 py-3 text-gray-600">{new Date(asset.purchase_date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">₦{Number(asset.purchase_cost).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-medium">₦{Number(asset.current_value).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      asset.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{asset.location || asset.branch_name || '-'}</td>
                  <td className="px-6 py-3">
                     <button onClick={() => handleDispose(asset.id)} className="text-orange-600 hover:text-orange-800 text-sm mr-2">🏷️</button>
  <button onClick={() => handleDelete(asset.id)} className="text-red-600 hover:text-red-800 text-sm">🗑️</button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default Assets;