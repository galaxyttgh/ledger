// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// const PurchaseOrders = () => {
//   const navigate = useNavigate();
//   const [pos, setPos] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { fetchPOs(); }, []);

//   const fetchPOs = async () => {
//     try {
//       const response = await api.get('/purchase-orders');
//       setPos(response.data);
//     } catch (error) {
//       toast.error('Failed to load POs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Purchase Orders</h2>
//           <p className="text-gray-500 mt-1 text-sm">Manage POs, goods receipts, and 3-way match</p>
//         </div>
//         <div className="flex gap-2">
//           <button onClick={() => navigate('/purchase-orders/new')} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium">
//             + Create PO
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center py-12">Loading...</div>
//       ) : pos.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">No purchase orders yet</div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">PO #</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
//                 <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {pos.map((po) => (
//                 <tr key={po.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 font-medium text-blue-900">{po.po_number}</td>
//                   <td className="px-6 py-4">{po.supplier_name}</td>
//                   <td className="px-6 py-4 text-gray-600">{new Date(po.po_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 text-right font-medium">₦{Number(po.total).toLocaleString()}</td>
//                   <td className="px-6 py-4">
//                     <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{po.status}</span>
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

// export default PurchaseOrders;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_name: string;
  po_date: string;
  expected_delivery: string | null;
  description: string;
  total: number;
  status: string;
  reference_number?: string;
}

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchPOs(); }, []);

  const fetchPOs = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setPos(response.data);
    } catch (error) {
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800', icon: '📝' };
      case 'sent':
        return { color: 'bg-blue-100 text-blue-800', icon: '📤' };
      case 'received':
        return { color: 'bg-green-100 text-green-800', icon: '📦' };
      case 'billed':
        return { color: 'bg-purple-100 text-purple-800', icon: '💳' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: '❌' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '📄' };
    }
  };

  const isDelayed = (expectedDelivery: string | null, status: string) => {
    if (!expectedDelivery || status === 'received' || status === 'cancelled') return false;
    return new Date(expectedDelivery) < new Date();
  };

  const filteredPOs = pos.filter(po => {
    const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
    
    const matchesSearch = !searchTerm || 
      po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const statusCounts = pos.reduce((acc, po) => {
    acc[po.status] = (acc[po.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueStatuses = [...new Set(pos.map(po => po.status))];
  const totalAmount = filteredPOs.reduce((sum, po) => sum + Number(po.total), 0);

  return (
    <Layout>
      {/* Header */}
     <div className="mb-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Purchase Orders</h2>
      <p className="text-gray-500 mt-1 text-sm">Manage POs, goods receipts, and 3-way match</p>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={() => navigate('/purchase-orders/new')} 
        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium"
      >
        + Create PO
      </button>
      <button 
        onClick={() => navigate('/purchase-orders/goods-receipt')} 
        className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors text-sm font-medium"
      >
        + Goods Receipt
      </button>
      <button 
        onClick={() => navigate('/purchase-orders/match')} 
        className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:bg-purple-800 transition-colors text-sm font-medium"
      >
        🔍 3-Way Match
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
            placeholder="Search by PO number, supplier, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            filterStatus === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({pos.length})
        </button>
        {uniqueStatuses.map(status => {
          const badge = getStatusBadge(status);
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterStatus === status ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {badge.icon} {status} ({statusCounts[status] || 0})
            </button>
          );
        })}
      </div>

      {/* Total Amount */}
      {filteredPOs.length > 0 && filterStatus !== 'all' && (
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4 text-center">
          <p className="text-xs text-gray-500">Total Amount ({filterStatus})</p>
          <p className="text-lg font-bold text-gray-800">₦{totalAmount.toLocaleString()}</p>
        </div>
      )}

      {/* Purchase Orders List */}
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
      ) : filteredPOs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-gray-500 font-medium">
            {searchTerm || filterStatus !== 'all' 
              ? 'No purchase orders match your criteria' 
              : 'No purchase orders yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first purchase order to get started'}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">PO #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Delivery</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPOs.map((po) => {
                  const statusBadge = getStatusBadge(po.status);
                  const delayed = isDelayed(po.expected_delivery, po.status);
                  
                  return (
                    <tr 
                      key={po.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/purchase-orders/${po.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-blue-900">{po.po_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{po.supplier_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(po.po_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={delayed ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium">
                        ₦{Number(po.total).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusBadge.color}`}>
                          {statusBadge.icon} {po.status}
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
            {filteredPOs.map((po) => {
              const statusBadge = getStatusBadge(po.status);
              const delayed = isDelayed(po.expected_delivery, po.status);
              
              return (
                <div
                  key={po.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedPO(selectedPO?.id === po.id ? null : po)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          delayed ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {delayed ? '⚠️' : '📋'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">{po.supplier_name}</h4>
                          <p className="text-xs text-blue-600 font-medium">{po.po_number}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${statusBadge.color}`}>
                        {statusBadge.icon} {po.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-bold text-gray-800">
                          ₦{Number(po.total).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Delivery</p>
                        <p className={`font-medium ${delayed ? 'text-red-600' : 'text-gray-800'}`}>
                          {po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {selectedPO?.id === po.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">PO Date</span>
                          <span className="font-medium">
                            {new Date(po.po_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Description</span>
                          <span className="font-medium text-right max-w-[200px] truncate">
                            {po.description || '-'}
                          </span>
                        </div>
                        {po.reference_number && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Reference</span>
                            <span className="font-medium text-gray-800">{po.reference_number}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusBadge.color}`}>
                            {po.status}
                          </span>
                        </div>
                        {delayed && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Days Delayed</span>
                            <span className="font-medium text-red-600">
                              {Math.ceil((new Date().getTime() - new Date(po.expected_delivery!).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                        )}
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/purchase-orders/${po.id}`);
                          }}
                          className="w-full mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                                   hover:bg-blue-100 transition-colors"
                        >
                          View PO Details
                        </button>
                      </div>
                    )}

                    {/* Expand Indicator */}
                    <div className="flex justify-center mt-2">
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          selectedPO?.id === po.id ? 'rotate-180' : ''
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
              Showing {filteredPOs.length} of {pos.length} purchase orders
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
    </Layout>
  );
};

export default PurchaseOrders;