// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface AuditLog {
//   id: number;
//   user_name: string;
//   action: string;
//   table_name: string;
//   record_id: number;
//   old_values: any;
//   new_values: any;
//   created_at: string;
// }

// const AuditTrail = () => {
//   const [logs, setLogs] = useState<AuditLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [actionFilter, setActionFilter] = useState('');
//   const [tableFilter, setTableFilter] = useState('');

//   useEffect(() => { fetchLogs(); }, [actionFilter, tableFilter]);

//   const fetchLogs = async () => {
//     setLoading(true);
//     try {
//       const params: any = { limit: 100 };
//       if (actionFilter) params.action = actionFilter;
//       if (tableFilter) params.table_name = tableFilter;
//       const response = await api.get('/audit-log', { params });
//       setLogs(response.data);
//     } catch (error) {
//       console.error('Failed to fetch audit logs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtered = logs.filter(log =>
//     log.user_name?.toLowerCase().includes(search.toLowerCase()) ||
//     log.action?.toLowerCase().includes(search.toLowerCase()) ||
//     log.table_name?.toLowerCase().includes(search.toLowerCase())
//   );

//   const getActionBadge = (action: string) => {
//     const colors: Record<string, string> = {
//       LOGIN: 'bg-blue-100 text-blue-800',
//       CREATE: 'bg-green-100 text-green-800',
//       UPDATE: 'bg-yellow-100 text-yellow-800',
//       DELETE: 'bg-red-100 text-red-800',
//       UPLOAD: 'bg-purple-100 text-purple-800',
//       APPROVE: 'bg-teal-100 text-teal-800',
//       CERTIFY_RECONCILIATION: 'bg-indigo-100 text-indigo-800',
//     };
//     return colors[action] || 'bg-gray-100 text-gray-800';
//   };

//   return (
//     <Layout>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Audit Trail</h2>
//         <p className="text-gray-500 mt-1">All system actions are logged and immutable</p>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <input
//             type="text"
//             placeholder="🔍 Search..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
//             <option value="">All Actions</option>
//             <option value="LOGIN">Login</option>
//             <option value="CREATE">Create</option>
//             <option value="UPDATE">Update</option>
//             <option value="DELETE">Delete</option>
//             <option value="UPLOAD">Upload</option>
//             <option value="APPROVE">Approve</option>
//           </select>
//           <select value={tableFilter} onChange={(e) => setTableFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
//             <option value="">All Tables</option>
//             <option value="journal_entries">Journal Entries</option>
//             <option value="invoices">Invoices</option>
//             <option value="bills">Bills</option>
//             <option value="customers">Customers</option>
//             <option value="suppliers">Suppliers</option>
//             <option value="users">Users</option>
//           </select>
//           <div className="text-sm text-gray-500 self-center">
//             {filtered.length} records found
//           </div>
//         </div>
//       </div>

//       {/* Logs Table */}
//       {loading ? (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">Loading...</div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50 border-b">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date/Time</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Table</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Record ID</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {filtered.map((log) => (
//                 <tr key={log.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-3 text-gray-600">
//                     {new Date(log.created_at).toLocaleString()}
//                   </td>
//                   <td className="px-6 py-3 font-medium text-gray-800">{log.user_name || 'System'}</td>
//                   <td className="px-6 py-3">
//                     <span className={`px-2 py-1 text-xs rounded-full font-medium ${getActionBadge(log.action)}`}>
//                       {log.action}
//                     </span>
//                   </td>
//                   <td className="px-6 py-3 text-gray-600">{log.table_name || '-'}</td>
//                   <td className="px-6 py-3 text-gray-600">#{log.record_id || '-'}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default AuditTrail;


import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface AuditLog {
  id: number;
  user_name: string;
  action: string;
  table_name: string;
  record_id: number;
  old_values: any;
  new_values: any;
  created_at: string;
}

