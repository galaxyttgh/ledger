// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { useNavigate } from 'react-router-dom';
// import DocumentUpload from '../components/DocumentUpload';

// interface JournalEntry {
//   id: number;
//   entry_number: string;
//   description: string;
//   entry_date: string;
//   period: string;
//   status: string;
//   created_by_name: string;
//   lines: JournalLine[];
// }

// interface JournalLine {
//   id: number;
//   account_id: number;
//   account_code: string;
//   account_name: string;
//   description: string;
//   debit: number;
//   credit: number;
// }

// const GeneralLedger = () => {
//   const [entries, setEntries] = useState<JournalEntry[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchEntries();
//   }, []);

//   const fetchEntries = async () => {
//     try {
//       const response = await api.get('/journals');
//       setEntries(response.data);
//     } catch (error) {
//       console.error('Failed to fetch entries:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEntryDetails = async (id: number) => {
//     try {
//       const response = await api.get(`/journals/${id}`);
//       setSelectedEntry(response.data);
//     } catch (error) {
//       console.error('Failed to fetch entry details:', error);
//     }
//   };

//   return (
//     <Layout>

// <div className="mb-6 flex justify-between items-center">
//   <div>
//     <h2 className="text-2xl font-bold text-gray-800">General Ledger</h2>
//     <p className="text-gray-500 mt-1">Journal entries and transactions</p>
//   </div>
//   <button
//     onClick={() => navigate('/general-ledger/new')}
//     className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
//   >
//     + New Journal Entry
//   </button>
// </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry #</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {entries.length === 0 ? (
//                 <tr>
//                   <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
//                     No journal entries found
//                   </td>
//                 </tr>
//               ) : (
//                 entries.map((entry) => (
//                   <tr key={entry.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 text-sm font-medium text-blue-900">{entry.entry_number}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {new Date(entry.entry_date).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-800">{entry.description}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{entry.period}</td>
//                     <td className="px-6 py-4">
//                       <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
//                         {entry.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{entry.created_by_name}</td>
//                     <td className="px-6 py-4">
//                       <button
//                         onClick={() => fetchEntryDetails(entry.id)}
//                         className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Entry Details Modal */}
//       {selectedEntry && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
//             <div className="p-6 border-b flex justify-between items-center">
//               <h3 className="text-lg font-bold text-gray-800">
//                 {selectedEntry.entry_number} - {selectedEntry.description}
//               </h3>
//               <button
//                 onClick={() => setSelectedEntry(null)}
//                 className="text-gray-400 hover:text-gray-600 text-2xl"
//               >
//                 ×
//               </button>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
//                 <div>
//                   <span className="text-gray-500">Date:</span>
//                   <span className="ml-2 font-medium">{new Date(selectedEntry.entry_date).toLocaleDateString()}</span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Period:</span>
//                   <span className="ml-2 font-medium">{selectedEntry.period}</span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Status:</span>
//                   <span className="ml-2 font-medium capitalize">{selectedEntry.status}</span>
//                 </div>
//               </div>

//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-gray-500">Account</th>
//                     <th className="px-4 py-2 text-left text-gray-500">Description</th>
//                     <th className="px-4 py-2 text-right text-gray-500">Debit</th>
//                     <th className="px-4 py-2 text-right text-gray-500">Credit</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {selectedEntry.lines?.map((line) => (
//                     <tr key={line.id}>
//                       <td className="px-4 py-3">
//                         <span className="font-medium">{line.account_code}</span>
//                         <span className="text-gray-500 ml-2">{line.account_name}</span>
//                       </td>
//                       <td className="px-4 py-3 text-gray-600">{line.description}</td>
//                       <td className="px-4 py-3 text-right">
//                         {line.debit > 0 ? `₦${Number(line.debit).toLocaleString()}` : '-'}
//                       </td>
//                       <td className="px-4 py-3 text-right">
//                         {line.credit > 0 ? `₦${Number(line.credit).toLocaleString()}` : '-'}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot className="bg-gray-50 font-bold">
//                   <tr>
//                     <td colSpan={2} className="px-4 py-3 text-right">Totals:</td>
//                     <td className="px-4 py-3 text-right">
//                       ₦{selectedEntry.lines?.reduce((sum, l) => sum + Number(l.debit), 0).toLocaleString()}
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       ₦{selectedEntry.lines?.reduce((sum, l) => sum + Number(l.credit), 0).toLocaleString()}
//                     </td>
//                   </tr>
//                 </tfoot>
//                      <DocumentUpload transactionType="journal" transactionId={selectedEntry.id} />
//               </table>
//             </div>
//           </div>

