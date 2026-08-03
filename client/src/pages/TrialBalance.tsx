// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { PDFDownloadLink } from '@react-pdf/renderer';
// import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
// import { exportToExcel } from '../utils/exportExcel';

// interface AccountBalance {
//   id: number;
//   code: string;
//   name: string;
//   type: string;
//   total_debit: number;
//   total_credit: number;
//   debit_balance: number;
//   credit_balance: number;
// }

// interface TrialBalanceData {
//   accounts: AccountBalance[];
//   totals: {
//     total_debit: number;
//     total_credit: number;
//     debit_balance: number;
//     credit_balance: number;
//   };
// }

// const TrialBalance = () => {
//   const [data, setData] = useState<TrialBalanceData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchTrialBalance();
//   }, []);

//   const fetchTrialBalance = async () => {
//     try {
//       const response = await api.get('/journals/reports/trial-balance');
//       setData(response.data);
//     } catch (error) {
//       console.error('Failed to fetch trial balance:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const TrialBalancePDF = ({ data }: { data: any }) => (
//   <ReportPDF title="Trial Balance" subtitle="July 2026">
//     {data.accounts.map((acc: any) => (
//       <PDFRow
//         key={acc.id}
//         label={`${acc.code} — ${acc.name}`}
//       value={acc.debit_balance > 0 ? `NGN ${Number(acc.debit_balance).toLocaleString()} Dr` : `NGN ${Number(acc.credit_balance).toLocaleString()} Cr`}
//       />
//     ))}
//    <PDFTotal label="Total" value={`NGN ${Number(data.totals.debit_balance).toLocaleString()}`} />
//   </ReportPDF>
// );
// return (
//   <Layout>
//     <div className="mb-6 flex justify-between items-center">
//       <div>
//         <h2 className="text-2xl font-bold text-gray-800">Trial Balance</h2>
//         <p className="text-gray-500 mt-1">Summary of all account balances</p>
//       </div>
//       <div className="flex gap-2 no-print">
//         <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
//           🖨️ Print
//         </button>
//         <button
//   onClick={() => data && exportToExcel(
//     data.accounts.map((a: any) => ({
//       Code: a.code,
//       Account: a.name,
//       Type: a.type,
//       Debit: a.debit_balance,
//       Credit: a.credit_balance,
//     })),
//     'Trial_Balance',
//     'Trial Balance'
//   )}
//   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
// >
//   📥 Excel
// </button>
//         {data && (
//           <PDFDownloadLink
//             document={<TrialBalancePDF data={data} />}
//             fileName="Trial_Balance_July_2026.pdf"
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
//           >
//             📄 Export PDF
//           </PDFDownloadLink>
//         )}
//       </div>
//     </div>

