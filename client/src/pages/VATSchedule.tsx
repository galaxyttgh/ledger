// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { PDFDownloadLink } from '@react-pdf/renderer';
// import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
// import { Text } from '@react-pdf/renderer';

// const VATSchedule = () => {
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { fetchData(); }, []);

//   const fetchData = async () => {
//     try {
//       const response = await api.get('/reports/vat-schedule');
//       setData(response.data);
//     } catch (error) {
//       console.error('Failed to fetch VAT schedule:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const VATPDF = ({ data }: { data: any }) => (
//     <ReportPDF title="VAT Return Schedule" subtitle="July 2026">
//       <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>Output VAT (Collected)</Text>
//       <PDFRow label="VAT on Sales" value={`NGN ${data.outputVAT.toLocaleString()}`} />
//       <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>Input VAT (Paid)</Text>
//       <PDFRow label="VAT on Purchases" value={`NGN ${data.inputVAT.toLocaleString()}`} />
//       <PDFTotal label="Net VAT Payable" value={`NGN ${data.netVATPayable.toLocaleString()}`} />
//     </ReportPDF>
//   );

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">VAT Return Schedule</h2>
//           <p className="text-gray-500 mt-1">Output VAT vs Input VAT</p>
//         </div>
//         <div className="flex gap-2 no-print">
//           <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">🖨️ Print</button>
//           {data && (
//             <PDFDownloadLink document={<VATPDF data={data} />} fileName="VAT_Schedule.pdf" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
//               📄 Export PDF
//             </PDFDownloadLink>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : data ? (
//         <>
//           <div className="grid grid-cols-3 gap-4 mb-6">
//             <div className="bg-white rounded-xl shadow-sm p-4 text-center border-t-4 border-green-500">
//               <p className="text-sm text-gray-500">Output VAT (Collected)</p>
//               <p className="text-2xl font-bold text-green-600">₦{data.outputVAT.toLocaleString()}</p>
//             </div>
//             <div className="bg-white rounded-xl shadow-sm p-4 text-center border-t-4 border-red-500">
//               <p className="text-sm text-gray-500">Input VAT (Paid)</p>
//               <p className="text-2xl font-bold text-red-600">₦{data.inputVAT.toLocaleString()}</p>
//             </div>
//             <div className={`bg-white rounded-xl shadow-sm p-4 text-center border-t-4 ${data.netVATPayable >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
//               <p className="text-sm text-gray-500">Net VAT {data.netVATPayable >= 0 ? 'Payable' : 'Receivable'}</p>
//               <p className={`text-2xl font-bold ${data.netVATPayable >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
//                 ₦{Math.abs(data.netVATPayable).toLocaleString()}
//               </p>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-6">
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//               <div className="px-6 py-4 bg-green-50 border-b">
//                 <h3 className="font-semibold">Output VAT Transactions</h3>
//               </div>
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left">Invoice</th>
//                     <th className="px-4 py-2 text-right">Subtotal</th>
//                     <th className="px-4 py-2 text-right">VAT</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {data.outputDetails.map((d: any, i: number) => (
//                     <tr key={i}>
//                       <td className="px-4 py-2">{d.invoice_number}</td>
//                       <td className="px-4 py-2 text-right">₦{Number(d.subtotal).toLocaleString()}</td>
//                       <td className="px-4 py-2 text-right text-green-600">₦{Number(d.tax_amount).toLocaleString()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//               <div className="px-6 py-4 bg-red-50 border-b">
//                 <h3 className="font-semibold">Input VAT Transactions</h3>
//               </div>
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left">Bill</th>
//                     <th className="px-4 py-2 text-right">Subtotal</th>
//                     <th className="px-4 py-2 text-right">VAT</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {data.inputDetails.map((d: any, i: number) => (
//                     <tr key={i}>
//                       <td className="px-4 py-2">{d.bill_number}</td>
//                       <td className="px-4 py-2 text-right">₦{Number(d.subtotal).toLocaleString()}</td>
//                       <td className="px-4 py-2 text-right text-red-600">₦{Number(d.tax_amount).toLocaleString()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       ) : null}
//     </Layout>
//   );
// };

// export default VATSchedule;



import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
import { Text } from '@react-pdf/renderer';
import toast from 'react-hot-toast';

