import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Approval {
  id: number;
  transaction_type: string;
  transaction_id: number;
  submitted_by_name: string;
  status: string;
  submitted_at: string;
  approved_by_name: string | null;
  approved_at: string | null;
  comments: string | null;
}

const Approvals = () => {
  const [pending, setPending] = useState<Approval[]>([]);
  const [history, setHistory] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, historyRes] = await Promise.all([
        api.get('/approvals/pending'),
        api.get('/approvals/history'),
      ]);
      setPending(pendingRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/approvals/${id}/approve`);
      setMessage('✅ Approved');
      fetchData();
    } catch (error) {
      setMessage('❌ Failed');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Rejection reason (optional):');
    try {
      await api.post(`/approvals/${id}/reject`, { comments: reason });
      setMessage('❌ Rejected');
      fetchData();
    } catch (error) {
      setMessage('❌ Failed');
    }
  };

  const handleSubmitForApproval = async () => {
    const type = prompt('Transaction type (journal/invoice/bill):');
    const id = prompt('Transaction ID:');
    if (!type || !id) return;
    
    try {
      await api.post('/approvals/submit', {
        transaction_type: type,
        transaction_id: parseInt(id),
      });
      setMessage('✅ Submitted for approval');
      fetchData();
    } catch (error) {
      setMessage('❌ Failed to submit');
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Approvals</h2>
          <p className="text-gray-500 mt-1">Maker-Checker workflow</p>
        </div>
        <button
          onClick={handleSubmitForApproval}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
        >
          + Submit for Approval
        </button>
      </div>

      {message && (
        <div className="mb-4 text-sm font-medium text-gray-700">{message}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Pending */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="px-6 py-4 bg-yellow-50 border-b">
              <h3 className="font-semibold text-gray-700">⏳ Pending Approvals ({pending.length})</h3>
            </div>
            {pending.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No pending approvals</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pending.map((a) => (
                    <tr key={a.id}>
                      <td className="px-6 py-4 text-sm font-medium capitalize">{a.transaction_type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">#{a.transaction_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.submitted_by_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(a.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleApprove(a.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(a.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          ✗ Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* History */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-700">📋 Approval History</h3>
            </div>
            {history.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No history</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((a) => (
                    <tr key={a.id}>
                      <td className="px-6 py-4 text-sm font-medium capitalize">{a.transaction_type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">#{a.transaction_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.submitted_by_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          a.status === 'approved' ? 'bg-green-100 text-green-800' :
                          a.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.approved_by_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Approvals;