
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
  variant?: 'default' | 'primary' | 'progress';
  progress?: number; // 0 to 100
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
  className,
  variant = 'default',
  progress
}) => {
  // Default classes if no override is provided via className
  const containerClass = className || "bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300";

  // --- Progress Ring Logic ---
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((progress || 0) / 100) * circumference;

  return (
    <div className={`p-4 flex flex-col justify-between ${containerClass} ${variant === 'primary' ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 truncate pr-2">{title}</h3>
        <div className={`p-1.5 rounded-md bg-opacity-10 shrink-0 ${colorClass}`}>
          <Icon size={variant === 'primary' ? 24 : 18} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex flex-col w-full">
          {variant === 'progress' && progress !== undefined ? (
             <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12">
                   <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-10" />
                      <circle 
                        cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ease-out ${colorClass.replace('bg-opacity-10', '')}`}
                      />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      {Math.round(progress)}%
                   </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-xl font-bold tracking-tight">{value}</span>
                   {subValue && <span className="text-[10px] opacity-50 font-medium">{subValue}</span>}
                </div>
             </div>
          ) : (
             <>
                <span className={`${variant === 'primary' ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'} font-bold tracking-tight truncate`}>{value}</span>
                
                {(subValue || trend !== undefined || leftTrend !== undefined) && (
                  <div className="flex items-center mt-0.5 text-xs sm:text-sm space-x-3">
                    {/* Left Trend (e.g. 24h) */}
                    {leftTrend !== undefined && (
                      <span className={`flex items-center font-bold ${leftTrend >= 0 ? (containerClass.includes('bg-black') ? 'text-[#33ff00]' : 'text-emerald-600') : (containerClass.includes('bg-black') ? 'text-[#ff0000]' : 'text-rose-600')}`}>
                        {leftTrend >= 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                        {Math.abs(leftTrend).toFixed(2)}%{leftTrendLabel && <span className="ml-1 font-normal opacity-60">{leftTrendLabel}</span>}
                      </span>
                    )}

                    {/* Main Trend (e.g. m/m) */}
                    {trend !== undefined && (
                      <span className={`flex items-center font-bold ${trend >= 0 ? (containerClass.includes('bg-black') ? 'text-[#33ff00]' : 'text-emerald-600') : (containerClass.includes('bg-black') ? 'text-[#ff0000]' : 'text-rose-600')}`}>
                        {trend >= 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                        {Math.abs(trend).toFixed(2)}%{trendLabel && <span className="ml-1 font-normal opacity-60">{trendLabel}</span>}
                      </span>
                    )}
                    
                    {subValue && <span className="opacity-50 truncate font-medium">{subValue}</span>}
                  </div>
                )}
             </>
          )}
        </div>
      </div>
    </div>
  );
};