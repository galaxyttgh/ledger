// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface Receipt {
//   id: number;
//   receipt_number: string;
//   customer_name: string;
//   invoice_number: string | null;
//   amount: number;
//   payment_date: string;
//   payment_method: string;
// }

// const Receipts = () => {
//   const navigate = useNavigate();
//   const [receipts, setReceipts] = useState<Receipt[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchReceipts();
//   }, []);

//   const fetchReceipts = async () => {
//     try {
//       const response = await api.get('/receipts');
//       setReceipts(response.data);
//     } catch (error) {
//       console.error('Failed to fetch receipts:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Receipts</h2>
//           <p className="text-gray-500 mt-1">Customer payment records</p>
//         </div>
//         <button onClick={() => navigate('/receipts/new')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
//           + Record Receipt
//         </button>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : receipts.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
//           No receipts yet. Click "Record Receipt" to get started.
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {receipts.map((r) => (
//                 <tr key={r.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm font-medium text-blue-900">{r.receipt_number}</td>
//                   <td className="px-6 py-4 text-sm text-gray-800">{r.customer_name}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{r.invoice_number || '-'}</td>
//                   <td className="px-6 py-4 text-sm text-right font-medium text-green-600">₦{Number(r.amount).toLocaleString()}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{new Date(r.payment_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600 capitalize">{r.payment_method.replace('_', ' ')}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default Receipts;



import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

// interface Receipt {
//   id: number;
//   receipt_number: string;
//   customer_name: string;
//   invoice_number: string | null;
//   amount: number;
//   payment_date: string;
//   payment_method: string;
// }

interface Receipt {
  id: number;
  receipt_number: string;
  customer_name: string;
  invoice_number: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}

const Receipts = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await api.get('/receipts');
      setReceipts(response.data);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
      toast.error('Failed to load receipts');
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

  // const filteredReceipts = receipts.filter(r => {
  //   const matchesSearch = !searchTerm || 
  //     r.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     r.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
  //   const matchesMethod = filterMethod === 'all' || r.payment_method === filterMethod;
    
  //   return matchesSearch && matchesMethod;
  // });

  const filteredReceipts = receipts.filter(r => {
  const matchesSearch = !searchTerm || 
    r.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesMethod = filterMethod === 'all' || r.payment_method === filterMethod;
  
  const matchesDateFrom = !dateFrom || r.payment_date >= dateFrom;
  const matchesDateTo = !dateTo || r.payment_date <= dateTo;
  
  return matchesSearch && matchesMethod && matchesDateFrom && matchesDateTo;
});

  const totalAmount = filteredReceipts.reduce((sum, r) => sum + Number(r.amount), 0);
  
  const methodCounts = receipts.reduce((acc, r) => {
    acc[r.payment_method] = (acc[r.payment_method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueMethods = [...new Set(receipts.map(r => r.payment_method))];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Receipts</h2>
            <p className="text-gray-500 mt-1 text-sm">Customer payment records</p>
          </div>
          <button 
            onClick={() => navigate('/receipts/new')} 
            className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                     active:bg-green-800 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            + Record Receipt
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by receipt #, customer, or invoice..."
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
            All ({receipts.length})
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

<div className="flex gap-2 mb-4">
  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} 
    className="px-3 py-2 border border-gray-300 rounded-xl text-sm" />
  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} 
    className="px-3 py-2 border border-gray-300 rounded-xl text-sm" />
  {(dateFrom || dateTo) && (
    <button onClick={() => { setDateFrom(''); setDateTo(''); }} 
      className="px-3 py-2 text-sm text-blue-600 hover:underline">Clear</button>
  )}
</div>
      {/* Total Amount */}
      {filteredReceipts.length > 0 && filterMethod !== 'all' && (
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4 text-center">
          <p className="text-xs text-gray-500">Total ({filterMethod.replace('_', ' ')})</p>
          <p className="text-lg font-bold text-green-600">₦{totalAmount.toLocaleString()}</p>
        </div>
      )}

      {/* Receipts List */}
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
      ) : filteredReceipts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">💰</span>
          <p className="text-gray-500 font-medium">
            {searchTerm || filterMethod !== 'all' ? 'No receipts match your criteria' : 'No receipts yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filterMethod !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Click "Record Receipt" to get started'}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Receipt #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                </tr>
              </thead>
           <tbody className="divide-y divide-gray-100">
  {filteredReceipts.map((r) => (
    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm font-medium text-blue-900">{r.receipt_number}</td>
      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{r.customer_name}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{r.invoice_number || '-'}</td>
      <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
        ₦{Number(r.amount).toLocaleString()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{r.reference_number || '-'}</td>
      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[150px]">{r.notes || '-'}</td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {new Date(r.payment_date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getMethodColor(r.payment_method)}`}>
          {getMethodIcon(r.payment_method)} {r.payment_method.replace('_', ' ')}
        </span>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredReceipts.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedReceipt(selectedReceipt?.id === r.id ? null : r)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        getMethodColor(r.payment_method).split(' ')[0]
                      }`}>
                        {getMethodIcon(r.payment_method)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{r.customer_name}</h4>
                        <p className="text-xs text-blue-600 font-medium">{r.receipt_number}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600 ml-2 flex-shrink-0">
                      ₦{Number(r.amount).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(r.payment_date).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${getMethodColor(r.payment_method)}`}>
                      {r.payment_method.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Expandable Details */}
                {/* Expandable Details */}
{selectedReceipt?.id === r.id && (
  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Receipt Number</span>
      <span className="font-medium text-blue-900">{r.receipt_number}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Customer</span>
      <span className="font-medium text-gray-800">{r.customer_name}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Invoice</span>
      <span className="font-medium text-gray-800">{r.invoice_number || 'On-account receipt'}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Amount</span>
      <span className="font-bold text-green-600">₦{Number(r.amount).toLocaleString()}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Date</span>
      <span className="font-medium">{new Date(r.payment_date).toLocaleDateString()}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Method</span>
      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getMethodColor(r.payment_method)}`}>
        {getMethodIcon(r.payment_method)} {r.payment_method.replace('_', ' ')}
      </span>
    </div>
    {r.reference_number && (
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Reference</span>
        <span className="font-medium text-gray-800">{r.reference_number}</span>
      </div>
    )}
    {r.notes && (
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Notes</span>
        <span className="font-medium text-gray-800 truncate max-w-[200px]">{r.notes}</span>
      </div>
    )}
  </div>
)}

                  {/* Expand Indicator */}
                  <div className="flex justify-center mt-2">
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedReceipt?.id === r.id ? 'rotate-180' : ''
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
              Showing {filteredReceipts.length} of {receipts.length} receipts
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

export default Receipts;