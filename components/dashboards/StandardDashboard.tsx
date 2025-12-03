
import React, { useMemo, useState } from 'react';
import { Wallet, TrendingUp, Anchor, PieChart } from 'lucide-react';
import { SummaryStats, PortfolioType, AnyDataRow, DividendDataRow, OMFDataRow } from '../../types';
import { Theme, themeStyles } from '../../theme/styles';
import { ValueCompositionChart, ROIChart, CryptoValueChart, DividendChart, SectorAllocationChart } from '../Charts';
import { TaxToggleIcon, IconEmployer, IconState, IconExit, IconHourglass, IconTaxShield, IconDividends, IconTrophy } from '../Icons';
import { useDividendGrouping } from '../../hooks/useChartTransformations';

interface StandardDashboardProps {
  portfolioType: PortfolioType;
  stats: SummaryStats | null;
  data: AnyDataRow[];
  dividends: DividendDataRow[];
  theme: Theme;
  showPPKProjection?: boolean;
  setShowPPKProjection?: (v: boolean) => void;
  showTaxComparison?: boolean;
  setShowTaxComparison?: (v: boolean) => void;
  ppkRateDisplay?: { cagr: number };
  ppkChartDataWithProjection?: AnyDataRow[];
  bestCrypto?: any;
  activeAssets?: OMFDataRow[];
}

