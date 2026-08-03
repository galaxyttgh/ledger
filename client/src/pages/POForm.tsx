// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// const POForm = () => {
//   const navigate = useNavigate();
//   const [suppliers, setSuppliers] = useState<any[]>([]);
//   const [supplierId, setSupplierId] = useState('');
//   const [description, setDescription] = useState('');
//   const [amount, setAmount] = useState('');
//   const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
//   const [deliveryDate, setDeliveryDate] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => { api.get('/suppliers').then(r => setSuppliers(r.data)); }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.post('/purchase-orders', {
//         supplier_id: parseInt(supplierId),
//         po_date: poDate,
//         expected_delivery: deliveryDate,
//         description,
//         subtotal: parseFloat(amount),
//       });
//       toast.success('PO created!');
//       navigate('/purchase-orders');
//     } catch (err: any) {
//       toast.error('Failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const subtotal = parseFloat(amount) || 0;
//   const vat = subtotal * 0.075;
//   const total = subtotal + vat;

//   return (
//     <Layout>
//       <div className="max-w-lg mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div><h2 className="text-2xl font-bold">Create Purchase Order</h2></div>
//           <button onClick={() => navigate('/purchase-orders')} className="px-4 py-2 border rounded-lg">← Back</button>
//         </div>
//         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Supplier *</label>
//             <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required>
//               <option value="">Select...</option>
//               {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Description *</label>
//             <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
//           </div>
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">PO Date *</label>
//               <input type="date" value={poDate} onChange={e => setPoDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Delivery Date</label>
//               <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
//             </div>
//           </div>
//           <div className="mb-6">
//             <label className="block text-sm font-medium mb-1">Amount (₦) *</label>
//             <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
//             {amount && <div className="mt-2 text-sm text-gray-500"><p>Subtotal: ₦{subtotal.toLocaleString()}</p><p>VAT (7.5%): ₦{vat.toLocaleString()}</p><p className="font-semibold">Total: ₦{total.toLocaleString()}</p></div>}
//           </div>
//           <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold">{loading ? 'Creating...' : 'Create PO'}</button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default POForm;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const POForm = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { 
    api.get('/suppliers')
      .then(r => setSuppliers(r.data))
      .catch(() => toast.error('Failed to load suppliers')); 
  }, []);

  // Set default delivery date to 14 days from PO date
  useEffect(() => {
    if (poDate && !deliveryDate) {
      const date = new Date(poDate);
      date.setDate(date.getDate() + 14);
      setDeliveryDate(date.toISOString().split('T')[0]);
    }
  }, [poDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!supplierId) newErrors.supplierId = 'Please select a supplier';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!poDate) newErrors.poDate = 'PO date is required';
    if (deliveryDate && new Date(deliveryDate) < new Date(poDate)) {
      newErrors.deliveryDate = 'Delivery date cannot be before PO date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/purchase-orders', {
        supplier_id: parseInt(supplierId),
        po_date: poDate,
        expected_delivery: deliveryDate || undefined,
        description: description.trim(),
        subtotal: parseFloat(amount),
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('Purchase order created successfully!');
      navigate('/purchase-orders');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (supplierId || description || amount || deliveryDate || reference || notes) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/purchase-orders');
      }
    } else {
      navigate('/purchase-orders');
    }
  };

  const subtotal = parseFloat(amount) || 0;
  const vat = subtotal * 0.075;
  const total = subtotal + vat;
  const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Create Purchase Order</h2>
              <p className="text-gray-500 mt-1 text-sm">Generate a supplier purchase order</p>
            </div>
            <button 
              onClick={handleCancel} 
              className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded-xl 
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              <span>←</span>
              <span>Back to POs</span>
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
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }} 
              placeholder="e.g., Office supplies order"
              className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                ${errors.description 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              required 
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Dates - Stack on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                PO Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={poDate} 
                onChange={(e) => {
                  setPoDate(e.target.value);
                  if (errors.poDate) setErrors({ ...errors, poDate: '' });
                }} 
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.poDate 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required 
              />
              {errors.poDate && (
                <p className="mt-1 text-xs text-red-600">{errors.poDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Expected Delivery
              </label>
              <input 
                type="date" 
                value={deliveryDate} 
                onChange={(e) => {
                  setDeliveryDate(e.target.value);
                  if (errors.deliveryDate) setErrors({ ...errors, deliveryDate: '' });
                }} 
                min={poDate}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.deliveryDate 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
              {errors.deliveryDate && (
                <p className="mt-1 text-xs text-red-600">{errors.deliveryDate}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Defaults to 14 days from PO date
              </p>
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reference Number
              </label>
              <input 
                type="text" 
                value={reference} 
                onChange={(e) => setReference(e.target.value)} 
                placeholder="e.g., PO-001"
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
                placeholder="Additional notes..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6">
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

            {/* Tax Calculation Preview */}
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (7.5%)</span>
                  <span className="font-medium text-blue-600">₦{vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-gray-900">₦{total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* PO Preview */}
          {supplierId && amount && parseFloat(amount) > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Purchase Order Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Supplier</span>
                  <span className="font-medium text-blue-900">
                    {selectedSupplier?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">PO Date</span>
                  <span className="font-medium text-blue-900">
                    {new Date(poDate).toLocaleDateString()}
                  </span>
                </div>
                {deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Delivery Date</span>
                    <span className="font-medium text-blue-900">
                      {new Date(deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-blue-200 font-bold">
                  <span className="text-blue-900">Total Amount</span>
                  <span className="text-blue-900">₦{total.toLocaleString()}</span>
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
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold 
                       hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed 
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
                'Create Purchase Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default POForm;