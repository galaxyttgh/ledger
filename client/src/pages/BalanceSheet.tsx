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

interface BalanceSheetData {
  assets: LineItem[];
  totalAssets: number;
  liabilities: LineItem[];
  totalLiabilities: number;
  equity: LineItem[];
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

const BalanceSheet = () => {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/balance-sheet');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch balance sheet:', error);
    } finally {
      setLoading(false);
    }
  };


  const BalanceSheetPDF = ({ data }: { data: any }) => (
  <ReportPDF title="Balance Sheet" subtitle="July 2026">
    <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Assets</Text>
    {data.assets.map((item: any) => (
      <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
    ))}
    <PDFTotal label="Total Assets" value={`NGN ${data.totalAssets.toLocaleString()}`} />
    
    <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Liabilities</Text>
    {data.liabilities.map((item: any) => (
      <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
    ))}
    <PDFTotal label="Total Liabilities" value={`NGN ${data.totalLiabilities.toLocaleString()}`} />
    
    <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Equity</Text>
    {data.equity.map((item: any) => (
      <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
    ))}
    <PDFTotal label="Total Equity" value={`NGN ${data.totalEquity.toLocaleString()}`} />
    
    <PDFTotal label="Total Liabilities + Equity" value={`NGN ${data.totalLiabilitiesAndEquity.toLocaleString()}`} />
  </ReportPDF>
);

  const renderSection = (title: string, items: LineItem[], total: number, color: string) => (
    <div className="mb-6">
      <h4 className={`text-lg font-semibold mb-3 border-b pb-2 ${color}`}>{title}</h4>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No items</p>
      ) : (
        items.map((item) => (
          <div key={item.code} className="flex justify-between py-2 text-sm">
            <span className="text-gray-600">{item.code} — {item.name}</span>
            <span className="font-medium">₦{item.amount.toLocaleString()}</span>
          </div>
        ))
      )}
      <div className="flex justify-between py-2 border-t font-bold text-sm mt-2">
        <span>Total {title}</span>
        <span>₦{total.toLocaleString()}</span>
      </div>
    </div>
  );

  return (
    <Layout>
    <div className="mb-6 flex justify-between items-center">
  <div>
    <h2 className="text-2xl font-bold text-gray-800">Balance Sheet</h2>
    <p className="text-gray-500 mt-1">Assets = Liabilities + Equity</p>
  </div>
  <div className="flex gap-2 no-print">
    <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
      🖨️ Print
    </button>
    <button
  onClick={() => data && exportToExcel(
    [
      ...data.assets.map((a: any) => ({ Category: 'Asset', Code: a.code, Account: a.name, Amount: a.amount })),
      ...data.liabilities.map((l: any) => ({ Category: 'Liability', Code: l.code, Account: l.name, Amount: l.amount })),
      ...data.equity.map((e: any) => ({ Category: 'Equity', Code: e.code, Account: e.name, Amount: e.amount })),
    ],
    'Balance_Sheet',
    'Balance Sheet'
  )}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
>
  📥 Excel
</button>
    {data && (
      <PDFDownloadLink
        document={<BalanceSheetPDF data={data} />}
        fileName="Balance_Sheet_July_2026.pdf"
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
              <p className="text-sm opacity-80">Balance Sheet — July 2026</p>
            </div>

            <div className="p-6">
              {renderSection('Assets', data.assets, data.totalAssets, 'text-blue-900')}
              {renderSection('Liabilities', data.liabilities, data.totalLiabilities, 'text-red-900')}
              {renderSection('Equity', data.equity, data.totalEquity, 'text-green-900')}

              <div className={`flex justify-between py-4 mt-4 rounded-lg px-4 text-lg font-bold ${
                Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 0.01
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}>
                <span>Total Liabilities + Equity</span>
                <span>₦{data.totalLiabilitiesAndEquity.toLocaleString()}</span>
              </div>

              <div className={`text-center mt-2 text-sm font-medium ${
                Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 0.01
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 0.01
                  ? '✓ Balance Sheet is balanced — Assets = Liabilities + Equity'
                  : '✗ Balance Sheet is not balanced'}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};

export default BalanceSheet;