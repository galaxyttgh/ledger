// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { PDFDownloadLink } from '@react-pdf/renderer';
// import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
// import { Text } from '@react-pdf/renderer';
// import { exportToExcel } from '../utils/exportExcel';

// interface CashFlowData {
//   operatingActivities: { name: string; amount: number }[];
//   netOperating: number;
//   openingBalance: number;
//   closingBalance: number;
// }

// const CashFlow = () => {
//   const [data, setData] = useState<CashFlowData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { fetchData(); }, []);

//   const fetchData = async () => {
//     try {
//       const response = await api.get('/reports/cash-flow');
//       setData(response.data);
//     } catch (error) {
//       console.error('Failed to fetch cash flow:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const CashFlowPDF = ({ data }: { data: CashFlowData }) => (
//     <ReportPDF title="Cash Flow Statement" subtitle="July 2026">
//       <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Operating Activities</Text>
//       {data.operatingActivities.map((item, i) => (
//         <PDFRow key={i} label={item.name} value={`NGN ${Math.abs(item.amount).toLocaleString()}`} />
//       ))}
//       <PDFTotal label="Net Operating Cash Flow" value={`NGN ${data.netOperating.toLocaleString()}`} />
//       <PDFRow label="Opening Balance" value={`NGN ${data.openingBalance.toLocaleString()}`} />
//       <PDFTotal label="Closing Balance" value={`NGN ${data.closingBalance.toLocaleString()}`} />
//     </ReportPDF>
//   );

//   return (
//     <Layout>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Cash Flow Statement</h2>
//           <p className="text-gray-500 mt-1">Operating cash movements</p>
//         </div>
//         <div className="flex gap-2 no-print">
//           <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
//             🖨️ Print
//           </button>
//           <button
//   onClick={() => data && exportToExcel(
//     [
//       ...data.operatingActivities.map((a: any) => ({ Activity: 'Operating', Item: a.name, Amount: a.amount })),
//       { Activity: '', Item: 'Net Operating Cash Flow', Amount: data.netOperating },
//       { Activity: '', Item: 'Opening Balance', Amount: data.openingBalance },
//       { Activity: '', Item: 'Closing Balance', Amount: data.closingBalance },
//     ],
//     'Cash_Flow',
//     'Cash Flow'
//   )}
//   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
// >
//   📥 Excel
// </button>
//           {data && (
//             <PDFDownloadLink
//               document={<CashFlowPDF data={data} />}
//               fileName="Cash_Flow_July_2026.pdf"
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
//             >
//               📄 Export PDF
//             </PDFDownloadLink>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : data ? (
//         <div className="max-w-2xl mx-auto">
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <div className="px-6 py-4 bg-blue-900 text-white text-center">
//               <h3 className="text-xl font-bold">PrimeLedger</h3>
//               <p className="text-sm opacity-80">Cash Flow Statement — July 2026</p>
//             </div>
//             <div className="p-6">
//               <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Operating Activities</h4>
//               {data.operatingActivities.map((item, i) => (
//                 <div key={i} className="flex justify-between py-2 text-sm">
//                   <span className="text-gray-600">{item.name}</span>
//                   <span className={`font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                     ₦{Math.abs(item.amount).toLocaleString()}
//                   </span>
//                 </div>
//               ))}
//               <div className="flex justify-between py-2 border-t font-bold text-sm mt-2">
//                 <span>Net Operating Cash Flow</span>
//                 <span className={data.netOperating >= 0 ? 'text-green-600' : 'text-red-600'}>
//                   ₦{Math.abs(data.netOperating).toLocaleString()}
//                 </span>
//               </div>

//               <div className="flex justify-between py-2 mt-4 text-sm">
//                 <span className="text-gray-600">Opening Balance</span>
//                 <span className="font-medium">₦{data.openingBalance.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between py-3 mt-2 rounded-lg px-4 text-lg font-bold bg-green-50 text-green-800">
//                 <span>Closing Balance</span>
//                 <span>₦{data.closingBalance.toLocaleString()}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </Layout>
//   );
// };

// export default CashFlow;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
import { Text } from '@react-pdf/renderer';
import { exportToExcel } from '../utils/exportExcel';

interface CashFlowData {
  operatingActivities: { name: string; amount: number }[];
  netOperating: number;
  openingBalance: number;
  closingBalance: number;
}

