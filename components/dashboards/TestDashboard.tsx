
import React from 'react';
import { Theme, themeStyles } from '../../theme/styles';

interface TestDashboardProps {
  onlinePrices: Record<string, number> | null;
  historyPrices: Record<string, number> | null;
  theme: Theme;
}

export const TestDashboard: React.FC<TestDashboardProps> = ({ onlinePrices, historyPrices, theme }) => {
  const styles = themeStyles[theme];
  
  // Get all available symbols from online prices or empty list
  const symbols = onlinePrices ? Object.keys(onlinePrices).sort() : [];

  const isNeon = theme === 'neon';
  const tableClass = isNeon ? 'text-cyan-300 font-mono' : 'text-slate-600';
  const headerClass = isNeon 
    ? "px-6 py-3 font-bold font-mono text-cyan-400 border-b border-cyan-900/50 bg-black/40"
    : "px-6 py-3 font-semibold text-slate-700 bg-slate-50 border-b border-slate-200";
  const rowClass = (idx: number) => isNeon 
    ? `border-b border-cyan-900/20 hover:bg-cyan-900/10 ${idx % 2 === 0 ? 'bg-black/20' : 'bg-transparent'}`
    : `border-b border-slate-100 hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`;

  return (
    <div className={`${styles.cardContainer} overflow-hidden`}>
      <div className={`px-6 py-4 border-b ${isNeon ? 'border-cyan-900/30 bg-black/20' : 'border-slate-200 bg-white'}`}>
        <h3 className={`text-lg font-bold ${styles.text}`}>Test Cen Online</h3>
        <p className={`text-sm ${styles.textSub}`}>Podgląd surowych danych z Google Sheets</p>
      </div>
      
      <div className="overflow-x-auto">
        {symbols.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Brak danych online. Upewnij się, że aplikacja jest w trybie ONLINE.
          </div>
        ) : (
          <table className={`min-w-full text-sm text-left ${tableClass}`}>
            <thead>
              <tr>
                <th className={headerClass}>Symbol</th>
                <th className={`${headerClass} text-right`}>Cena Bieżąca</th>
                <th className={`${headerClass} text-right`}>Cena Stara (Wczoraj)</th>
                <th className={`${headerClass} text-right`}>Zmiana</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((symbol, index) => {
                const current = onlinePrices ? onlinePrices[symbol] : 0;
                const old = historyPrices ? historyPrices[symbol] : 0;
                let change = 0;
                let changeText = '-';
                
                if (old > 0) {
                  change = ((current - old) / old) * 100;
                  changeText = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                }

                return (
                  <tr key={symbol} className={rowClass(index)}>
                    <td className="px-6 py-3 font-bold">{symbol}</td>
                    <td className="px-6 py-3 text-right">{current.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</td>
                    <td className="px-6 py-3 text-right text-opacity-70">{old > 0 ? `${old.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł` : '-'}</td>
                    <td className={`px-6 py-3 text-right font-bold ${change > 0 ? 'text-emerald-500' : (change < 0 ? 'text-rose-500' : '')}`}>
                      {changeText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
