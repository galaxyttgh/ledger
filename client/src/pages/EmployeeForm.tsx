// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Layout from '../components/Layout';

// const EmployeeForm = () => {
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
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       await api.post('/payroll/employees', {
//         first_name: firstName,
//         last_name: lastName,
//         email,
//         phone,
//         basic_salary: parseFloat(basicSalary),
//         housing_allowance: parseFloat(housingAllowance) || 0,
//         transport_allowance: parseFloat(transportAllowance) || 0,
//         other_allowance: parseFloat(otherAllowance) || 0,
//       });
//       navigate('/payroll');
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Failed to create employee');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-lg mx-auto">
//         <div className="mb-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Add Employee</h2>
//             <p className="text-gray-500 mt-1">Create a new employee record</p>
//           </div>
//           <button onClick={() => navigate('/payroll')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">← Back</button>
//         </div>

//         {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

//         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
//               <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
//               <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//               <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//               <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
//             </div>
//           </div>

//           <h4 className="font-semibold text-gray-700 mb-3 mt-6 border-t pt-4">Salary Details</h4>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (₦) *</label>
//             <input type="number" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01" min="0" required />
//           </div>
//           <div className="grid grid-cols-3 gap-4 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Housing (₦)</label>
//               <input type="number" value={housingAllowance} onChange={(e) => setHousingAllowance(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01" min="0" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Transport (₦)</label>
//               <input type="number" value={transportAllowance} onChange={(e) => setTransportAllowance(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01" min="0" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Other (₦)</label>
//               <input type="number" value={otherAllowance} onChange={(e) => setOtherAllowance(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01" min="0" />
//             </div>
//           </div>

//           <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
//             {loading ? 'Saving...' : 'Save Employee'}
//           </button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default EmployeeForm;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const EmployeeForm = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payroll/employees', {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        basic_salary: parseFloat(basicSalary),
        housing_allowance: parseFloat(housingAllowance) || 0,
        transport_allowance: parseFloat(transportAllowance) || 0,
        other_allowance: parseFloat(otherAllowance) || 0,
      });
      toast.success('Employee created successfully!');
      navigate('/payroll');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add Employee</h2>
            <p className="text-gray-500 mt-1">Create a new employee record</p>
          </div>
          <button onClick={() => navigate('/payroll')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">← Back</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <h4 className="font-semibold text-gray-700 mb-3 mt-6 border-t pt-4">Salary Details</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (₦) *</label>
            <input type="number" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Housing (₦)</label>
              <input type="number" value={housingAllowance} onChange={(e) => setHousingAllowance(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transport (₦)</label>
              <input type="number" value={transportAllowance} onChange={(e) => setTransportAllowance(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other (₦)</label>
              <input type="number" value={otherAllowance} onChange={(e) => setOtherAllowance(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Employee'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EmployeeForm;