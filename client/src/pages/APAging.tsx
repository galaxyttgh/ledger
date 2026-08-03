// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface AgingItem {
//   id: number;
//   code: string;
//   name: string;
//   bill_id: number;
//   bill_number: string;
//   total: number;
//   bill_date: string;
//   due_date: string;
//   status: string;
//   paid_amount: number;
//   balance: number;
//   days_overdue: number;
// }

// const APAging = () => {
//   const [data, setData] = useState<AgingItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { fetchData(); }, []);

//   const fetchData = async () => {
//     try {
//       const response = await api.get('/reports/ap-aging');
//       setData(response.data);
//     } catch (error) {
//       console.error('Failed to fetch AP aging:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getAgingBucket = (days: number) => {
//     if (days <= 0) return { label: 'Current', color: 'bg-green-100 text-green-800' };
//     if (days <= 30) return { label: '1-30 Days', color: 'bg-yellow-100 text-yellow-800' };
//     if (days <= 60) return { label: '31-60 Days', color: 'bg-orange-100 text-orange-800' };
//     return { label: '60+ Days', color: 'bg-red-100 text-red-800' };
//   };

//   const totalOutstanding = data.reduce((sum, item) => sum + Number(item.balance), 0);

//   return (
//     <Layout>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">AP Aging Report</h2>
//         <p className="text-gray-500 mt-1">Accounts Payable — Outstanding Bills</p>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : data.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
//           ✅ All bills are paid. No outstanding payables.
//         </div>
//       ) : (
//         <>
//           <div className="bg-white rounded-xl shadow-sm p-4 mb-4 text-center">
//             <p className="text-sm text-gray-500">Total Outstanding</p>
//             <p className="text-3xl font-bold text-red-600">₦{totalOutstanding.toLocaleString()}</p>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bill #</th>
//                   <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
//                   <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Paid</th>
//                   <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aging</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {data.map((item) => {
//                   const aging = getAgingBucket(Number(item.days_overdue));
//                   return (
//                     <tr key={item.bill_id} className="hover:bg-gray-50">
//                       <td className="px-6 py-3 font-medium">{item.name}</td>
//                       <td className="px-6 py-3 text-blue-900">{item.bill_number}</td>
//                       <td className="px-6 py-3 text-right">₦{Number(item.total).toLocaleString()}</td>
//                       <td className="px-6 py-3 text-right text-green-600">₦{Number(item.paid_amount).toLocaleString()}</td>
//                       <td className="px-6 py-3 text-right font-bold text-red-600">₦{Number(item.balance).toLocaleString()}</td>
//                       <td className="px-6 py-3">{new Date(item.due_date).toLocaleDateString()}</td>
//                       <td className="px-6 py-3">
//                         <span className={`px-2 py-1 text-xs rounded-full ${aging.color}`}>{aging.label}</span>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </Layout>
//   );
// };

// export default APAging;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface AgingItem {
  id: number;
  code: string;
  name: string;
  bill_id: number;
  bill_number: string;
  total: number;
  bill_date: string;
  due_date: string;
  status: string;
  paid_amount: number;
  balance: number;
  days_overdue: number;
}

