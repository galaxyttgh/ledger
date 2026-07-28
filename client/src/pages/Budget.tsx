import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

interface VarianceLine {
  id: number;
  code: string;
  name: string;
  type: string;
  budget_amount: number;
  actual_amount: number;
  variance: number;
  variance_percent: number;
}

const Budget = () => {
    const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('JUL-2026');

  useEffect(() => { fetchVariance(); }, [period]);

  const fetchVariance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budgets/variance', { params: { period } });
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch variance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
  <div>
    <h2 className="text-2xl font-bold text-gray-800">Budget vs Actual</h2>
    <p className="text-gray-500 mt-1">Variance analysis</p>
  </div>
  <div className="flex gap-2">
    <button
      onClick={() => navigate('/budget/new')}
      className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
    >
      + Create Budget
    </button>
    <input
      type="text"
      value={period}
      onChange={(e) => setPeriod(e.target.value)}
      className="px-4 py-2 border rounded-lg text-sm w-32"
      placeholder="Period"
    />
  </div>
</div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold text-blue-900">₦{data.totalBudget.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-gray-500">Total Actual</p>
              <p className="text-2xl font-bold text-green-900">₦{data.totalActual.toLocaleString()}</p>
            </div>
            <div className={`bg-white rounded-xl shadow-sm p-4 text-center ${data.variance >= 0 ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'}`}>
              <p className="text-sm text-gray-500">Variance</p>
              <p className={`text-2xl font-bold ${data.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.variance >= 0 ? '+' : ''}₦{data.variance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Variance Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.lines.map((line: VarianceLine) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <span className="font-medium">{line.code}</span>
                      <span className="text-gray-500 ml-2">{line.name}</span>
                    </td>
                    <td className="px-6 py-3 capitalize text-gray-600">{line.type}</td>
                    <td className="px-6 py-3 text-right">₦{line.budget_amount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-medium">₦{line.actual_amount.toLocaleString()}</td>
                    <td className={`px-6 py-3 text-right font-medium ${line.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {line.variance >= 0 ? '+' : ''}₦{line.variance.toLocaleString()}
                    </td>
                    <td className={`px-6 py-3 text-right ${line.variance_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {line.variance_percent >= 0 ? '+' : ''}{line.variance_percent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </Layout>
  );
};

export default Budget;