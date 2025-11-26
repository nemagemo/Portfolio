
import React, { useMemo, useState } from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SummaryStats, PortfolioType, AnyDataRow, DividendDataRow } from '../../types';
import { Theme, themeStyles } from '../../theme/styles';
import { ValueCompositionChart, ROIChart, CapitalStructureHistoryChart, CryptoValueChart, DividendChart } from '../Charts';
import { TaxToggleIcon, IconEmployer, IconState, IconExit, IconHourglass, IconTaxShield, IconDividends, IconTrophy } from '../Icons';
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
  const isNeon = theme === 'neon';

  const monthsToPayout = useMemo(() => {
    if (portfolioType !== 'PPK') return 0;
    const targetDate = new Date('2049-05-01');
    const now = new Date();
    let months = (targetDate.getFullYear() - now.getFullYear()) * 12;
    months -= now.getMonth();
    months += targetDate.getMonth();
    return Math.max(0, months);
  }, [portfolioType]);

  // Calculate Dividend Data if IKE
  const dividendChartData = useMemo(() => {
    if (portfolioType !== 'IKE') return [];
    
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
            if (dividendViewMode === 'Yearly') return a.label.localeCompare(b.label);
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

  // Unify Investment Value (PPK uses totalEmployee, others use totalInvestment)
  const investedValue = stats.totalInvestment ?? stats.totalEmployee ?? 0;
  const profitValue = stats.totalProfit || 0;
  const totalValue = stats.totalValue || 0;
  const currentRoi = stats.currentRoi || 0;

  return (
    <>
      {/* PORTFOLIO HEADER (New Unified Style) */}
      <div className={`w-full p-6 lg:p-8 ${styles.cardContainer} relative overflow-hidden mb-8`}>
        {/* Decorative Background Elements for Neon */}
        {isNeon && (
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none ${portfolioType === 'CRYPTO' ? 'bg-violet-500/10' : 'bg-indigo-500/10'}`}></div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
          
          {/* LEFT: Main Capital Stats (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className={`text-xs uppercase tracking-widest font-bold mb-2 flex items-center ${isNeon ? 'text-cyan-600' : 'text-slate-400'}`}>
              <Wallet size={14} className="mr-2" /> {portfolioType === 'PPK' ? "Wartość Całkowita" : "Wartość Portfela"}
            </h2>
            <div className="flex items-baseline">
              <span className={`text-4xl sm:text-5xl font-black tracking-tight ${isNeon ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500' : 'text-slate-900'}`}>
                {totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xl ml-2 font-medium ${isNeon ? 'text-cyan-700' : 'text-slate-400'}`}>zł</span>
            </div>
            
            <div className="mt-4 flex items-center">
              <div className={`h-1.5 w-full overflow-hidden ${isNeon ? 'bg-slate-800 rounded-full' : 'bg-slate-100 rounded-full'}`}>
                <div 
                  className={`h-full ${isNeon ? 'bg-blue-500 rounded-full' : 'bg-slate-400 rounded-full'}`} 
                  style={{ width: `${(investedValue && totalValue) ? Math.min(100, (investedValue / totalValue) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium font-mono">
              <span className={isNeon ? 'text-blue-400' : 'text-slate-500'}>
                {portfolioType === 'PPK' ? "Wkład Własny" : "Zainwestowano"}: {investedValue.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
              </span>
              <span className={isNeon ? 'text-cyan-600' : 'text-slate-400'}>
                {investedValue && totalValue ? ((investedValue / totalValue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* MIDDLE: Performance Stats (3 cols) */}
          <div className={`lg:col-span-3 flex flex-col justify-center lg:border-l lg:border-r ${isNeon ? 'lg:border-cyan-900/30' : 'lg:border-slate-100'} lg:px-8`}>
             <h2 className={`text-xs uppercase tracking-widest font-bold mb-3 ${isNeon ? 'text-cyan-600' : 'text-slate-400'}`}>
               Wynik
             </h2>
             <div className={`text-2xl sm:text-3xl font-bold mb-1 ${profitValue >= 0 ? (isNeon ? 'text-[#39ff14] drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]' : 'text-emerald-600') : 'text-rose-500'}`}>
                {profitValue > 0 ? '+' : ''}{profitValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
             </div>
             
             <div className="flex items-center mt-2">
                <span className={`px-2.5 py-1 text-sm font-bold flex items-center ${
                  currentRoi >= 0 
                    ? (isNeon ? 'bg-green-900/30 text-green-400 border border-green-500/30 rounded' : 'bg-emerald-100 text-emerald-700 rounded') 
                    : 'bg-rose-100 text-rose-700 rounded'
                }`}>
                  {currentRoi >= 0 ? <TrendingUp size={14} className="mr-1.5"/> : <TrendingUp size={14} className="mr-1.5 rotate-180"/>}
                  {currentRoi.toFixed(2)}% ROI
                </span>
             </div>
          </div>

          {/* RIGHT: Specific Metrics Grid (4 cols) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
             {/* PPK SPECIFIC METRICS */}
             {portfolioType === 'PPK' && (
               <>
                 <div className={`p-3 border relative ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-purple-400' : 'text-slate-400'}`}>Pracodawca</div>
                      <IconEmployer className={`w-4 h-4 ${isNeon ? 'text-purple-500/80' : 'text-purple-400/60'}`} />
                    </div>
                    <div className={`text-lg font-bold ${isNeon ? 'text-purple-300' : 'text-slate-700'}`}>{stats.totalEmployer?.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł</div>
                    <div className={`text-[9px] ${isNeon ? 'text-purple-500/60' : 'text-slate-400'}`}>Dopłaty</div>
                 </div>
                 <div className={`p-3 border relative ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-pink-400' : 'text-slate-400'}`}>Państwo</div>
                      <IconState className={`w-4 h-4 ${isNeon ? 'text-pink-500/80' : 'text-pink-400/60'}`} />
                    </div>
                    <div className={`text-lg font-bold ${isNeon ? 'text-pink-300' : 'text-slate-700'}`}>{stats.totalState?.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł</div>
                    <div className={`text-[9px] ${isNeon ? 'text-pink-500/60' : 'text-slate-400'}`}>Bonusy</div>
                 </div>
                 <div className={`p-3 border relative ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-amber-400' : 'text-slate-400'}`}>Exit Value</div>
                      <IconExit className={`w-4 h-4 ${isNeon ? 'text-amber-500/80' : 'text-amber-400/60'}`} />
                    </div>
                    <div className={`text-lg font-bold ${isNeon ? 'text-amber-300' : 'text-slate-700'}`}>{((stats as any).customExitValue || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł</div>
                    <div className={`text-[9px] ${isNeon ? 'text-amber-500/60' : 'text-slate-400'}`}>Wypłata teraz</div>
                 </div>
                 <div className={`p-3 border relative ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-blue-400' : 'text-slate-400'}`}>Czas</div>
                      <IconHourglass className={`w-4 h-4 ${isNeon ? 'text-blue-500/80' : 'text-blue-400/60'}`} />
                    </div>
                    <div className={`text-lg font-bold ${isNeon ? 'text-blue-300' : 'text-slate-700'}`}>{monthsToPayout} msc</div>
                    <div className={`text-[9px] ${isNeon ? 'text-blue-500/60' : 'text-slate-400'}`}>Do 60 r.ż.</div>
                 </div>
               </>
             )}

             {/* IKE SPECIFIC METRICS */}
             {portfolioType === 'IKE' && (
               <>
                 <div className={`p-3 border relative ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-cyan-400' : 'text-slate-400'}`}>Tarcza</div>
                      <IconTaxShield className={`w-4 h-4 ${isNeon ? 'text-cyan-500/80' : 'text-cyan-400/60'}`} />
                    </div>
                    <div className={`text-lg font-bold ${isNeon ? 'text-cyan-300' : 'text-slate-700'}`}>{stats.taxSaved?.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł</div>
                    <div className={`text-[9px] ${isNeon ? 'text-cyan-500/60' : 'text-slate-400'}`}>Oszczędność</div>
                 </div>
                 <div className={`p-3 border relative ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-emerald-400' : 'text-slate-400'}`}>Dywidendy</div>
                      <IconDividends className={`w-4 h-4 ${isNeon ? 'text-emerald-500/80' : 'text-emerald-400/60'}`} />
                    </div>
                    <div className={`text-lg font-bold ${isNeon ? 'text-emerald-300' : 'text-slate-700'}`}>{totalDividends.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł</div>
                    <div className={`text-[9px] ${isNeon ? 'text-emerald-500/60' : 'text-slate-400'}`}>Suma (Brutto)</div>
                 </div>
               </>
             )}

             {/* CRYPTO SPECIFIC METRICS */}
             {portfolioType === 'CRYPTO' && bestCrypto && (
               <>
                 <div className={`col-span-2 p-3 border relative ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-yellow-400' : 'text-slate-400'}`}>Najlepsze Aktywo</div>
                      <IconTrophy className={`w-4 h-4 ${isNeon ? 'text-yellow-500/80' : 'text-yellow-400/60'}`} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className={`text-lg font-bold ${isNeon ? 'text-yellow-300' : 'text-slate-700'}`}>{bestCrypto.symbol}</div>
                        <div className={`text-sm font-bold ${isNeon ? 'text-yellow-300' : 'text-yellow-600'}`}>+{bestCrypto.roi}%</div>
                    </div>
                    <div className={`text-[9px] ${isNeon ? 'text-yellow-500/60' : 'text-slate-400'}`}>Zysk: {bestCrypto.profit.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł</div>
                 </div>
               </>
             )}
          </div>

        </div>
      </div>

      <div className="space-y-8">
        {portfolioType === 'PPK' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                <div className="flex flex-col">
                  <h3 className={`text-lg font-bold ${styles.text}`}>Historyczna Wartość Portfela</h3>
                  <p className={`text-[10px] sm:text-xs mt-2 font-medium leading-tight max-w-2xl ${isNeon ? 'text-slate-400' : 'text-slate-400'}`}>Wartość netto = Wartość po odjęciu podatku od wpłaty Pracodawcy<br/>Wartość Exit = Wartość netto - 30% wpłat od Pracodawcy - wpłaty od Państwa - 19% podatku od zysku</p>
                </div>
                <div className={`flex items-center space-x-4 p-2 border ${isNeon ? 'bg-black/50 border-cyan-900/50 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                   <button onClick={() => setShowPPKProjection && setShowPPKProjection(!showPPKProjection)} className={`flex items-center px-3 py-1.5 text-xs font-bold transition-all ${showPPKProjection ? styles.toggleProjectionActive : `bg-transparent ${isNeon ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`} rounded-md`}>Droga do Emerytury</button>
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
                {portfolioType === 'IKE' && (<button onClick={() => setShowTaxComparison && setShowTaxComparison(!showTaxComparison)} className={`flex items-center px-3 py-1.5 text-xs font-bold transition-all ${showTaxComparison ? styles.toggleCPIActive : `bg-transparent ${isNeon ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`} rounded-md`} title="Pokaż porównanie z kontem opodatkowanym"><TaxToggleIcon className="w-4 h-4 mr-2" />Belka</button>)}
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
                  <div className={`flex items-center space-x-2 p-1 border ${isNeon ? 'bg-black/50 border-cyan-900/50 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                    <button 
                      onClick={() => setDividendViewMode('Yearly')} 
                      className={`px-3 py-1.5 text-xs font-bold transition-all ${dividendViewMode === 'Yearly' ? (isNeon ? 'bg-cyan-900 text-cyan-300' : 'bg-white text-slate-800 shadow-sm') : (isNeon ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')} rounded-md`}
                    >
                      Rocznie
                    </button>
                    <button 
                      onClick={() => setDividendViewMode('Quarterly')} 
                      className={`px-3 py-1.5 text-xs font-bold transition-all ${dividendViewMode === 'Quarterly' ? (isNeon ? 'bg-cyan-900 text-cyan-300' : 'bg-white text-slate-800 shadow-sm') : (isNeon ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')} rounded-md`}
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