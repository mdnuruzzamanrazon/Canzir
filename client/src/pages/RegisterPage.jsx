import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await register(name, email, password, phone);
      navigate('/account');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-cream p-8 sm:p-10 rounded-2xl border border-sand-300 shadow-md space-y-6">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block">
            <img
              src="/assets/canzir-logo.png"
              alt="Canzir"
              className="h-16 sm:h-20 w-auto mx-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <h1 className="font-display text-2xl font-bold text-walnut">Join Canzir Atelier</h1>
          <p className="text-xs text-sand-500">Create an account to save curated wishlists and track orders.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-walnut mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nuzhat Chowdhury"
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 pl-9 text-xs text-walnut focus:outline-none focus:border-bamboo"
              />
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-walnut mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nuzhat@example.com"
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 pl-9 text-xs text-walnut focus:outline-none focus:border-bamboo"
              />
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-walnut mb-1">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 pl-9 text-xs text-walnut focus:outline-none focus:border-bamboo"
              />
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-walnut mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-sand-500 border-t border-sand-200">
          <span>Already have an account? </span>
          <Link to="/login" className="font-semibold text-bamboo hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
