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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import DocumentUpload from '../components/DocumentUpload';

interface JournalEntry {
  id: number;
  entry_number: string;
  description: string;
  entry_date: string;
  period: string;
  status: string;
  created_by_name: string;
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

  const perPage = 10;


  useEffect(() => {
  fetchEntries();
  fetchBranches();
}, []);


  useEffect(() => { fetchEntries(); }, []);

  useEffect(() => {
    const filtered = entries.filter(e =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.entry_number.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredEntries(filtered);
    setCurrentPage(1);
  }, [search, entries]);

  const fetchBranches = async () => {
  const response = await api.get('/branches');
  setBranches(response.data);
};
  const fetchEntries = async () => {
    try {
      const response = await api.get('/journals');
      setEntries(response.data);
      setFilteredEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
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
    }
  };

  const totalPages = Math.ceil(filteredEntries.length / perPage);
  const paginated = filteredEntries.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      posted: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
    <div className="mb-6 flex justify-between items-center">
  <div>
    <h2 className="text-2xl font-bold text-gray-800">General Ledger</h2>
    <p className="text-gray-500 mt-1">{entries.length} journal entries</p>
  </div>
  <div className="flex gap-2">
    <button
      onClick={() => navigate('/general-ledger/new')}
      className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition shadow-sm text-sm font-medium"
    >
      + New Journal Entry
    </button>
    <button
      onClick={() => navigate('/general-ledger/recurring')}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
    >
      🔄 Recurring
    </button>
  </div>
</div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search by description or entry number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        
      </div>

<select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm">
  <option value="">All Branches</option>
  {branches.map((b: any) => (
    <option key={b.id} value={b.id}>{b.name}</option>
  ))}
</select>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">Loading...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          {search ? 'No entries match your search.' : 'No journal entries yet.'}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entry #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-blue-900">{entry.entry_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(entry.entry_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{entry.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entry.period}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entry.created_by_name}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => fetchEntryDetails(entry.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 bg-white rounded-xl shadow-sm px-6 py-3">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredEntries.length)} of {filteredEntries.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded text-sm ${currentPage === i + 1 ? 'bg-blue-900 text-white' : 'border'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedEntry.entry_number}</h3>
                <p className="text-sm text-gray-500">{selectedEntry.description}</p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div><span className="text-gray-500">Date:</span><span className="ml-2 font-medium">{new Date(selectedEntry.entry_date).toLocaleDateString()}</span></div>
                <div><span className="text-gray-500">Period:</span><span className="ml-2 font-medium">{selectedEntry.period}</span></div>
                <div><span className="text-gray-500">Status:</span><span className="ml-2 font-medium capitalize">{selectedEntry.status}</span></div>
              </div>
              <table className="w-full text-sm">
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
                      <td className="px-4 py-3"><span className="font-medium">{line.account_code}</span><span className="text-gray-500 ml-2">{line.account_name}</span></td>
                      <td className="px-4 py-3 text-gray-600">{line.description}</td>
                      <td className="px-4 py-3 text-right font-medium">{line.debit > 0 ? `₦${Number(line.debit).toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-right font-medium">{line.credit > 0 ? `₦${Number(line.credit).toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-right">Totals:</td>
                    <td className="px-4 py-3 text-right">₦{selectedEntry.lines?.reduce((sum, l) => sum + Number(l.debit), 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">₦{selectedEntry.lines?.reduce((sum, l) => sum + Number(l.credit), 0).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              <DocumentUpload transactionType="journal" transactionId={selectedEntry.id} />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GeneralLedger;