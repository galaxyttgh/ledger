// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface Account {
//   id: number;
//   code: string;
//   name: string;
//   type: string;
//   is_active: boolean;
// }

// const ChartOfAccounts = () => {
//   const [accounts, setAccounts] = useState<Account[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('');

//   useEffect(() => { fetchAccounts(); }, []);

//   const fetchAccounts = async () => {
//     try {
//       const response = await api.get('/accounts');
//       setAccounts(response.data);
//     } catch (error) {
//       console.error('Failed to fetch accounts:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtered = filter
//     ? accounts.filter(a => a.type === filter)
//     : accounts;

//   const types = [...new Set(accounts.map(a => a.type))];

//   const getTypeColor = (type: string) => {
//     const colors: Record<string, string> = {
//       asset: 'bg-blue-100 text-blue-800',
//       liability: 'bg-red-100 text-red-800',
//       equity: 'bg-purple-100 text-purple-800',
//       revenue: 'bg-green-100 text-green-800',
//       expense: 'bg-orange-100 text-orange-800',
//     };
//     return colors[type] || 'bg-gray-100 text-gray-800';
//   };

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Chart of Accounts</h2>
//           <p className="text-gray-500 mt-1">{accounts.length} accounts</p>
//         </div>
//         <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg text-sm">
//           <option value="">All Types</option>
//           {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
//         </select>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {filtered.map((account) => (
//                 <tr key={account.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-3 font-medium text-blue-900">{account.code}</td>
//                   <td className="px-6 py-3 text-gray-800">{account.name}</td>
//                   <td className="px-6 py-3">
//                     <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(account.type)}`}>
//                       {account.type}
//                     </span>
//                   </td>
//                   <td className="px-6 py-3">
//                     <span className={`px-2 py-1 text-xs rounded-full ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
//                       {account.is_active ? 'Active' : 'Inactive'}
//                     </span>
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

// export default ChartOfAccounts;


import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  is_active: boolean;
}

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [sortBy, setSortBy] = useState<'code' | 'name' | 'type'>('code');

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = accounts
    .filter(a => {
      if (filter && a.type !== filter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          a.code.toLowerCase().includes(search) ||
          a.name.toLowerCase().includes(search) ||
          a.type.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'code') return a.code.localeCompare(b.code);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.type.localeCompare(b.type);
    });

  const types = [...new Set(accounts.map(a => a.type))];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      asset: 'bg-blue-100 text-blue-800 border-blue-200',
      liability: 'bg-red-100 text-red-800 border-red-200',
      equity: 'bg-purple-100 text-purple-800 border-purple-200',
      revenue: 'bg-green-100 text-green-800 border-green-200',
      expense: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      asset: '💰',
      liability: '📋',
      equity: '📊',
      revenue: '📈',
      expense: '💸',
    };
    return icons[type] || '📄';
  };

  const typeCounts = types.reduce((acc, type) => {
    acc[type] = accounts.filter(a => a.type === type).length;
    return acc;
  }, {} as Record<string, number>);

  const activeCount = accounts.filter(a => a.is_active).length;
  const inactiveCount = accounts.filter(a => !a.is_active).length;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Chart of Accounts</h2>
            <p className="text-gray-500 mt-1 text-sm">{accounts.length} accounts total</p>
          </div>
          
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-3 mb-4">
        <button
          onClick={() => setFilter('')}
          className={`bg-white rounded-xl shadow-sm p-3 text-center transition-all hover:shadow-md ${
            filter === '' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-xl font-bold text-blue-900">{accounts.length}</p>
          <p className="text-xs text-gray-500">All</p>
        </button>
        {types.map(type => (
          <button
            key={type}
            onClick={() => setFilter(filter === type ? '' : type)}
            className={`bg-white rounded-xl shadow-sm p-3 text-center transition-all hover:shadow-md ${
              filter === type ? 'ring-2 ring-blue-500 shadow-md' : ''
            }`}
          >
            <p className="text-lg lg:text-xl font-bold" style={{ 
              color: type === 'asset' ? '#1e40af' :
                     type === 'liability' ? '#991b1b' :
                     type === 'equity' ? '#6b21a8' :
                     type === 'revenue' ? '#166534' :
                     type === 'expense' ? '#9a3412' : '#374151'
            }}>
              {typeCounts[type] || 0}
            </p>
            <p className="text-xs text-gray-500 capitalize">{type}</p>
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { value: 'code', label: 'By Code' },
          { value: 'name', label: 'By Name' },
          { value: 'type', label: 'By Type' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value as typeof sortBy)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              sortBy === option.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
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
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">📚</span>
          <p className="text-gray-500 font-medium">No accounts found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filter ? 'Try adjusting your search or filters' : 'Chart of accounts is empty'}
          </p>
          {(searchTerm || filter) && (
            <button 
              onClick={() => { setSearchTerm(''); setFilter(''); }}
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
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((account) => (
                  <tr 
                    key={account.id} 
                    className={`hover:bg-gray-50 transition-colors ${!account.is_active ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-3 font-medium text-blue-900">{account.code}</td>
                    <td className="px-6 py-3 text-gray-800 font-medium">{account.name}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getTypeColor(account.type)}`}>
                        {getTypeIcon(account.type)} {account.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
                        account.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          account.is_active ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-2">
            {filtered.map((account) => (
              <div
                key={account.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                  !account.is_active ? 'opacity-60' : ''
                }`}
                onClick={() => setSelectedAccount(selectedAccount?.id === account.id ? null : account)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${
                        getTypeColor(account.type)
                      }`}>
                        {getTypeIcon(account.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{account.name}</h4>
                        <p className="text-xs text-blue-600 font-medium">{account.code}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${
                      account.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        account.is_active ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${getTypeColor(account.type)}`}>
                      {account.type}
                    </span>
                  </div>

                  {/* Expandable Details */}
                  {selectedAccount?.id === account.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Account Code</span>
                        <span className="font-medium text-blue-900">{account.code}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Account Name</span>
                        <span className="font-medium text-gray-800">{account.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${getTypeColor(account.type)}`}>
                          {account.type}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                          account.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            account.is_active ? 'bg-green-500' : 'bg-gray-400'
                          }`}></span>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Expand Indicator */}
                  <div className="flex justify-center mt-2">
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedAccount?.id === account.id ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center lg:text-left">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} of {accounts.length} accounts
              {(filter || searchTerm) && (
                <button 
                  onClick={() => { setSearchTerm(''); setFilter(''); }}
                  className="ml-2 text-blue-600 hover:underline font-medium"
                >
                  Clear filters
                </button>
              )}
            </p>
          </div>
        </>
      )}
    </Layout>
  );
};

export default ChartOfAccounts;