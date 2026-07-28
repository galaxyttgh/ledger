// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';


// interface JournalEntry {
//   id: number;
//   entry_number: string;
//   description: string;
//   entry_date: string;
// }

// interface BankAccount {
//   id: number;
//   name: string;
//   account_number: string;
//   bank_name: string;
//   current_balance: number;
// }

// interface BankTransaction {
//   id: number;
//   transaction_date: string;
//   description: string;
//   reference: string;
//   amount: number;
//   type: string;
//   status: string;
//   entry_number: string | null;
// }

// const BankReconciliation = () => {
//   const [accounts, setAccounts] = useState<BankAccount[]>([]);
//   const [selectedAccount, setSelectedAccount] = useState('');
//   const [transactions, setTransactions] = useState<BankTransaction[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [importing, setImporting] = useState(false);
//   const [message, setMessage] = useState('');
// const [matchModal, setMatchModal] = useState(false);
// const [selectedTxnId, setSelectedTxnId] = useState<number | null>(null);
// const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
// const [matchLoading, setMatchLoading] = useState(false);

//   useEffect(() => {
//     fetchAccounts();
//   }, []);

//   useEffect(() => {
//     if (selectedAccount) {
//       fetchTransactions();
//     }
//   }, [selectedAccount]);

//   const fetchAccounts = async () => {
//     try {
//       const response = await api.get('/banking/accounts');
//       setAccounts(response.data);
//       if (response.data.length > 0) {
//         setSelectedAccount(response.data[0].id.toString());
//       }
//     } catch (error) {
//       console.error('Failed to fetch accounts:', error);
//     }
//   };

//   const fetchTransactions = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get('/banking/transactions', {
//         params: { bank_account_id: selectedAccount }
//       });
//       setTransactions(response.data);
//     } catch (error) {
//       console.error('Failed to fetch transactions:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setImporting(true);
//     setMessage('');

//     const formData = new FormData();
//     formData.append('statement', file);
//     formData.append('bank_account_id', selectedAccount);

//     try {
//       const response = await api.post('/banking/import', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setMessage(`✅ ${response.data.message}`);
//       fetchTransactions();
//     } catch (error) {
//       setMessage('❌ Import failed');
//     } finally {
//       setImporting(false);
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     return status === 'matched'
//       ? 'bg-green-100 text-green-800'
//       : 'bg-yellow-100 text-yellow-800';
//   };

//   const openMatchModal = async (txnId: number) => {
//   setSelectedTxnId(txnId);
//   try {
//     const response = await api.get('/journals');
//     setJournalEntries(response.data);
//   } catch (error) {
//     console.error('Failed to fetch journals:', error);
//   }
//   setMatchModal(true);
// };

// const handleMatch = async (journalEntryId: number) => {
//   if (!selectedTxnId) return;
//   setMatchLoading(true);
//   try {
//     await api.post('/banking/match', {
//       bank_transaction_id: selectedTxnId,
//       journal_entry_id: journalEntryId,
//     });
//     setMatchModal(false);
//     fetchTransactions();
//   } catch (error) {
//     console.error('Match failed:', error);
//   } finally {
//     setMatchLoading(false);
//   }
// };

// const handleAutoMatch = async () => {
//   try {
//     const response = await api.post('/banking/auto-match', {
//       bank_account_id: parseInt(selectedAccount),
//     });
//     setMessage(`✅ ${response.data.message}`);
//     fetchTransactions();
//   } catch (error) {
//     setMessage('❌ Auto-match failed');
//   }
// };

// const handleCertify = async () => {
//   if (!confirm('Certify this reconciliation? This will be logged in the audit trail.')) return;
//   try {
//     await api.post('/banking/certify', {
//       bank_account_id: parseInt(selectedAccount),
//     });
//     setMessage('✅ Reconciliation certified');
//   } catch (error) {
//     setMessage('❌ Certification failed');
//   }
// };
//   return (
//     <Layout>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Bank Reconciliation</h2>
//         <p className="text-gray-500 mt-1">Import statements and match transactions</p>
//       </div>