const AuditTrail = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchLogs(); }, [actionFilter, tableFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (actionFilter) params.action = actionFilter;
      if (tableFilter) params.table_name = tableFilter;
      const response = await api.get('/audit-log', { params });
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(log =>
    log.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.table_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      LOGIN: 'bg-blue-100 text-blue-800',
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      UPLOAD: 'bg-purple-100 text-purple-800',
      APPROVE: 'bg-teal-100 text-teal-800',
      CERTIFY_RECONCILIATION: 'bg-indigo-100 text-indigo-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      LOGIN: '🔑',
      CREATE: '➕',
      UPDATE: '✏️',
      DELETE: '🗑️',
      UPLOAD: '📤',
      APPROVE: '✅',
      CERTIFY_RECONCILIATION: '📋',
    };
    return icons[action] || '📝';
  };

  const clearFilters = () => {
    setSearch('');
    setActionFilter('');
    setTableFilter('');
  };

  const hasActiveFilters = search || actionFilter || tableFilter;

  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Audit Trail</h2>
            <p className="text-gray-500 mt-1 text-sm">All system actions are logged and immutable</p>
          </div>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 
                     rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium"
          >
            <span>🔍</span>
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-white rounded-xl shadow-sm p-4 mb-6 transition-all ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Action Filter */}
          <select 
            value={actionFilter} 
            onChange={(e) => setActionFilter(e.target.value)} 
            className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="UPLOAD">Upload</option>
            <option value="APPROVE">Approve</option>
          </select>
          
          {/* Table Filter */}
          <select 
            value={tableFilter} 
            onChange={(e) => setTableFilter(e.target.value)} 
            className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Tables</option>
            <option value="journal_entries">Journal Entries</option>
            <option value="invoices">Invoices</option>
            <option value="bills">Bills</option>
            <option value="customers">Customers</option>
            <option value="suppliers">Suppliers</option>
            <option value="users">Users</option>
          </select>
          
          {/* Results Count & Clear */}
          <div className="flex items-center justify-between lg:justify-center gap-2">
            <span className="text-sm text-gray-500">
              {filtered.length} records
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Summary Pills - Mobile Only */}
      <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-2">
        {Object.entries(actionCounts).slice(0, 5).map(([action, count]) => (
          <button
            key={action}
            onClick={() => setActionFilter(actionFilter === action ? '' : action)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              actionFilter === action
                ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{getActionIcon(action)}</span>
            <span>{action}</span>
            <span className="bg-white px-1.5 py-0.5 rounded-full text-xs">{count}</span>
          </button>
        ))}
      </div>

      {/* Logs */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
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
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">📭</span>
          <p className="text-gray-500 font-medium">No audit logs found</p>
          <p className="text-gray-400 text-sm mt-1">
            {hasActiveFilters ? 'Try adjusting your filters' : 'System activity will appear here'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-blue-600 text-sm font-medium hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Record ID</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-600 text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800">{log.user_name || 'System'}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getActionBadge(log.action)}`}>
                        {getActionIcon(log.action)} {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs">{log.table_name || '-'}</td>
                    <td className="px-6 py-3 text-gray-600 text-xs">#{log.record_id || '-'}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        {selectedLog?.id === log.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-2">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-gray-100">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getActionBadge(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {log.user_name || 'System'} • {log.table_name || 'System'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {new Date(log.created_at).toLocaleDateString([], { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-gray-400">
                      Record #{log.record_id || '-'}
                    </span>
                  </div>

                  {/* Expandable Details */}
                  {selectedLog?.id === log.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date/Time</span>
                          <span className="font-medium text-gray-800">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">User</span>
                          <span className="font-medium text-gray-800">{log.user_name || 'System'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Action</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getActionBadge(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Table</span>
                          <span className="font-medium text-gray-800">{log.table_name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Record ID</span>
                          <span className="font-medium text-gray-800">#{log.record_id || '-'}</span>
                        </div>

                        {/* Changes Display */}
                        {(log.old_values || log.new_values) && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-700 mb-2">Changes:</p>
                            {log.old_values && (
                              <div className="mb-2">
                                <p className="text-xs text-red-600 mb-1">Previous Values:</p>
                                <pre className="text-xs bg-red-50 p-2 rounded-lg overflow-x-auto">
                                  {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.new_values && (
                              <div>
                                <p className="text-xs text-green-600 mb-1">New Values:</p>
                                <pre className="text-xs bg-green-50 p-2 rounded-lg overflow-x-auto">
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expand Indicator */}
                  <div className="flex justify-center mt-2">
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedLog?.id === log.id ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Results Summary */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 text-center lg:text-left">
          <p className="text-sm text-gray-500">
            Showing {filtered.length} of {logs.length} records
          </p>
        </div>
      )}
    </Layout>
  );
};

export default AuditTrail;
