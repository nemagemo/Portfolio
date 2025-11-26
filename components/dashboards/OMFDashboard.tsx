
import React, { useState, useMemo } from 'react';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, PieChart, Snowflake, ScatterChart, LayoutTemplate, CalendarDays, Milestone } from 'lucide-react';
import { SummaryStats, OMFDataRow, GlobalHistoryRow } from '../../types';
import { Theme, themeStyles } from '../../theme/styles';
import { GlobalSummaryChart, GlobalPerformanceChart, OMFTreemapChart, SeasonalityChart, PortfolioAllocationHistoryChart, BubbleRiskChart } from '../Charts';
import { ReturnsHeatmap } from '../ReturnsHeatmap';
import { HistoryTable } from '../HistoryTable';
import { NoPPKIcon, IconCAGR, IconLTM, IconHourglass, IconPulse } from '../Icons';

interface OMFDashboardProps {
  stats: SummaryStats | null;
  theme: Theme;
  activeAssets: OMFDataRow[];
  closedAssets: OMFDataRow[];
  globalHistory: GlobalHistoryRow[];
  dailyChangeData: any[];
  excludePPK: boolean;
  setExcludePPK: (v: boolean) => void;
  showCPI: boolean;
  setShowCPI: (v: boolean) => void;
  showProjection: boolean;
  setShowProjection: (v: boolean) => void;
  projectionMethod: 'LTM' | 'CAGR';
  setProjectionMethod: (m: 'LTM' | 'CAGR') => void;
  rateDisplay: { ltm: number; cagr: number };
  chartDataWithProjection: GlobalHistoryRow[];
  omfStructureData: any[];
  heatmapHistoryData: any[];
}

