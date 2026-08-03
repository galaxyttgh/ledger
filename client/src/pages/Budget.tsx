// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { useNavigate } from 'react-router-dom';

// interface VarianceLine {
//   id: number;
//   code: string;
//   name: string;
//   type: string;
//   budget_amount: number;
//   actual_amount: number;
//   variance: number;
//   variance_percent: number;
// }

// const Budget = () => {
//     const navigate = useNavigate();
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [period, setPeriod] = useState('JUL-2026');

//   useEffect(() => { fetchVariance(); }, [period]);

//   const fetchVariance = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get('/budgets/variance', { params: { period } });
//       setData(response.data);
//     } catch (error) {
//       console.error('Failed to fetch variance:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//   <div>
//     <h2 className="text-2xl font-bold text-gray-800">Budget vs Actual</h2>
//     <p className="text-gray-500 mt-1">Variance analysis</p>
//   </div>
//   <div className="flex gap-2">
//     <button
//       onClick={() => navigate('/budget/new')}
//       className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
//     >
//       + Create Budget
//     </button>
//     <input
//       type="text"
//       value={period}
//       onChange={(e) => setPeriod(e.target.value)}
//       className="px-4 py-2 border rounded-lg text-sm w-32"
//       placeholder="Period"
//     />
//   </div>
// </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : data ? (
//         <>
//           {/* Summary Cards */}
//           <div className="grid grid-cols-3 gap-4 mb-6">
//             <div className="bg-white rounded-xl shadow-sm p-4 text-center">
//               <p className="text-sm text-gray-500">Total Budget</p>
//               <p className="text-2xl font-bold text-blue-900">₦{data.totalBudget.toLocaleString()}</p>
//             </div>
//             <div className="bg-white rounded-xl shadow-sm p-4 text-center">
//               <p className="text-sm text-gray-500">Total Actual</p>
//               <p className="text-2xl font-bold text-green-900">₦{data.totalActual.toLocaleString()}</p>
//             </div>
//             <div className={`bg-white rounded-xl shadow-sm p-4 text-center ${data.variance >= 0 ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'}`}>
//               <p className="text-sm text-gray-500">Variance</p>
//               <p className={`text-2xl font-bold ${data.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                 {data.variance >= 0 ? '+' : ''}₦{data.variance.toLocaleString()}
//               </p>
//             </div>
//           </div>

//           {/* Variance Table */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {data.lines.map((line: VarianceLine) => (
//                   <tr key={line.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-3">
//                       <span className="font-medium">{line.code}</span>
//                       <span className="text-gray-500 ml-2">{line.name}</span>
//                     </td>
//                     <td className="px-6 py-3 capitalize text-gray-600">{line.type}</td>
//                     <td className="px-6 py-3 text-right">₦{line.budget_amount.toLocaleString()}</td>
//                     <td className="px-6 py-3 text-right font-medium">₦{line.actual_amount.toLocaleString()}</td>
//                     <td className={`px-6 py-3 text-right font-medium ${line.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                       {line.variance >= 0 ? '+' : ''}₦{line.variance.toLocaleString()}
//                     </td>
//                     <td className={`px-6 py-3 text-right ${line.variance_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                       {line.variance_percent >= 0 ? '+' : ''}{line.variance_percent.toFixed(1)}%
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       ) : null}
//     </Layout>
//   );
// };

// export default Budget;


import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface VarianceLine {
  id: number;
  code: string;
  name: string;
  type: string;
  budget_amount: number;
  actual_amount: number;
  variance: number;
  variance_percent: number;
}

const Budget = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('JUL-2026');
  const [selectedLine, setSelectedLine] = useState<VarianceLine | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'variance' | 'percent'>('variance');
const [scenario, setScenario] = useState('all');

