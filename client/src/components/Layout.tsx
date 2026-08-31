
// import { NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useState, useEffect } from 'react';
// import api from '../api/axios';

// interface MenuGroup {
//   label: string;
//   icon: string;
//   items: { path: string; label: string }[];
// }

// const Layout = ({ children }: { children: React.ReactNode }) => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [branches, setBranches] = useState<any[]>([]);
//   const [selectedBranch, setSelectedBranch] = useState('');
//   const [openGroup, setOpenGroup] = useState<string | null>(null);

//   useEffect(() => {
//     fetchBranches();
//   }, []);

//   const fetchBranches = async () => {
//     try {
//       const response = await api.get('/branches');
//       setBranches(response.data);
//     } catch (error) {
//       console.error('Failed to fetch branches:', error);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const toggleGroup = (label: string) => {
//     setOpenGroup(openGroup === label ? null : label);
//   };

//   const menuGroups: MenuGroup[] = [
//     {
//       label: 'Accounting',
//       icon: '📒',
//       items: [
//         { path: '/general-ledger', label: 'General Ledger' },
//         { path: '/accounts', label: 'Chart of Accounts' },
//         { path: '/period-close', label: 'Period Close' },
        
//       ],
//     },
//     {
//       label: 'Sales (AR)',
//       icon: '👥',
//       items: [
//         { path: '/customers', label: 'Customers' },
//         { path: '/invoices', label: 'Invoices' },
//         { path: '/receipts', label: 'Receipts' },
//         { path: '/ar-aging', label: 'AR Aging' },
//         { path: '/customer-statement', label: 'Customer Statement' },
//       ],
//     },
//     {
//       label: 'Purchases (AP)',
//       icon: '🏢',
//       items: [
//         { path: '/suppliers', label: 'Suppliers' },
//         { path: '/bills', label: 'Bills' },
//         { path: '/payments', label: 'Payments' },
//         { path: '/ap-aging', label: 'AP Aging' },
//         { path: '/supplier-statement', label: 'Supplier Statement' },
//         { path: '/payments/batch', label: 'Payment Batch' },
//       ],
//     },
//     {
//       label: 'Banking',
//       icon: '🏦',
//       items: [
//         { path: '/bank-reconciliation', label: 'Bank Reconciliation' },
//       ],
//     },
//     {
//       label: 'Payroll & Assets',
//       icon: '💵',
//       items: [
//         { path: '/payroll', label: 'Payroll' },
//         { path: '/assets', label: 'Fixed Assets' },
//         { path: '/budget', label: 'Budget vs Actual' },
//       ],
//     },
//     {
//       label: 'Reports',
//       icon: '📈',
//       items: [
//         { path: '/trial-balance', label: 'Trial Balance' },
//         { path: '/income-statement', label: 'Income Statement' },
//         { path: '/balance-sheet', label: 'Balance Sheet' },
//         { path: '/cash-flow', label: 'Cash Flow' },
//         { path: '/vat-schedule', label: 'VAT Schedule' },
//         { path: '/wht-certificates', label: 'WHT Certificates' },
//       ],
//     },
//     {
//       label: 'Approvals',
//       icon: '✅',
//       items: [
//         { path: '/approvals', label: 'Pending Approvals' },
//         { path: '/approval-rules', label: 'Approval Rules' },
//       ],
//     },
//     {
//       label: 'Controls',
//       icon: '🔒',
//       items: [
//         { path: '/audit-trail', label: 'Audit Trail' },
//         { path: '/tax-rates', label: 'Tax Rates' },
//       ],
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100 flex">
//      <aside className="w-64 bg-blue-900 text-white flex flex-col h-screen sticky top-0">
//         <div className="p-6 border-b border-blue-800">
//           <h1 className="text-xl font-bold">PrimeLedger</h1>
//           <p className="text-blue-300 text-sm mt-1">Accounting Platform</p>
//         </div>

//         {/* Branch Selector */}
//         <div className="px-4 py-3 border-b border-blue-800">
//           <label className="text-xs text-blue-300 block mb-1">Branch</label>
//           <select
//             value={selectedBranch}
//             onChange={(e) => setSelectedBranch(e.target.value)}
//             className="w-full px-2 py-1 bg-blue-800 text-white rounded text-sm border border-blue-700"
//           >
//             <option value="">All Branches</option>
//             {branches.map((b: any) => (
//               <option key={b.id} value={b.id}>{b.name}</option>
//             ))}
//           </select>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
//           {/* Dashboard - always visible */}
//           <NavLink
//             to="/dashboard"
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
//                 isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
//               }`
//             }
//           >
//             <span>📊</span>
//             <span>Dashboard</span>
//           </NavLink>