//       {/* Account Selector */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <div className="flex items-center gap-4">
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
//             <select
//               value={selectedAccount}
//               onChange={(e) => setSelectedAccount(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//             >
//               {accounts.map((acc) => (
//                 <option key={acc.id} value={acc.id}>
//                   {acc.bank_name} — {acc.name} ({acc.account_number})
//                 </option>
//               ))}
//             </select>
//           </div>
//   <div className="flex-1">
//   <label className="block text-sm font-medium text-gray-700 mb-1">Import Statement (CSV)</label>
//   <label className="w-full flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
//     <span className="text-gray-500">📂</span>
//     <span className="text-sm text-gray-600">{importing ? 'Importing...' : 'Choose CSV file'}</span>
//     <input
//       type="file"
//       accept=".csv"
//       onChange={handleFileUpload}
//       disabled={importing}
//       className="hidden"
//     />
//   </label>
// </div>
// <div className="flex gap-2 mt-4">
//   <button
//     onClick={handleAutoMatch}
//     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
//   >
//     🔍 Auto-Match
//   </button>
//   <button
//     onClick={handleCertify}
//     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
//   >
//     ✅ Certify Reconciliation
//   </button>
// </div>
//         </div>
//         {message && <p className="mt-3 text-sm">{message}</p>}
//       </div>

//       {/* Transactions */}
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <div className="px-6 py-4 bg-gray-50 border-b">
//           <h3 className="font-semibold text-gray-700">Bank Transactions</h3>
//         </div>

