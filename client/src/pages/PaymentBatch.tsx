// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// const PaymentBatch = () => {
//   const navigate = useNavigate();
//   const [suppliers, setSuppliers] = useState<any[]>([]);
//   const [bills, setBills] = useState<any[]>([]);
//   const [supplierId, setSupplierId] = useState('');
//   const [selectedBills, setSelectedBills] = useState<number[]>([]);
//   const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   useEffect(() => { fetchSuppliers(); }, []);
//   useEffect(() => { if (supplierId) fetchBills(parseInt(supplierId)); }, [supplierId]);

//   const fetchSuppliers = async () => {
//     const response = await api.get('/suppliers');
//     setSuppliers(response.data);
//   };

//   const fetchBills = async (id: number) => {
//     const response = await api.get('/bills');
//     setBills(response.data.filter((b: any) => b.supplier_id === id && b.status !== 'paid'));
//   };

//   const toggleBill = (id: number) => {
//     setSelectedBills(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
//   };

//   const total = bills.filter(b => selectedBills.includes(b.id)).reduce((sum, b) => sum + Number(b.total), 0);

//   const handleSubmit = async () => {
//     if (selectedBills.length === 0) return;
//     setLoading(true);
//     try {
//       await api.post('/payments/batch', { supplier_id: parseInt(supplierId), bill_ids: selectedBills, payment_date: paymentDate });
//       setMessage('✅ Batch payment processed');
//       setSelectedBills([]);
//     } catch (error) {
//       setMessage('❌ Failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Payment Batch</h2>
//           <p className="text-gray-500 mt-1">Pay multiple bills at once</p>
//         </div>
//         <button onClick={() => navigate('/payments')} className="px-4 py-2 border rounded-lg">← Back</button>
//       </div>

//       {message && <p className="mb-4 text-sm font-medium">{message}</p>}

//       <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-4 items-end">
//         <div>
//           <label className="block text-sm font-medium mb-1">Supplier</label>
//           <select value={supplierId} onChange={(e) => { setSupplierId(e.target.value); setSelectedBills([]); }} className="px-4 py-2 border rounded-lg">
//             <option value="">Select...</option>
//             {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Payment Date</label>
//           <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="px-4 py-2 border rounded-lg" />
//         </div>
//       </div>

//       {bills.length > 0 && (
//         <>
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-2 text-left">Select</th>
//                   <th className="px-4 py-2 text-left">Bill #</th>
//                   <th className="px-4 py-2 text-left">Date</th>
//                   <th className="px-4 py-2 text-right">Amount</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {bills.map((b: any) => (
//                   <tr key={b.id} className={selectedBills.includes(b.id) ? 'bg-blue-50' : ''}>
//                     <td className="px-4 py-2">
//                       <input type="checkbox" checked={selectedBills.includes(b.id)} onChange={() => toggleBill(b.id)} />
//                     </td>
//                     <td className="px-4 py-2">{b.bill_number}</td>
//                     <td className="px-4 py-2">{new Date(b.bill_date).toLocaleDateString()}</td>
//                     <td className="px-4 py-2 text-right">₦{Number(b.total).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4">
//             <p className="font-medium">{selectedBills.length} bills selected — Total: ₦{total.toLocaleString()}</p>
//             <button onClick={handleSubmit} disabled={loading || selectedBills.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
//               {loading ? 'Processing...' : '💳 Pay Selected Bills'}
//             </button>
//           </div>
//         </>
//       )}
//     </Layout>
//   );
// };

// export default PaymentBatch;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// const PaymentBatch = () => {
//   const navigate = useNavigate();
//   const [suppliers, setSuppliers] = useState<any[]>([]);
//   const [bills, setBills] = useState<any[]>([]);
//   const [supplierId, setSupplierId] = useState('');
//   const [selectedBills, setSelectedBills] = useState<number[]>([]);
//   const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => { fetchSuppliers(); }, []);
//   useEffect(() => { 
//     if (supplierId) fetchBills(parseInt(supplierId)); 
//     else setBills([]);
//   }, [supplierId]);

//   const fetchSuppliers = async () => {
//     const response = await api.get('/suppliers');
//     setSuppliers(response.data);
//   };

