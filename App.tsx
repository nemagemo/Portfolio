
import React, { useState, useMemo } from 'react';
import { Briefcase, Coins, PiggyBank, Sun, Palette, Zap, Wifi, WifiOff, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { PortfolioType } from './types';
import { themeStyles, Theme } from './theme/styles';
import { useMarketData } from './hooks/useMarketData';
import { usePortfolioData } from './hooks/usePortfolioData';
import { useProjections } from './hooks/useProjections';
import { useChartTransformations } from './hooks/useChartTransformations';
import { DataStatus, OMFIntegrityStatus } from './components/StatusCards';
import { StandardDashboard } from './components/dashboards/StandardDashboard';
import { OMFDashboard } from './components/dashboards/OMFDashboard';
import { OMF_LAST_UPDATED } from './CSV/OMFopen';
import { HeaderLogo } from './components/logos/HeaderLogo';
import { FooterLogo } from './components/logos/FooterLogo';

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

  // Local UI State for Footer
  const [isLegalExpanded, setIsLegalExpanded] = useState(false);

  const styles = themeStyles[theme];

  // 1. Data Fetching Hooks
  const { onlinePrices, historyPrices, pricingMode, isRefreshing, fetchPrices } = useMarketData();
  
  // 2. Business Logic Hook
  const { 
    data, 
    dividends,
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

  // 3. Projections & Calculations Logic Hook
  const {
    omfProjectionData,
    omfRates,
    ppkProjectionData,
    investmentDurationMonths
  } = useProjections({
    globalHistoryData,
    ppkData: data,
    portfolioType,
    showProjection,
    showPPKProjection,
    projectionMethod
  });

  // 4. Chart Transformations Hook
  const {
    omfStructureData,
    dailyChangeData,
    heatmapHistoryData,
    bestCrypto
  } = useChartTransformations({
    omfActiveAssets,
    portfolioType,
    globalHistoryData
  });

  const handlePortfolioChange = (type: PortfolioType) => {
    setPortfolioType(type);
    setShowTaxComparison(false);
  };

  const isOfflineValid = (portfolioType === 'OMF' && omfReport?.isConsistent) || (portfolioType !== 'OMF' && report?.isValid);

  // Determine Status Label logic
  const statusLogic = useMemo(() => {
      if (isRefreshing) return { label: 'Odświeżanie danych...', icon: RefreshCw, colorClass: 'bg-blue-50 text-blue-600 border-blue-200', spin: true, percent: 0, isPartial: false };
      
      const dateInfo = OMF_LAST_UPDATED ? ` (Dane z: ${OMF_LAST_UPDATED})` : '';

      if (pricingMode === 'Offline') return { 
          label: `Tryb Offline - Kliknij aby odświeżyć${dateInfo}`, 
          icon: WifiOff, 
          colorClass: theme === 'neon' ? 'bg-slate-800/80 text-slate-400 border-slate-600/50' : 'bg-slate-100 text-slate-500 border-slate-200',
          spin: false,
          percent: 0,
          isPartial: false
      };
      
      let isPartial = false;
      let percent = 100;
      let tooltipLabel = 'Tryb Online (Wszystkie ceny aktualne)';

      if (portfolioType === 'OMF' && onlinePrices) {
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

  return (
    <div className={`flex flex-col min-h-screen ${styles.appBg} ${styles.text} transition-colors duration-300`}>
      <header className={`${styles.headerBg} ${styles.headerBorder} sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* LEFT: Logo - Flex-1 to push center */}
          <div className="flex-1 flex items-center justify-start">
             <HeaderLogo className={`h-6 sm:h-8 w-auto ${theme === 'neon' ? 'text-cyan-400' : 'text-slate-800'}`} />
          </div>

          {/* CENTER: Navigation Tabs */}
          <div className={`p-1 flex space-x-1 overflow-x-auto shrink-0 ${theme === 'neon' ? 'bg-black border border-cyan-900/50 rounded-lg' : 'bg-slate-100 rounded-lg'}`}>
            <button onClick={() => handlePortfolioChange('OMF')} className={`flex items-center justify-center px-3 sm:px-4 py-1 text-2xl font-bold leading-none transition-all whitespace-nowrap ${portfolioType === 'OMF' ? styles.buttonActive : styles.buttonInactive} rounded-md`}>
              Σ
            </button>
            <button onClick={() => handlePortfolioChange('PPK')} className={`flex items-center px-3 sm:px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'PPK' ? styles.buttonActive : styles.buttonInactive} rounded-md`}><Briefcase size={16} className="mr-2 hidden sm:block" />PPK</button>
            <button onClick={() => handlePortfolioChange('CRYPTO')} className={`flex items-center px-3 sm:px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'CRYPTO' ? styles.buttonActive : styles.buttonInactive} rounded-md`}><Coins size={16} className="mr-2 hidden sm:block" />Krypto</button>
            <button onClick={() => handlePortfolioChange('IKE')} className={`flex items-center px-3 sm:px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'IKE' ? styles.buttonActive : styles.buttonInactive} rounded-md`}><PiggyBank size={16} className="mr-2 hidden sm:block" />IKE</button>
          </div>

          {/* RIGHT: Status & Theme Toggles - Flex-1 to push center */}
          <div className="flex-1 flex items-center justify-end space-x-3">
             {/* Status Indicator (Moved from Left) */}
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
                  
                  {statusLogic.isPartial && (
                     <span className="max-w-0 overflow-hidden group-hover:max-w-[60px] transition-all duration-500 text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pl-0 group-hover:pl-1.5">
                        {statusLogic.percent}%
                     </span>
                  )}
                </div>
             )}

             {/* Theme Toggles */}
             <div className="flex space-x-1">
                <button onClick={() => setTheme('light')} className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><Sun size={16} /></button>
                <button onClick={() => setTheme('comic')} className={`p-2 rounded-md transition-all ${theme === 'comic' ? 'bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 hover:bg-slate-100'}`}><Palette size={16} /></button>
                <button onClick={() => setTheme('neon')} className={`p-2 rounded-md transition-all ${theme === 'neon' ? 'bg-cyan-900/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'text-slate-400 hover:bg-slate-100'}`}><Zap size={16} /></button>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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
            rateDisplay={omfRates} chartDataWithProjection={omfProjectionData}
            omfStructureData={omfStructureData} heatmapHistoryData={heatmapHistoryData}
            investmentDurationMonths={investmentDurationMonths}
          />
        ) : (
          <StandardDashboard 
            portfolioType={portfolioType} stats={stats} data={data} dividends={dividends} theme={theme}
            showPPKProjection={showPPKProjection} setShowPPKProjection={setShowPPKProjection}
            showTaxComparison={showTaxComparison} setShowTaxComparison={setShowTaxComparison}
            ppkRateDisplay={{ cagr: 12 }} ppkChartDataWithProjection={ppkProjectionData}
            bestCrypto={bestCrypto}
          />
        )}
      </main>

      <footer className={`${styles.footerBg} ${styles.footerBorder} mt-auto py-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Section: Logo & Copyright */}
          <div className="flex flex-col items-center justify-center gap-2 mb-3">
            <div className="flex items-center select-none opacity-90 hover:opacity-100 transition-opacity">
               <FooterLogo className={`h-8 sm:h-9 w-auto ${theme === 'neon' ? 'text-cyan-400' : 'text-slate-800'}`} />
            </div>
            <div className={`text-xs font-mono ${styles.footerText} text-center`}>
              &copy; {new Date().getFullYear()} Old Man Fund. Wszelkie prawa zastrzeżone.
            </div>
          </div>

          {/* Divider */}
          <div className={`w-full h-px mb-3 ${theme === 'neon' ? 'bg-cyan-900/30' : 'bg-slate-200'}`}></div>

          {/* Collapsible Legal Section */}
          <div className={`flex flex-col items-center justify-center ${theme === 'neon' ? 'text-cyan-800' : 'text-slate-400'}`}>
            <button 
              onClick={() => setIsLegalExpanded(!isLegalExpanded)}
              className={`flex items-center text-[10px] uppercase font-bold tracking-wider hover:opacity-100 transition-opacity focus:outline-none ${isLegalExpanded ? 'opacity-100' : 'opacity-70'}`}
            >
              <Scale size={12} className="mr-1.5" />
              Nota Prawna & Prywatność
              {isLegalExpanded ? <ChevronUp size={12} className="ml-1.5" /> : <ChevronDown size={12} className="ml-1.5" />}
            </button>

            {isLegalExpanded && (
              <div className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="text-center md:text-left p-3 rounded border border-transparent hover:border-current transition-colors">
                  <strong className={`block mb-1.5 ${theme === 'neon' ? 'text-cyan-700' : 'text-slate-500'}`}>Wyłączenie odpowiedzialności (Disclaimer)</strong>
                  Prezentowane dane i wykresy mają charakter wyłącznie informacyjny i edukacyjnym. Nie stanowią rekomendacji inwestycyjnych ani porady prawnej czy podatkowej. Decyzje finansowe podejmujesz na własne ryzyko.
                </div>
                <div className="text-center md:text-right p-3 rounded border border-transparent hover:border-current transition-colors">
                   <strong className={`block mb-1.5 ${theme === 'neon' ? 'text-cyan-700' : 'text-slate-500'}`}>Prywatność i Cookies</strong>
                   Ta strona nie zbiera danych osobowych ani nie śledzi użytkowników (brak Google Analytics). Wykorzystujemy pamięć przeglądarki (LocalStorage) wyłącznie do technicznego zapamiętania wybranego motywu graficznego.
                </div>
              </div>
            )}
          </div>

        </div>
      </footer>
    </div>
  );
};

export default App;
