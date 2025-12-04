
import React, { useState, useMemo } from 'react';
import { OMFDataRow } from '../../types';
import { Filter, AlertCircle, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface AssetsTableProps {
  data: OMFDataRow[];
  variant?: 'active' | 'closed';
  title?: string;
  themeMode?: 'light' | 'comic' | 'neon' | 'dark';
}

type SortKey = keyof OMFDataRow | 'change24h';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const AssetsTable: React.FC<AssetsTableProps> = ({ data, variant = 'active', title, themeMode = 'light' }) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('ALL');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'lastPurchaseDate', direction: 'desc' });
  
  // Extract unique portfolios for filter dropdown
  const availablePortfolios = useMemo(() => {
    const portfolios = new Set<string>();
    data.forEach(row => {
      if (row.portfolio) portfolios.add(row.portfolio);
    });
    return Array.from(portfolios).sort();
  }, [data]);

  const filteredData = useMemo(() => {
     if (selectedPortfolio !== 'ALL') {
        return data.filter(row => row.portfolio === selectedPortfolio);
     }
     return data;
  }, [data, selectedPortfolio]);

  // Sort Logic
  const displayData = useMemo(() => {
    const sorted = [...filteredData];
    
    sorted.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle numeric comparisons (with null safety)
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string comparisons
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'desc'; // Default to desc for most financial stats
    
    // If sorting by symbol, default to asc
    if (key === 'symbol') direction = 'asc';

    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });
  };

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

  // Helper to render sortable table header
  const SortableHeader = ({ label, sortKey, align = 'left' }: { label: string, sortKey: SortKey, align?: 'left' | 'right' | 'center' }) => {
    const isActive = sortConfig.key === sortKey;
    const activeColor = isNeon ? 'text-cyan-200' : (isComic ? 'text-yellow-400' : (isDark ? 'text-white' : 'text-slate-900'));
    return (
      <th 
        className={`px-1 py-2 md:px-1 md:py-2 lg:px-4 lg:py-3 font-semibold cursor-pointer group select-none text-${align} transition-colors ${isActive ? activeColor : 'hover:opacity-70'}`}
        onClick={() => requestSort(sortKey)}
      >
        <div className={`flex items-center ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
          {label}
          <span className="ml-1 inline-block w-4">
            {isActive ? (
              sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
            ) : (
              <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-30 transition-opacity" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div>
      {/* Internal Header with Dynamic Count */}
      {title && (
        <div className={`px-4 md:px-6 py-3 md:py-4 border-b flex justify-between items-center ${isNeon ? 'bg-black/40 border-cyan-900/30' : (isComic ? 'bg-black border-white border-b-2' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'))}`}>
          <h3 className={`text-base md:text-lg font-bold ${isNeon ? 'text-cyan-400 font-mono' : (isComic ? 'text-white font-black uppercase' : (isDark ? 'text-slate-100' : 'text-slate-800'))}`}>{title}</h3>
          <span className={`text-xs font-medium px-2 py-1 transition-all duration-300 ${isNeon ? 'rounded-full bg-cyan-900/30 text-cyan-300 border border-cyan-500/50 font-mono' : (isComic ? 'rounded-none bg-white text-black font-bold border-2 border-black' : (isDark ? 'rounded-full bg-slate-700 text-slate-300' : 'rounded-full bg-emerald-100 text-emerald-700'))}`}>
            {displayData.length} pozycji
          </span>
        </div>
      )}

      {/* Filter Bar */}
      <div className={`px-4 md:px-6 py-2 md:py-3 flex items-center space-x-3 border-b overflow-x-auto ${isNeon ? 'bg-black/60 border-cyan-900/30' : (isComic ? 'bg-zinc-900 border-white border-b-2' : (isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'))}`}>
        <div className={`flex items-center text-xs md:text-sm ${isNeon ? 'text-cyan-600 font-mono' : (isComic ? 'text-white font-bold' : (isDark ? 'text-slate-400' : 'text-slate-500'))}`}>
          <Filter size={14} className="mr-2" />
          <span className="whitespace-nowrap">Filtruj wg portfela:</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedPortfolio('ALL')}
            className={`px-2 py-1 md:px-3 text-[10px] md:text-xs font-medium transition-colors whitespace-nowrap ${
              selectedPortfolio === 'ALL' 
                ? (isNeon ? 'rounded-full bg-cyan-600 text-black shadow-[0_0_10px_rgba(8,145,178,0.5)] font-bold' : (isComic ? 'rounded-none bg-white text-black border-2 border-black shadow-[2px_2px_0px_white]' : (isDark ? 'rounded-full bg-slate-200 text-slate-900' : 'rounded-full bg-slate-800 text-white')))
                : (isNeon ? 'rounded-full bg-black border border-cyan-900/50 text-cyan-600 hover:text-cyan-300 hover:border-cyan-500' : (isComic ? 'rounded-none bg-black border-2 border-white text-white hover:bg-white hover:text-black' : (isDark ? 'rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700' : 'rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100')))
            }`}
          >
            Wszystkie
          </button>
          {availablePortfolios.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPortfolio(p)}
              className={`px-2 py-1 md:px-3 text-[10px] md:text-xs font-medium transition-colors whitespace-nowrap ${
                selectedPortfolio === p 
                  ? (isNeon ? 'rounded-full bg-cyan-600 text-black shadow-[0_0_10px_rgba(8,145,178,0.5)] font-bold' : (isComic ? 'rounded-none bg-white text-black border-2 border-black shadow-[2px_2px_0px_white]' : (isDark ? 'rounded-full bg-slate-200 text-slate-900' : 'rounded-full bg-slate-800 text-white')))
                  : (isNeon ? 'rounded-full bg-black border border-cyan-900/50 text-cyan-600 hover:text-cyan-300 hover:border-cyan-500' : (isComic ? 'rounded-none bg-black border-2 border-white text-white hover:bg-white hover:text-black' : (isDark ? 'rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700' : 'rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100')))
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className={`min-w-full text-[10px] md:text-[11px] lg:text-sm text-left ${isNeon ? 'text-cyan-300 font-mono' : (isComic ? 'text-white' : (isDark ? 'text-slate-300' : 'text-slate-600'))}`}>
          <thead className={getHeaderClass()}>
            <tr>
              <SortableHeader label="Symbol" sortKey="symbol" />
              <SortableHeader label={variant === 'closed' ? 'Data' : 'Zakup'} sortKey="lastPurchaseDate" />
              
              {variant !== 'closed' && (
                <SortableHeader label="Ilość" sortKey="quantity" align="right" />
              )}
              
              <SortableHeader label="Koszt" sortKey="purchaseValue" align="right" />
              
              <SortableHeader 
                label={variant === 'closed' ? 'Sprzedaż' : 'Wartość'} 
                sortKey="currentValue" 
                align="right" 
              />
              
              <SortableHeader label="Wynik" sortKey="profit" align="right" />
              <SortableHeader label="ROI" sortKey="roi" align="right" />
              
              {variant !== 'closed' && (
                <SortableHeader label="24h" sortKey="change24h" align="right" />
              )}
            </tr>
          </thead>
          <tbody>
            {displayData.map((r, index) => {
              // Fallback indicator logic
              const isFallback = r.isLivePrice === false && variant !== 'closed' && r.portfolio !== 'Gotówka';
              const valueClass = isFallback 
                  ? (isNeon ? 'text-slate-500' : (isDark ? 'text-slate-500' : (isComic ? 'text-zinc-500' : 'text-slate-400'))) 
                  : (isNeon ? 'text-cyan-100 font-bold' : (isComic ? 'text-white font-bold' : (isDark ? 'text-slate-100 font-semibold' : 'font-semibold text-slate-800')));

              return (
                <tr key={`${r.symbol}-${index}`} className={getRowClass(index)}>
                  <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-4 lg:py-3 ${getTextClass(true)}`}>{r.symbol}</td>
                  <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-4 lg:py-3 ${isNeon ? 'text-cyan-600' : (isComic ? 'text-zinc-300' : (isDark ? 'text-slate-400' : 'text-slate-500'))}`}>{r.lastPurchaseDate}</td>
                  
                  {variant !== 'closed' && (
                    <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-4 lg:py-3 text-right ${isNeon ? 'text-cyan-200 font-mono' : 'font-mono'}`}>{(r.quantity || 0) > 0 ? (r.quantity || 0).toFixed(4) : '-'}</td>
                  )}
                  <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-4 lg:py-3 text-right ${isNeon ? 'text-cyan-600' : (isComic ? 'text-zinc-300' : (isDark ? 'text-slate-400' : ''))}`}>{(r.purchaseValue || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł</td>
                  
                  {/* Current Value with Fallback Indicator */}
                  <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-4 lg:py-3 text-right ${valueClass}`}>
                    <div className="flex items-center justify-end">
                      {isFallback && (
                        <span title="Cena offline (nieaktualna)" className="mr-1 flex items-center">
                          <AlertCircle size={10} className="text-amber-500" />
                        </span>
                      )}
                      {(r.currentValue || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
                    </div>
                  </td>
                  
                  <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-4 lg:py-3 text-right font-medium ${getProfitClass(r.profit || 0)}`}>
                    {(r.profit || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
                  </td>
                  <td className="px-1 py-1.5 md:px-1 md:py-2 lg:px-4 lg:py-3 text-right">
                    <span className={getBadgeClass(r.roi || 0)}>
                      {r.roi}%
                    </span>
                  </td>
                  
                  {/* 24h Change: Only show if valid/live, else show '-' */}
                  {variant !== 'closed' && (
                    <td className={`px-1 py-1.5 md:px-1 md:py-2 lg:px-4 lg:py-3 text-right font-medium ${r.change24h !== undefined ? getProfitClass(r.change24h) : (isNeon ? 'text-slate-700' : (isDark ? 'text-slate-600' : (isComic ? 'text-zinc-600' : 'text-slate-300')))}`}>
                      {r.change24h !== undefined ? `${r.change24h > 0 ? '+' : ''}${r.change24h.toFixed(1)}%` : '-'}
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
};
