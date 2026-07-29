import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const WHTCertificates = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/wht-certificates');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch WHT:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalWHT = data.reduce((sum, d) => sum + d.wht_amount, 0);

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">WHT Certificates</h2>
          <p className="text-gray-500 mt-1">Withholding Tax on supplier payments</p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium no-print">🖨️ Print</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">No supplier bills found</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 text-center">
            <p className="text-sm text-gray-500">Total WHT to Remit</p>
            <p className="text-3xl font-bold text-purple-600">₦{totalWHT.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">WHT (5%)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((d: any) => (
                  <tr key={d.bill_id}>
                    <td className="px-6 py-3 font-medium">{d.supplier_name}</td>
                    <td className="px-6 py-3 text-blue-900">{d.bill_number}</td>
                    <td className="px-6 py-3 text-right">₦{Number(d.subtotal).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right text-purple-600 font-medium">₦{d.wht_amount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-bold">₦{d.net_payment.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
};

export default WHTCertificates;