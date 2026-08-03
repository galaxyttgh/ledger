// import { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { PDFDownloadLink } from '@react-pdf/renderer';
// import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
// import { Text } from '@react-pdf/renderer';

// const SupplierStatement = () => {
//   const [searchParams] = useSearchParams();
//   const supplierId = searchParams.get('id') || '';
//   const [data, setData] = useState<any>(null);
//   const [suppliers, setSuppliers] = useState<any[]>([]);
//   const [selectedId, setSelectedId] = useState(supplierId);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => { fetchSuppliers(); }, []);
//   useEffect(() => { if (selectedId) fetchStatement(); }, [selectedId]);

//   const fetchSuppliers = async () => {
//     const response = await api.get('/suppliers');
//     setSuppliers(response.data);
//   };

//   const fetchStatement = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get(`/reports/supplier-statement/${selectedId}`);
//       setData(response.data);
//     } catch (error) {
//       console.error('Failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const runningBalance = data?.transactions.reduce((bal: number, t: any) => {
//     return t.type === 'bill' ? bal + Number(t.total) : bal - Number(t.total);
//   }, 0) || 0;

//   const StatementPDF = ({ data }: { data: any }) => (
//     <ReportPDF title="Supplier Statement" subtitle={data.supplier.name}>
//       <PDFRow label="Supplier" value={data.supplier.name} />
//       <PDFRow label="Balance" value={`NGN ${Number(data.supplier.current_balance).toLocaleString()}`} />
//       <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Transactions</Text>
//       {data.transactions.map((t: any, i: number) => (
//         <PDFRow key={i} label={`${t.bill_number || t.payment_number} (${t.type})`} value={`NGN ${Number(t.total || t.amount).toLocaleString()}`} />
//       ))}
//       <PDFTotal label="Outstanding Balance" value={`NGN ${runningBalance.toLocaleString()}`} />
//     </ReportPDF>
//   );

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Supplier Statement</h2>
//           <p className="text-gray-500 mt-1">Statement of account</p>
//         </div>
//         <div className="flex gap-2 no-print">
//           <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">🖨️ Print</button>
//           {data && (
//             <PDFDownloadLink document={<StatementPDF data={data} />} fileName={`Statement_${data.supplier.name}.pdf`} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
//               📄 Export PDF
//             </PDFDownloadLink>
//           )}
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
//         <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="px-4 py-2 border rounded-lg">
//           <option value="">Select supplier...</option>
//           {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
//         </select>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : data ? (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-2xl mx-auto">
//           <div className="px-6 py-4 bg-blue-900 text-white">
//             <h3 className="text-lg font-bold">{data.supplier.name}</h3>
//             <p className="text-sm opacity-80">Balance: ₦{Number(data.supplier.current_balance).toLocaleString()}</p>
//           </div>
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-2 text-left">Date</th>
//                 <th className="px-4 py-2 text-left">Reference</th>
//                 <th className="px-4 py-2 text-left">Type</th>
//                 <th className="px-4 py-2 text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {data.transactions.map((t: any, i: number) => (
//                 <tr key={i}>
//                   <td className="px-4 py-2">{new Date(t.bill_date || t.payment_date).toLocaleDateString()}</td>
//                   <td className="px-4 py-2">{t.bill_number || t.payment_number}</td>
//                   <td className="px-4 py-2 capitalize">{t.type}</td>
//                   <td className={`px-4 py-2 text-right font-medium ${t.type === 'bill' ? 'text-red-600' : 'text-green-600'}`}>
//                     {t.type === 'bill' ? '-' : '+'}₦{Number(t.total || t.amount).toLocaleString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//             <tfoot className="bg-gray-50 font-bold">
//               <tr>
//                 <td colSpan={3} className="px-4 py-3 text-right">Outstanding Balance:</td>
//                 <td className="px-4 py-3 text-right">₦{runningBalance.toLocaleString()}</td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       ) : null}
//     </Layout>
//   );
// };

// export default SupplierStatement;

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
import { Text } from '@react-pdf/renderer';
import toast from 'react-hot-toast';

