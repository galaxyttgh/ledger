import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { getCurrentPeriod } from '../utils/period';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
}

const BudgetForm = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState('');
const [period, setPeriod] = useState(getCurrentPeriod());
  const [lines, setLines] = useState<{ account_id: number; amount: string }[]>([
    { account_id: 0, amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data.filter((a: Account) => a.type === 'revenue' || a.type === 'expense'));
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const addLine = () => setLines([...lines, { account_id: 0, amount: '' }]);
  
  const removeLine = (i: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, idx) => idx !== i));
  };

  const updateLine = (i: number, field: string, value: string) => {
    const updated = [...lines];
    updated[i] = { ...updated[i], [field]: field === 'account_id' ? parseInt(value) || 0 : value };
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/budgets', {
        name,
        period,
        lines: lines.filter(l => l.account_id > 0 && parseFloat(l.amount) > 0).map(l => ({
          account_id: l.account_id,
          amount: parseFloat(l.amount),
        })),
      });
      navigate('/budget');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  const total = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create Budget</h2>
            <p className="text-gray-500 mt-1">Set budget targets for accounts</p>
          </div>
          <button onClick={() => navigate('/budget')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">← Back</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Q3 Budget" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period *</label>
              <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-700">Budget Lines</h4>
            <button type="button" onClick={addLine} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Add Line</button>
          </div>

          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-3 items-center">
              <select
                value={line.account_id}
                onChange={(e) => updateLine(i, 'account_id', e.target.value)}
                className="col-span-7 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                required
              >
                <option value="">Select account...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                ))}
              </select>
              <input
                type="number"
                value={line.amount}
                onChange={(e) => updateLine(i, 'amount', e.target.value)}
                className="col-span-4 px-2 py-2 border border-gray-300 rounded-lg text-sm text-right"
                placeholder="Amount"
                step="0.01"
                min="0"
                required
              />
              <button type="button" onClick={() => removeLine(i)} className="col-span-1 text-red-500 hover:text-red-700 text-lg">×</button>
            </div>
          ))}

          <div className="text-right text-sm font-medium mt-2 border-t pt-2">
            Total Budget: ₦{total.toLocaleString()}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 mt-4">
            {loading ? 'Saving...' : 'Save Budget'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default BudgetForm;