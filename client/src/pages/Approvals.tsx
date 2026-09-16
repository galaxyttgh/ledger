import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Approval {
  id: number;
  transaction_type: string;
  transaction_id: number;
  description: string;
  amount: number;
  submitted_by_name: string;
  status: string;
  submitted_at: string;
  approved_by_name: string | null;
  approved_at: string | null;
  comments: string | null;
  step_id?: number;
  step_order?: number;
  step_comments?: string;
  chain?: string;
   total_steps?: number;
   previous_comments?: string;
}

const Approvals = () => {
  const [pending, setPending] = useState<Approval[]>([]);
  const [history, setHistory] = useState<Approval[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'submissions'>('pending');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showComment, setShowComment] = useState(false);

  // Multi-step form
  const [showMultiForm, setShowMultiForm] = useState(false);
  const [multiType, setMultiType] = useState('purchase');
  const [multiDescription, setMultiDescription] = useState('');
  const [multiAmount, setMultiAmount] = useState('');
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
const [selectedPayrollId, setSelectedPayrollId] = useState('');
const [steps, setSteps] = useState<{role: string}[]>([
  { role: 'manager' },
  { role: 'accountant' },
  { role: 'manager' },
]);

const { user } = useAuth();
  const isHR = user?.role === 'hr_payroll';


  useEffect(() => {
  if (multiType === 'salary') {
    api.get('/payroll/runs').then(r => setPayrollRuns(r.data));
  }
}, [multiType]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, historyRes, submissionsRes] = await Promise.all([
        api.get('/approvals/pending'),
        api.get('/approvals/history'),
        api.get('/approvals/my-submissions'),
      ]);
      setPending(pendingRes.data);
      setHistory(historyRes.data);
      setMySubmissions(submissionsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleRecordPayment = async (a: Approval) => {
  const expenseAccount = prompt('Enter expense account ID (default 27 = Office Supplies):');
  const bankAccount = prompt('Enter bank account ID (default 4 = GTBank):');
  
  if (!confirm(`Record payment of ₦${Number(a.amount).toLocaleString()} for "${a.description}"?`)) return;
  
  try {
    await api.post(`/approvals/${a.id}/record-payment`, {
      expense_account_id: parseInt(expenseAccount || '27'),
      bank_account_id: parseInt(bankAccount || '4'),
    });
    toast.success('Payment recorded and posted to GL');
    fetchData();
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Failed to record payment');
  }
};
  const handleApprove = async (stepId: number) => {
    setActionLoading(stepId);
    try {
      await api.post(`/approvals/steps/${stepId}/act`, {
        action: 'approved',
        comments: commentText || undefined,
      });
      toast.success('Approved');
      setSelectedApproval(null);
      setCommentText('');
      setShowComment(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (stepId: number) => {
    setActionLoading(stepId);
    try {
      await api.post(`/approvals/steps/${stepId}/act`, {
        action: 'rejected',
        comments: commentText || 'Rejected',
      });
      toast.success('Rejected');
      setSelectedApproval(null);
      setCommentText('');
      setShowComment(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitForApproval = async () => {
    const type = prompt('Transaction type (journal/invoice/bill):');
    const id = prompt('Transaction ID:');
    if (!type || !id) return;
    try {
      await api.post('/approvals/submit', {
        transaction_type: type,
        transaction_id: parseInt(id),
      });
      toast.success('Submitted for approval');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, string> = {
      journal: '📒',
      invoice: '🧾',
      bill: '💳',
      payment: '💸',
      payroll: '💰',
      purchase: '🛒',
      salary: '💵',
      other: '📋',
    };
    return icons[type] || '📋';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return { color: 'bg-green-100 text-green-800', icon: '✓' };
      case 'rejected': return { color: 'bg-red-100 text-red-800', icon: '✗' };
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
      case 'active': return { color: 'bg-blue-100 text-blue-800', icon: '🔵' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: '•' };
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Approvals</h2>
            <p className="text-gray-500 mt-1 text-sm">Maker-Checker workflow</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmitForApproval} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium">
              + Submit for Approval
            </button>
            <button onClick={() => setShowMultiForm(!showMultiForm)} className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium">
              🔄 Multi-Step
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Step Form */}
    {showMultiForm && (
  <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
    <h3 className="font-semibold mb-4">New Approval Request</h3>
    <div className="space-y-4 mb-4">
      <select value={multiType} onChange={e => setMultiType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
        <option value="purchase">Purchase Request</option>
        <option value="salary">Salary Approval</option>
        <option value="payment">Payment Request</option>
        <option value="other">Other</option>
      </select>

      {multiType === 'salary' ? (
        <>
          <select 
            value={selectedPayrollId} 
            onChange={(e) => {
              setSelectedPayrollId(e.target.value);
              const run = payrollRuns.find((r: any) => r.id === parseInt(e.target.value));
              if (run) {
                setMultiDescription(`Salary Payment for ${run.period}`);
                setMultiAmount(run.total_net.toString());
              }
            }}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Select Payroll Run...</option>
            {payrollRuns.map((run: any) => (
              <option key={run.id} value={run.id}>
                {run.period} — Net: ₦{Number(run.total_net).toLocaleString()}
              </option>
            ))}
          </select>
          {multiAmount && (
            <p className="text-sm text-gray-500">
              Amount: ₦{Number(multiAmount).toLocaleString()}
            </p>
          )}
        </>
      ) : (
        <>
          <textarea value={multiDescription} onChange={e => setMultiDescription(e.target.value)} placeholder="Describe what you're requesting..." className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
          <input type="number" value={multiAmount} onChange={e => setMultiAmount(e.target.value)} placeholder="Amount (₦) — optional" className="w-full px-3 py-2 border rounded-lg text-sm" />
        </>
      )}
    </div>
    <p className="text-sm text-gray-600 mb-2">Approval chain:</p>
    {steps.map((s, i) => (
      <div key={i} className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 w-14">Step {i + 1}:</span>
        <select value={s.role} onChange={e => {
          const newSteps = [...steps];
          newSteps[i].role = e.target.value;
          setSteps(newSteps);
        }} className="flex-1 px-3 py-2 border rounded-lg text-sm">
          <option value="manager">MD</option>
          <option value="accountant">Accountant</option>
          <option value="hr_payroll">HR</option>
          <option value="admin">Admin</option>
        </select>
        {i > 0 && <button onClick={() => setSteps(steps.filter((_, idx) => idx !== i))} className="text-red-500 text-sm">Remove</button>}
      </div>
    ))}
    <button onClick={() => setSteps([...steps, { role: 'manager' }])} className="text-blue-600 text-sm mb-4">+ Add Step</button>
    <button onClick={async () => {
      if (!multiDescription.trim()) { toast.error('Please enter a description'); return; }
      try {
        await api.post('/approvals/submit-multi', {
          request_type: multiType,
          description: multiDescription,
          amount: parseFloat(multiAmount) || 0,
          steps,
        });
        toast.success('Approval request submitted');
        setShowMultiForm(false);
        setMultiDescription('');
        setMultiAmount('');
        setSelectedPayrollId('');
        fetchData();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed');
      }
    }} className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
      Submit Approval Request
    </button>
  </div>
)}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          ⏳ My Approvals ({pending.length})
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          📋 History ({history.length})
        </button>
        <button onClick={() => setActiveTab('submissions')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'submissions' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          📤 My Requests ({mySubmissions.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {/* My Approvals (items waiting for me) */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-yellow-50 border-b">
                <h3 className="font-semibold text-gray-700">⏳ Waiting for Your Approval</h3>
              </div>
              {pending.length === 0 ? (
                <div className="p-12 text-center text-gray-500">✅ Nothing waiting for you</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">Description</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-left">Submitted By</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pending.map((a) => (
                        <tr key={a.step_id || a.id}>
                          <td className="px-6 py-3">
                            <span className="capitalize">{getTransactionIcon(a.transaction_type)} {a.transaction_type}</span>
                          </td>
                          <td className="px-6 py-3 text-gray-600">{a.description || '-'}</td>
                          <td className="px-6 py-3 text-right font-medium">₦{Number(a.amount || 0).toLocaleString()}</td>
                          <td className="px-6 py-3">{a.submitted_by_name}</td>
                          <td className="px-6 py-3 text-gray-500">{new Date(a.submitted_at).toLocaleDateString()}</td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => { setSelectedApproval(a); setShowComment(false); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium">👁️ View</button>
                              <button onClick={() => { setSelectedApproval(a); setShowComment(true); }} className="text-green-600 hover:text-green-800 text-sm font-medium">✓ Approve</button>
                              <button onClick={() => { setSelectedApproval(a); setShowComment(true); }} className="text-red-600 hover:text-red-800 text-sm font-medium">✗ Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* History */}
      {activeTab === 'history' && (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="px-6 py-4 bg-gray-50 border-b">
      <h3 className="font-semibold text-gray-700">📋 History</h3>
    </div>
    {history.length === 0 ? (
      <div className="p-12 text-center text-gray-500">No history</div>
    ) : (
      <>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-left">Submitted By</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Approved By</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((a) => {
                const badge = getStatusBadge(a.status);
                return (
                  <tr key={a.id}>
                    <td className="px-6 py-3 capitalize">{getTransactionIcon(a.transaction_type)} {a.transaction_type}</td>
                    <td className="px-6 py-3 text-gray-600">{a.description || '-'}</td>
                    <td className="px-6 py-3 text-right">₦{Number(a.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-3">{a.submitted_by_name}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>{badge.icon} {a.status}</span>
                    </td>
                    <td className="px-6 py-3">{a.approved_by_name || '-'}</td>
                    <td className="px-6 py-3">
                      <button onClick={() => setSelectedApproval(a)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                        👁️ View
                      </button>
                   {user?.role === 'accountant' && a.status === 'approved' && !a.transaction_id && a.transaction_type !== 'salary' && (
  <button onClick={() => handleRecordPayment(a)} className="text-green-600 hover:text-green-800 text-sm font-medium">
    💰 Record
  </button>
)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {history.map((a) => {
            const badge = getStatusBadge(a.status);
            return (
              <div key={a.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                      a.status === 'approved' ? 'bg-green-100' : a.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {getTransactionIcon(a.transaction_type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-800 capitalize">{a.transaction_type}</h4>
                      <p className="text-xs text-gray-500 truncate">{a.description || '-'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${badge.color}`}>
                    {badge.icon} {a.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-bold">₦{Number(a.amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submitted By</p>
                    <p className="font-medium">{a.submitted_by_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Approved By</p>
                    <p className="font-medium">{a.approved_by_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">{new Date(a.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setSelectedApproval(a)} className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                    👁️ View / Print
                  </button>
             {user?.role === 'accountant' && a.status === 'approved' && !a.transaction_id && a.transaction_type !== 'salary' && (
  <button onClick={() => handleRecordPayment(a)} className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
    💰 Record Payment
  </button>
)}
                </div>
              </div>
            );
          })}
        </div>
      </>
    )}
  </div>
)}

          {/* My Submissions */}
          {activeTab === 'submissions' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 border-b">
                <h3 className="font-semibold text-gray-700">📤 My Requests</h3>
              </div>
              {mySubmissions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No requests submitted yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">Description</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Approval Chain</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mySubmissions.map((a) => {
                        const badge = getStatusBadge(a.status);
                        return (
                          <tr key={a.id}>
                            <td className="px-6 py-3 capitalize">{getTransactionIcon(a.transaction_type)} {a.transaction_type}</td>
                            <td className="px-6 py-3 text-gray-600">{a.description || '-'}</td>
                            <td className="px-6 py-3 text-right">₦{Number(a.amount || 0).toLocaleString()}</td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>{badge.icon} {a.status}</span>
                            </td>
<td className="px-6 py-3">
  {user?.role === 'accountant' && a.status === 'approved' && (
    <button 
      onClick={() => handleRecordPayment(a)}
      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
    >
      💰 Record Payment
    </button>
  )}
</td>
                            <td className="px-6 py-3 text-xs text-gray-500">{a.chain || '-'}</td>
                            <td className="px-6 py-3 text-gray-500">{new Date(a.submitted_at).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* View/Approve Modal */}
   {selectedApproval && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 no-print" onClick={() => { setSelectedApproval(null); setShowComment(false); }} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 print-area max-h-[90vh] overflow-y-auto">
      
      {/* Company Header */}
     <div className="text-center mb-4 border-b pb-3">
<img src="/logo.png" alt="Galaxy ITT" className="h-10 mx-auto mb-2" />
  <p className="text-sm text-gray-500">Approval Document</p>
  <p className="text-xs text-gray-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
</div>

      <h3 className="text-lg font-bold mb-4">Approval Request</h3>
      
      <div className="space-y-3 text-sm">
        <p><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{selectedApproval.transaction_type}</span></p>
        <p><span className="text-gray-500">Description:</span> <span className="font-medium">{selectedApproval.description || '-'}</span></p>
        <p><span className="text-gray-500">Amount:</span> <span className="font-bold">₦{Number(selectedApproval.amount || 0).toLocaleString()}</span></p>
        <p><span className="text-gray-500">Submitted By:</span> <span className="font-medium">{selectedApproval.submitted_by_name}</span></p>
        <p><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(selectedApproval.submitted_at).toLocaleDateString()}</span></p>
    
        {selectedApproval.previous_comments && (
          <div className="bg-gray-50 p-3 rounded-lg mt-2">
            <p className="text-xs text-gray-500 font-medium mb-1">Previous Comments:</p>
            <p className="text-sm text-gray-700">{selectedApproval.previous_comments}</p>
          </div>
        )}
      </div>

      {/* Signature Section — prints only */}
      <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-xs">
        <div className="text-center">
          <div className="border-t border-gray-400 pt-1 mt-8">Requested By</div>
          <p className="text-gray-600 mt-1">{selectedApproval.submitted_by_name}</p>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 pt-1 mt-8">Reviewed By</div>
          <p className="text-gray-600 mt-1">{selectedApproval.approved_by_name || 'Pending'}</p>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 pt-1 mt-8">Final Approval</div>
          <p className="text-gray-600 mt-1">_________________</p>
        </div>
      </div>

      {showComment && (
        <div className="mt-4 no-print">
          <label className="block text-sm font-medium mb-1">Your Comment (optional)</label>
          <textarea value={commentText} onChange={e => setCommentText(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Add a comment..." />
        </div>
      )}

      <div className="flex gap-2 mt-4 no-print">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
          🖨️ Print
        </button>
        {showComment ? (
          <>
            <button 
              onClick={() => handleApprove(selectedApproval.step_id!)} 
              disabled={actionLoading === selectedApproval.step_id} 
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {actionLoading === selectedApproval.step_id ? '...' : 
                selectedApproval.total_steps && selectedApproval.step_order && 
                selectedApproval.step_order < selectedApproval.total_steps 
                  ? '→ Forward' 
                  : '✓ Final Approve'}
            </button>
            <button onClick={() => handleReject(selectedApproval.step_id!)} disabled={actionLoading === selectedApproval.step_id} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {actionLoading === selectedApproval.step_id ? '...' : '✗ Reject'}
            </button>
          </>
        ) : (
          <button onClick={() => setSelectedApproval(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Close</button>
        )}
      </div>
    </div>
  </div>
)}
    </Layout>
  );
};

export default Approvals;