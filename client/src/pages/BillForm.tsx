

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
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/bills', {
        supplier_id: parseInt(supplierId),
        bill_date: billDate,
        due_date: dueDate,
        description,
        amount: parseFloat(amount),
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

  const subtotal = parseFloat(amount) || 0;
  const vat = subtotal * 0.075;
  const total = subtotal + vat;

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create Bill</h2>
            <p className="text-gray-500 mt-1">Record a supplier bill</p>
          </div>
          <button onClick={() => navigate('/bills')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">Select supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date *</label>
              <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select...</option>
                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01" min="0" required />
            {amount && (
              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <p>Subtotal: ₦{subtotal.toLocaleString()}</p>
                <p>VAT (7.5%): ₦{vat.toLocaleString()}</p>
                <p className="font-semibold text-gray-800">Total: ₦{total.toLocaleString()}</p>
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 transition">
            {loading ? 'Creating...' : 'Create Bill'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default BillForm;