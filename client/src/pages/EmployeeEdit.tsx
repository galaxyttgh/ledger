// import { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// const EmployeeEdit = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [basicSalary, setBasicSalary] = useState('');
//   const [housingAllowance, setHousingAllowance] = useState('');
//   const [transportAllowance, setTransportAllowance] = useState('');
//   const [otherAllowance, setOtherAllowance] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchEmployee();
//   }, [id]);

//   const fetchEmployee = async () => {
//     try {
//       const response = await api.get(`/payroll/employees/${id}/calculate`);
//       const emp = response.data.employee;
//       setFirstName(emp.first_name);
//       setLastName(emp.last_name);
//       setEmail(emp.email || '');
//       setPhone(emp.phone || '');
//       setBasicSalary(emp.basic_salary);
//       setHousingAllowance(emp.housing_allowance || '');
//       setTransportAllowance(emp.transport_allowance || '');
//       setOtherAllowance(emp.other_allowance || '');
//     } catch (error) {
//       toast.error('Failed to load employee');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.put(`/payroll/employees/${id}`, {
//         first_name: firstName,
//         last_name: lastName,
//         email,
//         phone,
//         basic_salary: parseFloat(basicSalary),
//         housing_allowance: parseFloat(housingAllowance) || 0,
//         transport_allowance: parseFloat(transportAllowance) || 0,
//         other_allowance: parseFloat(otherAllowance) || 0,
//       });
//       toast.success('Employee updated!');
//       navigate('/payroll');
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed to update');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-lg mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Edit Employee</h2>
//             <p className="text-gray-500 mt-1">Update employee details</p>
//           </div>
//           <button onClick={() => navigate('/payroll')} className="px-4 py-2 border rounded-lg">← Back</button>
//         </div>
//         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">First Name *</label>
//               <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Last Name *</label>
//               <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Email</label>
//               <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Phone</label>
//               <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
//             </div>
//           </div>
//           <h4 className="font-semibold mb-3 border-t pt-4">Salary Details</h4>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Basic Salary (₦) *</label>
//             <input type="number" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
//           </div>
//           <div className="grid grid-cols-3 gap-4 mb-6">
//             <div>
//               <label className="block text-sm font-medium mb-1">Housing (₦)</label>
//               <input type="number" value={housingAllowance} onChange={(e) => setHousingAllowance(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Transport (₦)</label>
//               <input type="number" value={transportAllowance} onChange={(e) => setTransportAllowance(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Other (₦)</label>
//               <input type="number" value={otherAllowance} onChange={(e) => setOtherAllowance(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
//             </div>
//           </div>
//           <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
//             {loading ? 'Saving...' : 'Update Employee'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default EmployeeEdit;