//           {/* Menu Groups */}
//           {menuGroups.map((group) => (
//             <div key={group.label}>
//               <button
//                 onClick={() => toggleGroup(group.label)}
//                 className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition"
//               >
//                 <span className="flex items-center gap-3">
//                   <span>{group.icon}</span>
//                   <span className="text-sm font-medium">{group.label}</span>
//                 </span>
//                 <span className="text-xs">{openGroup === group.label ? '▾' : '▸'}</span>
//               </button>
//               {openGroup === group.label && (
//                 <div className="ml-6 space-y-1 mt-1">
//                   {group.items.map((item) => (
//                     <NavLink
//                       key={item.path}
//                       to={item.path}
//                       className={({ isActive }) =>
//                         `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
//                           isActive
//                             ? 'bg-blue-700 text-white'
//                             : 'text-blue-300 hover:bg-blue-800 hover:text-white'
//                         }`
//                       }
//                     >
//                       {item.label}
//                     </NavLink>
//                   ))}
//                 </div>
//               )}
//             </div>
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

//       <main className="flex-1 p-8 overflow-auto h-screen">
//         {children}
//       </main>
//     </div>
//   );
// };

// export default Layout;
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../api/axios';

interface MenuGroup {
  label: string;
  icon: string;
  items: { path: string; label: string }[];
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { fetchBranches(); }, []);
  useEffect(() => { 
    setMobileMenuOpen(false); 
    setMobileOpenGroup(null);
  }, [location]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        moreButtonRef.current && 
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
        setMobileOpenGroup(null);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (error) { console.error('Failed to fetch branches:', error); }
  };

  const handleLogout = () => { 
    logout(); 
    setMobileMenuOpen(false);
    navigate('/login'); 
  };
  
  const toggleGroup = (label: string) => { 
    setOpenGroup(openGroup === label ? null : label); 
  };
  
  const toggleMobileGroup = (label: string) => {
    setMobileOpenGroup(mobileOpenGroup === label ? null : label);
  };

  const menuGroups: MenuGroup[] = [
    { label: 'Accounting', icon: '📒', items: [
      { path: '/general-ledger', label: 'General Ledger' },
      { path: '/accounts', label: 'Chart of Accounts' },
      { path: '/period-close', label: 'Period Close' },
      { path: '/inventory', label: 'Inventory' },
    ]},
    { label: 'Sales (AR)', icon: '👥', items: [
      { path: '/customers', label: 'Customers' },
      { path: '/invoices', label: 'Invoices' },
      { path: '/receipts', label: 'Receipts' },
      { path: '/ar-aging', label: 'AR Aging' },
      { path: '/customer-statement', label: 'Customer Statement' },
      { path: '/quotations', label: 'Quotations' },
      { path: '/collections', label: 'Collections' },
    ]},
    { label: 'Purchases (AP)', icon: '🏢', items: [
      { path: '/suppliers', label: 'Suppliers' },
      { path: '/bills', label: 'Bills' },
      { path: '/payments', label: 'Payments' },
      { path: '/ap-aging', label: 'AP Aging' },
      { path: '/supplier-statement', label: 'Supplier Statement' },
      { path: '/payments/batch', label: 'Payment Batch' },
      { path: '/purchase-orders', label: 'Purchase Orders' },
      { path: '/purchase-orders/goods-receipt', label: 'Goods Receipt' },
{ path: '/purchase-orders/match', label: '3-Way Match' },
    ]},
    { label: 'Banking', icon: '🏦', items: [
      { path: '/bank-reconciliation', label: 'Bank Reconciliation' },
    ]},
    { label: 'Payroll & Assets', icon: '💵', items: [
      { path: '/payroll', label: 'Payroll' },
      { path: '/assets', label: 'Fixed Assets' },
      { path: '/budget', label: 'Budget vs Actual' },
    ]},
    { label: 'Reports', icon: '📈', items: [
      { path: '/trial-balance', label: 'Trial Balance' },
      { path: '/income-statement', label: 'Income Statement' },
      { path: '/balance-sheet', label: 'Balance Sheet' },
      { path: '/cash-flow', label: 'Cash Flow' },
      { path: '/vat-schedule', label: 'VAT Schedule' },
      { path: '/wht-certificates', label: 'WHT Certificates' },
      { path: '/consolidated-report', label: 'Consolidated' },
    ]},
    { label: 'Approvals', icon: '✅', items: [
      { path: '/approvals', label: 'Pending Approvals' },
      { path: '/approval-rules', label: 'Approval Rules' },
      { path: '/delegations', label: 'Delegation & SLA' },
    ]},
    { label: 'Controls', icon: '🔒', items: [
      { path: '/audit-trail', label: 'Audit Trail' },
      { path: '/tax-rates', label: 'Tax Rates' },
      { path: '/sod-rules', label: 'SoD Rules' },
      { path: '/users', label: 'User Management' },
    ]},
  ];
