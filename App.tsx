
import React, { useState, useEffect } from 'react';
import { PortfolioType } from './types';
import { themeStyles } from './theme/styles';
import { useMarketData } from './hooks/useMarketData';
import { usePortfolioData } from './hooks/usePortfolioData';
import { useProjections } from './hooks/useProjections';
import { useChartTransformations } from './hooks/useChartTransformations';
import { DataStatus, OMFIntegrityStatus } from './components/StatusCards';
import { StandardDashboard } from './components/dashboards/StandardDashboard';
import { OMFDashboard } from './components/dashboards/OMFDashboard';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNotice } from './components/MobileNotice';

export const App: React.FC = () => {
  const [portfolioType, setPortfolioType] = useState<PortfolioType>('OMF');
  const theme = 'light';
  
  // Local UI State for OMF Dashboard
  const [showProjection, setShowProjection] = useState(false);
  const [projectionMethod, setProjectionMethod] = useState<'LTM' | 'CAGR' | '2xCAGR'>('LTM');
  const [showCPI, setShowCPI] = useState(false);
  const [excludePPK, setExcludePPK] = useState(false);

  // Local UI State for PPK/IKE
  const [showPPKProjection, setShowPPKProjection] = useState(false);
  const [showTaxComparison, setShowTaxComparison] = useState(false);

  const styles = themeStyles[theme];

  // 1. Data Fetching Hooks
  const { onlinePrices, historyPrices, benchmarks, pricingMode, isRefreshing, fetchPrices } = useMarketData();
  
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
    benchmarks,
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
    projectionMethod,
    customCagr: stats?.cagr // Pass the actual calculated CAGR
  });

  // Auto-switch from LTM if invalid
  useEffect(() => {
    if (projectionMethod === 'LTM' && !omfRates.isLtmValid) {
        setProjectionMethod('2xCAGR');
    }
  }, [projectionMethod, omfRates.isLtmValid]);

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

  return (
    <div className={`flex flex-col min-h-screen ${styles.appBg} ${styles.text} transition-colors duration-300`}>
      
      <Header 
        theme={theme}
        portfolioType={portfolioType}
        setPortfolioType={handlePortfolioChange}
        pricingMode={pricingMode}
        isRefreshing={isRefreshing}
        fetchPrices={fetchPrices}
        onlinePrices={onlinePrices}
        omfActiveAssets={omfActiveAssets}
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative">
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
            activeAssets={omfActiveAssets}
          />
        )}
      </main>

      <Footer theme={theme} />
      
      <MobileNotice theme={theme} />
    </div>
  );
};

export default App;
