import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

interface AssetClass {
  id: number;
  name: string;
  useful_life_years: number;
}

const AssetForm = () => {
     const navigate = useNavigate(); 
  const [classes, setClasses] = useState<AssetClass[]>([]);
  const [name, setName] = useState('');
  const [assetClassId, setAssetClassId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [salvageValue, setSalvageValue] = useState('0');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/assets/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/assets', {
        name,
        asset_class_id: parseInt(assetClassId),
        purchase_date: purchaseDate,
        purchase_cost: parseFloat(purchaseCost),
        salvage_value: parseFloat(salvageValue) || 0,
        location,
      });
      navigate('/assets');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add Asset</h2>
            <p className="text-gray-500 mt-1">Register a new fixed asset</p>
          </div>
          <button onClick={() => navigate('/assets')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">← Back</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Toyota Corolla 2024" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Class *</label>
            <select value={assetClassId} onChange={(e) => setAssetClassId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              <option value="">Select class...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.useful_life_years} years)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Head Office" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost (₦) *</label>
              <input type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salvage Value (₦)</label>
              <input type="number" value={salvageValue} onChange={(e) => setSalvageValue(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01" min="0" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Asset'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AssetForm;