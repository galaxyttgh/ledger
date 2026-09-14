// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface Approval {
//   id: number;
//   transaction_type: string;
//   transaction_id: number;
//   submitted_by_name: string;
//   status: string;
//   submitted_at: string;
//   approved_by_name: string | null;
//   approved_at: string | null;
//   comments: string | null;
// }

// const Approvals = () => {
//   const [pending, setPending] = useState<Approval[]>([]);
//   const [history, setHistory] = useState<Approval[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [pendingRes, historyRes] = await Promise.all([
//         api.get('/approvals/pending'),
//         api.get('/approvals/history'),
//       ]);
//       setPending(pendingRes.data);
//       setHistory(historyRes.data);
//     } catch (error) {
//       console.error('Failed to fetch approvals:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApprove = async (id: number) => {
//     try {
//       await api.post(`/approvals/${id}/approve`);
//       setMessage('✅ Approved');
//       fetchData();
//     } catch (error) {
//       setMessage('❌ Failed');
//     }
//   };

//   const handleReject = async (id: number) => {
//     const reason = prompt('Rejection reason (optional):');
//     try {
//       await api.post(`/approvals/${id}/reject`, { comments: reason });
//       setMessage('❌ Rejected');
//       fetchData();
//     } catch (error) {
//       setMessage('❌ Failed');
//     }
//   };

//   const handleSubmitForApproval = async () => {
//     const type = prompt('Transaction type (journal/invoice/bill):');
//     const id = prompt('Transaction ID:');
//     if (!type || !id) return;
    
//     try {
//       await api.post('/approvals/submit', {
//         transaction_type: type,
//         transaction_id: parseInt(id),
//       });
//       setMessage('✅ Submitted for approval');
//       fetchData();
//     } catch (error) {
//       setMessage('❌ Failed to submit');
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Approvals</h2>
//           <p className="text-gray-500 mt-1">Maker-Checker workflow</p>
//         </div>
//         <button
//           onClick={handleSubmitForApproval}
//           className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
//         >
//           + Submit for Approval
//         </button>
//       </div>

