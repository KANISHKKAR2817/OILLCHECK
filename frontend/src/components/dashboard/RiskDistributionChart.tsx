import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { StatusCount } from '../../types';
import { PieChart as PieIcon } from 'lucide-react';

interface RiskDistributionChartProps {
  data: StatusCount[];
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const colors: Record<string, string> = {
    'Low Observed Risk': '#10b981',
    'Needs Verification': '#f59e0b',
    'Elevated Concern': '#ef4444',
    'Failed / Inconclusive': '#94a3b8',
  };

  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-navy-950 font-sans">Risk Band Breakdown</h3>
          <p className="text-xs text-surface-400">Classification distribution across evaluated products</p>
        </div>
        <div className="p-1.5 rounded-lg bg-surface-50 text-surface-500 border border-surface-200">
          <PieIcon className="w-4 h-4" />
        </div>
      </div>

      {total === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-surface-50/50 rounded-xl border border-dashed border-surface-200">
          <p className="text-xs font-semibold text-surface-500">No Risk Classification Data</p>
          <p className="text-[11px] text-surface-400 mt-1 max-w-xs">
            Completed scans will categorize into Low Risk, Needs Verification, and Elevated Concern.
          </p>
        </div>
      ) : (
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Bar dataKey="count" name="Evaluations" radius={[0, 6, 6, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[entry.name] || '#026fc3'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
