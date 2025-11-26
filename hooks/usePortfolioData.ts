
import { useState, useEffect, useMemo } from 'react';
import { AnyDataRow, ValidationReport, OMFValidationReport, OMFDataRow, PortfolioType, GlobalHistoryRow, SummaryStats, PPKDataRow, CryptoDataRow, IKEDataRow, CashDataRow, DividendDataRow } from '../types';
import { parseCSV, validateOMFIntegrity } from '../utils/parser';
import { CPI_DATA } from '../constants/inflation';
import { SP500_DATA, WIG20_DATA } from '../constants/benchmarks';
import { FALLBACK_PRICES } from '../constants/fallbackPrices';

// Import Local CSV Data
import { PPK_DATA } from '../CSV/PPK';
import { KRYPTO_DATA } from '../CSV/Krypto';
import { IKE_DATA } from '../CSV/IKE';
import { OMF_OPEN_DATA } from '../CSV/OMFopen';
import { OMF_CLOSED_DATA } from '../CSV/OMFclosed';
import { CASH_DATA } from '../CSV/Cash';
import { DIVIDENDS_DATA } from '../CSV/Dividends';

interface UsePortfolioDataProps {
  portfolioType: PortfolioType;
  onlinePrices: Record<string, number> | null;
  historyPrices: Record<string, number> | null;
  excludePPK?: boolean;
}

