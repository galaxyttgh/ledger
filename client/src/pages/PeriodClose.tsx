import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface ClosedPeriod {
  id: number;
  period: string;
  closed_by_name: string;
  closed_at: string;
}

const PeriodClose = () => {
  const [periods, setPeriods] = useState<ClosedPeriod[]>([]);
  const [period, setPeriod] = useState('JUL-2026');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchPeriods(); }, []);

  const fetchPeriods = async () => {
    try {
      const response = await api.get('/periods');
      setPeriods(response.data);
    } catch (error) {
      console.error('Failed to fetch periods:', error);
    }
  };

  const handleClose = async () => {
    if (!confirm(`Close period ${period}? No more entries can be posted.`)) return;
    setLoading(true);
    try {
      await api.post('/periods/close', { period });
      setMessage(`✅ Period ${period} closed`);
      fetchPeriods();
    } catch (error) {
      setMessage('❌ Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = async (p: string) => {
    if (!confirm(`Reopen period ${p}?`)) return;
    try {
      await api.post('/periods/reopen', { period: p });
      setMessage(`✅ Period ${p} reopened`);
      fetchPeriods();
    } catch (error) {
      setMessage('❌ Failed');
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Period Close</h2>
        <p className="text-gray-500 mt-1">Lock accounting periods</p>
      </div>

      {message && <p className="mb-4 text-sm font-medium">{message}</p>}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Period</label>
            <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg" />
          </div>
          <button onClick={handleClose} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
            🔒 Close Period
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-700">Closed Periods</h3>
        </div>
        {periods.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No periods closed yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closed At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {periods.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-3 font-medium">{p.period}</td>
                  <td className="px-6 py-3 text-gray-600">{p.closed_by_name}</td>
                  <td className="px-6 py-3 text-gray-600">{new Date(p.closed_at).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => handleReopen(p.period)} className="text-blue-600 hover:text-blue-800 text-sm">🔓 Reopen</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default PeriodClose;