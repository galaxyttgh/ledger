// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// const Collections = () => {
//   const [overdue, setOverdue] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
//   const [notes, setNotes] = useState<any[]>([]);
//   const [newNote, setNewNote] = useState('');
//   const [contactMethod, setContactMethod] = useState('phone');
//   const [followUpDate, setFollowUpDate] = useState('');
//   const [saving, setSaving] = useState(false);

//   useEffect(() => { fetchOverdue(); }, []);

//   const fetchOverdue = async () => {
//     try {
//       const response = await api.get('/collections/overdue');
//       setOverdue(response.data);
//     } catch (error) {
//       toast.error('Failed to load overdue invoices');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchNotes = async (invoiceId: number) => {
//     try {
//       const response = await api.get(`/collections/invoice/${invoiceId}`);
//       setNotes(response.data);
//     } catch (error) {
//       console.error('Failed to fetch notes');
//     }
//   };

//   const handleAddNote = async () => {
//     if (!newNote.trim() || !selectedInvoice) return;
//     setSaving(true);
//     try {
//       await api.post('/collections', {
//         invoice_id: selectedInvoice.id,
//         customer_id: selectedInvoice.customer_id,
//         contact_date: new Date().toISOString().split('T')[0],
//         contact_method: contactMethod,
//         notes: newNote,
//         follow_up_date: followUpDate || null,
//       });
//       toast.success('Note added');
//       setNewNote('');
//       fetchNotes(selectedInvoice.id);
//       fetchOverdue();
//     } catch (error) {
//       toast.error('Failed to add note');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Collection Notes</h2>
//         <p className="text-gray-500 mt-1 text-sm">Track follow-ups on overdue invoices</p>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : overdue.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
//           ✅ No overdue invoices. Great job!
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Overdue List */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="px-6 py-4 bg-red-50 border-b">
//               <h3 className="font-semibold text-gray-700">⚠️ Overdue Invoices ({overdue.length})</h3>
//             </div>
//             <div className="divide-y">
//               {overdue.map((inv) => (
//                 <div
//                   key={inv.id}
//                   onClick={() => { setSelectedInvoice(inv); fetchNotes(inv.id); }}
//                   className={`p-4 cursor-pointer hover:bg-gray-50 transition ${selectedInvoice?.id === inv.id ? 'bg-blue-50' : ''}`}
//                 >
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <p className="font-medium text-gray-800">{inv.customer_name}</p>
//                       <p className="text-sm text-gray-500">{inv.invoice_number} — ₦{Number(inv.total).toLocaleString()}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm text-red-600 font-medium">
//                         {Math.ceil((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue
//                       </p>
//                       <p className="text-xs text-gray-400">{inv.follow_up_count} follow-ups</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Notes Panel */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b">
//               <h3 className="font-semibold text-gray-700">
//                 {selectedInvoice ? `Notes — ${selectedInvoice.invoice_number}` : 'Select an invoice'}
//               </h3>
//             </div>
//             {selectedInvoice ? (
//               <div className="p-4">
//                 {/* Add Note */}
//                 <div className="mb-4 space-y-3">
//                   <textarea
//                     value={newNote}
//                     onChange={(e) => setNewNote(e.target.value)}
//                     placeholder="Add collection note..."
//                     className="w-full px-3 py-2 border rounded-lg text-sm"
//                     rows={3}
//                   />
//                   <div className="flex gap-2">
//                     <select value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm">
//                       <option value="phone">📞 Phone</option>
//                       <option value="email">✉️ Email</option>
//                       <option value="visit">🏢 Visit</option>
//                       <option value="other">📝 Other</option>
//                     </select>
//                     <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Follow-up date" />
//                     <button onClick={handleAddNote} disabled={saving} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
//                       {saving ? 'Saving...' : 'Add'}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Notes List */}
//                 <div className="space-y-3">
//                   {notes.length === 0 ? (
//                     <p className="text-center text-gray-500 text-sm py-4">No notes yet</p>
//                   ) : (
//                     notes.map((note: any) => (
//                       <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
//                         <div className="flex justify-between items-start mb-1">
//                           <span className="text-xs font-medium text-gray-500">
//                             {note.created_by_name} • {new Date(note.created_at).toLocaleDateString()}
//                           </span>
//                           <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{note.contact_method}</span>
//                         </div>
//                         <p className="text-sm text-gray-800">{note.notes}</p>
//                         {note.follow_up_date && (
//                           <p className="text-xs text-orange-600 mt-1">📅 Follow-up: {new Date(note.follow_up_date).toLocaleDateString()}</p>
//                         )}
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="p-12 text-center text-gray-400">Select an overdue invoice to view notes</div>
//             )}
//           </div>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default Collections;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const Collections = () => {
  const [overdue, setOverdue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [contactMethod, setContactMethod] = useState('phone');
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'notes'>('list');
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => { fetchOverdue(); }, []);

  const fetchOverdue = async () => {
    try {
      const response = await api.get('/collections/overdue');
      setOverdue(response.data);
    } catch (error) {
      toast.error('Failed to load overdue invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (invoiceId: number) => {
    try {
      const response = await api.get(`/collections/invoice/${invoiceId}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes');
      toast.error('Failed to load notes');
    }
  };

  const handleSelectInvoice = (inv: any) => {
    setSelectedInvoice(inv);
    fetchNotes(inv.id);
    setActiveTab('notes');
    setShowAddNote(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedInvoice) return;
    setSaving(true);
    try {
      await api.post('/collections', {
        invoice_id: selectedInvoice.id,
        customer_id: selectedInvoice.customer_id,
        contact_date: new Date().toISOString().split('T')[0],
        contact_method: contactMethod,
        notes: newNote.trim(),
        follow_up_date: followUpDate || null,
      });
      toast.success('Collection note added');
      setNewNote('');
      setFollowUpDate('');
      setShowAddNote(false);
      fetchNotes(selectedInvoice.id);
      fetchOverdue();
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const getContactIcon = (method: string) => {
    const icons: Record<string, string> = {
      phone: '📞',
      email: '✉️',
      visit: '🏢',
      other: '📝',
    };
    return icons[method] || '📝';
  };

  const getDaysOverdueColor = (days: number) => {
    if (days > 60) return 'text-red-700 bg-red-100';
    if (days > 30) return 'text-orange-700 bg-orange-100';
    return 'text-yellow-700 bg-yellow-100';
  };

  const totalOverdue = overdue.reduce((sum, inv) => sum + Number(inv.total), 0);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Collection Notes</h2>
        <p className="text-gray-500 mt-1 text-sm">Track follow-ups on overdue invoices</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 mb-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : overdue.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
          <span className="text-4xl mb-3 block">✅</span>
          <p className="text-gray-500 font-medium">No overdue invoices</p>
          <p className="text-gray-400 text-sm mt-1">Great job! All invoices are up to date.</p>
        </div>
      ) : (
        <>
          {/* Summary Card - Mobile Only */}
          <div className="lg:hidden bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg p-4 mb-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-xs">Overdue Invoices</p>
                <p className="text-2xl font-bold">{overdue.length}</p>
              </div>
              <div className="text-right">
                <p className="text-red-200 text-xs">Total Outstanding</p>
                <p className="text-xl font-bold">₦{totalOverdue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-red-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 Overdue ({overdue.length})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notes'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              disabled={!selectedInvoice}
            >
              📝 Notes {selectedInvoice ? `(${notes.length})` : ''}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overdue List */}
            <div className={`${activeTab === 'notes' ? 'hidden lg:block' : ''}`}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 lg:px-6 py-4 bg-red-50 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">⚠️ Overdue Invoices</h3>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-medium">
                    {overdue.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                  {overdue.map((inv) => {
                    const daysOverdue = Math.ceil((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
                    const daysColor = getDaysOverdueColor(daysOverdue);
                    
                    return (
                      <div
                        key={inv.id}
                        onClick={() => handleSelectInvoice(inv)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedInvoice?.id === inv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{inv.customer_name}</h4>
                            <p className="text-xs text-blue-600 font-medium mt-0.5">{inv.invoice_number}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${daysColor}`}>
                            {daysOverdue}d
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-800">
                            ₦{Number(inv.total).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{inv.follow_up_count || 0} follow-ups</span>
                            {inv.last_contact_date && (
                              <>
                                <span>•</span>
                                <span>Last: {new Date(inv.last_contact_date).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Due Date */}
                        <p className="text-xs text-gray-400 mt-1">
                          Due: {new Date(inv.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notes Panel */}
            <div className={`${activeTab === 'list' ? 'hidden lg:block' : ''}`}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 lg:px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">
                    {selectedInvoice ? (
                      <span>
                        Notes — <span className="text-blue-900">{selectedInvoice.invoice_number}</span>
                      </span>
                    ) : (
                      'Select an invoice'
                    )}
                  </h3>
                  {selectedInvoice && (
                    <button
                      onClick={() => setActiveTab('list')}
                      className="lg:hidden text-xs text-blue-600 hover:underline"
                    >
                      ← Back to list
                    </button>
                  )}
                </div>

                {selectedInvoice ? (
                  <div className="p-4">
                    {/* Selected Invoice Summary - Mobile */}
                    <div className="lg:hidden p-3 bg-blue-50 rounded-xl mb-4">
                      <p className="font-medium text-gray-800 text-sm">{selectedInvoice.customer_name}</p>
                      <p className="text-xs text-blue-600">{selectedInvoice.invoice_number}</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">
                        ₦{Number(selectedInvoice.total).toLocaleString()}
                      </p>
                    </div>

                    {/* Add Note Toggle - Mobile */}
                    <div className="lg:hidden mb-4">
                      <button
                        onClick={() => setShowAddNote(!showAddNote)}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium
                                 hover:bg-blue-700 active:bg-blue-800 transition-colors"
                      >
                        {showAddNote ? '✕ Close' : '+ Add Collection Note'}
                      </button>
                    </div>

                    {/* Add Note Form */}
                    <div className={`${showAddNote ? 'block' : 'hidden lg:block'} mb-4 space-y-3`}>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add collection note..."
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={3}
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select 
                          value={contactMethod} 
                          onChange={(e) => setContactMethod(e.target.value)} 
                          className="px-3 py-2 border border-gray-300 rounded-xl text-sm
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                          <option value="phone">📞 Phone</option>
                          <option value="email">✉️ Email</option>
                          <option value="visit">🏢 Visit</option>
                          <option value="other">📝 Other</option>
                        </select>
                        <input 
                          type="date" 
                          value={followUpDate} 
                          onChange={(e) => setFollowUpDate(e.target.value)} 
                          className="px-3 py-2 border border-gray-300 rounded-xl text-sm
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Follow-up date" 
                        />
                        <button 
                          onClick={handleAddNote} 
                          disabled={saving || !newNote.trim()} 
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium
                                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                                   transition-colors whitespace-nowrap"
                        >
                          {saving ? (
                            <span className="flex items-center gap-1">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            'Add Note'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                      {notes.length === 0 ? (
                        <div className="text-center py-8">
                          <span className="text-3xl mb-2 block">📝</span>
                          <p className="text-gray-500 text-sm">No collection notes yet</p>
                          <p className="text-gray-400 text-xs mt-1">Add your first follow-up note</p>
                        </div>
                      ) : (
                        notes.map((note: any) => (
                          <div key={note.id} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-xs font-medium text-gray-700">
                                  {note.created_by_name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(note.created_at).toLocaleDateString()} at{' '}
                                  {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium flex-shrink-0">
                                {getContactIcon(note.contact_method)} {note.contact_method}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{note.notes}</p>
                            {note.follow_up_date && (
                              <div className="mt-2 flex items-center gap-1 text-xs">
                                <span>📅</span>
                                <span className="text-orange-600 font-medium">
                                  Follow-up: {new Date(note.follow_up_date).toLocaleDateString()}
                                </span>
                                {new Date(note.follow_up_date) < new Date() && (
                                  <span className="text-red-500 font-medium">(Overdue)</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 lg:p-12 text-center">
                    <span className="text-3xl mb-2 block">👈</span>
                    <p className="text-gray-400 text-sm">Select an overdue invoice to view and add collection notes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Collections;