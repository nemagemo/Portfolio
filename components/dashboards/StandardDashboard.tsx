

import React, { useMemo, useState } from 'react';
import { Wallet, Building2, TrendingUp, ArrowUpRight, Timer, ShieldCheck, Trophy, DollarSign } from 'lucide-react';
import { SummaryStats, PortfolioType, AnyDataRow, DividendDataRow } from '../../types';
import { StatsCard } from '../StatsCard';
import { Theme, themeStyles } from '../../theme/styles';
import { ValueCompositionChart, ROIChart, CapitalStructureHistoryChart, CryptoValueChart, DividendChart } from '../Charts';
import { TaxToggleIcon } from '../Icons';
import { parseCSV } from '../../utils/parser';
import { DIVIDENDS_DATA } from '../../CSV/Dividends';

interface StandardDashboardProps {
  portfolioType: PortfolioType;
  stats: SummaryStats | null;
  data: AnyDataRow[];
  theme: Theme;
  showPPKProjection?: boolean;
  setShowPPKProjection?: (v: boolean) => void;
  showTaxComparison?: boolean;
  setShowTaxComparison?: (v: boolean) => void;
  ppkRateDisplay?: { cagr: number };
  ppkChartDataWithProjection?: AnyDataRow[];
  bestCrypto?: any;
}