export const OMFDashboard: React.FC<OMFDashboardProps> = ({
  stats, theme, activeAssets, closedAssets, globalHistory, dailyChangeData,
  excludePPK, setExcludePPK, showCPI, setShowCPI, showProjection, setShowProjection,
  projectionMethod, setProjectionMethod, rateDisplay, chartDataWithProjection,
  omfStructureData, heatmapHistoryData
}) => {
  const styles = themeStyles[theme];
  const [isActivePositionsExpanded, setIsActivePositionsExpanded] = useState(false);
  const [isClosedHistoryExpanded, setIsClosedHistoryExpanded] = useState(false);
  const [bubbleChartFilter, setBubbleChartFilter] = useState<'ALL' | 'KRYPTO' | 'IKE'>('ALL');

  const investmentDuration = useMemo(() => {
    if (globalHistory.length === 0) return { months: 0 };
    const start = globalHistory[0].date;
    const end = globalHistory[globalHistory.length - 1].date;
    const d1 = new Date(start);
    const d2 = new Date(end);
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return { months: Math.max(0, months) };
  }, [globalHistory]);

  const filteredBubbleData = useMemo(() => {
    if (bubbleChartFilter === 'ALL') return activeAssets;
    return activeAssets.filter(a => a.portfolio.toUpperCase().includes(bubbleChartFilter));
  }, [activeAssets, bubbleChartFilter]);

  const isNeon = theme === 'neon';

  if (!stats) return null;

  return (
    <div className="space-y-8">
      
      {/* PORTFOLIO HEADER */}
      <div className={`w-full p-6 lg:p-8 ${styles.cardContainer} relative overflow-hidden`}>
        {/* Decorative Background Elements for Neon */}
        {isNeon && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
          
          {/* LEFT: Main Capital Stats (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className={`text-xs uppercase tracking-widest font-bold mb-2 flex items-center ${isNeon ? 'text-cyan-600' : 'text-slate-400'}`}>
              <Wallet size={14} className="mr-2" /> Wartość Portfela
            </h2>
            <div className="flex items-baseline">
              <span className={`text-4xl sm:text-5xl font-black tracking-tight ${isNeon ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500' : 'text-slate-900'}`}>
                {(stats.totalValue || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xl ml-2 font-medium ${isNeon ? 'text-cyan-700' : 'text-slate-400'}`}>zł</span>
            </div>
            
            <div className="mt-4 flex items-center">
              <div className={`h-1.5 w-full overflow-hidden ${isNeon ? 'bg-slate-800 rounded-full' : 'bg-slate-100 rounded-full'}`}>
                <div 
                  className={`h-full ${isNeon ? 'bg-blue-500 rounded-full' : 'bg-slate-400 rounded-full'}`} 
                  style={{ width: `${(stats.totalInvestment && stats.totalValue) ? Math.min(100, (stats.totalInvestment / stats.totalValue) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium font-mono">
              <span className={isNeon ? 'text-blue-400' : 'text-slate-500'}>
                Wkład: {(stats.totalInvestment || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
              </span>
              <span className={isNeon ? 'text-cyan-600' : 'text-slate-400'}>
                {stats.totalInvestment && stats.totalValue ? ((stats.totalInvestment / stats.totalValue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* MIDDLE: Performance Stats (3 cols) */}
          <div className={`lg:col-span-3 flex flex-col justify-center lg:border-l lg:border-r ${isNeon ? 'lg:border-cyan-900/30' : 'lg:border-slate-100'} lg:px-8`}>
             <h2 className={`text-xs uppercase tracking-widest font-bold mb-3 ${isNeon ? 'text-cyan-600' : 'text-slate-400'}`}>
               Wynik Całkowity
             </h2>
             <div className={`text-2xl sm:text-3xl font-bold mb-1 ${(stats.totalProfit || 0) >= 0 ? (isNeon ? 'text-[#39ff14] drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]' : 'text-emerald-600') : 'text-rose-500'}`}>
                {(stats.totalProfit || 0) > 0 ? '+' : ''}{(stats.totalProfit || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
             </div>
             
             <div className="flex items-center mt-2">
                <span className={`px-2.5 py-1 text-sm font-bold flex items-center ${
                  (stats.currentRoi || 0) >= 0 
                    ? (isNeon ? 'bg-green-900/30 text-green-400 border border-green-500/30 rounded' : 'bg-emerald-100 text-emerald-700 rounded') 
                    : 'bg-rose-100 text-rose-700 rounded'
                }`}>
                  {(stats.currentRoi || 0) >= 0 ? <TrendingUp size={14} className="mr-1.5"/> : <TrendingUp size={14} className="mr-1.5 rotate-180"/>}
                  {(stats.currentRoi || 0).toFixed(2)}% ROI
                </span>
             </div>
             {stats.profitTrend !== undefined && (
                <div className={`text-[10px] mt-2 font-mono ${isNeon ? 'text-slate-500' : 'text-slate-400'}`}>
                  {(stats.profitTrend || 0) > 0 ? '▲' : '▼'} {Math.abs(stats.profitTrend || 0).toFixed(1)}% m/m
                </div>
             )}
          </div>

          {/* RIGHT: Technical Metrics (4 cols) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
             {/* Metric Block: CAGR */}
             <div className={`p-3 border ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                <div className="flex justify-between items-start mb-1">
                  <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-purple-400' : 'text-slate-400'}`}>CAGR</div>
                  <IconCAGR className={`w-4 h-4 ${isNeon ? 'text-purple-500/80' : 'text-purple-400/60'}`} />
                </div>
                <div className={`text-lg font-bold ${isNeon ? 'text-purple-300' : 'text-slate-700'}`}>{stats.cagr?.toFixed(2)}%</div>
                <div className={`text-[9px] ${isNeon ? 'text-purple-500/60' : 'text-slate-400'}`}>Średniorocznie</div>
             </div>

             {/* Metric Block: LTM */}
             <div className={`p-3 border ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                <div className="flex justify-between items-start mb-1">
                  <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-amber-400' : 'text-slate-400'}`}>LTM</div>
                  <IconLTM className={`w-4 h-4 ${isNeon ? 'text-amber-500/80' : 'text-amber-400/60'}`} />
                </div>
                <div className={`text-lg font-bold ${isNeon ? 'text-amber-300' : 'text-slate-700'}`}>{stats.ltm?.toFixed(2)}%</div>
                <div className={`text-[9px] ${isNeon ? 'text-amber-500/60' : 'text-slate-400'}`}>Ost. 12 msc (TWR)</div>
             </div>

             {/* Metric Block: Time */}
             <div className={`p-3 border ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                <div className="flex justify-between items-start mb-1">
                  <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-blue-400' : 'text-slate-400'}`}>Czas</div>
                  <IconHourglass className={`w-4 h-4 ${isNeon ? 'text-blue-500/80' : 'text-blue-400/60'}`} />
                </div>
                <div className={`text-lg font-bold ${isNeon ? 'text-blue-300' : 'text-slate-700'}`}>{investmentDuration.months} <span className="text-xs font-normal">msc</span></div>
                <div className={`text-[9px] ${isNeon ? 'text-blue-500/60' : 'text-slate-400'}`}>od startu</div>
             </div>

             {/* Metric Block: Daily Change */}
             <div className={`p-3 border ${isNeon ? 'bg-black/40 border-cyan-900/30 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                <div className="flex justify-between items-start mb-1">
                  <div className={`text-[10px] uppercase font-bold ${isNeon ? 'text-cyan-400' : 'text-slate-400'}`}>24h</div>
                  <IconPulse className={`w-4 h-4 ${isNeon ? 'text-cyan-500/80' : 'text-cyan-400/60'}`} />
                </div>
                <div className={`text-lg font-bold flex items-center ${
                  (stats.dailyTrend || 0) >= 0 
                    ? (isNeon ? 'text-[#39ff14]' : 'text-emerald-600') 
                    : 'text-rose-500'
                }`}>
                   {(stats.dailyTrend || 0) >= 0 ? <ArrowUpRight size={16} className="mr-1"/> : <ArrowDownRight size={16} className="mr-1"/>}
                   {Math.abs(stats.dailyTrend || 0).toFixed(2)}%
                </div>
                <div className={`text-[9px] ${isNeon ? 'text-cyan-500/60' : 'text-slate-400'}`}>Zmiana wartości</div>
             </div>
          </div>

        </div>
      </div>

      {/* Main Chart */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <h3 className={`text-lg font-bold ${styles.text}`}>Historia Old Man Fund</h3>
            <p className={`text-sm ${styles.textSub}`}>PPK + Krypto + IKE</p>
          </div>
          <div className={`flex items-center space-x-3 p-2 border ${isNeon ? 'bg-black/50 border-cyan-900/50 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
              <button onClick={() => setExcludePPK(!excludePPK)} disabled={showCPI || showProjection} className={`flex items-center justify-center w-20 px-2 py-1.5 transition-all ${excludePPK ? styles.toggleNoPPKActive : `bg-transparent ${isNeon ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`} rounded-md ${showCPI || showProjection ? 'opacity-50 cursor-not-allowed' : ''}`} title={excludePPK ? "Pokaż PPK" : "Ukryj PPK"}>
                <NoPPKIcon className="w-full h-4" />
              </button>
              <button onClick={() => setShowCPI(!showCPI)} disabled={excludePPK} className={`flex items-center px-3 py-1.5 text-xs font-bold transition-all ${showCPI ? styles.toggleCPIActive : `bg-transparent ${isNeon ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`} rounded-md ${excludePPK ? 'opacity-50 cursor-not-allowed' : ''}`}>CPI</button>
              <div className={`w-px h-6 mx-1 ${isNeon ? 'bg-cyan-900/50' : 'bg-slate-200'}`}></div>
              <button onClick={() => setShowProjection(!showProjection)} disabled={excludePPK} className={`flex items-center px-3 py-1.5 text-xs font-bold transition-all ${showProjection ? styles.toggleProjectionActive : `bg-transparent ${isNeon ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`} rounded-md ${excludePPK ? 'opacity-50 cursor-not-allowed' : ''}`}><Milestone size={14} className="mr-2" />Droga do Miliona</button>
              {showProjection && (
                <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className={`flex border p-0.5 ${isNeon ? 'bg-black border-cyan-900/50 rounded-md' : 'bg-white border-slate-200 rounded-md'}`}>
                    <button onClick={() => setProjectionMethod('LTM')} className={`px-2 py-1 text-[10px] font-medium ${projectionMethod === 'LTM' ? (isNeon ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-800 text-white') : (isNeon ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')} rounded`}>LTM</button>
                    <button onClick={() => setProjectionMethod('CAGR')} className={`px-2 py-1 text-[10px] font-medium ${projectionMethod === 'CAGR' ? (isNeon ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-800 text-white') : (isNeon ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')} rounded`}>CAGR</button>
                  </div>
                  <span className={`text-[10px] font-mono ${styles.textSub}`}>+{projectionMethod === 'LTM' ? rateDisplay.ltm.toFixed(2) : rateDisplay.cagr.toFixed(2)}% m/m</span>
                </div>
              )}
          </div>
        </div>
        <GlobalSummaryChart data={chartDataWithProjection} showProjection={showProjection} showCPI={showCPI} themeMode={theme} />
      </div>

      {/* Performance Chart */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div><h3 className={`text-lg font-bold ${styles.text}`}>Efektywność Old Man Fund</h3><p className={`text-sm ${styles.textSub}`}>ROI oraz TWR w czasie</p></div>
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><TrendingUp className={isNeon ? 'text-purple-400' : 'text-purple-600'} size={20} /></div>
        </div>
        <GlobalPerformanceChart data={globalHistory} themeMode={theme} />
      </div>

      {/* Treemap ROI */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div><h3 className={`text-lg font-bold ${styles.text}`}>Heatmap ROI</h3></div>
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><LayoutTemplate className={isNeon ? 'text-cyan-400' : 'text-cyan-600'} size={20} /></div>
        </div>
        <OMFTreemapChart data={omfStructureData} themeMode={theme} />
      </div>

      {/* Bubble Risk Map (Zmiana 24h) */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-bold ${styles.text}`}>Zmiana 24h</h3>
            <p className={`text-[10px] sm:text-xs mt-1 ${isNeon ? 'text-slate-500' : 'text-slate-400'}`}>
              Gdy zmiana wynosi 0 lub jest bardzo duża, może to wskazywać na błąd synchronizacji danych. <br/>
              Elementy oznaczone na żółto nie mają aktualnej ceny (Offline).
            </p>
          </div>
          <div className="flex space-x-2 items-center">
             <div className={`flex items-center space-x-1 p-1 border ${isNeon ? 'bg-black/50 border-cyan-900/50 rounded-lg' : 'bg-slate-50 border-slate-100 rounded-lg'}`}>
                <button onClick={() => setBubbleChartFilter('ALL')} className={`px-3 py-1 text-xs font-bold transition-all ${bubbleChartFilter === 'ALL' ? (isNeon ? 'bg-cyan-900 text-cyan-300' : 'bg-white text-slate-800 shadow-sm') : (isNeon ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')} rounded-md`}>Wszystkie</button>
                <button onClick={() => setBubbleChartFilter('KRYPTO')} className={`px-3 py-1 text-xs font-bold transition-all ${bubbleChartFilter === 'KRYPTO' ? (isNeon ? 'bg-cyan-900 text-cyan-300' : 'bg-white text-slate-800 shadow-sm') : (isNeon ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')} rounded-md`}>Krypto</button>
                <button onClick={() => setBubbleChartFilter('IKE')} className={`px-3 py-1 text-xs font-bold transition-all ${bubbleChartFilter === 'IKE' ? (isNeon ? 'bg-cyan-900 text-cyan-300' : 'bg-white text-slate-800 shadow-sm') : (isNeon ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')} rounded-md`}>IKE</button>
             </div>
             <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><ScatterChart className={isNeon ? 'text-amber-400' : 'text-amber-600'} size={20} /></div>
          </div>
        </div>
        <BubbleRiskChart data={filteredBubbleData} themeMode={theme} />
      </div>

      {/* Monthly Returns */}
      <div className={`${styles.cardContainer} p-6 overflow-x-auto`}>
        <div className="flex items-center justify-between mb-6 min-w-[600px]">
          <div><h3 className={`text-lg font-bold ${styles.text}`}>Miesięczne Stopy Zwrotu</h3><p className={`text-sm ${styles.textSub}`}>Bez PPK</p></div>
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><CalendarDays className={isNeon ? 'text-emerald-400' : 'text-emerald-600'} size={20} /></div>
        </div>
        <ReturnsHeatmap data={heatmapHistoryData} themeMode={theme} />
      </div>

      {/* Seasonality */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div><h3 className={`text-lg font-bold ${styles.text}`}>Sezonowość</h3><p className={`text-sm ${styles.textSub}`}>Średnia stopa zwrotu w poszczególnych miesiącach</p></div>
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><Snowflake className={isNeon ? 'text-blue-400' : 'text-blue-600'} size={20} /></div>
        </div>
        <SeasonalityChart data={heatmapHistoryData} themeMode={theme} />
      </div>

      {/* Allocation History */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div><h3 className={`text-lg font-bold ${styles.text}`}>Historia Alokacji Portfela</h3><p className={`text-sm ${styles.textSub}`}>Zmiana udziału procentowego PPK, Crypto i IKE w czasie</p></div>
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><PieChart className={isNeon ? 'text-blue-400' : 'text-blue-600'} size={20} /></div>
        </div>
        <PortfolioAllocationHistoryChart data={globalHistory} themeMode={theme} />
      </div>

      {/* Active Positions Table */}
      <div className={`${styles.cardContainer} overflow-hidden`}>
        <div 
          className={`px-6 py-4 border-b flex justify-between items-center cursor-pointer transition-colors ${isNeon ? 'bg-black/20 border-cyan-900/30 hover:bg-cyan-950/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`} 
          onClick={() => setIsActivePositionsExpanded(!isActivePositionsExpanded)}
        >
          <div className="flex items-center space-x-2">
            <h3 className={`text-lg font-bold ${styles.text}`}>Aktywne Pozycje</h3>
            {isActivePositionsExpanded ? <ChevronUp size={20} className={isNeon ? 'text-cyan-600' : 'text-slate-400'}/> : <ChevronDown size={20} className={isNeon ? 'text-cyan-600' : 'text-slate-400'}/>}
          </div>
          <span className={`text-xs font-medium px-2 py-1 transition-all ${isNeon ? 'rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-700/50' : 'rounded-full bg-emerald-100 text-emerald-700'}`}>
            {activeAssets.length} pozycji
          </span>
        </div>
        {isActivePositionsExpanded && (
          <HistoryTable data={activeAssets} type="OMF" omfVariant="active" themeMode={theme} />
        )}
      </div>

      {/* Closed Positions Table */}
      <div className={`${styles.cardContainer} overflow-hidden`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center cursor-pointer transition-colors ${isNeon ? 'bg-black/20 border-cyan-900/30 hover:bg-cyan-950/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`} onClick={() => setIsClosedHistoryExpanded(!isClosedHistoryExpanded)}>
          <div className="flex items-center space-x-2"><h3 className={`text-lg font-bold ${styles.text}`}>Historia Zamkniętych Pozycji</h3>{isClosedHistoryExpanded ? <ChevronUp size={20} className={isNeon ? 'text-cyan-600' : 'text-slate-400'}/> : <ChevronDown size={20} className={isNeon ? 'text-cyan-600' : 'text-slate-400'}/>}</div>
          <span className={`text-xs font-medium px-2 py-1 transition-all ${isNeon ? 'rounded-full bg-slate-800 text-slate-400 border border-slate-700' : 'rounded-full bg-slate-200 text-slate-600'}`}>{closedAssets.length} pozycji</span>
        </div>
        {isClosedHistoryExpanded && (<HistoryTable data={closedAssets} type="OMF" omfVariant="closed" themeMode={theme} />)}
      </div>
    </div>
  );
};