//         </div>
//       )}
//     </Layout>
//   );
// };

// export default GeneralLedger;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import DocumentUpload from '../components/DocumentUpload';
// import { toast } from 'react-hot-toast/headless';

// interface JournalEntry {
//   id: number;
//   entry_number: string;
//   description: string;
//   entry_date: string;
//   period: string;
//   status: string;
//   created_by_name: string;
//   lines: JournalLine[];
// }

// interface JournalLine {
//   id: number;
//   account_id: number;
//   account_code: string;
//   account_name: string;
//   description: string;
//   debit: number;
//   credit: number;
// }

// const GeneralLedger = () => {
//   const navigate = useNavigate();
//   const [entries, setEntries] = useState<JournalEntry[]>([]);
//   const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
//   const [search, setSearch] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [branches, setBranches] = useState<any[]>([]);
// const [branchFilter, setBranchFilter] = useState('');

//   const perPage = 10;


//   useEffect(() => {
//   fetchEntries();
//   fetchBranches();
// }, []);


//   useEffect(() => { fetchEntries(); }, []);

//   useEffect(() => {
//     const filtered = entries.filter(e =>
//       e.description.toLowerCase().includes(search.toLowerCase()) ||
//       e.entry_number.toLowerCase().includes(search.toLowerCase())
//     );
//     setFilteredEntries(filtered);
//     setCurrentPage(1);
//   }, [search, entries]);


//   const handleReverse = async (id: number) => {
//   const date = prompt('Reversal date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
//   const reason = prompt('Reason:');
//   if (!date) return;
//   try {
//     await api.post(`/journals/${id}/reverse`, { reversal_date: date, reason });
//     toast.success('Journal reversed');
//     fetchEntries();
//   } catch (err: any) {
//     toast.error(err.response?.data?.error || 'Reversal failed');
//   }
// };
//   const fetchBranches = async () => {
//   const response = await api.get('/branches');
//   setBranches(response.data);
// };
//   const fetchEntries = async () => {
//     try {
//       const response = await api.get('/journals');
//       setEntries(response.data);
//       setFilteredEntries(response.data);
//     } catch (error) {
//       console.error('Failed to fetch entries:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEntryDetails = async (id: number) => {
//     try {
//       const response = await api.get(`/journals/${id}`);
//       setSelectedEntry(response.data);
//     } catch (error) {
//       console.error('Failed to fetch entry details:', error);
//     }
//   };

//   const totalPages = Math.ceil(filteredEntries.length / perPage);
//   const paginated = filteredEntries.slice((currentPage - 1) * perPage, currentPage * perPage);

//   const getStatusBadge = (status: string) => {
//     const colors: Record<string, string> = {
//       posted: 'bg-green-100 text-green-800',
//       draft: 'bg-gray-100 text-gray-800',
//       approved: 'bg-blue-100 text-blue-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   return (
//     <Layout>
//     <div className="mb-6 flex justify-between items-center">
//   <div>
//     <h2 className="text-2xl font-bold text-gray-800">General Ledger</h2>
//     <p className="text-gray-500 mt-1">{entries.length} journal entries</p>
//   </div>
//   <div className="flex gap-2">
//     <button
//       onClick={() => navigate('/general-ledger/new')}
//       className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition shadow-sm text-sm font-medium"
//     >
//       + New Journal Entry
//     </button>
//     <button
//       onClick={() => navigate('/general-ledger/recurring')}
//       className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
//     >
//       🔄 Recurring
//     </button>
//   </div>
// </div>

