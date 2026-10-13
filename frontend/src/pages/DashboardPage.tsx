import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardAnalytics } from '../types';
import { StatCard } from '../components/dashboard/StatCard';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { RecentScansTable } from '../components/dashboard/RecentScansTable';
import { 
  ScanLine, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  XCircle, 
  FileText,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getDashboardAnalytics();
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-sans tracking-tight">
              Screening Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-brand-50 text-brand-700 uppercase border border-brand-200">
              {user?.role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Persisted metrics and pharmacovigilance screening summaries for {user?.full_name}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-xl border border-surface-200 text-surface-600 hover:text-navy-900 hover:bg-surface-50 transition-colors"
            title="Refresh database metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/scanner"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <ScanLine className="w-4 h-4" />
            <span>New Medicine Scan</span>
          </Link>
        </div>
      </div>

      {errorMsg ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {errorMsg}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-surface-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Stat Cards - Genuine SQL aggregates */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <StatCard
              title="Total Evaluations"
              value={data.summary.total_scans}
              subtitle="All packaging scans"
              icon={ScanLine}
              variant="brand"
            />
            <StatCard
              title="Low Risk"
              value={data.summary.low_risk_count}
              subtitle="No warnings found"
              icon={ShieldCheck}
              variant="success"
            />
            <StatCard
              title="Verification Needed"
              value={data.summary.needs_verification_count}
              subtitle="Review required"
              icon={AlertTriangle}
              variant="warning"
            />
            <StatCard
              title="Elevated Concern"
              value={data.summary.elevated_concern_count}
              subtitle="Material conflicts"
              icon={AlertOctagon}
              variant="danger"
            />
            <StatCard
              title="Unresolved Failures"
              value={data.summary.processing_failures}
              subtitle="Blur / low quality"
              icon={XCircle}
              variant="neutral"
            />
            <StatCard
              title="Reports Filed"
              value={data.summary.total_reports_submitted}
              subtitle="Suspicious medicines"
              icon={FileText}
              variant="warning"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityChart data={data.activity_timeline} />
            </div>
            <div>
              <RiskDistributionChart data={data.risk_distribution} />
            </div>
          </div>

          {/* Recent Scans Table */}
          <div>
            <RecentScansTable scans={data.recent_scans} />
          </div>
        </>
      ) : null}
    </div>
  );
};
