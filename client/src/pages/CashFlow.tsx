import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
import { Text } from '@react-pdf/renderer';
import { exportToExcel } from '../utils/exportExcel';

interface CashFlowData {
  operatingActivities: { name: string; amount: number }[];
  netOperating: number;
  openingBalance: number;
  closingBalance: number;
}

const CashFlow = () => {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/cash-flow');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch cash flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const CashFlowPDF = ({ data }: { data: CashFlowData }) => (
    <ReportPDF title="Cash Flow Statement" subtitle="July 2026">
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Operating Activities</Text>
      {data.operatingActivities.map((item, i) => (
        <PDFRow key={i} label={item.name} value={`NGN ${Math.abs(item.amount).toLocaleString()}`} />
      ))}
      <PDFTotal label="Net Operating Cash Flow" value={`NGN ${data.netOperating.toLocaleString()}`} />
      <PDFRow label="Opening Balance" value={`NGN ${data.openingBalance.toLocaleString()}`} />
      <PDFTotal label="Closing Balance" value={`NGN ${data.closingBalance.toLocaleString()}`} />
    </ReportPDF>
  );

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cash Flow Statement</h2>
          <p className="text-gray-500 mt-1">Operating cash movements</p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
            🖨️ Print
          </button>
          <button
  onClick={() => data && exportToExcel(
    [
      ...data.operatingActivities.map((a: any) => ({ Activity: 'Operating', Item: a.name, Amount: a.amount })),
      { Activity: '', Item: 'Net Operating Cash Flow', Amount: data.netOperating },
      { Activity: '', Item: 'Opening Balance', Amount: data.openingBalance },
      { Activity: '', Item: 'Closing Balance', Amount: data.closingBalance },
    ],
    'Cash_Flow',
    'Cash Flow'
  )}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
>
  📥 Excel
</button>
          {data && (
            <PDFDownloadLink
              document={<CashFlowPDF data={data} />}
              fileName="Cash_Flow_July_2026.pdf"
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-blue-900 text-white text-center">
              <h3 className="text-xl font-bold">PrimeLedger</h3>
              <p className="text-sm opacity-80">Cash Flow Statement — July 2026</p>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Operating Activities</h4>
              {data.operatingActivities.map((item, i) => (
                <div key={i} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <span className={`font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₦{Math.abs(item.amount).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-t font-bold text-sm mt-2">
                <span>Net Operating Cash Flow</span>
                <span className={data.netOperating >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₦{Math.abs(data.netOperating).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-2 mt-4 text-sm">
                <span className="text-gray-600">Opening Balance</span>
                <span className="font-medium">₦{data.openingBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 mt-2 rounded-lg px-4 text-lg font-bold bg-green-50 text-green-800">
                <span>Closing Balance</span>
                <span>₦{data.closingBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};

export default CashFlow;