//       {/* Search */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="🔍 Search by description or entry number..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
//         />
        
//       </div>

// <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm">
//   <option value="">All Branches</option>
//   {branches.map((b: any) => (
//     <option key={b.id} value={b.id}>{b.name}</option>
//   ))}
// </select>

//       {loading ? (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">Loading...</div>
//       ) : filteredEntries.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
//           {search ? 'No entries match your search.' : 'No journal entries yet.'}
//         </div>
//       ) : (
//         <>
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entry #</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created By</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {paginated.map((entry) => (
//                   <tr key={entry.id} className="hover:bg-gray-50 transition">
//                     <td className="px-6 py-4 text-sm font-medium text-blue-900">{entry.entry_number}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{new Date(entry.entry_date).toLocaleDateString()}</td>
//                     <td className="px-6 py-4 text-sm text-gray-800 font-medium">{entry.description}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{entry.period}</td>
//                     <td className="px-6 py-4">
//                       <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(entry.status)}`}>
//                         {entry.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{entry.created_by_name}</td>
//                     <td className="px-6 py-4">
//                       <button
//                         onClick={() => fetchEntryDetails(entry.id)}
//                         className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//                       >
//                         View
//                       </button>
//                       <button onClick={() => handleReverse(entry.id)} className="text-orange-600 hover:text-orange-800 text-sm font-medium ml-2">↩️ Reverse</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-between items-center mt-4 bg-white rounded-xl shadow-sm px-6 py-3">
//               <p className="text-sm text-gray-500">
//                 Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredEntries.length)} of {filteredEntries.length}
//               </p>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="px-3 py-1 border rounded text-sm disabled:opacity-50"
//                 >
//                   ← Prev
//                 </button>
//                 {Array.from({ length: totalPages }, (_, i) => (
//                   <button
//                     key={i}
//                     onClick={() => setCurrentPage(i + 1)}
//                     className={`px-3 py-1 rounded text-sm ${currentPage === i + 1 ? 'bg-blue-900 text-white' : 'border'}`}
//                   >
//                     {i + 1}
//                   </button>
//                 ))}
//                 <button
//                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-1 border rounded text-sm disabled:opacity-50"
//                 >
//                   Next →
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* Detail Modal */}
//       {selectedEntry && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-auto">
//             <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
//               <div>
//                 <h3 className="text-lg font-bold text-gray-800">{selectedEntry.entry_number}</h3>
//                 <p className="text-sm text-gray-500">{selectedEntry.description}</p>
//               </div>
//               <button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
//                 <div><span className="text-gray-500">Date:</span><span className="ml-2 font-medium">{new Date(selectedEntry.entry_date).toLocaleDateString()}</span></div>
//                 <div><span className="text-gray-500">Period:</span><span className="ml-2 font-medium">{selectedEntry.period}</span></div>
//                 <div><span className="text-gray-500">Status:</span><span className="ml-2 font-medium capitalize">{selectedEntry.status}</span></div>
//               </div>
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-gray-500 font-medium">Account</th>
//                     <th className="px-4 py-3 text-left text-gray-500 font-medium">Description</th>
//                     <th className="px-4 py-3 text-right text-gray-500 font-medium">Debit</th>
//                     <th className="px-4 py-3 text-right text-gray-500 font-medium">Credit</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {selectedEntry.lines?.map((line) => (
//                     <tr key={line.id}>
//                       <td className="px-4 py-3"><span className="font-medium">{line.account_code}</span><span className="text-gray-500 ml-2">{line.account_name}</span></td>
//                       <td className="px-4 py-3 text-gray-600">{line.description}</td>
//                       <td className="px-4 py-3 text-right font-medium">{line.debit > 0 ? `₦${Number(line.debit).toLocaleString()}` : '-'}</td>
//                       <td className="px-4 py-3 text-right font-medium">{line.credit > 0 ? `₦${Number(line.credit).toLocaleString()}` : '-'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot className="bg-gray-50 font-bold">
//                   <tr>
//                     <td colSpan={2} className="px-4 py-3 text-right">Totals:</td>
//                     <td className="px-4 py-3 text-right">₦{selectedEntry.lines?.reduce((sum, l) => sum + Number(l.debit), 0).toLocaleString()}</td>
//                     <td className="px-4 py-3 text-right">₦{selectedEntry.lines?.reduce((sum, l) => sum + Number(l.credit), 0).toLocaleString()}</td>
//                   </tr>
//                 </tfoot>
//               </table>
//               <DocumentUpload transactionType="journal" transactionId={selectedEntry.id} />
//             </div>
//           </div>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default GeneralLedger;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import DocumentUpload from '../components/DocumentUpload';
import toast from 'react-hot-toast';

