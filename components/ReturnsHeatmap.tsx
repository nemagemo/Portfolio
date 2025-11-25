
import React, { useMemo } from 'react';

interface HistoryRow {
  date: string;
  investment: number;
  profit: number;
  totalValue?: number;
}

interface HeatmapProps {
  data: HistoryRow[];
  themeMode?: 'light' | 'comic' | 'neon';
}

const formatPercent = (val: number | null) => {
  if (val === null || val === undefined) return '-';
  return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
};

const calculateMonthlyReturn = (startVal: number, endVal: number, netFlow: number) => {
  const gain = endVal - startVal - netFlow;
  // Modified Dietz approximation: assuming flows happen mid-month is standard, 
  // but here we use Simple Dietz (start + flow) as denominator. 
  // To be safe against massive ROI spikes on new accounts, ensure denom > 0.
  
  const denominator = startVal + netFlow; 
  
  if (denominator <= 0) return 0;
  return (gain / denominator) * 100;
};

const getColorClass = (val: number | null, themeMode: string = 'light') => {
  const isNeon = themeMode === 'neon';

  if (val === null || val === undefined) {
      return isNeon 
        ? 'bg-[#111] text-[#333] font-mono' 
        : 'bg-slate-50 text-slate-300';
  }

  if (isNeon) {
      // Neon Logic: Dark backgrounds with Bright text and Glows
      if (val >= 10) return 'bg-[#39ff14] text-black font-bold font-mono shadow-[0_0_10px_rgba(57,255,20,0.6)] border border-[#39ff14]'; 
      if (val >= 5) return 'bg-green-900/40 text-[#39ff14] font-bold font-mono border border-[#39ff14]/50'; 
      if (val > 0) return 'bg-green-950/30 text-[#39ff14] font-mono border border-[#39ff14]/30'; 
      if (val === 0) return 'bg-slate-900 text-slate-600 font-mono';
      if (val <= -10) return 'bg-[#ff0055] text-white font-bold font-mono shadow-[0_0_10px_rgba(255,0,85,0.6)] border border-[#ff0055]';
      if (val <= -5) return 'bg-rose-900/40 text-[#ff0055] font-bold font-mono border border-[#ff0055]/50';
      return 'bg-rose-950/30 text-[#ff0055] font-mono border border-[#ff0055]/30';
  }

  // Standard Light/Comic Logic
  if (val >= 10) return 'bg-[#22c55e] text-white font-bold'; // green-500
  if (val >= 5) return 'bg-[#86efac] text-emerald-900 font-semibold'; // green-300
  if (val > 0) return 'bg-[#dcfce7] text-emerald-800'; // green-100
  if (val === 0) return 'bg-slate-100 text-slate-500';
  if (val <= -10) return 'bg-[#ef4444] text-white font-bold'; // red-500
  if (val <= -5) return 'bg-[#fca5a5] text-rose-900 font-semibold'; // red-300
  return 'bg-[#fee2e2] text-rose-800'; // red-100
};

