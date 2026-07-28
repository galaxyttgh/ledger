import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Receipt {
  id: number;
  receipt_number: string;
  customer_name: string;
  invoice_number: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
}

const Receipts = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await api.get('/receipts');
      setReceipts(response.data);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Receipts</h2>
          <p className="text-gray-500 mt-1">Customer payment records</p>
        </div>
        <button onClick={() => navigate('/receipts/new')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          + Record Receipt
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : receipts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No receipts yet. Click "Record Receipt" to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-900">{r.receipt_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{r.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.invoice_number || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-600">₦{Number(r.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(r.payment_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{r.payment_method.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Receipts;