interface JournalEntry {
  id: number;
  entry_number: string;
  description: string;
  entry_date: string;
  period: string;
  status: string;
  created_by_name: string;
  branch_name?: string;
  lines: JournalLine[];
}

interface JournalLine {
  id: number;
  account_id: number;
  account_code: string;
  account_name: string;
  description: string;
  debit: number;
  credit: number;
}

const GeneralLedger = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [reverseModal, setReverseModal] = useState<{ id: number; date: string; reason: string } | null>(null);

  const perPage = 10;

  useEffect(() => {
    fetchEntries();
    fetchBranches();
  }, []);

  useEffect(() => {
    let filtered = entries;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(e =>
        e.description.toLowerCase().includes(searchLower) ||
        e.entry_number.toLowerCase().includes(searchLower) ||
        e.created_by_name?.toLowerCase().includes(searchLower)
      );
    }
    
    if (branchFilter) {
      filtered = filtered.filter(e => e.branch_name === branches.find(b => b.id.toString() === branchFilter)?.name);
    }
    
    if (statusFilter) {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    
    setFilteredEntries(filtered);
    setCurrentPage(1);
  }, [search, branchFilter, statusFilter, entries, branches]);

  const handleReverse = (id: number) => {
    setReverseModal({
      id,
      date: new Date().toISOString().split('T')[0],
      reason: '',
    });
  };

  const confirmReverse = async () => {
    if (!reverseModal) return;
    
    try {
      await api.post(`/journals/${reverseModal.id}/reverse`, {
        reversal_date: reverseModal.date,
        reason: reverseModal.reason,
      });
      toast.success('Journal reversed successfully');
      setReverseModal(null);
      fetchEntries();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Reversal failed');
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await api.get('/journals');
      setEntries(response.data);
      setFilteredEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntryDetails = async (id: number) => {
    try {
      const response = await api.get(`/journals/${id}`);
      setSelectedEntry(response.data);
    } catch (error) {
      console.error('Failed to fetch entry details:', error);
      toast.error('Failed to load entry details');
    }
  };

  const totalPages = Math.ceil(filteredEntries.length / perPage);
  const paginated = filteredEntries.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      posted: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      reversed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setSearch('');
    setBranchFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = search || branchFilter || statusFilter;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">General Ledger</h2>
            <p className="text-gray-500 mt-1 text-sm">{entries.length} journal entries</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/general-ledger/new')}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       active:bg-blue-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              + New Journal Entry
            </button>
            <button
              onClick={() => navigate('/general-ledger/recurring')}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 
                       active:bg-purple-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              🔄 Recurring
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by description, entry number, or creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors
              ${hasActiveFilters 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <span className="flex items-center gap-2">
              <span>🔧</span>
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </span>
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Branch</label>
              <select 
                value={branchFilter} 
                onChange={(e) => setBranchFilter(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
                <option value="approved">Approved</option>
                <option value="reversed">Reversed</option>
              </select>
            </div>
            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 text-sm text-blue-600 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
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
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">📒</span>
          <p className="text-gray-500 font-medium">
            {hasActiveFilters ? 'No entries match your filters' : 'No journal entries yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {hasActiveFilters ? 'Try adjusting your search or filters' : 'Create your first journal entry'}
          </p>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="mt-3 text-blue-600 text-sm font-medium hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Entry #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Created By</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-blue-900">{entry.entry_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{entry.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entry.period}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entry.created_by_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchEntryDetails(entry.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleReverse(entry.id)} 
                          className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                        >
                          ↩️ Reverse
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {paginated.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-blue-900">{entry.entry_number}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadge(entry.status)}`}>
                          {entry.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium truncate">{entry.description}</p>
                    </div>
                    <button
                      onClick={() => fetchEntryDetails(entry.id)}
                      className="ml-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium 
                               hover:bg-blue-100 transition-colors flex-shrink-0"
                    >
                      View
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="block text-gray-400">Date</span>
                      <span className="font-medium text-gray-700">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Period</span>
                      <span className="font-medium text-gray-700">{entry.period}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Created By</span>
                      <span className="font-medium text-gray-700 truncate block">{entry.created_by_name}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => fetchEntryDetails(entry.id)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium 
                               hover:bg-blue-100 transition-colors"
                    >
                      📋 View Details
                    </button>
                    <button 
                      onClick={() => handleReverse(entry.id)} 
                      className="flex-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium 
                               hover:bg-orange-100 transition-colors"
                    >
                      ↩️ Reverse
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 bg-white rounded-xl shadow-sm px-4 lg:px-6 py-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <p className="text-sm text-gray-500 text-center sm:text-left">
                  Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredEntries.length)} of {filteredEntries.length}
                </p>
                <div className="flex justify-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                          currentPage === pageNum 
                            ? 'bg-blue-900 text-white' 
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEntry(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-4 lg:p-6 border-b flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedEntry.entry_number}</h3>
                <p className="text-sm text-gray-500">{selectedEntry.description}</p>
              </div>
              <button 
                onClick={() => setSelectedEntry(null)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 lg:p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-2 font-medium">{new Date(selectedEntry.entry_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Period:</span>
                  <span className="ml-2 font-medium">{selectedEntry.period}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium capitalize ${getStatusBadge(selectedEntry.status)}`}>
                    {selectedEntry.status}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">Account</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">Description</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">Debit</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedEntry.lines?.map((line) => (
                      <tr key={line.id}>
                        <td className="px-4 py-3">
                          <span className="font-medium">{line.account_code}</span>
                          <span className="text-gray-500 ml-2 text-xs">{line.account_name}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{line.description}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {line.debit > 0 ? `₦${Number(line.debit).toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {line.credit > 0 ? `₦${Number(line.credit).toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right">Totals:</td>
                      <td className="px-4 py-3 text-right text-green-600">
                        ₦{selectedEntry.lines?.reduce((sum, l) => sum + Number(l.debit), 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        ₦{selectedEntry.lines?.reduce((sum, l) => sum + Number(l.credit), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <DocumentUpload transactionType="journal" transactionId={selectedEntry.id} />
            </div>
          </div>
        </div>
      )}

      {/* Reverse Confirmation Modal */}
      {reverseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReverseModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Reverse Journal Entry</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reversal Date *</label>
                <input
                  type="date"
                  value={reverseModal.date}
                  onChange={(e) => setReverseModal({ ...reverseModal, date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={reverseModal.reason}
                  onChange={(e) => setReverseModal({ ...reverseModal, reason: e.target.value })}
                  placeholder="Reason for reversal..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setReverseModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                         hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmReverse}
                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 
                         transition-colors text-sm font-medium"
              >
                Confirm Reverse
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GeneralLedger;