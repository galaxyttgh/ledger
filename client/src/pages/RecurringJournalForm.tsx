// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// const RecurringJournalForm = () => {
//   const navigate = useNavigate();
//   const [accounts, setAccounts] = useState<any[]>([]);
//   const [description, setDescription] = useState('');
//   const [frequency, setFrequency] = useState('monthly');
//   const [nextRunDate, setNextRunDate] = useState('');
//   const [lines, setLines] = useState([{ account_id: 0, description: '', debit: '', credit: '' }]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => { fetchAccounts(); }, []);

//   const fetchAccounts = async () => {
//     try {
//       const response = await api.get('/accounts');
//       setAccounts(response.data);
//     } catch (error) {
//       console.error('Failed to fetch accounts:', error);
//     }
//   };

//   const addLine = () => setLines([...lines, { account_id: 0, description: '', debit: '', credit: '' }]);
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
//     setLoading(true);
//     try {
//       await api.post('/journals/recurring', {
//         description,
//         frequency,
//         next_run_date: nextRunDate,
//         lines: lines.map(l => ({
//           account_id: l.account_id,
//           description: l.description,
//           debit: parseFloat(l.debit) || 0,
//           credit: parseFloat(l.credit) || 0,
//         })),
//       });
//       navigate('/general-ledger');
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-2xl mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Recurring Journal</h2>
//             <p className="text-gray-500 mt-1">Auto-generate monthly entries</p>
//           </div>
//           <button onClick={() => navigate('/general-ledger')} className="px-4 py-2 border rounded-lg">← Back</button>
//         </div>
//         {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
//         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
//           <div className="grid grid-cols-3 gap-4 mb-4">
//             <div className="col-span-2">
//               <label className="block text-sm font-medium mb-1">Description *</label>
//               <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Monthly Rent" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Frequency</label>
//               <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
//                 <option value="monthly">Monthly</option>
//                 <option value="quarterly">Quarterly</option>
//                 <option value="yearly">Yearly</option>
//               </select>
//             </div>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Next Run Date *</label>
//             <input type="date" value={nextRunDate} onChange={(e) => setNextRunDate(e.target.value)} className="px-3 py-2 border rounded-lg" required />
//           </div>

//           <div className="flex justify-between items-center mb-4">
//             <h4 className="font-semibold">Lines</h4>
//             <button type="button" onClick={addLine} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">+ Add</button>
//           </div>

//           {lines.map((line, i) => (
//             <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
//               <select value={line.account_id} onChange={(e) => updateLine(i, 'account_id', e.target.value)} className="col-span-4 px-2 py-2 border rounded-lg text-sm" required>
//                 <option value="">Account</option>
//                 {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.code}</option>)}
//               </select>
//               <input type="text" value={line.description} onChange={(e) => updateLine(i, 'description', e.target.value)} className="col-span-3 px-2 py-2 border rounded-lg text-sm" placeholder="Desc" />
//               <input type="number" value={line.debit} onChange={(e) => updateLine(i, 'debit', e.target.value)} className="col-span-2 px-2 py-2 border rounded-lg text-sm" placeholder="Dr" />
//               <input type="number" value={line.credit} onChange={(e) => updateLine(i, 'credit', e.target.value)} className="col-span-2 px-2 py-2 border rounded-lg text-sm" placeholder="Cr" />
//               <button type="button" onClick={() => removeLine(i)} className="col-span-1 text-red-500">×</button>
//             </div>
//           ))}

//           <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 mt-4">
//             {loading ? 'Saving...' : 'Save Recurring Journal'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default RecurringJournalForm;



// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// const RecurringJournalForm = () => {
//   const navigate = useNavigate();
//   const [accounts, setAccounts] = useState<any[]>([]);
//   const [description, setDescription] = useState('');
//   const [frequency, setFrequency] = useState('monthly');
//   const [nextRunDate, setNextRunDate] = useState('');
//   const [lines, setLines] = useState([{ account_id: 0, description: '', debit: '', credit: '' }]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => { fetchAccounts(); }, []);

