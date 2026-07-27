import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
}

interface JournalLine {
  account_id: number;
  description: string;
  debit: number;
  credit: number;
}

const JournalForm = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [description, setDescription] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('JUL-2026');
  const [lines, setLines] = useState<JournalLine[]>([
    { account_id: 0, description: '', debit: 0, credit: 0 },
    { account_id: 0, description: '', debit: 0, credit: 0 },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const addLine = () => {
    setLines([...lines, { account_id: 0, description: '', debit: 0, credit: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof JournalLine, value: string | number) => {
    const updated = lines.map((line, i) => {
      if (i !== index) return line;
      
      if (field === 'debit' || field === 'credit') {
        const numValue = parseFloat(value as string) || 0;
        return {
          ...line,
          [field]: numValue,
          // Auto-clear the other field when one is filled
          ...(field === 'debit' ? { credit: 0 } : { debit: 0 }),
        };
      }
      
      return { ...line, [field]: value };
    });
    setLines(updated);
  };

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
  const difference = totalDebit - totalCredit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isBalanced) {
      setError(`Journal is not balanced. Difference: ₦${difference.toLocaleString()}`);
      return;
    }

    if (totalDebit === 0 && totalCredit === 0) {
      setError('Journal must have at least one amount');
      return;
    }

    setLoading(true);

    try {
      await api.post('/journals', {
        description,
        entry_date: entryDate,
        period,
        lines: lines.filter(l => l.account_id > 0 && (l.debit > 0 || l.credit > 0)),
      });
      navigate('/general-ledger');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">New Journal Entry</h2>
            <p className="text-gray-500 mt-1">Create a double-entry journal</p>
          </div>
          <button
            onClick={() => navigate('/general-ledger')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter journal description"
                required
              />
            </div>
          </div>

          {/* Journal Lines */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Journal Lines</h3>
              <button
                type="button"
                onClick={addLine}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                + Add Line
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-gray-500 w-1/3">Account</th>
                    <th className="px-3 py-2 text-left text-gray-500">Description</th>
                    <th className="px-3 py-2 text-right text-gray-500 w-1/6">Debit (₦)</th>
                    <th className="px-3 py-2 text-right text-gray-500 w-1/6">Credit (₦)</th>
                    <th className="px-3 py-2 text-center text-gray-500 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-3 py-2">
                        <select
                          value={line.account_id}
                          onChange={(e) => updateLine(index, 'account_id', parseInt(e.target.value))}
                          className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select account...</option>
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Line description"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={line.debit || ''}
                          onChange={(e) => updateLine(index, 'debit', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={line.credit || ''}
                          onChange={(e) => updateLine(index, 'credit', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="text-red-500 hover:text-red-700 text-lg"
                          title="Remove line"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan={2} className="px-3 py-3 text-right">Totals:</td>
                    <td className="px-3 py-3 text-right">₦{totalDebit.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right">₦{totalCredit.toLocaleString()}</td>
                    <td></td>
                  </tr>
                  <tr className="text-sm">
                    <td colSpan={2} className="px-3 py-1 text-right text-gray-500">Difference:</td>
                    <td colSpan={2} className={`px-3 py-1 text-right ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      ₦{Math.abs(difference).toLocaleString()} {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isBalanced}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Posting...' : 'Post Journal Entry'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default JournalForm;