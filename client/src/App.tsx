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
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Payroll from './pages/Payroll';
import Budget from './pages/Budget';
import Assets from './pages/Assets';
import EmployeeForm from './pages/EmployeeForm';
import AssetForm from './pages/AssetForm';
import BudgetForm from './pages/BudgetForm';
import CreditNoteForm from './pages/CreditNoteForm';
import DebitNoteForm from './pages/DebitNoteForm';
import PeriodClose from './pages/PeriodClose';
import RecurringJournalForm from './pages/RecurringJournalForm';
import VATSchedule from './pages/VATSchedule';
import WHTCertificates from './pages/WHTCertificates';
import TaxRates from './pages/TaxRates';
import CustomerStatement from './pages/CustomerStatement';
import SupplierStatement from './pages/SupplierStatement';
import PaymentBatch from './pages/PaymentBatch';
import ChartOfAccounts from './pages/ChartOfAccounts';

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
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
<Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
<Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
<Route path="/payroll/employees/new" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
<Route path="/assets/new" element={<ProtectedRoute><AssetForm /></ProtectedRoute>} />
<Route path="/budget/new" element={<ProtectedRoute><BudgetForm /></ProtectedRoute>} />
<Route path="/invoices/credit-note" element={<ProtectedRoute><CreditNoteForm /></ProtectedRoute>} />
<Route path="/bills/debit-note" element={<ProtectedRoute><DebitNoteForm /></ProtectedRoute>} />
<Route path="/period-close" element={<ProtectedRoute><PeriodClose /></ProtectedRoute>} />
<Route path="/general-ledger/recurring" element={<ProtectedRoute><RecurringJournalForm /></ProtectedRoute>} />
<Route path="/vat-schedule" element={<ProtectedRoute><VATSchedule /></ProtectedRoute>} />
<Route path="/wht-certificates" element={<ProtectedRoute><WHTCertificates /></ProtectedRoute>} />
<Route path="/tax-rates" element={<ProtectedRoute><TaxRates /></ProtectedRoute>} />
<Route path="/customer-statement" element={<ProtectedRoute><CustomerStatement /></ProtectedRoute>} />
<Route path="/supplier-statement" element={<ProtectedRoute><SupplierStatement /></ProtectedRoute>} />
<Route path="/payments/batch" element={<ProtectedRoute><PaymentBatch /></ProtectedRoute>} />
<Route path="/accounts" element={<ProtectedRoute><ChartOfAccounts /></ProtectedRoute>} />
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