//   const fetchAccounts = async () => {
//     try {
//       const response = await api.get('/accounts');
//       setAccounts(response.data);
//     } catch (error) {
//       console.error('Failed to fetch accounts:', error);
//       toast.error('Failed to load accounts');
//     }
//   };

//   const addLine = () => setLines([...lines, { account_id: 0, description: '', debit: '', credit: '' }]);
  
//   const removeLine = (i: number) => {
//     if (lines.length <= 1) return;
//     setLines(lines.filter((_, idx) => idx !== i));
//   };

//   const updateLine = (i: number, field: string, value: string) => {
//     const updated = [...lines];
//     if (field === 'debit' || field === 'credit') {
//       const numValue = value;
//       updated[i] = { 
//         ...updated[i], 
//         [field]: numValue,
//         ...(field === 'debit' ? { credit: '' } : { debit: '' }),
//       };
//     } else {
//       updated[i] = { ...updated[i], [field]: field === 'account_id' ? parseInt(value) || 0 : value };
//     }
//     setLines(updated);
//   };

//   const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
//   const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
//   const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
//   const validLines = lines.filter(l => l.account_id > 0 && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0)).length;

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};
    
//     if (!description.trim()) newErrors.description = 'Description is required';
//     if (!nextRunDate) newErrors.nextRunDate = 'Next run date is required';
//     if (validLines < 2) newErrors.lines = 'At least 2 valid lines are required';
//     if (!isBalanced) newErrors.balance = 'Debits and credits must be equal';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!isBalanced) {
//       setError(`Journal is not balanced. Difference: ₦${Math.abs(totalDebit - totalCredit).toLocaleString()}`);
//       return;
//     }

//     if (!validateForm()) {
//       toast.error('Please fix the form errors');
//       return;
//     }

//     setLoading(true);
//     try {
//       await api.post('/journals/recurring', {
//         description: description.trim(),
//         frequency,
//         next_run_date: nextRunDate,
//         lines: lines
//           .filter(l => l.account_id > 0)
//           .map(l => ({
//             account_id: l.account_id,
//             description: l.description,
//             debit: parseFloat(l.debit) || 0,
//             credit: parseFloat(l.credit) || 0,
//           })),
//       });
//       toast.success('Recurring journal created successfully!');
//       navigate('/general-ledger');
//     } catch (err: any) {
//       const errorMsg = err.response?.data?.error || 'Failed to create recurring journal';
//       setError(errorMsg);
//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     const hasData = description || nextRunDate || lines.some(l => l.account_id > 0 || l.debit || l.credit);
//     if (hasData) {
//       if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
//         navigate('/general-ledger');
//       }
//     } else {
//       navigate('/general-ledger');
//     }
//   };

//   const groupedAccounts = accounts.reduce((acc, account) => {
//     if (!acc[account.type]) acc[account.type] = [];
//     acc[account.type].push(account);
//     return acc;
//   }, {} as Record<string, any[]>);

//   return (
//     <Layout>
//       <div className="max-w-2xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-800">Recurring Journal</h2>
//               <p className="text-gray-500 mt-1 text-sm">Auto-generate monthly entries</p>
//             </div>
//             <button 
//               onClick={handleCancel} 
//               className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded-xl 
//                        text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
//             >
//               <span>←</span>
//               <span>Back to Ledger</span>
//             </button>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2">
//             <span>⚠️</span>
//             <span>{error}</span>
//             <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Journal Details */}
//           <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
//             <h3 className="text-base font-semibold text-gray-800 mb-4">Journal Details</h3>
            
