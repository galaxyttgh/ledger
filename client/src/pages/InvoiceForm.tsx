import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface Customer {
  id: number;
  code: string;
  name: string;
}

const InvoiceForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
const [items, setItems] = useState<any[]>([]);
const [linkInventory, setLinkInventory] = useState(false);
const [selectedItemId, setSelectedItemId] = useState('');
const [itemQuantity, setItemQuantity] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchBranches();
  }, []);

  useEffect(() => {
  fetchCustomers();
  fetchBranches();
  api.get('/inventory/items').then(r => setItems(r.data)).catch(() => {});
}, []);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      toast.error('Failed to load branches');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customerId) newErrors.customerId = 'Please select a customer';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!invoiceDate) newErrors.invoiceDate = 'Invoice date is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    if (invoiceDate && dueDate && new Date(dueDate) < new Date(invoiceDate)) {
      newErrors.dueDate = 'Due date cannot be before invoice date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    setLoading(true);

    try {
  await api.post('/invoices', {
  customer_id: parseInt(customerId),
  invoice_date: invoiceDate,
  due_date: dueDate,
  description: description.trim(),
  subtotal: parseFloat(amount),
  tax_code: 'VAT-STANDARD',
  branch_id: branchId ? parseInt(branchId) : null,
  item_id: linkInventory && selectedItemId ? parseInt(selectedItemId) : null,
  quantity: linkInventory && itemQuantity ? parseInt(itemQuantity) : null,
});
      toast.success('Invoice created successfully!');
      navigate('/invoices');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (customerId || description || amount || dueDate || branchId) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/invoices');
      }
    } else {
      navigate('/invoices');
    }
  };

  const subtotal = parseFloat(amount) || 0;
  const vat = subtotal * 0.075;
  const total = subtotal + vat;
  const selectedCustomer = customers.find(c => c.id === parseInt(customerId));

  // Set default due date to 30 days from invoice date if not set
  useEffect(() => {
    if (invoiceDate && !dueDate) {
      const date = new Date(invoiceDate);
      date.setDate(date.getDate() + 30);
      setDueDate(date.toISOString().split('T')[0]);
    }
  }, [invoiceDate]);

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Create Invoice</h2>
              <p className="text-gray-500 mt-1 text-sm">Generate a customer invoice</p>
            </div>
            <button
              onClick={handleCancel}
              className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded-xl 
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              <span>←</span>
              <span>Back to Invoices</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          {/* Customer Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                if (errors.customerId) setErrors({ ...errors, customerId: '' });
              }}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors appearance-none
                ${errors.customerId 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white`}
              required
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-xs text-red-600">{errors.customerId}</p>
            )}
            {selectedCustomer && (
              <p className="mt-1 text-xs text-blue-600">
                Selected: {selectedCustomer.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="e.g., Consulting services"
              className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                ${errors.description 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              required
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Dates & Branch - Stack on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => {
                  setInvoiceDate(e.target.value);
                  if (errors.invoiceDate) setErrors({ ...errors, invoiceDate: '' });
                }}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.invoiceDate 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required
              />
              {errors.invoiceDate && (
                <p className="mt-1 text-xs text-red-600">{errors.invoiceDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors({ ...errors, dueDate: '' });
                }}
                min={invoiceDate}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.dueDate 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Branch
              </label>
              <select 
                value={branchId} 
                onChange={(e) => setBranchId(e.target.value)} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         focus:ring-opacity-50 transition-colors appearance-none bg-white"
              >
                <option value="">Select branch...</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount (₦) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">₦</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: '' });
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full pl-7 pr-3 py-2.5 border rounded-xl text-sm transition-colors
                  ${errors.amount 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                required
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
            )}

            {/* Tax Calculation Preview */}
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (7.5%)</span>
                  <span className="font-medium text-blue-600">₦{vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-gray-900">₦{total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

{/* <div className="mb-6 border-t pt-4">
<label className="flex items-center gap-2 mb-3 cursor-pointer">
  <input 
    type="checkbox" 
    checked={linkInventory} 
    onChange={(e) => setLinkInventory(e.target.checked)} 
  />
  <span className="text-sm font-medium">
    This invoice includes a physical product (reduces stock)
  </span>
</label>

  {linkInventory && (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Select Product</label>
        <select 
          value={selectedItemId} 
          onChange={(e) => setSelectedItemId(e.target.value)} 
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select item...</option>
          {items.map((i: any) => (
            <option key={i.id} value={i.id}>
              {i.name} (Stock: {i.stock_qty})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input 
          type="number" 
          value={itemQuantity} 
          onChange={(e) => setItemQuantity(e.target.value)} 
          className="w-full px-3 py-2 border rounded-lg" 
          placeholder="0" 
          min="1" 
        />
      </div>
    </div>
  )}
</div> */}

<div className="mb-6 border-t pt-4">
  <label className="flex items-center gap-2 mb-3 cursor-pointer">
    <input 
      type="checkbox" 
      checked={linkInventory} 
      onChange={(e) => setLinkInventory(e.target.checked)} 
    />
    <span className="text-sm font-medium">
      This invoice includes a physical product (reduces stock)
    </span>
  </label>
  
  {linkInventory && (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Select Product</label>
        <select 
          value={selectedItemId} 
          onChange={(e) => setSelectedItemId(e.target.value)} 
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select item...</option>
          {items.map((i: any) => (
            <option key={i.id} value={i.id}>
              {i.name} (Stock: {i.stock_qty})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input 
          type="number" 
          value={itemQuantity} 
          onChange={(e) => setItemQuantity(e.target.value)} 
          className="w-full px-3 py-2 border rounded-lg" 
          placeholder="0" 
          min="1" 
        />
      </div>
    </div>
  )}

  {linkInventory && selectedItemId && amount && (() => {
    const selectedItem = items.find((i: any) => i.id === parseInt(selectedItemId));
    const costPrice = selectedItem ? Number(selectedItem.cost_price) : 0;
    const invoiceAmount = parseFloat(amount) || 0;
    const willBeLoss = invoiceAmount < costPrice;
    
    return willBeLoss ? (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
        <p className="text-sm text-yellow-800">
          ⚠️ Warning: Invoice amount (₦{invoiceAmount.toLocaleString()}) is less than cost price (₦{costPrice.toLocaleString()}). This will record a loss.
        </p>
      </div>
    ) : null;
  })()}
</div>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 
                       hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium
                       order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold 
                       hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors text-sm order-1 sm:order-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Invoice'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default InvoiceForm;