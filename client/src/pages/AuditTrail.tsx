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

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Audit Trail</h2>
        <p className="text-gray-500 mt-1">All system actions are logged and immutable</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="🔍 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="UPLOAD">Upload</option>
            <option value="APPROVE">Approve</option>
          </select>
          <select value={tableFilter} onChange={(e) => setTableFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">All Tables</option>
            <option value="journal_entries">Journal Entries</option>
            <option value="invoices">Invoices</option>
            <option value="bills">Bills</option>
            <option value="customers">Customers</option>
            <option value="suppliers">Suppliers</option>
            <option value="users">Users</option>
          </select>
          <div className="text-sm text-gray-500 self-center">
            {filtered.length} records found
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Table</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Record ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-800">{log.user_name || 'System'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{log.table_name || '-'}</td>
                  <td className="px-6 py-3 text-gray-600">#{log.record_id || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default AuditTrail;