import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, Mail, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoAccount = (role: 'admin' | 'pharmacist' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@pillcheck.internal');
      setPassword('AdminPillCheck2026!');
    } else if (role === 'pharmacist') {
      setEmail('pharmacist@pillcheck.internal');
      setPassword('PharmPillCheck2026!');
    } else {
      setEmail('demo@pillcheck.internal');
      setPassword('UserPillCheck2026!');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-navy-950 font-sans">Sign In to PillCheck</h2>
          <p className="text-xs text-surface-500">
            Access your screening dashboard and verified history
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-navy-900 font-sans">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-surface-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-navy-900 font-sans">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-surface-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Local Development Credentials Quick-Select */}
        <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-700">
            <KeyRound className="w-3.5 h-3.5 text-brand-600" />
            <span>Local Evaluation Test Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => setDemoAccount('admin')}
              className="px-2 py-1.5 bg-white hover:bg-brand-50 hover:text-brand-700 border border-surface-200 rounded-lg text-surface-700 font-medium transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('pharmacist')}
              className="px-2 py-1.5 bg-white hover:bg-brand-50 hover:text-brand-700 border border-surface-200 rounded-lg text-surface-700 font-medium transition-colors"
            >
              Pharmacist
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('user')}
              className="px-2 py-1.5 bg-white hover:bg-brand-50 hover:text-brand-700 border border-surface-200 rounded-lg text-surface-700 font-medium transition-colors"
            >
              Citizen
            </button>
          </div>
        </div>

        <div className="pt-2 text-center">
          <p className="text-xs text-surface-500">
            Need an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-800">
              Create PillCheck Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
