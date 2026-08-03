
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
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDisposeModal, setShowDisposeModal] = useState(false);
  const [disposeAssetId, setDisposeAssetId] = useState<number | null>(null);
  const [disposalValue, setDisposalValue] = useState('');
  const [disposalReason, setDisposalReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disposed'>('all');

  useEffect(() => { fetchAssets(); }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDispose = async (id: number) => {
    setDisposeAssetId(id);
    setDisposalValue('');
    setDisposalReason('');
    setShowDisposeModal(true);
  };

  const confirmDispose = async () => {
    if (!disposeAssetId || !disposalValue) {
      toast.error('Please enter disposal value');
      return;
    }
    
    try {
      await api.post(`/assets/${disposeAssetId}/dispose`, {
        disposal_date: new Date().toISOString().split('T')[0],
        disposal_value: parseFloat(disposalValue),
        reason: disposalReason || 'Disposed',
      });
      toast.success('Asset disposed successfully');
      setShowDisposeModal(false);
      setDisposeAssetId(null);
      fetchAssets();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Disposal failed');
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleDepreciate = async () => {
    setDepreciating(true);
    setMessage('');
    try {
      const response = await api.post('/assets/depreciate');
      setMessage(`✅ ${response.data.message} — ₦${response.data.total_depreciation.toLocaleString()}`);
      fetchAssets();
    } catch (error: any) {
      setMessage('❌ Depreciation failed');
      toast.error(error.response?.data?.error || 'Depreciation failed');
    } finally {
      setDepreciating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/assets/${id}`);
      toast.success('Asset deleted successfully');
      fetchAssets();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (filterStatus === 'all') return true;
    return asset.status === filterStatus;
  });

  const totalCost = filteredAssets.reduce((sum, a) => sum + Number(a.purchase_cost), 0);
  const totalValue = filteredAssets.reduce((sum, a) => sum + Number(a.current_value), 0);
  const activeCount = assets.filter(a => a.status === 'active').length;
  const disposedCount = assets.filter(a => a.status === 'disposed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', icon: '🟢' };
      case 'disposed':
        return { color: 'bg-gray-100 text-gray-800', icon: '🗑️' };
      default:
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    }
  };

  const handleTransfer = async (id: number) => {
  const branchId = prompt('Enter destination branch ID (1=HQ, 2=Lagos, 3=Abuja):');
  if (!branchId) return;
  try {
    await api.post(`/assets/${id}/transfer`, { to_branch_id: parseInt(branchId), transfer_date: new Date().toISOString().split('T')[0], notes: 'Transferred' });
    toast.success('Asset transferred');
    fetchAssets();
  } catch (err: any) {
    toast.error('Transfer failed');
  }
};

const handleImpair = async (id: number) => {
  const amount = prompt('Impairment amount (₦):');
  const reason = prompt('Reason:');
  if (!amount) return;
  try {
    await api.post(`/assets/${id}/impair`, { impairment_amount: parseFloat(amount), reason });
    toast.success('Asset impaired');
    fetchAssets();
  } catch (err: any) {
    toast.error('Impairment failed');
  }
};

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Fixed Asset Register</h2>
            <p className="text-gray-500 mt-1 text-sm">Track assets and depreciation</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/assets/new')}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       active:bg-blue-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              + Add Asset
            </button>
            <button
              onClick={handleDepreciate}
              disabled={depreciating}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 
                       active:bg-purple-800 transition-colors text-sm font-medium 
                       disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {depreciating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running...
                </span>
              ) : (
                '🏭 Run Depreciation'
              )}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-medium text-blue-800 animate-fadeIn">
          {message}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'all' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
        >
          <p className="text-xs text-gray-500 mb-1">Total Assets</p>
          <p className="text-xl lg:text-2xl font-bold text-blue-900">{assets.length}</p>
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'active' ? 'ring-2 ring-green-500 shadow-md' : ''
          }`}
        >
          <p className="text-xs text-gray-500 mb-1">Active</p>
          <p className="text-xl lg:text-2xl font-bold text-green-900">{activeCount}</p>
        </button>
        <button
          onClick={() => setFilterStatus('disposed')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'disposed' ? 'ring-2 ring-gray-500 shadow-md' : ''
          }`}
        >
          <p className="text-xs text-gray-500 mb-1">Disposed</p>
          <p className="text-xl lg:text-2xl font-bold text-gray-900">{disposedCount}</p>
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Cost</p>
          <p className="text-lg lg:text-xl font-bold text-blue-900">
            ₦{totalCost.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Current Value</p>
          <p className="text-lg lg:text-xl font-bold text-green-900">
            ₦{totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Asset List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 lg:p-6">
            {/* Loading Skeleton */}
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
        ) : filteredAssets.length === 0 ? (
          <div className="p-8 lg:p-12 text-center">
            <span className="text-4xl mb-3 block">📦</span>
            <p className="text-gray-500 font-medium">No assets found</p>
            {filterStatus !== 'all' && (
              <button 
                onClick={() => setFilterStatus('all')}
                className="mt-2 text-blue-600 text-sm font-medium hover:underline"
              >
                Show all assets
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View - Optimized for no horizontal scroll */}
            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-[80px]">Code</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name/Class</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-[100px]">Date</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase w-[120px]">Cost</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase w-[120px]">Value</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-[90px]">Status</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAssets.map((asset) => {
                    const statusBadge = getStatusBadge(asset.status);
                    const depreciationPercent = ((Number(asset.purchase_cost) - Number(asset.current_value)) / Number(asset.purchase_cost)) * 100;
                    
                    return (
                      <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3">
                          <span className="font-medium text-blue-900 text-xs">{asset.code}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{asset.name}</p>
                            <p className="text-xs text-gray-500">{asset.class_name} • {asset.location || asset.branch_name || '-'}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {new Date(asset.purchase_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <p className="text-sm font-medium">₦{Number(asset.purchase_cost).toLocaleString()}</p>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div>
                            <p className="text-sm font-medium text-green-700">₦{Number(asset.current_value).toLocaleString()}</p>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(depreciationPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${statusBadge.color}`}>
                              {asset.status}
                            </span>
                          </div>
                        </td>
                        {/* <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {asset.status === 'active' && (
                              <button 
                                onClick={() => handleDispose(asset.id)} 
                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Dispose asset"
                              >
                                🏷️
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(asset.id)} 
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete asset"
                            >
                              🗑️
                            </button>
                          </div>
                        </td> */}
                        <td className="px-3 py-3">
  <div className="flex items-center justify-center gap-1">
    {asset.status === 'active' && (
      <>
        <button 
          onClick={() => handleTransfer(asset.id)} 
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Transfer asset"
        >
          📦
        </button>
        <button 
          onClick={() => handleImpair(asset.id)} 
          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
          title="Impair asset"
        >
          ⚠️
        </button>
        <button 
          onClick={() => handleDispose(asset.id)} 
          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Dispose asset"
        >
          🏷️
        </button>
      </>
    )}
    <button 
      onClick={() => handleDelete(asset.id)} 
      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete asset"
    >
      🗑️
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
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredAssets.map((asset) => {
                const statusBadge = getStatusBadge(asset.status);
                const depreciationPercent = ((Number(asset.purchase_cost) - Number(asset.current_value)) / Number(asset.purchase_cost)) * 100;
                
                return (
                  <div 
                    key={asset.id} 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          asset.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          🏗️
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">{asset.name}</h4>
                          <p className="text-xs text-blue-600 font-medium">{asset.code}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${statusBadge.color}`}>
                        {statusBadge.icon} {asset.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Cost</p>
                        <p className="font-semibold text-gray-800">
                          ₦{Number(asset.purchase_cost).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current Value</p>
                        <p className="font-semibold text-green-700">
                          ₦{Number(asset.current_value).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Depreciation Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(depreciationPercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {depreciationPercent.toFixed(1)}% depreciated
                    </p>

                    {/* Expandable Details */}
                    {selectedAsset?.id === asset.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-fadeIn">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Class</span>
                          <span className="font-medium">{asset.class_name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Purchase Date</span>
                          <span className="font-medium">
                            {new Date(asset.purchase_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Salvage Value</span>
                          <span className="font-medium">
                            ₦{Number(asset.salvage_value).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Location</span>
                          <span className="font-medium">
                            {asset.location || asset.branch_name || '-'}
                          </span>
                        </div>
                        
                        {/* <div className="flex gap-2 pt-2">
                          {asset.status === 'active' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDispose(asset.id);
                              }}
                              className="flex-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium 
                                       hover:bg-orange-100 transition-colors"
                            >
                              🏷️ Dispose
                            </button>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(asset.id);
                            }}
                            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium 
                                     hover:bg-red-100 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div> */}
                        <div className="flex gap-2 pt-2">
  {asset.status === 'active' && (
    <>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleTransfer(asset.id);
        }}
        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
      >
        📦 Transfer
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleImpair(asset.id);
        }}
        className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
      >
        ⚠️ Impair
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleDispose(asset.id);
        }}
        className="flex-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
      >
        🏷️ Dispose
      </button>
    </>
  )}
  <button 
    onClick={(e) => {
      e.stopPropagation();
      handleDelete(asset.id);
    }}
    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
  >
    🗑️ Delete
  </button>
</div>
                      </div>
                    )}

                    {/* Expand Indicator */}
                    <div className="flex justify-center mt-2">
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          selectedAsset?.id === asset.id ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Results Count */}
      {!loading && filteredAssets.length > 0 && (
        <div className="mt-4 text-center lg:text-left">
          <p className="text-sm text-gray-500">
            Showing {filteredAssets.length} of {assets.length} assets
            {filterStatus !== 'all' && (
              <button 
                onClick={() => setFilterStatus('all')}
                className="ml-2 text-blue-600 hover:underline font-medium"
              >
                Clear filter
              </button>
            )}
          </p>
        </div>
      )}

      {/* Dispose Modal */}
      {showDisposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDisposeModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Dispose Asset</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disposal Value (₦) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₦</span>
                  <input
                    type="number"
                    value={disposalValue}
                    onChange={(e) => setDisposalValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={disposalReason}
                  onChange={(e) => setDisposalReason(e.target.value)}
                  placeholder="e.g., Sold, Damaged, Obsolete"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDisposeModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                         hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDispose}
                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 
                         transition-colors text-sm font-medium"
              >
                Confirm Dispose
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Assets;