// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import { PDFDownloadLink } from '@react-pdf/renderer';
// import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
// import { Text } from '@react-pdf/renderer';
// import { exportToExcel } from '../utils/exportExcel';

// interface LineItem {
//   code: string;
//   name: string;
//   amount: number;
// }

// interface IncomeStatementData {
//   revenue: LineItem[];
//   totalRevenue: number;
//   expenses: LineItem[];
//   totalExpenses: number;
//   netIncome: number;
// }

// const IncomeStatement = () => {
//   const [data, setData] = useState<IncomeStatementData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const response = await api.get('/reports/income-statement');
//       setData(response.data);
//     } catch (error) {
//       console.error('Failed to fetch income statement:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const IncomeStatementPDF = ({ data }: { data: any }) => (
//   <ReportPDF title="Income Statement" subtitle="July 2026">
//     <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Revenue</Text>
//     {data.revenue.map((item: any) => (
//       <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
//     ))}
//     <PDFTotal label="Total Revenue" value={`NGN ${data.totalRevenue.toLocaleString()}`} />
    
//     <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Expenses</Text>
//     {data.expenses.map((item: any) => (
//       <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
//     ))}
//     <PDFTotal label="Total Expenses" value={`NGN ${data.totalExpenses.toLocaleString()}`} />
    
//     <PDFTotal label={data.netIncome >= 0 ? 'Net Profit' : 'Net Loss'} value={`NGN ${Math.abs(data.netIncome).toLocaleString()}`} />
//   </ReportPDF>
// );
//   return (
//     <Layout>
//       {/* <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Income Statement</h2>
//         <p className="text-gray-500 mt-1">Profit & Loss Report</p>
//       </div> */}

// <div className="mb-6 flex justify-between items-center">
//   <div>
//     <h2 className="text-2xl font-bold text-gray-800">Income Statement</h2>
//     <p className="text-gray-500 mt-1">Profit & Loss Report</p>
//   </div>
//   <div className="flex gap-2 no-print">
//     <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
//       🖨️ Print
//     </button>
//     <button
//   onClick={() => data && exportToExcel(
//     [
//       ...data.revenue.map((r: any) => ({ Category: 'Revenue', Code: r.code, Account: r.name, Amount: r.amount })),
//       ...data.expenses.map((e: any) => ({ Category: 'Expense', Code: e.code, Account: e.name, Amount: e.amount })),
//       { Category: '', Code: '', Account: 'NET PROFIT', Amount: data.netIncome },
//     ],
//     'Income_Statement',
//     'P&L'
//   )}
//   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
// >
//   📥 Excel
// </button>
//     {data && (
//       <PDFDownloadLink
//         document={<IncomeStatementPDF data={data} />}
//         fileName="Income_Statement_July_2026.pdf"
//         className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
//       >
//         📄 Export PDF
//       </PDFDownloadLink>
//     )}
//   </div>
// </div>
//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading...</div>
//       ) : data ? (
//         <div className="max-w-2xl mx-auto">
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="px-6 py-4 bg-blue-900 text-white text-center">
//               <h3 className="text-xl font-bold">PrimeLedger</h3>
//               <p className="text-sm opacity-80">Income Statement — July 2026</p>
//             </div>

//             <div className="p-6">
//               {/* Revenue Section */}
//               <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Revenue</h4>
//               {data.revenue.length === 0 ? (
//                 <p className="text-gray-500 text-sm mb-4">No revenue recorded</p>
//               ) : (
//                 data.revenue.map((item) => (
//                   <div key={item.code} className="flex justify-between py-2 text-sm">
//                     <span className="text-gray-600">{item.code} — {item.name}</span>
//                     <span className="font-medium">₦{item.amount.toLocaleString()}</span>
//                   </div>
//                 ))
//               )}
//               <div className="flex justify-between py-2 border-t font-bold text-sm mt-2">
//                 <span>Total Revenue</span>
//                 <span>₦{data.totalRevenue.toLocaleString()}</span>
//               </div>

