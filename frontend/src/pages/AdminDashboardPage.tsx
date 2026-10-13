import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { SystemHealth } from '../types';
import { 
  Lock, 
  Activity, 
  Database, 
  FileText, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  Cpu, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [healthData, logsData] = await Promise.all([
        api.getAdminHealth(),
        api.getAuditLogs(15),
      ]);
      setHealth(healthData);
      setAuditLogs(logsData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load administrator telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-navy-900 text-brand-400">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950 font-sans tracking-tight">
              Administration & System Health
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Real-time infrastructure health, storage writability, and regulatory incident queues
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/references"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Manage Formularies & CSV Import
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Review Suspicious Reports Queue
          </Link>
        </div>
      </div>

      {errorMsg ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {errorMsg}
        </div>
      ) : isLoading ? (
        <p className="text-xs font-mono text-surface-400 text-center py-12">Querying system telemetry...</p>
      ) : health ? (
        <>
          {/* Health Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-surface-200 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-500">Database Engine</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${health.database_connected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {health.database_connected ? 'Connected' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-navy-950 font-bold text-base">
                <Database className="w-4 h-4 text-brand-600" />
                <span>SQL Relational Store</span>
              </div>
              <p className="text-[11px] text-surface-400 font-mono">SQLite / PostgreSQL active</p>
            </div>

            <div className="p-5 bg-white border border-surface-200 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-500">OCR & Vision Pipeline</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700">
                  Ready
                </span>
              </div>
              <div className="flex items-center gap-2 text-navy-950 font-bold text-xs truncate">
                <Cpu className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="truncate">{health.ocr_engine_name}</span>
              </div>
              <p className="text-[11px] text-surface-400 font-mono">Laplacian & OpenCV Ready</p>
            </div>

            <div className="p-5 bg-white border border-surface-200 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-500">Secure Storage</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${health.storage_writable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {health.storage_writable ? 'Writable' : 'Read-only'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-navy-950 font-bold text-base">
                <HardDrive className="w-4 h-4 text-brand-600" />
                <span>Isolated Uploads Directory</span>
              </div>
              <p className="text-[11px] text-surface-400 font-mono">UUID path traversal locked</p>
            </div>

            <div className="p-5 bg-white border border-surface-200 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-500">Decision Engine</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-brand-50 text-brand-700">
                  {health.engine_version}
                </span>
              </div>
              <div className="flex items-center gap-2 text-navy-950 font-bold text-base">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Rule Synthesis Active</span>
              </div>
              <p className="text-[11px] text-surface-400 font-mono">Explainable scoring</p>
            </div>
          </div>

          {/* Record Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-center">
              <span className="text-2xl font-black font-mono text-navy-950">{health.total_references}</span>
              <p className="text-xs text-surface-500 mt-0.5">Medicine References</p>
            </div>
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-center">
              <span className="text-2xl font-black font-mono text-navy-950">{health.total_scans}</span>
              <p className="text-xs text-surface-500 mt-0.5">Evaluated Packaging Scans</p>
            </div>
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-center">
              <span className="text-2xl font-black font-mono text-navy-950">{health.total_reports}</span>
              <p className="text-xs text-surface-500 mt-0.5">Filed Incident Reports</p>
            </div>
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-center">
              <span className="text-2xl font-black font-mono text-navy-950">{health.total_users}</span>
              <p className="text-xs text-surface-500 mt-0.5">Registered Users</p>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100">
              <div>
                <h3 className="text-sm font-bold text-navy-950 font-sans">System Audit Logs</h3>
                <p className="text-xs text-surface-400">Cryptographically verifiable actions and state transitions</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 text-surface-500 uppercase font-mono text-[10px] border-b border-surface-100">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                    <th className="py-2.5 px-4 font-semibold">Action</th>
                    <th className="py-2.5 px-4 font-semibold">Target Entity</th>
                    <th className="py-2.5 px-4 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-50/50">
                      <td className="py-2.5 px-4 text-surface-400">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-brand-700">{log.action}</td>
                      <td className="py-2.5 px-4 text-surface-600">{log.resource_type} ({log.resource_id?.slice(0, 8)})</td>
                      <td className="py-2.5 px-4 text-surface-500">{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