//   const fetchBills = async (id: number) => {
//     const response = await api.get('/bills');
//     setBills(response.data.filter((b: any) => b.supplier_id === id && b.status !== 'paid'));
//     setSelectedBills([]);
//   };

//   const toggleBill = (id: number) => {
//     setSelectedBills(prev => 
//       prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
//     );
//   };

//   const total = bills.filter(b => selectedBills.includes(b.id)).reduce((sum, b) => sum + Number(b.total), 0);

//   const handleSubmit = async () => {
//     if (selectedBills.length === 0) {
//       toast.error('Select at least one bill');
//       return;
//     }
//     setLoading(true);
//     try {
//       await api.post('/payments/batch', { 
//         supplier_id: parseInt(supplierId), 
//         bill_ids: selectedBills, 
//         payment_date: paymentDate 
//       });
//       toast.success('Batch payment processed');
//       setSelectedBills([]);
//       fetchBills(parseInt(supplierId));
//     } catch (error) {
//       toast.error('Payment failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Payment Batch</h2>
//           <p className="text-gray-500 mt-1">Pay multiple bills at once</p>
//         </div>
//         <button onClick={() => navigate('/payments')} className="px-4 py-2 border rounded-lg">← Back</button>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-4 items-end">
//         <div>
//           <label className="block text-sm font-medium mb-1">Supplier</label>
//           <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="px-4 py-2 border rounded-lg">
//             <option value="">Select...</option>
//             {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Payment Date</label>
//           <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="px-4 py-2 border rounded-lg" />
//         </div>
//       </div>

//       {bills.length > 0 && (
//         <>
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-2 text-left w-16">Select</th>
//                   <th className="px-4 py-2 text-left">Bill #</th>
//                   <th className="px-4 py-2 text-left">Date</th>
//                   <th className="px-4 py-2 text-right">Amount</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {bills.map((b: any) => (
//                   <tr key={b.id} className={selectedBills.includes(b.id) ? 'bg-blue-50' : ''}>
//                     <td className="px-4 py-2">
//                       <input 
//                         type="checkbox" 
//                         checked={selectedBills.includes(b.id)} 
//                         onChange={() => toggleBill(b.id)}
//                         className="w-4 h-4"
//                       />
//                     </td>
//                     <td className="px-4 py-2 font-medium">{b.bill_number}</td>
//                     <td className="px-4 py-2 text-gray-600">{new Date(b.bill_date).toLocaleDateString()}</td>
//                     <td className="px-4 py-2 text-right">₦{Number(b.total).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4">
//             <p className="font-medium">{selectedBills.length} bills selected — Total: ₦{total.toLocaleString()}</p>
//             <button 
//               onClick={handleSubmit} 
//               disabled={loading || selectedBills.length === 0} 
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
//             >
//               {loading ? 'Processing...' : '💳 Pay Selected Bills'}
//             </button>
//           </div>
//         </>
//       )}

