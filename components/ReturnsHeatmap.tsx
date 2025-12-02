
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
      if (val >= 10) return 'bg-[#064e3b] text-[#39ff14] font-bold font-mono shadow-[0_0_5px_rgba(57,255,20,0.3)] border border-[#39ff14]/30';
      if (val >= 0) return 'bg-[#064e3b]/50 text-[#39ff14] font-mono border border-[#39ff14]/20';
      if (val <= -10) return 'bg-[#881337] text-[#ff0055] font-bold font-mono shadow-[0_0_5px_rgba(255,0,85,0.3)] border border-[#ff0055]/30';
      return 'bg-[#881337]/50 text-[#ff0055] font-mono border border-[#ff0055]/20';
  }

  // Standard Light Logic
  if (val >= 10) return 'bg-emerald-500 text-white font-bold';
  if (val >= 5) return 'bg-emerald-400 text-white font-semibold';
  if (val >= 2) return 'bg-emerald-300 text-emerald-900';
  if (val > 0) return 'bg-emerald-100 text-emerald-800';
  
  if (val <= -10) return 'bg-rose-500 text-white font-bold';
  if (val <= -5) return 'bg-rose-400 text-white font-semibold';
  if (val <= -2) return 'bg-rose-300 text-rose-900';
  return 'bg-rose-100 text-rose-800';
};

export const ReturnsHeatmap: React.FC<HeatmapProps> = ({ data, themeMode = 'light' }) => {
  const years = useMemo(() => {
    if (data.length === 0) return [];
    
    // Create Map for quick lookup by YYYY-MM
    const dataMap = new Map<string, HistoryRow>();
    data.forEach(r => dataMap.set(r.date.substring(0, 7), r));

    // Determine range
    const sortedDates = data.map(r => r.date).sort();
    const startYear = parseInt(sortedDates[0].split('-')[0]);
    const endYear = parseInt(sortedDates[sortedDates.length - 1].split('-')[0]);

    const result = [];
    for (let y = endYear; y >= startYear; y--) {
      const months = [];
      let yearStartVal = 0;
      let yearEndVal = 0;
      let yearFlow = 0;

      // Get Year Start Value (December of prev year)
      const prevDecKey = `${y - 1}-12`;
      const prevDec = dataMap.get(prevDecKey);
      if (prevDec) {
          yearStartVal = prevDec.totalValue ?? (prevDec.investment + prevDec.profit);
      }

      for (let m = 1; m <= 12; m++) {
        const mStr = String(m).padStart(2, '0');
        const key = `${y}-${mStr}`;
        const prevKey = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
        
        const curr = dataMap.get(key);
        const prev = dataMap.get(prevKey);

        let ret: number | null = null;

        if (curr) {
           const currVal = curr.totalValue ?? (curr.investment + curr.profit);
           
           if (m === 12 || !dataMap.has(`${y}-${String(m+1).padStart(2,'0')}`)) {
               yearEndVal = currVal;
           }

           if (prev) {
               const prevVal = prev.totalValue ?? (prev.investment + prev.profit);
               const flow = curr.investment - prev.investment;
               yearFlow += flow;
               ret = calculateMonthlyReturn(prevVal, currVal, flow);
           } else {
               // First month ever?
               if (curr.investment > 0) {
                   ret = (curr.profit / curr.investment) * 100;
                   yearFlow += curr.investment;
                   if (m === 12) yearEndVal = currVal; // Edge case single month year
               }
           }
        }
        months.push(ret);
      }

      // Calculate Quarterly Returns
      const quarters = [];
      for (let q = 0; q < 4; q++) {
          const m1 = months[q*3];
          const m2 = months[q*3+1];
          const m3 = months[q*3+2];
          
          let qRet: number | null = null;
          // Simple compounding for approximation or linking if available
          // Here we do simple linking: (1+r1)(1+r2)(1+r3) - 1
          if (m1 !== null || m2 !== null || m3 !== null) {
              let prod = 1;
              if (m1 !== null) prod *= (1 + m1/100);
              if (m2 !== null) prod *= (1 + m2/100);
              if (m3 !== null) prod *= (1 + m3/100);
              qRet = (prod - 1) * 100;
          }
          quarters.push(qRet);
      }

      // Calculate Year Return
      let yRet: number | null = null;
      // If we have valid start and end points
      // However, dataMap might be sparse. Let's use geometric linking of all available months.
      const validMonths = months.filter(m => m !== null) as number[];
      if (validMonths.length > 0) {
          yRet = (validMonths.reduce((acc, r) => acc * (1 + r/100), 1) - 1) * 100;
      }

      result.push({ year: y, months, quarters, yRet });
    }
    return result;
  }, [data]);

  const isNeon = themeMode === 'neon';
  const headerClass = isNeon ? "text-cyan-400 font-mono tracking-wider" : "text-slate-500 font-semibold";
  const rowYearClass = isNeon ? "text-cyan-100 font-bold font-mono" : "text-slate-900 font-bold";
  const bgClass = isNeon ? "bg-black/40 border-cyan-900/30" : "bg-white border-slate-100";

  return (
    <div className={`overflow-x-auto ${isNeon ? 'bg-black/20' : ''}`}>
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className={`text-[9px] md:text-[10px] lg:text-xs ${isNeon ? 'border-b border-cyan-900/30' : 'border-b border-slate-200'}`}>
            <th className={`p-1 md:py-1 lg:py-2 text-left ${headerClass}`}>Rok</th>
            {['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'].map(m => (
              <th key={m} className={`p-1 md:py-1 lg:py-2 ${headerClass}`}>{m}</th>
            ))}
            <th className="p-1 md:py-1 lg:py-2 w-2"></th>
            {['1Q', '2Q', '3Q', '4Q'].map(q => (
                <th key={q} className={`p-1 md:py-1 lg:py-2 ${isNeon ? 'text-purple-400 font-mono' : 'text-slate-500 font-bold bg-slate-50'}`}>{q}</th>
            ))}
            <th className="p-1 md:py-1 lg:py-2 w-2"></th>
            <th className={`p-1 md:py-1 lg:py-2 ${isNeon ? 'text-yellow-400 font-bold font-mono' : 'text-slate-900 font-bold bg-slate-100'}`}>Y</th>
          </tr>
        </thead>
        <tbody className={`text-[8px] md:text-[8px] lg:text-[10px]`}>
          {years.map(({ year, months, quarters, yRet }) => (
            <tr key={year} className={`h-6 lg:h-8 ${isNeon ? 'border-b border-cyan-900/10' : 'border-b border-slate-50'}`}>
              <td className={`text-left p-1 ${rowYearClass}`}>{year}</td>
              
              {months.map((m, i) => (
                <td key={i} className="p-0.5 lg:p-1">
                  <div className={`w-full h-full flex items-center justify-center rounded py-0.5 ${getColorClass(m, themeMode)}`}>
                    {formatPercent(m)}
                  </div>
                </td>
              ))}
              
              <td></td>

              {quarters.map((q, i) => (
                 <td key={i} className="p-0.5 lg:p-1">
                    <div className={`w-full h-full flex items-center justify-center rounded py-0.5 font-bold ${getColorClass(q, themeMode)}`}>
                        {formatPercent(q)}
                    </div>
                 </td>
              ))}

              <td></td>

              <td className="p-0.5 lg:p-1">
                 <div className={`w-full h-full flex items-center justify-center rounded py-0.5 font-black border ${isNeon ? 'border-yellow-500/30' : 'border-slate-300'} ${getColorClass(yRet, themeMode)}`}>
                    {formatPercent(yRet)}
                 </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
