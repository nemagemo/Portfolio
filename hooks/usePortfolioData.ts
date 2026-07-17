
import { useMemo } from 'react';
import { SummaryStats, PortfolioType, AnyDataRow, ValidationReport, OMFValidationReport, OMFDataRow, GlobalHistoryRow, DividendDataRow, PPKDataRow, CryptoDataRow, IKEDataRow, BenchmarkData } from '../types';
import { useDividends } from './useDividends';
import { useAssetPricing } from './useAssetPricing';
import { useGlobalHistory } from './useGlobalHistory';
import { usePortfolioStats } from './usePortfolioStats';
import { OMF_LAST_UPDATED } from '../CSV/OMFopen';
import { parseCSV } from '../utils/parser';
import { TURTLES_HISTORY_DATA } from '../CSV/TurtlesHistory';

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
    let baseRows = [...rawData];

    // Merge IKE with TurtlesHistory for accurate charts representation
    if (portfolioType === 'IKE') {
        const turtlesHistoryRes = parseCSV(TURTLES_HISTORY_DATA, 'TURTLES_HISTORY', 'Offline');
        const turtlesHistoryRows = turtlesHistoryRes.data as CryptoDataRow[];
        
        const getMonthFirstDay = (dateStr: string) => {
            if (!dateStr || dateStr.length < 7) return dateStr;
            return `${dateStr.substring(0, 7)}-01`;
        };

        const turtleHistoryMap = new Map<string, CryptoDataRow>();
        turtlesHistoryRows.forEach(row => {
            if (row && row.date) {
                turtleHistoryMap.set(getMonthFirstDay(row.date), row);
            }
        });

        baseRows = baseRows.map(r => {
            const normDate = getMonthFirstDay((r as any).date);
            const matchedTurtle = turtleHistoryMap.get(normDate);
            if (matchedTurtle) {
                const matchedTurtleInv = matchedTurtle.investment ?? (matchedTurtle.totalValue - matchedTurtle.profit);
                const matchedTurtleProfit = matchedTurtle.profit;

                const combinedInv = (r as IKEDataRow).investment + matchedTurtleInv;
                const combinedProfit = (r as IKEDataRow).profit + matchedTurtleProfit;
                const combinedTotal = combinedInv + combinedProfit;
                const combinedRoi = combinedInv > 0 ? (combinedProfit / combinedInv) * 100 : 0;

                return {
                    ...r,
                    investment: combinedInv,
                    profit: combinedProfit,
                    totalValue: combinedTotal,
                    roi: combinedRoi
                } as IKEDataRow;
            }
            return r;
        });
    }

    // Skip patching for OMF (handled by useGlobalHistory) or non-asset types
    if (portfolioType === 'OMF' || portfolioType === 'CASH' || portfolioType === 'DIVIDENDS') {
        return baseRows;
    }

    if (!omfActiveAssets.length || !rawData.length) {
        return baseRows;
    }

    // Filter assets belonging to the current portfolio view
    const currentAssets = omfActiveAssets.filter(a => {
        if (portfolioType === 'CRYPTO') return a.portfolio.toUpperCase().includes('KRYPTO');
        if (portfolioType === 'TURTLES_HISTORY') return a.portfolio === 'Żółwie';
        if (portfolioType === 'IKE') {
            // Exclude virtual cash of turtles from IKE currentAssets list to avoid double counting with PLN-IKE
            return a.portfolio === 'IKE' || (a.portfolio === 'Żółwie' && a.type !== 'Gotówka');
        }
        return a.portfolio === portfolioType;
    });

    if (currentAssets.length === 0 && portfolioType !== 'TURTLES_HISTORY') return baseRows;

    // Calculate Live Totals
    const liveTotalValue = currentAssets.reduce((sum, a) => sum + a.currentValue, 0);
    
    // Create a copy of baseRows (which are already merged if IKE)
    const enhancedData = [...baseRows];
    
    // To calculate the live row accurately without double-counting, we grab the clean raw row:
    const rawLastRow = rawData[rawData.length - 1];
    if (!rawLastRow || !('date' in rawLastRow)) return baseRows;

    let liveInvestment = (rawLastRow as any).investment;
    if (portfolioType === 'TURTLES_HISTORY') {
        const turtleClosed = omfClosedAssets.filter(a => a.portfolio === 'Żółwie');
        const turtleClosedProfit = turtleClosed.reduce((sum, a) => sum + a.profit, 0);
        const turtleDividends = dividends
            .filter(d => d.portfolio === 'Żółwie' && d.isCounted)
            .reduce((sum, d) => sum + d.value, 0);
        liveInvestment = currentAssets.reduce((sum, a) => sum + a.purchaseValue, 0) - turtleClosedProfit - turtleDividends;
    } else if (portfolioType === 'IKE') {
        const turtleActive = omfActiveAssets.filter(a => a.portfolio === 'Żółwie' && a.type !== 'Gotówka');
        const turtleClosed = omfClosedAssets.filter(a => a.portfolio === 'Żółwie');
        const turtleClosedProfit = turtleClosed.reduce((sum, a) => sum + a.profit, 0);
        const turtleDividends = dividends
             .filter(d => d.portfolio === 'Żółwie' && d.isCounted)
             .reduce((sum, d) => sum + d.value, 0);
        const turtleInvestment = turtleActive.reduce((sum, a) => sum + a.purchaseValue, 0) - turtleClosedProfit - turtleDividends;
        liveInvestment += turtleInvestment;
    } else if (portfolioType === 'PPK') {
        const r = rawLastRow as PPKDataRow;
        const liveEmployeeContrib = currentAssets.reduce((sum, a) => sum + a.purchaseValue, 0);
        
        const newFundProfit = liveTotalValue - (liveEmployeeContrib + r.employerContribution + r.stateContribution);
        const newProfit = liveTotalValue - liveEmployeeContrib;
        const newRoi = liveEmployeeContrib > 0 ? (newProfit / liveEmployeeContrib) * 100 : 0;
        
        const exitGain = (newFundProfit * 0.81) + (r.employerContribution * 0.70);
        const newExitRoi = liveEmployeeContrib > 0 ? (exitGain / liveEmployeeContrib) * 100 : 0;

        let today = new Date();
        if (OMF_LAST_UPDATED) {
            const omfDate = new Date(OMF_LAST_UPDATED);
            if (!isNaN(omfDate.getTime()) && omfDate > today) {
                today = omfDate;
            }
        }
        const lastDate = new Date(r.date);
        const isSameMonth = lastDate.getMonth() === today.getMonth() && lastDate.getFullYear() === today.getFullYear();
        const dateStr = today.toISOString().split('T')[0];

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
            employerContribution: r.employerContribution,
            stateContribution: r.stateContribution,
            tax: r.tax 
        };

        if (isSameMonth) {
            enhancedData[enhancedData.length - 1] = liveRow;
        } else {
            enhancedData.push(liveRow);
        }
        return enhancedData;
    }

    const rMerged = enhancedData[enhancedData.length - 1] as CryptoDataRow | IKEDataRow;
    
    const newProfit = liveTotalValue - liveInvestment;
    const newRoi = liveInvestment > 0 ? (newProfit / liveInvestment) * 100 : 0;

    let today = new Date();
    if (OMF_LAST_UPDATED) {
        const omfDate = new Date(OMF_LAST_UPDATED);
        if (!isNaN(omfDate.getTime()) && omfDate > today) {
            today = omfDate;
        }
    }
    const lastDate = new Date(rMerged.date);
    const isSameMonth = lastDate.getMonth() === today.getMonth() && lastDate.getFullYear() === today.getFullYear();
    const dateStr = today.toISOString().split('T')[0];

    const liveRow: any = {
        ...rMerged,
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

    return enhancedData;
  }, [portfolioType, rawData, omfActiveAssets, omfClosedAssets, dividends]);

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

    const ORDER = ['PPK', 'IKE', 'Żółwie', 'Krypto', 'Gotówka'];
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
