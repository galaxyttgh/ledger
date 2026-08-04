import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { exportToExcel } from '../utils/exportExcel';

const ConsolidatedReport = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('');

  useEffect(() => { fetchData(); }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (period) params.period = period;
      const response = await api.get('/reports/consolidated-trial-balance', { params });
      setData(response.data);
    } catch (error) {
      console.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Consolidated Report</h2>
          <p className="text-gray-500 mt-1 text-sm">All branches combined</p>
        </div>
        <div className="flex gap-2">
          <input type="text" value={period} onChange={e => setPeriod(e.target.value)} placeholder="Period" className="px-3 py-2 border rounded-lg text-sm" />
          {data && (
            <button onClick={() => exportToExcel(data.accounts.map((a: any) => ({
              Code: a.code, Account: a.name, Type: a.type,
              Debit: a.debit_balance, Credit: a.credit_balance
            })), 'Consolidated_TB', 'Trial Balance')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
              📥 Excel
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : data ? (
        <>
          {/* Branch Summary */}
          {data.branches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {data.branches.map((b: any) => (
                <div key={b.branch_id} className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <p className="text-sm text-gray-500">{b.branch_name || 'Unassigned'}</p>
                  <p className={`text-xl font-bold ${b.branch_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₦{Math.abs(b.branch_balance).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Consolidated Trial Balance */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="font-semibold">Consolidated Trial Balance</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Code</th>
                  <th className="px-6 py-3 text-left">Account</th>
                  <th className="px-6 py-3 text-right">Debit</th>
                  <th className="px-6 py-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.accounts.map((a: any) => (
                  <tr key={a.id}>
                    <td className="px-6 py-3 font-medium">{a.code}</td>
                    <td className="px-6 py-3 text-gray-600">{a.name}</td>
                    <td className="px-6 py-3 text-right">{a.debit_balance > 0 ? `₦${a.debit_balance.toLocaleString()}` : '-'}</td>
                    <td className="px-6 py-3 text-right">{a.credit_balance > 0 ? `₦${a.credit_balance.toLocaleString()}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan={2} className="px-6 py-3 text-right">Totals:</td>
                  <td className="px-6 py-3 text-right">₦{data.totals.debit_balance.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right">₦{data.totals.credit_balance.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            {Math.abs(data.totals.debit_balance - data.totals.credit_balance) < 0.01 && (
              <div className="px-6 py-3 bg-green-50 text-green-700 text-sm font-medium">✓ Consolidated Trial Balance is balanced</div>
            )}
          </div>
        </>
      ) : null}
    </Layout>
  );
};

export default ConsolidatedReport;