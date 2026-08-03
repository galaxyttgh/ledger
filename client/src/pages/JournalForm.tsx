// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';
// import Breadcrumb from '../components/Breadcrumb';
// import { getCurrentPeriod } from '../utils/period';

// interface Account {
//   id: number;
//   code: string;
//   name: string;
//   type: string;
// }

// interface JournalLine {
//   account_id: number;
//   description: string;
//   debit: number;
//   credit: number;
// }

// const JournalForm = () => {
//   const navigate = useNavigate();
//   const [accounts, setAccounts] = useState<Account[]>([]);
//   const [description, setDescription] = useState('');
//   const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
 
//   const [period, setPeriod] = useState(getCurrentPeriod());
//   const [lines, setLines] = useState<JournalLine[]>([
//     { account_id: 0, description: '', debit: 0, credit: 0 },
//     { account_id: 0, description: '', debit: 0, credit: 0 },
//   ]);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
// const [branches, setBranches] = useState<any[]>([]);
// const [branchId, setBranchId] = useState('');

// useEffect(() => {
//   fetchAccounts();
//   fetchBranches();
// }, []);

// const fetchBranches = async () => {
//   try {
//     const response = await api.get('/branches');
//     setBranches(response.data);
//   } catch (error) {
//     console.error('Failed to fetch branches:', error);
//   }
// };
//   useEffect(() => {
//     fetchAccounts();
//   }, []);

//   const fetchAccounts = async () => {
//     try {
//       const response = await api.get('/accounts');
//       setAccounts(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch accounts');
//       console.error('Failed to fetch accounts:', error);
//     }
//   };

//   const addLine = () => {
//     setLines([...lines, { account_id: 0, description: '', debit: 0, credit: 0 }]);
//   };

//   const removeLine = (index: number) => {
//     if (lines.length <= 2) return;
//     setLines(lines.filter((_, i) => i !== index));
//   };

//   const updateLine = (index: number, field: keyof JournalLine, value: string | number) => {
//     const updated = lines.map((line, i) => {
//       if (i !== index) return line;
      
//       if (field === 'debit' || field === 'credit') {
//         const numValue = parseFloat(value as string) || 0;
//         return {
//           ...line,
//           [field]: numValue,
//           // Auto-clear the other field when one is filled
//           ...(field === 'debit' ? { credit: 0 } : { debit: 0 }),
//         };
//       }
      
//       return { ...line, [field]: value };
//     });
//     setLines(updated);
//   };

//   const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
//   const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
//   const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
//   const difference = totalDebit - totalCredit;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!isBalanced) {
//       setError(`Journal is not balanced. Difference: ₦${difference.toLocaleString()}`);
//       return;
//     }

//     if (totalDebit === 0 && totalCredit === 0) {
//       setError('Journal must have at least one amount');
//       return;
//     }

//     setLoading(true);

//     try {
//      await api.post('/journals', {
//   description,
//   entry_date: entryDate,
//   period,
//   branch_id: branchId ? parseInt(branchId) : null,
//   lines: lines.filter(l => l.account_id > 0 && (l.debit > 0 || l.credit > 0)),
// });
//       navigate('/general-ledger');
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed to create journal entry');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-4xl mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">New Journal Entry</h2>
//             <p className="text-gray-500 mt-1">Create a double-entry journal</p>
//           </div>
//           <button
//             onClick={() => navigate('/general-ledger')}
//             className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//           >
//             ← Back
//           </button>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                 <input
//                   type="date"
//                   value={entryDate}
//                   onChange={(e) => setEntryDate(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
//                 <input
//                   type="text"
//                   value={period}
//                   onChange={(e) => setPeriod(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//   <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
//   <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
//     <option value="">All Branches</option>
//     {branches.map((b: any) => (
//       <option key={b.id} value={b.id}>{b.name}</option>
//     ))}
//   </select>
// </div>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//               <input
//                 type="text"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter journal description"
//                 required
//               />
//             </div>
//           </div>

