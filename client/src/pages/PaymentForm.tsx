// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface Supplier {
//   id: number;
//   code: string;
//   name: string;
//   current_balance: number;
// }

// interface Bill {
//   id: number;
//   bill_number: string;
//   total: number;
//   supplier_id: number;
// }

// const PaymentForm = () => {
//   const navigate = useNavigate();
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [bills, setBills] = useState<Bill[]>([]);
//   const [supplierId, setSupplierId] = useState('');
//   const [billId, setBillId] = useState('');
//   const [amount, setAmount] = useState('');
//   const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
//   const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchSuppliers();
//   }, []);

//   useEffect(() => {
//     if (supplierId) {
//       fetchBills(parseInt(supplierId));
//     }
//   }, [supplierId]);

//   const fetchSuppliers = async () => {
//     try {
//       const response = await api.get('/suppliers');
//       setSuppliers(response.data);
//     } catch (error) {
//       console.error('Failed to fetch suppliers:', error);
//     }
//   };

// //   const fetchBills = async (suppId: number) => {
// //     try {
// //       const response = await api.get('/bills');
// //       setBills(response.data.filter((b: Bill) => b.supplier_id === suppId));
// //     } catch (error) {
// //       console.error('Failed to fetch bills:', error);
// //     }
// //   };


// const handleSupplierChange = (id: string) => {
//   setSupplierId(id);
//   setBillId('');
//   setAmount('');
// };

// const handleBillChange = (id: string) => {
//   setBillId(id);
//   const bill = bills.find((b: any) => b.id === parseInt(id));
//   if (bill) {
//     setAmount(bill.total.toString());
//   }
// };
// const fetchBills = async (suppId: number) => {
//   try {
//     const response = await api.get('/bills');
//     setBills(response.data.filter((b: any) => 
//       b.supplier_id === suppId && b.status !== 'paid'
//     ));
//   } catch (error) {
//     console.error('Failed to fetch bills:', error);
//   }
// };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await api.post('/payments', {
//         supplier_id: parseInt(supplierId),
//         bill_id: billId ? parseInt(billId) : null,
//         amount: parseFloat(amount),
//         payment_date: paymentDate,
//         payment_method: paymentMethod,
//       });
//       navigate('/payments');
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Failed to record payment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-lg mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Record Payment</h2>
//             <p className="text-gray-500 mt-1">Record a supplier payment</p>
//           </div>
//           <button onClick={() => navigate('/payments')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//             ← Back
//           </button>
//         </div>

//         {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
//             <select value={supplierId} onChange={(e) => handleSupplierChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
//               <option value="">Select supplier...</option>
//               {suppliers.map((s) => (
//                 <option key={s.id} value={s.id}>{s.name} {s.current_balance > 0 ? `(owed ₦${s.current_balance.toLocaleString()})` : ''}</option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Bill (optional)</label>
//             <select value={billId} onChange={(e) => handleBillChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//               <option value="">No specific bill</option>
//               {bills.map((b) => (
//                 <option key={b.id} value={b.id}>{b.bill_number} — ₦{Number(b.total).toLocaleString()}</option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
//             <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" required />
//           </div>

//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
//               <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
//               <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//                 <option value="bank_transfer">Bank Transfer</option>
//                 <option value="cash">Cash</option>
//                 <option value="cheque">Cheque</option>
//               </select>
//             </div>
//           </div>

//           <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition">
//             {loading ? 'Recording...' : 'Record Payment'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default PaymentForm;


// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// interface Supplier {
//   id: number;
//   code: string;
//   name: string;
//   current_balance: number;
// }

// interface Bill {
//   id: number;
//   bill_number: string;
//   total: number;
//   supplier_id: number;
// }

// const PaymentForm = () => {
//   const navigate = useNavigate();
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [bills, setBills] = useState<Bill[]>([]);
//   const [supplierId, setSupplierId] = useState('');
//   const [billId, setBillId] = useState('');
//   const [amount, setAmount] = useState('');
//   const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
//   const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchSuppliers();
//   }, []);

