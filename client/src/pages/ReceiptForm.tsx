import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Customer {
  id: number;
  code: string;
  name: string;
  current_balance: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  total: number;
  customer_id: number;
}

const ReceiptForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchInvoices(parseInt(customerId));
    }
  }, [customerId]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

//   const fetchInvoices = async (custId: number) => {
//     try {
//       const response = await api.get('/invoices');
//       setInvoices(response.data.filter((inv: Invoice) => inv.customer_id === custId));
//     } catch (error) {
//       console.error('Failed to fetch invoices:', error);
//     }
//   };

const fetchInvoices = async (custId: number) => {
  try {
    const response = await api.get('/invoices');
    setInvoices(response.data.filter((inv: any) => 
      inv.customer_id === custId && inv.status !== 'paid'
    ));
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
  }
};
  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    setInvoiceId('');
    const customer = customers.find(c => c.id === parseInt(id));
    if (customer && customer.current_balance > 0) {
      setAmount(customer.current_balance.toString());
    }
  };

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const invoice = invoices.find(i => i.id === parseInt(id));
    if (invoice) {
      setAmount(invoice.total.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/receipts', {
        customer_id: parseInt(customerId),
        invoice_id: invoiceId ? parseInt(invoiceId) : null,
        amount: parseFloat(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
      });
      navigate('/receipts');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Record Receipt</h2>
            <p className="text-gray-500 mt-1">Record a customer payment</p>
          </div>
          <button onClick={() => navigate('/receipts')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            ← Back
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            <select value={customerId} onChange={(e) => handleCustomerChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.current_balance > 0 ? `(owes ₦${c.current_balance.toLocaleString()})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice (optional)</label>
            <select value={invoiceId} onChange={(e) => handleInvoiceChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No specific invoice</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>{inv.invoice_number} — ₦{Number(inv.total).toLocaleString()}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" required />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            {loading ? 'Recording...' : 'Record Receipt'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ReceiptForm;