// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface Payment {
//   id: number;
//   payment_number: string;
//   supplier_name: string;
//   bill_number: string | null;
//   amount: number;
//   payment_date: string;
//   payment_method: string;
// }

// const Payments = () => {
//   const navigate = useNavigate();
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchPayments();
//   }, []);

//   const fetchPayments = async () => {
//     try {
//       const response = await api.get('/payments');
//       setPayments(response.data);
//     } catch (error) {
//       console.error('Failed to fetch payments:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
//           <p className="text-gray-500 mt-1">Supplier payment records</p>
//         </div>
//         <button onClick={() => navigate('/payments/new')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
//           + Record Payment
//         </button>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : payments.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
//           No payments yet. Click "Record Payment" to get started.
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {payments.map((p) => (
//                 <tr key={p.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm font-medium text-blue-900">{p.payment_number}</td>
//                   <td className="px-6 py-4 text-sm text-gray-800">{p.supplier_name}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{p.bill_number || '-'}</td>
//                   <td className="px-6 py-4 text-sm text-right font-medium text-red-600">₦{Number(p.amount).toLocaleString()}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{new Date(p.payment_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.payment_method.replace('_', ' ')}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default Payments;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

// interface Payment {
//   id: number;
//   payment_number: string;
//   supplier_name: string;
//   bill_number: string | null;
//   amount: number;
//   payment_date: string;
//   payment_method: string;
// }

interface Payment {
  id: number;
  payment_number: string;
  supplier_name: string;
  bill_number: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      bank_transfer: '🏦',
      cash: '💵',
      cheque: '📝',
      online: '🌐',
    };
    return icons[method] || '💳';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      bank_transfer: 'bg-blue-100 text-blue-800',
      cash: 'bg-green-100 text-green-800',
      cheque: 'bg-purple-100 text-purple-800',
      online: 'bg-cyan-100 text-cyan-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = !searchTerm || 
      p.payment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bill_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = filterMethod === 'all' || p.payment_method === filterMethod;
    
    return matchesSearch && matchesMethod;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  
  const methodCounts = payments.reduce((acc, p) => {
    acc[p.payment_method] = (acc[p.payment_method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueMethods = [...new Set(payments.map(p => p.payment_method))];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
            <p className="text-gray-500 mt-1 text-sm">Supplier payment records</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => navigate('/payments/new')} 
              className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 
                       active:bg-red-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              + Record Payment
            </button>
            <button 
              onClick={() => navigate('/payments/batch')} 
              className="px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 
                       active:bg-orange-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              📦 Batch Payment
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by payment #, supplier, or bill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Method Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setFilterMethod('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterMethod === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({payments.length})
          </button>
          {uniqueMethods.map(method => (
            <button
              key={method}
              onClick={() => setFilterMethod(method)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterMethod === method ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getMethodIcon(method)} {method.replace('_', ' ')} ({methodCounts[method] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Total Amount */}
      {filteredPayments.length > 0 && filterMethod !== 'all' && (
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4 text-center">
          <p className="text-xs text-gray-500">Total ({filterMethod.replace('_', ' ')})</p>
          <p className="text-lg font-bold text-red-600">₦{totalAmount.toLocaleString()}</p>
        </div>
      )}

      {/* Payments List */}
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
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">💳</span>
          <p className="text-gray-500 font-medium">
            {searchTerm || filterMethod !== 'all' ? 'No payments match your criteria' : 'No payments yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filterMethod !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Click "Record Payment" to get started'}
          </p>
          {(searchTerm || filterMethod !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setFilterMethod('all'); }}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bill</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-900">{p.payment_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{p.supplier_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.bill_number || '-'}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-red-600">
                      ₦{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.reference_number || '-'}</td>
<td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[150px]">{p.notes || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(p.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getMethodColor(p.payment_method)}`}>
                        {getMethodIcon(p.payment_method)} {p.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredPayments.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedPayment(selectedPayment?.id === p.id ? null : p)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        getMethodColor(p.payment_method).split(' ')[0]
                      }`}>
                        {getMethodIcon(p.payment_method)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{p.supplier_name}</h4>
                        <p className="text-xs text-blue-600 font-medium">{p.payment_number}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-red-600 ml-2 flex-shrink-0">
                      ₦{Number(p.amount).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${getMethodColor(p.payment_method)}`}>
                      {p.payment_method.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Expandable Details */}
                  {selectedPayment?.id === p.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Number</span>
                        <span className="font-medium text-blue-900">{p.payment_number}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Supplier</span>
                        <span className="font-medium text-gray-800">{p.supplier_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bill</span>
                        <span className="font-medium text-gray-800">{p.bill_number || 'On-account payment'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-bold text-red-600">₦{Number(p.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium">{new Date(p.payment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Method</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getMethodColor(p.payment_method)}`}>
                          {getMethodIcon(p.payment_method)} {p.payment_method.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Expand Indicator */}
                  <div className="flex justify-center mt-2">
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedPayment?.id === p.id ? 'rotate-180' : ''
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
              Showing {filteredPayments.length} of {payments.length} payments
              {(filterMethod !== 'all' || searchTerm) && (
                <button 
                  onClick={() => { setSearchTerm(''); setFilterMethod('all'); }}
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

export default Payments;