//       {supplierId && bills.length === 0 && (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
//           No unpaid bills for this supplier
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default PaymentBatch;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const PaymentBatch = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [selectedBills, setSelectedBills] = useState<number[]>([]);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchSuppliers(); }, []);
  useEffect(() => { 
    if (supplierId) fetchBills(parseInt(supplierId)); 
    else {
      setBills([]);
      setSelectedBills([]);
    }
  }, [supplierId]);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      toast.error('Failed to load suppliers');
    }
  };

  const fetchBills = async (id: number) => {
    try {
      const response = await api.get('/bills');
      setBills(response.data.filter((b: any) => b.supplier_id === id && b.status !== 'paid'));
      setSelectedBills([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      toast.error('Failed to load bills');
    }
  };

  const toggleBill = (id: number) => {
    setSelectedBills(prev => {
      const newSelection = prev.includes(id) 
        ? prev.filter(b => b !== id) 
        : [...prev, id];
      setSelectAll(newSelection.length === filteredBills.length);
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedBills([]);
      setSelectAll(false);
    } else {
      setSelectedBills(filteredBills.map(b => b.id));
      setSelectAll(true);
    }
  };

  const filteredBills = bills.filter(b => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      b.bill_number?.toLowerCase().includes(search) ||
      b.description?.toLowerCase().includes(search)
    );
  });

  const total = bills.filter(b => selectedBills.includes(b.id)).reduce((sum, b) => sum + Number(b.total), 0);
  const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));

  const handleSubmit = async () => {
    if (selectedBills.length === 0) {
      toast.error('Select at least one bill');
      return;
    }
    
    if (!confirm(`Process payment for ${selectedBills.length} bill(s) totaling ₦${total.toLocaleString()}?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/payments/batch', { 
        supplier_id: parseInt(supplierId), 
        bill_ids: selectedBills, 
        payment_date: paymentDate 
      });
      toast.success(`Successfully paid ${selectedBills.length} bill(s)`);
      setSelectedBills([]);
      setSelectAll(false);
      fetchBills(parseInt(supplierId));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Payment Batch</h2>
            <p className="text-gray-500 mt-1 text-sm">Pay multiple bills at once</p>
          </div>
          <button 
            onClick={() => navigate('/payments')} 
            className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded-xl 
                     text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            <span>←</span>
            <span>Back to Payments</span>
          </button>
        </div>
      </div>

      {/* Supplier & Date Selection */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Supplier</label>
            <select 
              value={supplierId} 
              onChange={(e) => setSupplierId(e.target.value)} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       appearance-none bg-white"
            >
              <option value="">Select supplier...</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.code ? `${s.code} - ` : ''}{s.name}
                </option>
              ))}
            </select>
            {selectedSupplier && (
              <p className="mt-1 text-xs text-blue-600">
                Selected: {selectedSupplier.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Date</label>
            <input 
              type="date" 
              value={paymentDate} 
              onChange={(e) => setPaymentDate(e.target.value)} 
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
      </div>

      {/* Bills List */}
      {supplierId && bills.length > 0 && (
        <>
          {/* Search & Select All */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={toggleSelectAll}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium
                       hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              {selectAll ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left w-16">
                    <input 
                      type="checkbox" 
                      checked={selectAll} 
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bill #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBills.map((b: any) => (
                  <tr 
                    key={b.id} 
                    className={`transition-colors cursor-pointer hover:bg-gray-50 ${
                      selectedBills.includes(b.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleBill(b.id)}
                  >
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedBills.includes(b.id)} 
                        onChange={() => toggleBill(b.id)}
                        className="w-4 h-4 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-900">{b.bill_number}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {new Date(b.bill_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[200px]">
                      {b.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ₦{Number(b.total).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-2 mb-4">
            {filteredBills.map((b: any) => (
              <div
                key={b.id}
                onClick={() => toggleBill(b.id)}
                className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer transition-all border-2 ${
                  selectedBills.includes(b.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={selectedBills.includes(b.id)} 
                      onChange={() => toggleBill(b.id)}
                      className="w-5 h-5 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{b.bill_number}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(b.bill_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    ₦{Number(b.total).toLocaleString()}
                  </span>
                </div>
                {b.description && (
                  <p className="text-xs text-gray-500 ml-8">{b.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Payment Summary & Action */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-800">{selectedBills.length}</span> bill(s) selected
                </p>
                <p className="text-lg font-bold text-gray-900">
                  Total: ₦{total.toLocaleString()}
                </p>
              </div>
              <button 
                onClick={handleSubmit} 
                disabled={loading || selectedBills.length === 0} 
                className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                         active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors text-sm font-medium w-full sm:w-auto"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  '💳 Pay Selected Bills'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty States */}
      {supplierId && bills.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">✅</span>
          <p className="text-gray-500 font-medium">No unpaid bills for this supplier</p>
          <p className="text-gray-400 text-sm mt-1">All bills have been paid or no bills exist</p>
        </div>
      )}

      {!supplierId && (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">👆</span>
          <p className="text-gray-500 font-medium">Select a supplier</p>
          <p className="text-gray-400 text-sm mt-1">Choose a supplier to view their unpaid bills</p>
        </div>
      )}
    </Layout>
  );
};

export default PaymentBatch;