
import React from 'react';
import { AnyDataRow, PPKDataRow, CryptoDataRow, IKEDataRow, PortfolioType } from '../../types';

interface TimeSeriesTableProps {
  data: AnyDataRow[];
  type: PortfolioType;
  themeMode?: 'light';
}

export const TimeSeriesTable: React.FC<TimeSeriesTableProps> = ({ data, type }) => {
  
  // Sort data descending by date (newest first)
  const sortedData = [...data].reverse();

  // Styles
  const getHeaderClass = () => {
    return "text-[10px] md:text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200";
  };

  const getRowClass = (index: number) => {
    return `border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`;
  };

  const getTextClass = (isBold = false) => {
    return isBold ? "text-slate-900 font-bold" : "text-slate-600 font-medium";
  };

  const getProfitClass = (val: number) => {
    return val >= 0 ? 'text-emerald-600' : 'text-rose-600';
  };

  const getBadgeClass = (val: number) => {
    return `px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${val >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-[10px] md:text-[11px] lg:text-sm text-left text-slate-600">
        <thead className={getHeaderClass()}>
          <tr>
            <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold">Data</th>
            <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right">Wartość</th>
            <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right text-blue-600">Wkład</th>
            
            {type === 'PPK' && (
              <>
                <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right">Pracodawca</th>
                <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right">Państwo</th>
              </>
            )}
            
            <th className="px-1 py-2 md:px-1 md:py-2 lg:px-6 lg:py-3 font-semibold text-right text-emerald-600">Zysk</th>
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
                <td className="px-1 py-1.5 md:px-1 md:py-2 lg:px-6 lg:py-4 text-right">
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