//             {/* Description & Frequency - Stack on mobile */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Description <span className="text-red-500">*</span>
//                 </label>
//                 <input 
//                   type="text" 
//                   value={description} 
//                   onChange={(e) => {
//                     setDescription(e.target.value);
//                     if (errors.description) setErrors({ ...errors, description: '' });
//                   }} 
//                   placeholder="e.g., Monthly Rent"
//                   className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
//                     ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
//                     focus:outline-none focus:ring-2 focus:ring-opacity-50`}
//                   required 
//                 />
//                 {errors.description && (
//                   <p className="mt-1 text-xs text-red-600">{errors.description}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Frequency
//                 </label>
//                 <select 
//                   value={frequency} 
//                   onChange={(e) => setFrequency(e.target.value)} 
//                   className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
//                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
//                 >
//                   <option value="monthly">📅 Monthly</option>
//                   <option value="quarterly">📆 Quarterly</option>
//                   <option value="yearly">🗓️ Yearly</option>
//                 </select>
//               </div>
//             </div>

//             {/* Next Run Date */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                 Next Run Date <span className="text-red-500">*</span>
//               </label>
//               <input 
//                 type="date" 
//                 value={nextRunDate} 
//                 onChange={(e) => {
//                   setNextRunDate(e.target.value);
//                   if (errors.nextRunDate) setErrors({ ...errors, nextRunDate: '' });
//                 }} 
//                 min={new Date().toISOString().split('T')[0]}
//                 className={`w-full sm:w-auto px-3 py-2.5 border rounded-xl text-sm transition-colors
//                   ${errors.nextRunDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
//                   focus:outline-none focus:ring-2 focus:ring-opacity-50`}
//                 required 
//               />
//               {errors.nextRunDate && (
//                 <p className="mt-1 text-xs text-red-600">{errors.nextRunDate}</p>
//               )}
//             </div>
//           </div>

//           {/* Journal Lines */}
//           <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h3 className="text-base font-semibold text-gray-800">Journal Lines</h3>
//                 <p className="text-xs text-gray-500 mt-0.5">{validLines} valid line{validLines !== 1 ? 's' : ''}</p>
//               </div>
//               <button 
//                 type="button" 
//                 onClick={addLine} 
//                 className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm 
//                          hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
//               >
//                 <span>+</span>
//                 <span>Add Line</span>
//               </button>
//             </div>

//             {errors.lines && (
//               <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
//                 {errors.lines}
//               </div>
//             )}

//             {errors.balance && (
//               <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
//                 ⚠️ {errors.balance}
//               </div>
//             )}