//           {/* Journal Lines */}
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-700">Journal Lines</h3>
//               <button
//                 type="button"
//                 onClick={addLine}
//                 className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
//               >
//                 + Add Line
//               </button>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b">
//                     <th className="px-3 py-2 text-left text-gray-500 w-1/3">Account</th>
//                     <th className="px-3 py-2 text-left text-gray-500">Description</th>
//                     <th className="px-3 py-2 text-right text-gray-500 w-1/6">Debit (₦)</th>
//                     <th className="px-3 py-2 text-right text-gray-500 w-1/6">Credit (₦)</th>
//                     <th className="px-3 py-2 text-center text-gray-500 w-16"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {lines.map((line, index) => (
//                     <tr key={index} className="border-b">
//                       <td className="px-3 py-2">
//                         <select
//                           value={line.account_id}
//                           onChange={(e) => updateLine(index, 'account_id', parseInt(e.target.value))}
//                           className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                           required
//                         >
//                           <option value="">Select account...</option>
//                           {accounts.map((acc) => (
//                             <option key={acc.id} value={acc.id}>
//                               {acc.code} - {acc.name}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className="px-3 py-2">
//                         <input
//                           type="text"
//                           value={line.description}
//                           onChange={(e) => updateLine(index, 'description', e.target.value)}
//                           className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                           placeholder="Line description"
//                         />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input
//                           type="number"
//                           value={line.debit || ''}
//                           onChange={(e) => updateLine(index, 'debit', e.target.value)}
//                           className="w-full px-2 py-2 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
//                           placeholder="0.00"
//                           step="0.01"
//                           min="0"
//                         />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input
//                           type="number"
//                           value={line.credit || ''}
//                           onChange={(e) => updateLine(index, 'credit', e.target.value)}
//                           className="w-full px-2 py-2 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
//                           placeholder="0.00"
//                           step="0.01"
//                           min="0"
//                         />
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         <button
//                           type="button"
//                           onClick={() => removeLine(index)}
//                           className="text-red-500 hover:text-red-700 text-lg"
//                           title="Remove line"
//                         >
//                           ×
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot>
//                   <tr className="bg-gray-50 font-medium">
//                     <td colSpan={2} className="px-3 py-3 text-right">Totals:</td>
//                     <td className="px-3 py-3 text-right">₦{totalDebit.toLocaleString()}</td>
//                     <td className="px-3 py-3 text-right">₦{totalCredit.toLocaleString()}</td>
//                     <td></td>
//                   </tr>
//                   <tr className="text-sm">
//                     <td colSpan={2} className="px-3 py-1 text-right text-gray-500">Difference:</td>
//                     <td colSpan={2} className={`px-3 py-1 text-right ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
//                       ₦{Math.abs(difference).toLocaleString()} {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
//                     </td>
//                     <td></td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading || !isBalanced}
//             className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
//           >
//             {loading ? 'Posting...' : 'Post Journal Entry'}
//           </button>
//         </form>
//       </div>
//       <Breadcrumb items={[
//   { label: 'Dashboard', path: '/dashboard' },
//   { label: 'General Ledger', path: '/general-ledger' },
//   { label: 'New Journal Entry' },
// ]} />
//     </Layout>
//   );
// };

// export default JournalForm;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';
import { getCurrentPeriod } from '../utils/period';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
}

interface JournalLine {
  account_id: number;
  description: string;
  debit: number;
  credit: number;
}

