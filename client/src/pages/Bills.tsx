import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Bill {
  id: number;
  bill_number: string;
  supplier_name: string;
  bill_date: string;
  due_date: string;
  description: string;
  total: number;
  status: string;
}

const Bills = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await api.get('/bills');
      setBills(response.data);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
  <div className="mb-6 flex justify-between items-center">
  <div>
    <h2 className="text-2xl font-bold text-gray-800">Bills</h2>
    <p className="text-gray-500 mt-1">Supplier bills and payables</p>
  </div>
  <div className="flex gap-2">
    <button onClick={() => navigate('/bills/new')} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium">
      + Create Bill
    </button>
    <button onClick={() => navigate('/bills/debit-note')} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
      + Debit Note
    </button>
  </div>
</div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : bills.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No bills yet. Click "Create Bill" to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-900">{bill.bill_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{bill.supplier_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(bill.bill_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(bill.due_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium">₦{Number(bill.total).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{bill.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Bills;