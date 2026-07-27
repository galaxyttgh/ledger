import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Layout from '../components/Layout';

interface DashboardStats {
  customers: number;
  suppliers: number;
  invoices: number;
  bills: number;
  journals: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    customers: 0,
    suppliers: 0,
    invoices: 0,
    bills: 0,
    journals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Journal Entries', count: stats.journals, color: 'blue', path: '/general-ledger' },
    { label: 'Customers', count: stats.customers, color: 'green', path: '/customers' },
    { label: 'Suppliers', count: stats.suppliers, color: 'purple', path: '/suppliers' },
    { label: 'Invoices', count: stats.invoices, color: 'orange', path: '/invoices' },
    { label: 'Bills', count: stats.bills, color: 'red', path: '/bills' },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'border-l-4 border-blue-500 text-blue-900',
    green: 'border-l-4 border-green-500 text-green-900',
    purple: 'border-l-4 border-purple-500 text-purple-900',
    orange: 'border-l-4 border-orange-500 text-orange-900',
    red: 'border-l-4 border-red-500 text-red-900',
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">Welcome back, {user?.full_name}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {cards.map((card) => (
            <div
              key={card.label}
              onClick={() => navigate(card.path)}
              className={`bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition ${colorClasses[card.color]}`}
            >
              <p className="text-sm text-gray-500 mb-2">{card.label}</p>
              <p className={`text-3xl font-bold`}>{card.count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Links</h3>
          <div className="space-y-2">
            <button onClick={() => navigate('/general-ledger/new')} className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 transition">
              📒 Create Journal Entry
            </button>
            <button onClick={() => navigate('/invoices/new')} className="w-full text-left px-4 py-3 rounded-lg bg-green-50 text-green-900 hover:bg-green-100 transition">
              🧾 Create Invoice
            </button>
            <button onClick={() => navigate('/bills/new')} className="w-full text-left px-4 py-3 rounded-lg bg-red-50 text-red-900 hover:bg-red-100 transition">
              💳 Create Bill
            </button>
            <button onClick={() => navigate('/trial-balance')} className="w-full text-left px-4 py-3 rounded-lg bg-purple-50 text-purple-900 hover:bg-purple-100 transition">
              📊 View Trial Balance
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">System Overview</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex justify-between py-2 border-b">
              <span>Total Accounts</span>
              <span className="font-semibold">31</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Logged in as</span>
              <span className="font-semibold">{user?.role?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Modules Active</span>
              <span className="font-semibold text-green-600">5 of 5</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Audit Trail</span>
              <span className="font-semibold text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;