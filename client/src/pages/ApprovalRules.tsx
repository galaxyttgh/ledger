// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// interface ApprovalRule {
//   id: number;
//   transaction_type: string;
//   min_amount: number;
//   approver_role: string;
//   priority: number;
//   is_active: boolean;
// }

// const ApprovalRules = () => {
//   const [rules, setRules] = useState<ApprovalRule[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     fetchRules();
//   }, []);

//   const fetchRules = async () => {
//     try {
//       const response = await api.get('/approvals/rules');
//       setRules(response.data);
//     } catch (error) {
//       console.error('Failed to fetch rules:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Approval Rules</h2>
//         <p className="text-gray-500 mt-1">Configure maker-checker routing</p>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction Type</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Amount (₦)</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approver Role</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {rules.map((rule) => (
//                 <tr key={rule.id}>
//                   <td className="px-6 py-4 text-sm font-medium capitalize">{rule.transaction_type}</td>
//                   <td className="px-6 py-4 text-sm">₦{Number(rule.min_amount).toLocaleString()}</td>
//                   <td className="px-6 py-4 text-sm capitalize">{rule.approver_role}</td>
//                   <td className="px-6 py-4 text-sm">{rule.priority}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 text-xs rounded-full ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
//                       {rule.is_active ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default ApprovalRules;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface ApprovalRule {
  id: number;
  transaction_type: string;
  min_amount: number;
  approver_role: string;
  priority: number;
  is_active: boolean;
}

const ApprovalRules = () => {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedRule, setSelectedRule] = useState<ApprovalRule | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'amount' | 'type'>('priority');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await api.get('/approvals/rules');
      setRules(response.data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules
    .filter(rule => {
      if (filterActive === 'active') return rule.is_active;
      if (filterActive === 'inactive') return !rule.is_active;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return a.priority - b.priority;
      if (sortBy === 'amount') return a.min_amount - b.min_amount;
      return a.transaction_type.localeCompare(b.transaction_type);
    });

  const activeCount = rules.filter(r => r.is_active).length;
  const inactiveCount = rules.filter(r => !r.is_active).length;

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, string> = {
      invoice: '🧾',
      bill: '💳',
      payment: '💸',
      receipt: '💰',
      journal: '📒',
    };
    return icons[type.toLowerCase()] || '📋';
  };

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return { color: 'bg-red-100 text-red-800', label: '1st' };
    if (priority === 2) return { color: 'bg-orange-100 text-orange-800', label: '2nd' };
    return { color: 'bg-blue-100 text-blue-800', label: `${priority}th` };
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Approval Rules</h2>
            <p className="text-gray-500 mt-1 text-sm">Configure maker-checker routing</p>
          </div>
          
          {/* Add Rule Button */}
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl 
                           hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium shadow-sm w-full sm:w-auto">
            <span>+</span>
            <span>Add Rule</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {/* Summary Skeleton */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-3 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-16 mb-2 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
          
          {/* Rules Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => setFilterActive('all')}
              className={`bg-white rounded-xl shadow-sm p-3 text-center transition-all hover:shadow-md ${
                filterActive === 'all' ? 'ring-2 ring-blue-500 shadow-md' : ''
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">All Rules</p>
              <p className="text-xl lg:text-2xl font-bold text-blue-600">{rules.length}</p>
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`bg-white rounded-xl shadow-sm p-3 text-center transition-all hover:shadow-md ${
                filterActive === 'active' ? 'ring-2 ring-green-500 shadow-md' : ''
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">Active</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">{activeCount}</p>
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`bg-white rounded-xl shadow-sm p-3 text-center transition-all hover:shadow-md ${
                filterActive === 'inactive' ? 'ring-2 ring-gray-500 shadow-md' : ''
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">Inactive</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-600">{inactiveCount}</p>
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 lg:pb-0">
            {[
              { value: 'priority', label: 'By Priority' },
              { value: 'amount', label: 'By Amount' },
              { value: 'type', label: 'By Type' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as typeof sortBy)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  sortBy === option.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Transaction Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Min Amount (₦)</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Approver Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No rules found
                      </td>
                    </tr>
                  ) : (
                    filteredRules.map((rule) => {
                      const priorityBadge = getPriorityBadge(rule.priority);
                      return (
                        <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{getTransactionIcon(rule.transaction_type)}</span>
                              <span className="text-sm font-medium capitalize">{rule.transaction_type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            ₦{Number(rule.min_amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm capitalize">{rule.approver_role}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${priorityBadge.color}`}>
                              {priorityBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredRules.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <span className="text-3xl mb-2 block">📋</span>
                <p className="text-gray-500">No rules found</p>
                {filterActive !== 'all' && (
                  <button 
                    onClick={() => setFilterActive('all')}
                    className="mt-2 text-blue-600 text-sm font-medium hover:underline"
                  >
                    Show all rules
                  </button>
                )}
              </div>
            ) : (
              filteredRules.map((rule) => {
                const priorityBadge = getPriorityBadge(rule.priority);
                const isExpanded = selectedRule?.id === rule.id;
                
                return (
                  <div
                    key={rule.id}
                    className={`bg-white rounded-xl shadow-sm border transition-all ${
                      rule.is_active ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'
                    } ${isExpanded ? 'shadow-md' : ''}`}
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setSelectedRule(isExpanded ? null : rule)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                            {getTransactionIcon(rule.transaction_type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm capitalize">
                              {rule.transaction_type}
                            </h4>
                            <p className="text-xs text-gray-500 capitalize">{rule.approver_role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${priorityBadge.color}`}>
                            {priorityBadge.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Min Amount</p>
                          <p className="text-sm font-semibold text-gray-800">
                            ₦{Number(rule.min_amount).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Priority</p>
                          <p className="text-sm font-semibold text-gray-800">
                            Level {rule.priority}
                          </p>
                        </div>
                      </div>

                      {/* Expand/Collapse Indicator */}
                      <div className="flex justify-center mt-3">
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 animate-fadeIn">
                        <div className="pt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Transaction Type</span>
                            <span className="font-medium capitalize">{rule.transaction_type}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Approver Role</span>
                            <span className="font-medium capitalize">{rule.approver_role}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Min Amount</span>
                            <span className="font-medium">₦{Number(rule.min_amount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Priority Level</span>
                            <span className="font-medium">{rule.priority}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status</span>
                            <span className={`font-medium ${rule.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="flex gap-2 pt-3">
                            <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
                              Edit Rule
                            </button>
                            <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                              {rule.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Results Count */}
          {filteredRules.length > 0 && (
            <div className="mt-4 text-center lg:text-left">
              <p className="text-sm text-gray-500">
                Showing {filteredRules.length} of {rules.length} rules
                {filterActive !== 'all' && (
                  <button 
                    onClick={() => setFilterActive('all')}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default ApprovalRules;