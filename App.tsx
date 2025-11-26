
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, LayoutGrid, Briefcase, Coins, PiggyBank, Sun, Palette, Zap, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { PortfolioType, GlobalHistoryRow, OMFDataRow } from './types';
import { themeStyles, Theme } from './theme/styles';
import { useMarketData } from './hooks/useMarketData';
import { usePortfolioData } from './hooks/usePortfolioData';
import { DataStatus, OMFIntegrityStatus } from './components/StatusCards';
import { StandardDashboard } from './components/dashboards/StandardDashboard';
import { OMFDashboard } from './components/dashboards/OMFDashboard';
import { OMF_LAST_UPDATED } from './CSV/OMFopen';

export const App: React.FC = () => {
  const [portfolioType, setPortfolioType] = useState<PortfolioType>('OMF');
  const [theme, setTheme] = useState<Theme>('light');
  
  // Local UI State for OMF Dashboard
  const [showProjection, setShowProjection] = useState(false);
  const [projectionMethod, setProjectionMethod] = useState<'LTM' | 'CAGR'>('LTM');
  const [showCPI, setShowCPI] = useState(false);
  const [excludePPK, setExcludePPK] = useState(false);

  // Local UI State for PPK/IKE
  const [showPPKProjection, setShowPPKProjection] = useState(false);
  const [showTaxComparison, setShowTaxComparison] = useState(false);

  const styles = themeStyles[theme];

  // 1. Data Fetching Hooks
  const { onlinePrices, historyPrices, pricingMode, isRefreshing, fetchPrices } = useMarketData();
  
  // 2. Business Logic Hook
  const { 
    data, 
    report, 
    omfReport, 
    omfActiveAssets, 
    omfClosedAssets, 
    globalHistoryData, 
    stats
  } = usePortfolioData({ 
    portfolioType, 
    onlinePrices, 
    historyPrices, 
    excludePPK 
  });

  const handlePortfolioChange = (type: PortfolioType) => {
    setPortfolioType(type);
    setShowTaxComparison(false);
  };

  const isOfflineValid = (portfolioType === 'OMF' && omfReport?.isConsistent) || (portfolioType !== 'OMF' && report?.isValid);

  // Determine Status Label logic
  const statusLogic = useMemo(() => {
      if (isRefreshing) return { label: 'Odświeżanie danych...', icon: RefreshCw, colorClass: 'bg-blue-50 text-blue-600 border-blue-200', spin: true, percent: 0, isPartial: false };
      
      // Date formatting for tooltip
      const dateInfo = OMF_LAST_UPDATED ? ` (Dane z: ${OMF_LAST_UPDATED})` : '';

      if (pricingMode === 'Offline') return { 
          label: `Tryb Offline - Kliknij aby odświeżyć${dateInfo}`, 
          icon: WifiOff, 
          colorClass: theme === 'neon' ? 'bg-slate-800/80 text-slate-400 border-slate-600/50' : 'bg-slate-100 text-slate-500 border-slate-200',
          spin: false,
          percent: 0,
          isPartial: false
      };
      
      // Online logic - check for partial data
      let isPartial = false;
      let percent = 100;
      let tooltipLabel = 'Tryb Online (Wszystkie ceny aktualne)';

      if (portfolioType === 'OMF' && onlinePrices) {
          // Only count actual investment assets (exclude Cash types like PLN, PLN-IKE)
          const investableAssets = omfActiveAssets.filter(a => a.status === 'Otwarta' && a.type !== 'Gotówka');
          const totalAssets = investableAssets.length;
          const loadedAssets = investableAssets.filter(a => a.isLivePrice).length;
          
          if (totalAssets > 0 && loadedAssets < totalAssets) {
             isPartial = true;
             percent = Math.round((loadedAssets / totalAssets) * 100);
             tooltipLabel = `Tryb Online (${percent}% cen pobranych)`;
          }
      }

      if (isPartial) {
          return { 
              label: tooltipLabel, 
              icon: AlertCircle, 
              colorClass: theme === 'neon' ? 'bg-yellow-900/80 text-yellow-300 border-yellow-600/50' : 'bg-amber-50 text-amber-600 border-amber-200',
              spin: false,
              percent,
              isPartial: true
          };
      }

      return { 
          label: tooltipLabel, 
          icon: Wifi, 
          colorClass: theme === 'neon' ? 'bg-blue-900/80 text-blue-300 border-blue-600/50' : 'bg-blue-50 text-blue-600 border-blue-200',
          spin: false,
          percent: 100,
          isPartial: false
      };
  }, [pricingMode, isRefreshing, theme, onlinePrices, omfActiveAssets, portfolioType]);


  // --- Road to Million Logic (OMF) ---
  const chartDataWithProjection = useMemo(() => {
    if (!showProjection || globalHistoryData.length === 0) return globalHistoryData;
    const lastData = globalHistoryData[globalHistoryData.length - 1];
    if (!lastData || lastData.totalValue <= 0) return globalHistoryData;

    // 1. Growth Rate
    let ltmMonthlyRate = 0.01; 
    if (globalHistoryData.length >= 12) {
       const prevData = globalHistoryData[globalHistoryData.length - 12];
       ltmMonthlyRate = Math.pow(lastData.totalValue / prevData.totalValue, 1/12) - 1;
    } else {
       const firstData = globalHistoryData[0];
       ltmMonthlyRate = Math.pow(lastData.totalValue / firstData.totalValue, 1/globalHistoryData.length) - 1;
    }
    const annualCagrDecimal = 0.10;
    const cagrMonthlyRate = Math.pow(1 + annualCagrDecimal, 1/12) - 1;
    const monthlyRate = projectionMethod === 'LTM' ? ltmMonthlyRate : cagrMonthlyRate;

    const projectionPoints: GlobalHistoryRow[] = [];
    let currentValue = lastData.totalValue;
    let currentDate = new Date(lastData.date);
    let iterations = 0;
    
    while (currentValue < 1000000 && iterations < 360) {
       iterations++;
       currentDate.setMonth(currentDate.getMonth() + 1);
       currentValue = currentValue * (1 + monthlyRate);
       
       const y = currentDate.getFullYear();
       const m = String(currentDate.getMonth() + 1).padStart(2, '0');
       const d = String(currentDate.getDate()).padStart(2, '0');
       const dateStr = `${y}-${m}-${d}`;

       projectionPoints.push({
         date: dateStr,
         investment: 0, profit: 0, totalValue: 0, projectedValue: currentValue,
         roi: 0, cumulativeTwr: 0, ppkShare: 0, cryptoShare: 0, ikeShare: 0
       });
    }

    const connectionPoint = { ...lastData, projectedValue: lastData.totalValue };
    const historyWithConnection = [...globalHistoryData];
    historyWithConnection[historyWithConnection.length - 1] = connectionPoint;
    return [...historyWithConnection, ...projectionPoints];
  }, [globalHistoryData, showProjection, projectionMethod]);

  const rateDisplay = useMemo(() => {
      if (globalHistoryData.length < 2) return { ltm: 0, cagr: 0 };
      const lastData = globalHistoryData[globalHistoryData.length - 1];
      const firstData = globalHistoryData[0];
      
      let ltmRate = 0;
      if (globalHistoryData.length >= 12) {
          const prev = globalHistoryData[globalHistoryData.length - 12];
          ltmRate = (Math.pow(lastData.totalValue / prev.totalValue, 1/12) - 1) * 100;
      } else {
          ltmRate = (Math.pow(lastData.totalValue / firstData.totalValue, 1/globalHistoryData.length) - 1) * 100;
      }
      return { ltm: ltmRate, cagr: (Math.pow(1.10, 1/12) - 1) * 100 };
  }, [globalHistoryData]);

  // --- PPK Projection Logic ---
  const ppkChartDataWithProjection = useMemo(() => {
    if (portfolioType !== 'PPK' || !showPPKProjection || data.length === 0) return data;
    const ppkData = data as any[];
    const lastData = ppkData[ppkData.length - 1];
    const monthlyRate = Math.pow(1.12, 1/12) - 1;
    
    const projectionPoints = [];
    let currentValue = lastData.totalValue;
    let currentDate = new Date(lastData.date);
    
    while (currentDate < new Date('2049-05-01')) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentValue *= (1 + monthlyRate);
        
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        projectionPoints.push({ date: dateStr, projectedTotalValue: currentValue });
    }
    
    const connection = { ...lastData, projectedTotalValue: lastData.totalValue };
    const history = [...ppkData];
    history[history.length - 1] = connection;
    return [...history, ...projectionPoints];
  }, [data, portfolioType, showPPKProjection]);

  const omfStructureData = useMemo(() => {
    if (portfolioType !== 'OMF' || !omfActiveAssets.length) return [];
    const groups: Record<string, any[]> = {};
    let cryptoRestVal = 0, cryptoRestPurch = 0;
    let aggregatedCashVal = 0;

    omfActiveAssets.forEach(a => {
      // AGGREGATION LOGIC: Sum PLN and PLN-IKE into one variable
      if (a.symbol === 'PLN' || a.symbol === 'PLN-IKE') {
        aggregatedCashVal += a.currentValue;
        return; // Skip adding them as individual items
      }

      let p = a.portfolio || 'Inne';
      
      if (p.toUpperCase().includes('KRYPTO') && a.currentValue < 1000) {
         cryptoRestVal += a.currentValue;
         cryptoRestPurch += a.purchaseValue;
      } else {
         if (!groups[p]) groups[p] = [];
         groups[p].push({ name: a.symbol, value: a.currentValue, roi: a.roi, portfolio: p });
      }
    });

    // Add "Reszta Krypto" Tile
    if (cryptoRestVal > 0) {
       const aggRoi = cryptoRestPurch > 0 ? ((cryptoRestVal - cryptoRestPurch)/cryptoRestPurch)*100 : 0;
       if (!groups['Krypto']) groups['Krypto'] = [];
       groups['Krypto'].push({ name: 'Reszta Krypto', value: cryptoRestVal, roi: aggRoi, portfolio: 'Krypto' });
    }

    // Add Aggregated "PLN" Tile to "Gotówka" Group
    if (aggregatedCashVal > 0) {
        if (!groups['Gotówka']) groups['Gotówka'] = [];
        groups['Gotówka'].push({ name: 'PLN', value: aggregatedCashVal, roi: 0, portfolio: 'Gotówka' });
    }

    const ORDER = ['PPK', 'IKE', 'Krypto', 'Gotówka'];
    return Object.keys(groups).map(key => ({
      name: key,
      children: groups[key].sort((a, b) => b.value - a.value)
    })).sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
  }, [omfActiveAssets, portfolioType]);

  const heatmapHistoryData = useMemo(() => {
     if (portfolioType !== 'OMF') return [];
     return globalHistoryData.map(r => ({
        date: r.date,
        // ALWAYS use the calculated NoPPK values for the heatmap to show Active Management performance
        investment: r.investmentNoPPK || 0,
        profit: r.profitNoPPK || 0,
        totalValue: r.totalValueNoPPK || 0
     }));
  }, [globalHistoryData, portfolioType]);

  const dailyChangeData = useMemo(() => {
    if (portfolioType !== 'OMF' || !omfActiveAssets.length) return [];
    const groups: Record<string, any[]> = {};
    let cryptoRestNow = 0, cryptoRestPrev = 0;
    let aggregatedCashNow = 0;

    omfActiveAssets.forEach(a => {
        // AGGREGATION LOGIC: Sum PLN and PLN-IKE
        if (a.symbol === 'PLN' || a.symbol === 'PLN-IKE') {
            aggregatedCashNow += a.currentValue;
            return; // Skip individual addition
        }

        const p = a.portfolio || 'Inne';
        const isCrypto = p.toUpperCase().includes('KRYPTO');
        
        if (isCrypto && a.currentValue < 1000) {
            cryptoRestNow += a.currentValue;
            // Only include change in aggregated calculation if it's valid
            if (a.change24h !== undefined) {
                const divisor = 1 + (a.change24h || 0) / 100;
                cryptoRestPrev += divisor !== 0 ? a.currentValue / divisor : a.currentValue;
            } else {
                cryptoRestPrev += a.currentValue; // Assume no change for fallback assets
            }
        } else {
            if (!groups[p]) groups[p] = [];
            // Pass change24h (can be undefined)
            groups[p].push({ name: a.symbol, size: a.currentValue, change24h: a.change24h, portfolio: p });
        }
    });

    if (cryptoRestNow > 0) {
        const avgChange = cryptoRestPrev > 0 ? ((cryptoRestNow - cryptoRestPrev) / cryptoRestPrev) * 100 : 0;
        if (!groups['Krypto']) groups['Krypto'] = [];
        groups['Krypto'].push({ name: 'Reszta Krypto', size: cryptoRestNow, change24h: avgChange, portfolio: 'Krypto' });
    }

    // Add Aggregated "PLN" Tile
    if (aggregatedCashNow > 0) {
        if (!groups['Gotówka']) groups['Gotówka'] = [];
        // Cash change is usually 0 for base currency (1 PLN = 1 PLN)
        groups['Gotówka'].push({ name: 'PLN', size: aggregatedCashNow, change24h: 0, portfolio: 'Gotówka' });
    }

    const ORDER = ['PPK', 'IKE', 'Krypto', 'Gotówka'];
    return Object.keys(groups).map(key => ({
        name: key,
        children: groups[key].sort((a, b) => b.size - a.size)
    })).sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
  }, [omfActiveAssets, portfolioType]);

  const bestCrypto = useMemo(() => {
    if (portfolioType !== 'CRYPTO') return null;
    return omfActiveAssets.filter(a => a.portfolio.toUpperCase().includes('KRYPTO')).sort((a, b) => b.profit - a.profit)[0];
  }, [portfolioType, omfActiveAssets]);

  return (
    <div className={`min-h-screen ${styles.appBg} ${styles.text} pb-12 transition-colors duration-300`}>
      <header className={`${styles.headerBg} ${styles.headerBorder} border-b sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* LEFT: Status Indicator (Moved here) */}
          <div className="w-24 flex items-center">
             {isOfflineValid && (
                <div 
                  className={`
                    flex items-center transition-all duration-300 overflow-hidden
                    ${statusLogic.colorClass}
                    rounded-full
                    ${statusLogic.isPartial ? 'hover:pr-3 hover:pl-1 cursor-help group' : 'p-2'}
                  `}
                  title={statusLogic.label}
                >
                  <button 
                    onClick={fetchPrices} 
                    disabled={isRefreshing} 
                    className={`p-0 focus:outline-none ${isRefreshing ? 'opacity-75 cursor-wait' : ''}`}
                  >
                     <statusLogic.icon size={18} className={`${statusLogic.spin ? 'animate-spin' : ''}`} />
                  </button>
                  
                  {/* Percentage Text - Only visible on hover if partial */}
                  {statusLogic.isPartial && (
                     <span className="max-w-0 overflow-hidden group-hover:max-w-[60px] transition-all duration-500 text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pl-0 group-hover:pl-1.5">
                        {statusLogic.percent}%
                     </span>
                  )}
                </div>
             )}
          </div>

          {/* CENTER: Navigation Tabs */}
          <div className={`p-1 flex space-x-1 overflow-x-auto ${theme === 'neon' ? 'bg-black border border-cyan-900/50 rounded-lg' : 'bg-slate-100 rounded-lg'}`}>
            <button onClick={() => handlePortfolioChange('OMF')} className={`flex items-center px-3 sm:px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'OMF' ? styles.buttonActive : styles.buttonInactive} rounded-md`}><LayoutGrid size={16} className="mr-2 hidden sm:block" />OMF</button>
            <button onClick={() => handlePortfolioChange('PPK')} className={`flex items-center px-3 sm:px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'PPK' ? styles.buttonActive : styles.buttonInactive} rounded-md`}><Briefcase size={16} className="mr-2 hidden sm:block" />PPK</button>
            <button onClick={() => handlePortfolioChange('CRYPTO')} className={`flex items-center px-3 sm:px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'CRYPTO' ? styles.buttonActive : styles.buttonInactive} rounded-md`}><Coins size={16} className="mr-2 hidden sm:block" />Krypto</button>
            <button onClick={() => handlePortfolioChange('IKE')} className={`flex items-center px-3 sm:px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'IKE' ? styles.buttonActive : styles.buttonInactive} rounded-md`}><PiggyBank size={16} className="mr-2 hidden sm:block" />IKE</button>
          </div>

          {/* RIGHT: Theme Toggles */}
          <div className="w-28 flex justify-end space-x-2">
             <button onClick={() => setTheme('light')} className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><Sun size={16} /></button>
             <button onClick={() => setTheme('comic')} className={`p-2 rounded-md transition-all ${theme === 'comic' ? 'bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 hover:bg-slate-100'}`}><Palette size={16} /></button>
             <button onClick={() => setTheme('neon')} className={`p-2 rounded-md transition-all ${theme === 'neon' ? 'bg-cyan-900/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'text-slate-400 hover:bg-slate-100'}`}><Zap size={16} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Validation/Integrity Status Cards (Only if issues exist) */}
        {!isOfflineValid && (
           <>
             {portfolioType === 'OMF' && omfReport && <OMFIntegrityStatus report={omfReport} theme={theme} />}
             {portfolioType !== 'OMF' && report && <DataStatus report={report} theme={theme} />}
           </>
        )}

        {portfolioType === 'OMF' ? (
          <OMFDashboard 
            stats={stats} theme={theme}
            activeAssets={omfActiveAssets} closedAssets={omfClosedAssets}
            globalHistory={globalHistoryData} dailyChangeData={dailyChangeData}
            excludePPK={excludePPK} setExcludePPK={setExcludePPK}
            showCPI={showCPI} setShowCPI={setShowCPI}
            showProjection={showProjection} setShowProjection={setShowProjection}
            projectionMethod={projectionMethod} setProjectionMethod={setProjectionMethod}
            rateDisplay={rateDisplay} chartDataWithProjection={chartDataWithProjection}
            omfStructureData={omfStructureData} heatmapHistoryData={heatmapHistoryData}
          />
        ) : (
          <StandardDashboard 
            portfolioType={portfolioType} stats={stats} data={data} theme={theme}
            showPPKProjection={showPPKProjection} setShowPPKProjection={setShowPPKProjection}
            showTaxComparison={showTaxComparison} setShowTaxComparison={setShowTaxComparison}
            ppkRateDisplay={{ cagr: 12 }} ppkChartDataWithProjection={ppkChartDataWithProjection}
            bestCrypto={bestCrypto}
          />
        )}
      </main>
    </div>
  );
};

export default App;