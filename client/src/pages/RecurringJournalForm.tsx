import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

const RecurringJournalForm = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [nextRunDate, setNextRunDate] = useState('');
  const [lines, setLines] = useState([{ account_id: 0, description: '', debit: '', credit: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const addLine = () => setLines([...lines, { account_id: 0, description: '', debit: '', credit: '' }]);
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
    setLoading(true);
    try {
      await api.post('/journals/recurring', {
        description,
        frequency,
        next_run_date: nextRunDate,
        lines: lines.map(l => ({
          account_id: l.account_id,
          description: l.description,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
        })),
      });
      navigate('/general-ledger');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Recurring Journal</h2>
            <p className="text-gray-500 mt-1">Auto-generate monthly entries</p>
          </div>
          <button onClick={() => navigate('/general-ledger')} className="px-4 py-2 border rounded-lg">← Back</button>
        </div>
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Monthly Rent" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Next Run Date *</label>
            <input type="date" value={nextRunDate} onChange={(e) => setNextRunDate(e.target.value)} className="px-3 py-2 border rounded-lg" required />
          </div>

          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Lines</h4>
            <button type="button" onClick={addLine} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">+ Add</button>
          </div>

          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <select value={line.account_id} onChange={(e) => updateLine(i, 'account_id', e.target.value)} className="col-span-4 px-2 py-2 border rounded-lg text-sm" required>
                <option value="">Account</option>
                {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.code}</option>)}
              </select>
              <input type="text" value={line.description} onChange={(e) => updateLine(i, 'description', e.target.value)} className="col-span-3 px-2 py-2 border rounded-lg text-sm" placeholder="Desc" />
              <input type="number" value={line.debit} onChange={(e) => updateLine(i, 'debit', e.target.value)} className="col-span-2 px-2 py-2 border rounded-lg text-sm" placeholder="Dr" />
              <input type="number" value={line.credit} onChange={(e) => updateLine(i, 'credit', e.target.value)} className="col-span-2 px-2 py-2 border rounded-lg text-sm" placeholder="Cr" />
              <button type="button" onClick={() => removeLine(i)} className="col-span-1 text-red-500">×</button>
            </div>
          ))}

          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 mt-4">
            {loading ? 'Saving...' : 'Save Recurring Journal'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default RecurringJournalForm;