//             {/* Desktop Table View */}
//             <div className="hidden sm:block overflow-x-auto">
//               <table className="w-full text-sm min-w-[600px]">
//                 <thead>
//                   <tr className="border-b">
//                     <th className="px-3 py-2 text-left text-gray-500 w-1/3">Account</th>
//                     <th className="px-3 py-2 text-left text-gray-500">Description</th>
//                     <th className="px-3 py-2 text-right text-gray-500 w-[100px]">Debit (₦)</th>
//                     <th className="px-3 py-2 text-right text-gray-500 w-[100px]">Credit (₦)</th>
//                     <th className="px-3 py-2 text-center text-gray-500 w-16"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {lines.map((line, i) => (
//                     <tr key={i} className="border-b hover:bg-gray-50">
//                       <td className="px-3 py-2">
//                         <select 
//                           value={line.account_id} 
//                           onChange={(e) => updateLine(i, 'account_id', e.target.value)} 
//                           className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm
//                                    focus:outline-none focus:ring-1 focus:ring-blue-500"
//                           required
//                         >
//                           <option value="">Account</option>
//                          {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
//   <optgroup key={type} label={type.toUpperCase()}>
//     {(typeAccounts as any[]).map((a: any) => (
//       <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
//     ))}
//   </optgroup>
// ))}
//                         </select>
//                       </td>
//                       <td className="px-3 py-2">
//                         <input 
//                           type="text" 
//                           value={line.description} 
//                           onChange={(e) => updateLine(i, 'description', e.target.value)} 
//                           className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm
//                                    focus:outline-none focus:ring-1 focus:ring-blue-500" 
//                           placeholder="Desc" 
//                         />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input 
//                           type="number" 
//                           value={line.debit} 
//                           onChange={(e) => updateLine(i, 'debit', e.target.value)} 
//                           className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-right
//                                    focus:outline-none focus:ring-1 focus:ring-blue-500" 
//                           placeholder="0.00"
//                           step="0.01"
//                           min="0"
//                         />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input 
//                           type="number" 
//                           value={line.credit} 
//                           onChange={(e) => updateLine(i, 'credit', e.target.value)} 
//                           className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-right
//                                    focus:outline-none focus:ring-1 focus:ring-blue-500" 
//                           placeholder="0.00"
//                           step="0.01"
//                           min="0"
//                         />
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         <button 
//                           type="button" 
//                           onClick={() => removeLine(i)} 
//                           className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//                           title="Remove line"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                           </svg>
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot>
//                   <tr className="bg-gray-50 font-medium">
//                     <td colSpan={2} className="px-3 py-3 text-right">Totals:</td>
//                     <td className="px-3 py-3 text-right text-green-600">₦{totalDebit.toLocaleString()}</td>
//                     <td className="px-3 py-3 text-right text-red-600">₦{totalCredit.toLocaleString()}</td>
//                     <td></td>
//                   </tr>
//                   <tr className="text-sm">
//                     <td colSpan={2} className="px-3 py-1 text-right text-gray-500">Balance:</td>
//                     <td colSpan={2} className={`px-3 py-1 text-right font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
//                       {isBalanced ? '✓ Balanced' : `✗ Diff: ₦${Math.abs(totalDebit - totalCredit).toLocaleString()}`}
//                     </td>
//                     <td></td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>

//             {/* Mobile Card View */}
//             <div className="sm:hidden space-y-3">
//               {lines.map((line, i) => {
//                 const selectedAccount = accounts.find(a => a.id === line.account_id);
//                 return (
//                   <div key={i} className={`p-3 rounded-xl border ${
//                     line.account_id > 0 ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
//                   }`}>
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-xs font-medium text-gray-500">Line {i + 1}</span>
//                       {lines.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removeLine(i)}
//                           className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                           </svg>
//                         </button>
//                       )}
//                     </div>
                    
//                     <select 
//                       value={line.account_id} 
//                       onChange={(e) => updateLine(i, 'account_id', e.target.value)} 
//                       className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm mb-2
//                                focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required
//                     >
//                       <option value="">Select account...</option>
//                       {Object.entries(groupedAccounts).map(([type, typeAccounts]: [string, any[]]) => (
//                          <optgroup key={type} label={type.toUpperCase()}>
//     {typeAccounts.map((acc) => (
//       <option key={acc.id} value={acc.id}>
//         {acc.code} - {acc.name}
//       </option>
//     ))}
//   </optgroup>
//                       ))}
//                     </select>
                    
//                     {selectedAccount && (
//                       <p className="text-xs text-blue-600 mb-2">{selectedAccount.code} • {selectedAccount.type}</p>
//                     )}
                    
//                     <input 
//                       type="text" 
//                       value={line.description} 
//                       onChange={(e) => updateLine(i, 'description', e.target.value)} 
//                       className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm mb-2
//                                focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                       placeholder="Line description" 
//                     />
                    
