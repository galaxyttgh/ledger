// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { getCurrentPeriod } from '../utils/period';

// interface Account {
//   id: number;
//   code: string;
//   name: string;
//   type: string;
// }

// const BudgetForm = () => {
//   const navigate = useNavigate();
//   const [accounts, setAccounts] = useState<Account[]>([]);
//   const [name, setName] = useState('');
// const [period, setPeriod] = useState(getCurrentPeriod());
//   const [lines, setLines] = useState<{ account_id: number; amount: string }[]>([
//     { account_id: 0, amount: '' },
//   ]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => { fetchAccounts(); }, []);

//   const fetchAccounts = async () => {
//     try {
//       const response = await api.get('/accounts');
//       setAccounts(response.data.filter((a: Account) => a.type === 'revenue' || a.type === 'expense'));
//     } catch (error) {
//       console.error('Failed to fetch accounts:', error);
//     }
//   };

//   const addLine = () => setLines([...lines, { account_id: 0, amount: '' }]);
  
//   const removeLine = (i: number) => {
//     if (lines.length <= 1) return;
//     setLines(lines.filter((_, idx) => idx !== i));
//   };

//   const updateLine = (i: number, field: string, value: string) => {
//     const updated = [...lines];
//     updated[i] = { ...updated[i], [field]: field === 'account_id' ? parseInt(value) || 0 : value };
//     setLines(updated);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       await api.post('/budgets', {
//         name,
//         period,
//         lines: lines.filter(l => l.account_id > 0 && parseFloat(l.amount) > 0).map(l => ({
//           account_id: l.account_id,
//           amount: parseFloat(l.amount),
//         })),
//       });
//       navigate('/budget');
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Failed to create budget');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const total = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

//   return (
//     <Layout>
//       <div className="max-w-2xl mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Create Budget</h2>
//             <p className="text-gray-500 mt-1">Set budget targets for accounts</p>
//           </div>
//           <button onClick={() => navigate('/budget')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">← Back</button>
//         </div>

//         {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

//         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name *</label>
//               <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Q3 Budget" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Period *</label>
//               <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
//             </div>
//           </div>

//           <div className="flex justify-between items-center mb-4">
//             <h4 className="font-semibold text-gray-700">Budget Lines</h4>
//             <button type="button" onClick={addLine} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Add Line</button>
//           </div>

//           {lines.map((line, i) => (
//             <div key={i} className="grid grid-cols-12 gap-2 mb-3 items-center">
//               <select
//                 value={line.account_id}
//                 onChange={(e) => updateLine(i, 'account_id', e.target.value)}
//                 className="col-span-7 px-2 py-2 border border-gray-300 rounded-lg text-sm"
//                 required
//               >
//                 <option value="">Select account...</option>
//                 {accounts.map((a) => (
//                   <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
//                 ))}
//               </select>
//               <input
//                 type="number"
//                 value={line.amount}
//                 onChange={(e) => updateLine(i, 'amount', e.target.value)}
//                 className="col-span-4 px-2 py-2 border border-gray-300 rounded-lg text-sm text-right"
//                 placeholder="Amount"
//                 step="0.01"
//                 min="0"
//                 required
//               />
//               <button type="button" onClick={() => removeLine(i)} className="col-span-1 text-red-500 hover:text-red-700 text-lg">×</button>
//             </div>
//           ))}

//           <div className="text-right text-sm font-medium mt-2 border-t pt-2">
//             Total Budget: ₦{total.toLocaleString()}
//           </div>

//           <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 mt-4">
//             {loading ? 'Saving...' : 'Save Budget'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default BudgetForm;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { getCurrentPeriod } from '../utils/period';
import toast from 'react-hot-toast';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
}

