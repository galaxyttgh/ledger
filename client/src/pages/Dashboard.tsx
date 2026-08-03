
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// interface DashboardStats {
//   customers: number;
//   suppliers: number;
//   invoices: number;
//   bills: number;
//   journals: number;
// }

// const Dashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [stats, setStats] = useState<DashboardStats>({ customers: 0, suppliers: 0, invoices: 0, bills: 0, journals: 0 });
//   const [loading, setLoading] = useState(true);
// const [alerts, setAlerts] = useState<any>({});


// const [financials, setFinancials] = useState<any>({});

// useEffect(() => {
//   fetchStats();
//   fetchAlerts();
//   fetchFinancials();
// }, []);

// const fetchFinancials = async () => {
//   try {
//     const response = await api.get('/dashboard/financial-summary');
//     setFinancials(response.data);
//   } catch (error) {
//     console.error('Failed to fetch financials:', error);
//   }
// };

// useEffect(() => {
//   fetchStats();
//   fetchAlerts();
// }, []);

// const fetchAlerts = async () => {
//   try {
//     const response = await api.get('/dashboard/alerts');
//     setAlerts(response.data);
//   } catch (error) {
//     console.error('Failed to fetch alerts:', error);
//   }
// };
//   useEffect(() => { fetchStats(); }, []);

//   const fetchStats = async () => {
//     try {
//       const response = await api.get('/dashboard/stats');
//       setStats(response.data);
//     } catch (error) {
//       console.error('Failed to fetch stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const kpiCards = [
//     { label: 'Journal Entries', value: stats.journals, color: 'from-blue-500 to-blue-700', icon: '📒', path: '/general-ledger' },
//     { label: 'Customers', value: stats.customers, color: 'from-green-500 to-green-700', icon: '👥', path: '/customers' },
//     { label: 'Invoices', value: stats.invoices, color: 'from-purple-500 to-purple-700', icon: '🧾', path: '/invoices' },
//     { label: 'Bills', value: stats.bills, color: 'from-orange-500 to-orange-700', icon: '💳', path: '/bills' },
//   ];

//   const chartData = [
//     { name: 'Journals', count: stats.journals },
//     { name: 'Customers', count: stats.customers },
//     { name: 'Invoices', count: stats.invoices },
//     { name: 'Bills', count: stats.bills },
//   ];

//   return (
//     <Layout>
//       <div className="mb-8">
//         <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
//         <p className="text-gray-500 mt-1">Welcome back, {user?.full_name}</p>
//       </div>



//       {loading ? (
//   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//     {[...Array(4)].map((_, i) => (
//       <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
//         <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
//         <div className="h-8 bg-gray-200 rounded w-12"></div>
//       </div>
//     ))}
//   </div>
// ) : (
//   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//     {kpiCards.map((card) => (
//       <div
//         key={card.label}
//         onClick={() => navigate(card.path)}
//         className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition"
//       >
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm font-medium">{card.label}</p>
//             <p className="text-gray-800 text-3xl font-bold mt-1">{card.value}</p>
//           </div>
//           <span className="text-3xl opacity-60">{card.icon}</span>
//         </div>
//       </div>
//     ))}
//   </div>
// )}