//         {loading ? (
//           <div className="text-center py-12 text-gray-500">Loading...</div>
//         ) : transactions.length === 0 ? (
//           <div className="text-center py-12 text-gray-500">
//             No transactions. Import a bank statement (CSV) to get started.
//           </div>
//         ) : (
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matched To</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {transactions.map((txn) => (
//                 <tr key={txn.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {new Date(txn.transaction_date).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-800">{txn.description}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{txn.reference || '-'}</td>
//                   <td className={`px-6 py-4 text-sm text-right font-medium ${
//                     txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
//                   }`}>
//                     ₦{Math.abs(txn.amount).toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(txn.status)}`}>
//                       {txn.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-sm text-blue-900">{txn.entry_number || '-'}</td>
//                   <td className="px-6 py-4">
//   {txn.status === 'unmatched' && (
//     <button
//       onClick={() => openMatchModal(txn.id)}
//       className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//     >
//       Match
//     </button>
    
//   )}
//   {transactions.length > 0 && (
//   <div className="grid grid-cols-4 gap-4 mb-4">
//     <div className="bg-white rounded-lg p-4 shadow text-center">
//       <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
//       <p className="text-sm text-gray-500">Total</p>
//     </div>
//     <div className="bg-white rounded-lg p-4 shadow text-center">
//       <p className="text-2xl font-bold text-green-600">
//         {transactions.filter(t => t.status === 'matched').length}
//       </p>
//       <p className="text-sm text-gray-500">Matched</p>
//     </div>
//     <div className="bg-white rounded-lg p-4 shadow text-center">
//       <p className="text-2xl font-bold text-yellow-600">
//         {transactions.filter(t => t.status === 'unmatched').length}
//       </p>
//       <p className="text-sm text-gray-500">Unmatched</p>
//     </div>
//     <div className="bg-white rounded-lg p-4 shadow text-center">
//       <p className="text-2xl font-bold text-blue-600">
//         {transactions.filter(t => t.status === 'matched').length > 0 && transactions.filter(t => t.status === 'unmatched').length === 0 ? '✓' : '—'}
//       </p>
//       <p className="text-sm text-gray-500">Certified</p>
//     </div>
//   </div>
// )}
// </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//       {/* Match Modal */}
// {matchModal && (
//   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//     <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[70vh] overflow-auto">
//       <div className="p-6 border-b flex justify-between items-center">
//         <h3 className="text-lg font-bold text-gray-800">Match to Journal Entry</h3>
//         <button onClick={() => setMatchModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
//       </div>
//       <div className="p-6">
//         {matchLoading ? (
//           <p className="text-center text-gray-500">Matching...</p>
//         ) : journalEntries.length === 0 ? (
//           <p className="text-center text-gray-500">No journal entries found</p>
//         ) : (
//           <div className="space-y-2">
//             {journalEntries.map((entry) => (
//               <button
//                 key={entry.id}
//                 onClick={() => handleMatch(entry.id)}
//                 className="w-full text-left p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition"
//               >
//                 <p className="font-medium text-gray-800">{entry.entry_number}</p>
//                 <p className="text-sm text-gray-600">{entry.description}</p>
//                 <p className="text-xs text-gray-400">{new Date(entry.entry_date).toLocaleDateString()}</p>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// )}
//     </Layout>
//   );
// };

// export default BankReconciliation;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface BankAccount {
  id: number;
  name: string;
  account_number: string;
  bank_name: string;
  current_balance: number;
}

interface BankTransaction {
  id: number;
  transaction_date: string;
  description: string;
  reference: string;
  amount: number;
  type: string;
  status: string;
  entry_number: string | null;
}

interface JournalEntry {
  id: number;
  entry_number: string;
  description: string;
  entry_date: string;
}

const BankReconciliation = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [matchModal, setMatchModal] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState<number | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) fetchTransactions();
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/banking/accounts');
      setAccounts(response.data);
      if (response.data.length > 0) setSelectedAccount(response.data[0].id.toString());
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/banking/transactions', {
        params: { bank_account_id: selectedAccount }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setMessage('');
    const formData = new FormData();
    formData.append('statement', file);
    formData.append('bank_account_id', selectedAccount);
    try {
      const response = await api.post('/banking/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`✅ ${response.data.message}`);
      fetchTransactions();
    } catch (error) {
      setMessage('❌ Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleAutoMatch = async () => {
    try {
      const response = await api.post('/banking/auto-match', {
        bank_account_id: parseInt(selectedAccount),
      });
      setMessage(`✅ ${response.data.message}`);
      fetchTransactions();
    } catch (error) {
      setMessage('❌ Auto-match failed');
    }
  };

  const handleCertify = async () => {
    if (!confirm('Certify this reconciliation? This will be logged in the audit trail.')) return;
    try {
      await api.post('/banking/certify', {
        bank_account_id: parseInt(selectedAccount),
      });
      setMessage('✅ Reconciliation certified');
    } catch (error) {
      setMessage('❌ Certification failed');
    }
  };

  const openMatchModal = async (txnId: number) => {
    setSelectedTxnId(txnId);
    try {
      const response = await api.get('/journals');
      setJournalEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch journals:', error);
    }
    setMatchModal(true);
  };

  const handleMatch = async (journalEntryId: number) => {
    if (!selectedTxnId) return;
    setMatchLoading(true);
    try {
      await api.post('/banking/match', {
        bank_transaction_id: selectedTxnId,
        journal_entry_id: journalEntryId,
      });
      setMatchModal(false);
      fetchTransactions();
    } catch (error) {
      console.error('Match failed:', error);
    } finally {
      setMatchLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'matched'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  const matched = transactions.filter(t => t.status === 'matched').length;
  const unmatched = transactions.filter(t => t.status === 'unmatched').length;

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bank Reconciliation</h2>
        <p className="text-gray-500 mt-1">Import statements, match transactions, certify</p>
      </div>

      {/* Account Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
            <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.bank_name} — {acc.name} ({acc.account_number})</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Import Statement (CSV)</label>
            <label className="w-full flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
              <span className="text-gray-500">📂</span>
              <span className="text-sm text-gray-600">{importing ? 'Importing...' : 'Choose CSV file'}</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} disabled={importing} className="hidden" />
            </label>
          </div>
        </div>
        {message && <p className="mt-3 text-sm">{message}</p>}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button onClick={handleAutoMatch} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            🔍 Auto-Match
          </button>
          <button onClick={handleCertify} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            ✅ Certify Reconciliation
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <p className="text-2xl font-bold text-green-600">{matched}</p>
            <p className="text-sm text-gray-500">Matched</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <p className="text-2xl font-bold text-yellow-600">{unmatched}</p>
            <p className="text-sm text-gray-500">Unmatched</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <p className="text-2xl font-bold text-blue-600">{matched > 0 && unmatched === 0 ? '✓' : '—'}</p>
            <p className="text-sm text-gray-500">Certifiable</p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-700">Bank Transactions</h3>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No transactions. Import a bank statement (CSV).</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matched To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(txn.transaction_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{txn.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{txn.reference || '-'}</td>
                  <td className={`px-6 py-4 text-sm text-right font-medium ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₦{Math.abs(txn.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(txn.status)}`}>{txn.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-900">{txn.entry_number || '-'}</td>
                  <td className="px-6 py-4">
                    {txn.status === 'unmatched' && (
                      <button onClick={() => openMatchModal(txn.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Match</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Match Modal */}
      {matchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[70vh] overflow-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Match to Journal Entry</h3>
              <button onClick={() => setMatchModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6">
              {matchLoading ? (
                <p className="text-center text-gray-500">Matching...</p>
              ) : journalEntries.length === 0 ? (
                <p className="text-center text-gray-500">No journal entries found</p>
              ) : (
                <div className="space-y-2">
                  {journalEntries.map((entry) => (
                    <button key={entry.id} onClick={() => handleMatch(entry.id)} className="w-full text-left p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition">
                      <p className="font-medium text-gray-800">{entry.entry_number}</p>
                      <p className="text-sm text-gray-600">{entry.description}</p>
                      <p className="text-xs text-gray-400">{new Date(entry.entry_date).toLocaleDateString()}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BankReconciliation;