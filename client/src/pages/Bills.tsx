// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface Bill {
//   id: number;
//   bill_number: string;
//   supplier_name: string;
//   bill_date: string;
//   due_date: string;
//   description: string;
//   total: number;
//   status: string;
// }

// const Bills = () => {
//   const navigate = useNavigate();
//   const [bills, setBills] = useState<Bill[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchBills();
//   }, []);

//   const fetchBills = async () => {
//     try {
//       const response = await api.get('/bills');
//       setBills(response.data);
//     } catch (error) {
//       console.error('Failed to fetch bills:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//   <div className="mb-6 flex justify-between items-center">
//   <div>
//     <h2 className="text-2xl font-bold text-gray-800">Bills</h2>
//     <p className="text-gray-500 mt-1">Supplier bills and payables</p>
//   </div>
//   <div className="flex gap-2">
//     <button onClick={() => navigate('/bills/new')} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium">
//       + Create Bill
//     </button>
//     <button onClick={() => navigate('/bills/debit-note')} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
//       + Debit Note
//     </button>
//   </div>
// </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : bills.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
//           No bills yet. Click "Create Bill" to get started.
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {bills.map((bill) => (
//                 <tr key={bill.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm font-medium text-blue-900">{bill.bill_number}</td>
//                   <td className="px-6 py-4 text-sm text-gray-800">{bill.supplier_name}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{new Date(bill.bill_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{new Date(bill.due_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 text-sm text-right font-medium">₦{Number(bill.total).toLocaleString()}</td>
//                   <td className="px-6 py-4">
//                     <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{bill.status}</span>
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

// export default Bills;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface Bill {
  id: number;
  bill_number: string;
  supplier_name: string;
  bill_date: string;
  due_date: string;
  description: string;
  total: number;
  status: string;
}

const Bills = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await api.get('/bills');
      setBills(response.data);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { color: 'bg-green-100 text-green-800', icon: '✅' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
      case 'overdue':
        return { color: 'bg-red-100 text-red-800', icon: '⚠️' };
      case 'partially_paid':
        return { color: 'bg-blue-100 text-blue-800', icon: '💳' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '📄' };
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && new Date(dueDate) < new Date();
  };

  // const filteredBills = bills.filter(bill => {
  //   const matchesStatus = filterStatus === 'all' || 
  //     (filterStatus === 'overdue' ? isOverdue(bill.due_date, bill.status) : bill.status === filterStatus);
    
  //   const matchesSearch = !searchTerm || 
  //     bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     bill.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     bill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
  //   return matchesStatus && matchesSearch;
  // });

  const filteredBills = bills.filter(bill => {
  const matchesStatus = filterStatus === 'all' || 
    (filterStatus === 'overdue' ? isOverdue(bill.due_date, bill.status) : bill.status === filterStatus);
  
  const matchesSearch = !searchTerm || 
    bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.description?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesDateFrom = !dateFrom || bill.bill_date >= dateFrom;
  const matchesDateTo = !dateTo || bill.bill_date <= dateTo;
  
  return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
});

  const pendingCount = bills.filter(b => b.status === 'pending').length;
  const overdueCount = bills.filter(b => isOverdue(b.due_date, b.status)).length;
  const paidCount = bills.filter(b => b.status === 'paid').length;
  
  const totalAmount = filteredBills.reduce((sum, bill) => sum + Number(bill.total), 0);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bills</h2>
            <p className="text-gray-500 mt-1 text-sm">Supplier bills and payables</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => navigate('/bills/new')} 
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       active:bg-blue-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              + Create Bill
            </button>
            <button 
              onClick={() => navigate('/bills/debit-note')} 
              className="px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 
                       active:bg-orange-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              + Debit Note
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search bills by number, supplier, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

<div className="flex gap-2 mt-2 mb-4">
  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} 
    className="px-3 py-2 border border-gray-300 rounded-xl text-sm" />
  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} 
    className="px-3 py-2 border border-gray-300 rounded-xl text-sm" />
  {(dateFrom || dateTo) && (
    <button onClick={() => { setDateFrom(''); setDateTo(''); }} 
      className="px-3 py-2 text-sm text-blue-600 hover:underline">Clear</button>
  )}