const VATSchedule = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'output' | 'input'>('output');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/vat-schedule');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch VAT schedule:', error);
      toast.error('Failed to load VAT schedule');
    } finally {
      setLoading(false);
    }
  };

  const VATPDF = ({ data }: { data: any }) => (
    <ReportPDF title="VAT Return Schedule" subtitle="July 2026">
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>Output VAT (Collected)</Text>
      <PDFRow label="VAT on Sales" value={`NGN ${data.outputVAT.toLocaleString()}`} />
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>Input VAT (Paid)</Text>
      <PDFRow label="VAT on Purchases" value={`NGN ${data.inputVAT.toLocaleString()}`} />
      <PDFTotal label="Net VAT Payable" value={`NGN ${data.netVATPayable.toLocaleString()}`} />
    </ReportPDF>
  );

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">VAT Return Schedule</h2>
            <p className="text-gray-500 mt-1 text-sm">Output VAT vs Input VAT</p>
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
                document={<VATPDF data={data} />} 
                fileName="VAT_Schedule.pdf" 
                className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 
                         active:bg-red-800 transition-colors text-sm font-medium text-center"
              >
                📄 Export PDF
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {/* Summary Skeleton */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-3 lg:p-4 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-24 mb-2 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            ))}
          </div>
          {/* Content Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center mb-3">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center border-t-4 border-green-500">
              <p className="text-xs text-gray-500 mb-1">Output VAT</p>
              <p className="text-lg lg:text-2xl font-bold text-green-600">
                ₦{data.outputVAT.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Collected</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center border-t-4 border-red-500">
              <p className="text-xs text-gray-500 mb-1">Input VAT</p>
              <p className="text-lg lg:text-2xl font-bold text-red-600">
                ₦{data.inputVAT.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Paid</p>
            </div>
            <div className={`bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center border-t-4 ${
              data.netVATPayable >= 0 ? 'border-blue-500' : 'border-orange-500'
            }`}>
              <p className="text-xs text-gray-500 mb-1">
                Net VAT
              </p>
              <p className={`text-lg lg:text-2xl font-bold ${
                data.netVATPayable >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                ₦{Math.abs(data.netVATPayable).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {data.netVATPayable >= 0 ? 'Payable' : 'Receivable'}
              </p>
            </div>
          </div>

          {/* VAT Flow Visualization - Mobile Only */}
          <div className="lg:hidden bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Output VAT</p>
                <p className="text-lg font-bold text-green-600">₦{data.outputVAT.toLocaleString()}</p>
              </div>
              <div className="flex-1 mx-4">
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div 
                    className="absolute left-0 top-0 h-2 bg-green-500 rounded-full"
                    style={{ width: `${(data.outputVAT / (data.outputVAT + data.inputVAT)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Collected</span>
                  <span>Paid</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Input VAT</p>
                <p className="text-lg font-bold text-red-600">₦{data.inputVAT.toLocaleString()}</p>
              </div>
            </div>
            
            <div className={`p-3 rounded-xl text-center ${
              data.netVATPayable >= 0 ? 'bg-blue-50' : 'bg-orange-50'
            }`}>
              <p className={`text-sm font-bold ${data.netVATPayable >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Net VAT {data.netVATPayable >= 0 ? 'Payable' : 'Receivable'}: ₦{Math.abs(data.netVATPayable).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.netVATPayable >= 0 
                  ? 'Amount to remit to tax authority' 
                  : 'Amount recoverable from tax authority'}
              </p>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('output')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'output'
                  ? 'bg-white text-green-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📈 Output VAT ({data.outputDetails?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('input')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'input'
                  ? 'bg-white text-red-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📉 Input VAT ({data.inputDetails?.length || 0})
            </button>
          </div>

          {/* Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Output VAT */}
            <div className={`${activeTab === 'input' ? 'hidden lg:block' : ''}`}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 lg:px-6 py-4 bg-green-50 border-b">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <span>📈</span>
                    <span>Output VAT Transactions</span>
                    <span className="text-xs text-gray-500 font-normal">
                      ({data.outputDetails?.length || 0})
                    </span>
                  </h3>
                </div>

                {data.outputDetails?.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No output VAT transactions</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">VAT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data.outputDetails.map((d: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-blue-900">{d.invoice_number}</td>
                              <td className="px-4 py-3 text-sm text-right">₦{Number(d.subtotal).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                                ₦{Number(d.tax_amount).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-green-50 font-bold">
                          <tr>
                            <td className="px-4 py-3 text-right">Total</td>
                            <td className="px-4 py-3 text-right">
                              ₦{data.outputDetails.reduce((sum: number, d: any) => sum + Number(d.subtotal), 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-green-600">
                              ₦{data.outputVAT.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-gray-100">
                      {data.outputDetails.map((d: any, i: number) => (
                        <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-blue-900 text-sm">{d.invoice_number}</p>
                              <p className="text-xs text-gray-500">Subtotal: ₦{Number(d.subtotal).toLocaleString()}</p>
                            </div>
                            <span className="text-sm font-bold text-green-600">
                              VAT: ₦{Number(d.tax_amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-green-50">
                        <div className="flex justify-between font-bold text-sm">
                          <span>Total Output VAT</span>
                          <span className="text-green-600">₦{data.outputVAT.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Input VAT */}
            <div className={`${activeTab === 'output' ? 'hidden lg:block' : ''}`}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 lg:px-6 py-4 bg-red-50 border-b">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <span>📉</span>
                    <span>Input VAT Transactions</span>
                    <span className="text-xs text-gray-500 font-normal">
                      ({data.inputDetails?.length || 0})
                    </span>
                  </h3>
                </div>

                {data.inputDetails?.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No input VAT transactions</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Bill</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">VAT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data.inputDetails.map((d: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-blue-900">{d.bill_number}</td>
                              <td className="px-4 py-3 text-sm text-right">₦{Number(d.subtotal).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                                ₦{Number(d.tax_amount).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-red-50 font-bold">
                          <tr>
                            <td className="px-4 py-3 text-right">Total</td>
                            <td className="px-4 py-3 text-right">
                              ₦{data.inputDetails.reduce((sum: number, d: any) => sum + Number(d.subtotal), 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-red-600">
                              ₦{data.inputVAT.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-gray-100">
                      {data.inputDetails.map((d: any, i: number) => (
                        <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-blue-900 text-sm">{d.bill_number}</p>
                              <p className="text-xs text-gray-500">Subtotal: ₦{Number(d.subtotal).toLocaleString()}</p>
                            </div>
                            <span className="text-sm font-bold text-red-600">
                              VAT: ₦{Number(d.tax_amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-red-50">
                        <div className="flex justify-between font-bold text-sm">
                          <span>Total Input VAT</span>
                          <span className="text-red-600">₦{data.inputVAT.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </Layout>
  );
};

export default VATSchedule;