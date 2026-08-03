// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { getCurrentPeriod } from '../utils/period';

// interface ClosedPeriod {
//   id: number;
//   period: string;
//   closed_by_name: string;
//   closed_at: string;
// }

// const PeriodClose = () => {
//   const [periods, setPeriods] = useState<ClosedPeriod[]>([]);
// const [period, setPeriod] = useState(getCurrentPeriod());
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   useEffect(() => { fetchPeriods(); }, []);

//   const fetchPeriods = async () => {
//     try {
//       const response = await api.get('/periods');
//       setPeriods(response.data);
//     } catch (error) {
//       console.error('Failed to fetch periods:', error);
//     }
//   };

//   const handleClose = async () => {
//     if (!confirm(`Close period ${period}? No more entries can be posted.`)) return;
//     setLoading(true);
//     try {
//       await api.post('/periods/close', { period });
//       setMessage(`✅ Period ${period} closed`);
//       fetchPeriods();
//     } catch (error) {
//       setMessage('❌ Failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReopen = async (p: string) => {
//     if (!confirm(`Reopen period ${p}?`)) return;
//     try {
//       await api.post('/periods/reopen', { period: p });
//       setMessage(`✅ Period ${p} reopened`);
//       fetchPeriods();
//     } catch (error) {
//       setMessage('❌ Failed');
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Period Close</h2>
//         <p className="text-gray-500 mt-1">Lock accounting periods</p>
//       </div>

//       {message && <p className="mb-4 text-sm font-medium">{message}</p>}

//       <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//         <div className="flex gap-4 items-end">
//           <div>
//             <label className="block text-sm font-medium mb-1">Period</label>
//             <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg" />
//           </div>
//           <button onClick={handleClose} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
//             🔒 Close Period
//           </button>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="px-6 py-4 bg-gray-50 border-b">
//           <h3 className="font-semibold text-gray-700">Closed Periods</h3>
//         </div>
//         {periods.length === 0 ? (
//           <div className="p-6 text-center text-gray-500">No periods closed yet</div>
//         ) : (
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closed By</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closed At</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {periods.map((p) => (
//                 <tr key={p.id}>
//                   <td className="px-6 py-3 font-medium">{p.period}</td>
//                   <td className="px-6 py-3 text-gray-600">{p.closed_by_name}</td>
//                   <td className="px-6 py-3 text-gray-600">{new Date(p.closed_at).toLocaleString()}</td>
//                   <td className="px-6 py-3">
//                     <button onClick={() => handleReopen(p.period)} className="text-blue-600 hover:text-blue-800 text-sm">🔓 Reopen</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default PeriodClose;


import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { getCurrentPeriod } from '../utils/period';
import toast from 'react-hot-toast';

interface ClosedPeriod {
  id: number;
  period: string;
  closed_by_name: string;
  closed_at: string;
}

const PeriodClose = () => {
  const [periods, setPeriods] = useState<ClosedPeriod[]>([]);
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => { 
    fetchPeriods(); 
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchPeriods = async () => {
    try {
      const response = await api.get('/periods');
      setPeriods(response.data);
    } catch (error) {
      console.error('Failed to fetch periods:', error);
      toast.error('Failed to load periods');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleClose = async () => {
    setLoading(true);
    setMessage('');
    try {
      await api.post('/periods/close', { period });
      setMessage(`✅ Period ${period} closed successfully`);
      toast.success(`Period ${period} closed`);
      setShowCloseConfirm(false);
      fetchPeriods();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to close period';
      setMessage(`❌ ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = async (p: string) => {
    try {
      await api.post('/periods/reopen', { period: p });
      setMessage(`✅ Period ${p} reopened successfully`);
      toast.success(`Period ${p} reopened`);
      setShowReopenConfirm(null);
      fetchPeriods();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to reopen period';
      setMessage(`❌ ${errorMsg}`);
      toast.error(errorMsg);
    }
  };

  const isCurrentPeriodClosed = periods.some(p => p.period === period);
  const closedCount = periods.length;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Period Close</h2>
        <p className="text-gray-500 mt-1 text-sm">Lock accounting periods</p>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          message.startsWith('✅') 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Period Close Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Period to Close
            </label>
            <input 
              type="text" 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)} 
              placeholder="e.g., JUL-2026"
              className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                ${isCurrentPeriodClosed 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {isCurrentPeriodClosed && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <span>🔒</span>
                <span>This period is already closed</span>
              </p>
            )}
          </div>
          <button 
            onClick={() => setShowCloseConfirm(true)} 
            disabled={loading || isCurrentPeriodClosed} 
            className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 
                     active:bg-red-800 transition-colors text-sm font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Closing...
              </span>
            ) : (
              '🔒 Close Period'
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-xs text-yellow-800 flex items-start gap-2">
            <span>⚠️</span>
            <span>
              Closing a period will prevent any new entries from being posted. 
              Make sure all transactions are recorded before closing.
            </span>
          </p>
        </div>
      </div>

      {/* Closed Periods */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 lg:px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Closed Periods</h3>
          {closedCount > 0 && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">
              {closedCount} period{closedCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {fetchLoading ? (
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
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
          </div>
        ) : periods.length === 0 ? (
          <div className="p-8 lg:p-12 text-center">
            <span className="text-4xl mb-3 block">📅</span>
            <p className="text-gray-500 font-medium">No periods closed yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Close a period to lock it and prevent further postings
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Closed By</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Closed At</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {periods.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-medium text-gray-800 flex items-center gap-2">
                          <span>🔒</span>
                          <span>{p.period}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{p.closed_by_name}</td>
                      <td className="px-6 py-3 text-gray-600 text-xs">
                        {new Date(p.closed_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button 
                          onClick={() => setShowReopenConfirm(p.period)} 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          🔓 Reopen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {periods.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-lg">
                        🔒
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{p.period}</h4>
                        <p className="text-xs text-gray-500">Closed by {p.closed_by_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(p.closed_at).toLocaleDateString()} at{' '}
                      {new Date(p.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button 
                      onClick={() => setShowReopenConfirm(p.period)} 
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium 
                               hover:bg-blue-100 transition-colors"
                    >
                      🔓 Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Close Period Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCloseConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <span className="text-4xl mb-3 block">🔒</span>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Close Period?</h3>
              <p className="text-sm text-gray-500 mb-2">
                You are about to close period:
              </p>
              <p className="text-xl font-bold text-gray-800 mb-4">{period}</p>
              <p className="text-sm text-gray-500 mb-6">
                No more journal entries or transactions can be posted to this period. 
                This action will be logged in the audit trail.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                           hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 
                           transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Closing...' : 'Close Period'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Period Confirmation Modal */}
      {showReopenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReopenConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <span className="text-4xl mb-3 block">🔓</span>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Reopen Period?</h3>
              <p className="text-sm text-gray-500 mb-2">
                You are about to reopen period:
              </p>
              <p className="text-xl font-bold text-gray-800 mb-4">{showReopenConfirm}</p>
              <p className="text-sm text-gray-500 mb-6">
                Transactions can be posted again. This action will be logged in the audit trail.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReopenConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                           hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReopen(showReopenConfirm)}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                           transition-colors text-sm font-medium"
                >
                  Reopen Period
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PeriodClose;