const APAging = () => {
  const [data, setData] = useState<AgingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<AgingItem | null>(null);
  const [filterDays, setFilterDays] = useState<string>('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/ap-aging');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch AP aging:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAgingBucket = (days: number) => {
    if (days <= 0) return { label: 'Current', color: 'bg-green-100 text-green-800', borderColor: 'border-l-green-500' };
    if (days <= 30) return { label: '1-30 Days', color: 'bg-yellow-100 text-yellow-800', borderColor: 'border-l-yellow-500' };
    if (days <= 60) return { label: '31-60 Days', color: 'bg-orange-100 text-orange-800', borderColor: 'border-l-orange-500' };
    return { label: '60+ Days', color: 'bg-red-100 text-red-800', borderColor: 'border-l-red-500' };
  };

  const filteredData = filterDays === 'all' 
    ? data 
    : data.filter(item => {
        const days = Number(item.days_overdue);
        switch(filterDays) {
          case 'current': return days <= 0;
          case '30': return days > 0 && days <= 30;
          case '60': return days > 30 && days <= 60;
          case '60+': return days > 60;
          default: return true;
        }
      });

  const totalOutstanding = filteredData.reduce((sum, item) => sum + Number(item.balance), 0);

  const summaryBuckets = {
    current: data.filter(item => Number(item.days_overdue) <= 0).reduce((sum, item) => sum + Number(item.balance), 0),
    days30: data.filter(item => Number(item.days_overdue) > 0 && Number(item.days_overdue) <= 30).reduce((sum, item) => sum + Number(item.balance), 0),
    days60: data.filter(item => Number(item.days_overdue) > 30 && Number(item.days_overdue) <= 60).reduce((sum, item) => sum + Number(item.balance), 0),
    days60plus: data.filter(item => Number(item.days_overdue) > 60).reduce((sum, item) => sum + Number(item.balance), 0),
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AP Aging Report</h2>
        <p className="text-gray-500 mt-1 text-sm">Accounts Payable — Outstanding Bills</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {/* Loading Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-3 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl lg:text-5xl mb-4 block">✅</span>
          <p className="text-gray-500 text-lg">All bills are paid</p>
          <p className="text-gray-400 text-sm mt-1">No outstanding payables</p>
        </div>
      ) : (
        <>
          {/* Total Outstanding */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-4 text-center">
            <p className="text-sm text-gray-500">Total Outstanding</p>
            <p className="text-2xl lg:text-3xl font-bold text-red-600">
              ₦{totalOutstanding.toLocaleString()}
            </p>
            {filterDays !== 'all' && (
              <p className="text-xs text-gray-400 mt-1">Filtered view</p>
            )}
          </div>

          {/* Aging Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div 
              onClick={() => setFilterDays(filterDays === 'current' ? 'all' : 'current')}
              className={`bg-white rounded-xl shadow-sm p-3 cursor-pointer transition-all hover:shadow-md ${
                filterDays === 'current' ? 'ring-2 ring-green-500 shadow-md' : ''
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">Current</p>
              <p className="text-lg lg:text-xl font-bold text-green-600">
                ₦{summaryBuckets.current.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {data.filter(item => Number(item.days_overdue) <= 0).length} bills
              </p>
            </div>
            <div 
              onClick={() => setFilterDays(filterDays === '30' ? 'all' : '30')}
              className={`bg-white rounded-xl shadow-sm p-3 cursor-pointer transition-all hover:shadow-md ${
                filterDays === '30' ? 'ring-2 ring-yellow-500 shadow-md' : ''
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">1-30 Days</p>
              <p className="text-lg lg:text-xl font-bold text-yellow-600">
                ₦{summaryBuckets.days30.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {data.filter(item => Number(item.days_overdue) > 0 && Number(item.days_overdue) <= 30).length} bills
              </p>
            </div>
            <div 
              onClick={() => setFilterDays(filterDays === '60' ? 'all' : '60')}
              className={`bg-white rounded-xl shadow-sm p-3 cursor-pointer transition-all hover:shadow-md ${
                filterDays === '60' ? 'ring-2 ring-orange-500 shadow-md' : ''
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">31-60 Days</p>
              <p className="text-lg lg:text-xl font-bold text-orange-600">
                ₦{summaryBuckets.days60.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {data.filter(item => Number(item.days_overdue) > 30 && Number(item.days_overdue) <= 60).length} bills
              </p>
            </div>
            <div 
              onClick={() => setFilterDays(filterDays === '60+' ? 'all' : '60+')}
              className={`bg-white rounded-xl shadow-sm p-3 cursor-pointer transition-all hover:shadow-md ${
                filterDays === '60+' ? 'ring-2 ring-red-500 shadow-md' : ''
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">60+ Days</p>
              <p className="text-lg lg:text-xl font-bold text-red-600">
                ₦{summaryBuckets.days60plus.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {data.filter(item => Number(item.days_overdue) > 60).length} bills
              </p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bill #</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Paid</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aging</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((item) => {
                    const aging = getAgingBucket(Number(item.days_overdue));
                    return (
                      <tr key={item.bill_id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium">{item.name}</td>
                        <td className="px-6 py-3 text-blue-900">{item.bill_number}</td>
                        <td className="px-6 py-3 text-right">₦{Number(item.total).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right text-green-600">₦{Number(item.paid_amount).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right font-bold text-red-600">₦{Number(item.balance).toLocaleString()}</td>
                        <td className="px-6 py-3">{new Date(item.due_date).toLocaleDateString()}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${aging.color}`}>{aging.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredData.map((item) => {
              const aging = getAgingBucket(Number(item.days_overdue));
              const percentPaid = (Number(item.paid_amount) / Number(item.total)) * 100;
              
              return (
                <div 
                  key={item.bill_id} 
                  className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${aging.borderColor} cursor-pointer hover:shadow-md transition-all`}
                  onClick={() => setSelectedItem(selectedItem?.bill_id === item.bill_id ? null : item)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-blue-600 mt-0.5">{item.bill_number}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0 ${aging.color}`}>
                      {aging.label}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Balance</span>
                      <span className="font-bold text-red-600">
                        ₦{Number(item.balance).toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(percentPaid, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Paid: ₦{Number(item.paid_amount).toLocaleString()}</span>
                      <span>{percentPaid.toFixed(0)}% paid</span>
                    </div>

                    {/* Expandable Details */}
                    {selectedItem?.bill_id === item.bill_id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-fadeIn">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total Amount</span>
                          <span className="font-medium">₦{Number(item.total).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Due Date</span>
                          <span className="font-medium">{new Date(item.due_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Bill Date</span>
                          <span className="font-medium">{new Date(item.bill_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Days Overdue</span>
                          <span className={`font-medium ${Number(item.days_overdue) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {Number(item.days_overdue) > 0 ? `${item.days_overdue} days` : 'Not overdue'}
                          </span>
                        </div>
                        <button className="w-full mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
                          View Bill Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredData.length === 0 && filterDays !== 'all' && (
              <div className="text-center py-8 text-gray-500">
                <p>No bills in this aging bucket</p>
                <button 
                  onClick={() => setFilterDays('all')}
                  className="mt-2 text-blue-600 text-sm font-medium hover:underline"
                >
                  Show all bills
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center lg:text-left">
            <p className="text-sm text-gray-500">
              Showing {filteredData.length} of {data.length} bills
              {filterDays !== 'all' && (
                <button 
                  onClick={() => setFilterDays('all')}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </p>
          </div>
        </>
      )}
    </Layout>
  );
};

export default APAging;