const BudgetForm = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState('');
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [lines, setLines] = useState<{ account_id: number; amount: string }[]>([
    { account_id: 0, amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
const [scenario, setScenario] = useState('base');

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data.filter((a: Account) => a.type === 'revenue' || a.type === 'expense'));
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const addLine = () => setLines([...lines, { account_id: 0, amount: '' }]);
  
  const removeLine = (i: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, idx) => idx !== i));
  };

  const updateLine = (i: number, field: string, value: string) => {
    const updated = [...lines];
    updated[i] = { ...updated[i], [field]: field === 'account_id' ? parseInt(value) || 0 : value };
    setLines(updated);
    // Clear line-specific errors
    if (errors[`line_${i}`]) {
      const newErrors = { ...errors };
      delete newErrors[`line_${i}`];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Budget name is required';
    if (!period.trim()) newErrors.period = 'Period is required';
    
    const validLines = lines.filter(l => l.account_id > 0 && parseFloat(l.amount) > 0);
    if (validLines.length === 0) {
      newErrors.lines = 'At least one budget line with account and amount is required';
    }
    
    // Check for duplicate accounts
    const accountIds = lines
      .filter(l => l.account_id > 0)
      .map(l => l.account_id);
    const duplicates = accountIds.filter((id, index) => accountIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      newErrors.duplicates = 'Duplicate accounts detected. Each account can only be used once.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/budgets', {
  name,
  period,
  scenario,
  lines: lines.filter(l => l.account_id > 0 && parseFloat(l.amount) > 0).map(l => ({
    account_id: l.account_id,
    amount: parseFloat(l.amount),
  })),
});
      toast.success('Budget created successfully!');
      navigate('/budget');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create budget');
      toast.error(err.response?.data?.error || 'Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasData = name || lines.some(l => l.account_id > 0 || l.amount);
    if (hasData) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/budget');
      }
    } else {
      navigate('/budget');
    }
  };

  const total = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
  const validLineCount = lines.filter(l => l.account_id > 0 && parseFloat(l.amount) > 0).length;

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = [];
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Create Budget</h2>
              <p className="text-gray-500 mt-1 text-sm">Set budget targets for accounts</p>
            </div>
            <button 
              onClick={handleCancel} 
              className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded-xl 
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              <span>←</span>
              <span>Back to Budget</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Budget Details */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-4">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Budget Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Budget Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }} 
                  placeholder="e.g., Q3 Budget 2026"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Period <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={period} 
                  onChange={(e) => {
                    setPeriod(e.target.value);
                    if (errors.period) setErrors({ ...errors, period: '' });
                  }} 
                  placeholder="e.g., JUL-2026"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.period 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  required 
                />
                {errors.period && (
                  <p className="mt-1 text-xs text-red-600">{errors.period}</p>
                )}
              </div>
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Scenario</label>
  <select value={scenario} onChange={(e) => setScenario(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
    <option value="base">Base (Expected)</option>
    <option value="optimistic">Optimistic (Best Case)</option>
    <option value="conservative">Conservative (Worst Case)</option>
  </select>
</div>
            </div>
          </div>

          {/* Budget Lines */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Budget Lines</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {validLineCount} line{validLineCount !== 1 ? 's' : ''} with amount
                </p>
              </div>
              <button 
                type="button" 
                onClick={addLine} 
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm 
                         hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
              >
                <span>+</span>
                <span>Add Line</span>
              </button>
            </div>

            {errors.lines && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {errors.lines}
              </div>
            )}

            {errors.duplicates && (
              <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                ⚠️ {errors.duplicates}
              </div>
            )}

            <div className="space-y-3">
              {lines.map((line, i) => {
                const selectedAccount = accounts.find(a => a.id === line.account_id);
                
                return (
                  <div 
                    key={i} 
                    className={`p-3 rounded-xl border transition-colors ${
                      line.account_id > 0 && parseFloat(line.amount) > 0 
                        ? 'border-blue-200 bg-blue-50/30' 
                        : 'border-gray-200 bg-gray-50/30'
                    }`}
                  >
                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Line {i + 1}</span>
                        {lines.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeLine(i)} 
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <select
                        value={line.account_id}
                        onChange={(e) => updateLine(i, 'account_id', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select account...</option>
                        {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                          <optgroup key={type} label={type.toUpperCase()}>
                            {typeAccounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.code} - {a.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₦</span>
                        <input
                          type="number"
                          value={line.amount}
                          onChange={(e) => updateLine(i, 'amount', e.target.value)}
                          className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm text-right
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
                      <select
                        value={line.account_id}
                        onChange={(e) => updateLine(i, 'account_id', e.target.value)}
                        className="col-span-7 px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select account...</option>
                        {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                          <optgroup key={type} label={type.toUpperCase()}>
                            {typeAccounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.code} - {a.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <div className="col-span-4 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₦</span>
                        <input
                          type="number"
                          value={line.amount}
                          onChange={(e) => updateLine(i, 'amount', e.target.value)}
                          className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-right
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {lines.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeLine(i)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove line"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Selected Account Info */}
                    {selectedAccount && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className={`px-1.5 py-0.5 rounded font-medium capitalize ${
                          selectedAccount.type === 'revenue' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedAccount.type}
                        </span>
                        <span className="text-gray-500">{selectedAccount.code}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Budget</span>
                <span className="text-lg font-bold text-gray-900">₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

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
                'Save Budget'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BudgetForm;