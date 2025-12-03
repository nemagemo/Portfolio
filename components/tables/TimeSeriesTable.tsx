
import React from 'react';
import { AnyDataRow, PPKDataRow, CryptoDataRow, IKEDataRow, PortfolioType } from '../../types';

interface TimeSeriesTableProps {
  data: AnyDataRow[];
  type: PortfolioType;
  themeMode?: 'light' | 'comic' | 'neon' | 'dark';
}

export const TimeSeriesTable: React.FC<TimeSeriesTableProps> = ({ data, type, themeMode = 'light' }) => {
  
  // Sort data descending by date (newest first)
  const sortedData = [...data].reverse();

  // Styles
  const isNeon = themeMode === 'neon';
  const isComic = themeMode === 'comic';
  const isDark = themeMode === 'dark';
  
  const getHeaderClass = () => {
    if (isNeon) return "text-[10px] md:text-xs font-mono text-cyan-400 uppercase bg-black/80 border-b border-cyan-900/50 tracking-wider";
    if (isComic) return "text-[10px] md:text-xs font-bold text-white uppercase bg-black border-b-2 border-white tracking-widest";
    if (isDark) return "text-[10px] md:text-xs text-slate-300 uppercase bg-slate-800 border-b border-slate-700";
    return "text-[10px] md:text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200";
  };

  const getRowClass = (index: number) => {
    if (isNeon) {
        return `border-b border-cyan-900/20 transition-all hover:bg-cyan-900/10 ${index % 2 === 0 ? 'bg-[#050505]' : 'bg-[#080808]'}`;
    }
    if (isComic) {
        return `border-b-2 border-white transition-all hover:bg-zinc-900 ${index % 2 === 0 ? 'bg-black' : 'bg-zinc-950'}`;
    }
    if (isDark) {
        return `border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`;
    }
    return `border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`;
  };

  const getTextClass = (isBold = false) => {
    if (isNeon) return isBold ? "text-cyan-100 font-bold font-mono" : "text-cyan-300/80 font-mono";
    if (isComic) return isBold ? "text-white font-black" : "text-white font-bold";
    if (isDark) return isBold ? "text-slate-100 font-bold" : "text-slate-300 font-medium";
    return isBold ? "text-slate-900 font-bold" : "text-slate-600 font-medium";
  };

  const getProfitClass = (val: number) => {
    if (isNeon) {
        return val >= 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono';
    }
    if (isComic) {
        return val >= 0 ? 'text-green-400 font-black' : 'text-red-500 font-black';
    }
    if (isDark) {
        return val >= 0 ? 'text-emerald-400' : 'text-rose-400';
    }
    return val >= 0 ? 'text-emerald-600' : 'text-rose-600';
  };

  const getBadgeClass = (val: number) => {
    if (isNeon) {
        const color = val >= 0 ? 'border-emerald-500 text-emerald-400' : 'border-rose-500 text-rose-400';
        return `px-1.5 py-0.5 md:px-2 md:py-1 rounded-none border ${color} bg-black/50 text-[10px] md:text-xs font-mono`;
    }
    if (isComic) {
        const bg = val >= 0 ? 'bg-green-500 text-black' : 'bg-red-500 text-white';
        return `px-1.5 py-0.5 md:px-2 md:py-1 rounded-none border-2 border-white ${bg} text-[10px] md:text-xs font-black shadow-[2px_2px_0px_white]`;
    }
    if (isDark) {
        return `px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${val >= 0 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'}`;
    }
    return `px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${val >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full text-[10px] md:text-[11px] lg:text-sm text-left ${isNeon ? 'text-cyan-300 font-mono' : (isComic ? 'text-white' : (isDark ? 'text-slate-300' : 'text-slate-600'))}`}>
        <thead className={getHeaderClass()}>
          <tr>
            <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold">Data</th>
            <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right">Wartość</th>
            <th className={`px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right ${isNeon ? 'text-blue-400' : (isComic ? 'text-cyan-400' : (isDark ? 'text-blue-400' : 'text-blue-600'))}`}>Wkład</th>
            
            {type === 'PPK' && (
              <>
                <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right">Pracodawca</th>
                <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right">Państwo</th>
              </>
            )}
            
            <th className={`px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right ${isNeon ? 'text-emerald-400' : (isComic ? 'text-green-400' : (isDark ? 'text-emerald-400' : 'text-emerald-600'))}`}>Zysk</th>
            <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right">ROI</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((rowItem, index) => {
            const row = rowItem as PPKDataRow | CryptoDataRow | IKEDataRow;
            const isPPK = type === 'PPK';
            
            let investment = 0;
            if (isPPK) {
              investment = (row as PPKDataRow).employeeContribution;
            } else {
              investment = (row as CryptoDataRow | IKEDataRow).investment;
            }

            const ppkRow = isPPK ? (row as PPKDataRow) : null;

            return (
              <tr key={row.date} className={getRowClass(index)}>
                <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-6 lg:py-4 font-medium whitespace-nowrap ${getTextClass(false)}`}>
                  {row.date}
                </td>
                <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-6 lg:py-4 text-right ${getTextClass(true)}`}>
                  {(row.totalValue || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                </td>
                <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-6 lg:py-4 text-right ${isNeon ? 'text-blue-300' : (isComic ? 'text-cyan-300' : (isDark ? 'text-blue-300' : ''))}`}>
                  {(investment || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                </td>
                
                {isPPK && ppkRow && (
                  <>
                    <td className="px-1 py-1.5 md:px-1 md:py-2 lg:px-6 lg:py-4 text-right">
                      {(ppkRow.employerContribution || 0).toLocaleString('pl-PL', { minimumFractionDigits: 0 })} zł
                    </td>
                    <td className="px-1 py-1.5 md:px-1 md:py-2 lg:px-6 lg:py-4 text-right">
                      {(ppkRow.stateContribution || 0) > 0 ? `${(ppkRow.stateContribution || 0).toLocaleString('pl-PL', { minimumFractionDigits: 0 })} zł` : '-'}
                    </td>
                  </>
                )}

                <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-6 lg:py-4 text-right font-medium ${getProfitClass(row.profit || 0)}`}>
                  {(row.profit || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                </td>
                <td className="px-1 py-1.5 md:px-1 md:py-2 lg:px-6 lg:py-4 text-right">
                  <span className={getBadgeClass(row.roi || 0)}>
                    {row.roi}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
