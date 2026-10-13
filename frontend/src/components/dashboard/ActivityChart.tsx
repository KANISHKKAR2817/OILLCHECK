import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ActivityPoint } from '../../types';
import { Calendar } from 'lucide-react';

interface ActivityChartProps {
  data: ActivityPoint[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const hasData = data && data.some((d) => d.scans > 0);

  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-navy-950 font-sans">Screening Activity Timeline</h3>
          <p className="text-xs text-surface-400">Total packaging evaluations conducted over time</p>
        </div>
        <div className="p-1.5 rounded-lg bg-surface-50 text-surface-500 border border-surface-200">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {!hasData ? (
        <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-surface-50/50 rounded-xl border border-dashed border-surface-200">
          <p className="text-xs font-semibold text-surface-500">No Historical Scan Volume Recorded</p>
          <p className="text-[11px] text-surface-400 mt-1 max-w-xs">
            Screening scans executed by your account will populate this real timeline chart.
          </p>
        </div>
      ) : (
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#026fc3" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#026fc3" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="elevatedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Area type="monotone" dataKey="scans" name="Total Scans" stroke="#026fc3" strokeWidth={2} fillOpacity={1} fill="url(#scansGradient)" />
              <Area type="monotone" dataKey="elevated_count" name="Elevated Concern" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#elevatedGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
