import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface LineItem {
  code: string;
  name: string;
  amount: number;
}

interface IncomeStatementData {
  revenue: LineItem[];
  totalRevenue: number;
  expenses: LineItem[];
  totalExpenses: number;
  netIncome: number;
}

const IncomeStatement = () => {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/income-statement');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch income statement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Income Statement</h2>
        <p className="text-gray-500 mt-1">Profit & Loss Report</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : data ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-blue-900 text-white text-center">
              <h3 className="text-xl font-bold">PrimeLedger</h3>
              <p className="text-sm opacity-80">Income Statement — July 2026</p>
            </div>

            <div className="p-6">
              {/* Revenue Section */}
              <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Revenue</h4>
              {data.revenue.length === 0 ? (
                <p className="text-gray-500 text-sm mb-4">No revenue recorded</p>
              ) : (
                data.revenue.map((item) => (
                  <div key={item.code} className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">{item.code} — {item.name}</span>
                    <span className="font-medium">₦{item.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between py-2 border-t font-bold text-sm mt-2">
                <span>Total Revenue</span>
                <span>₦{data.totalRevenue.toLocaleString()}</span>
              </div>

              {/* Expenses Section */}
              <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 mt-6">Expenses</h4>
              {data.expenses.length === 0 ? (
                <p className="text-gray-500 text-sm mb-4">No expenses recorded</p>
              ) : (
                data.expenses.map((item) => (
                  <div key={item.code} className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">{item.code} — {item.name}</span>
                    <span className="font-medium">₦{item.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between py-2 border-t font-bold text-sm mt-2">
                <span>Total Expenses</span>
                <span>₦{data.totalExpenses.toLocaleString()}</span>
              </div>

              {/* Net Income */}
              <div className={`flex justify-between py-4 mt-4 rounded-lg px-4 text-lg font-bold ${
                data.netIncome >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <span>Net {data.netIncome >= 0 ? 'Profit' : 'Loss'}</span>
                <span>₦{Math.abs(data.netIncome).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};

export default IncomeStatement;