// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { useNavigate } from 'react-router-dom';
// import { getCurrentPeriod } from '../utils/period';

// interface PayrollRun {
//   id: number;
//   period: string;
//   run_date: string;
//   status: string;
//   total_gross: number;
//   total_deductions: number;
//   total_net: number;
//   created_by_name: string;
// }

// interface Payslip {
//   id: number;
//   employee_code: string;
//   first_name: string;
//   last_name: string;
//   gross_pay: number;
//   paye_tax: number;
//   pension_employee: number;
//   total_deductions: number;
//   net_pay: number;
// }

// const Payroll = () => {
//     const navigate = useNavigate();
//   const [runs, setRuns] = useState<PayrollRun[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [running, setRunning] = useState(false);
// const [period, setPeriod] = useState(getCurrentPeriod());
//   const [selectedRun, setSelectedRun] = useState<{ run: PayrollRun; payslips: Payslip[] } | null>(null);
//   const [message, setMessage] = useState('');


//   const [employees, setEmployees] = useState<any[]>([]);
// const [editingEmployee, setEditingEmployee] = useState<any>(null);

// useEffect(() => { fetchEmployees(); }, []);

// const fetchEmployees = async () => {
//   const response = await api.get('/payroll/employees');
//   setEmployees(response.data);
// };

// const handleDeleteEmployee = async (id: number) => {
//   if (!confirm('Delete this employee?')) return;
//   await api.delete(`/payroll/employees/${id}`);
//   fetchEmployees();
// };
//   useEffect(() => { fetchRuns(); }, []);

//   const fetchRuns = async () => {
//     try {
//       const response = await api.get('/payroll/runs');
//       setRuns(response.data);
//     } catch (error) {
//       console.error('Failed to fetch runs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

// //   const handleRunPayroll = async () => {
// //     setRunning(true);
// //     setMessage('');
// //     try {
// //       const response = await api.post('/payroll/run', { period });
// //       setSelectedRun(response.data);
// //       setMessage('✅ Payroll run completed');
// //       fetchRuns();
// //     } catch (error) {
// //       setMessage('❌ Payroll run failed');
// //     } finally {
// //       setRunning(false);
// //     }
// //   };

// const handleRunPayroll = async () => {
//   setRunning(true);
//   setMessage('');
//   try {
//     const response = await api.post('/payroll/run', { period });
//     // New backend returns { message, summary, payslips, run_id }
//     setSelectedRun({
//       run: {
//         id: response.data.run_id,
//         period: period,
//         run_date: new Date().toISOString(),
//         status: 'posted',
//         total_gross: response.data.summary.total_gross,
//         total_deductions: response.data.summary.total_deductions,
//         total_net: response.data.summary.total_net,
//         created_by_name: '',
//       },
//       payslips: response.data.payslips.map((p: any) => ({
//         id: p.employee,
//         employee_code: p.employee,
//         first_name: p.employee.split(' ')[0],
//         last_name: p.employee.split(' ')[1] || '',
//         gross_pay: p.grossPay,
//         paye_tax: p.monthlyPAYE,
//         pension_employee: p.pensionEmployee,
//         total_deductions: p.totalDeductions,
//         net_pay: p.netPay,
//       })),
//     });
//     setMessage('✅ Payroll run completed');
//     fetchRuns();
//     fetchEmployees();
//   } catch (error) {
//     setMessage('❌ Payroll run failed');
//   } finally {
//     setRunning(false);
//   }
// };

// const viewPayslips = async (runId: number, period: string) => {
//   try {
//     const response = await api.get(`/payroll/runs/${runId}`);
//     setSelectedRun({
//       run: response.data,
//       payslips: response.data.payslips,
//     });
//   } catch (error) {
//     console.error('Failed to fetch payslips:', error);
//   }
// };
//   return (
//     <Layout>
//     <div className="mb-6 flex justify-between items-center">
//   <div>
//     <h2 className="text-2xl font-bold text-gray-800">Payroll Management</h2>
//     <p className="text-gray-500 mt-1">Run payroll and view payslips</p>
//   </div>
//   <div className="flex gap-2">
//     <button
//       onClick={() => navigate('/payroll/employees/new')}
//       className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
//     >
//       + Add Employee
//     </button>
//     <input
//       type="text"
//       value={period}
//       onChange={(e) => setPeriod(e.target.value)}
//       className="px-4 py-2 border rounded-lg text-sm w-32"
//       placeholder="Period"
//     />
//     <button
//       onClick={handleRunPayroll}
//       disabled={running}
//       className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
//     >
//       {running ? 'Running...' : '▶ Run Payroll'}
//     </button>
//   </div>
// </div>

