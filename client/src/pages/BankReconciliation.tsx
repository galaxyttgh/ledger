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
  const [selectedTxn, setSelectedTxn] = useState<BankTransaction | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'matched' | 'unmatched'>('all');

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) fetchTransactions();
  }, [selectedAccount]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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

  // const openMatchModal = async (txnId: number) => {
  //   setSelectedTxnId(txnId);
  //   try {
  //     const response = await api.get('/journals');
  //     setJournalEntries(response.data);
  //   } catch (error) {
  //     console.error('Failed to fetch journals:', error);
  //   }
  //   setMatchModal(true);
  // };
const openMatchModal = async (txnId: number) => {
  console.log('Opening match modal for txn:', txnId);
  setSelectedTxnId(txnId);
  try {
    const response = await api.get('/journals');
    console.log('Journals fetched:', response.data.length);
    setJournalEntries(response.data);
    setMatchModal(true);
  } catch (error) {
    console.error('Failed to fetch journals:', error);
  }
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
      setSelectedTxn(null);
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

  const filteredTransactions = transactions.filter(txn => {
    if (filterStatus === 'all') return true;
    return txn.status === filterStatus;
  });

  const matched = transactions.filter(t => t.status === 'matched').length;
  const unmatched = transactions.filter(t => t.status === 'unmatched').length;
  const selectedAccountData = accounts.find(a => a.id.toString() === selectedAccount);

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bank Reconciliation</h2>
        <p className="text-gray-500 mt-1 text-sm">Import statements, match transactions, certify</p>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-medium text-blue-800">
          {message}
        </div>
      )}

      {/* Account Info & Import */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
        {/* Account Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Account</label>
          <select 
            value={selectedAccount} 
            onChange={(e) => setSelectedAccount(e.target.value)} 
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.bank_name} — {acc.name} ({acc.account_number})
              </option>
            ))}
          </select>
          {selectedAccountData && (
            <p className="mt-2 text-sm text-gray-600">
              Current Balance: <span className="font-bold text-blue-900">₦{selectedAccountData.current_balance.toLocaleString()}</span>
            </p>
          )}
        </div>

        {/* Import */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Import Statement (CSV)</label>
          <label className="w-full flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl 
                         cursor-pointer hover:border-blue-500 transition-colors">
            <span className="text-2xl">📂</span>
            <span className="text-sm text-gray-600">
              {importing ? 'Importing...' : 'Choose CSV file'}
            </span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              disabled={importing} 
              className="hidden" 
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={handleAutoMatch} 
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                     active:bg-blue-800 transition-colors text-sm font-medium"
          >
            🔍 Auto-Match
          </button>
          <button 
            onClick={handleCertify} 
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                     active:bg-green-800 transition-colors text-sm font-medium"
          >
            ✅ Certify Reconciliation
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-4 gap-2 lg:gap-4 mb-6">
          <button
            onClick={() => setFilterStatus('all')}
            className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
              filterStatus === 'all' ? 'ring-2 ring-blue-500 shadow-md' : ''
            }`}
          >
            <p className="text-lg lg:text-2xl font-bold text-gray-800">{transactions.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </button>
          <button
            onClick={() => setFilterStatus('matched')}
            className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
              filterStatus === 'matched' ? 'ring-2 ring-green-500 shadow-md' : ''
            }`}
          >
            <p className="text-lg lg:text-2xl font-bold text-green-600">{matched}</p>
            <p className="text-xs text-gray-500">Matched</p>
          </button>
          <button
            onClick={() => setFilterStatus('unmatched')}
            className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
              filterStatus === 'unmatched' ? 'ring-2 ring-yellow-500 shadow-md' : ''
            }`}
          >
            <p className="text-lg lg:text-2xl font-bold text-yellow-600">{unmatched}</p>
            <p className="text-xs text-gray-500">Unmatched</p>
          </button>
          <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
            <p className="text-lg lg:text-2xl font-bold text-blue-600">
              {matched > 0 && unmatched === 0 ? '✓' : '—'}
            </p>
            <p className="text-xs text-gray-500">Certifiable</p>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 lg:px-6 py-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-700">Bank Transactions</h3>
        </div>
        
        {loading ? (
          <div className="p-4 lg:p-6">
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
        ) : transactions.length === 0 ? (
          <div className="p-8 lg:p-12 text-center">
            <span className="text-4xl mb-3 block">📊</span>
            <p className="text-gray-500 font-medium">No transactions</p>
            <p className="text-gray-400 text-sm mt-1">Import a bank statement (CSV) to get started</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reference</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Matched To</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(txn.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{txn.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{txn.reference || '-'}</td>
                      <td className={`px-6 py-4 text-sm text-right font-medium ${
                        txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₦{Math.abs(txn.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-900">{txn.entry_number || '-'}</td>
                      <td className="px-6 py-4">
                        {txn.status === 'unmatched' && (
                          <button 
                            onClick={() => openMatchModal(txn.id)} 
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Match
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredTransactions.map((txn) => (
                <div 
                  key={txn.id} 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedTxn(selectedTxn?.id === txn.id ? null : txn)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{txn.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(txn.transaction_date).toLocaleDateString()}
                        {txn.reference && ` • Ref: ${txn.reference}`}
                      </p>
                    </div>
                    <div className="text-right ml-3">
                      <p className={`font-bold text-sm ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₦{Math.abs(txn.amount).toLocaleString()}
                      </p>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium mt-1 inline-block ${getStatusBadge(txn.status)}`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {selectedTxn?.id === txn.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium">
                          {new Date(txn.transaction_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Reference</span>
                        <span className="font-medium">{txn.reference || '-'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type</span>
                        <span className={`font-medium capitalize ${
                          txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {txn.type}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadge(txn.status)}`}>
                          {txn.status}
                        </span>
                      </div>
                      {txn.entry_number && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Matched To</span>
                          <span className="font-medium text-blue-900">{txn.entry_number}</span>
                        </div>
                      )}
                      
                      {txn.status === 'unmatched' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openMatchModal(txn.id);
                          }}
                          className="w-full mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                                   hover:bg-blue-100 transition-colors"
                        >
                          Match to Journal Entry
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expand Indicator */}
                  <div className="flex justify-center mt-2">
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedTxn?.id === txn.id ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Results Count */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="mt-4 text-center lg:text-left">
          <p className="text-sm text-gray-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
            {filterStatus !== 'all' && (
              <button 
                onClick={() => setFilterStatus('all')}
                className="ml-2 text-blue-600 hover:underline font-medium"
              >
                Clear filter
              </button>
            )}
          </p>
        </div>
      )}

      {/* Match Modal */}
      {matchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMatchModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-4 lg:p-6 border-b flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800">Match to Journal Entry</h3>
              <button 
                onClick={() => setMatchModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 lg:p-6 overflow-y-auto flex-1">
              {matchLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-gray-500">Matching...</p>
                </div>
              ) : journalEntries.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-3xl mb-2 block">📝</span>
                  <p className="text-gray-500">No journal entries found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {journalEntries.map((entry) => (
                    <button 
                      key={entry.id} 
                      onClick={() => handleMatch(entry.id)} 
                      className="w-full text-left p-3 lg:p-4 rounded-xl border hover:bg-blue-50 hover:border-blue-300 
                               transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-800">{entry.entry_number}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{entry.description}</p>
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