//               {/* Expenses Section */}
//               <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 mt-6">Expenses</h4>
//               {data.expenses.length === 0 ? (
//                 <p className="text-gray-500 text-sm mb-4">No expenses recorded</p>
//               ) : (
//                 data.expenses.map((item) => (
//                   <div key={item.code} className="flex justify-between py-2 text-sm">
//                     <span className="text-gray-600">{item.code} — {item.name}</span>
//                     <span className="font-medium">₦{item.amount.toLocaleString()}</span>
//                   </div>
//                 ))
//               )}
//               <div className="flex justify-between py-2 border-t font-bold text-sm mt-2">
//                 <span>Total Expenses</span>
//                 <span>₦{data.totalExpenses.toLocaleString()}</span>
//               </div>

//               {/* Net Income */}
//               <div className={`flex justify-between py-4 mt-4 rounded-lg px-4 text-lg font-bold ${
//                 data.netIncome >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
//               }`}>
//                 <span>Net {data.netIncome >= 0 ? 'Profit' : 'Loss'}</span>
//                 <span>₦{Math.abs(data.netIncome).toLocaleString()}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </Layout>
//   );
// };

// export default IncomeStatement;


import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF, PDFRow, PDFTotal } from '../components/pdf/ReportPDF';
import { Text } from '@react-pdf/renderer';
import { exportToExcel } from '../utils/exportExcel';

interface LineItem {
  code: string;
  name: string;
  amount: number;
}

interface IncomeStatementData {
  revenue: LineItem[];
  totalRevenue: number;
  expenses: LineItem[];
  totalExpenses: number;
  netIncome: number;
}