//       {message && (
//         <div className="mb-4 text-sm font-medium text-gray-700">{message}</div>
//       )}

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : (
//         <>
//           {/* Pending */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
//             <div className="px-6 py-4 bg-yellow-50 border-b">
//               <h3 className="font-semibold text-gray-700">⏳ Pending Approvals ({pending.length})</h3>
//             </div>
//             {pending.length === 0 ? (
//               <div className="p-6 text-center text-gray-500">No pending approvals</div>
//             ) : (
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {pending.map((a) => (
//                     <tr key={a.id}>
//                       <td className="px-6 py-4 text-sm font-medium capitalize">{a.transaction_type}</td>
//                       <td className="px-6 py-4 text-sm text-gray-600">#{a.transaction_id}</td>
//                       <td className="px-6 py-4 text-sm text-gray-600">{a.submitted_by_name}</td>
//                       <td className="px-6 py-4 text-sm text-gray-500">
//                         {new Date(a.submitted_at).toLocaleDateString()}
//                       </td>
//                       <td className="px-6 py-4 space-x-2">
//                         <button
//                           onClick={() => handleApprove(a.id)}
//                           className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
//                         >
//                           ✓ Approve
//                         </button>
//                         <button
//                           onClick={() => handleReject(a.id)}
//                           className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
//                         >
//                           ✗ Reject
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           {/* History */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b">
//               <h3 className="font-semibold text-gray-700">📋 Approval History</h3>
//             </div>
//             {history.length === 0 ? (
//               <div className="p-6 text-center text-gray-500">No history</div>
//             ) : (
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {history.map((a) => (
//                     <tr key={a.id}>
//                       <td className="px-6 py-4 text-sm font-medium capitalize">{a.transaction_type}</td>
//                       <td className="px-6 py-4 text-sm text-gray-600">#{a.transaction_id}</td>
//                       <td className="px-6 py-4 text-sm text-gray-600">{a.submitted_by_name}</td>
//                       <td className="px-6 py-4">
//                         <span className={`px-2 py-1 text-xs rounded-full ${
//                           a.status === 'approved' ? 'bg-green-100 text-green-800' :
//                           a.status === 'rejected' ? 'bg-red-100 text-red-800' :
//                           'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {a.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600">{a.approved_by_name || '-'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </>
//       )}
//     </Layout>
//   );
// };

// export default Approvals;


// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { toast } from 'react-hot-toast';

// interface Approval {
//   id: number;
//   transaction_type: string;
//   transaction_id: number;
//   submitted_by_name: string;
//   status: string;
//   submitted_at: string;
//   approved_by_name: string | null;
//   approved_at: string | null;
//   comments: string | null;
//     description?: string;
//   amount?: number;
// }

// const Approvals = () => {
//   const [pending, setPending] = useState<Approval[]>([]);
//   const [history, setHistory] = useState<Approval[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState('');
//   const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
//   const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
//   const [actionLoading, setActionLoading] = useState<number | null>(null);
// const [showMultiForm, setShowMultiForm] = useState(false);
// const [multiType, setMultiType] = useState('journal');
// const [multiId, setMultiId] = useState('');
// const [steps, setSteps] = useState<{role: string}[]>([
//   { role: 'manager' },
//   { role: 'accountant' },
// ]);
// const [multiDescription, setMultiDescription] = useState('');
// const [multiAmount, setMultiAmount] = useState('');
//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [pendingRes, historyRes] = await Promise.all([
//         api.get('/approvals/pending'),
//         api.get('/approvals/history'),
//       ]);
//       setPending(pendingRes.data);
//       setHistory(historyRes.data);
//     } catch (error) {
//       console.error('Failed to fetch approvals:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApprove = async (id: number) => {
//     setActionLoading(id);
//     try {
//       await api.post(`/approvals/${id}/approve`);
//       setMessage('✅ Approved successfully');
//       fetchData();
//       setSelectedApproval(null);
//     } catch (error) {
//       setMessage('❌ Failed to approve');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleReject = async (id: number) => {
//     const reason = prompt('Rejection reason (optional):');
//     if (reason === null) return; // User cancelled
    
//     setActionLoading(id);
//     try {
//       await api.post(`/approvals/${id}/reject`, { comments: reason });
//       setMessage('❌ Rejected');
//       fetchData();
//       setSelectedApproval(null);
//     } catch (error) {
//       setMessage('❌ Failed to reject');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleSubmitForApproval = async () => {
//     const type = prompt('Transaction type (journal/invoice/bill):');
//     if (!type) return;
    
//     const id = prompt('Transaction ID:');
//     if (!id) return;
    
//     try {
//       await api.post('/approvals/submit', {
//         transaction_type: type,
//         transaction_id: parseInt(id),
//       });
//       setMessage('✅ Submitted for approval');
//       fetchData();
//     } catch (error) {
//       setMessage('❌ Failed to submit');
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'approved':
//         return { color: 'bg-green-100 text-green-800', icon: '✓' };
//       case 'rejected':
//         return { color: 'bg-red-100 text-red-800', icon: '✗' };
//       case 'pending':
//         return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
//       default:
//         return { color: 'bg-gray-100 text-gray-800', icon: '•' };
//     }
//   };

//   const getTransactionIcon = (type: string) => {
//     const icons: Record<string, string> = {
//       journal: '📒',
//       invoice: '🧾',
//       bill: '💳',
//       payment: '💸',
//       receipt: '💰',
//     };
//     return icons[type.toLowerCase()] || '📋';
//   };

//   // Auto-hide message after 3 seconds
//   useEffect(() => {
//     if (message) {
//       const timer = setTimeout(() => setMessage(''), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [message]);

//   return (
//     <Layout>
//       {/* <div className="mb-6">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Approvals</h2>
//             <p className="text-gray-500 mt-1 text-sm">Maker-Checker workflow</p>
//           </div>
//           <button
//             onClick={handleSubmitForApproval}
//             className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl 
//                      hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium shadow-sm w-full sm:w-auto"
//           >
//             <span>+</span>
//             <span>Submit for Approval</span>
//           </button>
//         </div>
//       </div> */}
//       <div className="mb-6">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Approvals</h2>
//             <p className="text-gray-500 mt-1 text-sm">Maker-Checker workflow</p>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleSubmitForApproval}
//               className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl 
//                        hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium shadow-sm"
//             >
//               <span>+</span>
//               <span>Submit for Approval</span>
//             </button>
//             <button
//               onClick={() => setShowMultiForm(!showMultiForm)}
//               className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl 
//                        hover:bg-purple-700 active:bg-purple-800 transition-colors text-sm font-medium shadow-sm"
//             >
//               <span>🔄</span>
//               <span>Multi-Step</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Multi-Step Approval Form */}
// {showMultiForm && (
//   <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
//     <h3 className="font-semibold mb-4">New Approval Request</h3>
//     <div className="space-y-4 mb-4">
//       <select value={multiType} onChange={e => setMultiType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
//         <option value="purchase">Purchase Request</option>
//         <option value="salary">Salary Approval</option>
//         <option value="payment">Payment Request</option>
//         <option value="other">Other</option>
//       </select>
//       <textarea 
//         value={multiDescription} 
//         onChange={e => setMultiDescription(e.target.value)} 
//         placeholder="Describe what you're requesting..."
//         className="w-full px-3 py-2 border rounded-lg text-sm"
//         rows={3}
//       />
//       <input 
//         type="number" 
//         value={multiAmount} 
//         onChange={e => setMultiAmount(e.target.value)} 
//         placeholder="Amount (₦) — optional"
//         className="w-full px-3 py-2 border rounded-lg text-sm"
//       />
//     </div>
//     <p className="text-sm text-gray-600 mb-2">Approval chain:</p>
//     {steps.map((s, i) => (
//       <div key={i} className="flex items-center gap-2 mb-2">
//         <span className="text-xs text-gray-500 w-14">Step {i + 1}:</span>
//         <select value={s.role} onChange={e => {
//           const newSteps = [...steps];
//           newSteps[i].role = e.target.value;
//           setSteps(newSteps);
//         }} className="flex-1 px-3 py-2 border rounded-lg text-sm">
//           <option value="manager">MD</option>
//           <option value="accountant">Accountant</option>
//           <option value="hr_payroll">HR</option>
//           <option value="admin">Admin</option>
//         </select>
//         {i > 0 && (
//           <button onClick={() => setSteps(steps.filter((_, idx) => idx !== i))} className="text-red-500 text-sm">Remove</button>
//         )}
//       </div>
//     ))}
//     <button onClick={() => setSteps([...steps, { role: 'manager' }])} className="text-blue-600 text-sm mb-4">+ Add Step</button>
//     <button
//       onClick={async () => {
//         if (!multiDescription.trim()) {
//           toast.error('Please enter a description');
//           return;
//         }
//         try {
//           await api.post('/approvals/submit-multi', {
//             request_type: multiType,
//             description: multiDescription,
//             amount: parseFloat(multiAmount) || 0,
//             steps,
//           });
//           toast.success('Approval request submitted');
//           setShowMultiForm(false);
//           setMultiDescription('');
//           setMultiAmount('');
//         } catch (err: any) {
//           toast.error(err.response?.data?.error || 'Failed');
//         }
//       }}
//       className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
//     >
//       Submit Approval Request
//     </button>
//   </div>
// )}
//       {message && (
//         <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-medium text-blue-800 animate-fadeIn">
//           {message}
//         </div>
//       )}

//       {loading ? (
//         <div className="space-y-6">
//           {/* Tabs Skeleton */}
//           <div className="flex gap-2 mb-4">
//             <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
//             <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
//           </div>
          
//           {/* Content Skeleton */}
//           <div className="bg-white rounded-xl shadow-sm p-4">
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0">
//                 <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
//                 <div className="flex-1">
//                   <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
//                   <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Mobile Tabs */}
//           <div className="lg:hidden flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
//             <button
//               onClick={() => {
//                 setActiveTab('pending');
//                 setSelectedApproval(null);
//               }}
//               className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
//                 activeTab === 'pending'
//                   ? 'bg-white text-blue-900 shadow-sm'
//                   : 'text-gray-600 hover:text-gray-800'
//               }`}
//             >
//               <span className="flex items-center justify-center gap-2">
//                 <span>⏳</span>
//                 <span>Pending</span>
//                 {pending.length > 0 && (
//                   <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
//                     {pending.length}
//                   </span>
//                 )}
//               </span>
//             </button>
//             <button
//               onClick={() => {
//                 setActiveTab('history');
//                 setSelectedApproval(null);
//               }}
//               className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
//                 activeTab === 'history'
//                   ? 'bg-white text-blue-900 shadow-sm'
//                   : 'text-gray-600 hover:text-gray-800'
//               }`}
//             >
//               <span className="flex items-center justify-center gap-2">
//                 <span>📋</span>
//                 <span>History</span>
//               </span>
//             </button>
//           </div>

//           {/* Pending Section */}
//           <div className={`${activeTab === 'history' ? 'hidden lg:block' : ''} mb-6 lg:mb-8`}>
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//               <div className="px-4 lg:px-6 py-4 bg-yellow-50 border-b border-yellow-100">
//                 <div className="flex items-center justify-between">
//                   <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//                     <span>⏳</span>
//                     <span>Pending Approvals</span>
//                     <span className="text-sm text-gray-500 font-normal">
//                       ({pending.length})
//                     </span>
//                   </h3>
//                 </div>
//               </div>
              
//               {pending.length === 0 ? (
//                 <div className="p-8 lg:p-12 text-center">
//                   <span className="text-4xl mb-3 block">✅</span>
//                   <p className="text-gray-500 font-medium">No pending approvals</p>
//                   <p className="text-gray-400 text-sm mt-1">All caught up!</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Desktop Table */}
//                   <div className="hidden lg:block overflow-x-auto">
//                     <table className="w-full">
//                    <thead className="bg-gray-50">
//   <tr>
//     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
//     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Transaction</th>
//     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
//     <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
//     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Submitted By</th>
//     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
//     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
//   </tr>
// </thead>
//                       <tbody className="divide-y divide-gray-100">
//                         {/* {pending.map((a) => (
//                           <tr key={a.id} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-6 py-4">
//                               <div className="flex items-center gap-2">
//                                 <span>{getTransactionIcon(a.transaction_type)}</span>
//                                 <span className="text-sm font-medium capitalize">{a.transaction_type}</span>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-gray-600">#{a.transaction_id}</td>
//                             <td className="px-6 py-4 text-sm text-gray-600">{a.submitted_by_name}</td>
//                             <td className="px-6 py-4 text-sm text-gray-500">
//                               {new Date(a.submitted_at).toLocaleDateString()}
//                             </td>
//                             <td className="px-6 py-4">
//                               <div className="flex gap-2">
//                                 <button
//                                   onClick={() => handleApprove(a.id)}
//                                   disabled={actionLoading === a.id}
//                                   className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 
//                                            disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//                                 >
//                                   {actionLoading === a.id ? '...' : '✓ Approve'}
//                                 </button>
//                                 <button
//                                   onClick={() => handleReject(a.id)}
//                                   disabled={actionLoading === a.id}
//                                   className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 
//                                            disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//                                 >
//                                   {actionLoading === a.id ? '...' : '✗ Reject'}
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))} */}
//                         {pending.map((a) => (
//   <tr key={a.id} className="hover:bg-gray-50 transition-colors">
//     <td className="px-6 py-4">
//       <div className="flex items-center gap-2">
//         <span>{getTransactionIcon(a.transaction_type)}</span>
//         <span className="text-sm font-medium capitalize">{a.transaction_type}</span>
//       </div>
//     </td>
//     <td className="px-6 py-4 text-sm text-gray-600">#{a.transaction_id}</td>
//     <td className="px-6 py-4 text-sm text-gray-600">{a.description || '-'}</td>
//     <td className="px-6 py-4 text-sm text-right font-medium">₦{Number(a.amount || 0).toLocaleString()}</td>
//     <td className="px-6 py-4 text-sm text-gray-600">{a.submitted_by_name}</td>
//     <td className="px-6 py-4 text-sm text-gray-500">
//       {new Date(a.submitted_at).toLocaleDateString()}
//     </td>
//     <td className="px-6 py-4">
//       <div className="flex gap-2">
//         <button
//           onClick={() => handleApprove(a.id)}
//           disabled={actionLoading === a.id}
//           className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 
//                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//         >
//           {actionLoading === a.id ? '...' : '✓ Approve'}
//         </button>
//         <button
//           onClick={() => handleReject(a.id)}
//           disabled={actionLoading === a.id}
//           className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 
//                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//         >
//           {actionLoading === a.id ? '...' : '✗ Reject'}
//         </button>
//       </div>
//     </td>
//   </tr>
// ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Mobile Cards */}
//                   {/* <div className="lg:hidden divide-y divide-gray-100">
//                     {pending.map((a) => (
//                       <div key={a.id} className="p-4">
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-lg">
//                               {getTransactionIcon(a.transaction_type)}
//                             </div>
//                             <div>
//                               <h4 className="font-semibold text-gray-800 capitalize">{a.transaction_type}</h4>
//                               <p className="text-xs text-gray-500">#{a.transaction_id}</p>
//                             </div>
//                           </div>
//                           <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
//                             Pending
//                           </span>
//                         </div>

//                         <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
//                           <div>
//                             <p className="text-xs text-gray-500">Submitted By</p>
//                             <p className="font-medium text-gray-700">{a.submitted_by_name}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-500">Date</p>
//                             <p className="font-medium text-gray-700">
//                               {new Date(a.submitted_at).toLocaleDateString()}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleApprove(a.id)}
//                             disabled={actionLoading === a.id}
//                             className="flex-1 px-3 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 
//                                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//                           >
//                             {actionLoading === a.id ? 'Processing...' : '✓ Approve'}
//                           </button>
//                           <button
//                             onClick={() => handleReject(a.id)}
//                             disabled={actionLoading === a.id}
//                             className="flex-1 px-3 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 
//                                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//                           >
//                             {actionLoading === a.id ? 'Processing...' : '✗ Reject'}
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div> */}
//                   <div className="lg:hidden divide-y divide-gray-100">
//   {pending.map((a) => (
//     <div key={a.id} className="p-4">
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-lg">
//             {getTransactionIcon(a.transaction_type)}
//           </div>
//           <div>
//             <h4 className="font-semibold text-gray-800 capitalize">{a.transaction_type}</h4>
//             <p className="text-xs text-gray-500">#{a.transaction_id}</p>
//           </div>
//         </div>
//         <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
//           Pending
//         </span>
//       </div>

//       {a.description && (
//         <p className="text-sm text-gray-600 mb-2">{a.description}</p>
//       )}
//      {a.amount && a.amount > 0 && (
//   <p className="text-sm font-bold text-gray-800 mb-2">₦{Number(a.amount).toLocaleString()}</p>
// )}

//       <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
//         <div>
//           <p className="text-xs text-gray-500">Submitted By</p>
//           <p className="font-medium text-gray-700">{a.submitted_by_name}</p>
//         </div>
//         <div>
//           <p className="text-xs text-gray-500">Date</p>
//           <p className="font-medium text-gray-700">
//             {new Date(a.submitted_at).toLocaleDateString()}
//           </p>
//         </div>
//       </div>

//       <div className="flex gap-2">
//         <button
//           onClick={() => handleApprove(a.id)}
//           disabled={actionLoading === a.id}
//           className="flex-1 px-3 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 
//                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//         >
//           {actionLoading === a.id ? 'Processing...' : '✓ Approve'}
//         </button>
//         <button
//           onClick={() => handleReject(a.id)}
//           disabled={actionLoading === a.id}
//           className="flex-1 px-3 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 
//                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//         >
//           {actionLoading === a.id ? 'Processing...' : '✗ Reject'}
//         </button>
//       </div>
//     </div>
//   ))}
// </div>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* History Section */}
//           <div className={`${activeTab === 'pending' ? 'hidden lg:block' : ''}`}>
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//               <div className="px-4 lg:px-6 py-4 bg-gray-50 border-b">
//                 <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//                   <span>📋</span>
//                   <span>Approval History</span>
//                   <span className="text-sm text-gray-500 font-normal">
//                     ({history.length})
//                   </span>
//                 </h3>
//               </div>
              
//               {history.length === 0 ? (
//                 <div className="p-8 lg:p-12 text-center">
//                   <span className="text-4xl mb-3 block">📭</span>
//                   <p className="text-gray-500 font-medium">No history</p>
//                   <p className="text-gray-400 text-sm mt-1">Approved or rejected items will appear here</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Desktop Table */}
//                   <div className="hidden lg:block overflow-x-auto">
//                     <table className="w-full">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
//                           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Transaction</th>
//                           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Submitted By</th>
//                           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
//                           <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Approved By</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-100">
//                         {history.map((a) => {
//                           const statusBadge = getStatusBadge(a.status);
//                           return (
//                             <tr key={a.id} className="hover:bg-gray-50 transition-colors">
//                               <td className="px-6 py-4">
//                                 <div className="flex items-center gap-2">
//                                   <span>{getTransactionIcon(a.transaction_type)}</span>
//                                   <span className="text-sm font-medium capitalize">{a.transaction_type}</span>
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4 text-sm text-gray-600">#{a.transaction_id}</td>
//                               <td className="px-6 py-4 text-sm text-gray-600">{a.submitted_by_name}</td>
//                               <td className="px-6 py-4">
//                                 <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusBadge.color}`}>
//                                   {statusBadge.icon} {a.status}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4 text-sm text-gray-600">{a.approved_by_name || '-'}</td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Mobile Cards */}
//                   <div className="lg:hidden divide-y divide-gray-100">
//                     {history.map((a) => {
//                       const statusBadge = getStatusBadge(a.status);
//                       return (
//                         <div 
//                           key={a.id} 
//                           className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
//                           onClick={() => setSelectedApproval(selectedApproval?.id === a.id ? null : a)}
//                         >
//                           <div className="flex items-start justify-between mb-3">
//                             <div className="flex items-center gap-3">
//                               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
//                                 a.status === 'approved' ? 'bg-green-100' : 
//                                 a.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
//                               }`}>
//                                 {getTransactionIcon(a.transaction_type)}
//                               </div>
//                               <div>
//                                 <h4 className="font-semibold text-gray-800 capitalize">{a.transaction_type}</h4>
//                                 <p className="text-xs text-gray-500">#{a.transaction_id}</p>
//                               </div>
//                             </div>
//                             <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusBadge.color}`}>
//                               {statusBadge.icon} {a.status}
//                             </span>
//                           </div>

//                           <div className="grid grid-cols-2 gap-3 text-sm">
//                             <div>
//                               <p className="text-xs text-gray-500">Submitted By</p>
//                               <p className="font-medium text-gray-700">{a.submitted_by_name}</p>
//                             </div>
//                             <div>
//                               <p className="text-xs text-gray-500">Date</p>
//                               <p className="font-medium text-gray-700">
//                                 {new Date(a.submitted_at).toLocaleDateString()}
//                               </p>
//                             </div>
//                           </div>

//                           {/* Expanded Details */}
//                           {selectedApproval?.id === a.id && (
//                             <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-fadeIn">
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-500">Approved/Rejected By</span>
//                                 <span className="font-medium">{a.approved_by_name || '-'}</span>
//                               </div>
//                               {a.approved_at && (
//                                 <div className="flex justify-between text-sm">
//                                   <span className="text-gray-500">Action Date</span>
//                                   <span className="font-medium">
//                                     {new Date(a.approved_at).toLocaleDateString()}
//                                   </span>
//                                 </div>
//                               )}
//                               {a.comments && (
//                                 <div className="flex justify-between text-sm">
//                                   <span className="text-gray-500">Comments</span>
//                                   <span className="font-medium text-right max-w-[200px]">{a.comments}</span>
//                                 </div>
//                               )}
//                             </div>
//                           )}

//                           {/* Expand Indicator */}
//                           <div className="flex justify-center mt-2">
//                             <svg 
//                               className={`w-5 h-5 text-gray-400 transition-transform ${
//                                 selectedApproval?.id === a.id ? 'rotate-180' : ''
//                               }`} 
//                               fill="none" 
//                               stroke="currentColor" 
//                               viewBox="0 0 24 24"
//                             >
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </Layout>
//   );
// };

// export default Approvals;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Approval {
  id: number;
  transaction_type: string;
  transaction_id: number;
  description: string;
  amount: number;
  submitted_by_name: string;
  status: string;
  submitted_at: string;
  approved_by_name: string | null;
  approved_at: string | null;
  comments: string | null;
  step_id?: number;
  step_order?: number;
  step_comments?: string;
  chain?: string;
   total_steps?: number;
   previous_comments?: string;
}

const Approvals = () => {
  const [pending, setPending] = useState<Approval[]>([]);
  const [history, setHistory] = useState<Approval[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'submissions'>('pending');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showComment, setShowComment] = useState(false);

  // Multi-step form
  const [showMultiForm, setShowMultiForm] = useState(false);
  const [multiType, setMultiType] = useState('purchase');
  const [multiDescription, setMultiDescription] = useState('');
  const [multiAmount, setMultiAmount] = useState('');
const [steps, setSteps] = useState<{role: string}[]>([
  { role: 'manager' },
  { role: 'accountant' },
  { role: 'manager' },
]);

const { user } = useAuth();
  const isHR = user?.role === 'hr_payroll';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, historyRes, submissionsRes] = await Promise.all([
        api.get('/approvals/pending'),
        api.get('/approvals/history'),
        api.get('/approvals/my-submissions'),
      ]);
      setPending(pendingRes.data);
      setHistory(historyRes.data);
      setMySubmissions(submissionsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleRecordPayment = async (a: Approval) => {
  const expenseAccount = prompt('Enter expense account ID (default 27 = Office Supplies):');
  const bankAccount = prompt('Enter bank account ID (default 4 = GTBank):');
  
  if (!confirm(`Record payment of ₦${Number(a.amount).toLocaleString()} for "${a.description}"?`)) return;
  
  try {
    await api.post(`/approvals/${a.id}/record-payment`, {
      expense_account_id: parseInt(expenseAccount || '27'),
      bank_account_id: parseInt(bankAccount || '4'),
    });
    toast.success('Payment recorded and posted to GL');
    fetchData();
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Failed to record payment');
  }
};
  const handleApprove = async (stepId: number) => {
    setActionLoading(stepId);
    try {
      await api.post(`/approvals/steps/${stepId}/act`, {
        action: 'approved',
        comments: commentText || undefined,
      });
      toast.success('Approved');
      setSelectedApproval(null);
      setCommentText('');
      setShowComment(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (stepId: number) => {
    setActionLoading(stepId);
    try {
      await api.post(`/approvals/steps/${stepId}/act`, {
        action: 'rejected',
        comments: commentText || 'Rejected',
      });
      toast.success('Rejected');
      setSelectedApproval(null);
      setCommentText('');
      setShowComment(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitForApproval = async () => {
    const type = prompt('Transaction type (journal/invoice/bill):');
    const id = prompt('Transaction ID:');
    if (!type || !id) return;
    try {
      await api.post('/approvals/submit', {
        transaction_type: type,
        transaction_id: parseInt(id),
      });
      toast.success('Submitted for approval');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, string> = {
      journal: '📒',
      invoice: '🧾',
      bill: '💳',
      payment: '💸',
      payroll: '💰',
      purchase: '🛒',
      salary: '💵',
      other: '📋',
    };
    return icons[type] || '📋';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return { color: 'bg-green-100 text-green-800', icon: '✓' };
      case 'rejected': return { color: 'bg-red-100 text-red-800', icon: '✗' };
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
      case 'active': return { color: 'bg-blue-100 text-blue-800', icon: '🔵' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: '•' };
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Approvals</h2>
            <p className="text-gray-500 mt-1 text-sm">Maker-Checker workflow</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmitForApproval} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium">
              + Submit for Approval
            </button>
            <button onClick={() => setShowMultiForm(!showMultiForm)} className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium">
              🔄 Multi-Step
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Step Form */}
      {showMultiForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold mb-4">New Approval Request</h3>
          <div className="space-y-4 mb-4">
            <select value={multiType} onChange={e => setMultiType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="purchase">Purchase Request</option>
              <option value="salary">Salary Approval</option>
              <option value="payment">Payment Request</option>
              <option value="other">Other</option>
            </select>
            <textarea value={multiDescription} onChange={e => setMultiDescription(e.target.value)} placeholder="Describe what you're requesting..." className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
            <input type="number" value={multiAmount} onChange={e => setMultiAmount(e.target.value)} placeholder="Amount (₦) — optional" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <p className="text-sm text-gray-600 mb-2">Approval chain:</p>
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 w-14">Step {i + 1}:</span>
              <select value={s.role} onChange={e => {
                const newSteps = [...steps];
                newSteps[i].role = e.target.value;
                setSteps(newSteps);
              }} className="flex-1 px-3 py-2 border rounded-lg text-sm">
                <option value="manager">MD</option>
                <option value="accountant">Accountant</option>
                <option value="hr_payroll">HR</option>
                <option value="admin">Admin</option>
              </select>
              {i > 0 && <button onClick={() => setSteps(steps.filter((_, idx) => idx !== i))} className="text-red-500 text-sm">Remove</button>}
            </div>
          ))}
          <button onClick={() => setSteps([...steps, { role: 'manager' }])} className="text-blue-600 text-sm mb-4">+ Add Step</button>
          <button onClick={async () => {
            if (!multiDescription.trim()) { toast.error('Please enter a description'); return; }
            try {
              await api.post('/approvals/submit-multi', {
                request_type: multiType,
                description: multiDescription,
                amount: parseFloat(multiAmount) || 0,
                steps,
              });
              toast.success('Approval request submitted');
              setShowMultiForm(false);
              setMultiDescription('');
              setMultiAmount('');
              fetchData();
            } catch (err: any) {
              toast.error(err.response?.data?.error || 'Failed');
            }
          }} className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            Submit Approval Request
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          ⏳ My Approvals ({pending.length})
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          📋 History ({history.length})
        </button>
        <button onClick={() => setActiveTab('submissions')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'submissions' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          📤 My Requests ({mySubmissions.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {/* My Approvals (items waiting for me) */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-yellow-50 border-b">
                <h3 className="font-semibold text-gray-700">⏳ Waiting for Your Approval</h3>
              </div>
              {pending.length === 0 ? (
                <div className="p-12 text-center text-gray-500">✅ Nothing waiting for you</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">Description</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-left">Submitted By</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pending.map((a) => (
                        <tr key={a.step_id || a.id}>
                          <td className="px-6 py-3">
                            <span className="capitalize">{getTransactionIcon(a.transaction_type)} {a.transaction_type}</span>
                          </td>
                          <td className="px-6 py-3 text-gray-600">{a.description || '-'}</td>
                          <td className="px-6 py-3 text-right font-medium">₦{Number(a.amount || 0).toLocaleString()}</td>
                          <td className="px-6 py-3">{a.submitted_by_name}</td>
                          <td className="px-6 py-3 text-gray-500">{new Date(a.submitted_at).toLocaleDateString()}</td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => { setSelectedApproval(a); setShowComment(false); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium">👁️ View</button>
                              <button onClick={() => { setSelectedApproval(a); setShowComment(true); }} className="text-green-600 hover:text-green-800 text-sm font-medium">✓ Approve</button>
                              <button onClick={() => { setSelectedApproval(a); setShowComment(true); }} className="text-red-600 hover:text-red-800 text-sm font-medium">✗ Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* History */}
      {activeTab === 'history' && (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="px-6 py-4 bg-gray-50 border-b">
      <h3 className="font-semibold text-gray-700">📋 History</h3>
    </div>
    {history.length === 0 ? (
      <div className="p-12 text-center text-gray-500">No history</div>
    ) : (
      <>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-left">Submitted By</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Approved By</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((a) => {
                const badge = getStatusBadge(a.status);
                return (
                  <tr key={a.id}>
                    <td className="px-6 py-3 capitalize">{getTransactionIcon(a.transaction_type)} {a.transaction_type}</td>
                    <td className="px-6 py-3 text-gray-600">{a.description || '-'}</td>
                    <td className="px-6 py-3 text-right">₦{Number(a.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-3">{a.submitted_by_name}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>{badge.icon} {a.status}</span>
                    </td>
                    <td className="px-6 py-3">{a.approved_by_name || '-'}</td>
                    <td className="px-6 py-3">
                      <button onClick={() => setSelectedApproval(a)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                        👁️ View
                      </button>
                      {user?.role === 'accountant' && a.status === 'approved' && !a.transaction_id && (
                        <button onClick={() => handleRecordPayment(a)} className="text-green-600 hover:text-green-800 text-sm font-medium">
                          💰 Record
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {history.map((a) => {
            const badge = getStatusBadge(a.status);
            return (
              <div key={a.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                      a.status === 'approved' ? 'bg-green-100' : a.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {getTransactionIcon(a.transaction_type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-800 capitalize">{a.transaction_type}</h4>
                      <p className="text-xs text-gray-500 truncate">{a.description || '-'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${badge.color}`}>
                    {badge.icon} {a.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-bold">₦{Number(a.amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submitted By</p>
                    <p className="font-medium">{a.submitted_by_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Approved By</p>
                    <p className="font-medium">{a.approved_by_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">{new Date(a.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setSelectedApproval(a)} className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                    👁️ View / Print
                  </button>
                  {user?.role === 'accountant' && a.status === 'approved' && !a.transaction_id && (
                    <button onClick={() => handleRecordPayment(a)} className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
                      💰 Record Payment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    )}
  </div>
)}

          {/* My Submissions */}
          {activeTab === 'submissions' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 border-b">
                <h3 className="font-semibold text-gray-700">📤 My Requests</h3>
              </div>
              {mySubmissions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No requests submitted yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">Description</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Approval Chain</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mySubmissions.map((a) => {
                        const badge = getStatusBadge(a.status);
                        return (
                          <tr key={a.id}>
                            <td className="px-6 py-3 capitalize">{getTransactionIcon(a.transaction_type)} {a.transaction_type}</td>
                            <td className="px-6 py-3 text-gray-600">{a.description || '-'}</td>
                            <td className="px-6 py-3 text-right">₦{Number(a.amount || 0).toLocaleString()}</td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>{badge.icon} {a.status}</span>
                            </td>
<td className="px-6 py-3">
  {user?.role === 'accountant' && a.status === 'approved' && (
    <button 
      onClick={() => handleRecordPayment(a)}
      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
    >
      💰 Record Payment
    </button>
  )}
</td>
                            <td className="px-6 py-3 text-xs text-gray-500">{a.chain || '-'}</td>
                            <td className="px-6 py-3 text-gray-500">{new Date(a.submitted_at).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* View/Approve Modal */}
   {selectedApproval && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 no-print" onClick={() => { setSelectedApproval(null); setShowComment(false); }} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 print-area max-h-[90vh] overflow-y-auto">
      
      {/* Company Header */}
     <div className="text-center mb-4 border-b pb-3">
<img src="/logo.png" alt="Galaxy ITT" className="h-10 mx-auto mb-2" />
  <p className="text-sm text-gray-500">Approval Document</p>
  <p className="text-xs text-gray-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
</div>

      <h3 className="text-lg font-bold mb-4">Approval Request</h3>
      
      <div className="space-y-3 text-sm">
        <p><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{selectedApproval.transaction_type}</span></p>
        <p><span className="text-gray-500">Description:</span> <span className="font-medium">{selectedApproval.description || '-'}</span></p>
        <p><span className="text-gray-500">Amount:</span> <span className="font-bold">₦{Number(selectedApproval.amount || 0).toLocaleString()}</span></p>
        <p><span className="text-gray-500">Submitted By:</span> <span className="font-medium">{selectedApproval.submitted_by_name}</span></p>
        <p><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(selectedApproval.submitted_at).toLocaleDateString()}</span></p>
    
        {selectedApproval.previous_comments && (
          <div className="bg-gray-50 p-3 rounded-lg mt-2">
            <p className="text-xs text-gray-500 font-medium mb-1">Previous Comments:</p>
            <p className="text-sm text-gray-700">{selectedApproval.previous_comments}</p>
          </div>
        )}
      </div>

      {/* Signature Section — prints only */}
      <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-xs">
        <div className="text-center">
          <div className="border-t border-gray-400 pt-1 mt-8">Requested By</div>
          <p className="text-gray-600 mt-1">{selectedApproval.submitted_by_name}</p>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 pt-1 mt-8">Reviewed By</div>
          <p className="text-gray-600 mt-1">{selectedApproval.approved_by_name || 'Pending'}</p>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 pt-1 mt-8">Final Approval</div>
          <p className="text-gray-600 mt-1">_________________</p>
        </div>
      </div>

      {showComment && (
        <div className="mt-4 no-print">
          <label className="block text-sm font-medium mb-1">Your Comment (optional)</label>
          <textarea value={commentText} onChange={e => setCommentText(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Add a comment..." />
        </div>
      )}

      <div className="flex gap-2 mt-4 no-print">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
          🖨️ Print
        </button>
        {showComment ? (
          <>
            <button 
              onClick={() => handleApprove(selectedApproval.step_id!)} 
              disabled={actionLoading === selectedApproval.step_id} 
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {actionLoading === selectedApproval.step_id ? '...' : 
                selectedApproval.total_steps && selectedApproval.step_order && 
                selectedApproval.step_order < selectedApproval.total_steps 
                  ? '→ Forward' 
                  : '✓ Final Approve'}
            </button>
            <button onClick={() => handleReject(selectedApproval.step_id!)} disabled={actionLoading === selectedApproval.step_id} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {actionLoading === selectedApproval.step_id ? '...' : '✗ Reject'}
            </button>
          </>
        ) : (
          <button onClick={() => setSelectedApproval(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Close</button>
        )}
      </div>
    </div>
  </div>
)}
    </Layout>
  );
};

export default Approvals;