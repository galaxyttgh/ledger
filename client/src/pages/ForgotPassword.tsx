// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../api/axios';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [token, setToken] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await api.post('/auth/forgot-password', { email });
//       setMessage(response.data.message);
//       if (response.data.token) {
//         setToken(response.data.token);
//       }
//     } catch (err: any) {
//       setMessage('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-800 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-blue-900">PrimeLedger</h1>
//           <p className="text-gray-500 mt-2">Reset your password</p>
//         </div>

//         {message && (
//           <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 text-sm">
//             {message}
//           </div>
//         )}

//         {!token ? (
//           <form onSubmit={handleSubmit}>
//             <div className="mb-6">
//               <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter your email"
//                 required
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
//             >
//               {loading ? 'Sending...' : 'Send Reset Link'}
//             </button>
//           </form>
//         ) : (
//           <div className="text-center">
//             <p className="text-sm text-gray-500 mb-4">Token received. Copy this token:</p>
//             <code className="block bg-gray-100 p-3 rounded text-xs break-all mb-4">{token}</code>
//           </div>
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

// export default ForgotPassword;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'token' | 'reset'>('email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim() });
      setMessage(response.data.message);
      if (response.data.token) {
        setToken(response.data.token);
        setStep('token');
      }
      toast.success('Reset instructions sent!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      toast.success('Password reset successfully!');
      setStep('reset');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to reset password';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    toast.success('Token copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 lg:p-8">
        {/* Logo & Header */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">PL</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-900">PrimeLedger</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {step === 'email' && 'Reset your password'}
            {step === 'token' && 'Check your email'}
            {step === 'reset' && 'Password reset successful'}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2">
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

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2">
            <span className="flex-shrink-0">ℹ️</span>
            <span>{message}</span>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 'email' && (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-colors text-sm"
                  placeholder="Enter your email address"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                We'll send a password reset link to this email
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
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
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        {/* Step 2: Token Display & Reset Form */}
        {step === 'token' && (
          <div>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-800 font-medium mb-2">✅ Reset token received</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white p-2.5 rounded-lg text-xs break-all border border-green-200 font-mono">
                  {token}
                </code>
                <button
                  onClick={copyToken}
                  className="px-3 py-2.5 bg-green-600 text-white rounded-lg text-xs font-medium 
                           hover:bg-green-700 active:bg-green-800 transition-colors flex-shrink-0"
                  title="Copy token"
                >
                  📋
                </button>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Copy this token and use it to reset your password
              </p>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-colors text-sm"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    autoFocus
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Minimum 6 characters</p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-colors text-sm"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold 
                         hover:bg-blue-800 active:bg-blue-950 transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed text-sm mb-3"
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

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to email
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'reset' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Password Reset Successful!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-blue-900 text-white py-3 rounded-xl font-semibold 
                       hover:bg-blue-800 active:bg-blue-950 transition-colors text-sm text-center"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* Back to Login Link */}
        {step !== 'reset' && (
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
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            © 2026 PrimeLedger. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
