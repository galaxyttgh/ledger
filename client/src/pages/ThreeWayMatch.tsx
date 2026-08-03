// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// const ThreeWayMatch = () => {
//   const [matches, setMatches] = useState<any[]>([]);
//   const [pos, setPos] = useState<any[]>([]);
//   const [grs, setGrs] = useState<any[]>([]);
//   const [bills, setBills] = useState<any[]>([]);
//   const [poId, setPoId] = useState('');
//   const [grId, setGrId] = useState('');
//   const [billId, setBillId] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [viewMatches, setViewMatches] = useState(true);

//   useEffect(() => {
//     fetchMatches();
//     api.get('/purchase-orders').then(r => setPos(r.data));
//     api.get('/bills').then(r => setBills(r.data));
//   }, []);

//   const fetchMatches = async () => {
//     try {
//       const response = await api.get('/purchase-orders/matches');
//       setMatches(response.data);
//     } catch (error) {
//       console.error('Failed to fetch matches');
//     }
//   };

//   useEffect(() => {
//     if (poId) {
//       // Fetch goods receipts for selected PO
//       api.get('/purchase-orders').then(r => {
//         // Simplified - in production, fetch GRs by PO
//         setGrs([]);
//       });
//     }
//   }, [poId]);

//   const handleMatch = async () => {
//     if (!poId || !grId || !billId) {
//       toast.error('Select PO, GR, and Bill');
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await api.post('/purchase-orders/match', {
//         po_id: parseInt(poId),
//         gr_id: parseInt(grId),
//         bill_id: parseInt(billId),
//       });
//       toast.success(`Match: ${response.data.match_status}`);
//       fetchMatches();
//     } catch (err: any) {
//       toast.error('Match failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'matched': return 'bg-green-100 text-green-800';
//       case 'variance': return 'bg-red-100 text-red-800';
//       default: return 'bg-yellow-100 text-yellow-800';
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">3-Way Match</h2>
//         <p className="text-gray-500 mt-1 text-sm">Match Purchase Orders → Goods Receipts → Bills</p>
//       </div>

//       <div className="flex gap-2 mb-6">
//         <button onClick={() => setViewMatches(true)} className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMatches ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
//           View Matches
//         </button>
//         <button onClick={() => setViewMatches(false)} className={`px-4 py-2 rounded-lg text-sm font-medium ${!viewMatches ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
//           New Match
//         </button>
//       </div>

//       {viewMatches ? (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-6 py-4 bg-gray-50 border-b"><h3 className="font-semibold">Match History</h3></div>
//           {matches.length === 0 ? (
//             <div className="p-6 text-center text-gray-500">No matches yet</div>
//           ) : (
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-2 text-left">PO</th>
//                   <th className="px-4 py-2 text-left">Supplier</th>
//                   <th className="px-4 py-2 text-right">PO Amount</th>
//                   <th className="px-4 py-2 text-right">Bill Amount</th>
//                   <th className="px-4 py-2 text-right">Variance</th>
//                   <th className="px-4 py-2 text-left">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {matches.map((m: any) => (
//                   <tr key={m.id}>
//                     <td className="px-4 py-2 font-medium">{m.po_number}</td>
//                     <td className="px-4 py-2">{m.supplier_name}</td>
//                     <td className="px-4 py-2 text-right">₦{Number(m.po_amount).toLocaleString()}</td>
//                     <td className="px-4 py-2 text-right">₦{Number(m.bill_amount).toLocaleString()}</td>
//                     <td className={`px-4 py-2 text-right font-medium ${Math.abs(m.variance) < 1 ? 'text-green-600' : 'text-red-600'}`}>
//                       ₦{Number(m.variance).toLocaleString()}
//                     </td>
//                     <td className="px-4 py-2">
//                       <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(m.match_status)}`}>{m.match_status}</span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
//           <h3 className="font-semibold mb-4">Create New Match</h3>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Purchase Order</label>
//               <select value={poId} onChange={e => setPoId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
//                 <option value="">Select PO...</option>
//                 {pos.map((p: any) => <option key={p.id} value={p.id}>{p.po_number} — {p.supplier_name}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Goods Receipt (GR Number)</label>
//               <input type="text" value={grId} onChange={e => setGrId(e.target.value)} placeholder="Enter GR ID" className="w-full px-3 py-2 border rounded-lg" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Supplier Bill</label>
//               <select value={billId} onChange={e => setBillId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
//                 <option value="">Select Bill...</option>
//                 {bills.map((b: any) => <option key={b.id} value={b.id}>{b.bill_number} — {b.supplier_name}</option>)}
//               </select>
//             </div>
//             <button onClick={handleMatch} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
//               {loading ? 'Matching...' : 'Run 3-Way Match'}
//             </button>
//           </div>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default ThreeWayMatch;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface MatchRecord {
  id: number;
  po_number: string;
  supplier_name: string;
  po_amount: number;
  bill_amount: number;
  gr_amount?: number;
  variance: number;
  match_status: string;
  match_date?: string;
}

const ThreeWayMatch = () => {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [grs, setGrs] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [poId, setPoId] = useState('');
  const [grId, setGrId] = useState('');
  const [billId, setBillId] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMatches, setViewMatches] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);

  useEffect(() => {
    fetchMatches();
    api.get('/purchase-orders').then(r => setPos(r.data)).catch(() => toast.error('Failed to load POs'));
    api.get('/bills').then(r => setBills(r.data)).catch(() => toast.error('Failed to load bills'));
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/purchase-orders/matches');
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to fetch matches');
      toast.error('Failed to load match history');
    }
  };

  useEffect(() => {
    if (poId) {
      api.get('/purchase-orders').then(r => {
        setGrs([]);
      }).catch(() => {});
    }
  }, [poId]);

  const handleMatch = async () => {
    if (!poId || !grId || !billId) {
      toast.error('Please select PO, GR, and Bill');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/purchase-orders/match', {
        po_id: parseInt(poId),
        gr_id: parseInt(grId),
        bill_id: parseInt(billId),
      });
      toast.success(`Match result: ${response.data.match_status}`);
      fetchMatches();
      setPoId('');
      setGrId('');
      setBillId('');
      setViewMatches(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Match failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'matched':
        return { color: 'bg-green-100 text-green-800', icon: '✅' };
      case 'variance':
        return { color: 'bg-red-100 text-red-800', icon: '⚠️' };
      case 'partial':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '📄' };
    }
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) < 1) return 'text-green-600';
    if (Math.abs(variance) < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalMatched = matches.filter(m => m.match_status === 'matched').length;
  const totalVariance = matches.filter(m => m.match_status === 'variance').length;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">3-Way Match</h2>
        <p className="text-gray-500 mt-1 text-sm">Match Purchase Orders → Goods Receipts → Bills</p>
      </div>

      {/* Summary Cards - Mobile Only */}
      <div className="lg:hidden grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-lg font-bold text-blue-900">{matches.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Matched</p>
          <p className="text-lg font-bold text-green-600">{totalMatched}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Variance</p>
          <p className="text-lg font-bold text-red-600">{totalVariance}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        <button 
          onClick={() => setViewMatches(true)} 
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            viewMatches 
              ? 'bg-white text-blue-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📋 Match History ({matches.length})
        </button>
        <button 
          onClick={() => setViewMatches(false)} 
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            !viewMatches 
              ? 'bg-white text-blue-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🔗 New Match
        </button>
      </div>

      {viewMatches ? (
        /* Match History */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 lg:px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Match History</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">
              {matches.length} records
            </span>
          </div>
          
          {matches.length === 0 ? (
            <div className="p-8 lg:p-12 text-center">
              <span className="text-4xl mb-3 block">🔗</span>
              <p className="text-gray-500 font-medium">No match records yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first 3-way match to see history</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">PO</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">PO Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Bill Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Variance</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {matches.map((m: MatchRecord) => {
                      const statusBadge = getStatusBadge(m.match_status);
                      return (
                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-blue-900">{m.po_number}</td>
                          <td className="px-4 py-3 text-gray-800">{m.supplier_name}</td>
                          <td className="px-4 py-3 text-right">₦{Number(m.po_amount).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">₦{Number(m.bill_amount).toLocaleString()}</td>
                          <td className={`px-4 py-3 text-right font-medium ${getVarianceColor(m.variance)}`}>
                            {m.variance >= 0 ? '+' : ''}₦{Number(m.variance).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusBadge.color}`}>
                              {statusBadge.icon} {m.match_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100">
                {matches.map((m: MatchRecord) => {
                  const statusBadge = getStatusBadge(m.match_status);
                  const variancePercent = m.po_amount > 0 ? ((m.variance / m.po_amount) * 100) : 0;
                  
                  return (
                    <div
                      key={m.id}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedMatch(selectedMatch?.id === m.id ? null : m)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            m.match_status === 'matched' ? 'bg-green-100' :
                            m.match_status === 'variance' ? 'bg-red-100' : 'bg-yellow-100'
                          }`}>
                            {statusBadge.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{m.supplier_name}</h4>
                            <p className="text-xs text-blue-600 font-medium">{m.po_number}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${statusBadge.color}`}>
                          {m.match_status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">PO</p>
                          <p className="font-medium">₦{Number(m.po_amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Bill</p>
                          <p className="font-medium">₦{Number(m.bill_amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Variance</p>
                          <p className={`font-bold ${getVarianceColor(m.variance)}`}>
                            {m.variance >= 0 ? '+' : ''}₦{Number(m.variance).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Variance Bar */}
                      {m.po_amount > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                Math.abs(variancePercent) < 1 ? 'bg-green-500' :
                                Math.abs(variancePercent) < 5 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(Math.abs(variancePercent) * 10, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Variance: {variancePercent.toFixed(2)}%
                          </p>
                        </div>
                      )}

                      {/* Expandable Details */}
                      {selectedMatch?.id === m.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">PO Number</span>
                            <span className="font-medium text-blue-900">{m.po_number}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Supplier</span>
                            <span className="font-medium">{m.supplier_name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">PO Amount</span>
                            <span className="font-medium">₦{Number(m.po_amount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Bill Amount</span>
                            <span className="font-medium">₦{Number(m.bill_amount).toLocaleString()}</span>
                          </div>
                          {m.gr_amount && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">GR Amount</span>
                              <span className="font-medium">₦{Number(m.gr_amount).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Variance</span>
                            <span className={`font-bold ${getVarianceColor(m.variance)}`}>
                              {m.variance >= 0 ? '+' : ''}₦{Number(m.variance).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusBadge.color}`}>
                              {m.match_status}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Expand Indicator */}
                      <div className="flex justify-center mt-2">
                        <svg 
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            selectedMatch?.id === m.id ? 'rotate-180' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        /* New Match Form */
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 max-w-lg mx-auto">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🔗</span>
            <span>Create New Match</span>
          </h3>
          
          <div className="space-y-4">
            {/* Purchase Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Purchase Order <span className="text-red-500">*</span>
              </label>
              <select 
                value={poId} 
                onChange={e => setPoId(e.target.value)} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         appearance-none bg-white"
              >
                <option value="">Select purchase order...</option>
                {pos.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.po_number} — {p.supplier_name} (₦{Number(p.total).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Goods Receipt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Goods Receipt <span className="text-red-500">*</span>
              </label>
              {grs.length > 0 ? (
                <select 
                  value={grId} 
                  onChange={e => setGrId(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           appearance-none bg-white"
                >
                  <option value="">Select goods receipt...</option>
                  {grs.map((gr: any) => (
                    <option key={gr.id} value={gr.id}>{gr.gr_number || `GR #${gr.id}`}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  value={grId} 
                  onChange={e => setGrId(e.target.value)} 
                  placeholder="Enter Goods Receipt ID"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>

            {/* Supplier Bill */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Supplier Bill <span className="text-red-500">*</span>
              </label>
              <select 
                value={billId} 
                onChange={e => setBillId(e.target.value)} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         appearance-none bg-white"
              >
                <option value="">Select supplier bill...</option>
                {bills.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.bill_number} — {b.supplier_name} (₦{Number(b.total).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Match Button */}
            <button 
              onClick={handleMatch} 
              disabled={loading || !poId || !grId || !billId} 
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold 
                       hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running Match...
                </span>
              ) : (
                '🔗 Run 3-Way Match'
              )}
            </button>

            {/* Info Box */}
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">3-Way Match:</span> Compares Purchase Order amount with Goods Receipt and Supplier Bill to identify any variances.
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ThreeWayMatch;