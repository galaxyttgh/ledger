import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from '../components/DocumentUpload';

interface JournalEntry {
  id: number;
  entry_number: string;
  description: string;
  entry_date: string;
  period: string;
  status: string;
  created_by_name: string;
  lines: JournalLine[];
}

interface JournalLine {
  id: number;
  account_id: number;
  account_code: string;
  account_name: string;
  description: string;
  debit: number;
  credit: number;
}

const GeneralLedger = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/journals');
      setEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntryDetails = async (id: number) => {
    try {
      const response = await api.get(`/journals/${id}`);
      setSelectedEntry(response.data);
    } catch (error) {
      console.error('Failed to fetch entry details:', error);
    }
  };

  return (
    <Layout>

<div className="mb-6 flex justify-between items-center">
  <div>
    <h2 className="text-2xl font-bold text-gray-800">General Ledger</h2>
    <p className="text-gray-500 mt-1">Journal entries and transactions</p>
  </div>
  <button
    onClick={() => navigate('/general-ledger/new')}
    className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
  >
    + New Journal Entry
  </button>
</div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No journal entries found
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-900">{entry.entry_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{entry.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entry.period}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entry.created_by_name}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => fetchEntryDetails(entry.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Entry Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                {selectedEntry.entry_number} - {selectedEntry.description}
              </h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-2 font-medium">{new Date(selectedEntry.entry_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Period:</span>
                  <span className="ml-2 font-medium">{selectedEntry.period}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-medium capitalize">{selectedEntry.status}</span>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-500">Account</th>
                    <th className="px-4 py-2 text-left text-gray-500">Description</th>
                    <th className="px-4 py-2 text-right text-gray-500">Debit</th>
                    <th className="px-4 py-2 text-right text-gray-500">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedEntry.lines?.map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3">
                        <span className="font-medium">{line.account_code}</span>
                        <span className="text-gray-500 ml-2">{line.account_name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{line.description}</td>
                      <td className="px-4 py-3 text-right">
                        {line.debit > 0 ? `₦${Number(line.debit).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {line.credit > 0 ? `₦${Number(line.credit).toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-right">Totals:</td>
                    <td className="px-4 py-3 text-right">
                      ₦{selectedEntry.lines?.reduce((sum, l) => sum + Number(l.debit), 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ₦{selectedEntry.lines?.reduce((sum, l) => sum + Number(l.credit), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
                     <DocumentUpload transactionType="journal" transactionId={selectedEntry.id} />
              </table>
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
};

export default GeneralLedger;