// {/* Alerts */}
// {(alerts.overdueInvoices > 0 || alerts.overdueBills > 0 || alerts.pendingApprovals > 0 || alerts.unmatchedTransactions > 0) && (
//   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//     {alerts.overdueInvoices > 0 && (
//       <div onClick={() => navigate('/ar-aging')} className="bg-red-50 border border-red-200 rounded-xl p-4 cursor-pointer hover:bg-red-100 transition">
//         <p className="text-sm text-red-600 font-medium">⚠️ Overdue Invoices</p>
//         <p className="text-2xl font-bold text-red-800">{alerts.overdueInvoices}</p>
//         <p className="text-xs text-red-500">₦{Number(alerts.overdueInvoicesAmount).toLocaleString()}</p>
//       </div>
//     )}
//     {alerts.overdueBills > 0 && (
//       <div onClick={() => navigate('/ap-aging')} className="bg-orange-50 border border-orange-200 rounded-xl p-4 cursor-pointer hover:bg-orange-100 transition">
//         <p className="text-sm text-orange-600 font-medium">⚠️ Overdue Bills</p>
//         <p className="text-2xl font-bold text-orange-800">{alerts.overdueBills}</p>
//         <p className="text-xs text-orange-500">₦{Number(alerts.overdueBillsAmount).toLocaleString()}</p>
//       </div>
//     )}
//     {alerts.pendingApprovals > 0 && (
//       <div onClick={() => navigate('/approvals')} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 cursor-pointer hover:bg-yellow-100 transition">
//         <p className="text-sm text-yellow-600 font-medium">⏳ Pending Approvals</p>
//         <p className="text-2xl font-bold text-yellow-800">{alerts.pendingApprovals}</p>
//       </div>
//     )}
//     {alerts.unmatchedTransactions > 0 && (
//       <div onClick={() => navigate('/bank-reconciliation')} className="bg-blue-50 border border-blue-200 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition">
//         <p className="text-sm text-blue-600 font-medium">🔍 Unmatched Bank Txns</p>
//         <p className="text-2xl font-bold text-blue-800">{alerts.unmatchedTransactions}</p>
//       </div>
//     )}
//   </div>
// )}
//       {/* Charts */}
//       {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Module Overview</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
//           <div className="space-y-3">
//             {[
//               { label: 'Create Journal Entry', icon: '📒', path: '/general-ledger/new', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
//               { label: 'Create Invoice', icon: '🧾', path: '/invoices/new', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
//               { label: 'Create Bill', icon: '💳', path: '/bills/new', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
//               { label: 'Record Receipt', icon: '💰', path: '/receipts/new', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
//               { label: 'Record Payment', icon: '💸', path: '/payments/new', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
//               { label: 'View Trial Balance', icon: '📊', path: '/trial-balance', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
//             ].map((action) => (
//               <button
//                 key={action.label}
//                 onClick={() => navigate(action.path)}
//                 className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${action.color}`}
//               >
//                 {action.icon} {action.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div> */}

// {/* Financial Overview */}
// <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
//   {[
//     { label: 'Cash Balance', value: financials.cashBalance, color: 'text-blue-600', bg: 'bg-blue-50' },
//     { label: 'Revenue', value: financials.revenue, color: 'text-green-600', bg: 'bg-green-50' },
//     { label: 'Expenses', value: financials.expenses, color: 'text-red-600', bg: 'bg-red-50' },
//     { label: 'Receivables', value: financials.receivables, color: 'text-purple-600', bg: 'bg-purple-50' },
//     { label: 'Net Profit', value: financials.netProfit, color: 'text-teal-600', bg: 'bg-teal-50' },
//   ].map((item) => (
//     <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
//       <p className="text-xs text-gray-500 uppercase">{item.label}</p>
//       <p className={`text-xl font-bold ${item.color}`}>₦{(item.value || 0).toLocaleString()}</p>
//     </div>
//   ))}
// </div>

// {/* Charts */}
// <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//   <div className="bg-white rounded-xl shadow-sm p-6">
//     <h3 className="text-lg font-semibold text-gray-800 mb-4">Module Overview</h3>
//     <ResponsiveContainer width="100%" height={250}>
//       <BarChart data={chartData}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="name" />
//         <YAxis />
//         <Tooltip />
//         <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
//       </BarChart>
//     </ResponsiveContainer>
//   </div>

