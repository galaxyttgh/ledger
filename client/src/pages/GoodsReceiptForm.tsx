// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// const GoodsReceiptForm = () => {
//   const navigate = useNavigate();
//   const [pos, setPos] = useState<any[]>([]);
//   const [poId, setPoId] = useState('');
//   const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
//   const [quantity, setQuantity] = useState('');
//   const [notes, setNotes] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => { api.get('/purchase-orders').then(r => setPos(r.data)); }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.post('/purchase-orders/goods-receipt', {
//         po_id: parseInt(poId),
//         receipt_date: receiptDate,
//         quantity_received: parseInt(quantity),
//         notes,
//       });
//       toast.success('Goods receipt recorded!');
//       navigate('/purchase-orders');
//     } catch (err: any) {
//       toast.error('Failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-lg mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div><h2 className="text-2xl font-bold">Record Goods Receipt</h2></div>
//           <button onClick={() => navigate('/purchase-orders')} className="px-4 py-2 border rounded-lg">← Back</button>
//         </div>
//         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Purchase Order *</label>
//             <select value={poId} onChange={e => setPoId(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required>
//               <option value="">Select PO...</option>
//               {pos.map((p: any) => <option key={p.id} value={p.id}>{p.po_number} — {p.supplier_name} (₦{Number(p.total).toLocaleString()})</option>)}
//             </select>
//           </div>
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Receipt Date *</label>
//               <input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Quantity Received *</label>
//               <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required min="1" />
//             </div>
//           </div>
//           <div className="mb-6">
//             <label className="block text-sm font-medium mb-1">Notes</label>
//             <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={2} />
//           </div>
//           <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold">
//             {loading ? 'Recording...' : 'Record Receipt'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default GoodsReceiptForm;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const GoodsReceiptForm = () => {
  const navigate = useNavigate();
  const [pos, setPos] = useState<any[]>([]);
  const [poId, setPoId] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState('');
  const [receivedBy, setReceivedBy] = useState('');

  useEffect(() => { 
    api.get('/purchase-orders')
      .then(r => setPos(r.data))
      .catch(() => toast.error('Failed to load purchase orders')); 
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!poId) newErrors.poId = 'Please select a purchase order';
    if (!receiptDate) newErrors.receiptDate = 'Receipt date is required';
    if (!quantity || parseInt(quantity) <= 0) newErrors.quantity = 'Valid quantity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    if (!confirm(`Confirm goods receipt of ${quantity} unit(s)?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/purchase-orders/goods-receipt', {
        po_id: parseInt(poId),
        receipt_date: receiptDate,
        quantity_received: parseInt(quantity),
        notes: notes.trim() || undefined,
        reference: reference.trim() || undefined,
        received_by: receivedBy.trim() || undefined,
      });
      toast.success('Goods receipt recorded successfully!');
      navigate('/purchase-orders');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record goods receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (poId || quantity || notes || reference || receivedBy) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/purchase-orders');
      }
    } else {
      navigate('/purchase-orders');
    }
  };

  const selectedPO = pos.find(p => p.id === parseInt(poId));

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Record Goods Receipt</h2>
              <p className="text-gray-500 mt-1 text-sm">Record receipt of goods against a purchase order</p>
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
          {/* Purchase Order Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Purchase Order <span className="text-red-500">*</span>
            </label>
            <select 
              value={poId} 
              onChange={(e) => {
                setPoId(e.target.value);
                if (errors.poId) setErrors({ ...errors, poId: '' });
              }} 
              className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors appearance-none
                ${errors.poId 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white`}
              required
            >
              <option value="">Select purchase order...</option>
              {pos.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.po_number} — {p.supplier_name} (₦{Number(p.total).toLocaleString()})
                </option>
              ))}
            </select>
            {errors.poId && (
              <p className="mt-1 text-xs text-red-600">{errors.poId}</p>
            )}
            {selectedPO && (
              <div className="mt-2 p-3 bg-blue-50 rounded-xl">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">PO Details</h4>
                <div className="space-y-1 text-xs text-blue-800">
                  <p>Supplier: <span className="font-medium">{selectedPO.supplier_name}</span></p>
                  <p>PO Date: <span className="font-medium">{new Date(selectedPO.po_date).toLocaleDateString()}</span></p>
                  <p>Amount: <span className="font-bold">₦{Number(selectedPO.total).toLocaleString()}</span></p>
                  {selectedPO.description && (
                    <p>Description: <span className="font-medium">{selectedPO.description}</span></p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Receipt Date & Quantity - Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Receipt Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={receiptDate} 
                onChange={(e) => {
                  setReceiptDate(e.target.value);
                  if (errors.receiptDate) setErrors({ ...errors, receiptDate: '' });
                }} 
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.receiptDate 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required 
              />
              {errors.receiptDate && (
                <p className="mt-1 text-xs text-red-600">{errors.receiptDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantity Received <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => {
                  setQuantity(e.target.value);
                  if (errors.quantity) setErrors({ ...errors, quantity: '' });
                }} 
                placeholder="Enter quantity"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.quantity 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required 
                min="1"
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Reference & Received By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reference Number
              </label>
              <input 
                type="text" 
                value={reference} 
                onChange={(e) => setReference(e.target.value)} 
                placeholder="e.g., GRN-001"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Received By
              </label>
              <input 
                type="text" 
                value={receivedBy} 
                onChange={(e) => setReceivedBy(e.target.value)} 
                placeholder="Name of receiver"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Any additional notes about the receipt..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       resize-none"
              rows={3} 
            />
          </div>

          {/* Receipt Preview */}
          {poId && quantity && parseInt(quantity) > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <h4 className="text-sm font-semibold text-green-900 mb-2">Receipt Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Purchase Order</span>
                  <span className="font-medium text-green-900">
                    {selectedPO?.po_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Supplier</span>
                  <span className="font-medium text-green-900">
                    {selectedPO?.supplier_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Quantity</span>
                  <span className="font-bold text-green-900">{quantity} unit(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Receipt Date</span>
                  <span className="font-medium text-green-900">
                    {new Date(receiptDate).toLocaleDateString()}
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
                'Record Goods Receipt'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default GoodsReceiptForm;