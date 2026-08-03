// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// const DebitNoteForm = () => {
//   const navigate = useNavigate();
//   const [suppliers, setSuppliers] = useState<any[]>([]);
//   const [supplierId, setSupplierId] = useState('');
//   const [amount, setAmount] = useState('');
//   const [reason, setReason] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => { fetchSuppliers(); }, []);

//   const fetchSuppliers = async () => {
//     try {
//       const response = await api.get('/suppliers');
//       setSuppliers(response.data);
//     } catch (error) {
//       console.error('Failed to fetch suppliers:', error);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.post('/bills/debit-note', {
//         supplier_id: parseInt(supplierId),
//         amount: parseFloat(amount),
//         reason,
//       });
//       navigate('/bills');
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-lg mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Create Debit Note</h2>
//             <p className="text-gray-500 mt-1">Supplier return or credit received</p>
//           </div>
//           <button onClick={() => navigate('/bills')} className="px-4 py-2 border rounded-lg">← Back</button>
//         </div>
//         {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
//         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Supplier *</label>
//             <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required>
//               <option value="">Select...</option>
//               {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Amount (₦) *</label>
//             <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Reason</label>
//             <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={2} />
//           </div>
//           <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700">
//             {loading ? 'Creating...' : 'Create Debit Note'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default DebitNoteForm;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const DebitNoteForm = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [debitNoteDate, setDebitNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      toast.error('Failed to load suppliers');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!supplierId) newErrors.supplierId = 'Please select a supplier';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (parseFloat(amount) > 1000000000) newErrors.amount = 'Amount seems too high';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/bills/debit-note', {
        supplier_id: parseInt(supplierId),
        amount: parseFloat(amount),
        reason: reason.trim(),
        debit_note_date: debitNoteDate,
        reference: reference.trim() || undefined,
      });
      toast.success('Debit note created successfully!');
      navigate('/bills');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create debit note';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (supplierId || amount || reason) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/bills');
      }
    } else {
      navigate('/bills');
    }
  };

  const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));
  const amountNum = parseFloat(amount) || 0;

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Create Debit Note</h2>
              <p className="text-gray-500 mt-1 text-sm">Supplier return or credit received</p>
            </div>
            <button 
              onClick={handleCancel} 
              className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded-xl 
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              <span>←</span>
              <span>Back to Bills</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          {/* Supplier Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select 
              value={supplierId} 
              onChange={(e) => {
                setSupplierId(e.target.value);
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
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.code ? `${s.code} - ` : ''}{s.name}
                </option>
              ))}
            </select>
            {errors.supplierId && (
              <p className="mt-1 text-xs text-red-600">{errors.supplierId}</p>
            )}
            {selectedSupplier && (
              <p className="mt-1 text-xs text-blue-600">
                Selected: {selectedSupplier.name}
                {selectedSupplier.code && ` (${selectedSupplier.code})`}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Debit Amount (₦) <span className="text-red-500">*</span>
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
          </div>

          {/* Date & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Debit Note Date
              </label>
              <input 
                type="date" 
                value={debitNoteDate} 
                onChange={(e) => setDebitNoteDate(e.target.value)} 
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         focus:ring-opacity-50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reference/Bill #
              </label>
              <input 
                type="text" 
                value={reference} 
                onChange={(e) => setReference(e.target.value)} 
                placeholder="e.g., BILL-001"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         focus:ring-opacity-50 transition-colors"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason for Debit
            </label>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="e.g., Returned goods, Price adjustment, Supplier credit..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       focus:ring-opacity-50 transition-colors resize-none"
              rows={3} 
            />
            <p className="mt-1 text-xs text-gray-400">
              {reason.length}/500 characters
            </p>
          </div>

          {/* Debit Note Preview */}
          {supplierId && amountNum > 0 && (
            <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <h4 className="text-sm font-semibold text-orange-900 mb-2">Debit Note Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-orange-700">Supplier</span>
                  <span className="font-medium text-orange-900">
                    {selectedSupplier?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Debit Amount</span>
                  <span className="font-bold text-orange-900">
                    ₦{amountNum.toLocaleString()}
                  </span>
                </div>
                {reason && (
                  <div className="flex justify-between">
                    <span className="text-orange-700">Reason</span>
                    <span className="font-medium text-orange-900 text-right max-w-[200px] truncate">
                      {reason}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-orange-200">
                  <span className="text-orange-700 font-medium">Effect</span>
                  <span className="text-green-600 font-medium">
                    Reduces amount owed to supplier
                  </span>
                </div>
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
              className="flex-1 bg-orange-600 text-white py-2.5 rounded-xl font-semibold 
                       hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors text-sm order-1 sm:order-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Debit Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default DebitNoteForm;