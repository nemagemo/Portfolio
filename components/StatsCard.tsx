
import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: number; // Positive or negative number for trend
  trendLabel?: string; // Optional label like "m/m"
  leftTrend?: number; // Secondary trend to display on the left (e.g. 24h)
  leftTrendLabel?: string;
  colorClass?: string;
  className?: string; // New prop for theming overrides
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  trend, 
  trendLabel, 
  leftTrend,
  leftTrendLabel,
  colorClass = "text-blue-600",
  className 
}) => {
  // Default classes if no override is provided via className
  const containerClass = className || "bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300";

  return (
    <div className={`p-4 ${containerClass}`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 truncate pr-2">{title}</h3>
        <div className={`p-1.5 rounded-md bg-opacity-10 shrink-0 ${colorClass}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl sm:text-2xl font-bold tracking-tight truncate">{value}</span>
        
        {(subValue || trend !== undefined || leftTrend !== undefined) && (
          <div className="flex items-center mt-0.5 text-xs sm:text-sm space-x-3">
            {/* Left Trend (e.g. 24h) */}
            {leftTrend !== undefined && (
              <span className={`flex items-center font-bold ${leftTrend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {leftTrend >= 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                {Math.abs(leftTrend).toFixed(2)}%{leftTrendLabel && <span className="ml-1 font-normal opacity-60">{leftTrendLabel}</span>}
              </span>
            )}

            {/* Main Trend (e.g. m/m) */}
            {trend !== undefined && (
              <span className={`flex items-center font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend >= 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                {Math.abs(trend).toFixed(2)}%{trendLabel && <span className="ml-1 font-normal opacity-60">{trendLabel}</span>}
              </span>
            )}
            
            {subValue && <span className="opacity-50 truncate font-medium">{subValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
