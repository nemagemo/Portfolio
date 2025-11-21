
import React, { useMemo } from 'react';

interface HistoryRow {
  date: string;
  investment: number;
  profit: number;
  totalValue?: number;
}

interface HeatmapProps {
  data: HistoryRow[];
}

const formatPercent = (val: number | null) => {
  if (val === null || val === undefined) return '-';
  return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
};

// Helper to calculate Monthly Return
// Using TWR approximation (Flow at Start)
// R = (V_end - V_start - Flow) / (V_start + Flow)
const calculateMonthlyReturn = (startVal: number, endVal: number, netFlow: number) => {
  const gain = endVal - startVal - netFlow;
  // TWR assumption: Cash flows occur at the beginning of the period
  const denominator = startVal + netFlow; 
  
  if (denominator === 0) return 0;
  return (gain / denominator) * 100;
};

const getColorClass = (val: number | null) => {
  if (val === null || val === undefined) return 'bg-slate-50 text-slate-300';
  if (val >= 10) return 'bg-[#22c55e] text-white font-bold'; // green-500
  if (val >= 5) return 'bg-[#86efac] text-emerald-900 font-semibold'; // green-300
  if (val > 0) return 'bg-[#dcfce7] text-emerald-800'; // green-100
  if (val === 0) return 'bg-slate-100 text-slate-500';
  if (val <= -10) return 'bg-[#ef4444] text-white font-bold'; // red-500
  if (val <= -5) return 'bg-[#fca5a5] text-rose-900 font-semibold'; // red-300
  return 'bg-[#fee2e2] text-rose-800'; // red-100
};

export const ReturnsHeatmap: React.FC<HeatmapProps> = ({ data }) => {
  const processedData = useMemo(() => {
    // robust string-based date parsing to avoid timezone shifts
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
        // LOGIC SHIFT:
        // We want the return GENERATED in Month X-1 (e.g. April) to appear in column Month X (e.g. May).
        // This means Column May (index 4) shows the change from April 1st to May 1st.
        
        const currentKey = `${year}-${month}`; // e.g. May 1st

        let prevYear = year;
        let prevMonth = month - 1;
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear = year - 1;
        }
        const prevKey = `${prevYear}-${prevMonth}`; // e.g. April 1st

        const startState = dataMap.get(prevKey);
        const endState = dataMap.get(currentKey);

        if (startState && endState) {
          const startVal = startState.totalValue || (startState.investment + startState.profit);
          const endVal = endState.totalValue || (endState.investment + endState.profit);
          
          const startInv = startState.investment;
          const endInv = endState.investment;
          const netFlow = endInv - startInv; 

          monthlyReturns[month] = calculateMonthlyReturn(startVal, endVal, netFlow);
        }
      }

      // TWR Aggregation (Geometric Linking) for Quarters and Year
      // Formula: (1 + r1) * (1 + r2) * ... * (1 + rn) - 1
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
    return <div className="p-4 text-center text-slate-400">Brak danych historycznych do obliczenia stóp zwrotu.</div>;
  }

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-center border-collapse border-spacing-0 table-fixed">
        <thead>
          <tr className="text-xs">
            <th className="py-2 text-left text-slate-500 font-bold border-b border-slate-200 w-[8%] sm:w-[6%]">Rok</th>
            {['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'].map(m => (
              <th key={m} className="py-2 text-slate-600 font-semibold border-b border-slate-200 text-[10px] sm:text-xs w-[5%]">{m}</th>
            ))}
            <th className="w-[1%]"></th>
            <th className="py-2 text-slate-800 font-bold border-b border-slate-200 bg-slate-50 text-[10px] sm:text-xs w-[5%]">1Q</th>
            <th className="py-2 text-slate-800 font-bold border-b border-slate-200 bg-slate-50 text-[10px] sm:text-xs w-[5%]">2Q</th>
            <th className="py-2 text-slate-800 font-bold border-b border-slate-200 bg-slate-50 text-[10px] sm:text-xs w-[5%]">3Q</th>
            <th className="py-2 text-slate-800 font-bold border-b border-slate-200 bg-slate-50 text-[10px] sm:text-xs w-[5%]">4Q</th>
            <th className="w-[1%]"></th>
            <th className="py-2 text-slate-900 font-black border-b border-slate-200 bg-slate-100 text-[10px] sm:text-xs w-[6%]">Y</th>
          </tr>
        </thead>
        <tbody>
          {processedData.map(([year, stats]) => (
            <tr key={year} className="border-b border-slate-100 h-8 group hover:bg-slate-50/50 text-xs">
              <td className="text-left font-bold text-slate-700 bg-white group-hover:bg-slate-50/50">{year}</td>
              
              {/* Months */}
              {stats.months.map((val, idx) => (
                <td key={idx} className="p-0.5">
                  <div className={`w-full h-full py-1 rounded-sm flex items-center justify-center text-[9px] sm:text-[10px] leading-none ${getColorClass(val)}`}>
                    {formatPercent(val)}
                  </div>
                </td>
              ))}

              <td className="w-[1%]"></td>

              {/* Quarters */}
              {[0, 1, 2, 3].map((qIdx) => (
                <td key={qIdx} className="p-0.5">
                  <div className={`w-full h-full py-1 rounded-sm flex items-center justify-center font-bold border border-slate-100 text-[9px] sm:text-[10px] leading-none ${getColorClass(stats.quarters[qIdx])}`}>
                    {formatPercent(stats.quarters[qIdx])}
                  </div>
                </td>
              ))}

              <td className="w-[1%]"></td>

              {/* Year */}
              <td className="p-0.5">
                 <div className={`w-full h-full py-1 rounded-sm flex items-center justify-center font-black text-[9px] sm:text-[10px] leading-none border border-slate-200 shadow-sm ${getColorClass(stats.yearTotal)}`}>
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
