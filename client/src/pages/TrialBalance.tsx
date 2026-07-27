import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface AccountBalance {
  id: number;
  code: string;
  name: string;
  type: string;
  total_debit: number;
  total_credit: number;
  debit_balance: number;
  credit_balance: number;
}

interface TrialBalanceData {
  accounts: AccountBalance[];
  totals: {
    total_debit: number;
    total_credit: number;
    debit_balance: number;
    credit_balance: number;
  };
}

const TrialBalance = () => {
  const [data, setData] = useState<TrialBalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  const fetchTrialBalance = async () => {
    try {
      const response = await api.get('/journals/reports/trial-balance');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch trial balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Trial Balance</h2>
        <p className="text-gray-500 mt-1">Summary of all account balances</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : data ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">{account.code}</td>
                  <td className="px-6 py-3 text-gray-600">{account.name}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                      {account.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {account.debit_balance > 0 ? `₦${Number(account.debit_balance).toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {account.credit_balance > 0 ? `₦${Number(account.credit_balance).toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold">
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right">Totals:</td>
                <td className="px-6 py-3 text-right">
                  ₦{Number(data.totals.debit_balance).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right">
                  ₦{Number(data.totals.credit_balance).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          {Math.abs(data.totals.debit_balance - data.totals.credit_balance) < 0.01 ? (
            <div className="px-6 py-4 bg-green-50 text-green-700 text-sm font-medium">
              ✓ Trial balance is balanced
            </div>
          ) : (
            <div className="px-6 py-4 bg-red-50 text-red-700 text-sm font-medium">
              ✗ Trial balance is not balanced! Difference: ₦
              {Math.abs(data.totals.debit_balance - data.totals.credit_balance).toLocaleString()}
            </div>
          )}
        </div>
      ) : null}
    </Layout>
  );
};

export default TrialBalance;