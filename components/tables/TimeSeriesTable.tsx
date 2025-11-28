
import React from 'react';
import { AnyDataRow, PPKDataRow, CryptoDataRow, IKEDataRow, PortfolioType } from '../../types';

interface TimeSeriesTableProps {
  data: AnyDataRow[];
  type: PortfolioType;
  themeMode?: 'light' | 'comic' | 'neon';
}

export const TimeSeriesTable: React.FC<TimeSeriesTableProps> = ({ data, type, themeMode = 'light' }) => {
  
  // Sort data descending by date (newest first)
  const sortedData = [...data].reverse();

  // Styles
  const isNeon = themeMode === 'neon';
  
  const getHeaderClass = () => {
    if (isNeon) return "text-xs font-mono text-cyan-400 uppercase bg-black/80 border-b border-cyan-900/50 tracking-wider";
    return "text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200";
  };

  const getRowClass = (index: number) => {
    if (isNeon) {
        return `border-b border-cyan-900/20 transition-all hover:bg-cyan-900/10 ${index % 2 === 0 ? 'bg-[#050505]' : 'bg-[#080808]'}`;
    }
    return `border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`;
  };

  const getTextClass = (isBold = false) => {
    if (isNeon) return isBold ? "text-cyan-100 font-bold font-mono" : "text-cyan-300/80 font-mono";
    return isBold ? "text-slate-900 font-bold" : "text-slate-600 font-medium";
  };

  const getProfitClass = (val: number) => {
    if (isNeon) {
        return val >= 0 
            ? 'text-[#39ff14] font-mono drop-shadow-[0_0_3px_rgba(57,255,20,0.5)]' 
            : 'text-[#ff0055] font-mono drop-shadow-[0_0_3px_rgba(255,0,85,0.5)]';
    }
    return val >= 0 ? 'text-emerald-600' : 'text-rose-600';
  };

  const getBadgeClass = (val: number) => {
    if (isNeon) {
        const color = val >= 0 ? 'border-[#39ff14] text-[#39ff14]' : 'border-[#ff0055] text-[#ff0055]';
        return `px-2 py-1 rounded-none border ${color} bg-black/50 text-xs font-mono shadow-[0_0_5px_rgba(0,0,0,0.5)]`;
    }
    return `px-2 py-1 rounded-full text-xs font-semibold ${val >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full text-sm text-left ${isNeon ? 'text-cyan-300 font-mono' : 'text-slate-600'}`}>
        <thead className={getHeaderClass()}>
          <tr>
            <th className="px-6 py-3 font-semibold">Data</th>
            <th className="px-6 py-3 font-semibold text-right">Wartość Całkowita</th>
            <th className={`px-6 py-3 font-semibold text-right ${isNeon ? 'text-blue-400' : 'text-blue-600'}`}>Wkład Własny</th>
            
            {type === 'PPK' && (
              <>
                <th className="px-6 py-3 font-semibold text-right">Pracodawca</th>
                <th className="px-6 py-3 font-semibold text-right">Państwo</th>
              </>
            )}
            
            <th className={`px-6 py-3 font-semibold text-right ${isNeon ? 'text-[#39ff14]' : 'text-emerald-600'}`}>Zysk</th>
            <th className="px-6 py-3 font-semibold text-right">ROI</th>
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
                <td className={`px-6 py-4 font-medium whitespace-nowrap ${getTextClass(false)}`}>
                  {row.date}
                </td>
                <td className={`px-6 py-4 text-right ${getTextClass(true)}`}>
                  {(row.totalValue || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                </td>
                <td className={`px-6 py-4 text-right ${isNeon ? 'text-blue-300' : ''}`}>
                  {(investment || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                </td>
                
                {isPPK && ppkRow && (
                  <>
                    <td className="px-6 py-4 text-right">
                      {(ppkRow.employerContribution || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(ppkRow.stateContribution || 0) > 0 ? `${(ppkRow.stateContribution || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł` : '-'}
                    </td>
                  </>
                )}

                <td className={`px-6 py-4 text-right font-medium ${getProfitClass(row.profit || 0)}`}>
                  {(row.profit || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                </td>
                <td className="px-6 py-4 text-right">
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
