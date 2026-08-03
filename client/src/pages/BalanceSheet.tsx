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

// interface BalanceSheetData {
//   assets: LineItem[];
//   totalAssets: number;
//   liabilities: LineItem[];
//   totalLiabilities: number;
//   equity: LineItem[];
//   totalEquity: number;
//   totalLiabilitiesAndEquity: number;
// }

// const BalanceSheet = () => {
//   const [data, setData] = useState<BalanceSheetData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const response = await api.get('/reports/balance-sheet');
//       setData(response.data);
//     } catch (error) {
//       console.error('Failed to fetch balance sheet:', error);
//     } finally {
//       setLoading(false);
//     }
//   };


//   const BalanceSheetPDF = ({ data }: { data: any }) => (
//   <ReportPDF title="Balance Sheet" subtitle="July 2026">
//     <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Assets</Text>
//     {data.assets.map((item: any) => (
//       <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
//     ))}
//     <PDFTotal label="Total Assets" value={`NGN ${data.totalAssets.toLocaleString()}`} />
    
//     <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Liabilities</Text>
//     {data.liabilities.map((item: any) => (
//       <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
//     ))}
//     <PDFTotal label="Total Liabilities" value={`NGN ${data.totalLiabilities.toLocaleString()}`} />
    
//     <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Equity</Text>
//     {data.equity.map((item: any) => (
//       <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
//     ))}
//     <PDFTotal label="Total Equity" value={`NGN ${data.totalEquity.toLocaleString()}`} />
    
//     <PDFTotal label="Total Liabilities + Equity" value={`NGN ${data.totalLiabilitiesAndEquity.toLocaleString()}`} />
//   </ReportPDF>
// );

//   const renderSection = (title: string, items: LineItem[], total: number, color: string) => (
//     <div className="mb-6">
//       <h4 className={`text-lg font-semibold mb-3 border-b pb-2 ${color}`}>{title}</h4>
//       {items.length === 0 ? (
//         <p className="text-gray-500 text-sm">No items</p>
//       ) : (
//         items.map((item) => (
//           <div key={item.code} className="flex justify-between py-2 text-sm">
//             <span className="text-gray-600">{item.code} — {item.name}</span>
//             <span className="font-medium">₦{item.amount.toLocaleString()}</span>
//           </div>
//         ))
//       )}
//       <div className="flex justify-between py-2 border-t font-bold text-sm mt-2">
//         <span>Total {title}</span>
//         <span>₦{total.toLocaleString()}</span>
//       </div>
//     </div>
//   );

//   return (
//     <Layout>
//     <div className="mb-6 flex justify-between items-center">
//   <div>
//     <h2 className="text-2xl font-bold text-gray-800">Balance Sheet</h2>
//     <p className="text-gray-500 mt-1">Assets = Liabilities + Equity</p>
//   </div>
//   <div className="flex gap-2 no-print">
//     <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
//       🖨️ Print
//     </button>
//     <button
//   onClick={() => data && exportToExcel(
//     [
//       ...data.assets.map((a: any) => ({ Category: 'Asset', Code: a.code, Account: a.name, Amount: a.amount })),
//       ...data.liabilities.map((l: any) => ({ Category: 'Liability', Code: l.code, Account: l.name, Amount: l.amount })),
//       ...data.equity.map((e: any) => ({ Category: 'Equity', Code: e.code, Account: e.name, Amount: e.amount })),
//     ],
//     'Balance_Sheet',
//     'Balance Sheet'
//   )}
//   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
// >
//   📥 Excel
// </button>
//     {data && (
//       <PDFDownloadLink
//         document={<BalanceSheetPDF data={data} />}
//         fileName="Balance_Sheet_July_2026.pdf"
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
//               <p className="text-sm opacity-80">Balance Sheet — July 2026</p>
//             </div>

//             <div className="p-6">
//               {renderSection('Assets', data.assets, data.totalAssets, 'text-blue-900')}
//               {renderSection('Liabilities', data.liabilities, data.totalLiabilities, 'text-red-900')}
//               {renderSection('Equity', data.equity, data.totalEquity, 'text-green-900')}

//               <div className={`flex justify-between py-4 mt-4 rounded-lg px-4 text-lg font-bold ${
//                 Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 0.01
//                   ? 'bg-green-50 text-green-800'
//                   : 'bg-red-50 text-red-800'
//               }`}>
//                 <span>Total Liabilities + Equity</span>
//                 <span>₦{data.totalLiabilitiesAndEquity.toLocaleString()}</span>
//               </div>

//               <div className={`text-center mt-2 text-sm font-medium ${
//                 Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 0.01
//                   ? 'text-green-600'
//                   : 'text-red-600'
//               }`}>
//                 {Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 0.01
//                   ? '✓ Balance Sheet is balanced — Assets = Liabilities + Equity'
//                   : '✗ Balance Sheet is not balanced'}
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </Layout>
//   );
// };

// export default BalanceSheet;


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

interface BalanceSheetData {
  assets: LineItem[];
  totalAssets: number;
  liabilities: LineItem[];
  totalLiabilities: number;
  equity: LineItem[];
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

const BalanceSheet = () => {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    assets: true,
    liabilities: true,
    equity: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/reports/balance-sheet');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch balance sheet:', error);
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

