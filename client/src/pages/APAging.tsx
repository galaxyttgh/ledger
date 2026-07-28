import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface AgingItem {
  id: number;
  code: string;
  name: string;
  bill_id: number;
  bill_number: string;
  total: number;
  bill_date: string;
  due_date: string;
  status: string;
  paid_amount: number;
  balance: number;
  days_overdue: number;
}

const APAging = () => {
  const [data, setData] = useState<AgingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/ap-aging');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch AP aging:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAgingBucket = (days: number) => {
    if (days <= 0) return { label: 'Current', color: 'bg-green-100 text-green-800' };
    if (days <= 30) return { label: '1-30 Days', color: 'bg-yellow-100 text-yellow-800' };
    if (days <= 60) return { label: '31-60 Days', color: 'bg-orange-100 text-orange-800' };
    return { label: '60+ Days', color: 'bg-red-100 text-red-800' };
  };

  const totalOutstanding = data.reduce((sum, item) => sum + Number(item.balance), 0);

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AP Aging Report</h2>
        <p className="text-gray-500 mt-1">Accounts Payable — Outstanding Bills</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          ✅ All bills are paid. No outstanding payables.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 text-center">
            <p className="text-sm text-gray-500">Total Outstanding</p>
            <p className="text-3xl font-bold text-red-600">₦{totalOutstanding.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bill #</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aging</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item) => {
                  const aging = getAgingBucket(Number(item.days_overdue));
                  return (
                    <tr key={item.bill_id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{item.name}</td>
                      <td className="px-6 py-3 text-blue-900">{item.bill_number}</td>
                      <td className="px-6 py-3 text-right">₦{Number(item.total).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right text-green-600">₦{Number(item.paid_amount).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-bold text-red-600">₦{Number(item.balance).toLocaleString()}</td>
                      <td className="px-6 py-3">{new Date(item.due_date).toLocaleDateString()}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${aging.color}`}>{aging.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
};

export default APAging;