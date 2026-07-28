import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/general-ledger', label: 'General Ledger', icon: '📒' },
    { path: '/accounts', label: 'Chart of Accounts', icon: '📋' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/suppliers', label: 'Suppliers', icon: '🏢' },
    { path: '/invoices', label: 'Invoices', icon: '🧾' },
    { path: '/bills', label: 'Bills', icon: '💳' },
    { path: '/receipts', label: 'Receipts', icon: '💰' },
    { path: '/payments', label: 'Payments', icon: '💸' },
    { path: '/trial-balance', label: 'Trial Balance', icon: '📊' },
    { path: '/income-statement', label: 'P&L Report', icon: '📈' },
    { path: '/balance-sheet', label: 'Balance Sheet', icon: '📋' },
    { path: '/cash-flow', label: 'Cash Flow', icon: '💵' },
    { path: '/bank-reconciliation', label: 'Bank Rec', icon: '🏦' },
    { path: '/approvals', label: 'Approvals', icon: '✅' },
    { path: '/approval-rules', label: 'Approval Rules', icon: '⚙️' },
    { path: '/audit-trail', label: 'Audit Trail', icon: '🔍' },
    { path: '/ar-aging', label: 'AR Aging', icon: '⏰' },
    { path: '/ap-aging', label: 'AP Aging', icon: '📅' },
    { path: '/payroll', label: 'Payroll', icon: '💵' },
    { path: '/budget', label: 'Budget vs Actual', icon: '📉' },
    { path: '/assets', label: 'Fixed Assets', icon: '🏗️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">PrimeLedger</h1>
          <p className="text-blue-300 text-sm mt-1">Accounting Platform</p>
        </div>

        {/* Branch Selector */}
        <div className="px-4 py-3 border-b border-blue-800">
          <label className="text-xs text-blue-300 block mb-1">Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-2 py-1 bg-blue-800 text-white rounded text-sm border border-blue-700"
          >
            <option value="">All Branches</option>
            {branches.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <div className="text-sm text-blue-300 mb-2">{user?.full_name}</div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;