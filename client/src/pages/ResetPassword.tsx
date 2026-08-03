// import { useState } from 'react';
// import { useNavigate, useSearchParams, Link } from 'react-router-dom';
// import api from '../api/axios';

// const ResetPassword = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const token = searchParams.get('token') || '';
//   const [newPassword, setNewPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       const response = await api.post('/auth/reset-password', { token, newPassword });
//       setMessage(response.data.message);
//       setTimeout(() => navigate('/login'), 2000);
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Reset failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-800 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-blue-900">PrimeLedger</h1>
//           <p className="text-gray-500 mt-2">Enter your new password</p>
//         </div>

//         {message && (
//           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
//             {message}
//           </div>
//         )}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
//             {error}
//           </div>
//         )}

//         {!message && (
//           <form onSubmit={handleSubmit}>
//             <div className="mb-6">
//               <label className="block text-gray-700 text-sm font-semibold mb-2">New Password</label>
//               <input
//                 type="password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter new password"
//                 required
//                 minLength={6}
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading || !token}
//               className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
//             >
//               {loading ? 'Resetting...' : 'Reset Password'}
//             </button>
//           </form>
//         )}

//         <div className="mt-6 text-center">
//           <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800">
//             ← Back to Login
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;


import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      setMessage(response.data.message || 'Password reset successfully!');
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Reset failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
        {/* Logo & Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">PL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">PrimeLedger</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {message ? 'Password Reset Complete' : 'Enter your new password'}
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {message}
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to login page...
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-blue-900 text-white py-3 rounded-xl font-semibold 
                       hover:bg-blue-800 active:bg-blue-950 transition-colors text-sm text-center"
            >
              Go to Login Now
            </Link>
          </div>
        )}

        {/* Error Message */}
        {error && !message && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
            <span className="flex-shrink-0">⚠️</span>
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0"
            >
              ×
            </button>
          </div>
        )}

        {/* Reset Form */}
        {!message && (
          <form onSubmit={handleSubmit}>
            {/* Token Status */}
            {!token && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>Invalid or missing reset token. Please request a new password reset link.</span>
              </div>
            )}

            {/* New Password */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    checkPasswordStrength(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-colors text-sm"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  autoFocus
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                           hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    passwordStrength <= 1 ? 'text-red-600' :
                    passwordStrength <= 3 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    Password strength: {getStrengthLabel()}
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li className={`text-xs flex items-center gap-1 ${newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                      {newPassword.length >= 6 ? '✓' : '○'} At least 6 characters
                    </li>
                    <li className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[A-Z]/.test(newPassword) ? '✓' : '○'} One uppercase letter
                    </li>
                    <li className={`text-xs flex items-center gap-1 ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[0-9]/.test(newPassword) ? '✓' : '○'} One number
                    </li>
                    <li className={`text-xs flex items-center gap-1 ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '○'} One special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-colors text-sm ${
                             confirmPassword && newPassword !== confirmPassword
                               ? 'border-red-300'
                               : 'border-gray-300'
                           }`}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                           hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold 
                       hover:bg-blue-800 active:bg-blue-950 transition-colors 
                       disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        {!message && (
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
            >
              <span>←</span>
              <span>Back to Login</span>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400">
            © 2026 PrimeLedger. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;