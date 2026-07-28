import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface ApprovalRule {
  id: number;
  transaction_type: string;
  min_amount: number;
  approver_role: string;
  priority: number;
  is_active: boolean;
}

const ApprovalRules = () => {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await api.get('/approvals/rules');
      setRules(response.data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Approval Rules</h2>
        <p className="text-gray-500 mt-1">Configure maker-checker routing</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Amount (₦)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approver Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 text-sm font-medium capitalize">{rule.transaction_type}</td>
                  <td className="px-6 py-4 text-sm">₦{Number(rule.min_amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm capitalize">{rule.approver_role}</td>
                  <td className="px-6 py-4 text-sm">{rule.priority}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
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

export default ApprovalRules;