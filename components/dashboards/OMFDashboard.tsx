
import React, { useState, useMemo } from 'react';
import { LayoutGrid, TrendingUp, Wallet, Timer, Percent, Activity, Calendar, Milestone, LayoutTemplate, Flame, CalendarDays, Snowflake, PieChart, ChevronDown, ChevronUp, BarChart2, ScatterChart } from 'lucide-react';
import { SummaryStats, OMFDataRow, GlobalHistoryRow } from '../../types';
import { StatsCard } from '../StatsCard';
import { Theme, themeStyles } from '../../theme/styles';
import { GlobalSummaryChart, GlobalPerformanceChart, OMFTreemapChart, DailyChangeHeatmap, SeasonalityChart, PortfolioAllocationHistoryChart, BubbleRiskChart, ContributionBarChart } from '../Charts';
import { ReturnsHeatmap } from '../ReturnsHeatmap';
import { HistoryTable } from '../HistoryTable';
import { NoPPKIcon } from '../Icons';

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

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Wartość Całkowita" value={`${(stats.totalValue || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`} subValue="Aktywa Otwarte + Gotówka" icon={LayoutGrid} colorClass={theme === 'neon' ? 'text-cyan-400' : "text-slate-800 bg-slate-100"} className={styles.cardContainer} />
        <StatsCard 
          title="Zysk" 
          value={`${(stats.totalProfit || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`} 
          trend={stats.profitTrend} 
          trendLabel="m/m"
          leftTrend={stats.dailyTrend}
          leftTrendLabel="24h"
          icon={TrendingUp} 
          colorClass={theme === 'neon' ? 'text-emerald-400' : "text-emerald-600 bg-emerald-50"} 
          className={styles.cardContainer} 
        />
        <StatsCard title="Zainwestowano" value={`${(stats.totalInvestment || 0).toLocaleString('pl-PL')} zł`} subValue="Aktywa + Gotówka" icon={Wallet} colorClass={theme === 'neon' ? 'text-blue-400' : "text-blue-600 bg-blue-50"} className={styles.cardContainer} />
        <StatsCard title="Czas od Startu" value={`${investmentDuration.months}`} subValue="msc" icon={Timer} colorClass={theme === 'neon' ? 'text-violet-400' : "text-violet-600 bg-violet-50"} className={styles.cardContainer} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Całkowite ROI" value={`${(stats.currentRoi || 0).toFixed(2)}%`} icon={Percent} colorClass={theme === 'neon' ? 'text-indigo-400' : "text-indigo-600 bg-indigo-50"} className={styles.cardContainer} />
        <StatsCard title="CAGR" value={`${(stats.cagr || 0).toFixed(2)}%`} subValue="(ROI Based)" icon={Activity} colorClass={theme === 'neon' ? 'text-purple-400' : "text-purple-600 bg-purple-50"} className={styles.cardContainer} />
        <StatsCard title="LTM" value={`${(stats.ltm || 0).toFixed(2)}%`} subValue="(TWR)" icon={Timer} colorClass={theme === 'neon' ? 'text-amber-400' : "text-amber-600 bg-amber-50"} className={styles.cardContainer} />
        <StatsCard title="YTD" value={`${(stats.ytd || 0).toFixed(2)}%`} subValue="(TWR)" icon={Calendar} colorClass={theme === 'neon' ? 'text-teal-400' : "text-teal-600 bg-teal-50"} className={styles.cardContainer} />
      </div>

      {/* Main Chart */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <h3 className={`text-lg font-bold ${styles.text}`}>Historia Old Man Fund</h3>
            <p className={`text-sm ${styles.textSub}`}>PPK + Krypto + IKE</p>
          </div>
          <div className={`flex items-center space-x-3 p-2 rounded-lg border ${theme === 'neon' ? 'bg-black/50 border-cyan-900/50' : 'bg-slate-50 border-slate-100'}`}>
              <button onClick={() => setExcludePPK(!excludePPK)} disabled={showCPI || showProjection} className={`flex items-center justify-center w-20 px-2 py-1.5 rounded-md transition-all ${excludePPK ? styles.toggleNoPPKActive : `bg-transparent ${theme === 'neon' ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`} ${showCPI || showProjection ? 'opacity-50 cursor-not-allowed' : ''}`} title={excludePPK ? "Pokaż PPK" : "Ukryj PPK"}>
                <NoPPKIcon className="w-full h-4" />
              </button>
              <button onClick={() => setShowCPI(!showCPI)} disabled={excludePPK} className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${showCPI ? styles.toggleCPIActive : `bg-transparent ${theme === 'neon' ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`} ${excludePPK ? 'opacity-50 cursor-not-allowed' : ''}`}>CPI</button>
              <div className={`w-px h-6 mx-1 ${theme === 'neon' ? 'bg-cyan-900/50' : 'bg-slate-200'}`}></div>
              <button onClick={() => setShowProjection(!showProjection)} disabled={excludePPK} className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${showProjection ? styles.toggleProjectionActive : `bg-transparent ${theme === 'neon' ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`} ${excludePPK ? 'opacity-50 cursor-not-allowed' : ''}`}><Milestone size={14} className="mr-2" />Droga do Miliona</button>
              {showProjection && (
                <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className={`flex rounded-md border p-0.5 ${theme === 'neon' ? 'bg-black border-cyan-900/50' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => setProjectionMethod('LTM')} className={`px-2 py-1 text-[10px] font-medium rounded ${projectionMethod === 'LTM' ? (theme === 'neon' ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-800 text-white') : (theme === 'neon' ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}>LTM</button>
                    <button onClick={() => setProjectionMethod('CAGR')} className={`px-2 py-1 text-[10px] font-medium rounded ${projectionMethod === 'CAGR' ? (theme === 'neon' ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-800 text-white') : (theme === 'neon' ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}>CAGR</button>
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
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><TrendingUp className={theme === 'neon' ? 'text-purple-400' : 'text-purple-600'} size={20} /></div>
        </div>
        <GlobalPerformanceChart data={globalHistory} themeMode={theme} />
      </div>

      {/* Treemap ROI */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div><h3 className={`text-lg font-bold ${styles.text}`}>Heatmap ROI</h3></div>
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><LayoutTemplate className={theme === 'neon' ? 'text-cyan-400' : 'text-cyan-600'} size={20} /></div>
        </div>
        <OMFTreemapChart data={omfStructureData} themeMode={theme} />
      </div>

      {/* Bubble Risk Map (Renamed to Zmiana 24h and Full Width) */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div><h3 className={`text-lg font-bold ${styles.text}`}>Zmiana 24h</h3></div>
          <div className="flex space-x-2 items-center">
             <div className={`flex items-center space-x-1 p-1 rounded-lg border ${theme === 'neon' ? 'bg-black/50 border-cyan-900/50' : 'bg-slate-50 border-slate-100'}`}>
                <button onClick={() => setBubbleChartFilter('ALL')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${bubbleChartFilter === 'ALL' ? (theme === 'neon' ? 'bg-cyan-900 text-cyan-300' : 'bg-white text-slate-800 shadow-sm') : (theme === 'neon' ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}>Wszystkie</button>
                <button onClick={() => setBubbleChartFilter('KRYPTO')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${bubbleChartFilter === 'KRYPTO' ? (theme === 'neon' ? 'bg-cyan-900 text-cyan-300' : 'bg-white text-slate-800 shadow-sm') : (theme === 'neon' ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}>Krypto</button>
                <button onClick={() => setBubbleChartFilter('IKE')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${bubbleChartFilter === 'IKE' ? (theme === 'neon' ? 'bg-cyan-900 text-cyan-300' : 'bg-white text-slate-800 shadow-sm') : (theme === 'neon' ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}>IKE</button>
             </div>
             <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><ScatterChart className={theme === 'neon' ? 'text-amber-400' : 'text-amber-600'} size={20} /></div>
          </div>
        </div>
        <BubbleRiskChart data={filteredBubbleData} themeMode={theme} />
      </div>

      {/* Monthly Returns */}
      <div className={`${styles.cardContainer} p-6 overflow-x-auto`}>
        <div className="flex items-center justify-between mb-6 min-w-[600px]">
          <div><h3 className={`text-lg font-bold ${styles.text}`}>Miesięczne Stopy Zwrotu</h3><p className={`text-sm ${styles.textSub}`}>Bez PPK</p></div>
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><CalendarDays className={theme === 'neon' ? 'text-emerald-400' : 'text-emerald-600'} size={20} /></div>
        </div>
        <ReturnsHeatmap data={heatmapHistoryData} themeMode={theme} />
      </div>

      {/* Seasonality */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div><h3 className={`text-lg font-bold ${styles.text}`}>Sezonowość</h3><p className={`text-sm ${styles.textSub}`}>Średnia stopa zwrotu w poszczególnych miesiącach</p></div>
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><Snowflake className={theme === 'neon' ? 'text-blue-400' : 'text-blue-600'} size={20} /></div>
        </div>
        <SeasonalityChart data={heatmapHistoryData} themeMode={theme} />
      </div>

      {/* Allocation History */}
      <div className={`${styles.cardContainer} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div><h3 className={`text-lg font-bold ${styles.text}`}>Historia Alokacji Portfela</h3><p className={`text-sm ${styles.textSub}`}>Zmiana udziału procentowego PPK, Crypto i IKE w czasie</p></div>
          <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}><PieChart className={theme === 'neon' ? 'text-blue-400' : 'text-blue-600'} size={20} /></div>
        </div>
        <PortfolioAllocationHistoryChart data={globalHistory} themeMode={theme} />
      </div>

      {/* Active Positions Table */}
      <div className={`${styles.cardContainer} overflow-hidden`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center cursor-pointer transition-colors ${theme === 'neon' ? 'bg-black/20 border-cyan-900/30 hover:bg-cyan-950/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`} onClick={() => setIsActivePositionsExpanded(!isActivePositionsExpanded)}>
          <div className="flex items-center space-x-2"><h3 className={`text-lg font-bold ${styles.text}`}>Aktywne Pozycje</h3>{isActivePositionsExpanded ? <ChevronUp size={20} className={theme === 'neon' ? 'text-cyan-600' : 'text-slate-400'}/> : <ChevronDown size={20} className={theme === 'neon' ? 'text-cyan-600' : 'text-slate-400'}/>}</div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${theme === 'neon' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50' : 'bg-emerald-100 text-emerald-700'}`}>{activeAssets.length} pozycji</span>
        </div>
        {isActivePositionsExpanded && (<HistoryTable data={activeAssets} type="OMF" omfVariant="active" themeMode={theme} />)}
      </div>

      {/* Closed Positions Table */}
      <div className={`${styles.cardContainer} overflow-hidden`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center cursor-pointer transition-colors ${theme === 'neon' ? 'bg-black/20 border-cyan-900/30 hover:bg-cyan-950/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`} onClick={() => setIsClosedHistoryExpanded(!isClosedHistoryExpanded)}>
          <div className="flex items-center space-x-2"><h3 className={`text-lg font-bold ${styles.text}`}>Historia Zamkniętych Pozycji</h3>{isClosedHistoryExpanded ? <ChevronUp size={20} className={theme === 'neon' ? 'text-cyan-600' : 'text-slate-400'}/> : <ChevronDown size={20} className={theme === 'neon' ? 'text-cyan-600' : 'text-slate-400'}/>}</div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${theme === 'neon' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-600'}`}>{closedAssets.length} pozycji</span>
        </div>
        {isClosedHistoryExpanded && (<HistoryTable data={closedAssets} type="OMF" omfVariant="closed" themeMode={theme} />)}
      </div>
    </div>
  );
};
