import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
import { Text } from '@react-pdf/renderer';

const CustomerStatement = () => {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('id') || '';
  const [data, setData] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(customerId);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);
  useEffect(() => { if (selectedId) fetchStatement(); }, [selectedId]);

  const fetchCustomers = async () => {
    const response = await api.get('/customers');
    setCustomers(response.data);
  };

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/customer-statement/${selectedId}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const runningBalance = data?.transactions.reduce((bal: number, t: any) => {
    return t.type === 'invoice' ? bal + Number(t.total) : bal - Number(t.total);
  }, 0) || 0;

  const StatementPDF = ({ data }: { data: any }) => (
    <ReportPDF title="Customer Statement" subtitle={data.customer.name}>
      <PDFRow label="Customer" value={data.customer.name} />
      <PDFRow label="Balance" value={`NGN ${Number(data.customer.current_balance).toLocaleString()}`} />
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Transactions</Text>
      {data.transactions.map((t: any, i: number) => (
        <PDFRow key={i} label={`${t.invoice_number || t.receipt_number} (${t.type})`} value={`NGN ${Number(t.total || t.amount).toLocaleString()}`} />
      ))}
      <PDFTotal label="Outstanding Balance" value={`NGN ${runningBalance.toLocaleString()}`} />
    </ReportPDF>
  );

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customer Statement</h2>
          <p className="text-gray-500 mt-1">Statement of account</p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">🖨️ Print</button>
          {data && (
            <PDFDownloadLink document={<StatementPDF data={data} />} fileName={`Statement_${data.customer.name}.pdf`} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
              📄 Export PDF
            </PDFDownloadLink>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="">Select customer...</option>
          {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : data ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-2xl mx-auto">
          <div className="px-6 py-4 bg-blue-900 text-white">
            <h3 className="text-lg font-bold">{data.customer.name}</h3>
            <p className="text-sm opacity-80">Balance: ₦{Number(data.customer.current_balance).toLocaleString()}</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Reference</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.transactions.map((t: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-2">{new Date(t.invoice_date || t.payment_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{t.invoice_number || t.receipt_number}</td>
                  <td className="px-4 py-2 capitalize">{t.type}</td>
                  <td className={`px-4 py-2 text-right font-medium ${t.type === 'invoice' ? 'text-red-600' : 'text-green-600'}`}>
                    {t.type === 'invoice' ? '-' : '+'}₦{Number(t.total || t.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right">Outstanding Balance:</td>
                <td className="px-4 py-3 text-right">₦{runningBalance.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : null}
    </Layout>
  );
};

export default CustomerStatement;