//     {loading ? (
//       <div className="text-center py-12 text-gray-500">Loading...</div>
//     ) : data ? (
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {data.accounts.map((account) => (
//               <tr key={account.id} className="hover:bg-gray-50">
//                 <td className="px-6 py-3 font-medium text-gray-800">{account.code}</td>
//                 <td className="px-6 py-3 text-gray-600">{account.name}</td>
//                 <td className="px-6 py-3">
//                   <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
//                     {account.type}
//                   </span>
//                 </td>
//                 <td className="px-6 py-3 text-right">
//                   {account.debit_balance > 0 ? `₦${Number(account.debit_balance).toLocaleString()}` : '-'}
//                 </td>
//                 <td className="px-6 py-3 text-right">
//                   {account.credit_balance > 0 ? `₦${Number(account.credit_balance).toLocaleString()}` : '-'}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//           <tfoot className="bg-gray-100 font-bold">
//             <tr>
//               <td colSpan={3} className="px-6 py-3 text-right">Totals:</td>
//               <td className="px-6 py-3 text-right">
//                 ₦{Number(data.totals.debit_balance).toLocaleString()}
//               </td>
//               <td className="px-6 py-3 text-right">
//                 ₦{Number(data.totals.credit_balance).toLocaleString()}
//               </td>
//             </tr>
//           </tfoot>
//         </table>

//         {Math.abs(data.totals.debit_balance - data.totals.credit_balance) < 0.01 ? (
//           <div className="px-6 py-4 bg-green-50 text-green-700 text-sm font-medium">
//             ✓ Trial balance is balanced
//           </div>
//         ) : (
//           <div className="px-6 py-4 bg-red-50 text-red-700 text-sm font-medium">
//             ✗ Trial balance is not balanced! Difference: ₦
//             {Math.abs(data.totals.debit_balance - data.totals.credit_balance).toLocaleString()}
//           </div>
//         )}
//       </div>
//     ) : null}
//   </Layout>
// );
// };

// export default TrialBalance;


import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
import { exportToExcel } from '../utils/exportExcel';

interface AccountBalance {
  id: number;
  code: string;
  name: string;
  type: string;
  total_debit: number;
  total_credit: number;
  debit_balance: number;
  credit_balance: number;
}

interface TrialBalanceData {
  accounts: AccountBalance[];
  totals: {
    total_debit: number;
    total_credit: number;
    debit_balance: number;
    credit_balance: number;
  };
}

const TrialBalance = () => {
  const [data, setData] = useState<TrialBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<AccountBalance | null>(null);
const [branchId, setBranchId] = useState('');
const [periodFilter, setPeriodFilter] = useState('');
const [branches, setBranches] = useState<any[]>([]);



useEffect(() => {
  fetchTrialBalance();
  api.get('/branches').then(r => setBranches(r.data));
}, [branchId, periodFilter]);


  useEffect(() => {
  fetchTrialBalance();
  api.get('/branches').then(r => setBranches(r.data));
}, [branchId, periodFilter]);


  const fetchTrialBalance = async () => {
  try {
    const params: any = {};
    if (branchId) params.branch_id = branchId;
    if (periodFilter) params.period = periodFilter;
    const response = await api.get('/journals/reports/trial-balance', { params });
    setData(response.data);
  } catch (error) {
    console.error('Failed to fetch trial balance:', error);
  } finally {
    setLoading(false);
  }
};
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      asset: 'bg-blue-100 text-blue-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-purple-100 text-purple-800',
      revenue: 'bg-green-100 text-green-800',
      expense: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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

  const filteredAccounts = data?.accounts.filter(account => {
    const matchesType = filterType === 'all' || account.type === filterType;
    const matchesSearch = !searchTerm || 
      account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  }) || [];

  const types = data ? [...new Set(data.accounts.map(a => a.type))] : [];
  
  const typeCounts = data?.accounts.reduce((acc, account) => {
    acc[account.type] = (acc[account.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const isBalanced = data ? Math.abs(data.totals.debit_balance - data.totals.credit_balance) < 0.01 : false;

  const TrialBalancePDF = ({ data }: { data: any }) => (
    <ReportPDF title="Trial Balance" subtitle="July 2026">
      {data.accounts.map((acc: any) => (
        <PDFRow
          key={acc.id}
          label={`${acc.code} — ${acc.name}`}
          value={acc.debit_balance > 0 ? `NGN ${Number(acc.debit_balance).toLocaleString()} Dr` : `NGN ${Number(acc.credit_balance).toLocaleString()} Cr`}
        />
      ))}
      <PDFTotal label="Total" value={`NGN ${Number(data.totals.debit_balance).toLocaleString()}`} />
    </ReportPDF>
  );

  return (
    <Layout>
      {/* Header */}
   <div className="mb-6">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Trial Balance</h2>
      <p className="text-gray-500 mt-1 text-sm">Summary of all account balances</p>
    </div>
    
    <div className="flex flex-wrap gap-2 no-print">
      <button onClick={() => window.print()} className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 active:bg-gray-800 transition-colors text-sm font-medium">
        🖨️ Print
      </button>
      <button
        onClick={() => data && exportToExcel(
          data.accounts.map((a: any) => ({
            Code: a.code,
            Account: a.name,
            Type: a.type,
            Debit: a.debit_balance,
            Credit: a.credit_balance,
          })),
          'Trial_Balance',
          'Trial Balance'
        )}
        className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors text-sm font-medium"
      >
        📥 Excel
      </button>
      {data && (
        <PDFDownloadLink
          document={<TrialBalancePDF data={data} />}
          fileName="Trial_Balance_July_2026.pdf"
          className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors text-sm font-medium text-center"
        >
          📄 Export PDF
        </PDFDownloadLink>
      )}
    </div>
  </div>

  {/* Filters */}
  <div className="flex gap-2 mt-3">
    <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl text-sm">
      <option value="">All Branches</option>
      {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
    </select>
    <input type="text" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} placeholder="Period (e.g., JUL-2026)" className="px-3 py-2 border border-gray-300 rounded-xl text-sm w-44" />
  </div>
</div>



      {/* Search & Filters */}
      {data && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by code or account name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Type Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({data.accounts.length})
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                  filterType === type ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getTypeIcon(type)} {type} ({typeCounts[type] || 0})
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          {/* Summary Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border rounded-xl p-3 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
          {/* Table Skeleton */}
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-xl shadow-sm p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Accounts</p>
              <p className="text-lg font-bold text-blue-900">{data.accounts.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Debit</p>
              <p className="text-lg font-bold text-green-600">
                ₦{Number(data.totals.debit_balance).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Credit</p>
              <p className="text-lg font-bold text-red-600">
                ₦{Number(data.totals.credit_balance).toLocaleString()}
              </p>
            </div>
            <div className={`bg-white rounded-xl shadow-sm p-3 text-center ${
              isBalanced ? 'border-2 border-green-500' : 'border-2 border-red-500'
            }`}>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
              </p>
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Debit</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-blue-900">{account.code}</td>
                      <td className="px-6 py-3 text-gray-800">{account.name}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${getTypeColor(account.type)}`}>
                          {getTypeIcon(account.type)} {account.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-green-700">
                        {account.debit_balance > 0 ? `₦${Number(account.debit_balance).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-red-700">
                        {account.credit_balance > 0 ? `₦${Number(account.credit_balance).toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm">Totals:</td>
                    <td className="px-6 py-3 text-right text-green-700">
                      ₦{Number(data.totals.debit_balance).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right text-red-700">
                      ₦{Number(data.totals.credit_balance).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedAccount(selectedAccount?.id === account.id ? null : account)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getTypeColor(account.type)}`}>
                        {getTypeIcon(account.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{account.name}</h4>
                        <p className="text-xs text-blue-600 font-medium">{account.code}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ml-2 flex-shrink-0 ${getTypeColor(account.type)}`}>
                      {account.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Debit</p>
                      <p className="font-bold text-green-700">
                        {account.debit_balance > 0 ? `₦${Number(account.debit_balance).toLocaleString()}` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Credit</p>
                      <p className="font-bold text-red-700">
                        {account.credit_balance > 0 ? `₦${Number(account.credit_balance).toLocaleString()}` : '-'}
                      </p>
                    </div>
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
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium capitalize ${getTypeColor(account.type)}`}>
                          {account.type}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Debit Balance</span>
                        <span className="font-bold text-green-700">
                          {account.debit_balance > 0 ? `₦${Number(account.debit_balance).toLocaleString()}` : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Credit Balance</span>
                        <span className="font-bold text-red-700">
                          {account.credit_balance > 0 ? `₦${Number(account.credit_balance).toLocaleString()}` : '-'}
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
              ))}
            </div>

            {/* Balance Status */}
            <div className={`px-4 lg:px-6 py-3 text-sm font-medium ${
              isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {isBalanced ? (
                <span className="flex items-center gap-2">✅ Trial balance is balanced</span>
              ) : (
                <span className="flex items-center gap-2">
                  ⚠️ Trial balance is not balanced! Difference: ₦
                  {Math.abs(data.totals.debit_balance - data.totals.credit_balance).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center lg:text-left">
            <p className="text-sm text-gray-500">
              Showing {filteredAccounts.length} of {data.accounts.length} accounts
              {(filterType !== 'all' || searchTerm) && (
                <button 
                  onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                  className="ml-2 text-blue-600 hover:underline font-medium"
                >
                  Clear filters
                </button>
              )}
            </p>
          </div>
        </>
      ) : null}
    </Layout>
  );
};

export default TrialBalance;