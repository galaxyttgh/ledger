import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const SoDRules = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sod-rules').then(r => setRules(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Segregation of Duties</h2>
        <p className="text-gray-500 mt-1 text-sm">SoD rules to prevent conflicts</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Role 1</th>
                <th className="px-6 py-3 text-left">Role 2</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rules.map((r: any) => (
                <tr key={r.id}>
                  <td className="px-6 py-3 font-medium capitalize">{r.role_1?.replace('_', ' ')}</td>
                  <td className="px-6 py-3 font-medium capitalize">{r.role_2?.replace('_', ' ')}</td>
                  <td className="px-6 py-3 text-gray-600">{r.description}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${r.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </span>
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

export default SoDRules;