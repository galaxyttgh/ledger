import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const PaymentVouchers = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchVouchers();
    fetchSuppliers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/vouchers');
      setVouchers(res.data);
    } catch (error) { toast.error('Failed to load vouchers'); }
    finally { setLoading(false); }
  };

  const fetchSuppliers = async () => {
    const res = await api.get('/suppliers');
    setSuppliers(res.data);
  };

  const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  setCreating(true);
  try {
   await api.post('/vouchers', {
  supplier_id: parseInt(supplierId),
  amount: parseFloat(amount),
  purpose,
});
    toast.success('Voucher created');
    setShowForm(false);
    setAmount('');
    setPurpose('');
    fetchVouchers();
  } catch (err: any) {
    toast.error('Failed');
  } finally {
    setCreating(false);
  }
};

  const handleView = async (id: number) => {
    try {
      const res = await api.get(`/vouchers/${id}`);
      setSelectedVoucher(res.data);
    } catch (error) { toast.error('Failed to load voucher'); }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payment Vouchers</h2>
          <p className="text-gray-500 mt-1 text-sm">Generate printable payment vouchers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          + Create Voucher
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="px-3 py-2 border rounded-lg" required>
              <option value="">Select Supplier</option>
              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₦)" className="px-3 py-2 border rounded-lg" required />
            <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Purpose" className="px-3 py-2 border rounded-lg" required />
           <button type="submit" disabled={creating}  className="col-span-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"> {creating ? 'Saving...' : 'Save Voucher'}</button>
          </form>
        </div>
      )}

      {/* Voucher List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No vouchers yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Voucher #</th>
                <th className="px-6 py-3 text-left">Supplier</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vouchers.map((v: any) => (
                <tr key={v.id}>
                  <td className="px-6 py-3 font-medium text-blue-900">{v.voucher_number}</td>
                  <td className="px-6 py-3">{v.supplier_name}</td>
                  <td className="px-6 py-3 text-right">₦{Number(v.amount).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${v.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button onClick={() => handleView(v.id)} className="text-blue-600 hover:text-blue-800 text-sm">👁️ View/Print</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedVoucher(null)} />
<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 print-area">
           <div className="text-center mb-4 border-b pb-3">
<img src="/logo.png" alt="Galaxy ITT" className="h-10 mx-auto mb-2" />
  <p className="text-sm text-gray-500">Payment Voucher</p>
</div>
            <div className="border-t border-b py-4 space-y-2 text-sm">
              <p><span className="text-gray-500">Voucher:</span> <span className="font-medium">{selectedVoucher.voucher_number}</span></p>
              <p><span className="text-gray-500">Supplier:</span> <span className="font-medium">{selectedVoucher.supplier_name}</span></p>
              <p><span className="text-gray-500">Amount:</span> <span className="font-bold">₦{Number(selectedVoucher.amount).toLocaleString()}</span></p>
              <p><span className="text-gray-500">Purpose:</span> <span className="font-medium">{selectedVoucher.purpose}</span></p>
              <p><span className="text-gray-500">Requested By:</span> <span className="font-medium">{selectedVoucher.requested_by_name}</span></p>
              <p><span className="text-gray-500">Approved By:</span> <span className="font-medium">{selectedVoucher.approved_by_name || 'Pending'}</span></p>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => window.print()} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">🖨️ Print</button>
              <button onClick={() => setSelectedVoucher(null)} className="px-4 py-2 border rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PaymentVouchers;