//                     <div className="grid grid-cols-2 gap-2">
//                       <div>
//                         <label className="block text-xs text-gray-500 mb-1">Debit (₦)</label>
//                         <input 
//                           type="number" 
//                           value={line.debit} 
//                           onChange={(e) => updateLine(i, 'debit', e.target.value)} 
//                           className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-right
//                                    focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                           placeholder="0.00"
//                           step="0.01"
//                           min="0"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-500 mb-1">Credit (₦)</label>
//                         <input 
//                           type="number" 
//                           value={line.credit} 
//                           onChange={(e) => updateLine(i, 'credit', e.target.value)} 
//                           className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-right
//                                    focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                           placeholder="0.00"
//                           step="0.01"
//                           min="0"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Balance Summary - Mobile */}
//             <div className="sm:hidden mt-4 p-3 bg-gray-50 rounded-xl space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Total Debit</span>
//                 <span className="font-bold text-green-600">₦{totalDebit.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Total Credit</span>
//                 <span className="font-bold text-red-600">₦{totalCredit.toLocaleString()}</span>
//               </div>
//               <div className={`flex justify-between text-sm pt-2 border-t font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
//                 <span>{isBalanced ? '✓ Balanced' : 'Difference'}</span>
//                 <span>{isBalanced ? '' : '₦'}{Math.abs(totalDebit - totalCredit).toLocaleString()}</span>
//               </div>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button 
//             type="submit" 
//             disabled={loading || !isBalanced} 
//             className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold 
//                      hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed 
//                      transition-colors text-sm"
//           >
//             {loading ? (
//               <span className="flex items-center justify-center gap-2">
//                 <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                 </svg>
//                 Saving...
//               </span>
//             ) : (
//               'Save Recurring Journal'
//             )}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default RecurringJournalForm;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
}