useEffect(() => { fetchVariance(); }, [period, scenario]);
  // useEffect(() => { fetchVariance(); }, [period]);

  const fetchVariance = async () => {
    setLoading(true);
    try {
     const response = await api.get('/budgets/variance', { params: { period, scenario } });
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch variance:', error);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVarianceBg = (variance: number) => {
    if (variance > 0) return 'bg-green-50 border-green-200';
    if (variance < 0) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return '📈';
    if (variance < 0) return '📉';
    return '➡️';
  };

  const filteredLines = data?.lines
    ?.filter((line: VarianceLine) => {
      if (filterType === 'all') return true;
      return line.type === filterType;
    })
    .sort((a: VarianceLine, b: VarianceLine) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'percent') return Math.abs(b.variance_percent) - Math.abs(a.variance_percent);
      return Math.abs(b.variance) - Math.abs(a.variance);
    }) || [];

  const periodOptions = [
    'JAN-2026', 'FEB-2026', 'MAR-2026', 'APR-2026', 'MAY-2026', 'JUN-2026',
    'JUL-2026', 'AUG-2026', 'SEP-2026', 'OCT-2026', 'NOV-2026', 'DEC-2026'
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Budget vs Actual</h2>
            <p className="text-gray-500 mt-1 text-sm">Variance analysis</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/budget/new')}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       active:bg-blue-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              + Create Budget
            </button>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       bg-white w-full sm:w-auto"
            >
              {periodOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select value={scenario} onChange={(e) => { setScenario(e.target.value); fetchVariance(); }} className="px-4 py-2 border rounded-lg text-sm">
  <option value="all">All Scenarios</option>
  <option value="base">Base</option>
  <option value="optimistic">Optimistic</option>
  <option value="conservative">Conservative</option>
</select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {/* Summary Skeleton */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-3 lg:p-4 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-20 mb-2 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
          
          {/* Table Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-4">
            <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Budget</p>
              <p className="text-lg lg:text-2xl font-bold text-blue-900">
                ₦{data.totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Actual</p>
              <p className="text-lg lg:text-2xl font-bold text-green-900">
                ₦{data.totalActual.toLocaleString()}
              </p>
            </div>
            <div className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center border-t-4 ${
              data.variance >= 0 ? 'border-green-500' : 'border-red-500'
            }`}>
              <p className="text-xs text-gray-500 mb-1">Variance</p>
              <p className={`text-lg lg:text-2xl font-bold ${data.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.variance >= 0 ? '+' : ''}₦{data.variance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {[
                { value: 'all', label: 'All' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterType(option.value as typeof filterType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filterType === option.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <span className="text-xs text-gray-500 self-center mr-1">Sort:</span>
              {[
                { value: 'variance', label: 'By Variance' },
                { value: 'percent', label: 'By %' },
                { value: 'name', label: 'By Name' },
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
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Budget</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actual</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Variance</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">%</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLines.map((line: VarianceLine) => (
                    <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div>
                          <span className="font-medium text-gray-800">{line.code}</span>
                          <span className="text-gray-500 ml-2 text-xs">{line.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${
                          line.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {line.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">₦{line.budget_amount.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-medium">₦{line.actual_amount.toLocaleString()}</td>
                      <td className={`px-6 py-3 text-right font-medium ${getVarianceColor(line.variance)}`}>
                        {line.variance >= 0 ? '+' : ''}₦{line.variance.toLocaleString()}
                      </td>
                      <td className={`px-6 py-3 text-right font-medium ${getVarianceColor(line.variance_percent)}`}>
                        {line.variance_percent >= 0 ? '+' : ''}{line.variance_percent.toFixed(1)}%
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="text-lg">{getVarianceIcon(line.variance)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredLines.map((line: VarianceLine) => (
              <div
                key={line.id}
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                  getVarianceBg(line.variance)
                }`}
                onClick={() => setSelectedLine(selectedLine?.id === line.id ? null : line)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium capitalize ${
                          line.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {line.type}
                        </span>
                        <span className="text-xs text-gray-500">{line.code}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm truncate">{line.name}</h4>
                    </div>
                    <span className="text-2xl ml-2">{getVarianceIcon(line.variance)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-medium text-gray-800">₦{line.budget_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Actual</p>
                      <p className="font-medium text-gray-800">₦{line.actual_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Variance</p>
                      <p className={`font-bold ${getVarianceColor(line.variance)}`}>
                        {line.variance >= 0 ? '+' : ''}₦{line.variance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Variance Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                    <div 
                      className={`h-2 rounded-full transition-all ${line.variance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ 
                        width: `${Math.min(Math.abs(line.variance_percent), 100)}%`,
                        marginLeft: line.variance >= 0 ? '0' : 'auto'
                      }}
                    />
                  </div>
                  <p className={`text-xs font-medium ${getVarianceColor(line.variance_percent)}`}>
                    {line.variance_percent >= 0 ? '+' : ''}{line.variance_percent.toFixed(1)}% variance
                  </p>

                  {/* Expandable Details */}
                  {selectedLine?.id === line.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Budget Amount</span>
                        <span className="font-medium">₦{line.budget_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Actual Amount</span>
                        <span className="font-medium">₦{line.actual_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Variance Amount</span>
                        <span className={`font-bold ${getVarianceColor(line.variance)}`}>
                          {line.variance >= 0 ? '+' : ''}₦{line.variance.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Variance %</span>
                        <span className={`font-bold ${getVarianceColor(line.variance_percent)}`}>
                          {line.variance_percent >= 0 ? '+' : ''}{line.variance_percent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type</span>
                        <span className="font-medium capitalize">{line.type}</span>
                      </div>
                      
                      {/* Performance Indicator */}
                      <div className={`p-3 rounded-lg text-sm ${
                        line.variance > 0 && line.type === 'income' ? 'bg-green-50 text-green-700' :
                        line.variance < 0 && line.type === 'expense' ? 'bg-green-50 text-green-700' :
                        line.variance > 0 && line.type === 'expense' ? 'bg-red-50 text-red-700' :
                        line.variance < 0 && line.type === 'income' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {line.variance > 0 && line.type === 'income' && '✅ Performing above budget (favorable)'}
                        {line.variance < 0 && line.type === 'expense' && '✅ Under budget (favorable)'}
                        {line.variance > 0 && line.type === 'expense' && '⚠️ Over budget (unfavorable)'}
                        {line.variance < 0 && line.type === 'income' && '⚠️ Below budget (unfavorable)'}
                        {line.variance === 0 && '➡️ Exactly on budget'}
                      </div>
                    </div>
                  )}

                  {/* Expand Indicator */}
                  <div className="flex justify-center mt-2">
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedLine?.id === line.id ? 'rotate-180' : ''
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
          {filteredLines.length > 0 && (
            <div className="mt-4 text-center lg:text-left">
              <p className="text-sm text-gray-500">
                Showing {filteredLines.length} of {data.lines.length} accounts
                {filterType !== 'all' && (
                  <button 
                    onClick={() => setFilterType('all')}
                    className="ml-2 text-blue-600 hover:underline font-medium"
                  >
                    Clear filter
                  </button>
                )}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">📊</span>
          <p className="text-gray-500 font-medium">No budget data available</p>
          <p className="text-gray-400 text-sm mt-1">Create a budget to get started</p>
        </div>
      )}
    </Layout>
  );
};

export default Budget;