import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface TaxRate {
  id: number;
  name: string;
  rate: number;
}

const TaxRates = () => {
  const [rates, setRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    try {
      const response = await api.get('/tax-rates');
      setRates(response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRate = async (id: number, newRate: number) => {
    try {
      await api.put(`/tax-rates/${id}`, { rate: newRate });
      setMessage('✅ Rate updated');
      fetchRates();
    } catch (error) {
      setMessage('❌ Failed');
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tax Rate Configuration</h2>
        <p className="text-gray-500 mt-1">Manage tax rates used across the system</p>
      </div>

      {message && <p className="mb-4 text-sm font-medium">{message}</p>}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Tax</th>
                <th className="px-6 py-3 text-right">Current Rate</th>
                <th className="px-6 py-3 text-right">New Rate</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rates.map((tax) => (
                <tr key={tax.id}>
                  <td className="px-6 py-3 font-medium">{tax.name}</td>
                  <td className="px-6 py-3 text-right">{tax.rate}%</td>
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      defaultValue={tax.rate}
                      id={`rate-${tax.id}`}
                      className="w-20 px-2 py-1 border rounded text-right text-sm"
                      step="0.1"
                      min="0"
                    />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => {
                        const input = document.getElementById(`rate-${tax.id}`) as HTMLInputElement;
                        updateRate(tax.id, parseFloat(input.value));
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Update
                    </button>
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

export default TaxRates;