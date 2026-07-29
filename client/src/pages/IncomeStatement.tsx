import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
import { Text } from '@react-pdf/renderer';
import { exportToExcel } from '../utils/exportExcel';

interface LineItem {
  code: string;
  name: string;
  amount: number;
}

interface IncomeStatementData {
  revenue: LineItem[];
  totalRevenue: number;
  expenses: LineItem[];
  totalExpenses: number;
  netIncome: number;
}

const IncomeStatement = () => {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/income-statement');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch income statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const IncomeStatementPDF = ({ data }: { data: any }) => (
  <ReportPDF title="Income Statement" subtitle="July 2026">
    <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Revenue</Text>
    {data.revenue.map((item: any) => (
      <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
    ))}
    <PDFTotal label="Total Revenue" value={`NGN ${data.totalRevenue.toLocaleString()}`} />
    
    <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Expenses</Text>
    {data.expenses.map((item: any) => (
      <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
    ))}
    <PDFTotal label="Total Expenses" value={`NGN ${data.totalExpenses.toLocaleString()}`} />
    
    <PDFTotal label={data.netIncome >= 0 ? 'Net Profit' : 'Net Loss'} value={`NGN ${Math.abs(data.netIncome).toLocaleString()}`} />
  </ReportPDF>
);
  return (
    <Layout>
      {/* <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Income Statement</h2>
        <p className="text-gray-500 mt-1">Profit & Loss Report</p>
      </div> */}

<div className="mb-6 flex justify-between items-center">
  <div>
    <h2 className="text-2xl font-bold text-gray-800">Income Statement</h2>
    <p className="text-gray-500 mt-1">Profit & Loss Report</p>
  </div>
  <div className="flex gap-2 no-print">
    <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
      🖨️ Print
    </button>
    <button
  onClick={() => data && exportToExcel(
    [
      ...data.revenue.map((r: any) => ({ Category: 'Revenue', Code: r.code, Account: r.name, Amount: r.amount })),
      ...data.expenses.map((e: any) => ({ Category: 'Expense', Code: e.code, Account: e.name, Amount: e.amount })),
      { Category: '', Code: '', Account: 'NET PROFIT', Amount: data.netIncome },
    ],
    'Income_Statement',
    'P&L'
  )}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
>
  📥 Excel
</button>
    {data && (
      <PDFDownloadLink
        document={<IncomeStatementPDF data={data} />}
        fileName="Income_Statement_July_2026.pdf"
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-blue-900 text-white text-center">
              <h3 className="text-xl font-bold">PrimeLedger</h3>
              <p className="text-sm opacity-80">Income Statement — July 2026</p>
            </div>

            <div className="p-6">
              {/* Revenue Section */}
              <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Revenue</h4>
              {data.revenue.length === 0 ? (
                <p className="text-gray-500 text-sm mb-4">No revenue recorded</p>
              ) : (
                data.revenue.map((item) => (
                  <div key={item.code} className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">{item.code} — {item.name}</span>
                    <span className="font-medium">₦{item.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between py-2 border-t font-bold text-sm mt-2">
                <span>Total Revenue</span>
                <span>₦{data.totalRevenue.toLocaleString()}</span>
              </div>

              {/* Expenses Section */}
              <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 mt-6">Expenses</h4>
              {data.expenses.length === 0 ? (
                <p className="text-gray-500 text-sm mb-4">No expenses recorded</p>
              ) : (
                data.expenses.map((item) => (
                  <div key={item.code} className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">{item.code} — {item.name}</span>
                    <span className="font-medium">₦{item.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between py-2 border-t font-bold text-sm mt-2">
                <span>Total Expenses</span>
                <span>₦{data.totalExpenses.toLocaleString()}</span>
              </div>

              {/* Net Income */}
              <div className={`flex justify-between py-4 mt-4 rounded-lg px-4 text-lg font-bold ${
                data.netIncome >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <span>Net {data.netIncome >= 0 ? 'Profit' : 'Loss'}</span>
                <span>₦{Math.abs(data.netIncome).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};

export default IncomeStatement;