const CashFlow = () => {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/cash-flow');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch cash flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getAmountIcon = (amount: number) => {
    if (amount > 0) return '↑';
    if (amount < 0) return '↓';
    return '→';
  };

  const CashFlowPDF = ({ data }: { data: CashFlowData }) => (
    <ReportPDF title="Cash Flow Statement" subtitle="July 2026">
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Operating Activities</Text>
      {data.operatingActivities.map((item, i) => (
        <PDFRow key={i} label={item.name} value={`NGN ${Math.abs(item.amount).toLocaleString()}`} />
      ))}
      <PDFTotal label="Net Operating Cash Flow" value={`NGN ${data.netOperating.toLocaleString()}`} />
      <PDFRow label="Opening Balance" value={`NGN ${data.openingBalance.toLocaleString()}`} />
      <PDFTotal label="Closing Balance" value={`NGN ${data.closingBalance.toLocaleString()}`} />
    </ReportPDF>
  );

  const totalInflows = data?.operatingActivities
    .filter(item => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0) || 0;

  const totalOutflows = data?.operatingActivities
    .filter(item => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0) || 0;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Cash Flow Statement</h2>
            <p className="text-gray-500 mt-1 text-sm">Operating cash movements</p>
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
            <button
              onClick={() => data && exportToExcel(
                [
                  ...data.operatingActivities.map((a: any) => ({ 
                    Category: 'Operating', 
                    Item: a.name, 
                    Amount: a.amount 
                  })),
                  { Category: '', Item: 'Net Operating Cash Flow', Amount: data.netOperating },
                  { Category: '', Item: 'Opening Balance', Amount: data.openingBalance },
                  { Category: '', Item: 'Closing Balance', Amount: data.closingBalance },
                ],
                'Cash_Flow',
                'Cash Flow'
              )}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                       active:bg-green-800 transition-colors text-sm font-medium"
            >
              📥 Excel
            </button>
            {data && (
              <PDFDownloadLink
                document={<CashFlowPDF data={data} />}
                fileName="Cash_Flow_July_2026.pdf"
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-blue-900 text-white text-center animate-pulse">
              <div className="h-6 bg-blue-800 rounded w-48 mx-auto mb-2"></div>
              <div className="h-4 bg-blue-800 rounded w-36 mx-auto"></div>
            </div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between py-2">
                  <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : data ? (
        <div className="max-w-2xl mx-auto">
          {/* Summary Cards - Mobile Only */}
          <div className="lg:hidden grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl shadow-sm p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Inflows</p>
              <p className="text-base font-bold text-green-600">
                ₦{totalInflows.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Outflows</p>
              <p className="text-base font-bold text-red-600">
                ₦{totalOutflows.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Net</p>
              <p className={`text-base font-bold ${getAmountColor(data.netOperating)}`}>
                ₦{Math.abs(data.netOperating).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Report Header */}
            <div className="px-4 lg:px-6 py-4 lg:py-5 bg-gradient-to-r from-blue-900 to-blue-800 text-white text-center">
              <h3 className="text-lg lg:text-xl font-bold">PrimeLedger</h3>
              <p className="text-sm opacity-80 mt-1">Cash Flow Statement — July 2026</p>
            </div>

            <div className="p-4 lg:p-6">
              {/* Operating Activities */}
              <div className="mb-6">
                <h4 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center justify-between">
                  <span>Operating Activities</span>
                  <span className="text-xs font-normal text-gray-500">
                    {data.operatingActivities.length} items
                  </span>
                </h4>
                
                <div className="space-y-1">
                  {data.operatingActivities.map((item, i) => (
                    <div 
                      key={i} 
                      className="flex justify-between py-2.5 px-3 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-3">
                        <span className={`text-sm font-bold ${getAmountColor(item.amount)}`}>
                          {getAmountIcon(item.amount)}
                        </span>
                        <span className="text-sm text-gray-700 truncate">{item.name}</span>
                      </div>
                      <span className={`text-sm font-semibold flex-shrink-0 ${getAmountColor(item.amount)}`}>
                        {item.amount >= 0 ? '+' : '-'}₦{Math.abs(item.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {data.operatingActivities.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No operating activities recorded
                  </p>
                )}

                {/* Net Operating */}
                <div className={`flex justify-between py-3 px-3 mt-2 rounded-lg font-bold text-sm ${
                  data.netOperating >= 0 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  <span>Net Operating Cash Flow</span>
                  <span>
                    {data.netOperating >= 0 ? '+' : '-'}₦{Math.abs(data.netOperating).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Balances Section */}
              <div className="space-y-3">
                <div className="flex justify-between py-3 px-3 bg-gray-50 rounded-lg text-sm">
                  <span className="text-gray-600 font-medium">Opening Balance</span>
                  <span className="font-bold text-gray-800">
                    ₦{data.openingBalance.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between py-3 px-4 rounded-lg text-base lg:text-lg font-bold bg-green-50 text-green-800 border border-green-200">
                  <span>Closing Balance</span>
                  <span>₦{data.closingBalance.toLocaleString()}</span>
                </div>

                {/* Cash Flow Visualization */}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Opening: ₦{data.openingBalance.toLocaleString()}</span>
                    <span>Closing: ₦{data.closingBalance.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        data.netOperating >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(
                          Math.abs(data.netOperating) / Math.max(data.openingBalance, 1) * 100, 
                          100
                        )}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Net change: {data.netOperating >= 0 ? '+' : '-'}₦{Math.abs(data.netOperating).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
            <span className="text-4xl mb-3 block">💰</span>
            <p className="text-gray-500 font-medium">No cash flow data available</p>
            <p className="text-gray-400 text-sm mt-1">Data will appear here once transactions are recorded</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CashFlow;