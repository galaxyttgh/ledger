// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// interface Quotation {
//   id: number;
//   quotation_number: string;
//   customer_name: string;
//   quotation_date: string;
//   expiry_date: string;
//   description: string;
//   total: number;
//   status: string;
// }

// const Quotations = () => {
//   const navigate = useNavigate();
//   const [quotations, setQuotations] = useState<Quotation[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { fetchQuotations(); }, []);

//   const fetchQuotations = async () => {
//     try {
//       const response = await api.get('/quotations');
//       setQuotations(response.data);
//     } catch (error) {
//       toast.error('Failed to load quotations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleConvert = async (id: number) => {
//     if (!confirm('Convert this quotation to an invoice?')) return;
//     try {
//       const response = await api.post(`/quotations/${id}/convert`);
//       toast.success(`Converted to ${response.data.invoice_number}`);
//       fetchQuotations();
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Conversion failed');
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'draft': return 'bg-yellow-100 text-yellow-800';
//       case 'sent': return 'bg-blue-100 text-blue-800';
//       case 'converted': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Quotations</h2>
//           <p className="text-gray-500 mt-1 text-sm">Create and manage customer quotes</p>
//         </div>
//         <button
//           onClick={() => navigate('/quotations/new')}
//           className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium"
//         >
//           + Create Quotation
//         </button>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : quotations.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
//           No quotations yet. Create your first quote.
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quote #</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expiry</th>
//                 <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {quotations.map((q) => (
//                 <tr key={q.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm font-medium text-blue-900">{q.quotation_number}</td>
//                   <td className="px-6 py-4 text-sm text-gray-800">{q.customer_name}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{new Date(q.quotation_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{q.expiry_date ? new Date(q.expiry_date).toLocaleDateString() : '-'}</td>
//                   <td className="px-6 py-4 text-sm text-right font-medium">₦{Number(q.total).toLocaleString()}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(q.status)}`}>{q.status}</span>
//                   </td>
//                   <td className="px-6 py-4">
//                     {q.status !== 'converted' && (
//                       <button onClick={() => handleConvert(q.id)} className="text-green-600 hover:text-green-800 text-sm font-medium">
//                         → Convert to Invoice
//                       </button>
//                     )}
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

// export default Quotations;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface Quotation {
  id: number;
  quotation_number: string;
  customer_name: string;
  quotation_date: string;
  expiry_date: string;
  description: string;
  total: number;
  status: string;
  reference_number?: string;
}

