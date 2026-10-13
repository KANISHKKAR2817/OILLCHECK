import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, Mail, User } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'pharmacist'>('user');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters in length.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-navy-950 font-sans">Create PillCheck Account</h2>
          <p className="text-xs text-surface-500">
            Secure digital access for medicine screening & pharmacovigilance
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
            <label className="text-xs font-semibold text-navy-900 font-sans">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-surface-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Jane Smith or Alex Rivera"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-navy-900 font-sans">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-surface-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.smith@pharmacy.org"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-navy-900 font-sans">Password (Min. 8 characters)</label>
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-navy-900 font-sans">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  role === 'user'
                    ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-2xs'
                    : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                Consumer / Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('pharmacist')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  role === 'pharmacist'
                    ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-2xs'
                    : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                Pharmacist / Clinician
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Creating Secure Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-surface-100 text-center">
          <p className="text-xs text-surface-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-800">
              Sign In to Existing Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
