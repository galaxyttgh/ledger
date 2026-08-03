// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// const WHTCertificates = () => {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { fetchData(); }, []);

//   const fetchData = async () => {
//     try {
//       const response = await api.get('/reports/wht-certificates');
//       setData(response.data);
//     } catch (error) {
//       console.error('Failed to fetch WHT:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const totalWHT = data.reduce((sum, d) => sum + d.wht_amount, 0);

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">WHT Certificates</h2>
//           <p className="text-gray-500 mt-1">Withholding Tax on supplier payments</p>
//         </div>
//         <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium no-print">🖨️ Print</button>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : data.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">No supplier bills found</div>
//       ) : (
//         <>
//           <div className="bg-white rounded-xl shadow-sm p-4 mb-4 text-center">
//             <p className="text-sm text-gray-500">Total WHT to Remit</p>
//             <p className="text-3xl font-bold text-purple-600">₦{totalWHT.toLocaleString()}</p>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">WHT (5%)</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Payment</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {data.map((d: any) => (
//                   <tr key={d.bill_id}>
//                     <td className="px-6 py-3 font-medium">{d.supplier_name}</td>
//                     <td className="px-6 py-3 text-blue-900">{d.bill_number}</td>
//                     <td className="px-6 py-3 text-right">₦{Number(d.subtotal).toLocaleString()}</td>
//                     <td className="px-6 py-3 text-right text-purple-600 font-medium">₦{d.wht_amount.toLocaleString()}</td>
//                     <td className="px-6 py-3 text-right font-bold">₦{d.net_payment.toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </Layout>
//   );
// };

// export default WHTCertificates;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const WHTCertificates = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'supplier' | 'amount' | 'wht'>('supplier');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/wht-certificates');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch WHT:', error);
      toast.error('Failed to load WHT certificates');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data
    .filter(d => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        d.supplier_name?.toLowerCase().includes(search) ||
        d.bill_number?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'supplier') return a.supplier_name.localeCompare(b.supplier_name);
      if (sortBy === 'amount') return b.subtotal - a.subtotal;
      return b.wht_amount - a.wht_amount;
    });

const totalWHT = filteredData.reduce((sum, d) => sum + Number(d.wht_amount), 0);
const totalAmount = filteredData.reduce((sum, d) => sum + Number(d.subtotal), 0);
 const totalNetPayment = filteredData.reduce((sum, d) => sum + Number(d.net_payment), 0);
  const transactionCount = filteredData.length;

  const getWHTRate = (whtAmount: number, subtotal: number): string => {
    if (subtotal === 0) return '0.0';
    return ((whtAmount / subtotal) * 100).toFixed(1);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">WHT Certificates</h2>
            <p className="text-gray-500 mt-1 text-sm">Withholding Tax on supplier payments</p>
          </div>
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 
                     active:bg-gray-800 transition-colors text-sm font-medium no-print w-full sm:w-auto"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {/* Summary Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
          {/* Table Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center mb-3">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-gray-500 font-medium">No supplier bills found</p>
          <p className="text-gray-400 text-sm mt-1">WHT certificates will appear here once supplier bills are recorded</p>
        </div>
      ) : (
        <>
          {/* Total WHT Card */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-4 lg:p-6 mb-4 text-white text-center">
            <p className="text-purple-200 text-sm mb-1">Total WHT to Remit</p>
            <p className="text-2xl lg:text-3xl font-bold">₦{totalWHT.toLocaleString()}</p>
            <p className="text-purple-200 text-xs mt-2">
              Across {transactionCount} supplier bill{transactionCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-4">
            <div className="bg-white rounded-xl shadow-sm p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
           <p className="text-base lg:text-lg font-bold text-gray-800">
  ₦{totalAmount.toLocaleString()}
</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Total WHT</p>
              <p className="text-base lg:text-lg font-bold text-purple-600">
                ₦{totalWHT.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Net Payment</p>
              <p className="text-base lg:text-lg font-bold text-green-600">
                ₦{totalNetPayment.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by supplier or bill number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Sort Controls */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {[
                { value: 'supplier' as const, label: 'By Supplier' },
                { value: 'amount' as const, label: 'By Amount' },
                { value: 'wht' as const, label: 'By WHT' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    sortBy === option.value
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bill #</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">WHT Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">WHT Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Net Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((d: any) => (
                    <tr key={d.bill_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-800">{d.supplier_name}</td>
                      <td className="px-6 py-3 text-blue-900 font-medium">{d.bill_number}</td>
                      <td className="px-6 py-3 text-right">₦{Number(d.subtotal).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right text-gray-500">
                        {getWHTRate(d.wht_amount, d.subtotal)}%
                      </td>
                      <td className="px-6 py-3 text-right text-purple-600 font-medium">
                        ₦{d.wht_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-green-600">
                        ₦{d.net_payment.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredData.map((d: any) => (
                <div
                  key={d.bill_id}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedItem(selectedItem?.bill_id === d.bill_id ? null : d)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm truncate">{d.supplier_name}</h4>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">{d.bill_number}</p>
                    </div>
                    <span className="text-sm font-bold text-purple-600 ml-2 flex-shrink-0">
                      WHT: ₦{d.wht_amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>WHT Rate: {getWHTRate(d.wht_amount, d.subtotal)}%</span>
                      <span>Net: ₦{d.net_payment.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(parseFloat(getWHTRate(d.wht_amount, d.subtotal)) * 5, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-medium">₦{Number(d.subtotal).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Net Payment</p>
                      <p className="font-bold text-green-600">₦{d.net_payment.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {selectedItem?.bill_id === d.bill_id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Supplier</span>
                        <span className="font-medium">{d.supplier_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bill Number</span>
                        <span className="font-medium text-blue-900">{d.bill_number}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bill Amount</span>
                        <span className="font-medium">₦{Number(d.subtotal).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">WHT Rate</span>
                        <span className="font-medium">{getWHTRate(d.wht_amount, d.subtotal)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">WHT Amount</span>
                        <span className="font-bold text-purple-600">₦{d.wht_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Net Payment</span>
                        <span className="font-bold text-green-600">₦{d.net_payment.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Expand Indicator */}
                  <div className="flex justify-center mt-2">
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedItem?.bill_id === d.bill_id ? 'rotate-180' : ''
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
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center lg:text-left">
            <p className="text-sm text-gray-500">
              Showing {filteredData.length} of {data.length} transactions
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-blue-600 hover:underline font-medium"
                >
                  Clear search
                </button>
              )}
            </p>
          </div>
        </>
      )}
    </Layout>
  );
};

export default WHTCertificates;