const IncomeStatement = () => {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    revenue: true,
    expenses: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/income-statement');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch income statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const IncomeStatementPDF = ({ data }: { data: any }) => (
    <ReportPDF title="Income Statement" subtitle="July 2026">
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Revenue</Text>
      {data.revenue.map((item: any) => (
        <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
      ))}
      <PDFTotal label="Total Revenue" value={`NGN ${data.totalRevenue.toLocaleString()}`} />
      
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Expenses</Text>
      {data.expenses.map((item: any) => (
        <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
      ))}
      <PDFTotal label="Total Expenses" value={`NGN ${data.totalExpenses.toLocaleString()}`} />
      
      <PDFTotal label={data.netIncome >= 0 ? 'Net Profit' : 'Net Loss'} value={`NGN ${Math.abs(data.netIncome).toLocaleString()}`} />
    </ReportPDF>
  );

  const profitMargin = data ? ((data.netIncome / data.totalRevenue) * 100) : 0;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Income Statement</h2>
            <p className="text-gray-500 mt-1 text-sm">Profit & Loss Report</p>
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
                  ...data.revenue.map((r: any) => ({ Category: 'Revenue', Code: r.code, Account: r.name, Amount: r.amount })),
                  ...data.expenses.map((e: any) => ({ Category: 'Expense', Code: e.code, Account: e.name, Amount: e.amount })),
                  { Category: '', Code: '', Account: 'NET PROFIT', Amount: data.netIncome },
                ],
                'Income_Statement',
                'P&L'
              )}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                       active:bg-green-800 transition-colors text-sm font-medium"
            >
              📥 Excel
            </button>
            {data && (
              <PDFDownloadLink
                document={<IncomeStatementPDF data={data} />}
                fileName="Income_Statement_July_2026.pdf"
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
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              {[...Array(4)].map((_, i) => (
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
          {/* Quick Summary Cards - Mobile Only */}
          <div className="lg:hidden grid grid-cols-3 gap-2 mb-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600 font-medium">Revenue</p>
              <p className="text-base font-bold text-green-900">
                ₦{data.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xs text-red-600 font-medium">Expenses</p>
              <p className="text-base font-bold text-red-900">
                ₦{data.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className={`rounded-lg p-3 text-center ${data.netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-xs font-medium ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.netIncome >= 0 ? 'Profit' : 'Loss'}
              </p>
              <p className={`text-base font-bold ${data.netIncome >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                ₦{Math.abs(data.netIncome).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Report Header */}
            <div className="px-4 lg:px-6 py-4 lg:py-5 bg-gradient-to-r from-blue-900 to-blue-800 text-white text-center">
              <h3 className="text-lg lg:text-xl font-bold">PrimeLedger</h3>
              <p className="text-sm opacity-80 mt-1">Income Statement — July 2026</p>
            </div>

            <div className="p-4 lg:p-6">
              {/* Revenue Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('revenue')}
                  className="w-full flex items-center justify-between py-3 border-b-2 border-green-200 text-green-900"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <h4 className="text-base lg:text-lg font-semibold">Revenue</h4>
                    <span className="text-xs text-gray-500 font-normal">
                      ({data.revenue.length} items)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">₦{data.totalRevenue.toLocaleString()}</span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${expandedSections.revenue ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {expandedSections.revenue && (
                  <div className="mt-2 space-y-1">
                    {data.revenue.length === 0 ? (
                      <p className="text-gray-500 text-sm py-3 text-center">No revenue recorded</p>
                    ) : (
                      data.revenue.map((item) => (
                        <div key={item.code} className="flex justify-between py-2.5 px-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-sm text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.code}</p>
                          </div>
                          <span className="text-sm font-semibold text-green-700 flex-shrink-0">
                            ₦{item.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                    <div className="flex justify-between py-2.5 px-3 bg-green-50 rounded-lg mt-2 font-bold text-sm">
                      <span>Total Revenue</span>
                      <span>₦{data.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Expenses Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('expenses')}
                  className="w-full flex items-center justify-between py-3 border-b-2 border-red-200 text-red-900"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📉</span>
                    <h4 className="text-base lg:text-lg font-semibold">Expenses</h4>
                    <span className="text-xs text-gray-500 font-normal">
                      ({data.expenses.length} items)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">₦{data.totalExpenses.toLocaleString()}</span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${expandedSections.expenses ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {expandedSections.expenses && (
                  <div className="mt-2 space-y-1">
                    {data.expenses.length === 0 ? (
                      <p className="text-gray-500 text-sm py-3 text-center">No expenses recorded</p>
                    ) : (
                      data.expenses.map((item) => (
                        <div key={item.code} className="flex justify-between py-2.5 px-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-sm text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.code}</p>
                          </div>
                          <span className="text-sm font-semibold text-red-700 flex-shrink-0">
                            ₦{item.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                    <div className="flex justify-between py-2.5 px-3 bg-red-50 rounded-lg mt-2 font-bold text-sm">
                      <span>Total Expenses</span>
                      <span>₦{data.totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Net Income */}
              <div className={`flex justify-between py-4 mt-4 rounded-xl px-4 text-base lg:text-lg font-bold border-2 ${
                data.netIncome >= 0 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <span>Net {data.netIncome >= 0 ? 'Profit' : 'Loss'}</span>
                <span>₦{Math.abs(data.netIncome).toLocaleString()}</span>
              </div>

              {/* Profit Margin */}
              {data.totalRevenue > 0 && (
                <div className={`text-center mt-3 text-sm font-medium p-3 rounded-lg ${
                  data.netIncome >= 0 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  <span className="flex items-center justify-center gap-2">
                    <span>{data.netIncome >= 0 ? '📈' : '📉'}</span>
                    <span>Profit Margin: {profitMargin.toFixed(2)}%</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 text-center">
            <span className="text-4xl mb-3 block">📊</span>
            <p className="text-gray-500 font-medium">No income statement data available</p>
            <p className="text-gray-400 text-sm mt-1">Data will appear here once transactions are recorded</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default IncomeStatement;