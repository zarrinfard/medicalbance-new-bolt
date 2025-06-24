import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, CheckCircle } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already verified
    if (user?.isEmailVerified) {
      redirectUser();
      return;
    }

    // Auto-verify if token is in URL
    const token = searchParams.get('token');
    if (token) {
      handleAutoVerification(token);
    }
  }, [user, searchParams]);

  const handleAutoVerification = async (token: string) => {
    setLoading(true);
    try {
      // In a real app, you would verify the token here
      // For demo purposes, we'll just show success
      setSuccess(true);
      
      setTimeout(() => {
        redirectUser();
      }, 2000);
    } catch (err) {
      setError('Invalid verification token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = () => {
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'doctor':
          navigate('/doctor/profile');
          break;
        case 'patient':
          navigate('/patient/profile');
          break;
        default:
          navigate('/');
      }
    }
  };

  const resendVerification = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // In a real app, you would call the resend verification API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Verification email sent! Please check your inbox.');
    } catch (err) {
      setError('Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-green-500 mb-6">
              <CheckCircle className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-4">
              Your email has been successfully verified. You'll be redirected to your dashboard shortly.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-blue-600 mb-4">
              <Mail className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="mt-2 text-gray-600">
              We've sent a verification link to <strong>{user?.email}</strong>
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Please check your email and click the verification link to activate your account.
            </p>
          </div>

          {/* Resend Button */}
          <button
            onClick={resendVerification}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already verified?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;