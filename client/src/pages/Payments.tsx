import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Payment {
  id: number;
  payment_number: string;
  supplier_name: string;
  bill_number: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
}

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
          <p className="text-gray-500 mt-1">Supplier payment records</p>
        </div>
        <button onClick={() => navigate('/payments/new')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          + Record Payment
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No payments yet. Click "Record Payment" to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-900">{p.payment_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{p.supplier_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.bill_number || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-red-600">₦{Number(p.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.payment_method.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Payments;