//   <div className="bg-white rounded-xl shadow-sm p-6">
//     <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
//     <ResponsiveContainer width="100%" height={250}>
//       <BarChart data={[
//         { name: 'Revenue', amount: financials.revenue || 0 },
//         { name: 'Expenses', amount: financials.expenses || 0 },
//         { name: 'Net Profit', amount: financials.netProfit || 0 },
//       ]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="name" />
//         <YAxis />
//         <Tooltip />
//         <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} />
//       </BarChart>
//     </ResponsiveContainer>
//   </div>
// </div>
//       {/* System Info */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">System Overview</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//           {[
//             { label: 'Total Accounts', value: '31' },
//             { label: 'Role', value: user?.role || 'User' },
//             { label: 'Modules Active', value: '10 of 19' },
//             { label: 'Audit Trail', value: 'Active' },
//           ].map((item) => (
//             <div key={item.label} className="text-center p-4 bg-gray-50 rounded-lg">
//               <p className="text-gray-500 text-xs uppercase tracking-wide">{item.label}</p>
//               <p className="text-gray-800 font-semibold mt-1 capitalize">{item.value}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default Dashboard;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [stats, setStats] = useState<DashboardStats>({ customers: 0, suppliers: 0, invoices: 0, bills: 0, journals: 0 });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any>({});
  const [financials, setFinancials] = useState<any>({});

  useEffect(() => {
    fetchStats();
    fetchAlerts();
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      const response = await api.get('/dashboard/financial-summary');
      setFinancials(response.data);
    } catch (error) {
      console.error('Failed to fetch financials:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/dashboard/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

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

  const kpiCards = [
    { label: 'Journal Entries', value: stats.journals, color: 'from-blue-500 to-blue-700', icon: '📒', path: '/general-ledger' },
    { label: 'Customers', value: stats.customers, color: 'from-green-500 to-green-700', icon: '👥', path: '/customers' },
    { label: 'Invoices', value: stats.invoices, color: 'from-purple-500 to-purple-700', icon: '🧾', path: '/invoices' },
    { label: 'Bills', value: stats.bills, color: 'from-orange-500 to-orange-700', icon: '💳', path: '/bills' },
  ];

  const chartData = [
    { name: 'Journals', count: stats.journals },
    { name: 'Customers', count: stats.customers },
    { name: 'Invoices', count: stats.invoices },
    { name: 'Bills', count: stats.bills },
  ];

  const hasAlerts = alerts.overdueInvoices > 0 || alerts.overdueBills > 0 || alerts.pendingApprovals > 0 || alerts.unmatchedTransactions > 0;

  return (
    <Layout>
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1 text-sm lg:text-base">Welcome back, {user?.full_name}</p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 lg:p-6 animate-pulse">
              <div className="h-3 lg:h-4 bg-gray-200 rounded w-16 lg:w-20 mb-2 lg:mb-3"></div>
              <div className="h-6 lg:h-8 bg-gray-200 rounded w-10 lg:w-12"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 cursor-pointer hover:shadow-md transition active:scale-95 lg:active:scale-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs lg:text-sm font-medium">{card.label}</p>
                  <p className="text-gray-800 text-2xl lg:text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <span className="text-2xl lg:text-3xl opacity-60">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {hasAlerts && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          {alerts.overdueInvoices > 0 && (
            <div onClick={() => navigate('/ar-aging')} className="bg-red-50 border border-red-200 rounded-xl p-3 lg:p-4 cursor-pointer hover:bg-red-100 transition active:scale-95 lg:active:scale-100">
              <p className="text-xs lg:text-sm text-red-600 font-medium">⚠️ Overdue Invoices</p>
              <p className="text-xl lg:text-2xl font-bold text-red-800">{alerts.overdueInvoices}</p>
              <p className="text-xs text-red-500 truncate">₦{Number(alerts.overdueInvoicesAmount).toLocaleString()}</p>
            </div>
          )}
          {alerts.overdueBills > 0 && (
            <div onClick={() => navigate('/ap-aging')} className="bg-orange-50 border border-orange-200 rounded-xl p-3 lg:p-4 cursor-pointer hover:bg-orange-100 transition active:scale-95 lg:active:scale-100">
              <p className="text-xs lg:text-sm text-orange-600 font-medium">⚠️ Overdue Bills</p>
              <p className="text-xl lg:text-2xl font-bold text-orange-800">{alerts.overdueBills}</p>
              <p className="text-xs text-orange-500 truncate">₦{Number(alerts.overdueBillsAmount).toLocaleString()}</p>
            </div>
          )}
          {alerts.pendingApprovals > 0 && (
            <div onClick={() => navigate('/approvals')} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 lg:p-4 cursor-pointer hover:bg-yellow-100 transition active:scale-95 lg:active:scale-100">
              <p className="text-xs lg:text-sm text-yellow-600 font-medium">⏳ Pending Approvals</p>
              <p className="text-xl lg:text-2xl font-bold text-yellow-800">{alerts.pendingApprovals}</p>
            </div>
          )}
          {alerts.unmatchedTransactions > 0 && (
            <div onClick={() => navigate('/bank-reconciliation')} className="bg-blue-50 border border-blue-200 rounded-xl p-3 lg:p-4 cursor-pointer hover:bg-blue-100 transition active:scale-95 lg:active:scale-100">
              <p className="text-xs lg:text-sm text-blue-600 font-medium">🔍 Unmatched Bank Txns</p>
              <p className="text-xl lg:text-2xl font-bold text-blue-800">{alerts.unmatchedTransactions}</p>
            </div>
          )}
        </div>
      )}

      {/* Financial Overview */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6 lg:mb-8">
        {[
          { label: 'Cash Balance', value: financials.cashBalance, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Revenue', value: financials.revenue, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Expenses', value: financials.expenses, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Receivables', value: financials.receivables, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Net Profit', value: financials.netProfit, color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-3 lg:p-4 text-center col-span-2 sm:col-span-1`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
            <p className={`text-lg lg:text-xl font-bold mt-1 truncate ${item.color}`}>
              ₦{(item.value || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div> */}

<div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6 lg:mb-8">
  {[
    { label: 'Cash Balance', value: financials.cashBalance, color: 'text-blue-600', bg: 'bg-blue-50', path: '/cash-flow' },
    { label: 'Revenue', value: financials.revenue, color: 'text-green-600', bg: 'bg-green-50', path: '/income-statement' },
    { label: 'Expenses', value: financials.expenses, color: 'text-red-600', bg: 'bg-red-50', path: '/income-statement' },
    { label: 'Receivables', value: financials.receivables, color: 'text-purple-600', bg: 'bg-purple-50', path: '/ar-aging' },
    { label: 'Net Profit', value: financials.netProfit, color: 'text-teal-600', bg: 'bg-teal-50', path: '/income-statement' },
  ].map((item) => (
    <div key={item.label} onClick={() => navigate(item.path)} className={`${item.bg} rounded-xl p-3 lg:p-4 text-center col-span-2 sm:col-span-1 cursor-pointer hover:shadow-md transition`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
      <p className={`text-lg lg:text-xl font-bold mt-1 truncate ${item.color}`}>
        ₦{(item.value || 0).toLocaleString()}
      </p>
    </div>
  ))}
</div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">Module Overview</h3>
          <div className="w-full" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
          <div className="w-full" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[
                  { name: 'Revenue', amount: financials.revenue || 0 },
                  { name: 'Expenses', amount: financials.expenses || 0 },
                  { name: 'Net Profit', amount: financials.netProfit || 0 },
                ]} 
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions for Mobile */}
      <div className="lg:hidden mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Journal', icon: '📒', path: '/general-ledger/new' },
            { label: 'Invoice', icon: '🧾', path: '/invoices/new' },
            { label: 'Bill', icon: '💳', path: '/bills/new' },
            { label: 'Receipt', icon: '💰', path: '/receipts/new' },
            { label: 'Payment', icon: '💸', path: '/payments/new' },
            { label: 'Trial Bal.', icon: '📊', path: '/trial-balance' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center gap-1 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-95 transition"
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">System Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { label: 'Total Accounts', value: '31' },
            { label: 'Role', value: user?.role || 'User' },
            { label: 'Modules Active', value: '10 of 19' },
            { label: 'Audit Trail', value: 'Active' },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 lg:p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-xs uppercase tracking-wide">{item.label}</p>
              <p className="text-gray-800 font-semibold mt-1 text-sm lg:text-base capitalize">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;