export const StandardDashboard: React.FC<StandardDashboardProps> = ({
  portfolioType, stats, data, theme,
  showPPKProjection, setShowPPKProjection,
  showTaxComparison, setShowTaxComparison,
  ppkRateDisplay, ppkChartDataWithProjection,
  bestCrypto
}) => {
  const styles = themeStyles[theme];
  const [dividendViewMode, setDividendViewMode] = useState<'Yearly' | 'Quarterly'>('Yearly');

  const monthsToPayout = useMemo(() => {
    if (portfolioType !== 'PPK') return 0;
    const targetDate = new Date('2049-05-01');
    const now = new Date();
    let months = (targetDate.getFullYear() - now.getFullYear()) * 12;
    months -= now.getMonth();
    months += targetDate.getMonth();
    return Math.max(0, months);
  }, [portfolioType]);

  const getTextColorClass = (type: string) => {
    if (theme === 'neon') return 'text-cyan-400';
    switch(type) {
      case 'PPK': return 'text-indigo-700';
      case 'CRYPTO': return 'text-violet-700';
      case 'IKE': return 'text-cyan-700';
      default: return 'text-blue-700';
    }
  };

  const getProfitColorClass = (val: number) => {
    if (theme === 'neon') return val >= 0 ? "text-emerald-400" : "text-rose-400";
    return val >= 0 ? "text-emerald-600" : "text-rose-600";
  };

  // Calculate Dividend Data if IKE
  const dividendChartData = useMemo(() => {
    if (portfolioType !== 'IKE') return [];
    
    // Parse dividends here to avoid adding heavy logic to usePortfolioData just for this view
    // In a real app, this would come from props
    const divRes = parseCSV(DIVIDENDS_DATA, 'DIVIDENDS', 'Offline');
    const dividends = divRes.data as DividendDataRow[];
    
    const ikeDividends = dividends.filter(d => d.portfolio === 'IKE');
    const grouped: Record<string, number> = {};

    ikeDividends.forEach(d => {
       let key = '';
       if (dividendViewMode === 'Yearly') {
          key = d.dateObj.getFullYear().toString();
       } else {
          const q = Math.floor(d.dateObj.getMonth() / 3) + 1;
          const y = d.dateObj.getFullYear().toString().slice(-2);
          key = `Q${q} '${y}`;
       }
       grouped[key] = (grouped[key] || 0) + d.value;
    });

    return Object.entries(grouped)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => {
            // Basic sort logic: Year or Year+Quarter
            if (dividendViewMode === 'Yearly') return a.label.localeCompare(b.label);
            // For quarters "Q2 '24" vs "Q1 '25", manual sort might be needed if dates span widely
            // But string compare works for "Q1 '24" vs "Q2 '24"
            // A better way is to store sort key separately, but this suffices for simple display
            const yearA = parseInt(a.label.split("'")[1]);
            const yearB = parseInt(b.label.split("'")[1]);
            if (yearA !== yearB) return yearA - yearB;
            return a.label.localeCompare(b.label);
        });
  }, [portfolioType, dividendViewMode]);

  const totalDividends = useMemo(() => {
      return dividendChartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [dividendChartData]);

  if (!stats) return null;

  // Determine title for Value Card
  const valueCardTitle = portfolioType === 'PPK' ? "Wartość Całkowita" : "Wartość";

  return (
    <>
      <div className={`grid grid-cols-1 gap-6 mb-4 ${portfolioType === 'PPK' ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-4'}`}>
        {portfolioType === 'PPK' ? (
           <div className={`${styles.cardContainer} p-6 hover:shadow-md transition-shadow duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-medium ${styles.textSub}`}>Wartość</h3>
                <div className={`p-2 rounded-lg ${theme === 'neon' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/50' : 'bg-slate-50 text-indigo-700'}`}><Wallet size={20} /></div>
              </div>
              <div className="flex flex-col">
                 <span className={`text-2xl font-bold ${styles.text}`}>{`${(stats.totalValue || 0).toLocaleString('pl-PL')} zł`}</span>
                 <div className="flex items-center mt-1 text-sm space-x-2">
                    <span className={`flex items-center font-bold text-base ${theme === 'neon' ? 'text-slate-400' : 'text-slate-600'}`}>
                       {((stats as any).customExitValue || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
                    </span>
                 </div>
              </div>
           </div>
        ) : (<StatsCard title={valueCardTitle} value={`${(stats.totalValue || 0).toLocaleString('pl-PL')} zł`} icon={Wallet} colorClass={getTextColorClass(portfolioType)} className={styles.cardContainer} />)}

        <StatsCard title={portfolioType === 'PPK' ? "Wkład Własny" : "Zainwestowano"} value={`${(stats.totalInvestment ?? stats.totalEmployee ?? 0).toLocaleString('pl-PL')} zł`} icon={Building2} colorClass={getTextColorClass(portfolioType)} className={styles.cardContainer} />
        
        {portfolioType === 'PPK' && stats.totalState !== undefined ? (
           <div className={`${styles.cardContainer} p-6 hover:shadow-md transition-shadow duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-medium ${styles.textSub}`}>Zysk</h3>
                <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg} ${theme === 'neon' ? 'text-emerald-400' : 'text-emerald-600'}`}><TrendingUp size={20} /></div>
              </div>
              <div className="flex flex-col">
                 <span className={`text-2xl font-bold ${styles.text}`}>{`${(stats.totalProfit || 0).toLocaleString('pl-PL')} zł`}</span>
                 <div className="flex items-center mt-1 text-sm space-x-2">
                    <span className={`flex items-center font-bold text-base ${theme === 'neon' ? 'text-emerald-400' : 'text-emerald-600'}`}><ArrowUpRight size={18} className="mr-0.5" />{stats.totalEmployee ? ((stats.totalProfit / stats.totalEmployee) * 100).toFixed(2) : '0.00'}%</span>
                 </div>
              </div>
           </div>
        ) : (
           <StatsCard title="Zysk/Strata" value={`${(stats.totalProfit || 0).toLocaleString('pl-PL')} zł`} trend={stats.currentRoi || 0} icon={TrendingUp} colorClass={getProfitColorClass(stats.totalProfit || 0)} className={styles.cardContainer} />
        )}

        {portfolioType === 'PPK' && (
           <div className={`${styles.cardContainer} p-6 hover:shadow-md transition-shadow duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-medium ${styles.textSub}`}>Czas do wypłaty</h3>
                <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg} ${theme === 'neon' ? 'text-amber-400' : 'text-amber-600'}`}><Timer size={20} /></div>
              </div>
              <div className="flex flex-col">
                 <span className={`text-2xl font-bold ${styles.text}`}>{monthsToPayout}</span>
                 <span className={`text-sm mt-1 ${theme === 'neon' ? 'text-cyan-700' : 'text-slate-400'}`}>msc</span>
              </div>
           </div>
        )}

        {portfolioType === 'IKE' && stats.taxSaved !== undefined && (
           <StatsCard title="Tarcza Podatkowa" value={`${(stats.taxSaved).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`} subValue="Zaoszczędzony podatek" icon={ShieldCheck} colorClass={theme === 'neon' ? 'text-cyan-400' : "text-cyan-700 bg-cyan-50"} className={styles.cardContainer} />
        )}

        {portfolioType === 'CRYPTO' && bestCrypto && (
          <StatsCard title="Najlepsze Aktywo" value={bestCrypto.symbol} subValue={`${bestCrypto.profit.toLocaleString('pl-PL')} zł`} trend={bestCrypto.roi} icon={Trophy} colorClass={theme === 'neon' ? 'text-yellow-400' : "text-yellow-600 bg-yellow-50"} className={styles.cardContainer} />
        )}
      </div>

      <div className="space-y-8">
        {portfolioType === 'PPK' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                <div className="flex flex-col">
                  <h3 className={`text-lg font-bold ${styles.text}`}>Historyczna Wartość Portfela</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-2 font-medium leading-tight max-w-2xl">Wartość netto = Wartość po odjęciu podatku od wpłaty Pracodawcy<br/>Wartość Exit = Wartość netto - 30% wpłat od Pracodawcy - wpłaty od Państwa - 19% podatku od zysku</p>
                </div>
                <div className={`flex items-center space-x-4 p-2 rounded-lg border ${theme === 'neon' ? 'bg-black/50 border-cyan-900/50' : 'bg-slate-50 border-slate-100'}`}>
                   <button onClick={() => setShowPPKProjection && setShowPPKProjection(!showPPKProjection)} className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${showPPKProjection ? styles.toggleProjectionActive : `bg-transparent ${theme === 'neon' ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`}`}>Droga do Emerytury</button>
                   {showPPKProjection && ppkRateDisplay && (<span className={`text-[10px] font-mono ${styles.textSub} animate-in fade-in slide-in-from-right-4 duration-300`}>+{ppkRateDisplay.cagr.toFixed(2)}% m/m (CAGR)</span>)}
                </div>
              </div>
              <ValueCompositionChart data={ppkChartDataWithProjection || data} showProjection={showPPKProjection} themeMode={theme} />
            </div>
            
            <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
              <h3 className={`text-lg font-bold ${styles.text} mb-6`}>ROI w czasie</h3>
              <ROIChart data={data} themeMode={theme} showExitRoi={true} />
            </div>

            <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
              <h3 className={`text-lg font-bold ${styles.text} mb-6`}>Struktura Kapitału w czasie</h3>
              <CapitalStructureHistoryChart data={data} themeMode={theme} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold ${styles.text}`}>{portfolioType === 'IKE' && showTaxComparison ? 'Historyczna Wartość Portfela (IKE vs Opodatkowane)' : 'Historyczna Wartość Portfela'}</h3>
                {portfolioType === 'IKE' && (<button onClick={() => setShowTaxComparison && setShowTaxComparison(!showTaxComparison)} className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${showTaxComparison ? styles.toggleCPIActive : `bg-transparent ${theme === 'neon' ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`}`} title="Pokaż porównanie z kontem opodatkowanym"><TaxToggleIcon className="w-4 h-4 mr-2" />Belka</button>)}
              </div>
              <CryptoValueChart data={data} showTaxComparison={showTaxComparison} themeMode={theme} />
            </div>
            
            {portfolioType === 'IKE' && (
              <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-lg font-bold ${styles.text}`}>Otrzymane Dywidendy</h3>
                    <p className={`text-sm ${styles.textSub}`}>Suma: {totalDividends.toLocaleString('pl-PL')} zł</p>
                  </div>
                  <div className={`flex items-center space-x-2 p-1 rounded-lg border ${theme === 'neon' ? 'bg-black/50 border-cyan-900/50' : 'bg-slate-50 border-slate-100'}`}>
                    <button 
                      onClick={() => setDividendViewMode('Yearly')} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${dividendViewMode === 'Yearly' ? (theme === 'neon' ? 'bg-cyan-900 text-cyan-300' : 'bg-white text-slate-800 shadow-sm') : (theme === 'neon' ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}
                    >
                      Rocznie
                    </button>
                    <button 
                      onClick={() => setDividendViewMode('Quarterly')} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${dividendViewMode === 'Quarterly' ? (theme === 'neon' ? 'bg-cyan-900 text-cyan-300' : 'bg-white text-slate-800 shadow-sm') : (theme === 'neon' ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}
                    >
                      Kwartalnie
                    </button>
                  </div>
                </div>
                <DividendChart data={dividendChartData} themeMode={theme} />
              </div>
            )}

            <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
              <h3 className={`text-lg font-bold ${styles.text} mb-6`}>ROI w czasie</h3>
              <ROIChart data={data} themeMode={theme} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
