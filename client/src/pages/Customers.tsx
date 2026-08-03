// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface Customer {
//   id: number;
//   code: string;
//   name: string;
//   email: string;
//   phone: string;
//   current_balance: number;
// }

// const Customers = () => {
//   const navigate = useNavigate();
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   const handleDelete = async (id: number) => {
//   if (!confirm('Delete this customer?')) return;
//   try {
//     await api.delete(`/customers/${id}`);
//     fetchCustomers();
//   } catch (err: any) {
//     alert(err.response?.data?.error || 'Delete failed');
//   }
// };

//   const fetchCustomers = async () => {
//     try {
//       const response = await api.get('/customers');
//       setCustomers(response.data);
//     } catch (error) {
//       console.error('Failed to fetch customers:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
//           <p className="text-gray-500 mt-1">Manage customer accounts</p>
//         </div>
//         <button
//           onClick={() => navigate('/customers/new')}
//           className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
//         >
//           + Add Customer
//         </button>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : customers.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
//           No customers yet. Click "Add Customer" to get started.
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {customers.map((customer) => (
//                 <tr key={customer.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm font-medium text-blue-900">{customer.code}</td>
//                   <td className="px-6 py-4 text-sm text-gray-800">{customer.name}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{customer.email || '-'}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{customer.phone || '-'}</td>
//                   <td className="px-6 py-4 text-sm text-right font-medium">
//                     ₦{Number(customer.current_balance).toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4">
//   <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800 text-sm">🗑️</button>
// </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default Customers;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface Customer {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
   tax_id?: string;
  credit_limit?: number;
  current_balance: number;
}

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'balance'>('name');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: number) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async (id: number) => {
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted successfully');
      setShowDeleteConfirm(null);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Delete failed');
      setShowDeleteConfirm(null);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers
    .filter(customer => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(search) ||
        customer.code.toLowerCase().includes(search) ||
        (customer.email && customer.email.toLowerCase().includes(search)) ||
        (customer.phone && customer.phone.toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.current_balance - a.current_balance;
    });

  const totalBalance = filteredCustomers.reduce((sum, c) => sum + Number(c.current_balance), 0);
  const activeCustomers = filteredCustomers.filter(c => c.current_balance !== 0).length;
  const zeroBalance = filteredCustomers.filter(c => c.current_balance === 0).length;

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return '↗';
    if (balance < 0) return '↘';
    return '→';
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
            <p className="text-gray-500 mt-1 text-sm">Manage customer accounts</p>
          </div>
          <button
            onClick={() => navigate('/customers/new')}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                     active:bg-blue-800 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            + Add Customer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search customers by name, code, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-lg lg:text-2xl font-bold text-blue-900">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Active</p>
          <p className="text-lg lg:text-2xl font-bold text-green-600">{activeCustomers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Balance</p>
          <p className="text-lg lg:text-2xl font-bold text-gray-900">
            ₦{totalBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { value: 'name', label: 'By Name' },
          { value: 'balance', label: 'By Balance' },
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

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
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
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">👥</span>
          <p className="text-gray-500 font-medium">
            {searchTerm ? 'No customers match your search' : 'No customers yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm ? 'Try adjusting your search' : 'Click "Add Customer" to get started'}
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-3 text-blue-600 text-sm font-medium hover:underline"
            >
              Clear search
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax ID</th>
<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit Limit</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
                  
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-blue-900">{customer.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.email ? (
                        <a href={`mailto:${customer.email}`} className="hover:text-blue-600" onClick={(e) => e.stopPropagation()}>
                          {customer.email}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.phone ? (
                        <a href={`tel:${customer.phone}`} className="hover:text-blue-600" onClick={(e) => e.stopPropagation()}>
                          {customer.phone}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.tax_id || '-'}</td>
<td className="px-6 py-4 text-sm text-right">₦{Number(customer.credit_limit || 0).toLocaleString()}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${getBalanceColor(Number(customer.current_balance))}`}>
                      ₦{Math.abs(Number(customer.current_balance)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(customer.id);
                        }} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete customer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCustomer(selectedCustomer?.id === customer.id ? null : customer)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-900">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{customer.name}</h4>
                        <p className="text-xs text-blue-600 font-medium">{customer.code}</p>
                      </div>
                    </div>
                    <div className={`text-right ml-2 flex-shrink-0`}>
                      <p className={`text-sm font-bold ${getBalanceColor(Number(customer.current_balance))}`}>
                        {getBalanceIcon(Number(customer.current_balance))} ₦{Math.abs(Number(customer.current_balance)).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {customer.email && (
                      <span className="flex items-center gap-1">
                        <span>✉️</span>
                        <span className="truncate max-w-[150px]">{customer.email}</span>
                      </span>
                    )}
                    {customer.phone && (
                      <span className="flex items-center gap-1">
                        <span>📞</span>
                        <span>{customer.phone}</span>
                      </span>
                    )}
                    
                  </div>

                  {/* Expandable Details */}
                  {selectedCustomer?.id === customer.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Customer Code</span>
                        <span className="font-medium text-blue-900">{customer.code}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Full Name</span>
                        <span className="font-medium text-gray-800">{customer.name}</span>
                      </div>
                      {customer.email && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Email</span>
                          <a 
                            href={`mailto:${customer.email}`} 
                            className="font-medium text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {customer.email}
                          </a>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Phone</span>
                          <a 
                            href={`tel:${customer.phone}`} 
                            className="font-medium text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {customer.phone}
                          </a>
                        </div>
                      )}
                      {customer.tax_id && (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">Tax ID</span>
    <span className="font-medium text-gray-800">{customer.tax_id}</span>
  </div>
)}
<div className="flex justify-between text-sm">
  <span className="text-gray-500">Credit Limit</span>
  <span className="font-medium text-gray-800">₦{Number(customer.credit_limit || 0).toLocaleString()}</span>
</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Balance</span>
                        <span className={`font-bold ${getBalanceColor(Number(customer.current_balance))}`}>
                          ₦{Number(customer.current_balance).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customers/${customer.id}`);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                                   hover:bg-blue-100 transition-colors"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(customer.id);
                          }}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium 
                                   hover:bg-red-100 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expand Indicator */}
                  <div className="flex justify-center mt-2">
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedCustomer?.id === customer.id ? 'rotate-180' : ''
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
              Showing {filteredCustomers.length} of {customers.length} customers
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <span className="text-4xl mb-3 block">⚠️</span>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Customer?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                           hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 
                           transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Customers;