</div>
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-2 lg:gap-4 mb-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'all' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-2xl font-bold text-blue-900">{bills.length}</p>
          <p className="text-xs text-gray-500">All</p>
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'pending' ? 'ring-2 ring-yellow-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </button>
        <button
          onClick={() => setFilterStatus('overdue')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'overdue' ? 'ring-2 ring-red-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-2xl font-bold text-red-600">{overdueCount}</p>
          <p className="text-xs text-gray-500">Overdue</p>
        </button>
        <button
          onClick={() => setFilterStatus('paid')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'paid' ? 'ring-2 ring-green-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-2xl font-bold text-green-600">{paidCount}</p>
          <p className="text-xs text-gray-500">Paid</p>
        </button>
      </div>

      {/* Total Amount */}
      {filteredBills.length > 0 && filterStatus !== 'all' && (
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4 text-center">
          <p className="text-xs text-gray-500">Total Amount ({filterStatus})</p>
          <p className="text-lg font-bold text-gray-800">₦{totalAmount.toLocaleString()}</p>
        </div>
      )}

      {/* Bills List */}
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
      ) : filteredBills.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">📄</span>
          <p className="text-gray-500 font-medium">
            {searchTerm || filterStatus !== 'all' 
              ? 'No bills match your criteria' 
              : 'No bills yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Click "Create Bill" to get started'}
          </p>
          {(searchTerm || filterStatus !== 'all') && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
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
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bill #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBills.map((bill) => {
                  const statusBadge = getStatusBadge(bill.status);
                  const overdue = isOverdue(bill.due_date, bill.status);
                  
                  return (
                    <tr 
                      key={bill.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/bills/${bill.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-blue-900">{bill.bill_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{bill.supplier_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {new Date(bill.due_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium">
                        ₦{Number(bill.total).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusBadge.color}`}>
                          {statusBadge.icon} {bill.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredBills.map((bill) => {
              const statusBadge = getStatusBadge(bill.status);
              const overdue = isOverdue(bill.due_date, bill.status);
              
              return (
                <div
                  key={bill.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedBill(selectedBill?.id === bill.id ? null : bill);
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          overdue ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {overdue ? '⚠️' : '💳'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">{bill.supplier_name}</h4>
                          <p className="text-xs text-blue-600 font-medium">{bill.bill_number}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${statusBadge.color}`}>
                        {statusBadge.icon} {bill.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-bold text-gray-800">
                          ₦{Number(bill.total).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
                          {new Date(bill.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {selectedBill?.id === bill.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Bill Date</span>
                          <span className="font-medium">
                            {new Date(bill.bill_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Description</span>
                          <span className="font-medium text-right max-w-[200px] truncate">
                            {bill.description || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusBadge.color}`}>
                            {bill.status}
                          </span>
                        </div>
                        {overdue && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Days Overdue</span>
                            <span className="font-medium text-red-600">
                              {Math.ceil((new Date().getTime() - new Date(bill.due_date).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                        )}
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/bills/${bill.id}`);
                          }}
                          className="w-full mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                                   hover:bg-blue-100 transition-colors"
                        >
                          View Bill Details
                        </button>
                      </div>
                    )}

                    {/* Expand Indicator */}
                    <div className="flex justify-center mt-2">
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          selectedBill?.id === bill.id ? 'rotate-180' : ''
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
              );
            })}
          </div>
        </>
      )}

      {/* Results Count */}
      {!loading && filteredBills.length > 0 && (
        <div className="mt-4 text-center lg:text-left">
          <p className="text-sm text-gray-500">
            Showing {filteredBills.length} of {bills.length} bills
            {(filterStatus !== 'all' || searchTerm) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="ml-2 text-blue-600 hover:underline font-medium"
              >
                Clear filters
              </button>
            )}
          </p>
        </div>
      )}
    </Layout>
  );
};

export default Bills;