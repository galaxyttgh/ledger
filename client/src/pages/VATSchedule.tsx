import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
import { Text } from '@react-pdf/renderer';

const VATSchedule = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/vat-schedule');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch VAT schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const VATPDF = ({ data }: { data: any }) => (
    <ReportPDF title="VAT Return Schedule" subtitle="July 2026">
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>Output VAT (Collected)</Text>
      <PDFRow label="VAT on Sales" value={`NGN ${data.outputVAT.toLocaleString()}`} />
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>Input VAT (Paid)</Text>
      <PDFRow label="VAT on Purchases" value={`NGN ${data.inputVAT.toLocaleString()}`} />
      <PDFTotal label="Net VAT Payable" value={`NGN ${data.netVATPayable.toLocaleString()}`} />
    </ReportPDF>
  );

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">VAT Return Schedule</h2>
          <p className="text-gray-500 mt-1">Output VAT vs Input VAT</p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">🖨️ Print</button>
          {data && (
            <PDFDownloadLink document={<VATPDF data={data} />} fileName="VAT_Schedule.pdf" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
              📄 Export PDF
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center border-t-4 border-green-500">
              <p className="text-sm text-gray-500">Output VAT (Collected)</p>
              <p className="text-2xl font-bold text-green-600">₦{data.outputVAT.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center border-t-4 border-red-500">
              <p className="text-sm text-gray-500">Input VAT (Paid)</p>
              <p className="text-2xl font-bold text-red-600">₦{data.inputVAT.toLocaleString()}</p>
            </div>
            <div className={`bg-white rounded-xl shadow-sm p-4 text-center border-t-4 ${data.netVATPayable >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
              <p className="text-sm text-gray-500">Net VAT {data.netVATPayable >= 0 ? 'Payable' : 'Receivable'}</p>
              <p className={`text-2xl font-bold ${data.netVATPayable >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ₦{Math.abs(data.netVATPayable).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b">
                <h3 className="font-semibold">Output VAT Transactions</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Invoice</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                    <th className="px-4 py-2 text-right">VAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.outputDetails.map((d: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-2">{d.invoice_number}</td>
                      <td className="px-4 py-2 text-right">₦{Number(d.subtotal).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-green-600">₦{Number(d.tax_amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-red-50 border-b">
                <h3 className="font-semibold">Input VAT Transactions</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Bill</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                    <th className="px-4 py-2 text-right">VAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.inputDetails.map((d: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-2">{d.bill_number}</td>
                      <td className="px-4 py-2 text-right">₦{Number(d.subtotal).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-red-600">₦{Number(d.tax_amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </Layout>
  );
};

export default VATSchedule;