// {/* Employee List */}
// <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
//   <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
//     <h3 className="font-semibold text-gray-700">Employees</h3>
//   </div>
//   <table className="w-full text-sm">
//     <thead className="bg-gray-50">
//       <tr>
//         <th className="px-4 py-2 text-left">Name</th>
//         <th className="px-4 py-2 text-left">Email</th>
//         <th className="px-4 py-2 text-right">Basic Salary</th>
//         <th className="px-4 py-2 text-right">Allowances</th>
//         <th className="px-4 py-2 text-center">Action</th>
//       </tr>
//     </thead>
//     <tbody className="divide-y">
//       {employees.map((emp: any) => (
//         <tr key={emp.id}>
//           <td className="px-4 py-2 font-medium">{emp.first_name} {emp.last_name}</td>
//           <td className="px-4 py-2 text-gray-600">{emp.email}</td>
//           <td className="px-4 py-2 text-right">₦{Number(emp.basic_salary).toLocaleString()}</td>
//           <td className="px-4 py-2 text-right">₦{(Number(emp.housing_allowance) + Number(emp.transport_allowance) + Number(emp.other_allowance)).toLocaleString()}</td>
//           <td className="px-4 py-2 text-center">
//             <button onClick={() => navigate(`/payroll/employees/${emp.id}/edit`)} className="text-blue-600 hover:text-blue-800 text-sm mr-2">✏️</button>
//             <button onClick={() => handleDeleteEmployee(emp.id)} className="text-red-600 hover:text-red-800 text-sm">🗑️</button>
//           </td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>

//       {message && <p className="mb-4 text-sm font-medium">{message}</p>}