import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const EmployeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [housingAllowance, setHousingAllowance] = useState('');
  const [transportAllowance, setTransportAllowance] = useState('');
  const [otherAllowance, setOtherAllowance] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    setFetchLoading(true);
    try {
      const response = await api.get(`/payroll/employees/${id}/calculate`);
      const emp = response.data.employee;
      setFirstName(emp.first_name || '');
      setLastName(emp.last_name || '');
      setEmail(emp.email || '');
      setPhone(emp.phone || '');
      setBasicSalary(emp.basic_salary || '');
      setHousingAllowance(emp.housing_allowance || '');
      setTransportAllowance(emp.transport_allowance || '');
      setOtherAllowance(emp.other_allowance || '');
    } catch (error) {
      toast.error('Failed to load employee');
    } finally {
      setFetchLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (phone && !/^[\d\s\-+()]{7,15}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!basicSalary || parseFloat(basicSalary) <= 0) {
      newErrors.basicSalary = 'Valid basic salary is required';
    }
    
    if (housingAllowance && parseFloat(housingAllowance) < 0) {
      newErrors.housingAllowance = 'Cannot be negative';
    }
    
    if (transportAllowance && parseFloat(transportAllowance) < 0) {
      newErrors.transportAllowance = 'Cannot be negative';
    }
    
    if (otherAllowance && parseFloat(otherAllowance) < 0) {
      newErrors.otherAllowance = 'Cannot be negative';
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
      await api.put(`/payroll/employees/${id}`, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        basic_salary: parseFloat(basicSalary),
        housing_allowance: parseFloat(housingAllowance) || 0,
        transport_allowance: parseFloat(transportAllowance) || 0,
        other_allowance: parseFloat(otherAllowance) || 0,
      });
      toast.success('Employee updated successfully!');
      navigate('/payroll');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = firstName || lastName || email || phone || basicSalary;
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/payroll');
      }
    } else {
      navigate('/payroll');
    }
  };

  const totalSalary = 
    (parseFloat(basicSalary) || 0) + 
    (parseFloat(housingAllowance) || 0) + 
    (parseFloat(transportAllowance) || 0) + 
    (parseFloat(otherAllowance) || 0);

  if (fetchLoading) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-36 animate-pulse"></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Edit Employee</h2>
              <p className="text-gray-500 mt-1 text-sm">Update employee details</p>
            </div>
            <button 
              onClick={handleCancel} 
              className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded-xl 
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium w-full sm:w-auto"
            >
              <span>←</span>
              <span>Back to Payroll</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">👤</span>
              <h3 className="text-base font-semibold text-gray-800">Personal Information</h3>
            </div>
            
            {/* Name Fields - Stack on mobile, side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) setErrors({ ...errors, firstName: '' });
                  }} 
                  placeholder="First name"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.firstName 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  required 
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) setErrors({ ...errors, lastName: '' });
                  }} 
                  placeholder="Last name"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.lastName 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  required 
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">✉️</span>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }} 
                    placeholder="employee@company.com"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm transition-colors
                      ${errors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }
                      focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📞</span>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }} 
                    placeholder="+234 800 000 0000"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm transition-colors
                      ${errors.phone 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }
                      focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Salary Details */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💰</span>
              <h3 className="text-base font-semibold text-gray-800">Salary Details</h3>
            </div>
            
            {/* Basic Salary */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Basic Salary (₦) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">₦</span>
                <input 
                  type="number" 
                  value={basicSalary} 
                  onChange={(e) => {
                    setBasicSalary(e.target.value);
                    if (errors.basicSalary) setErrors({ ...errors, basicSalary: '' });
                  }} 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-7 pr-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.basicSalary 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  required 
                />
              </div>
              {errors.basicSalary && (
                <p className="mt-1 text-xs text-red-600">{errors.basicSalary}</p>
              )}
            </div>

            {/* Allowances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Housing (₦)
                </label>
                <input 
                  type="number" 
                  value={housingAllowance} 
                  onChange={(e) => {
                    setHousingAllowance(e.target.value);
                    if (errors.housingAllowance) setErrors({ ...errors, housingAllowance: '' });
                  }} 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.housingAllowance 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                />
                {errors.housingAllowance && (
                  <p className="mt-1 text-xs text-red-600">{errors.housingAllowance}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Transport (₦)
                </label>
                <input 
                  type="number" 
                  value={transportAllowance} 
                  onChange={(e) => {
                    setTransportAllowance(e.target.value);
                    if (errors.transportAllowance) setErrors({ ...errors, transportAllowance: '' });
                  }} 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.transportAllowance 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                />
                {errors.transportAllowance && (
                  <p className="mt-1 text-xs text-red-600">{errors.transportAllowance}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Other (₦)
                </label>
                <input 
                  type="number" 
                  value={otherAllowance} 
                  onChange={(e) => {
                    setOtherAllowance(e.target.value);
                    if (errors.otherAllowance) setErrors({ ...errors, otherAllowance: '' });
                  }} 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors
                    ${errors.otherAllowance 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                />
                {errors.otherAllowance && (
                  <p className="mt-1 text-xs text-red-600">{errors.otherAllowance}</p>
                )}
              </div>
            </div>

            {/* Salary Summary */}
            {totalSalary > 0 && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Salary Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Basic Salary</span>
                    <span className="font-medium text-blue-900">
                      ₦{(parseFloat(basicSalary) || 0).toLocaleString()}
                    </span>
                  </div>
                  {(parseFloat(housingAllowance) || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Housing Allowance</span>
                      <span className="font-medium text-blue-900">
                        ₦{(parseFloat(housingAllowance) || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {(parseFloat(transportAllowance) || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Transport Allowance</span>
                      <span className="font-medium text-blue-900">
                        ₦{(parseFloat(transportAllowance) || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {(parseFloat(otherAllowance) || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Other Allowance</span>
                      <span className="font-medium text-blue-900">
                        ₦{(parseFloat(otherAllowance) || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-blue-200 font-bold">
                    <span className="text-blue-900">Total Monthly Salary</span>
                    <span className="text-blue-900">₦{totalSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
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
                  Updating...
                </span>
              ) : (
                'Update Employee'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EmployeeEdit;