export const StandardDashboard: React.FC<StandardDashboardProps> = ({
  portfolioType, stats, data, dividends, theme,
  showPPKProjection, setShowPPKProjection,
  showTaxComparison, setShowTaxComparison,
  ppkRateDisplay, ppkChartDataWithProjection,
  bestCrypto, activeAssets
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

  // Use the hook to transform dividend data based on view mode
  const dividendChartData = useDividendGrouping(
      portfolioType === 'IKE' ? dividends : [], 
      dividendViewMode
  );

  const totalDividends = useMemo(() => {
      return dividendChartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [dividendChartData]);

  // Calculate Sector Allocation specific for IKE
  const sectorAllocationData = useMemo(() => {
    if (portfolioType !== 'IKE' || !activeAssets) return [];
    
    const sectorMap: Record<string, number> = {};
    const otherSymbols: string[] = []; // Accumulate symbols without a sector
    
    const ikeAssets = activeAssets.filter(a => a.portfolio === 'IKE' && a.status === 'Otwarta' && a.type !== 'Gotówka');

    ikeAssets.forEach(asset => {
        let sectorName = asset.sector;
        if (!sectorName) {
            sectorName = 'Inne'; // Temporary key for aggregation
            otherSymbols.push(asset.symbol);
        }
        sectorMap[sectorName] = (sectorMap[sectorName] || 0) + asset.currentValue;
    });

    return Object.entries(sectorMap)
        .map(([name, value]) => {
            // If this is the "Inne" category and we have symbols, rename it
            if (name === 'Inne' && otherSymbols.length > 0) {
                return { name: otherSymbols.join(', '), value };
            }
            return { name, value };
        })
        .sort((a, b) => b.value - a.value);
  }, [portfolioType, activeAssets]);

  if (!stats) return null;

  // Unify Investment Value
  const investedValue = stats.totalInvestment ?? stats.totalEmployee ?? 0;
  const profitValue = stats.totalProfit || 0;
  const totalValue = stats.totalValue || 0;
  const currentRoi = stats.currentRoi || 0;

  return (
    <>
      {/* PORTFOLIO HEADER (Compact Style) */}
      <div className={`w-full p-3 sm:p-4 ${styles.cardContainer} relative overflow-hidden mb-6`}>
        {/* Decorative Background Elements for Neon */}
        {isNeon && (
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none ${portfolioType === 'CRYPTO' ? 'bg-violet-500/10' : 'bg-indigo-500/10'}`}></div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 relative z-10">
          
          {/* LEFT: Main Capital Stats */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className={`text-[10px] uppercase tracking-widest font-bold mb-1 flex items-center ${isNeon ? 'text-cyan-600' : 'text-slate-400'}`}>
              <Wallet size={12} className="mr-1.5" /> {portfolioType === 'PPK' ? "Wartość Całkowita" : "Wartość Portfela"}
            </h2>
            <div className="flex items-baseline">
              <span className={`text-3xl sm:text-4xl font-black tracking-tight ${isNeon ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500' : 'text-slate-900'}`}>
                {totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-lg ml-1.5 font-medium ${isNeon ? 'text-cyan-700' : 'text-slate-400'}`}>zł</span>
            </div>
            
            <div className="mt-2 flex items-center">
              <div className={`h-1 w-full overflow-hidden ${isNeon ? 'bg-slate-800 rounded-full' : 'bg-slate-100 rounded-full'}`}>
                <div 
                  className={`h-full ${isNeon ? 'bg-blue-500 rounded-full' : 'bg-slate-400 rounded-full'}`} 
                  style={{ width: `${(investedValue && totalValue) ? Math.min(100, (investedValue / totalValue) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] sm:text-xs font-medium font-mono">
              <span className={isNeon ? 'text-blue-400' : 'text-slate-500'}>
                {portfolioType === 'PPK' ? "Wkład Własny" : "Zainwestowano"}: {investedValue.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
              </span>
              <span className={isNeon ? 'text-cyan-600' : 'text-slate-400'}>
                {investedValue && totalValue ? ((investedValue / totalValue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* MIDDLE: Performance Stats */}
          <div className={`lg:col-span-3 flex flex-col justify-center lg:border-l lg:border-r ${isNeon ? 'lg:border-cyan-900/30' : 'lg:border-slate-100'} lg:px-4`}>
             <h2 className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${isNeon ? 'text-cyan-600' : 'text-slate-400'}`}>
               Wynik
             </h2>
             <div className={`text-xl sm:text-2xl font-bold mb-0.5 ${profitValue >= 0 ? (isNeon ? 'text-[#39ff14] drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]' : 'text-emerald-600') : 'text-rose-500'}`}>
                {profitValue > 0 ? '+' : ''}{profitValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
             </div>
             
             <div className="flex items-center mt-1">
                <span className={`px-2 py-0.5 text-xs font-bold flex items-center ${
                  currentRoi >= 0 
                    ? (isNeon ? 'bg-green-900/30 text-green-400 border border-green-500/30 rounded' : 'bg-emerald-100 text-emerald-700 rounded') 
                    : 'bg-rose-100 text-rose-700 rounded'
                }`}>
                  {currentRoi >= 0 ? <TrendingUp size={12} className="mr-1"/> : <TrendingUp size={12} className="mr-1 rotate-180"/>}
                  {currentRoi.toFixed(2)}% ROI
                </span>
             </div>
          </div>

          {/* RIGHT: Detailed Stats Breakdown (4 cols) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2">
             {/* STAT BLOCK 1 - Hidden for Crypto */}
             {portfolioType !== 'CRYPTO' && (
               <div className={`p-2.5 border ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div className={`text-[10px] sm:text-xs uppercase font-bold ${isNeon ? 'text-purple-400' : 'text-slate-400'}`}>
                      {portfolioType === 'PPK' ? 'Pracodawca' : (portfolioType === 'IKE' ? 'Dywidendy' : 'ROI')}
                    </div>
                    {portfolioType === 'PPK' ? <IconEmployer className={`w-4 h-4 ${isNeon ? 'text-purple-500/80' : 'text-purple-400/60'}`} /> : 
                     portfolioType === 'IKE' ? <IconDividends className={`w-4 h-4 ${isNeon ? 'text-purple-500/80' : 'text-purple-400/60'}`} /> :
                     <IconTrophy className={`w-4 h-4 ${isNeon ? 'text-purple-500/80' : 'text-purple-400/60'}`} />}
                  </div>
                  <div className={`text-sm sm:text-base font-bold ${isNeon ? 'text-purple-300' : 'text-slate-700'}`}>
                     {portfolioType === 'PPK' ? `${stats.totalEmployer?.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł` : 
                      portfolioType === 'IKE' ? `${totalDividends.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł` :
                      `${currentRoi.toFixed(1)}%`}
                  </div>
                  <div className={`text-[9px] sm:text-[10px] ${isNeon ? 'text-purple-500/60' : 'text-slate-400'}`}>
                     {portfolioType === 'PPK' ? 'Dopłata' : (portfolioType === 'IKE' ? 'Otrzymane' : 'Zwrot')}
                  </div>
               </div>
             )}

             {/* STAT BLOCK 2 - Hidden for Crypto */}
             {portfolioType !== 'CRYPTO' && (
               <div className={`p-2.5 border ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div className={`text-[10px] sm:text-xs uppercase font-bold ${isNeon ? 'text-amber-400' : 'text-slate-400'}`}>
                      {portfolioType === 'PPK' ? 'Państwo' : (portfolioType === 'IKE' ? 'Tarcza Podatkowa' : 'Zysk')}
                    </div>
                    {portfolioType === 'PPK' ? <IconState className={`w-4 h-4 ${isNeon ? 'text-amber-500/80' : 'text-amber-400/60'}`} /> :
                     portfolioType === 'IKE' ? <IconTaxShield className={`w-4 h-4 ${isNeon ? 'text-amber-500/80' : 'text-amber-400/60'}`} /> :
                     <Anchor className={`w-4 h-4 ${isNeon ? 'text-amber-500/80' : 'text-amber-400/60'}`} />}
                  </div>
                  <div className={`text-sm sm:text-base font-bold ${isNeon ? 'text-amber-300' : 'text-slate-700'}`}>
                     {portfolioType === 'PPK' ? `${stats.totalState?.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł` :
                      portfolioType === 'IKE' ? `${(stats.taxSaved || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł` :
                      `${profitValue.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł`}
                  </div>
                  <div className={`text-[9px] sm:text-[10px] ${isNeon ? 'text-amber-500/60' : 'text-slate-400'}`}>
                     {portfolioType === 'PPK' ? 'Bonus' : (portfolioType === 'IKE' ? 'Zaoszczędzone' : 'Nominalny')}
                  </div>
               </div>
             )}

             {/* STAT BLOCK 3 (PPK Exit / Crypto Best) */}
             {portfolioType === 'PPK' && (
               <div className={`p-2.5 border ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div className={`text-[10px] sm:text-xs uppercase font-bold ${isNeon ? 'text-rose-400' : 'text-slate-400'}`}>Exit ROI</div>
                    <IconExit className={`w-4 h-4 ${isNeon ? 'text-rose-500/80' : 'text-rose-400/60'}`} />
                  </div>
                  <div className={`text-sm sm:text-base font-bold ${isNeon ? 'text-rose-300' : 'text-slate-700'}`}>
                     {stats.currentExitRoi?.toFixed(2)}%
                  </div>
                  <div className={`text-[9px] sm:text-[10px] ${isNeon ? 'text-rose-500/60' : 'text-slate-400'}`}>Przy wypłacie</div>
               </div>
             )}

             {portfolioType === 'CRYPTO' && bestCrypto && (
               <div className={`p-2.5 border ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div className={`text-[10px] sm:text-xs uppercase font-bold ${isNeon ? 'text-blue-400' : 'text-slate-400'}`}>Top Asset</div>
                    <IconTrophy className={`w-4 h-4 ${isNeon ? 'text-blue-500/80' : 'text-blue-400/60'}`} />
                  </div>
                  <div className={`text-sm sm:text-base font-bold ${isNeon ? 'text-blue-300' : 'text-slate-700'}`}>
                     {bestCrypto.symbol}
                  </div>
                  <div className={`text-[9px] sm:text-[10px] ${isNeon ? 'text-blue-500/60' : 'text-slate-400'}`}>
                     +{bestCrypto.roi.toFixed(0)}% ROI
                  </div>
               </div>
             )}

             {/* STAT BLOCK 4 (Time) - Only for PPK */}
             {portfolioType === 'PPK' && (
               <div className={`p-2.5 border ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div className={`text-[10px] sm:text-xs uppercase font-bold ${isNeon ? 'text-cyan-400' : 'text-slate-400'}`}>Czas</div>
                    <IconHourglass className={`w-4 h-4 ${isNeon ? 'text-cyan-500/80' : 'text-cyan-400/60'}`} />
                  </div>
                  <div className={`text-sm sm:text-base font-bold ${isNeon ? 'text-cyan-300' : 'text-slate-700'}`}>
                     {monthsToPayout} <span className="text-[10px] font-normal">msc</span>
                  </div>
                  <div className={`text-[9px] sm:text-[10px] ${isNeon ? 'text-cyan-500/60' : 'text-slate-400'}`}>
                     do wypłaty
                  </div>
               </div>
             )}
          </div>

        </div>
      </div>

      {/* CHARTS SECTION */}
      
      {/* 1. Value Composition */}
      <div className={`mb-6 p-6 ${styles.cardContainer}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${styles.text}`}>
            {portfolioType === 'PPK' ? "Struktura Kapitału" : "Wartość Portfela"}
          </h3>
          
          <div className="flex items-center space-x-2">
             {/* Projection Toggle for PPK */}
             {portfolioType === 'PPK' && setShowPPKProjection && (
                <button
                  onClick={() => setShowPPKProjection(!showPPKProjection)}
                  className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all border ${showPPKProjection ? styles.toggleProjectionActive : `bg-transparent ${isNeon ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'}`}`}
                >
                  <TrendingUp size={14} className="mr-2" /> Prognoza
                </button>
             )}
             
             {/* Tax Toggle for Crypto/IKE */}
             {portfolioType === 'IKE' && setShowTaxComparison && (
                <button 
                  onClick={() => setShowTaxComparison(!showTaxComparison)}
                  className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all border ${showTaxComparison ? (isNeon ? 'bg-amber-900/30 text-amber-400 border-amber-500/50' : 'bg-amber-50 text-amber-700 border-amber-200') : `bg-transparent ${isNeon ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'}`}`}
                  title="Porównaj z kontem opodatkowanym (19% Belki)"
                >
                  <TaxToggleIcon className="w-4 h-4 mr-2" />
                  Podatek
                </button>
             )}

             <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
               <TrendingUp size={20} className={isNeon ? 'text-blue-400' : 'text-blue-600'} />
             </div>
          </div>
        </div>

        {portfolioType === 'PPK' ? (
          <ValueCompositionChart 
            data={showPPKProjection ? (ppkChartDataWithProjection || []) : data} 
            showProjection={showPPKProjection}
            themeMode={theme}
          />
        ) : (
          <CryptoValueChart 
            data={data} 
            showTaxComparison={showTaxComparison} 
            themeMode={theme} 
          />
        )}
      </div>

      {/* 2. ROI Analysis */}
      <div className={`mb-6 p-6 ${styles.cardContainer}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-bold ${styles.text}`}>Rentowność (ROI)</h3>
            {portfolioType === 'PPK' && <p className={`text-sm ${styles.textSub}`}>Nominalna vs Exit (po potrąceniach)</p>}
          </div>
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
            <Wallet size={20} className={isNeon ? 'text-purple-400' : 'text-purple-600'} />
          </div>
        </div>
        <ROIChart data={data} showExitRoi={portfolioType === 'PPK'} themeMode={theme} />
      </div>

      {/* IKE Specific: Dividends & Sector Allocation */}
      {portfolioType === 'IKE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Left: Dividend History */}
            <div className={`${styles.cardContainer} p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className={`text-lg font-bold ${styles.text}`}>Dywidendy</h3>
                        <p className={`text-sm ${styles.textSub}`}>Suma: {totalDividends.toLocaleString('pl-PL')} zł</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`flex border p-0.5 ${isNeon ? 'bg-black border-cyan-900/50 rounded-md' : 'bg-white border-slate-200 rounded-md'}`}>
                            <button onClick={() => setDividendViewMode('Yearly')} className={`px-2 py-1 text-[10px] font-medium rounded ${dividendViewMode === 'Yearly' ? (isNeon ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-800 text-white') : (isNeon ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}>Rok</button>
                            <button onClick={() => setDividendViewMode('Quarterly')} className={`px-2 py-1 text-[10px] font-medium rounded ${dividendViewMode === 'Quarterly' ? (isNeon ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-800 text-white') : (isNeon ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}>Kwartał</button>
                        </div>
                        <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
                            <IconDividends className={`w-5 h-5 ${isNeon ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                    </div>
                </div>
                <DividendChart data={dividendChartData} themeMode={theme} />
            </div>

            {/* Right: Sector Allocation */}
            <div className={`${styles.cardContainer} p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className={`text-lg font-bold ${styles.text}`}>Dywersyfikacja Sektorowa</h3>
                        <p className={`text-sm ${styles.textSub}`}>Alokacja aktywów IKE</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
                            <PieChart size={20} className={isNeon ? 'text-amber-400' : 'text-amber-600'} />
                        </div>
                    </div>
                </div>
                <SectorAllocationChart data={sectorAllocationData} themeMode={theme} />
            </div>
        </div>
      )}
    </>
  );
};
