import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
import { exportToExcel } from '../utils/exportExcel';

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

  const TrialBalancePDF = ({ data }: { data: any }) => (
  <ReportPDF title="Trial Balance" subtitle="July 2026">
    {data.accounts.map((acc: any) => (
      <PDFRow
        key={acc.id}
        label={`${acc.code} — ${acc.name}`}
      value={acc.debit_balance > 0 ? `NGN ${Number(acc.debit_balance).toLocaleString()} Dr` : `NGN ${Number(acc.credit_balance).toLocaleString()} Cr`}
      />
    ))}
   <PDFTotal label="Total" value={`NGN ${Number(data.totals.debit_balance).toLocaleString()}`} />
  </ReportPDF>
);
return (
  <Layout>
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Trial Balance</h2>
        <p className="text-gray-500 mt-1">Summary of all account balances</p>
      </div>
      <div className="flex gap-2 no-print">
        <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
          🖨️ Print
        </button>
        <button
  onClick={() => data && exportToExcel(
    data.accounts.map((a: any) => ({
      Code: a.code,
      Account: a.name,
      Type: a.type,
      Debit: a.debit_balance,
      Credit: a.credit_balance,
    })),
    'Trial_Balance',
    'Trial Balance'
  )}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
>
  📥 Excel
</button>
        {data && (
          <PDFDownloadLink
            document={<TrialBalancePDF data={data} />}
            fileName="Trial_Balance_July_2026.pdf"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            📄 Export PDF
          </PDFDownloadLink>
        )}
      </div>
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