//   useEffect(() => {
//     if (supplierId) {
//       fetchBills(parseInt(supplierId));
//     }
//   }, [supplierId]);

//   const fetchSuppliers = async () => {
//     try {
//       const response = await api.get('/suppliers');
//       setSuppliers(response.data);
//     } catch (error) {
//       console.error('Failed to fetch suppliers:', error);
//     }
//   };

//   const fetchBills = async (suppId: number) => {
//     try {
//       const response = await api.get('/bills');
//       setBills(response.data.filter((b: any) => 
//         b.supplier_id === suppId && b.status !== 'paid'
//       ));
//     } catch (error) {
//       console.error('Failed to fetch bills:', error);
//     }
//   };

//   const handleSupplierChange = (id: string) => {
//     setSupplierId(id);
//     setBillId('');
//     setAmount('');
//   };

//   const handleBillChange = (id: string) => {
//     setBillId(id);
//     const bill = bills.find((b: any) => b.id === parseInt(id));
//     if (bill) {
//       setAmount(bill.total.toString());
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await api.post('/payments', {
//         supplier_id: parseInt(supplierId),
//         bill_id: billId ? parseInt(billId) : null,
//         amount: parseFloat(amount),
//         payment_date: paymentDate,
//         payment_method: paymentMethod,
//       });
//       toast.success('Payment recorded successfully!');
//       navigate('/payments');
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed to record payment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-lg mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Record Payment</h2>
//             <p className="text-gray-500 mt-1">Record a supplier payment</p>
//           </div>
//           <button onClick={() => navigate('/payments')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//             ← Back
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
//             <select value={supplierId} onChange={(e) => handleSupplierChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
//               <option value="">Select supplier...</option>
//               {suppliers.map((s) => (
//                 <option key={s.id} value={s.id}>{s.name} {s.current_balance > 0 ? `(owed ₦${s.current_balance.toLocaleString()})` : ''}</option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Bill (optional)</label>
//             <select value={billId} onChange={(e) => handleBillChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//               <option value="">No specific bill</option>
//               {bills.map((b) => (
//                 <option key={b.id} value={b.id}>{b.bill_number} — ₦{Number(b.total).toLocaleString()}</option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
//             <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" required />
//           </div>

//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
//               <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
//               <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//                 <option value="bank_transfer">Bank Transfer</option>
//                 <option value="cash">Cash</option>
//                 <option value="cheque">Cheque</option>
//               </select>
//             </div>
//           </div>

//           <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition">
//             {loading ? 'Recording...' : 'Record Payment'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default PaymentForm;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface Supplier {
  id: number;
  code: string;
  name: string;
  current_balance: number;
}

interface Bill {
  id: number;
  bill_number: string;
  total: number;
  supplier_id: number;
}

const PaymentForm = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (supplierId) {
      fetchBills(parseInt(supplierId));
    } else {
      setBills([]);
      setBillId('');
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

  const fetchBills = async (suppId: number) => {
    try {
      const response = await api.get('/bills');
      setBills(response.data.filter((b: any) => 
        b.supplier_id === suppId && b.status !== 'paid'
      ));
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      toast.error('Failed to load bills');
    }
  };

  const handleSupplierChange = (id: string) => {
    setSupplierId(id);
    setBillId('');
    setAmount('');
  };

  const handleBillChange = (id: string) => {
    setBillId(id);
    if (id) {
      const bill = bills.find((b: any) => b.id === parseInt(id));
      if (bill) {
        setAmount(bill.total.toString());
      }
    } else {
      setAmount('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!supplierId) newErrors.supplierId = 'Please select a supplier';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!paymentDate) newErrors.paymentDate = 'Payment date is required';
    if (parseFloat(amount) > 1000000000) newErrors.amount = 'Amount seems too high';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    if (!confirm(`Confirm payment of ₦${parseFloat(amount).toLocaleString()}?`)) {
      return;
    }
    
    setLoading(true);

    try {
      await api.post('/payments', {
        supplier_id: parseInt(supplierId),
        bill_id: billId ? parseInt(billId) : null,
        amount: parseFloat(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('Payment recorded successfully!');
      navigate('/payments');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (supplierId || amount || billId) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/payments');
      }
    } else {
      navigate('/payments');
    }
  };

  const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));
  const selectedBill = bills.find(b => b.id === parseInt(billId));
  const amountNum = parseFloat(amount) || 0;

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Record Payment</h2>
              <p className="text-gray-500 mt-1 text-sm">Record a supplier payment</p>
            </div>
            <button 
              onClick={handleCancel} 
              className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded-xl 
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              <span>←</span>
              <span>Back to Payments</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          {/* Supplier Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select 
              value={supplierId} 
              onChange={(e) => {
                handleSupplierChange(e.target.value);
                if (errors.supplierId) setErrors({ ...errors, supplierId: '' });
              }} 
              className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors appearance-none
                ${errors.supplierId 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white`}
              required
            >
              <option value="">Select supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code ? `${s.code} - ` : ''}{s.name}
                  {s.current_balance > 0 ? ` (Owed: ₦${s.current_balance.toLocaleString()})` : ''}
                </option>
              ))}
            </select>
            {errors.supplierId && (
              <p className="mt-1 text-xs text-red-600">{errors.supplierId}</p>
            )}
            {selectedSupplier && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  Current Balance: <span className="font-bold">₦{selectedSupplier.current_balance.toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>

          {/* Bill Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bill (optional)
            </label>
            <select 
              value={billId} 
              onChange={(e) => handleBillChange(e.target.value)} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       appearance-none bg-white"
              disabled={!supplierId || bills.length === 0}
            >
              <option value="">No specific bill (on-account payment)</option>
              {bills.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bill_number} — ₦{Number(b.total).toLocaleString()}
                </option>
              ))}
            </select>
            {supplierId && bills.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">No unpaid bills for this supplier</p>
            )}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount (₦) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">₦</span>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: '' });
                }} 
                placeholder="0.00"
                step="0.01" 
                min="0"
                className={`w-full pl-7 pr-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.amount 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required 
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
            )}
            {amountNum > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Amount in words: {amountNum.toLocaleString()} Naira
              </p>
            )}
            {selectedBill && amountNum > Number(selectedBill.total) && (
              <p className="mt-1 text-xs text-orange-600">
                ⚠️ Amount exceeds bill total of ₦{Number(selectedBill.total).toLocaleString()}
              </p>
            )}
          </div>

          {/* Payment Date & Method - Stack on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={paymentDate} 
                onChange={(e) => {
                  setPaymentDate(e.target.value);
                  if (errors.paymentDate) setErrors({ ...errors, paymentDate: '' });
                }} 
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.paymentDate 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required 
              />
              {errors.paymentDate && (
                <p className="mt-1 text-xs text-red-600">{errors.paymentDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payment Method
              </label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         appearance-none bg-white"
              >
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="cash">💵 Cash</option>
                <option value="cheque">📝 Cheque</option>
                <option value="online">🌐 Online Payment</option>
              </select>
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reference Number
              </label>
              <input 
                type="text" 
                value={reference} 
                onChange={(e) => setReference(e.target.value)} 
                placeholder="e.g., Transaction ID"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <input 
                type="text" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Payment notes..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Payment Preview */}
          {supplierId && amountNum > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <h4 className="text-sm font-semibold text-green-900 mb-2">Payment Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Supplier</span>
                  <span className="font-medium text-green-900">
                    {selectedSupplier?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Amount</span>
                  <span className="font-bold text-green-900">
                    ₦{amountNum.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Method</span>
                  <span className="font-medium text-green-900 capitalize">
                    {paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                {selectedBill && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Bill</span>
                    <span className="font-medium text-green-900">
                      {selectedBill.bill_number}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                       hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium
                       order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold 
                       hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors text-sm order-1 sm:order-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Recording...
                </span>
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PaymentForm;