//       {/* Payroll Runs */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
//         <div className="px-6 py-4 bg-gray-50 border-b">
//           <h3 className="font-semibold text-gray-700">Payroll Runs</h3>
//         </div>
//         {loading ? (
//           <div className="p-6 text-center text-gray-500">Loading...</div>
//         ) : runs.length === 0 ? (
//           <div className="p-6 text-center text-gray-500">No payroll runs yet</div>
//         ) : (
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {runs.map((run) => (
//                <tr key={run.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => viewPayslips(run.id, run.period)}>
//                   <td className="px-6 py-3 font-medium">{run.period}</td>
//                   <td className="px-6 py-3 text-gray-600">{new Date(run.run_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-3 text-right">₦{Number(run.total_gross).toLocaleString()}</td>
//                   <td className="px-6 py-3 text-right text-red-600">₦{Number(run.total_deductions).toLocaleString()}</td>
//                   <td className="px-6 py-3 text-right font-bold text-green-600">₦{Number(run.total_net).toLocaleString()}</td>
//                   <td className="px-6 py-3"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{run.status}</span></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Latest Run Payslips */}
//       {selectedRun && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-6 py-4 bg-blue-50 border-b">
//             <h3 className="font-semibold text-gray-700">Payslips — {selectedRun.run.period}</h3>
//           </div>
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">PAYE</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pension</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Pay</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {selectedRun.payslips.map((p) => (
//                 <tr key={p.id}>
//                   <td className="px-6 py-3 font-medium">{p.first_name} {p.last_name} <span className="text-gray-400 text-xs">({p.employee_code})</span></td>
//                   <td className="px-6 py-3 text-right">₦{Number(p.gross_pay).toLocaleString()}</td>
//                   <td className="px-6 py-3 text-right text-red-600">₦{Number(p.paye_tax).toLocaleString()}</td>
//                   <td className="px-6 py-3 text-right text-red-600">₦{Number(p.pension_employee).toLocaleString()}</td>
//                   <td className="px-6 py-3 text-right font-bold text-green-600">₦{Number(p.net_pay).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default Payroll;


import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { getCurrentPeriod } from '../utils/period';
import toast from 'react-hot-toast';

interface PayrollRun {
  id: number;
  period: string;
  run_date: string;
  status: string;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  created_by_name: string;
}

interface Payslip {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  gross_pay: number;
  paye_tax: number;
  pension_employee: number;
  total_deductions: number;
  net_pay: number;
}

const Payroll = () => {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [selectedRun, setSelectedRun] = useState<{ run: PayrollRun; payslips: Payslip[] } | null>(null);
  const [message, setMessage] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'employees' | 'runs'>('employees');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { 
    fetchEmployees(); 
    fetchRuns(); 
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/payroll/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const handleDeleteEmployee = (id: number) => {
    setShowDeleteConfirm(id);
  };

  const confirmDeleteEmployee = async (id: number) => {
    try {
      await api.delete(`/payroll/employees/${id}`);
      toast.success('Employee deleted');
      setShowDeleteConfirm(null);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
      setShowDeleteConfirm(null);
    }
  };

  const fetchRuns = async () => {
    try {
      const response = await api.get('/payroll/runs');
      setRuns(response.data);
    } catch (error) {
      console.error('Failed to fetch runs:', error);
      toast.error('Failed to load payroll runs');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    setRunning(true);
    setMessage('');
    try {
      const response = await api.post('/payroll/run', { period });
      setSelectedRun({
        run: {
          id: response.data.run_id,
          period: period,
          run_date: new Date().toISOString(),
          status: 'posted',
          total_gross: response.data.summary.total_gross,
          total_deductions: response.data.summary.total_deductions,
          total_net: response.data.summary.total_net,
          created_by_name: '',
        },
        payslips: response.data.payslips.map((p: any) => ({
          id: p.employee,
          employee_code: p.employee,
          first_name: p.employee.split(' ')[0],
          last_name: p.employee.split(' ')[1] || '',
          gross_pay: p.grossPay,
          paye_tax: p.monthlyPAYE,
          pension_employee: p.pensionEmployee,
          total_deductions: p.totalDeductions,
          net_pay: p.netPay,
        })),
      });
      setMessage('✅ Payroll run completed');
      setActiveTab('runs');
      fetchRuns();
      fetchEmployees();
    } catch (error) {
      setMessage('❌ Payroll run failed');
      toast.error('Payroll run failed');
    } finally {
      setRunning(false);
    }
  };

  const viewPayslips = async (runId: number, period: string) => {
    try {
      const response = await api.get(`/payroll/runs/${runId}`);
      setSelectedRun({
        run: response.data,
        payslips: response.data.payslips,
      });
    } catch (error) {
      console.error('Failed to fetch payslips:', error);
      toast.error('Failed to load payslips');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Payroll Management</h2>
              <p className="text-gray-500 mt-1 text-sm">Run payroll and view payslips</p>
            </div>
            <button
              onClick={() => navigate('/payroll/employees/new')}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       active:bg-blue-800 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              + Add Employee
            </button>
          </div>

          {/* Run Payroll Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm flex-1"
              placeholder="Period (e.g., JUL-2026)"
            />
            <button
              onClick={handleRunPayroll}
              disabled={running}
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                       active:bg-green-800 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {running ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running...
                </span>
              ) : (
                '▶ Run Payroll'
              )}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-medium text-blue-800">
          {message}
        </div>
      )}

      {/* Mobile Tabs */}
      <div className="lg:hidden flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'employees'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          👥 Employees ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('runs')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'runs'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📊 Runs ({runs.length})
        </button>
      </div>

      {/* Employee List */}
      <div className={`${activeTab === 'runs' ? 'hidden lg:block' : ''} mb-6`}>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 lg:px-6 py-4 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-700">Employees</h3>
          </div>

          {employees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <span className="text-3xl mb-2 block">👤</span>
              <p>No employees yet</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Basic Salary</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Allowances</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employees.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{emp.first_name} {emp.last_name}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{emp.email || '-'}</td>
                        <td className="px-4 py-3 text-right">₦{Number(emp.basic_salary).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          ₦{(Number(emp.housing_allowance) + Number(emp.transport_allowance) + Number(emp.other_allowance)).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => navigate(`/payroll/employees/${emp.id}/edit`)} 
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteEmployee(emp.id)} 
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {employees.map((emp: any) => {
                  const totalAllowances = Number(emp.housing_allowance) + Number(emp.transport_allowance) + Number(emp.other_allowance);
                  return (
                    <div
                      key={emp.id}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedEmployee(selectedEmployee?.id === emp.id ? null : emp)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {emp.first_name} {emp.last_name}
                          </h4>
                          {emp.email && (
                            <p className="text-xs text-gray-500">{emp.email}</p>
                          )}
                        </div>
                        <span className="font-bold text-green-600 text-sm">
                          ₦{(Number(emp.basic_salary) + totalAllowances).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                          <span className="text-gray-400">Basic:</span> ₦{Number(emp.basic_salary).toLocaleString()}
                        </div>
                        <div>
                          <span className="text-gray-400">Allowances:</span> ₦{totalAllowances.toLocaleString()}
                        </div>
                      </div>

                      {selectedEmployee?.id === emp.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/payroll/employees/${emp.id}/edit`);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                                     hover:bg-blue-100 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(emp.id);
                            }}
                            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium 
                                     hover:bg-red-100 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payroll Runs */}
      <div className={`${activeTab === 'employees' ? 'hidden lg:block' : ''} mb-6`}>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 lg:px-6 py-4 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-700">Payroll Runs</h3>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : runs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <span className="text-3xl mb-2 block">📊</span>
              <p>No payroll runs yet</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Gross</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Deductions</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Net</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {runs.map((run) => (
                      <tr 
                        key={run.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors" 
                        onClick={() => viewPayslips(run.id, run.period)}
                      >
                        <td className="px-6 py-3 font-medium">{run.period}</td>
                        <td className="px-6 py-3 text-gray-600 text-xs">
                          {new Date(run.run_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 text-right">₦{Number(run.total_gross).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right text-red-600">₦{Number(run.total_deductions).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right font-bold text-green-600">₦{Number(run.total_net).toLocaleString()}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{run.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => viewPayslips(run.id, run.period)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{run.period}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(run.run_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                        {run.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Gross</p>
                        <p className="font-medium">₦{Number(run.total_gross).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Deductions</p>
                        <p className="font-medium text-red-600">₦{Number(run.total_deductions).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Net</p>
                        <p className="font-bold text-green-600">₦{Number(run.total_net).toLocaleString()}</p>
                      </div>
                    </div>

                    <p className="text-xs text-blue-600 mt-2">Tap to view payslips →</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payslips Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedRun(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="p-4 lg:p-6 border-b flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800">
                Payslips — {selectedRun.run.period}
              </h3>
              <button 
                onClick={() => setSelectedRun(null)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="hidden sm:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Gross Pay</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">PAYE</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Pension</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedRun.payslips.map((p) => (
                      <tr key={p.id}>
                        <td className="px-6 py-3 font-medium">
                          {p.first_name} {p.last_name}
                          <span className="text-gray-400 text-xs ml-1">({p.employee_code})</span>
                        </td>
                        <td className="px-6 py-3 text-right">₦{Number(p.gross_pay).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right text-red-600">₦{Number(p.paye_tax).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right text-red-600">₦{Number(p.pension_employee).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right font-bold text-green-600">₦{Number(p.net_pay).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Payslip Cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {selectedRun.payslips.map((p) => (
                  <div key={p.id} className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {p.first_name} {p.last_name}
                      <span className="text-gray-400 text-xs ml-1">({p.employee_code})</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Gross Pay</p>
                        <p className="font-medium">₦{Number(p.gross_pay).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Net Pay</p>
                        <p className="font-bold text-green-600">₦{Number(p.net_pay).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">PAYE Tax</p>
                        <p className="text-red-600">₦{Number(p.paye_tax).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pension</p>
                        <p className="text-red-600">₦{Number(p.pension_employee).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <span className="text-4xl mb-3 block">⚠️</span>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Employee?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. All payroll data for this employee will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                           hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteEmployee(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 
                           transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Payroll;