export const ReturnsHeatmap: React.FC<HeatmapProps> = ({ data, themeMode = 'light' }) => {
  const processedData = useMemo(() => {
    // Robust string-based date parsing to avoid timezone shifts that occur with new Date()
    const parseDateKey = (dateStr: string) => {
      const parts = dateStr.split('-'); // Expects YYYY-MM-DD
      if (parts.length < 2) return null;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1; // 0-indexed month
      return { y, m, key: `${y}-${m}` };
    };

    // Sort data chronologically
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    
    if (sorted.length === 0) return [];

    const yearsMap = new Map<number, { 
      months: (number | null)[], 
      quarters: (number | null)[],
      yearTotal: number | null 
    }>();

    const dataMap = new Map<string, HistoryRow>();
    sorted.forEach(row => {
      const keyData = parseDateKey(row.date);
      if (keyData) {
        dataMap.set(keyData.key, row);
      }
    });

    const startYear = parseDateKey(sorted[0].date)?.y || new Date().getFullYear();
    const endYear = parseDateKey(sorted[sorted.length - 1].date)?.y || new Date().getFullYear();

    // Iterate descending for display (Newest year at top)
    for (let year = endYear; year >= startYear; year--) {
      const monthlyReturns: (number | null)[] = Array(12).fill(null);

      for (let month = 0; month < 12; month++) {
        const currentKey = `${year}-${month}`; // e.g. April (index 3)

        let prevYear = year;
        let prevMonth = month - 1;
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear = year - 1;
        }
        const prevKey = `${prevYear}-${prevMonth}`; // e.g. March (index 2)

        const endState = dataMap.get(currentKey);
        const startState = dataMap.get(prevKey);

        if (endState) {
          if (startState) {
            const startVal = startState.totalValue || (startState.investment + startState.profit);
            const endVal = endState.totalValue || (endState.investment + endState.profit);
            const startInv = startState.investment;
            const endInv = endState.investment;
            const netFlow = endInv - startInv; 

            monthlyReturns[month] = calculateMonthlyReturn(startVal, endVal, netFlow);
          } else {
            // Initial month handling:
            // If it's the very first month, Return is typically 0% unless we have partial month data.
            // Here we assume flow happened at start, so return is derived from profit/inv.
            if (endState.investment > 0) {
               monthlyReturns[month] = (endState.profit / endState.investment) * 100;
            } else {
               monthlyReturns[month] = 0;
            }
          }
        }
      }

      // TWR Aggregation (Geometric Linking) for Quarters and Year
      const calculateTWR = (indices: number[]) => {
        let product = 1;
        let hasData = false;
        for (const i of indices) {
          const r = monthlyReturns[i];
          if (r !== null) {
             product *= (1 + (r / 100));
             hasData = true;
          }
        }
        return hasData ? (product - 1) * 100 : null;
      };

      const q1 = calculateTWR([0, 1, 2]);
      const q2 = calculateTWR([3, 4, 5]);
      const q3 = calculateTWR([6, 7, 8]);
      const q4 = calculateTWR([9, 10, 11]);
      
      const y = calculateTWR([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

      yearsMap.set(year, {
        months: monthlyReturns,
        quarters: [q1, q2, q3, q4],
        yearTotal: y
      });
    }

    return Array.from(yearsMap.entries());
  }, [data]);

  if (processedData.length === 0) {
    return <div className={`p-4 text-center ${themeMode === 'neon' ? 'text-cyan-800' : 'text-slate-400'}`}>Brak danych historycznych do obliczenia stóp zwrotu.</div>;
  }

  const isNeon = themeMode === 'neon';
  const headerClass = isNeon 
    ? "py-2 text-cyan-500 font-bold font-mono border-b border-cyan-900/50 text-[10px] sm:text-xs bg-black"
    : "py-2 text-slate-600 font-semibold border-b border-slate-200 text-[10px] sm:text-xs";
  
  const yearHeaderClass = isNeon
    ? "py-2 text-left text-cyan-300 font-bold font-mono border-b border-cyan-900/50 w-[8%] sm:w-[6%] bg-black"
    : "py-2 text-left text-slate-500 font-bold border-b border-slate-200 w-[8%] sm:w-[6%]";

  const tableBgClass = isNeon ? "bg-black" : "bg-transparent";
  const rowBorderClass = isNeon ? "border-cyan-900/30" : "border-slate-100";
  const yearCellClass = isNeon 
    ? "text-left font-bold text-cyan-400 bg-black font-mono"
    : "text-left font-bold text-slate-700 bg-white group-hover:bg-slate-50/50";

  const summaryHeaderClass = (bgClass: string) => isNeon 
    ? "py-2 text-cyan-200 font-bold font-mono border-b border-cyan-900/50 bg-cyan-950/20 text-[10px] sm:text-xs w-[5%]"
    : `py-2 text-slate-800 font-bold border-b border-slate-200 ${bgClass} text-[10px] sm:text-xs w-[5%]`;

  return (
    <div className={`w-full overflow-hidden ${tableBgClass}`}>
      <table className="w-full text-center border-collapse border-spacing-0 table-fixed">
        <thead>
          <tr className="text-xs">
            <th className={yearHeaderClass}>Rok</th>
            {['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'].map(m => (
              <th key={m} className={`${headerClass} w-[5%]`}>{m}</th>
            ))}
            <th className="w-[1%]"></th>
            <th className={summaryHeaderClass('bg-slate-50')}>1Q</th>
            <th className={summaryHeaderClass('bg-slate-50')}>2Q</th>
            <th className={summaryHeaderClass('bg-slate-50')}>3Q</th>
            <th className={summaryHeaderClass('bg-slate-50')}>4Q</th>
            <th className="w-[1%]"></th>
            <th className={`${summaryHeaderClass('bg-slate-100')} w-[6%]`}>Y</th>
          </tr>
        </thead>
        <tbody>
          {processedData.map(([year, stats]) => (
            <tr key={year} className={`border-b ${rowBorderClass} h-8 group text-xs ${isNeon ? '' : 'hover:bg-slate-50/50'}`}>
              <td className={yearCellClass}>{year}</td>
              
              {/* Months */}
              {stats.months.map((val, idx) => (
                <td key={idx} className="p-0.5">
                  <div className={`w-full h-full py-1 rounded-sm flex items-center justify-center text-[9px] sm:text-[10px] leading-none transition-all ${getColorClass(val, themeMode)}`}>
                    {formatPercent(val)}
                  </div>
                </td>
              ))}

              <td className="w-[1%]"></td>

              {/* Quarters */}
              {[0, 1, 2, 3].map((qIdx) => (
                <td key={qIdx} className="p-0.5">
                  <div className={`w-full h-full py-1 rounded-sm flex items-center justify-center font-bold text-[9px] sm:text-[10px] leading-none ${isNeon ? '' : 'border border-slate-100'} ${getColorClass(stats.quarters[qIdx], themeMode)}`}>
                    {formatPercent(stats.quarters[qIdx])}
                  </div>
                </td>
              ))}

              <td className="w-[1%]"></td>

              {/* Year */}
              <td className="p-0.5">
                 <div className={`w-full h-full py-1 rounded-sm flex items-center justify-center font-black text-[9px] sm:text-[10px] leading-none ${isNeon ? '' : 'border border-slate-200 shadow-sm'} ${getColorClass(stats.yearTotal, themeMode)}`}>
                  {formatPercent(stats.yearTotal)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