const Quotations = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'converted'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConvertConfirm, setShowConvertConfirm] = useState<number | null>(null);

  useEffect(() => { fetchQuotations(); }, []);

  const fetchQuotations = async () => {
    try {
      const response = await api.get('/quotations');
      setQuotations(response.data);
    } catch (error) {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = (id: number) => {
    setShowConvertConfirm(id);
  };

  const confirmConvert = async (id: number) => {
    try {
      const response = await api.post(`/quotations/${id}/convert`);
      toast.success(`Converted to ${response.data.invoice_number}`);
      setShowConvertConfirm(null);
      fetchQuotations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Conversion failed');
      setShowConvertConfirm(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return { color: 'bg-yellow-100 text-yellow-800', icon: '📝' };
      case 'sent': return { color: 'bg-blue-100 text-blue-800', icon: '📤' };
      case 'converted': return { color: 'bg-green-100 text-green-800', icon: '✅' };
      case 'expired': return { color: 'bg-red-100 text-red-800', icon: '⏰' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: '📄' };
    }
  };

  const isExpired = (expiryDate: string | null, status: string) => {
    if (!expiryDate || status === 'converted') return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    
    const matchesSearch = !searchTerm || 
      q.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const draftCount = quotations.filter(q => q.status === 'draft').length;
  const sentCount = quotations.filter(q => q.status === 'sent').length;
  const convertedCount = quotations.filter(q => q.status === 'converted').length;
  
  const totalAmount = filteredQuotations.reduce((sum, q) => sum + Number(q.total), 0);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quotations</h2>
            <p className="text-gray-500 mt-1 text-sm">Create and manage customer quotes</p>
          </div>
          <button
            onClick={() => navigate('/quotations/new')}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                     active:bg-blue-800 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            + Create Quotation
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by quote number, customer, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-2 lg:gap-4 mb-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'all' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-2xl font-bold text-blue-900">{quotations.length}</p>
          <p className="text-xs text-gray-500">All</p>
        </button>
        <button
          onClick={() => setFilterStatus('draft')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'draft' ? 'ring-2 ring-yellow-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-2xl font-bold text-yellow-600">{draftCount}</p>
          <p className="text-xs text-gray-500">Draft</p>
        </button>
        <button
          onClick={() => setFilterStatus('sent')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'sent' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-2xl font-bold text-blue-600">{sentCount}</p>
          <p className="text-xs text-gray-500">Sent</p>
        </button>
        <button
          onClick={() => setFilterStatus('converted')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'converted' ? 'ring-2 ring-green-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-2xl font-bold text-green-600">{convertedCount}</p>
          <p className="text-xs text-gray-500">Converted</p>
        </button>
      </div>

      {/* Total Amount */}
      {filteredQuotations.length > 0 && filterStatus !== 'all' && (
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4 text-center">
          <p className="text-xs text-gray-500">Total Amount ({filterStatus})</p>
          <p className="text-lg font-bold text-gray-800">₦{totalAmount.toLocaleString()}</p>
        </div>
      )}

      {/* Quotations List */}
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
      ) : filteredQuotations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-gray-500 font-medium">
            {searchTerm || filterStatus !== 'all' 
              ? 'No quotations match your criteria' 
              : 'No quotations yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first quote to get started'}
          </p>
          {(searchTerm || filterStatus !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quote #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotations.map((q) => {
                  const statusBadge = getStatusBadge(q.status);
                  const expired = isExpired(q.expiry_date, q.status);
                  
                  return (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-blue-900">{q.quotation_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{q.customer_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(q.quotation_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={expired ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {q.expiry_date ? new Date(q.expiry_date).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{q.reference_number || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">
                        ₦{Number(q.total).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusBadge.color}`}>
                          {statusBadge.icon} {q.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {q.status !== 'converted' && (
                          <button 
                            onClick={() => handleConvert(q.id)} 
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            → Convert
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
       {/* Mobile Card View */}
<div className="lg:hidden space-y-3">
  {filteredQuotations.map((q) => {
    const statusBadge = getStatusBadge(q.status);
    const expired = isExpired(q.expiry_date, q.status);
    
    return (
      <div
        key={q.id}
        className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedQuotation(selectedQuotation?.id === q.id ? null : q)}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                expired ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {expired ? '⏰' : '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm truncate">{q.customer_name}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-blue-600 font-medium">{q.quotation_number}</p>
                  {q.reference_number && (
                    <>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500 truncate">{q.reference_number}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${statusBadge.color}`}>
              {statusBadge.icon} {q.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-2">
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="font-bold text-gray-800">
                ₦{Number(q.total).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Expiry</p>
              <p className={`font-medium ${expired ? 'text-red-600' : 'text-gray-800'}`}>
                {q.expiry_date ? new Date(q.expiry_date).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>

          {/* Show Reference in main card if exists */}
          {q.reference_number && (
            <div className="text-xs text-gray-500 mb-2">
              <span className="text-gray-400">Ref: </span>
              <span className="font-medium">{q.reference_number}</span>
            </div>
          )}

          {/* Expandable Details */}
          {selectedQuotation?.id === q.id && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quote Date</span>
                <span className="font-medium">
                  {new Date(q.quotation_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Description</span>
                <span className="font-medium text-right max-w-[200px] truncate">
                  {q.description || '-'}
                </span>
              </div>
              {q.reference_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-medium text-gray-800">{q.reference_number}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusBadge.color}`}>
                  {q.status}
                </span>
              </div>
              {expired && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Days Expired</span>
                  <span className="font-medium text-red-600">
                    {Math.ceil((new Date().getTime() - new Date(q.expiry_date!).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              )}
              
              {q.status !== 'converted' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConvert(q.id);
                  }}
                  className="w-full mt-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium 
                           hover:bg-green-100 transition-colors"
                >
                  → Convert to Invoice
                </button>
              )}
            </div>
          )}

          {/* Expand Indicator */}
          <div className="flex justify-center mt-2">
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${
                selectedQuotation?.id === q.id ? 'rotate-180' : ''
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

          {/* Results Count */}
          <div className="mt-4 text-center lg:text-left">
            <p className="text-sm text-gray-500">
              Showing {filteredQuotations.length} of {quotations.length} quotations
              {(filterStatus !== 'all' || searchTerm) && (
                <button 
                  onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                  className="ml-2 text-blue-600 hover:underline font-medium"
                >
                  Clear filters
                </button>
              )}
            </p>
          </div>
        </>
      )}

      {/* Convert Confirmation Modal */}
      {showConvertConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConvertConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <span className="text-4xl mb-3 block">🔄</span>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Convert to Invoice?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This will create an invoice from this quotation. The quotation will be marked as converted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConvertConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                           hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmConvert(showConvertConfirm)}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                           transition-colors text-sm font-medium"
                >
                  Convert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Quotations;