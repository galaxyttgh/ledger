import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

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
  const [period, setPeriod] = useState('JUL-2026');
  const [selectedRun, setSelectedRun] = useState<{ run: PayrollRun; payslips: Payslip[] } | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchRuns(); }, []);

  const fetchRuns = async () => {
    try {
      const response = await api.get('/payroll/runs');
      setRuns(response.data);
    } catch (error) {
      console.error('Failed to fetch runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    setRunning(true);
    setMessage('');
    try {
      const response = await api.post('/payroll/run', { period });
      setSelectedRun(response.data);
      setMessage('✅ Payroll run completed');
      fetchRuns();
    } catch (error) {
      setMessage('❌ Payroll run failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <Layout>
    <div className="mb-6 flex justify-between items-center">
  <div>
    <h2 className="text-2xl font-bold text-gray-800">Payroll Management</h2>
    <p className="text-gray-500 mt-1">Run payroll and view payslips</p>
  </div>
  <div className="flex gap-2">
    <button
      onClick={() => navigate('/payroll/employees/new')}
      className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
    >
      + Add Employee
    </button>
    <input
      type="text"
      value={period}
      onChange={(e) => setPeriod(e.target.value)}
      className="px-4 py-2 border rounded-lg text-sm w-32"
      placeholder="Period"
    />
    <button
      onClick={handleRunPayroll}
      disabled={running}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
    >
      {running ? 'Running...' : '▶ Run Payroll'}
    </button>
  </div>
</div>

      {message && <p className="mb-4 text-sm font-medium">{message}</p>}

      {/* Payroll Runs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-700">Payroll Runs</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : runs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No payroll runs yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{run.period}</td>
                  <td className="px-6 py-3 text-gray-600">{new Date(run.run_date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">₦{Number(run.total_gross).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-red-600">₦{Number(run.total_deductions).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-bold text-green-600">₦{Number(run.total_net).toLocaleString()}</td>
                  <td className="px-6 py-3"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{run.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Latest Run Payslips */}
      {selectedRun && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b">
            <h3 className="font-semibold text-gray-700">Payslips — {selectedRun.run.period}</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">PAYE</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pension</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {selectedRun.payslips.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-3 font-medium">{p.first_name} {p.last_name} <span className="text-gray-400 text-xs">({p.employee_code})</span></td>
                  <td className="px-6 py-3 text-right">₦{Number(p.gross_pay).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-red-600">₦{Number(p.paye_tax).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-red-600">₦{Number(p.pension_employee).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-bold text-green-600">₦{Number(p.net_pay).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Payroll;