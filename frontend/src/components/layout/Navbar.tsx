import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  ScanLine, 
  History, 
  Search, 
  AlertTriangle, 
  LayoutDashboard, 
  UserCircle, 
  LogOut, 
  Menu, 
  X,
  Lock
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-navy-900 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-navy-950 font-sans">PillCheck</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 rounded border border-brand-200">v2.1</span>
              </div>
              <p className="text-[11px] text-surface-400 font-medium tracking-tight hidden sm:block">Screen Smart. Verify Better. Stay Safe.</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'bg-brand-50 text-brand-700' : 'text-surface-700 hover:text-navy-900 hover:bg-surface-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/scanner"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/scanner') ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'text-surface-700 hover:text-navy-900 hover:bg-surface-100'
                  }`}
                >
                  <ScanLine className="w-4 h-4" />
                  Scan Medicine
                </Link>
                <Link
                  to="/history"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/history') ? 'bg-brand-50 text-brand-700' : 'text-surface-700 hover:text-navy-900 hover:bg-surface-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </Link>
                <Link
                  to="/medicines"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/medicines') ? 'bg-brand-50 text-brand-700' : 'text-surface-700 hover:text-navy-900 hover:bg-surface-100'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Formulary Search
                </Link>
                <Link
                  to="/reports/new"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/reports/new') ? 'bg-amber-50 text-amber-800' : 'text-surface-700 hover:text-navy-900 hover:bg-surface-100'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Report Suspicious
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive('/admin') ? 'bg-navy-900 text-white' : 'text-navy-800 hover:bg-surface-100'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-brand-500" />
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/medicines" className="px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:text-navy-900 hover:bg-surface-100">
                  Reference Formulary
                </Link>
                <Link to="/methodology" className="px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:text-navy-900 hover:bg-surface-100">
                  Methodology & Safety
                </Link>
              </>
            )}
          </nav>

          {/* User controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-surface-200">
                <Link to="/profile" className="flex items-center gap-2 text-left group">
                  <div className="w-8 h-8 rounded-full bg-surface-100 border border-surface-300 flex items-center justify-center text-navy-800 font-semibold text-xs">
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-navy-950 group-hover:text-brand-600 transition-colors leading-tight">{user.full_name}</p>
                    <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-mono capitalize bg-surface-100 text-surface-700">
                      {user.role}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-navy-900 hover:text-brand-600 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-surface-700 hover:bg-surface-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="pb-3 border-b border-surface-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-navy-950">{user?.full_name}</p>
                  <p className="text-xs text-surface-400">{user?.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono uppercase bg-brand-50 text-brand-700 font-medium">
                  {user?.role}
                </span>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-600" />
                Dashboard
              </Link>
              <Link
                to="/scanner"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-brand-600 text-white"
              >
                <ScanLine className="w-4 h-4" />
                Scan Medicine
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100"
              >
                <History className="w-4 h-4 text-brand-600" />
                Scan History
              </Link>
              <Link
                to="/medicines"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100"
              >
                <Search className="w-4 h-4 text-brand-600" />
                Formulary Catalog
              </Link>
              <Link
                to="/reports/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-800 bg-amber-50"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Report Suspicious Product
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-900 bg-surface-100"
                >
                  <Lock className="w-4 h-4 text-brand-600" />
                  Admin Console
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-100"
              >
                <UserCircle className="w-4 h-4 text-brand-600" />
                Profile & Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-navy-900 bg-surface-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600"
              >
                Create Account
              </Link>
              <Link
                to="/methodology"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm text-surface-600"
              >
                Methodology & Limitations
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
