import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const Delegations = () => {
  const [delegations, setDelegations] = useState<any[]>([]);
  const [delegateId, setDelegateId] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalations, setEscalations] = useState<any>({});

  useEffect(() => { fetchDelegations(); checkEscalations(); }, []);

  const fetchDelegations = async () => {
    try {
      const response = await api.get('/delegations');
      setDelegations(response.data);
    } catch (error) { console.error('Failed'); }
  };

  const checkEscalations = async () => {
    try {
      const response = await api.post('/delegations/check-escalation');
      setEscalations(response.data);
    } catch (error) { console.error('Failed'); }
  };

  const handleCreate = async () => {
    if (!startDate || !endDate) {
      toast.error('Select dates');
      return;
    }
    setLoading(true);
    try {
      await api.post('/delegations', {
        delegate_id: 2, // Finance Officer
        transaction_type: transactionType === 'all' ? null : transactionType,
        start_date: startDate,
        end_date: endDate,
      });
      toast.success('Delegation created');
      fetchDelegations();
    } catch (error) {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Delegation & SLA</h2>
        <p className="text-gray-500 mt-1 text-sm">Manage approval delegations and track SLA</p>
      </div>

      {/* Escalation Alerts */}
      {escalations.escalated > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="font-medium text-red-800">⚠️ {escalations.escalated} approval(s) escalated — pending over 48 hours</p>
        </div>
      )}

      {/* Create Delegation */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold mb-4">Create Delegation</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Transaction Type</label>
            <select value={transactionType} onChange={e => setTransactionType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="all">All Types</option>
              <option value="journal">Journal</option>
              <option value="invoice">Invoice</option>
              <option value="bill">Bill</option>
              <option value="payment">Payment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={handleCreate} disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Delegate
            </button>
          </div>
        </div>
      </div>

      {/* Active Delegations */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="font-semibold">Active Delegations</h3>
        </div>
        {delegations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No active delegations</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">From</th>
                <th className="px-4 py-2 text-left">To</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Period</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {delegations.map((d: any) => (
                <tr key={d.id}>
                  <td className="px-4 py-2">{d.delegator_name}</td>
                  <td className="px-4 py-2 font-medium">{d.delegate_name}</td>
                  <td className="px-4 py-2">{d.transaction_type || 'All'}</td>
                  <td className="px-4 py-2">{d.start_date} → {d.end_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default Delegations;