  const BalanceSheetPDF = ({ data }: { data: any }) => (
    <ReportPDF title="Balance Sheet" subtitle="July 2026">
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Assets</Text>
      {data.assets.map((item: any) => (
        <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
      ))}
      <PDFTotal label="Total Assets" value={`NGN ${data.totalAssets.toLocaleString()}`} />
      
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Liabilities</Text>
      {data.liabilities.map((item: any) => (
        <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
      ))}
      <PDFTotal label="Total Liabilities" value={`NGN ${data.totalLiabilities.toLocaleString()}`} />
      
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Equity</Text>
      {data.equity.map((item: any) => (
        <PDFRow key={item.code} label={`${item.code} — ${item.name}`} value={`NGN ${item.amount.toLocaleString()}`} />
      ))}
      <PDFTotal label="Total Equity" value={`NGN ${data.totalEquity.toLocaleString()}`} />
      
      <PDFTotal label="Total Liabilities + Equity" value={`NGN ${data.totalLiabilitiesAndEquity.toLocaleString()}`} />
    </ReportPDF>
  );

  const isBalanced = data ? Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 0.01 : false;

  const renderSection = (title: string, items: LineItem[], total: number, color: string, sectionKey: keyof typeof expandedSections) => (
    <div className="mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className={`w-full flex items-center justify-between py-3 border-b-2 transition-colors ${color}`}
      >
        <h4 className="text-base lg:text-lg font-semibold">{title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">₦{total.toLocaleString()}</span>
          <svg 
            className={`w-5 h-5 transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="mt-2 space-y-1">
          {items.length === 0 ? (
            <p className="text-gray-500 text-sm py-3 text-center">No items</p>
          ) : (
            items.map((item) => (
              <div key={item.code} className="flex justify-between py-2.5 px-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm text-gray-800 font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.code}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  ₦{item.amount.toLocaleString()}
                </span>
              </div>
            ))
          )}
          <div className="flex justify-between py-2.5 px-3 bg-gray-50 rounded-lg mt-2 font-bold text-sm">
            <span>Total {title}</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Balance Sheet</h2>
            <p className="text-gray-500 mt-1 text-sm">Assets = Liabilities + Equity</p>
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
                  ...data.assets.map((a: any) => ({ Category: 'Asset', Code: a.code, Account: a.name, Amount: a.amount })),
                  ...data.liabilities.map((l: any) => ({ Category: 'Liability', Code: l.code, Account: l.name, Amount: l.amount })),
                  ...data.equity.map((e: any) => ({ Category: 'Equity', Code: e.code, Account: e.name, Amount: e.amount })),
                ],
                'Balance_Sheet',
                'Balance Sheet'
              )}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                       active:bg-green-800 transition-colors text-sm font-medium"
            >
              📥 Excel
            </button>
            {data && (
              <PDFDownloadLink
                document={<BalanceSheetPDF data={data} />}
                fileName="Balance_Sheet_July_2026.pdf"
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
            <div className="p-6 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex justify-between py-2">
                      <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : data ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Report Header */}
            <div className="px-4 lg:px-6 py-4 lg:py-5 bg-gradient-to-r from-blue-900 to-blue-800 text-white text-center">
              <h3 className="text-lg lg:text-xl font-bold">PrimeLedger</h3>
              <p className="text-sm opacity-80 mt-1">Balance Sheet — July 2026</p>
            </div>

            {/* Report Content */}
            <div className="p-4 lg:p-6">
              {/* Quick Summary Cards - Mobile Only */}
              <div className="lg:hidden grid grid-cols-3 gap-2 mb-4">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-blue-600 font-medium">Assets</p>
                  <p className="text-sm font-bold text-blue-900">₦{data.totalAssets.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-red-600 font-medium">Liabilities</p>
                  <p className="text-sm font-bold text-red-900">₦{data.totalLiabilities.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-green-600 font-medium">Equity</p>
                  <p className="text-sm font-bold text-green-900">₦{data.totalEquity.toLocaleString()}</p>
                </div>
              </div>

              {/* Sections */}
              {renderSection('Assets', data.assets, data.totalAssets, 'text-blue-900 border-blue-200', 'assets')}
              {renderSection('Liabilities', data.liabilities, data.totalLiabilities, 'text-red-900 border-red-200', 'liabilities')}
              {renderSection('Equity', data.equity, data.totalEquity, 'text-green-900 border-green-200', 'equity')}

              {/* Balance Check */}
              <div className={`flex justify-between py-4 mt-4 rounded-xl px-4 text-base lg:text-lg font-bold transition-colors ${
                isBalanced
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <span>Total Liabilities + Equity</span>
                <span>₦{data.totalLiabilitiesAndEquity.toLocaleString()}</span>
              </div>

              {/* Balance Status */}
              <div className={`text-center mt-3 text-sm font-medium p-3 rounded-lg ${
                isBalanced
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {isBalanced ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>✅</span>
                    <span>Balance Sheet is balanced — Assets = Liabilities + Equity</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>⚠️</span>
                    <span>Balance Sheet is not balanced — Difference: ₦{Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity).toLocaleString()}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};

export default BalanceSheet;