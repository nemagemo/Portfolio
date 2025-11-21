
import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: number; // Positive or negative number for trend
  trendLabel?: string; // Optional label like "m/m"
  colorClass?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon: Icon, trend, trendLabel, colorClass = "text-blue-600" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className={`p-2 rounded-lg bg-slate-50 ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {(subValue || trend !== undefined) && (
          <div className="flex items-center mt-1 text-sm">
            {trend !== undefined && (
              <span className={`flex items-center font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend >= 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                {Math.abs(trend).toFixed(2)}%{trendLabel && <span className="ml-1 font-normal text-slate-500">{trendLabel}</span>}
              </span>
            )}
            {subValue && <span className="text-slate-400 ml-2">{subValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
