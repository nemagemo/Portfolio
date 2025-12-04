import { useMemo } from 'react';
import { SummaryStats, PortfolioType, GlobalHistoryRow, OMFDataRow, AnyDataRow, DividendDataRow, PPKDataRow, CryptoDataRow, IKEDataRow } from '../types';
import { parseCSV } from '../utils/parser';
import { OMF_CLOSED_DATA } from '../CSV/OMFclosed';

interface UsePortfolioStatsProps {
  portfolioType: PortfolioType;
  globalHistoryData: GlobalHistoryRow[];
  omfActiveAssets: OMFDataRow[];
  omfClosedAssets: OMFDataRow[];
  data: AnyDataRow[];
  dividends: DividendDataRow[];
  excludePPK: boolean;
}

export const usePortfolioStats = ({ 
  portfolioType, 
  globalHistoryData, 
  omfActiveAssets, 
  omfClosedAssets, 
  data, 
  dividends, 
  excludePPK 
}: UsePortfolioStatsProps): SummaryStats | null => {
  
  return useMemo(() => {
    if (portfolioType === 'OMF') {
        const last = globalHistoryData[globalHistoryData.length - 1];
        if (!last) return null;

        const totalActiveDividendsIKE = dividends
            .filter(d => d.portfolio === 'IKE' && d.isCounted)
            .reduce((acc, row) => acc + row.value, 0);

        // Recalculate Investment from active assets for precision (snapshot approach)
        const assetsToSum = excludePPK ? omfActiveAssets.filter(a => a.portfolio !== 'PPK') : omfActiveAssets;
        const totalValue = assetsToSum.reduce((acc, r) => acc + r.currentValue, 0);
        
        // Calculate Net Investment (Snowball Effect)
        const ppkInvested = assetsToSum.filter(a => a.portfolio === 'PPK').reduce((acc, r) => acc + r.purchaseValue, 0);
        const cashInvested = assetsToSum.filter(a => a.portfolio === 'Gotówka').reduce((acc, r) => acc + r.purchaseValue, 0);
        const otherAssets = assetsToSum.filter(a => a.portfolio !== 'PPK' && a.portfolio !== 'Gotówka');
        const otherOpenPurchase = otherAssets.reduce((acc, r) => acc + r.purchaseValue, 0);

        let closedProfitOffset = 0;
        if (!excludePPK) {
            const closedRelevant = omfClosedAssets.filter(a => a.portfolio !== 'Gotówka'); 
            closedProfitOffset = closedRelevant.reduce((acc, r) => acc + r.profit, 0);
        } else {
            const closedRelevant = omfClosedAssets.filter(a => a.portfolio !== 'PPK' && a.portfolio !== 'Gotówka');
            closedProfitOffset = closedRelevant.reduce((acc, r) => acc + r.profit, 0);
        }

        const otherNetInvested = otherOpenPurchase - closedProfitOffset - totalActiveDividendsIKE;
        
        const totalInvestedSnapshot = ppkInvested + cashInvested + otherNetInvested;
        
        // Profit
        const aggregatedProfit = totalValue - totalInvestedSnapshot;
        const totalRoi = totalInvestedSnapshot > 0 ? (aggregatedProfit / totalInvestedSnapshot) * 100 : 0;

        let profitTrend = 0, cagr = 0, cagrTwr = 0, ltm = 0, ltmRoi = 0, ytd = 0, dailyTrend = 0;

        if (globalHistoryData.length > 1) {
             const prevPeriod = globalHistoryData[globalHistoryData.length - 2];
             if (prevPeriod.profit !== 0) {
                 profitTrend = ((aggregatedProfit - prevPeriod.profit) / Math.abs(prevPeriod.profit)) * 100;
             } else if (aggregatedProfit !== 0) {
                 profitTrend = 100;
             }
        }

        // Calculate Daily Trend (Weighted 24h Change)
        let totalPreviousValue24h = 0;
        let totalCurrentValue24h = 0;

        assetsToSum.forEach(r => {
           if (r.change24h !== undefined && r.isLivePrice) {
               const change = r.change24h;
               const prevVal = r.currentValue / (1 + change / 100);
               totalPreviousValue24h += prevVal;
               totalCurrentValue24h += r.currentValue;
           }
        });
        
        if (totalPreviousValue24h > 0) {
           dailyTrend = ((totalCurrentValue24h - totalPreviousValue24h) / totalPreviousValue24h) * 100;
        }

        // Performance Metrics (CAGR, LTM, YTD)
        if (globalHistoryData.length > 0) {
             const currentIndex = globalHistoryData.length - 1;
             
             // --- TWR Calculation (Time-Weighted) ---
             const calculateAccumulatedTWR = (startIdx: number, endIdx: number) => {
                let product = 1;
                for (let i = startIdx; i <= endIdx; i++) {
                   if (i <= 0) continue; 
                   const prev = globalHistoryData[i-1];
                   const curr = globalHistoryData[i];
                   const prevVal = prev['totalValue'] !== undefined ? prev['totalValue'] : (prev.investment + prev.profit);
                   const currVal = curr['totalValue'] !== undefined ? curr['totalValue'] : (curr.investment + curr.profit);
                   const flow = curr.investment - prev.investment; 
                   const denominator = prevVal + flow;
                   if (denominator !== 0) {
                      const gain = currVal - prevVal - flow;
                      const r = gain / denominator;
                      product *= (1 + r);
                   }
                }
                return (product - 1) * 100;
             };

             const startDate = new Date(globalHistoryData[0].date);
             const currentDate = new Date(globalHistoryData[currentIndex].date);
             const years = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
             
             if (years > 0.5) {
                // CAGR ROI (Money-Weighted)
                const totalFactor = 1 + (totalRoi / 100);
                cagr = (Math.pow(totalFactor, 1 / years) - 1) * 100;

                // CAGR TWR (Time-Weighted)
                const totalCumTWR = calculateAccumulatedTWR(1, currentIndex); // Full period TWR
                const twrFactor = 1 + (totalCumTWR / 100);
                cagrTwr = (Math.pow(twrFactor, 1 / years) - 1) * 100;
             } else {
                cagr = totalRoi;
                // For short period, TWR CAGR approx equals TWR
                cagrTwr = calculateAccumulatedTWR(1, currentIndex); 
             }

             const currentYear = new Date().getFullYear();
             const firstIndexThisYear = globalHistoryData.findIndex(d => new Date(d.date).getFullYear() === currentYear);
             if (firstIndexThisYear !== -1) ytd = calculateAccumulatedTWR(firstIndexThisYear, currentIndex);

             // LTM TWR
             const ltmStartIdx = Math.max(1, currentIndex - 11); 
             ltm = calculateAccumulatedTWR(ltmStartIdx, currentIndex);

             // --- LTM ROI Calculation (Money-Weighted Approximation) ---
             // Calculates return on average invested capital over the last 12 months.
             const oneYearAgoDate = new Date(currentDate);
             oneYearAgoDate.setFullYear(oneYearAgoDate.getFullYear() - 1);
             
             let ltmRoiIndex = 0;
             for (let i = currentIndex; i >= 0; i--) {
                 if (new Date(globalHistoryData[i].date) <= oneYearAgoDate) {
                     ltmRoiIndex = i;
                     break;
                 }
             }
             
             const ltmPrevData = globalHistoryData[ltmRoiIndex];
             const ltmCurrData = globalHistoryData[currentIndex];
             
             const profitGeneratedLTM = ltmCurrData.profit - ltmPrevData.profit;
             const avgCapitalLTM = (ltmCurrData.investment + ltmPrevData.investment) / 2;
             
             if (avgCapitalLTM > 0) {
                 ltmRoi = (profitGeneratedLTM / avgCapitalLTM) * 100;
             }
        }

        return {
            totalValue,
            totalProfit: aggregatedProfit,
            totalInvestment: totalInvestedSnapshot,
            currentRoi: totalRoi,
            profitTrend,
            dailyTrend,
            cagr, cagrTwr, ltm, ltmRoi, ytd
        };
    } 
    
    // --- NON-OMF PORTFOLIOS (IKE, CRYPTO, PPK) ---
    if (!data.length) return null;
    
    // Filter data to ensure it contains only TimeSeries rows (with date and roi)
    const timeSeriesData = data.filter((row): row is PPKDataRow | CryptoDataRow | IKEDataRow => 
        'date' in row && 'roi' in row
    );

    if (!timeSeriesData.length) return null;

    // Sort to ensure chronological order for calculations
    const sortedData = [...timeSeriesData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last = sortedData[sortedData.length - 1];
    
    // Common CAGR & LTM Calculation logic for sub-portfolios
    let cagr = 0;
    let ltmRoi = 0;
    let ytd = 0;
    let ltmProfit = 0;

    const startDate = new Date(sortedData[0].date);
    const currentDate = new Date(last.date);
    const years = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (years > 0.5) {
        const factor = 1 + (last.roi / 100);
        cagr = (Math.pow(factor, 1 / years) - 1) * 100;
    } else {
        cagr = last.roi;
    }

    // LTM ROI
    const oneYearAgoDate = new Date(currentDate);
    oneYearAgoDate.setFullYear(oneYearAgoDate.getFullYear() - 1);
    
    // Find closest row to 1 year ago
    let ltmPrevRow = sortedData[0];
    for (let i = sortedData.length - 1; i >= 0; i--) {
        if (new Date(sortedData[i].date) <= oneYearAgoDate) {
            ltmPrevRow = sortedData[i];
            break;
        }
    }

    // Determine Investment and Profit fields based on type
    const getInv = (r: any) => portfolioType === 'PPK' ? r.employeeContribution : r.investment;
    const getProf = (r: any) => r.profit;

    if (ltmPrevRow && ltmPrevRow.date !== last.date) {
        ltmProfit = getProf(last) - getProf(ltmPrevRow);
        const avgCapital = (getInv(last) + getInv(ltmPrevRow)) / 2;
        if (avgCapital > 0) {
            ltmRoi = (ltmProfit / avgCapital) * 100;
        }
    } else {
        // Less than a year of history
        ltmRoi = last.roi;
        ltmProfit = getProf(last);
    }

    // YTD
    const currentYear = new Date().getFullYear();
    let ytdPrevRow = sortedData[0];
    // Find last row of previous year or first of current
    const startOfYearRow = sortedData.find(d => new Date(d.date).getFullYear() === currentYear);
    if (startOfYearRow) {
       // We need the value at the END of previous year, which is essentially the start point for YTD.
       // Approximation: Start with the first record of this year.
       // YTD Profit = Current Profit - Profit at start of year
       const profitSinceStartOfYear = getProf(last) - getProf(startOfYearRow);
       const invAtStart = getInv(startOfYearRow);
       if (invAtStart > 0) {
           // Simple ROI diff is not accurate for YTD with flows, but reasonable proxy for simple display
           ytd = ((getProf(last) - getProf(startOfYearRow)) / getInv(last)) * 100; // Simplified
       }
    }


    if (portfolioType === 'PPK') {
        const row = last as PPKDataRow;
        if (typeof row.employeeContribution === 'undefined') return null;

        const taxAbs = Math.abs(row.tax || 0);
        const netValue = row.totalValue - taxAbs;
        const exitValue = netValue - (0.30 * row.employerContribution) - row.stateContribution - (0.19 * row.fundProfit);
        return {
            totalValue: row.totalValue,
            totalProfit: row.profit,
            totalEmployee: row.employeeContribution,
            totalEmployer: row.employerContribution,
            totalState: row.stateContribution,
            currentRoi: row.roi,
            currentExitRoi: row.exitRoi,
            customExitValue: exitValue,
            cagr, ltmRoi, ytd, 
            ltm: ltmProfit // using ltm field to pass profit amount for flip card
        } as SummaryStats & { customExitValue?: number };
    } else {
        const row = last as CryptoDataRow;
        if (typeof row.investment === 'undefined') return null;

        let taxSaved = 0;
        if (portfolioType === 'IKE') {
            const closedRaw = parseCSV(OMF_CLOSED_DATA, 'OMF', 'Offline').data as OMFDataRow[];
            const closedIkeProfit = closedRaw
                .filter(r => r.portfolio === 'IKE')
                .reduce((acc, curr) => acc + curr.profit, 0);
            
            const capitalGainsTaxSaved = closedIkeProfit > 0 ? closedIkeProfit * 0.19 : 0;
            const totalIkeDividends = dividends
                .filter(d => d.portfolio === 'IKE')
                .reduce((acc, d) => acc + d.value, 0);
            const dividendTaxSaved = totalIkeDividends * 0.19;

            taxSaved = capitalGainsTaxSaved + dividendTaxSaved;
        }

        return {
            totalValue: row.totalValue,
            totalProfit: row.profit,
            totalInvestment: row.investment,
            currentRoi: row.roi,
            taxSaved: taxSaved,
            cagr, ltmRoi, ytd,
            ltm: ltmProfit // using ltm field to pass profit amount for flip card
        };
    }
  }, [data, portfolioType, globalHistoryData, omfActiveAssets, omfClosedAssets, excludePPK, dividends]);
};
