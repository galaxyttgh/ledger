import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  description: string;
  total: number;
  status: string;
  created_by_name: string;
}

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'posted' | 'paid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return { color: 'bg-green-100 text-green-800', icon: '📄' };
      case 'paid':
        return { color: 'bg-blue-100 text-blue-800', icon: '✅' };
      case 'overdue':
        return { color: 'bg-red-100 text-red-800', icon: '⚠️' };
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800', icon: '📝' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '📋' };
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && new Date(dueDate) < new Date();
  };

  // const filteredInvoices = invoices.filter(inv => {
  //   const matchesStatus = filterStatus === 'all' || 
  //     (filterStatus === 'overdue' ? isOverdue(inv.due_date, inv.status) : inv.status === filterStatus);
    
  //   const matchesSearch = !searchTerm || 
  //     inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     inv.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
  //   return matchesStatus && matchesSearch;
  // });

  const filteredInvoices = invoices.filter(inv => {
  const matchesStatus = filterStatus === 'all' || 
    (filterStatus === 'overdue' ? isOverdue(inv.due_date, inv.status) : inv.status === filterStatus);
  
  const matchesSearch = !searchTerm || 
    inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesDateFrom = !dateFrom || inv.invoice_date >= dateFrom;
  const matchesDateTo = !dateTo || inv.invoice_date <= dateTo;
  
  return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
});

  const postedCount = invoices.filter(i => i.status === 'posted').length;
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const overdueCount = invoices.filter(i => isOverdue(i.due_date, i.status)).length;
  
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
            <p className="text-gray-500 mt-1 text-sm">Customer invoices and billing</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/invoices/new')}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       active:bg-blue-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              + Create Invoice
            </button>
            <button
              onClick={() => navigate('/invoices/credit-note')}
              className="px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 
                       active:bg-orange-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              + Credit Note
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
            placeholder="Search invoices by number, customer, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-2 mb-4">
  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} 
    className="px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="From" />
  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} 
    className="px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="To" />
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
          <p className="text-lg lg:text-2xl font-bold text-blue-900">{invoices.length}</p>
          <p className="text-xs text-gray-500">All</p>
        </button>
        <button
          onClick={() => setFilterStatus('posted')}
          className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center transition-all hover:shadow-md ${
            filterStatus === 'posted' ? 'ring-2 ring-green-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-2xl font-bold text-green-600">{postedCount}</p>
          <p className="text-xs text-gray-500">Posted</p>
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
            filterStatus === 'paid' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
        >
          <p className="text-lg lg:text-2xl font-bold text-blue-600">{paidCount}</p>
          <p className="text-xs text-gray-500">Paid</p>
        </button>
      </div>

      {/* Total Amount */}
      {filteredInvoices.length > 0 && filterStatus !== 'all' && (
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4 text-center">
          <p className="text-xs text-gray-500">Total Amount ({filterStatus})</p>
          <p className="text-lg font-bold text-gray-800">₦{totalAmount.toLocaleString()}</p>
        </div>
      )}

      {/* Invoices List */}
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
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">🧾</span>
          <p className="text-gray-500 font-medium">
            {searchTerm || filterStatus !== 'all' 
              ? 'No invoices match your criteria' 
              : 'No invoices yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Click "Create Invoice" to get started'}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((inv) => {
                  const statusBadge = getStatusBadge(inv.status);
                  const overdue = isOverdue(inv.due_date, inv.status);
                  
                  return (
                    <tr 
                      key={inv.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-blue-900">{inv.invoice_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{inv.customer_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(inv.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {new Date(inv.due_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium">
                        ₦{Number(inv.total).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusBadge.color}`}>
                          {statusBadge.icon} {inv.status}
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
            {filteredInvoices.map((inv) => {
              const statusBadge = getStatusBadge(inv.status);
              const overdue = isOverdue(inv.due_date, inv.status);
              
              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv);
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          overdue ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {overdue ? '⚠️' : '🧾'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">{inv.customer_name}</h4>
                          <p className="text-xs text-blue-600 font-medium">{inv.invoice_number}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${statusBadge.color}`}>
                        {statusBadge.icon} {inv.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-bold text-gray-800">
                          ₦{Number(inv.total).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
                          {new Date(inv.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {selectedInvoice?.id === inv.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Invoice Date</span>
                          <span className="font-medium">
                            {new Date(inv.invoice_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Description</span>
                          <span className="font-medium text-right max-w-[200px] truncate">
                            {inv.description || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Created By</span>
                          <span className="font-medium">{inv.created_by_name || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusBadge.color}`}>
                            {inv.status}
                          </span>
                        </div>
                        {overdue && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Days Overdue</span>
                            <span className="font-medium text-red-600">
                              {Math.ceil((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                        )}
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invoices/${inv.id}`);
                          }}
                          className="w-full mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                                   hover:bg-blue-100 transition-colors"
                        >
                          View Invoice Details
                        </button>
                      </div>
                    )}

                    {/* Expand Indicator */}
                    <div className="flex justify-center mt-2">
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          selectedInvoice?.id === inv.id ? 'rotate-180' : ''
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
              Showing {filteredInvoices.length} of {invoices.length} invoices
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
        </>
      )}
    </Layout>
  );
};

export default Invoices;