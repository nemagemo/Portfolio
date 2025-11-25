
import React, { useState, useMemo } from 'react';
import { AnyDataRow, PPKDataRow, CryptoDataRow, IKEDataRow, OMFDataRow, PortfolioType } from '../types';
import { Filter, AlertCircle } from 'lucide-react';

interface HistoryTableProps {
  data: AnyDataRow[];
  type: PortfolioType;
  omfVariant?: 'active' | 'closed';
  title?: string;
  themeMode?: 'light' | 'comic' | 'neon';
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ data, type, omfVariant = 'active', title, themeMode = 'light' }) => {
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

  // Helper for conditional classes based on theme
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

  // Special rendering for OMF Table
  if (type === 'OMF') {
    // Sort by Last Purchase Date Descending
    const displayData = [...(filteredData as OMFDataRow[])].sort((a, b) => {
      const dateA = a.lastPurchaseDate || '';
      const dateB = b.lastPurchaseDate || '';
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.localeCompare(dateA);
    });

    return (
      <div>
        {/* Internal Header with Dynamic Count */}
        {type === 'OMF' && omfVariant === 'active' && title && (
          <div className={`px-6 py-4 border-b flex justify-between items-center ${isNeon ? 'bg-black/40 border-cyan-900/30' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className={`text-lg font-bold ${isNeon ? 'text-cyan-400 font-mono' : 'text-slate-800'}`}>{title}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 ${isNeon ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/50 font-mono' : 'bg-emerald-100 text-emerald-700'}`}>
              {displayData.length} pozycji
            </span>
          </div>
        )}

        {/* Filter Bar */}
        {type === 'OMF' && omfVariant === 'active' && (
          <div className={`px-6 py-3 flex items-center space-x-3 border-b ${isNeon ? 'bg-black/60 border-cyan-900/30' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`flex items-center text-sm ${isNeon ? 'text-cyan-600 font-mono' : 'text-slate-500'}`}>
              <Filter size={16} className="mr-2" />
              <span>Filtruj wg portfela:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedPortfolio('ALL')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedPortfolio === 'ALL' 
                    ? (isNeon ? 'bg-cyan-600 text-black shadow-[0_0_10px_rgba(8,145,178,0.5)] font-bold' : 'bg-slate-800 text-white')
                    : (isNeon ? 'bg-black border border-cyan-900/50 text-cyan-600 hover:text-cyan-300 hover:border-cyan-500' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100')
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
                      ? (isNeon ? 'bg-cyan-600 text-black shadow-[0_0_10px_rgba(8,145,178,0.5)] font-bold' : 'bg-slate-800 text-white')
                      : (isNeon ? 'bg-black border border-cyan-900/50 text-cyan-600 hover:text-cyan-300 hover:border-cyan-500' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100')
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className={`min-w-full text-sm text-left ${isNeon ? 'text-cyan-300 font-mono' : 'text-slate-600'}`}>
            <thead className={getHeaderClass()}>
              <tr>
                <th className="px-4 py-3 font-semibold">Symbol</th>
                <th className="px-4 py-3 font-semibold">
                   {omfVariant === 'closed' ? 'Data Sprzedaży' : 'Ostatni Zakup'}
                </th>
                <th className="px-4 py-3 font-semibold text-center">Okres (dni)</th>
                {omfVariant !== 'closed' && (
                  <th className="px-4 py-3 font-semibold text-right">Ilość</th>
                )}
                <th className="px-4 py-3 font-semibold text-right">Cena Zakupu</th>
                <th className="px-4 py-3 font-semibold text-right">
                   {omfVariant === 'closed' ? 'Wartość Sprzedaży' : 'Obecna Wartość'}
                </th>
                <th className="px-4 py-3 font-semibold text-right">Wynik</th>
                <th className="px-4 py-3 font-semibold text-right">ROI</th>
                {omfVariant !== 'closed' && (
                  <th className="px-4 py-3 font-semibold text-right">24h</th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayData.map((r, index) => {
                // Fallback indicator logic
                const isFallback = r.isLivePrice === false && omfVariant !== 'closed' && r.portfolio !== 'Gotówka';
                const valueClass = isFallback 
                    ? (isNeon ? 'text-slate-500' : 'text-slate-400') 
                    : (isNeon ? 'text-cyan-100 font-bold' : 'font-semibold text-slate-800');

                return (
                  <tr key={`${r.symbol}-${index}`} className={getRowClass(index)}>
                    <td className={`px-4 py-3 ${getTextClass(true)}`}>{r.symbol}</td>
                    <td className={`px-4 py-3 ${isNeon ? 'text-cyan-600' : 'text-slate-500'}`}>{r.lastPurchaseDate}</td>
                    <td className={`px-4 py-3 text-center ${isNeon ? 'text-cyan-600' : 'text-slate-500'}`}>{r.investmentPeriod}</td>
                    
                    {omfVariant !== 'closed' && (
                      <td className={`px-4 py-3 text-right ${isNeon ? 'text-cyan-200 font-mono' : 'font-mono'}`}>{(r.quantity || 0) > 0 ? (r.quantity || 0).toFixed(4) : '-'}</td>
                    )}
                    <td className={`px-4 py-3 text-right ${isNeon ? 'text-cyan-600' : ''}`}>{(r.purchaseValue || 0).toLocaleString('pl-PL')} zł</td>
                    
                    {/* Current Value with Fallback Indicator */}
                    <td className={`px-4 py-3 text-right ${valueClass} flex items-center justify-end`}>
                      {isFallback && (
                        <span title="Cena offline (nieaktualna)" className="mr-1.5 flex items-center">
                          <AlertCircle size={12} className="text-amber-500" />
                        </span>
                      )}
                      {(r.currentValue || 0).toLocaleString('pl-PL')} zł
                    </td>
                    
                    <td className={`px-4 py-3 text-right font-medium ${getProfitClass(r.profit || 0)}`}>
                      {(r.profit || 0).toLocaleString('pl-PL')} zł
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={getBadgeClass(r.roi || 0)}>
                        {r.roi}%
                      </span>
                    </td>
                    
                    {/* 24h Change: Only show if valid/live, else show '-' */}
                    {omfVariant !== 'closed' && (
                      <td className={`px-4 py-3 text-right font-medium ${r.change24h !== undefined ? getProfitClass(r.change24h) : (isNeon ? 'text-slate-700' : 'text-slate-300')}`}>
                        {r.change24h !== undefined ? `${r.change24h > 0 ? '+' : ''}${r.change24h.toFixed(2)}%` : '-'}
                      </td>
                    )}
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
