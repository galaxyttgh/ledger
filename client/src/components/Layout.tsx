// import { NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const Layout = ({ children }: { children: React.ReactNode }) => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const menuItems = [
//     { path: '/dashboard', label: 'Dashboard', icon: '📊' },
//     { path: '/general-ledger', label: 'General Ledger', icon: '📒' },
//     { path: '/accounts', label: 'Chart of Accounts', icon: '📋' },
//     { path: '/customers', label: 'Customers', icon: '👥' },
//     { path: '/suppliers', label: 'Suppliers', icon: '🏢' },
//     { path: '/trial-balance', label: 'Trial Balance', icon: '📊' },
//     { path: '/invoices', label: 'Invoices', icon: '🧾' },
//     { path: '/bills', label: 'Bills', icon: '💳' },
//     { path: '/income-statement', label: 'P&L Report', icon: '📈' },,
//     { path: '/receipts', label: 'Receipts', icon: '💰' },
// { path: '/payments', label: 'Payments', icon: '💸' },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100 flex">
//       {/* Sidebar */}
//       <aside className="w-64 bg-blue-900 text-white flex flex-col">
//         <div className="p-6 border-b border-blue-800">
//           <h1 className="text-xl font-bold">PrimeLedger</h1>
//           <p className="text-blue-300 text-sm mt-1">Accounting Platform</p>
//         </div>

//         <nav className="flex-1 p-4 space-y-1">
//        {menuItems.map((item: { path: string; label: string; icon: string }) => (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
//                   isActive
//                     ? 'bg-blue-700 text-white'
//                     : 'text-blue-200 hover:bg-blue-800 hover:text-white'
//                 }`
//               }
//             >
//               <span>{item.icon}</span>
//               <span>{item.label}</span>
//             </NavLink>
//           ))}
//         </nav>

//         <div className="p-4 border-t border-blue-800">
//           <div className="text-sm text-blue-300 mb-2">{user?.full_name}</div>
//           <button
//             onClick={handleLogout}
//             className="w-full text-left px-4 py-2 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition"
//           >
//             🚪 Logout
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-8 overflow-auto">
//         {children}
//       </main>
//     </div>
//   );
// };

// export default Layout;

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">PrimeLedger</h1>
          <p className="text-blue-300 text-sm mt-1">Accounting Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
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