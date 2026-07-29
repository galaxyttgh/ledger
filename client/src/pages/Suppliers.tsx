import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Supplier {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  current_balance: number;
}

const Suppliers = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
  if (!confirm('Delete this supplier?')) return;
  try {
    await api.delete(`/suppliers/${id}`);
    fetchSuppliers();
  } catch (err: any) {
    alert(err.response?.data?.error || 'Delete failed');
  }
};

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Suppliers</h2>
          <p className="text-gray-500 mt-1">Manage supplier accounts</p>
        </div>
        <button
          onClick={() => navigate('/suppliers/new')}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
        >
          + Add Supplier
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No suppliers yet. Click "Add Supplier" to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-900">{supplier.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{supplier.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{supplier.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{supplier.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium">
                    ₦{Number(supplier.current_balance).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
  <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-800">🗑️</button>
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

export default Suppliers;