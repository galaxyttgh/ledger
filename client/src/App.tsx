// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { isAuthenticated } = useAuth();
//   console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }
  
//   return <>{children}</>;
// };

// const AppRoutes = () => {
//   const { isAuthenticated } = useAuth();
//   console.log('AppRoutes - isAuthenticated:', isAuthenticated);

//   return (
//     <Routes>
//       <Route 
//         path="/login" 
//         element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
//       />
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />
      
//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// };

// const App = () => {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AppRoutes />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// };

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GeneralLedger from './pages/GeneralLedger';
import JournalForm from './pages/JournalForm';
import TrialBalance from './pages/TrialBalance';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';

import Suppliers from './pages/Suppliers';
import SupplierForm from './pages/SupplierForm';
import Bills from './pages/Bills';
import BillForm from './pages/BillForm';
import IncomeStatement from './pages/IncomeStatement';
import Receipts from './pages/Receipts';
import ReceiptForm from './pages/ReceiptForm';
import Payments from './pages/Payments';
import PaymentForm from './pages/PaymentForm';
import BalanceSheet from './pages/BalanceSheet';
import BankReconciliation from './pages/BankReconciliation';
import Approvals from './pages/Approvals';
import ApprovalRules from './pages/ApprovalRules';
import { Toaster } from 'react-hot-toast';
import AuditTrail from './pages/AuditTrail';
import ARAging from './pages/ARAging';
import APAging from './pages/APAging';
import CashFlow from './pages/CashFlow';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/general-ledger"
        element={
          <ProtectedRoute>
            <GeneralLedger />
          </ProtectedRoute>
        }
      />
      <Route
  path="/general-ledger/new"
  element={
    <ProtectedRoute>
      <JournalForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/trial-balance"
  element={
    <ProtectedRoute>
      <TrialBalance />
    </ProtectedRoute>
  }
/>
<Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
<Route path="/customers/new" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
<Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
<Route path="/invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
<Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
<Route path="/suppliers/new" element={<ProtectedRoute><SupplierForm /></ProtectedRoute>} />
<Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
<Route path="/bills/new" element={<ProtectedRoute><BillForm /></ProtectedRoute>} />
<Route path="/income-statement" element={<ProtectedRoute><IncomeStatement /></ProtectedRoute>} />
<Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
<Route path="/receipts/new" element={<ProtectedRoute><ReceiptForm /></ProtectedRoute>} />
<Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
<Route path="/payments/new" element={<ProtectedRoute><PaymentForm /></ProtectedRoute>} />
<Route path="/balance-sheet" element={<ProtectedRoute><BalanceSheet /></ProtectedRoute>} />
<Route path="/bank-reconciliation" element={<ProtectedRoute><BankReconciliation /></ProtectedRoute>} />
<Route path="/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
<Route path="/approval-rules" element={<ProtectedRoute><ApprovalRules /></ProtectedRoute>} />
<Route path="/audit-trail" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
<Route path="/ar-aging" element={<ProtectedRoute><ARAging /></ProtectedRoute>} />
<Route path="/ap-aging" element={<ProtectedRoute><APAging /></ProtectedRoute>} />
<Route path="/cash-flow" element={<ProtectedRoute><CashFlow /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;