const JournalForm = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [description, setDescription] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [lines, setLines] = useState<JournalLine[]>([
    { account_id: 0, description: '', debit: 0, credit: 0 },
    { account_id: 0, description: '', debit: 0, credit: 0 },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAccounts();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      toast.error('Failed to load branches');
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      toast.error('Failed to fetch accounts');
      console.error('Failed to fetch accounts:', error);
    }
  };

  const addLine = () => {
    setLines([...lines, { account_id: 0, description: '', debit: 0, credit: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof JournalLine, value: string | number) => {
    const updated = lines.map((line, i) => {
      if (i !== index) return line;
      
      if (field === 'debit' || field === 'credit') {
        const numValue = parseFloat(value as string) || 0;
        return {
          ...line,
          [field]: numValue,
          ...(field === 'debit' ? { credit: 0 } : { debit: 0 }),
        };
      }
      
      return { ...line, [field]: value };
    });
    setLines(updated);
  };

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
  const difference = totalDebit - totalCredit;
  const validLines = lines.filter(l => l.account_id > 0 && (l.debit > 0 || l.credit > 0)).length;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!entryDate) newErrors.entryDate = 'Date is required';
    if (!period.trim()) newErrors.period = 'Period is required';
    if (validLines < 2) newErrors.lines = 'At least 2 valid lines are required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && isBalanced;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isBalanced) {
      setError(`Journal is not balanced. Difference: ₦${Math.abs(difference).toLocaleString()}`);
      toast.error('Journal is not balanced');
      return;
    }

    if (totalDebit === 0 && totalCredit === 0) {
      setError('Journal must have at least one amount');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);

    try {
      await api.post('/journals', {
        description: description.trim(),
        entry_date: entryDate,
        period,
        branch_id: branchId ? parseInt(branchId) : null,
        lines: lines.filter(l => l.account_id > 0 && (l.debit > 0 || l.credit > 0)),
      });
      toast.success('Journal entry posted successfully!');
      navigate('/general-ledger');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasData = description || lines.some(l => l.account_id > 0 || l.debit > 0 || l.credit > 0);
    if (hasData) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/general-ledger');
      }
    } else {
      navigate('/general-ledger');
    }
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = [];
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">New Journal Entry</h2>
              <p className="text-gray-500 mt-1 text-sm">Create a double-entry journal</p>
            </div>
            <button
              onClick={handleCancel}
              className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded-xl 
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              <span>←</span>
              <span>Back to Ledger</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header Details */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Journal Details</h3>
            
            {/* Stack on mobile, 3 columns on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => {
                    setEntryDate(e.target.value);
                    if (errors.entryDate) setErrors({ ...errors, entryDate: '' });
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.entryDate 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  required
                />
                {errors.entryDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.entryDate}</p>
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
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  required
                />
                {errors.period && (
                  <p className="mt-1 text-xs text-red-600">{errors.period}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Branch
                </label>
                <select 
                  value={branchId} 
                  onChange={(e) => setBranchId(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           appearance-none bg-white"
                >
                  <option value="">All Branches</option>
                  {branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                placeholder="Enter journal description"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.description 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Journal Lines */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Journal Lines</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {validLines} valid line{validLines !== 1 ? 's' : ''}
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

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-gray-500 w-1/3">Account</th>
                    <th className="px-3 py-2 text-left text-gray-500">Description</th>
                    <th className="px-3 py-2 text-right text-gray-500 w-[120px]">Debit (₦)</th>
                    <th className="px-3 py-2 text-right text-gray-500 w-[120px]">Credit (₦)</th>
                    <th className="px-3 py-2 text-center text-gray-500 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <select
                          value={line.account_id}
                          onChange={(e) => updateLine(index, 'account_id', parseInt(e.target.value))}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm
                                   focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select account...</option>
                          {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                            <optgroup key={type} label={type.toUpperCase()}>
                              {typeAccounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                  {acc.code} - {acc.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm
                                   focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Line description"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={line.debit || ''}
                          onChange={(e) => updateLine(index, 'debit', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-right
                                   focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={line.credit || ''}
                          onChange={(e) => updateLine(index, 'credit', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-right
                                   focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove line"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan={2} className="px-3 py-3 text-right">Totals:</td>
                    <td className="px-3 py-3 text-right text-green-600">₦{totalDebit.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-red-600">₦{totalCredit.toLocaleString()}</td>
                    <td></td>
                  </tr>
                  <tr className="text-sm">
                    <td colSpan={2} className="px-3 py-1 text-right text-gray-500">Difference:</td>
                    <td colSpan={2} className={`px-3 py-1 text-right font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      ₦{Math.abs(difference).toLocaleString()} {isBalanced ? '✓' : '✗'}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {lines.map((line, index) => {
                const selectedAccount = accounts.find(a => a.id === line.account_id);
                return (
                  <div key={index} className={`p-3 rounded-xl border ${
                    line.account_id > 0 ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">Line {index + 1}</span>
                      {lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    <select
                      value={line.account_id}
                      onChange={(e) => updateLine(index, 'account_id', parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm mb-2
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select account...</option>
                      {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                        <optgroup key={type} label={type.toUpperCase()}>
                          {typeAccounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    
                    {selectedAccount && (
                      <p className="text-xs text-blue-600 mb-2">
                        {selectedAccount.code} • {selectedAccount.type}
                      </p>
                    )}
                    
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(index, 'description', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm mb-2
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Line description"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Debit (₦)</label>
                        <input
                          type="number"
                          value={line.debit || ''}
                          onChange={(e) => updateLine(index, 'debit', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-right
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Credit (₦)</label>
                        <input
                          type="number"
                          value={line.credit || ''}
                          onChange={(e) => updateLine(index, 'credit', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-right
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Balance Summary - Mobile */}
            <div className="sm:hidden mt-4 p-3 bg-gray-50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Debit</span>
                <span className="font-bold text-green-600">₦{totalDebit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Credit</span>
                <span className="font-bold text-red-600">₦{totalCredit.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between text-sm pt-2 border-t font-bold ${
                isBalanced ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>Difference</span>
                <span>₦{Math.abs(difference).toLocaleString()} {isBalanced ? '✓' : '✗'}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isBalanced}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold 
                     hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-colors text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Posting...
              </span>
            ) : (
              'Post Journal Entry'
            )}
          </button>
        </form>
      </div>
      <Breadcrumb items={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'General Ledger', path: '/general-ledger' },
        { label: 'New Journal Entry' },
      ]} />
    </Layout>
  );
};

export default JournalForm;