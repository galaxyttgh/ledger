

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';


// interface Supplier {
//   id: number;
//   code: string;
//   name: string;
// }

// const BillForm = () => {
//   const navigate = useNavigate();
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [supplierId, setSupplierId] = useState('');
//   const [description, setDescription] = useState('');
//   const [amount, setAmount] = useState('');
//   const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
//   const [dueDate, setDueDate] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [branches, setBranches] = useState<any[]>([]);
//   const [branchId, setBranchId] = useState('');

//   useEffect(() => {
//     fetchSuppliers();
//     fetchBranches();
//   }, []);

//   const fetchBranches = async () => {
//     const response = await api.get('/branches');
//     setBranches(response.data);
//   };

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
//     setError('');
//     setLoading(true);

//     try {
//       await api.post('/bills', {
//         supplier_id: parseInt(supplierId),
//         bill_date: billDate,
//         due_date: dueDate,
//         description,
//         amount: parseFloat(amount),
//         branch_id: branchId ? parseInt(branchId) : null,
//       });
//       navigate('/bills');
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Failed to create bill');
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
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Create Bill</h2>
//             <p className="text-gray-500 mt-1">Record a supplier bill</p>
//           </div>
//           <button onClick={() => navigate('/bills')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//             ← Back
//           </button>
//         </div>

//         {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
//             <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
//               <option value="">Select supplier...</option>
//               {suppliers.map((s) => (
//                 <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
//               ))}
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
//             <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
//           </div>
//           <div className="grid grid-cols-3 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date *</label>
//               <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
//               <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
//               <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
//                 <option value="">Select...</option>
//                 {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
//               </select>
//             </div>
//           </div>
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
//             <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01" min="0" required />
//             {amount && (
//               <div className="mt-2 text-sm text-gray-500 space-y-1">
//                 <p>Subtotal: ₦{subtotal.toLocaleString()}</p>
//                 <p>VAT (7.5%): ₦{vat.toLocaleString()}</p>
//                 <p className="font-semibold text-gray-800">Total: ₦{total.toLocaleString()}</p>
//               </div>
//             )}
//           </div>
//           <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 transition">
//             {loading ? 'Creating...' : 'Create Bill'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default BillForm;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// interface Supplier {
//   id: number;
//   code: string;
//   name: string;
// }

// const BillForm = () => {
//   const navigate = useNavigate();
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [supplierId, setSupplierId] = useState('');
//   const [description, setDescription] = useState('');
//   const [amount, setAmount] = useState('');
//   const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
//   const [dueDate, setDueDate] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [branches, setBranches] = useState<any[]>([]);
//   const [branchId, setBranchId] = useState('');

//   useEffect(() => {
//     fetchSuppliers();
//     fetchBranches();
//   }, []);

//   const fetchBranches = async () => {
//     try {
//       const response = await api.get('/branches');
//       setBranches(response.data);
//     } catch (error) {
//       console.error('Failed to fetch branches:', error);
//     }
//   };

//   const fetchSuppliers = async () => {
//     try {
//       const response = await api.get('/suppliers');
//       setSuppliers(response.data);
//     } catch (error) {
//       console.error('Failed to fetch suppliers:', error);
//     }
//   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //   await api.post('/bills', {
// //   supplier_id: parseInt(supplierId),
// //   bill_date: billDate,
// //   due_date: dueDate,
// //   description,
// //   subtotal: parseFloat(amount),
// //   branch_id: branchId ? parseInt(branchId) : null,
// // });
// //     //     supplier_id: parseInt(supplierId),
// //     //     bill_date: billDate,
// //     //     due_date: dueDate,
// //     //     description,
// //     //     amount: parseFloat(amount),
// //     //     branch_id: branchId ? parseInt(branchId) : null,
// //     //   });
// //       toast.success('Bill created successfully!');
// //       navigate('/bills');
// //     } catch (err: any) {
// //       toast.error(err.response?.data?.error || 'Failed to create bill');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await api.post('/bills', {
//         supplier_id: parseInt(supplierId),
//         bill_date: billDate,
//         due_date: dueDate,
//         description,
//         subtotal: parseFloat(amount),
//         tax_code: 'VAT-STANDARD',
//         branch_id: branchId ? parseInt(branchId) : null,
//       });
//       toast.success('Bill created successfully!');
//       navigate('/bills');
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed to create bill');
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
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Create Bill</h2>
//             <p className="text-gray-500 mt-1">Record a supplier bill</p>
//           </div>
//           <button onClick={() => navigate('/bills')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//             ← Back
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
//             <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
//               <option value="">Select supplier...</option>
//               {suppliers.map((s) => (
//                 <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
//               ))}
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
//             <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
//           </div>
//           <div className="grid grid-cols-3 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date *</label>
//               <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
//               <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
//               <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
//                 <option value="">Select...</option>
//                 {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
//               </select>
//             </div>
//           </div>
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
//             <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01" min="0" required />
//             {amount && (
//               <div className="mt-2 text-sm text-gray-500 space-y-1">
//                 <p>Subtotal: ₦{subtotal.toLocaleString()}</p>
//                 <p>VAT (7.5%): ₦{vat.toLocaleString()}</p>
//                 <p className="font-semibold text-gray-800">Total: ₦{total.toLocaleString()}</p>
//               </div>
//             )}
//           </div>
//           <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 transition">
//             {loading ? 'Creating...' : 'Create Bill'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default BillForm;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface Supplier {
  id: number;
  code: string;
  name: string;
}

const BillForm = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSuppliers();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      toast.error('Failed to load branches');
    }
  };

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
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!billDate) newErrors.billDate = 'Bill date is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    if (billDate && dueDate && new Date(dueDate) < new Date(billDate)) {
      newErrors.dueDate = 'Due date cannot be before bill date';
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
      await api.post('/bills', {
        supplier_id: parseInt(supplierId),
        bill_date: billDate,
        due_date: dueDate,
        description: description.trim(),
        subtotal: parseFloat(amount),
        tax_code: 'VAT-STANDARD',
        branch_id: branchId ? parseInt(branchId) : null,
      });
      toast.success('Bill created successfully!');
      navigate('/bills');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (supplierId || description || amount || dueDate || branchId) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/bills');
      }
    } else {
      navigate('/bills');
    }
  };

  const subtotal = parseFloat(amount) || 0;
  const vat = subtotal * 0.075;
  const total = subtotal + vat;

  const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));

  // Set default due date to 30 days from bill date if not set
  useEffect(() => {
    if (billDate && !dueDate) {
      const date = new Date(billDate);
      date.setDate(date.getDate() + 30);
      setDueDate(date.toISOString().split('T')[0]);
    }
  }, [billDate]);

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Create Bill</h2>
              <p className="text-gray-500 mt-1 text-sm">Record a supplier bill</p>
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

        {/* Form */}
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
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
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
              placeholder="e.g., Office supplies purchase"
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

          {/* Dates & Branch - Stack on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bill Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={billDate} 
                onChange={(e) => {
                  setBillDate(e.target.value);
                  if (errors.billDate) setErrors({ ...errors, billDate: '' });
                }} 
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.billDate 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required 
              />
              {errors.billDate && (
                <p className="mt-1 text-xs text-red-600">{errors.billDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors({ ...errors, dueDate: '' });
                }} 
                min={billDate}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.dueDate 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required 
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Branch
              </label>
              <select 
                value={branchId} 
                onChange={(e) => setBranchId(e.target.value)} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         focus:ring-opacity-50 transition-colors appearance-none bg-white"
              >
                <option value="">Select branch...</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
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
                'Create Bill'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BillForm;