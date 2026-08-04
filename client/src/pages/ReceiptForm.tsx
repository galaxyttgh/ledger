
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface Customer {
//   id: number;
//   code: string;
//   name: string;
//   current_balance: number;
// }

// interface Invoice {
//   id: number;
//   invoice_number: string;
//   total: number;
//   customer_id: number;
// }

// const ReceiptForm = () => {
//   const navigate = useNavigate();
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [customerId, setCustomerId] = useState('');
//   const [invoiceId, setInvoiceId] = useState('');
//   const [amount, setAmount] = useState('');
//   const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
//   const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   useEffect(() => {
//     if (customerId) {
//       fetchInvoices(parseInt(customerId));
//     }
//   }, [customerId]);

//   const fetchCustomers = async () => {
//     try {
//       const response = await api.get('/customers');
//       setCustomers(response.data);
//     } catch (error) {
//       console.error('Failed to fetch customers:', error);
//     }
//   };

//   const fetchInvoices = async (custId: number) => {
//     try {
//       const response = await api.get('/invoices');
//       setInvoices(response.data.filter((inv: any) => 
//         inv.customer_id === custId && inv.status !== 'paid'
//       ));
//     } catch (error) {
//       console.error('Failed to fetch invoices:', error);
//     }
//   };

//   const handleCustomerChange = (id: string) => {
//     setCustomerId(id);
//     setInvoiceId('');
//     setAmount('');
//   };

//   const handleInvoiceChange = (id: string) => {
//     setInvoiceId(id);
//     const invoice = invoices.find((i: any) => i.id === parseInt(id));
//     if (invoice) {
//       setAmount(invoice.total.toString());
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await api.post('/receipts', {
//         customer_id: parseInt(customerId),
//         invoice_id: invoiceId ? parseInt(invoiceId) : null,
//         amount: parseFloat(amount),
//         payment_date: paymentDate,
//         payment_method: paymentMethod,
//       });
//       navigate('/receipts');
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Failed to record receipt');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-lg mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Record Receipt</h2>
//             <p className="text-gray-500 mt-1">Record a customer payment</p>
//           </div>
//           <button onClick={() => navigate('/receipts')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//             ← Back
//           </button>
//         </div>

//         {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
//             <select value={customerId} onChange={(e) => handleCustomerChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
//               <option value="">Select customer...</option>
//               {customers.map((c) => (
//                 <option key={c.id} value={c.id}>{c.name} {c.current_balance > 0 ? `(owes ₦${c.current_balance.toLocaleString()})` : ''}</option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Invoice (optional)</label>
//             <select value={invoiceId} onChange={(e) => handleInvoiceChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//               <option value="">No specific invoice</option>
//               {invoices.map((inv) => (
//                 <option key={inv.id} value={inv.id}>{inv.invoice_number} — ₦{Number(inv.total).toLocaleString()}</option>
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

//           <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition">
//             {loading ? 'Recording...' : 'Record Receipt'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default ReceiptForm;


// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// interface Customer {
//   id: number;
//   code: string;
//   name: string;
//   current_balance: number;
// }

// interface Invoice {
//   id: number;
//   invoice_number: string;
//   total: number;
//   customer_id: number;
// }

// const ReceiptForm = () => {
//   const navigate = useNavigate();
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [customerId, setCustomerId] = useState('');
//   const [invoiceId, setInvoiceId] = useState('');
//   const [amount, setAmount] = useState('');
//   const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
//   const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   useEffect(() => {
//     if (customerId) {
//       fetchInvoices(parseInt(customerId));
//     }
//   }, [customerId]);

//   const fetchCustomers = async () => {
//     try {
//       const response = await api.get('/customers');
//       setCustomers(response.data);
//     } catch (error) {
//       console.error('Failed to fetch customers:', error);
//     }
//   };

//   const fetchInvoices = async (custId: number) => {
//     try {
//       const response = await api.get('/invoices');
//       setInvoices(response.data.filter((inv: any) => 
//         inv.customer_id === custId && inv.status !== 'paid'
//       ));
//     } catch (error) {
//       console.error('Failed to fetch invoices:', error);
//     }
//   };

//   const handleCustomerChange = (id: string) => {
//     setCustomerId(id);
//     setInvoiceId('');
//     setAmount('');
//   };

//   const handleInvoiceChange = (id: string) => {
//     setInvoiceId(id);
//     const invoice = invoices.find((i: any) => i.id === parseInt(id));
//     if (invoice) {
//       setAmount(invoice.total.toString());
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await api.post('/receipts', {
//         customer_id: parseInt(customerId),
//         invoice_id: invoiceId ? parseInt(invoiceId) : null,
//         amount: parseFloat(amount),
//         payment_date: paymentDate,
//         payment_method: paymentMethod,
//       });
//       toast.success('Receipt recorded successfully!');
//       navigate('/receipts');
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed to record receipt');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-lg mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Record Receipt</h2>
//             <p className="text-gray-500 mt-1">Record a customer payment</p>
//           </div>
//           <button onClick={() => navigate('/receipts')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//             ← Back
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
//             <select value={customerId} onChange={(e) => handleCustomerChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
//               <option value="">Select customer...</option>
//               {customers.map((c) => (
//                 <option key={c.id} value={c.id}>{c.name} {c.current_balance > 0 ? `(owes ₦${c.current_balance.toLocaleString()})` : ''}</option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Invoice (optional)</label>
//             <select value={invoiceId} onChange={(e) => handleInvoiceChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//               <option value="">No specific invoice</option>
//               {invoices.map((inv) => (
//                 <option key={inv.id} value={inv.id}>{inv.invoice_number} — ₦{Number(inv.total).toLocaleString()}</option>
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

//           <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition">
//             {loading ? 'Recording...' : 'Record Receipt'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default ReceiptForm;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface Customer {
  id: number;
  code: string;
  name: string;
  current_balance: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  total: number;
  customer_id: number;
}

const ReceiptForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchInvoices(parseInt(customerId));
    } else {
      setInvoices([]);
      setInvoiceId('');
    }
  }, [customerId]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    }
  };

  const fetchInvoices = async (custId: number) => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data.filter((inv: any) => 
        inv.customer_id === custId && inv.status !== 'paid'
      ));
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load invoices');
    }
  };

  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    setInvoiceId('');
    setAmount('');
  };

  // const handleInvoiceChange = (id: string) => {
  //   setInvoiceId(id);
  //   if (id) {
  //     const invoice = invoices.find((i: any) => i.id === parseInt(id));
  //     if (invoice) {
  //       setAmount(invoice.total.toString());
  //     }
  //   } else {
  //     setAmount('');
  //   }
  // };

  const handleInvoiceChange = async (id: string) => {
  setInvoiceId(id);
  if (!id) return;
  try {
    const response = await api.get(`/invoices/${id}`);
    const invoice = response.data;
    // Fetch existing receipts for this invoice
    const receiptsRes = await api.get('/receipts');
    const paid = receiptsRes.data
      .filter((r: any) => r.invoice_number === invoice.invoice_number)
      .reduce((sum: number, r: any) => sum + Number(r.amount), 0);
    const remaining = Number(invoice.total) - paid;
    setAmount(remaining > 0 ? remaining.toString() : '0');
  } catch (error) {
    console.error('Failed to calculate remaining');
  }
};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customerId) newErrors.customerId = 'Please select a customer';
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
    
    if (!confirm(`Confirm receipt of ₦${parseFloat(amount).toLocaleString()}?`)) {
      return;
    }
    
    setLoading(true);

    try {
      await api.post('/receipts', {
        customer_id: parseInt(customerId),
        invoice_id: invoiceId ? parseInt(invoiceId) : null,
        amount: parseFloat(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('Receipt recorded successfully!');
      navigate('/receipts');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (customerId || amount || invoiceId) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/receipts');
      }
    } else {
      navigate('/receipts');
    }
  };

  const selectedCustomer = customers.find(c => c.id === parseInt(customerId));
  const selectedInvoice = invoices.find(inv => inv.id === parseInt(invoiceId));
  const amountNum = parseFloat(amount) || 0;

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Record Receipt</h2>
              <p className="text-gray-500 mt-1 text-sm">Record a customer payment</p>
            </div>
            <button 
              onClick={handleCancel} 
              className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded-xl 
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              <span>←</span>
              <span>Back to Receipts</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          {/* Customer Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Customer <span className="text-red-500">*</span>
            </label>
            <select 
              value={customerId} 
              onChange={(e) => {
                handleCustomerChange(e.target.value);
                if (errors.customerId) setErrors({ ...errors, customerId: '' });
              }} 
              className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors appearance-none
                ${errors.customerId 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white`}
              required
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `${c.code} - ` : ''}{c.name}
                  {c.current_balance > 0 ? ` (Owes: ₦${c.current_balance.toLocaleString()})` : ''}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-xs text-red-600">{errors.customerId}</p>
            )}
            {selectedCustomer && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  Current Balance: <span className="font-bold">₦{selectedCustomer.current_balance.toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>

          {/* Invoice Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Invoice (optional)
            </label>
            <select 
              value={invoiceId} 
              onChange={(e) => handleInvoiceChange(e.target.value)} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       appearance-none bg-white"
              disabled={!customerId || invoices.length === 0}
            >
              <option value="">No specific invoice (on-account receipt)</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} — ₦{Number(inv.total).toLocaleString()}
                </option>
              ))}
            </select>
            {customerId && invoices.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">No unpaid invoices for this customer</p>
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
            {selectedInvoice && amountNum > Number(selectedInvoice.total) && (
              <p className="mt-1 text-xs text-orange-600">
                ⚠️ Amount exceeds invoice total of ₦{Number(selectedInvoice.total).toLocaleString()}
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

          {/* Receipt Preview */}
          {customerId && amountNum > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <h4 className="text-sm font-semibold text-green-900 mb-2">Receipt Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Customer</span>
                  <span className="font-medium text-green-900">
                    {selectedCustomer?.name || 'N/A'}
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
                {selectedInvoice && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Invoice</span>
                    <span className="font-medium text-green-900">
                      {selectedInvoice.invoice_number}
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
              className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold 
                       hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed 
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
                'Record Receipt'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ReceiptForm;