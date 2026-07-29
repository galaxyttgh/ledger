import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

const PaymentBatch = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [selectedBills, setSelectedBills] = useState<number[]>([]);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchSuppliers(); }, []);
  useEffect(() => { if (supplierId) fetchBills(parseInt(supplierId)); }, [supplierId]);

  const fetchSuppliers = async () => {
    const response = await api.get('/suppliers');
    setSuppliers(response.data);
  };

  const fetchBills = async (id: number) => {
    const response = await api.get('/bills');
    setBills(response.data.filter((b: any) => b.supplier_id === id && b.status !== 'paid'));
  };

  const toggleBill = (id: number) => {
    setSelectedBills(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const total = bills.filter(b => selectedBills.includes(b.id)).reduce((sum, b) => sum + Number(b.total), 0);

  const handleSubmit = async () => {
    if (selectedBills.length === 0) return;
    setLoading(true);
    try {
      await api.post('/payments/batch', { supplier_id: parseInt(supplierId), bill_ids: selectedBills, payment_date: paymentDate });
      setMessage('✅ Batch payment processed');
      setSelectedBills([]);
    } catch (error) {
      setMessage('❌ Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payment Batch</h2>
          <p className="text-gray-500 mt-1">Pay multiple bills at once</p>
        </div>
        <button onClick={() => navigate('/payments')} className="px-4 py-2 border rounded-lg">← Back</button>
      </div>

      {message && <p className="mb-4 text-sm font-medium">{message}</p>}

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Supplier</label>
          <select value={supplierId} onChange={(e) => { setSupplierId(e.target.value); setSelectedBills([]); }} className="px-4 py-2 border rounded-lg">
            <option value="">Select...</option>
            {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Payment Date</label>
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="px-4 py-2 border rounded-lg" />
        </div>
      </div>

      {bills.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Select</th>
                  <th className="px-4 py-2 text-left">Bill #</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bills.map((b: any) => (
                  <tr key={b.id} className={selectedBills.includes(b.id) ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-2">
                      <input type="checkbox" checked={selectedBills.includes(b.id)} onChange={() => toggleBill(b.id)} />
                    </td>
                    <td className="px-4 py-2">{b.bill_number}</td>
                    <td className="px-4 py-2">{new Date(b.bill_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">₦{Number(b.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4">
            <p className="font-medium">{selectedBills.length} bills selected — Total: ₦{total.toLocaleString()}</p>
            <button onClick={handleSubmit} disabled={loading || selectedBills.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Processing...' : '💳 Pay Selected Bills'}
            </button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default PaymentBatch;