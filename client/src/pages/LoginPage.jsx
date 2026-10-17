import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-cream p-8 sm:p-10 rounded-2xl border border-sand-300 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img src="/assets/canzir-logo.png" alt="Canzir" className="h-10 mx-auto" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-walnut">Welcome Back</h1>
          <p className="text-xs text-sand-500">Sign in to track orders, manage addresses, and view your wishlist.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Demo Credentials Helper */}
        <div className="p-3 bg-sand-100 rounded-lg border border-sand-200 text-[11px] text-walnut-700 space-y-1">
          <p className="font-semibold text-bamboo">Demo Credentials:</p>
          <p>Admin: <code className="bg-white px-1 rounded">admin@canzir.com</code> / <code className="bg-white px-1 rounded">admin123456</code></p>
          <p>Customer: <code className="bg-white px-1 rounded">customer@canzir.com</code> / <code className="bg-white px-1 rounded">customer123456</code></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-walnut mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@canzir.com"
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 pl-9 text-xs text-walnut focus:outline-none focus:border-bamboo"
              />
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-walnut mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 pl-9 text-xs text-walnut focus:outline-none focus:border-bamboo"
              />
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-walnut hover:bg-walnut-700 text-cream font-semibold rounded text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-sand-500 border-t border-sand-200">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-semibold text-bamboo hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