const SupplierStatement = () => {
  const [searchParams] = useSearchParams();
  const supplierId = searchParams.get('id') || '';
  const [data, setData] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(supplierId);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  useEffect(() => { fetchSuppliers(); }, []);
  useEffect(() => { if (selectedId) fetchStatement(); }, [selectedId]);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
      if (supplierId && !selectedId) {
        setSelectedId(supplierId);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      toast.error('Failed to load suppliers');
    }
  };

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/supplier-statement/${selectedId}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed:', error);
      toast.error('Failed to load statement');
    } finally {
      setLoading(false);
    }
  };

  const selectedSupplier = suppliers.find(s => s.id.toString() === selectedId);

  const runningBalance = data?.transactions.reduce((bal: number, t: any) => {
    return t.type === 'bill' ? bal + Number(t.total || t.amount) : bal - Number(t.total || t.amount);
  }, 0) || 0;

  const totalBills = data?.transactions
    .filter((t: any) => t.type === 'bill')
    .reduce((sum: number, t: any) => sum + Number(t.total || t.amount), 0) || 0;

  const totalPayments = data?.transactions
    .filter((t: any) => t.type === 'payment')
    .reduce((sum: number, t: any) => sum + Number(t.total || t.amount), 0) || 0;

  const transactionCount = data?.transactions.length || 0;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'bill': return '💳';
      case 'payment': return '💰';
      case 'debit_note': return '📝';
      default: return '📄';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'bill': return 'text-red-600 bg-red-50 border-red-200';
      case 'payment': return 'text-green-600 bg-green-50 border-green-200';
      case 'debit_note': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const StatementPDF = ({ data }: { data: any }) => (
    <ReportPDF title="Supplier Statement" subtitle={data.supplier.name}>
      <PDFRow label="Supplier" value={data.supplier.name} />
      <PDFRow label="Balance" value={`NGN ${Number(data.supplier.current_balance).toLocaleString()}`} />
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Transactions</Text>
      {data.transactions.map((t: any, i: number) => (
        <PDFRow key={i} label={`${t.bill_number || t.payment_number} (${t.type})`} value={`NGN ${Number(t.total || t.amount).toLocaleString()}`} />
      ))}
      <PDFTotal label="Outstanding Balance" value={`NGN ${runningBalance.toLocaleString()}`} />
    </ReportPDF>
  );

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Supplier Statement</h2>
            <p className="text-gray-500 mt-1 text-sm">Statement of account</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 no-print">
            <button 
              onClick={() => window.print()} 
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 
                       active:bg-gray-800 transition-colors text-sm font-medium"
            >
              🖨️ Print
            </button>
            {data && (
              <PDFDownloadLink 
                document={<StatementPDF data={data} />} 
                fileName={`Statement_${data.supplier.name}.pdf`} 
                className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 
                         active:bg-red-800 transition-colors text-sm font-medium text-center"
              >
                📄 Export PDF
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Supplier</label>
        <select 
          value={selectedId} 
          onChange={(e) => setSelectedId(e.target.value)} 
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   appearance-none bg-white"
        >
          <option value="">Select supplier...</option>
          {suppliers.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.code ? `${s.code} - ` : ''}{s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-blue-900 text-white animate-pulse">
              <div className="h-6 bg-blue-800 rounded w-48 mb-2"></div>
              <div className="h-4 bg-blue-800 rounded w-36"></div>
            </div>
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : data ? (
        <div className="max-w-2xl mx-auto">
          {/* Supplier Info Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
            <div className="px-4 lg:px-6 py-4 lg:py-5 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold">{data.supplier.name}</h3>
                  {data.supplier.code && (
                    <p className="text-sm opacity-80 mt-0.5">{data.supplier.code}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">Current Balance</p>
                  <p className="text-lg font-bold">
                    ₦{Number(data.supplier.current_balance).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 p-4">
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <p className="text-xs text-red-600 font-medium">Bills</p>
                <p className="text-sm font-bold text-red-900">₦{totalBills.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <p className="text-xs text-green-600 font-medium">Payments</p>
                <p className="text-sm font-bold text-green-900">₦{totalPayments.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-xs text-blue-600 font-medium">Transactions</p>
                <p className="text-sm font-bold text-blue-900">{transactionCount}</p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 lg:px-6 py-3 border-b border-gray-100">
              <h4 className="font-semibold text-gray-700">Transactions</h4>
            </div>

            {data.transactions.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-3xl mb-2 block">📭</span>
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Reference</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.transactions.map((t: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(t.bill_date || t.payment_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-blue-900">
                            {t.bill_number || t.payment_number}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded-full font-medium capitalize bg-gray-100 text-gray-800">
                              {getTransactionIcon(t.type)} {t.type}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${
                            t.type === 'bill' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {t.type === 'bill' ? '-' : '+'}₦{Number(t.total || t.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-sm">Outstanding Balance:</td>
                        <td className={`px-4 py-3 text-right text-sm ${
                          runningBalance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ₦{Math.abs(runningBalance).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-100">
                  {data.transactions.map((t: any, i: number) => (
                    <div
                      key={i}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${
                        t.type === 'bill' ? 'border-l-red-500' : 'border-l-green-500'
                      }`}
                      onClick={() => setSelectedTransaction(selectedTransaction === t ? null : t)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border ${
                            getTransactionColor(t.type)
                          }`}>
                            {getTransactionIcon(t.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm capitalize">{t.type}</h4>
                            <p className="text-xs text-blue-600 font-medium">
                              {t.bill_number || t.payment_number}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ml-2 flex-shrink-0 ${
                          t.type === 'bill' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {t.type === 'bill' ? '-' : '+'}₦{Number(t.total || t.amount).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(t.bill_date || t.payment_date).toLocaleDateString()}</span>
                        <span className="capitalize">{t.type}</span>
                      </div>

                      {/* Expandable Details */}
                      {selectedTransaction === t && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Date</span>
                            <span className="font-medium">
                              {new Date(t.bill_date || t.payment_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Reference</span>
                            <span className="font-medium text-blue-900">
                              {t.bill_number || t.payment_number}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Type</span>
                            <span className="px-2 py-0.5 text-xs rounded-full font-medium capitalize bg-gray-100 text-gray-800">
                              {t.type}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount</span>
                            <span className={`font-bold ${
                              t.type === 'bill' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {t.type === 'bill' ? '-' : '+'}₦{Number(t.total || t.amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Expand Indicator */}
                      <div className="flex justify-center mt-2">
                        <svg 
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            selectedTransaction === t ? 'rotate-180' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Outstanding Balance - Mobile */}
                <div className="lg:hidden p-4 bg-gray-50 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Outstanding Balance</span>
                    <span className={`text-lg font-bold ${
                      runningBalance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ₦{Math.abs(runningBalance).toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : selectedId ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
            <span className="text-4xl mb-3 block">📊</span>
            <p className="text-gray-500 font-medium">No statement data available</p>
            <p className="text-gray-400 text-sm mt-1">Try selecting a different supplier</p>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
            <span className="text-4xl mb-3 block">👆</span>
            <p className="text-gray-500 font-medium">Select a supplier</p>
            <p className="text-gray-400 text-sm mt-1">Choose a supplier to view their statement</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SupplierStatement;