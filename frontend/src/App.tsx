import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { ScanResultPage } from './pages/ScanResultPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { MedicineSearchPage } from './pages/MedicineSearchPage';
import { ReportSuspiciousPage } from './pages/ReportSuspiciousPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminReferencesPage } from './pages/AdminReferencesPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { MethodologyPage } from './pages/MethodologyPage';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="p-12 text-center text-xs font-mono text-surface-400">Verifying session...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) {
    return <div className="p-12 text-center text-xs font-mono text-surface-400">Verifying privileges...</div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-surface-50 text-surface-900 font-sans selection:bg-brand-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/medicines" element={<MedicineSearchPage />} />
              <Route path="/methodology" element={<MethodologyPage />} />

              {/* Authenticated Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scanner"
                element={
                  <ProtectedRoute>
                    <ScannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scans/:id"
                element={
                  <ProtectedRoute>
                    <ScanResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <ScanHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/new"
                element={
                  <ProtectedRoute>
                    <ReportSuspiciousPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/references"
                element={
                  <AdminRoute>
                    <AdminReferencesPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <AdminRoute>
                    <AdminReportsPage />
                  </AdminRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
