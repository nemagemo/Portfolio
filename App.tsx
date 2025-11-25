
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
    stats, 
    dailyChangeData 
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
      if (isRefreshing) return { label: 'ODŚWIEŻANIE...', icon: RefreshCw, colorClass: 'bg-blue-50 text-blue-600 border-blue-200', spin: true };
      if (pricingMode === 'Offline') return { label: 'OFFLINE', icon: WifiOff, colorClass: theme === 'neon' ? 'bg-slate-800/80 text-slate-400 border-slate-600/50' : 'bg-slate-100 text-slate-500 border-slate-200' };
      
      // Online logic - check for partial data
      let isPartial = false;
      if (portfolioType === 'OMF' && onlinePrices) {
          // Check if any non-cash open asset is missing from online prices
          const missingCount = omfActiveAssets.filter(a => a.status === 'Otwarta' && a.portfolio !== 'Gotówka' && !a.isLivePrice).length;
          if (missingCount > 0) isPartial = true;
      }

      if (isPartial) {
          return { 
              label: 'ONLINE', 
              icon: AlertCircle, 
              colorClass: theme === 'neon' ? 'bg-yellow-900/80 text-yellow-300 border-yellow-600/50' : 'bg-amber-50 text-amber-600 border-amber-200'
          };
      }

      return { 
          label: 'ONLINE', 
          icon: Wifi, 
          colorClass: theme === 'neon' ? 'bg-blue-900/80 text-blue-300 border-blue-600/50' : 'bg-blue-50 text-blue-600 border-blue-200'
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

    omfActiveAssets.forEach(a => {
      const p = a.portfolio || 'Inne';
      if (p.toUpperCase().includes('KRYPTO') && a.currentValue < 1000) {
         cryptoRestVal += a.currentValue;
         cryptoRestPurch += a.purchaseValue;
      } else {
         if (!groups[p]) groups[p] = [];
         groups[p].push({ name: a.symbol, value: a.currentValue, roi: a.roi, portfolio: p });
      }
    });

    if (cryptoRestVal > 0) {
       const aggRoi = cryptoRestPurch > 0 ? ((cryptoRestVal - cryptoRestPurch)/cryptoRestPurch)*100 : 0;
       if (!groups['Krypto']) groups['Krypto'] = [];
       groups['Krypto'].push({ name: 'Reszta Krypto', value: cryptoRestVal, roi: aggRoi, portfolio: 'Krypto' });
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

  const bestCrypto = useMemo(() => {
    if (portfolioType !== 'CRYPTO') return null;
    return omfActiveAssets.filter(a => a.portfolio.toUpperCase().includes('KRYPTO')).sort((a, b) => b.profit - a.profit)[0];
  }, [portfolioType, omfActiveAssets]);

  return (
    <div className={`min-h-screen ${styles.appBg} ${styles.text} pb-12 transition-colors duration-300`}>
      <header className={`${styles.headerBg} ${styles.headerBorder} border-b sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="w-24"></div>
          <div className={`p-1 rounded-lg flex space-x-1 overflow-x-auto ${theme === 'neon' ? 'bg-black border border-cyan-900/50' : 'bg-slate-100'}`}>
            <button onClick={() => handlePortfolioChange('OMF')} className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'OMF' ? styles.buttonActive : styles.buttonInactive}`}><LayoutGrid size={16} className="mr-2 hidden sm:block" />OMF</button>
            <button onClick={() => handlePortfolioChange('PPK')} className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'PPK' ? styles.buttonActive : styles.buttonInactive}`}><Briefcase size={16} className="mr-2 hidden sm:block" />PPK</button>
            <button onClick={() => handlePortfolioChange('CRYPTO')} className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'CRYPTO' ? styles.buttonActive : styles.buttonInactive}`}><Coins size={16} className="mr-2 hidden sm:block" />Krypto</button>
            <button onClick={() => handlePortfolioChange('IKE')} className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'IKE' ? styles.buttonActive : styles.buttonInactive}`}><PiggyBank size={16} className="mr-2 hidden sm:block" />IKE</button>
          </div>
          <div className="w-24 flex justify-end space-x-2">
             <button onClick={() => setTheme('light')} className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><Sun size={16} /></button>
             <button onClick={() => setTheme('comic')} className={`p-2 rounded-md transition-all ${theme === 'comic' ? 'bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 hover:bg-slate-100'}`}><Palette size={16} /></button>
             <button onClick={() => setTheme('neon')} className={`p-2 rounded-md transition-all ${theme === 'neon' ? 'bg-cyan-900/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'text-slate-400 hover:bg-slate-100'}`}><Zap size={16} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isOfflineValid ? (
           <div className="flex flex-col items-center mb-6 space-y-2">
              <div className="flex items-center space-x-2">
                <button onClick={fetchPrices} disabled={isRefreshing} className={`text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm transition-all ${isRefreshing ? 'opacity-75 cursor-wait' : 'hover:opacity-80 active:scale-95'} border ${statusLogic.colorClass}`}>
                   <statusLogic.icon size={14} className={`mr-1.5 ${statusLogic.spin ? 'animate-spin' : ''}`} />
                   {statusLogic.label}
                </button>
              </div>
              {pricingMode !== 'Online' && OMF_LAST_UPDATED && (
                  <span className={`text-[10px] ${theme === 'neon' ? 'text-slate-600' : 'text-slate-400'}`}>Ostatnia aktualizacja: {OMF_LAST_UPDATED}</span>
              )}
           </div>
        ) : (
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
