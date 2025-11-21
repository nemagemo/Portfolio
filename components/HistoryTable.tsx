
import React, { useState, useMemo } from 'react';
import { AnyDataRow, PPKDataRow, CryptoDataRow, IKEDataRow, OMFDataRow, PortfolioType } from '../types';
import { Filter } from 'lucide-react';

interface HistoryTableProps {
  data: AnyDataRow[];
  type: PortfolioType;
  omfVariant?: 'active' | 'closed';
  title?: string; // Added title prop to render header internally
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ data, type, omfVariant = 'active', title }) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('ALL');
  
  // Extract unique portfolios for filter dropdown (Only for OMF Active)
  const availablePortfolios = useMemo(() => {
    if (type !== 'OMF' || omfVariant !== 'active') return [];
    const portfolios = new Set<string>();
    data.forEach(row => {
      const r = row as OMFDataRow;
      if (r.portfolio) portfolios.add(r.portfolio);
    });
    return Array.from(portfolios).sort();
  }, [data, type, omfVariant]);

  const filteredData = useMemo(() => {
     if (type === 'OMF' && omfVariant === 'active' && selectedPortfolio !== 'ALL') {
        return data.filter(row => (row as OMFDataRow).portfolio === selectedPortfolio);
     }
     return data;
  }, [data, selectedPortfolio, type, omfVariant]);

  // Special rendering for OMF Table
  if (type === 'OMF') {
    // Sort by Last Purchase Date Descending
    const displayData = [...(filteredData as OMFDataRow[])].sort((a, b) => {
      const dateA = a.lastPurchaseDate || '';
      const dateB = b.lastPurchaseDate || '';
      
      // Put empty dates at the end
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      // Descending string comparison (ISO dates)
      return dateB.localeCompare(dateA);
    });

    return (
      <div>
        {/* Internal Header with Dynamic Count (Only for Active variant where filtering exists) */}
        {type === 'OMF' && omfVariant === 'active' && title && (
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full transition-all duration-300">
              {displayData.length} pozycji
            </span>
          </div>
        )}

        {/* Filter Bar for Active Positions */}
        {type === 'OMF' && omfVariant === 'active' && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center space-x-3">
            <div className="flex items-center text-sm text-slate-500">
              <Filter size={16} className="mr-2" />
              <span>Filtruj wg portfela:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedPortfolio('ALL')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedPortfolio === 'ALL' 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Wszystkie
              </button>
              {availablePortfolios.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPortfolio(p)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedPortfolio === p 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Symbol</th>
                <th className="px-4 py-3 font-semibold">
                   {omfVariant === 'closed' ? 'Data Sprzedaży' : 'Ostatni Zakup'}
                </th>
                <th className="px-4 py-3 font-semibold text-center">Okres (dni)</th>
                {/* Removed Typ and Portfel columns */}
                {omfVariant !== 'closed' && (
                  <th className="px-4 py-3 font-semibold text-right">Ilość</th>
                )}
                <th className="px-4 py-3 font-semibold text-right">Cena Zakupu</th>
                <th className="px-4 py-3 font-semibold text-right">
                   {omfVariant === 'closed' ? 'Wartość Sprzedaży' : 'Obecna Wartość'}
                </th>
                <th className="px-4 py-3 font-semibold text-right">Wynik</th>
                <th className="px-4 py-3 font-semibold text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((r, index) => {
                return (
                  <tr key={`${r.symbol}-${index}`} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-4 py-3 font-bold text-slate-900">{r.symbol}</td>
                    <td className="px-4 py-3 text-slate-500">{r.lastPurchaseDate}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{r.investmentPeriod}</td>
                    
                    {omfVariant !== 'closed' && (
                      <td className="px-4 py-3 text-right font-mono">{(r.quantity || 0) > 0 ? (r.quantity || 0).toFixed(4) : '-'}</td>
                    )}
                    <td className="px-4 py-3 text-right">{(r.purchaseValue || 0).toLocaleString('pl-PL')} zł</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{(r.currentValue || 0).toLocaleString('pl-PL')} zł</td>
                    <td className={`px-4 py-3 text-right font-medium ${(r.profit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {(r.profit || 0).toLocaleString('pl-PL')} zł
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(r.roi || 0) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {r.roi}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Standard Rendering for Time Series (PPK, Crypto, IKE)
  const sortedData = [...data].reverse();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 font-semibold">Data</th>
            <th className="px-6 py-3 font-semibold text-right">Wartość Całkowita</th>
            <th className="px-6 py-3 font-semibold text-right text-blue-600">Wkład Własny</th>
            
            {type === 'PPK' && (
              <>
                <th className="px-6 py-3 font-semibold text-right">Pracodawca</th>
                <th className="px-6 py-3 font-semibold text-right">Państwo</th>
              </>
            )}
            
            <th className="px-6 py-3 font-semibold text-right text-emerald-600">Zysk</th>
            <th className="px-6 py-3 font-semibold text-right">ROI</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const isPPK = type === 'PPK';
            
            // Determine investment value based on type
            let investment = 0;
            if (isPPK) {
              investment = (row as PPKDataRow).employeeContribution;
            } else {
              // Works for both Crypto and IKE
              investment = (row as CryptoDataRow | IKEDataRow).investment;
            }

            const ppkRow = isPPK ? (row as PPKDataRow) : null;

            return (
              <tr key={row.date} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                  {row.date}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">
                  {(row.totalValue || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                </td>
                <td className="px-6 py-4 text-right">
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

                <td className={`px-6 py-4 text-right font-medium ${(row.profit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {(row.profit || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(row.roi || 0) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
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