export const usePortfolioData = ({ portfolioType, onlinePrices, historyPrices, excludePPK = false }: UsePortfolioDataProps) => {
  const [data, setData] = useState<AnyDataRow[]>([]);
  const [dividends, setDividends] = useState<DividendDataRow[]>([]);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [omfReport, setOmfReport] = useState<OMFValidationReport | null>(null);
  const [omfActiveAssets, setOmfActiveAssets] = useState<OMFDataRow[]>([]);
  const [omfClosedAssets, setOmfClosedAssets] = useState<OMFDataRow[]>([]);

  const csvSources = {
    PPK: PPK_DATA,
    CRYPTO: KRYPTO_DATA,
    IKE: IKE_DATA,
    OMF_OPEN: OMF_OPEN_DATA,
    OMF_CLOSED: OMF_CLOSED_DATA,
    CASH: CASH_DATA,
    DIVIDENDS: DIVIDENDS_DATA
  };

  // 1. Parsing and Merging Prices
  useEffect(() => {
    try {
      // Always parse dividends globally as they are needed for stats and IKE dashboard
      const divRes = parseCSV(csvSources.DIVIDENDS, 'DIVIDENDS', 'Offline');
      const parsedDividends = divRes.data as DividendDataRow[];
      setDividends(parsedDividends);

      if (portfolioType === 'OMF') {
        const openRes = parseCSV(csvSources.OMF_OPEN, 'OMF', 'Offline');
        let omfOpenRows = openRes.data as OMFDataRow[];
        const closedRes = parseCSV(csvSources.OMF_CLOSED, 'OMF', 'Offline');
        const omfClosedRows = closedRes.data as OMFDataRow[];

        // Revaluation Logic for OMF
        omfOpenRows = omfOpenRows.map(row => {
            if (row.status !== 'Otwarta' && row.status !== 'Gotówka') return row;

            const symbolKey = row.symbol.toUpperCase();
            let finalPrice: number | undefined = undefined;
            let isLivePrice = false;

            // Priority 1: Online Price
            if (onlinePrices && onlinePrices[symbolKey] > 0) {
                finalPrice = onlinePrices[symbolKey];
                isLivePrice = true;
            } 
            // Priority 2: Fallback Price (Offline)
            else if (FALLBACK_PRICES[symbolKey] > 0) {
                finalPrice = FALLBACK_PRICES[symbolKey];
                isLivePrice = false;
            }
            
            // If we found a valid price (Online or Fallback), recalculate.
            if (finalPrice !== undefined && finalPrice > 0) {
                let newCurrentValue = 0;
                if (row.quantity > 0) {
                    newCurrentValue = row.quantity * finalPrice;
                } else {
                    newCurrentValue = finalPrice;
                }
                
                const newProfit = newCurrentValue - row.purchaseValue;
                const newRoi = row.purchaseValue > 0 ? (newProfit / row.purchaseValue) * 100 : 0;

                // 24h Change Logic - CRITICAL PROTECTION
                // We ONLY calculate 24h change if we have a LIVE price.
                let change24h = undefined;
                
                if (isLivePrice) {
                    const prevPrice = historyPrices?.[symbolKey];
                    if (prevPrice && prevPrice > 0) {
                        change24h = ((finalPrice - prevPrice) / prevPrice) * 100;
                    }
                }

                return {
                    ...row,
                    change24h, // Will be undefined if not isLivePrice, preventing fake spikes
                    currentValue: newCurrentValue,
                    profit: newProfit,
                    roi: parseFloat(newRoi.toFixed(2)),
                    isLivePrice
                } as OMFDataRow;
            }
            
            // Priority 3: No price found anywhere? Keep original CSV row data.
            // This prevents showing 0.00 zł if both Online and Fallback fail.
            return { ...row, isLivePrice: false, change24h: undefined };
        });

        const combinedData = [...omfOpenRows, ...omfClosedRows];
        const integrity = validateOMFIntegrity(combinedData, 'Offline');
        
        // --- CROSS-CHECK: Validate History vs Snapshot Integrity ---
        // This protects against manual errors in IKE.ts / Krypto.ts where "Invested" is typed wrong.
        
        // 1. Parse History Files
        const ikeHistoryRaw = parseCSV(csvSources.IKE, 'IKE', 'Offline').data as IKEDataRow[];
        const cryptoHistoryRaw = parseCSV(csvSources.CRYPTO, 'CRYPTO', 'Offline').data as CryptoDataRow[];
        
        // 2. Calculate Theoretical IKE Investment (Snowball Formula)
        const openIKE = omfOpenRows.filter(r => r.portfolio === 'IKE').reduce((sum, r) => sum + r.purchaseValue, 0);
        const closedIKE = omfClosedRows.filter(r => r.portfolio === 'IKE').reduce((sum, r) => sum + r.profit, 0);
        const divsIKE = parsedDividends.filter(d => d.portfolio === 'IKE' && d.isCounted).reduce((sum, r) => sum + r.value, 0);
        const calcIKE = openIKE - closedIKE - divsIKE;

        // 3. Compare with last recorded IKE Investment
        if (ikeHistoryRaw.length > 0) {
            const lastRecIKE = ikeHistoryRaw[ikeHistoryRaw.length - 1].investment;
            if (Math.abs(lastRecIKE - calcIKE) > 5.00) {
                integrity.isConsistent = false;
                integrity.messages.push(`Niespójność Historii IKE: Wpisano ${lastRecIKE.toFixed(2)}, wyliczono ${calcIKE.toFixed(2)} (Różnica: ${(lastRecIKE - calcIKE).toFixed(2)}). Sprawdź CSV/IKE.ts.`);
            }
        }

        // 4. Calculate Theoretical Crypto Investment
        const openCrypto = omfOpenRows.filter(r => r.portfolio === 'Krypto').reduce((sum, r) => sum + r.purchaseValue, 0);
        const closedCrypto = omfClosedRows.filter(r => r.portfolio === 'Krypto').reduce((sum, r) => sum + r.profit, 0);
        // No dividends for crypto usually, but if added, subtract here
        const calcCrypto = openCrypto - closedCrypto;

        // 5. Compare with last recorded Crypto Investment
        if (cryptoHistoryRaw.length > 0) {
            const lastRecCrypto = cryptoHistoryRaw[cryptoHistoryRaw.length - 1].investment;
            if (Math.abs(lastRecCrypto - calcCrypto) > 5.00) {
                integrity.isConsistent = false;
                integrity.messages.push(`Niespójność Historii Krypto: Wpisano ${lastRecCrypto.toFixed(2)}, wyliczono ${calcCrypto.toFixed(2)} (Różnica: ${(lastRecCrypto - calcCrypto).toFixed(2)}). Sprawdź CSV/Krypto.ts.`);
            }
        }

        setOmfReport(integrity); 
        setReport(openRes.report);
        setOmfActiveAssets(omfOpenRows);
        setOmfClosedAssets(omfClosedRows);
        setData(combinedData);

      } else {
        // PPK, CRYPTO, IKE, CASH, DIVIDENDS
        const sourceData = csvSources[portfolioType as keyof typeof csvSources];
        if (sourceData) {
            const result = parseCSV(sourceData, portfolioType, 'Offline');
            setData(result.data);
            setReport(result.report);
            setOmfReport(null);
        }
      }
    } catch (e) {
      console.error("Failed to parse CSV", e);
    }
  }, [portfolioType, onlinePrices, historyPrices]);

  // 2. Global History Calculation (for OMF Chart)
  const globalHistoryData = useMemo<GlobalHistoryRow[]>(() => {
    if (portfolioType !== 'OMF') return [];

    const ppkData = parseCSV(csvSources.PPK, 'PPK', 'Offline').data as PPKDataRow[];
    const cryptoData = parseCSV(csvSources.CRYPTO, 'CRYPTO', 'Offline').data as CryptoDataRow[];
    const ikeData = parseCSV(csvSources.IKE, 'IKE', 'Offline').data as IKEDataRow[];
    const cashData = parseCSV(csvSources.CASH, 'CASH', 'Offline').data as CashDataRow[];
    // Use dividends from state or parse if empty (fallback)
    const dividendsData = dividends.length > 0 ? dividends : parseCSV(csvSources.DIVIDENDS, 'DIVIDENDS', 'Offline').data as DividendDataRow[];

    // Map Lookups
    const createMap = (arr: any[]) => new Map<string, { inv: number, profit: number }>(
        arr.map(r => [r.date, { inv: r.investment ?? (r.totalValue - r.profit), profit: r.profit }])
    );
    const ppkMap = createMap(ppkData);
    const cryptoMap = createMap(cryptoData);
    const ikeMap = createMap(ikeData);
    const cashMap = new Map(cashData.map(r => [r.date, r.value]));

    // Live Totals & Snowball Effect
    const closedProfits = { IKE: 0, CRYPTO: 0 };
    omfClosedAssets.forEach(a => {
        if (a.portfolio.toUpperCase().includes('IKE')) closedProfits.IKE += a.profit;
        if (a.portfolio.toUpperCase().includes('KRYPTO')) closedProfits.CRYPTO += a.profit;
    });

    const liveTotals = { PPK: {inv:0, val:0}, CRYPTO: {inv:0, val:0}, IKE: {inv:0, val:0}, CASH: {inv:0, val:0} };
    omfActiveAssets.forEach(a => {
        const p = a.portfolio.toUpperCase();
        let target = liveTotals.CASH;
        if (p === 'PPK') target = liveTotals.PPK;
        else if (p.includes('KRYPTO')) target = liveTotals.CRYPTO;
        else if (p.includes('IKE')) target = liveTotals.IKE;
        
        target.inv += a.purchaseValue;
        target.val += a.currentValue;
    });

    // Snowball Adjustments (IKE dividends logic)
    // Only subtract dividends that are marked as "active" (isCounted = true) from the invested capital.
    // Historical/Legacy dividends provided for visualization only should NOT reduce the capital base.
    const totalActiveDividendsIKE = dividendsData
        .filter(d => d.portfolio === 'IKE' && d.isCounted)
        .reduce((acc, row) => acc + row.value, 0);

    // If we bought assets using dividends, 'liveTotals.IKE.inv' (Purchase Value) includes that amount.
    // We must subtract it to keep "Net Invested" correct (only external cash).
    const liveNetInvIKE = liveTotals.IKE.inv - closedProfits.IKE - totalActiveDividendsIKE;
    const liveNetInvCrypto = liveTotals.CRYPTO.inv - closedProfits.CRYPTO;

    // Dates Union (Including historical Cash dates)
    const allDates = new Set([...ppkMap.keys(), ...cryptoMap.keys(), ...ikeMap.keys(), ...cashMap.keys()]);
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Update Last Point with Live Data (only for core assets, cash handled in loop)
    if (sortedDates.length > 0) {
        const lastDate = sortedDates[sortedDates.length - 1];
        
        if (liveTotals.PPK.val > 0) {
            ppkMap.set(lastDate, { 
                inv: liveTotals.PPK.inv, 
                profit: liveTotals.PPK.val - liveTotals.PPK.inv 
            });
        }
        if (liveTotals.CRYPTO.val > 0) {
            const liveProfitCrypto = liveTotals.CRYPTO.val - liveNetInvCrypto;
            cryptoMap.set(lastDate, { 
                inv: liveNetInvCrypto, 
                profit: liveProfitCrypto 
            });
        }
        if (liveTotals.IKE.val > 0) {
            const liveProfitIKE = liveTotals.IKE.val - liveNetInvIKE;
            ikeMap.set(lastDate, { 
                inv: liveNetInvIKE, 
                profit: liveProfitIKE 
            });
        }
    }

    let lastPPK = { inv: 0, profit: 0 }, lastCrypto = { inv: 0, profit: 0 }, lastIKE = { inv: 0, profit: 0 };
    let twrProduct = 1, prevTwrVal = 0, prevTwrInv = 0;
    
    // --- REAL VALUE CALCULATION (CPI - Chain Linked) ---
    let currentRealValue = 0;
    let lastTotalValueForReal = 0;
    const startSP500 = sortedDates[0] ? (SP500_DATA[sortedDates[0]] || Object.values(SP500_DATA)[0]) : 0;
    const startWIG20 = sortedDates[0] ? (WIG20_DATA[sortedDates[0]] || Object.values(WIG20_DATA)[0]) : 0;

    return sortedDates.map((date, index) => {
        if (ppkMap.has(date)) lastPPK = ppkMap.get(date)!;
        if (cryptoMap.has(date)) lastCrypto = cryptoMap.get(date)!;
        if (ikeMap.has(date)) lastIKE = ikeMap.get(date)!;

        const currentPPKInv = excludePPK ? 0 : lastPPK.inv;
        const currentPPKProfit = excludePPK ? 0 : lastPPK.profit;
        
        // Cash Handling
        const isCurrentMonth = index === sortedDates.length - 1;
        let cashVal = 0;
        if (isCurrentMonth && liveTotals.CASH.val > 0) {
             // liveTotals.CASH currently holds both General Cash and PLN-IKE if they are marked as Gotówka/Gotówka
             // Logic: General Cash (marked 'Gotówka') is what we want here for the "Cash" component.
             // But wait: 'PLN-IKE' is marked as Portfolio: 'IKE' in `liveTotals` logic above.
             // So liveTotals.CASH only contains non-IKE/non-Crypto cash. Correct.
             cashVal = liveTotals.CASH.val;
        } else {
             cashVal = cashMap.get(date) || 0;
        }
        const cashInv = cashVal;
        const cashProfit = 0;

        const totalInvestment = currentPPKInv + lastCrypto.inv + lastIKE.inv + cashInv;
        const totalProfit = currentPPKProfit + lastCrypto.profit + lastIKE.profit + cashProfit;
        const totalValue = totalInvestment + totalProfit;

        // NoPPK specific calculation for heatmap (Strictly Active Management: Crypto + IKE + Cash)
        const invNoPPK = lastCrypto.inv + lastIKE.inv + cashInv;
        const profitNoPPK = lastCrypto.profit + lastIKE.profit + cashProfit;
        const valNoPPK = invNoPPK + profitNoPPK;

        // TWR Calculation
        const currCrypto = cryptoMap.get(date) || lastCrypto;
        const currIKE = ikeMap.get(date) || lastIKE;
        const currTwrInv = currCrypto.inv + currIKE.inv;
        const currTwrProfit = currCrypto.profit + currIKE.profit;
        const currTwrVal = currTwrInv + currTwrProfit;

        if (index > 0) {
            const flow = currTwrInv - prevTwrInv;
            const denom = prevTwrVal + flow;
            if (denom !== 0) {
                const gain = currTwrVal - prevTwrVal - flow;
                const r = gain / denom;
                twrProduct *= (1 + r);
            }
        } else if (currTwrInv > 0) {
            const r = currTwrProfit / currTwrInv;
            twrProduct *= (1 + r);
        }
        prevTwrVal = currTwrVal;
        prevTwrInv = currTwrInv;

        // CPI Chain-Linking Logic
        const inflationRate = CPI_DATA[date] || 0;
        if (index === 0) {
            currentRealValue = totalValue;
        } else {
            const nominalChange = totalValue - lastTotalValueForReal;
            currentRealValue = (currentRealValue + nominalChange) / (1 + inflationRate);
        }
        lastTotalValueForReal = totalValue;

        // Benchmarks
        const [y, m, d] = date.split('-');
        let nY = parseInt(y), nM = parseInt(m) + 1;
        if (nM > 12) { nM = 1; nY++; }
        const nextDateKey = `${nY}-${String(nM).padStart(2,'0')}-${d}`;
        const sp500Ret = SP500_DATA[nextDateKey] && startSP500 ? ((SP500_DATA[nextDateKey] - startSP500)/startSP500)*100 : undefined;
        const wig20Ret = WIG20_DATA[nextDateKey] && startWIG20 ? ((WIG20_DATA[nextDateKey] - startWIG20)/startWIG20)*100 : undefined;

        // Allocation Shares
        const ppkVal = excludePPK ? 0 : (lastPPK.inv + lastPPK.profit);
        const cryptoVal = lastCrypto.inv + lastCrypto.profit;
        const ikeVal = lastIKE.inv + lastIKE.profit;
        const sumVal = ppkVal + cryptoVal + ikeVal; 

        return {
            date,
            investment: totalInvestment,
            profit: totalProfit,
            totalValue,
            realTotalValue: currentRealValue,
            roi: totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0,
            cumulativeTwr: (twrProduct - 1) * 100,
            ppkShare: sumVal > 0 ? ppkVal / sumVal : 0,
            cryptoShare: sumVal > 0 ? cryptoVal / sumVal : 0,
            ikeShare: sumVal > 0 ? ikeVal / sumVal : 0,
            sp500Return: sp500Ret,
            wig20Return: wig20Ret,
            
            // Specific NoPPK data for heatmap
            investmentNoPPK: invNoPPK,
            profitNoPPK: profitNoPPK,
            totalValueNoPPK: valNoPPK
        };
    });
  }, [portfolioType, omfActiveAssets, omfClosedAssets, excludePPK, dividends]);

  // 3. Derived Stats
  const stats: SummaryStats | null = useMemo(() => {
    if (portfolioType === 'OMF') {
        const last = globalHistoryData[globalHistoryData.length - 1];
        if (!last) return null;

        // Dividends for Stats Calculation - FILTERED
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

        // Logic: We subtract dividends from "Invested Capital" for IKE assets because that capital
        // was generated internally, not contributed from outside.
        const otherNetInvested = otherOpenPurchase - closedProfitOffset - totalActiveDividendsIKE;
        
        const totalInvestedSnapshot = ppkInvested + cashInvested + otherNetInvested;
        
        // Profit
        const aggregatedProfit = totalValue - totalInvestedSnapshot;
        const totalRoi = totalInvestedSnapshot > 0 ? (aggregatedProfit / totalInvestedSnapshot) * 100 : 0;

        let profitTrend = 0, cagr = 0, ltm = 0, ytd = 0, dailyTrend = 0;

        if (globalHistoryData.length > 1) {
             const prevPeriod = globalHistoryData[globalHistoryData.length - 2];
             if (prevPeriod.profit !== 0) {
                 profitTrend = ((aggregatedProfit - prevPeriod.profit) / Math.abs(prevPeriod.profit)) * 100;
             } else if (aggregatedProfit !== 0) {
                 profitTrend = 100;
             }
        }

        // Calculate Daily Trend (Weighted 24h Change)
        // We ONLY include assets that have a valid 24h change (Live Prices).
        let totalPreviousValue24h = 0;
        let totalCurrentValue24h = 0;

        assetsToSum.forEach(r => {
           // only consider assets with valid 24h change (meaning live data)
           if (r.change24h !== undefined && r.isLivePrice) {
               const change = r.change24h;
               // Backward calculation: Prev = Curr / (1 + change%)
               const prevVal = r.currentValue / (1 + change / 100);
               totalPreviousValue24h += prevVal;
               totalCurrentValue24h += r.currentValue;
           }
        });
        
        if (totalPreviousValue24h > 0) {
           dailyTrend = ((totalCurrentValue24h - totalPreviousValue24h) / totalPreviousValue24h) * 100;
        }

        // Performance Metrics
        if (globalHistoryData.length > 0) {
             const currentIndex = globalHistoryData.length - 1;
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
                const totalFactor = 1 + (totalRoi / 100);
                cagr = (Math.pow(totalFactor, 1 / years) - 1) * 100;
             } else {
                cagr = totalRoi;
             }

             const currentYear = new Date().getFullYear();
             const firstIndexThisYear = globalHistoryData.findIndex(d => new Date(d.date).getFullYear() === currentYear);
             if (firstIndexThisYear !== -1) ytd = calculateAccumulatedTWR(firstIndexThisYear, currentIndex);

             const ltmStartIdx = Math.max(1, currentIndex - 11); 
             ltm = calculateAccumulatedTWR(ltmStartIdx, currentIndex);
        }

        return {
            totalValue,
            totalProfit: aggregatedProfit,
            totalInvestment: totalInvestedSnapshot,
            currentRoi: totalRoi,
            profitTrend,
            dailyTrend,
            cagr, ltm, ytd
        };
    } 
    
    if (!data.length) return null;
    const last = data[data.length - 1];

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
            customExitValue: exitValue
        } as SummaryStats & { customExitValue?: number };
    } else {
        const row = last as CryptoDataRow;
        if (typeof row.investment === 'undefined') return null;

        let taxSaved = 0;
        if (portfolioType === 'IKE') {
            const closedRaw = parseCSV(csvSources.OMF_CLOSED, 'OMF', 'Offline').data as OMFDataRow[];
            const closedIkeProfit = closedRaw
                .filter(r => r.portfolio === 'IKE')
                .reduce((acc, curr) => acc + curr.profit, 0);
            
            // 1. Capital Gains Tax Shield (from closed positions)
            const capitalGainsTaxSaved = closedIkeProfit > 0 ? closedIkeProfit * 0.19 : 0;

            // 2. Dividend Tax Shield (All IKE dividends, active + historical)
            // We take ALL because tax was saved on all of them, regardless of snowball tracking
            const totalIkeDividends = dividends
                .filter(d => d.portfolio === 'IKE')
                .reduce((acc, d) => acc + d.value, 0);
            const dividendTaxSaved = totalIkeDividends * 0.19;

            taxSaved = capitalGainsTaxSaved + dividendTaxSaved;
        } else if (portfolioType === 'CRYPTO') {
             taxSaved = 0; 
        }

        return {
            totalValue: row.totalValue,
            totalProfit: row.profit,
            totalInvestment: row.investment,
            currentRoi: row.roi,
            taxSaved: taxSaved
        };
    }
  }, [data, portfolioType, globalHistoryData, omfActiveAssets, omfClosedAssets, excludePPK, dividends]);

  // 4. Daily Heatmap Data
  const dailyChangeData = useMemo(() => {
    if (portfolioType !== 'OMF' || !omfActiveAssets.length) return [];
    const groups: Record<string, any[]> = {};
    let cryptoRestNow = 0, cryptoRestPrev = 0;

    omfActiveAssets.forEach(a => {
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
