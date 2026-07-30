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

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/payroll/employees/${id}/calculate`);
      const emp = response.data.employee;
      setFirstName(emp.first_name);
      setLastName(emp.last_name);
      setEmail(emp.email || '');
      setPhone(emp.phone || '');
      setBasicSalary(emp.basic_salary);
      setHousingAllowance(emp.housing_allowance || '');
      setTransportAllowance(emp.transport_allowance || '');
      setOtherAllowance(emp.other_allowance || '');
    } catch (error) {
      toast.error('Failed to load employee');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/payroll/employees/${id}`, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        basic_salary: parseFloat(basicSalary),
        housing_allowance: parseFloat(housingAllowance) || 0,
        transport_allowance: parseFloat(transportAllowance) || 0,
        other_allowance: parseFloat(otherAllowance) || 0,
      });
      toast.success('Employee updated!');
      navigate('/payroll');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Employee</h2>
            <p className="text-gray-500 mt-1">Update employee details</p>
          </div>
          <button onClick={() => navigate('/payroll')} className="px-4 py-2 border rounded-lg">← Back</button>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <h4 className="font-semibold mb-3 border-t pt-4">Salary Details</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Basic Salary (₦) *</label>
            <input type="number" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Housing (₦)</label>
              <input type="number" value={housingAllowance} onChange={(e) => setHousingAllowance(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Transport (₦)</label>
              <input type="number" value={transportAllowance} onChange={(e) => setTransportAllowance(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Other (₦)</label>
              <input type="number" value={otherAllowance} onChange={(e) => setOtherAllowance(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Saving...' : 'Update Employee'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EmployeeEdit;