const getVisibleGroups = (): MenuGroup[] => {
  const role = user?.role || 'admin';
  
 const roleAccess: Record<string, string[]> = {
  admin: ['Accounting', 'Sales (AR)', 'Purchases (AP)', 'Banking', 'Payroll & Assets', 'Reports', 'Approvals', 'Controls'],
  accountant: ['Accounting', 'Sales (AR)', 'Purchases (AP)', 'Banking', 'Payroll & Assets', 'Reports', 'Approvals'],
  hr_payroll: ['Payroll & Assets'],
  manager: ['Reports', 'Approvals'],
  auditor: ['Accounting', 'Sales (AR)', 'Purchases (AP)', 'Banking', 'Payroll & Assets', 'Reports', 'Approvals', 'Controls'],
};

  const allowedGroups = roleAccess[role] || roleAccess.admin;
  return menuGroups.filter(g => allowedGroups.includes(g.label));
};

const visibleGroups = getVisibleGroups();

  const bottomNavItems = [
    { path: '/dashboard', icon: '📊', label: 'Home' },
    { path: '/general-ledger', icon: '📒', label: 'Ledger' },
    { path: '/invoices', icon: '🧾', label: 'Sales' },
    { path: '/bills', icon: '💳', label: 'Bills' },
  ];

  const NavItem = ({ item, onClick }: { item: typeof bottomNavItems[0]; onClick?: () => void }) => (
    <NavLink 
      key={item.path} 
      to={item.path}
      onClick={onClick}
      className={({ isActive }) => `
        flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl relative
        transition-all duration-200 ease-out
        ${isActive 
          ? 'text-blue-600 scale-105' 
          : 'text-gray-500 hover:text-gray-700 active:scale-95'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
            {item.icon}
          </span>
          <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
            {item.label}
          </span>
          {isActive && (
            <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
          )}
        </>
      )}
    </NavLink>
  );

  const SidebarContent = () => (
    <div className="bg-gradient-to-b from-blue-900 to-blue-950 text-white h-full flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-blue-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">PL</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">PrimeLedger</h1>
              <p className="text-blue-300/80 text-[11px] font-medium">Accounting Platform</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-blue-300 hover:text-white transition-colors hidden xl:block"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="px-4 py-3 border-b border-blue-800/30">
        <div className="relative">
          <select 
            value={selectedBranch} 
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3 py-2 bg-blue-800/50 text-white rounded-lg text-sm border border-blue-700/50 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     appearance-none cursor-pointer hover:bg-blue-800 transition-colors"
          >
            <option value="">All Branches</option>
            {branches.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-blue-300 text-xs">
            ▼
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent">
       {/* Dashboard Link */}
<NavLink
  to="/dashboard"
 className={({ isActive }) => `
    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
    transition-all duration-200 ease-out
    ${isActive 
      ? 'bg-blue-800/70 text-white shadow-lg' 
      : 'text-blue-200 hover:bg-blue-800/40 hover:text-white'
    }
  `}
>
  <span className="text-base">📊</span>
  <span className="font-medium">Dashboard</span>
</NavLink>
        {visibleGroups.map((group) => (
          <div key={group.label} className="group">
            <button 
              onClick={() => toggleGroup(group.label)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm
                transition-all duration-200 ease-out
                ${openGroup === group.label 
                  ? 'bg-blue-800/70 text-white shadow-lg' 
                  : 'text-blue-200 hover:bg-blue-800/40 hover:text-white'
                }
              `}
            >
              <span className="flex items-center gap-3">
                <span className="text-base">{group.icon}</span>
                <span className="font-medium">{group.label}</span>
              </span>
              <motion.span 
                animate={{ rotate: openGroup === group.label ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-blue-400"
              >
                ▼
              </motion.span>
            </button>
            <AnimatePresence>
              {openGroup === group.label && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="ml-7 mt-1 mb-2 space-y-0.5 border-l-2 border-blue-800/50 pl-3">
                    {group.items.map((item) => (
                      <NavLink 
                        key={item.path} 
                        to={item.path}
                        className={({ isActive }) => `
                          block px-3 py-2 rounded-lg text-xs transition-all duration-150
                          ${isActive 
                            ? 'bg-blue-700 text-white font-medium shadow-md' 
                            : 'text-blue-300/80 hover:bg-blue-800/40 hover:text-white'
                          }
                        `}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        <NavLink to="/change-password" className="w-full text-left px-4 py-2 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition text-sm block mb-1">
  🔑 Change Password
</NavLink>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-blue-800/50 bg-blue-950/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-blue-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-blue-200 hover:bg-red-600/20 
                   hover:text-red-300 transition-colors text-sm group"
        >
          <span className="group-hover:translate-x-1 transition-transform">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
      `}>
        <SidebarContent />
      </aside>

      {/* Mobile Slide-in Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                setMobileOpenGroup(null);
              }}
            />
            
            {/* Menu Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl"
            >
              <div className="h-full flex flex-col">
                {/* Mobile Menu Header */}
                <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">PL</span>
                      </div>
                      <div>
                        <h2 className="font-bold">PrimeLedger</h2>
                        <p className="text-blue-100 text-xs">Navigation Menu</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileOpenGroup(null);
                      }}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Branch Selector in Mobile Menu */}
                  <div className="mt-3">
                    <div className="relative">
                      <select 
                        value={selectedBranch} 
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 
                                 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer"
                      >
                        <option value="" className="text-gray-900">All Branches</option>
                        {branches.map((b: any) => (
                          <option key={b.id} value={b.id} className="text-gray-900">{b.name}</option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-xs">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 overflow-y-auto">
                  <div className="p-3 space-y-1">
                    <NavLink
  to="/dashboard"
  onClick={() => { setMobileMenuOpen(false); setMobileOpenGroup(null); }}
  className={({ isActive }) => `
    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
    ${isActive ? 'bg-blue-50 text-blue-900 shadow-sm' : 'text-gray-700 hover:bg-gray-50'}
  `}
>
  <span className="text-lg">📊</span>
  <span className="text-sm font-semibold">Dashboard</span>
</NavLink>
                    {visibleGroups.map((group) => (
                      
                      <div key={group.label}>
                        <button
                          onClick={() => toggleMobileGroup(group.label)}
                          className={`
                            w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                            ${mobileOpenGroup === group.label 
                              ? 'bg-blue-50 text-blue-900 shadow-sm' 
                              : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                            }
                          `}
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-lg">{group.icon}</span>
                            <span className="text-sm font-semibold">{group.label}</span>
                          </span>
                          <motion.span 
                            animate={{ rotate: mobileOpenGroup === group.label ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-400 text-xs"
                          >
                            ▼
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {mobileOpenGroup === group.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-8 border-l-2 border-blue-100 pl-4 space-y-1 mb-2">
                                {group.items.map((item) => (
                                  <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setMobileOpenGroup(null);
                                    }}
                                    className={({ isActive }) => `
                                      block px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                                      ${isActive 
                                        ? 'bg-blue-600 text-white font-medium shadow-md' 
                                        : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                                      }
                                    `}
                                  >
                                    {item.label}
                                  </NavLink>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    
                  </div>
                </nav>

                {/* Mobile Menu Footer */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center gap-3 mb-3 p-2 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 
                             text-red-600 hover:bg-red-100 active:bg-red-200 transition-colors text-sm font-semibold"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-30 safe-area-bottom shadow-lg">
        <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
          {bottomNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
          
          {/* More Button */}
          <button 
            ref={moreButtonRef}
            onClick={() => setMobileMenuOpen(true)}
            className={`
              flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl
              transition-all duration-200 ease-out
              ${mobileMenuOpen 
                ? 'text-blue-600 scale-105' 
                : 'text-gray-500 hover:text-gray-700 active:scale-95'
              }
            `}
          >
            <div className="relative">
              <span className="text-xl">⋯</span>
              {mobileMenuOpen && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </div>
            <span className={`text-[10px] font-medium ${mobileMenuOpen ? 'font-semibold' : ''}`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;