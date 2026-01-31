
import { useMemo } from 'react';
import { SummaryStats, PortfolioType, AnyDataRow, ValidationReport, OMFValidationReport, OMFDataRow, GlobalHistoryRow, DividendDataRow, PPKDataRow, CryptoDataRow, IKEDataRow, BenchmarkData } from '../types';
import { useDividends } from './useDividends';
import { useAssetPricing } from './useAssetPricing';
import { useGlobalHistory } from './useGlobalHistory';
import { usePortfolioStats } from './usePortfolioStats';
import { OMF_LAST_UPDATED } from '../CSV/OMFopen';

interface UsePortfolioDataProps {
  portfolioType: PortfolioType;
  onlinePrices: Record<string, number> | null;
  historyPrices: Record<string, number> | null;
  benchmarks?: BenchmarkData | null;
  excludePPK?: boolean;
}

interface UsePortfolioDataReturn {
  data: AnyDataRow[];
  dividends: DividendDataRow[];
  report: ValidationReport | null;
  omfReport: OMFValidationReport | null;
  omfActiveAssets: OMFDataRow[];
  omfClosedAssets: OMFDataRow[];
  globalHistoryData: GlobalHistoryRow[];
  stats: SummaryStats | null;
  dailyChangeData: any[];
}

export const usePortfolioData = ({ 
  portfolioType, 
  onlinePrices, 
  historyPrices, 
  benchmarks = null, 
  excludePPK = false 
}: UsePortfolioDataProps): UsePortfolioDataReturn => {
  
  // 1. Fetch Dividends
  const dividends = useDividends();

  // 2. Process Asset Pricing & Parsing
  const { 
    data: rawData, 
    report, 
    omfReport, 
    omfActiveAssets, 
    omfClosedAssets 
  } = useAssetPricing({ 
    portfolioType, 
    onlinePrices, 
    historyPrices, 
    dividends 
  });

  // --- LIVE DATA PATCHING ---
  // Transforms the static CSV data by injecting the current "Live" valuation from OMF Assets.
  // This ensures specific portfolio charts (PPK, IKE, Crypto) show today's value on the timeline.
  const data = useMemo(() => {
    // Skip patching for OMF (handled by useGlobalHistory) or non-asset types
    if (portfolioType === 'OMF' || portfolioType === 'CASH' || portfolioType === 'DIVIDENDS') {
        return rawData;
    }

    if (!omfActiveAssets.length || !rawData.length) {
        return rawData;
    }

    // Filter assets belonging to the current portfolio view
    const currentAssets = omfActiveAssets.filter(a => {
        if (portfolioType === 'CRYPTO') return a.portfolio.toUpperCase().includes('KRYPTO');
        return a.portfolio === portfolioType;
    });

    if (currentAssets.length === 0) return rawData;

    // Calculate Live Totals
    const liveTotalValue = currentAssets.reduce((sum, a) => sum + a.currentValue, 0);
    
    // Create a copy of data to modify
    const enhancedData = [...rawData];
    const lastRow = enhancedData[enhancedData.length - 1];
    
    if (!lastRow || !('date' in lastRow)) return rawData;

    const lastDate = new Date(lastRow.date);
    
    // Determine "Today" for the chart.
    // If OMF_LAST_UPDATED is in the future (Time Travel scenario), use that.
    // Otherwise use System Date.
    let today = new Date();
    if (OMF_LAST_UPDATED) {
        const omfDate = new Date(OMF_LAST_UPDATED);
        if (!isNaN(omfDate.getTime()) && omfDate > today) {
            today = omfDate;
        }
    }
    
    // Check if last row is from the same month as our target "today"
    const isSameMonth = lastDate.getMonth() === today.getMonth() && lastDate.getFullYear() === today.getFullYear();
    const dateStr = today.toISOString().split('T')[0];

    if (portfolioType === 'PPK') {
        const r = lastRow as PPKDataRow;
        // For PPK, purchaseValue in OMF matches employee contribution (based on OMF Logic)
        const liveEmployeeContrib = currentAssets.reduce((sum, a) => sum + a.purchaseValue, 0);
        
        // Recalculate derived stats based on Live Value
        // Note: We use the last known employer/state contributions from CSV as they update monthly (or less often)
        const newFundProfit = liveTotalValue - (liveEmployeeContrib + r.employerContribution + r.stateContribution);
        const newProfit = liveTotalValue - liveEmployeeContrib;
        const newRoi = liveEmployeeContrib > 0 ? (newProfit / liveEmployeeContrib) * 100 : 0;
        
        // Exit ROI calculation (Standard formula)
        const exitGain = (newFundProfit * 0.81) + (r.employerContribution * 0.70);
        const newExitRoi = liveEmployeeContrib > 0 ? (exitGain / liveEmployeeContrib) * 100 : 0;

        const liveRow: PPKDataRow = {
            ...r,
            date: dateStr,
            dateObj: today,
            totalValue: liveTotalValue,
            employeeContribution: liveEmployeeContrib,
            fundProfit: newFundProfit,
            profit: newProfit,
            roi: newRoi,
            exitRoi: newExitRoi,
            // Keep others static
            employerContribution: r.employerContribution,
            stateContribution: r.stateContribution,
            tax: r.tax 
        };

        if (isSameMonth) {
            enhancedData[enhancedData.length - 1] = liveRow;
        } else {
            enhancedData.push(liveRow);
        }

    } else {
        // IKE & CRYPTO
        const r = lastRow as CryptoDataRow | IKEDataRow;
        
        // For Investment (Cost Basis), we generally stick to the CSV history for stability
        // unless we have a reliable way to calculate it from Open+Closed assets on the fly.
        // Using the last CSV row's investment is the safest bet for "Live View" without full re-calc.
        const liveInvestment = r.investment; 
        
        const newProfit = liveTotalValue - liveInvestment;
        const newRoi = liveInvestment > 0 ? (newProfit / liveInvestment) * 100 : 0;

        const liveRow: any = {
            ...r,
            date: dateStr,
            dateObj: today,
            totalValue: liveTotalValue,
            investment: liveInvestment,
            profit: newProfit,
            roi: newRoi
        };

        if (portfolioType === 'IKE') {
             const tax = newProfit > 0 ? newProfit * 0.19 : 0;
             liveRow.taxedTotalValue = liveTotalValue - tax;
        }

        if (isSameMonth) {
            enhancedData[enhancedData.length - 1] = liveRow;
        } else {
            enhancedData.push(liveRow);
        }
    }

    return enhancedData;

  }, [portfolioType, rawData, omfActiveAssets]);

  // 3. Build Global History (Timeline)
  const globalHistoryData = useGlobalHistory({
    portfolioType,
    omfActiveAssets,
    omfClosedAssets,
    dividends,
    excludePPK,
    benchmarks
  });

  // 4. Calculate Summary Stats
  const stats = usePortfolioStats({
    portfolioType,
    globalHistoryData,
    omfActiveAssets,
    omfClosedAssets,
    data, // Pass the patched data here
    dividends,
    excludePPK
  });

  // 5. Build Daily Heatmap Data (UI specific aggregation)
  const dailyChangeData = useMemo(() => {
    if (portfolioType !== 'OMF' || !omfActiveAssets.length) return [];
    const groups: Record<string, any[]> = {};
    let cryptoRestNow = 0, cryptoRestPrev = 0;

    omfActiveAssets.forEach(a => {
        const p = a.portfolio || 'Inne';
        const isCrypto = p.toUpperCase().includes('KRYPTO');
        if (isCrypto && a.currentValue < 1000) {
            cryptoRestNow += a.currentValue;
            if (a.change24h !== undefined) {
                const divisor = 1 + (a.change24h || 0) / 100;
                cryptoRestPrev += divisor !== 0 ? a.currentValue / divisor : a.currentValue;
            } else {
                cryptoRestPrev += a.currentValue;
            }
        } else {
            if (!groups[p]) groups[p] = [];
            groups[p].push({ name: a.symbol, size: a.currentValue, change24h: a.change24h, portfolio: p });
        }
    });

    if (cryptoRestNow > 0) {
        const avgChange = cryptoRestPrev > 0 ? ((cryptoRestNow - cryptoRestPrev) / cryptoRestPrev) * 100 : 0;
        if (!groups['Krypto']) groups['Krypto'] = [];
        groups['Krypto'].push({ name: 'Reszta Krypto', size: cryptoRestNow, change24h: avgChange, portfolio: 'Krypto' });
    }

    const ORDER = ['PPK', 'IKE', 'Krypto', 'Gotówka'];
    return Object.keys(groups).map(key => ({
        name: key,
        children: groups[key].sort((a, b) => b.size - a.size)
    })).sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
  }, [omfActiveAssets, portfolioType]);

  return {
    data,
    dividends,
    report,
    omfReport,
    omfActiveAssets,
    omfClosedAssets,
    globalHistoryData,
    stats,
    dailyChangeData
  };
};