const RecurringJournalForm = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [nextRunDate, setNextRunDate] = useState('');
  const [lines, setLines] = useState([{ account_id: 0, description: '', debit: '', credit: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const addLine = () => setLines([...lines, { account_id: 0, description: '', debit: '', credit: '' }]);
  
  const removeLine = (i: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, idx) => idx !== i));
  };

  const updateLine = (i: number, field: string, value: string) => {
    const updated = [...lines];
    if (field === 'debit' || field === 'credit') {
      const numValue = value;
      updated[i] = { 
        ...updated[i], 
        [field]: numValue,
        ...(field === 'debit' ? { credit: '' } : { debit: '' }),
      };
    } else {
      updated[i] = { ...updated[i], [field]: field === 'account_id' ? parseInt(value) || 0 : value };
    }
    setLines(updated);
  };

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
  const validLines = lines.filter(l => l.account_id > 0 && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0)).length;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!nextRunDate) newErrors.nextRunDate = 'Next run date is required';
    if (validLines < 2) newErrors.lines = 'At least 2 valid lines are required';
    if (!isBalanced) newErrors.balance = 'Debits and credits must be equal';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isBalanced) {
      setError(`Journal is not balanced. Difference: ₦${Math.abs(totalDebit - totalCredit).toLocaleString()}`);
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      await api.post('/journals/recurring', {
        description: description.trim(),
        frequency,
        next_run_date: nextRunDate,
        lines: lines
          .filter(l => l.account_id > 0)
          .map(l => ({
            account_id: l.account_id,
            description: l.description,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
          })),
      });
      toast.success('Recurring journal created successfully!');
      navigate('/general-ledger');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create recurring journal';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasData = description || nextRunDate || lines.some(l => l.account_id > 0 || l.debit || l.credit);
    if (hasData) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/general-ledger');
      }
    } else {
      navigate('/general-ledger');
    }
  };

  // Group accounts by type with proper typing
  const groupedAccounts: Record<string, Account[]> = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  // Get entries with proper typing
  const accountEntries = Object.entries(groupedAccounts) as [string, Account[]][];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Recurring Journal</h2>
              <p className="text-gray-500 mt-1 text-sm">Auto-generate monthly entries</p>
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
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Journal Details */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Journal Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="sm:col-span-2">
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
                  placeholder="e.g., Monthly Rent"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  required 
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Frequency
                </label>
                <select 
                  value={frequency} 
                  onChange={(e) => setFrequency(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="monthly">📅 Monthly</option>
                  <option value="quarterly">📆 Quarterly</option>
                  <option value="yearly">🗓️ Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Next Run Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={nextRunDate} 
                onChange={(e) => {
                  setNextRunDate(e.target.value);
                  if (errors.nextRunDate) setErrors({ ...errors, nextRunDate: '' });
                }} 
                min={new Date().toISOString().split('T')[0]}
                className={`w-full sm:w-auto px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.nextRunDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required 
              />
              {errors.nextRunDate && (
                <p className="mt-1 text-xs text-red-600">{errors.nextRunDate}</p>
              )}
            </div>
          </div>

          {/* Journal Lines */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Journal Lines</h3>
                <p className="text-xs text-gray-500 mt-0.5">{validLines} valid line{validLines !== 1 ? 's' : ''}</p>
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

            {errors.balance && (
              <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                ⚠️ {errors.balance}
              </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-gray-500 w-1/3">Account</th>
                    <th className="px-3 py-2 text-left text-gray-500">Description</th>
                    <th className="px-3 py-2 text-right text-gray-500 w-[100px]">Debit (₦)</th>
                    <th className="px-3 py-2 text-right text-gray-500 w-[100px]">Credit (₦)</th>
                    <th className="px-3 py-2 text-center text-gray-500 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <select 
                          value={line.account_id} 
                          onChange={(e) => updateLine(i, 'account_id', e.target.value)} 
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm
                                   focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">Account</option>
                          {accountEntries.map(([type, typeAccounts]) => (
                            <optgroup key={type} label={type.toUpperCase()}>
                              {typeAccounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input 
                          type="text" 
                          value={line.description} 
                          onChange={(e) => updateLine(i, 'description', e.target.value)} 
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm
                                   focus:outline-none focus:ring-1 focus:ring-blue-500" 
                          placeholder="Desc" 
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input 
                          type="number" 
                          value={line.debit} 
                          onChange={(e) => updateLine(i, 'debit', e.target.value)} 
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
                          value={line.credit} 
                          onChange={(e) => updateLine(i, 'credit', e.target.value)} 
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
                          onClick={() => removeLine(i)} 
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
                    <td colSpan={2} className="px-3 py-1 text-right text-gray-500">Balance:</td>
                    <td colSpan={2} className={`px-3 py-1 text-right font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      {isBalanced ? '✓ Balanced' : `✗ Diff: ₦${Math.abs(totalDebit - totalCredit).toLocaleString()}`}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {lines.map((line, i) => {
                const selectedAccount = accounts.find(a => a.id === line.account_id);
                return (
                  <div key={i} className={`p-3 rounded-xl border ${
                    line.account_id > 0 ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">Line {i + 1}</span>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
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
                      onChange={(e) => updateLine(i, 'account_id', e.target.value)} 
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm mb-2
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select account...</option>
                      {accountEntries.map(([type, typeAccounts]) => (
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
                      <p className="text-xs text-blue-600 mb-2">{selectedAccount.code} • {selectedAccount.type}</p>
                    )}
                    
                    <input 
                      type="text" 
                      value={line.description} 
                      onChange={(e) => updateLine(i, 'description', e.target.value)} 
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm mb-2
                               focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Line description" 
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Debit (₦)</label>
                        <input 
                          type="number" 
                          value={line.debit} 
                          onChange={(e) => updateLine(i, 'debit', e.target.value)} 
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
                          value={line.credit} 
                          onChange={(e) => updateLine(i, 'credit', e.target.value)} 
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
              <div className={`flex justify-between text-sm pt-2 border-t font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                <span>{isBalanced ? '✓ Balanced' : 'Difference'}</span>
                <span>{isBalanced ? '' : '₦'}{Math.abs(totalDebit - totalCredit).toLocaleString()}</span>
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
                Saving...
              </span>
            ) : (
              'Save Recurring Journal'
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default RecurringJournalForm;
