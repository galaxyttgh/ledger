// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface TaxRate {
//   id: number;
//   name: string;
//   rate: number;
// }

// const TaxRates = () => {
//   const [rates, setRates] = useState<TaxRate[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState('');

//   useEffect(() => { fetchRates(); }, []);

//   const fetchRates = async () => {
//     try {
//       const response = await api.get('/tax-rates');
//       setRates(response.data);
//     } catch (error) {
//       console.error('Failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateRate = async (id: number, newRate: number) => {
//     try {
//       await api.put(`/tax-rates/${id}`, { rate: newRate });
//       setMessage('✅ Rate updated');
//       fetchRates();
//     } catch (error) {
//       setMessage('❌ Failed');
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Tax Rate Configuration</h2>
//         <p className="text-gray-500 mt-1">Manage tax rates used across the system</p>
//       </div>

//       {message && <p className="mb-4 text-sm font-medium">{message}</p>}

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-lg">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left">Tax</th>
//                 <th className="px-6 py-3 text-right">Current Rate</th>
//                 <th className="px-6 py-3 text-right">New Rate</th>
//                 <th className="px-6 py-3 text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {rates.map((tax) => (
//                 <tr key={tax.id}>
//                   <td className="px-6 py-3 font-medium">{tax.name}</td>
//                   <td className="px-6 py-3 text-right">{tax.rate}%</td>
//                   <td className="px-6 py-3 text-right">
//                     <input
//                       type="number"
//                       defaultValue={tax.rate}
//                       id={`rate-${tax.id}`}
//                       className="w-20 px-2 py-1 border rounded text-right text-sm"
//                       step="0.1"
//                       min="0"
//                     />
//                   </td>
//                   <td className="px-6 py-3 text-center">
//                     <button
//                       onClick={() => {
//                         const input = document.getElementById(`rate-${tax.id}`) as HTMLInputElement;
//                         updateRate(tax.id, parseFloat(input.value));
//                       }}
//                       className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
//                     >
//                       Update
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default TaxRates;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface TaxRate {
  id: number;
  name: string;
  rate: number;
  description?: string;
  is_active: boolean;
}

const TaxRates = () => {
  const [rates, setRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingRate, setEditingRate] = useState<{ id: number; rate: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => { fetchRates(); }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchRates = async () => {
    try {
      const response = await api.get('/tax-rates');
      setRates(response.data);
    } catch (error) {
      console.error('Failed:', error);
      toast.error('Failed to load tax rates');
    } finally {
      setLoading(false);
    }
  };

  const updateRate = async (id: number, newRate: number) => {
    if (isNaN(newRate) || newRate < 0 || newRate > 100) {
      toast.error('Rate must be between 0 and 100');
      return;
    }

    setUpdatingId(id);
    try {
      await api.put(`/tax-rates/${id}`, { rate: newRate });
      setMessage('✅ Rate updated successfully');
      toast.success('Tax rate updated');
      setEditingRate(null);
      fetchRates();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to update rate';
      setMessage('❌ ' + errorMsg);
      toast.error(errorMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditClick = (tax: TaxRate) => {
    setEditingRate({ id: tax.id, rate: tax.rate.toString() });
  };

  const handleCancelEdit = () => {
    setEditingRate(null);
  };

  const getTaxIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('vat')) return '🧾';
    if (nameLower.includes('withholding') || nameLower.includes('wht')) return '📋';
    if (nameLower.includes('sales')) return '🏪';
    if (nameLower.includes('service')) return '🔧';
    return '💰';
  };

  const getTaxColor = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('vat')) return 'bg-blue-100 text-blue-800';
    if (nameLower.includes('withholding') || nameLower.includes('wht')) return 'bg-purple-100 text-purple-800';
    if (nameLower.includes('sales')) return 'bg-green-100 text-green-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tax Rate Configuration</h2>
        <p className="text-gray-500 mt-1 text-sm">Manage tax rates used across the system</p>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          message.startsWith('✅') 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : rates.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
            <span className="text-4xl mb-3 block">📊</span>
            <p className="text-gray-500 font-medium">No tax rates configured</p>
            <p className="text-gray-400 text-sm mt-1">Tax rates will appear here once added</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden max-w-2xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tax</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Current Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">New Rate</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rates.map((tax) => (
                  <tr key={tax.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${getTaxColor(tax.name)}`}>
                          {getTaxIcon(tax.name)}
                        </span>
                        <span className="font-medium text-gray-800">{tax.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-lg font-bold text-gray-800">{tax.rate}%</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {editingRate?.id === tax.id ? (
                        <input
                          type="number"
                          value={editingRate.rate}
                          onChange={(e) => setEditingRate({ ...editingRate, rate: e.target.value })}
                          className="w-24 px-3 py-2 border border-blue-300 rounded-lg text-right text-sm
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                          step="0.1"
                          min="0"
                          max="100"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {editingRate?.id === tax.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateRate(tax.id, parseFloat(editingRate.rate))}
                            disabled={updatingId === tax.id}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium
                                     hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {updatingId === tax.id ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium
                                     hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(tax)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium
                                   hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {rates.map((tax) => (
              <div key={tax.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getTaxColor(tax.name)}`}>
                      {getTaxIcon(tax.name)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{tax.name}</h4>
                      <p className="text-xs text-gray-500">Current rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{tax.rate}%</p>
                  </div>
                </div>

                {editingRate?.id === tax.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">New Rate (%)</label>
                      <input
                        type="number"
                        value={editingRate.rate}
                        onChange={(e) => setEditingRate({ ...editingRate, rate: e.target.value })}
                        className="w-full px-3 py-2.5 border border-blue-300 rounded-xl text-sm text-right
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.1"
                        min="0"
                        max="100"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateRate(tax.id, parseFloat(editingRate.rate))}
                        disabled={updatingId === tax.id}
                        className="flex-1 px-3 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium
                                 hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {updatingId === tax.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                                 hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditClick(tax)}
                    className="w-full px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium
                             hover:bg-blue-100 transition-colors"
                  >
                    ✏️ Edit Rate
                  </button>
                )}

                {editingRate?.id === tax.id && editingRate.rate !== tax.rate.toString() && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      Changing from <span className="font-bold">{tax.rate}%</span> to{' '}
                      <span className="font-bold">{editingRate.rate}%</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default TaxRates;