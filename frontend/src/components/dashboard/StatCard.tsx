import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'neutral',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'brand':
        return 'text-brand-600 bg-brand-50 border-brand-200/60';
      case 'success':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200/60';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200/60';
      case 'danger':
        return 'text-red-600 bg-red-50 border-red-200/60';
      case 'neutral':
      default:
        return 'text-surface-700 bg-surface-100 border-surface-200';
    }
  };

  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-surface-500 font-sans">{title}</span>
        <div className={`p-2 rounded-xl border ${getVariantStyles()}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-black text-navy-950 font-mono tracking-tight">{value}</span>
        <p className="text-[11px] text-surface-400 mt-1 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};
