
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// interface AssetClass {
//   id: number;
//   name: string;
//   useful_life_years: number;
// }

// const AssetForm = () => {
//   const navigate = useNavigate();
//   const [classes, setClasses] = useState<AssetClass[]>([]);
//   const [name, setName] = useState('');
//   const [assetClassId, setAssetClassId] = useState('');
//   const [purchaseDate, setPurchaseDate] = useState('');
//   const [purchaseCost, setPurchaseCost] = useState('');
//   const [salvageValue, setSalvageValue] = useState('0');
//   const [location, setLocation] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => { fetchClasses(); }, []);

//   const fetchClasses = async () => {
//     try {
//       const response = await api.get('/assets/classes');
//       setClasses(response.data);
//     } catch (error) {
//       console.error('Failed to fetch classes:', error);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.post('/assets', {
//         name,
//         asset_class_id: parseInt(assetClassId),
//         purchase_date: purchaseDate,
//         purchase_cost: parseFloat(purchaseCost),
//         salvage_value: parseFloat(salvageValue) || 0,
//         location,
//       });
//       toast.success('Asset created successfully!');
//       navigate('/assets');
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed to create asset');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-lg mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Add Asset</h2>
//             <p className="text-gray-500 mt-1">Register a new fixed asset</p>
//           </div>
//           <button onClick={() => navigate('/assets')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">← Back</button>
//         </div>

//         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
//             <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Asset Class *</label>
//             <select value={assetClassId} onChange={(e) => setAssetClassId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
//               <option value="">Select class...</option>
//               {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.useful_life_years} years)</option>)}
//             </select>
//           </div>
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
//               <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
//               <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost (₦) *</label>
//               <input type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Salvage Value (₦)</label>
//               <input type="number" value={salvageValue} onChange={(e) => setSalvageValue(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
//             </div>
//           </div>
//           <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
//             {loading ? 'Saving...' : 'Save Asset'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default AssetForm;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/assets/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load asset classes');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Asset name is required';
    if (!assetClassId) newErrors.assetClassId = 'Please select an asset class';
    if (!purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!purchaseCost || parseFloat(purchaseCost) <= 0) newErrors.purchaseCost = 'Valid purchase cost is required';
    if (salvageValue && parseFloat(salvageValue) < 0) newErrors.salvageValue = 'Salvage value cannot be negative';
    if (salvageValue && parseFloat(salvageValue) >= parseFloat(purchaseCost)) {
      newErrors.salvageValue = 'Salvage value should be less than purchase cost';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/assets', {
        name: name.trim(),
        asset_class_id: parseInt(assetClassId),
        purchase_date: purchaseDate,
        purchase_cost: parseFloat(purchaseCost),
        salvage_value: parseFloat(salvageValue) || 0,
        location: location.trim(),
      });
      toast.success('Asset created successfully!');
      navigate('/assets');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (name || assetClassId || purchaseDate || purchaseCost || location) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/assets');
      }
    } else {
      navigate('/assets');
    }
  };

  const selectedClass = classes.find(c => c.id === parseInt(assetClassId));

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Add Asset</h2>
              <p className="text-gray-500 mt-1 text-sm">Register a new fixed asset</p>
            </div>
            <button 
              onClick={handleCancel} 
              className="inline-flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 rounded-xl 
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              <span>←</span>
              <span>Back to Assets</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          {/* Asset Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Asset Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }} 
              placeholder="e.g., Toyota Hilux 2024"
              className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                ${errors.name 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              required 
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Asset Class */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Asset Class <span className="text-red-500">*</span>
            </label>
            <select 
              value={assetClassId} 
              onChange={(e) => {
                setAssetClassId(e.target.value);
                if (errors.assetClassId) setErrors({ ...errors, assetClassId: '' });
              }} 
              className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors appearance-none
                ${errors.assetClassId 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white`}
              required
            >
              <option value="">Select asset class...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.useful_life_years} years)
                </option>
              ))}
            </select>
            {errors.assetClassId && (
              <p className="mt-1 text-xs text-red-600">{errors.assetClassId}</p>
            )}
            {selectedClass && (
              <p className="mt-1 text-xs text-blue-600">
                📅 Useful life: {selectedClass.useful_life_years} years
              </p>
            )}
          </div>

          {/* Purchase Date & Location - Stack on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={purchaseDate} 
                onChange={(e) => {
                  setPurchaseDate(e.target.value);
                  if (errors.purchaseDate) setErrors({ ...errors, purchaseDate: '' });
                }} 
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.purchaseDate 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required 
              />
              {errors.purchaseDate && (
                <p className="mt-1 text-xs text-red-600">{errors.purchaseDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Location
              </label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g., Main Office"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-50
                         transition-colors" 
              />
            </div>
          </div>

          {/* Purchase Cost & Salvage Value - Stack on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Purchase Cost (₦) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₦</span>
                <input 
                  type="number" 
                  value={purchaseCost} 
                  onChange={(e) => {
                    setPurchaseCost(e.target.value);
                    if (errors.purchaseCost) setErrors({ ...errors, purchaseCost: '' });
                  }} 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-7 pr-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.purchaseCost 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  required 
                />
              </div>
              {errors.purchaseCost && (
                <p className="mt-1 text-xs text-red-600">{errors.purchaseCost}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Salvage Value (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₦</span>
                <input 
                  type="number" 
                  value={salvageValue} 
                  onChange={(e) => {
                    setSalvageValue(e.target.value);
                    if (errors.salvageValue) setErrors({ ...errors, salvageValue: '' });
                  }} 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-7 pr-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.salvageValue 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                />
              </div>
              {errors.salvageValue && (
                <p className="mt-1 text-xs text-red-600">{errors.salvageValue}</p>
              )}
            </div>
          </div>

          {/* Depreciation Preview */}
          {purchaseCost && salvageValue && selectedClass && parseFloat(purchaseCost) > 0 && (
            <div className="mb-6 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs font-medium text-blue-900 mb-2">📊 Depreciation Preview</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-blue-700">Depreciable Amount</p>
                  <p className="font-semibold text-blue-900">
                    ₦{(parseFloat(purchaseCost) - parseFloat(salvageValue || '0')).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Annual Depreciation</p>
                  <p className="font-semibold text-blue-900">
                    ₦{((parseFloat(purchaseCost) - parseFloat(salvageValue || '0')) / selectedClass.useful_life_years).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                       hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium
                       order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold 
                       hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors text-sm order-1 sm:order-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Asset'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AssetForm;