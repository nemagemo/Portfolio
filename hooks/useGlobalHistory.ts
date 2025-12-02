
import { useMemo } from 'react';
import { GlobalHistoryRow, PortfolioType, OMFDataRow, DividendDataRow, PPKDataRow, CryptoDataRow, IKEDataRow, CashDataRow, BenchmarkData } from '../types';
import { parseCSV } from '../utils/parser';
import { CPI_DATA } from '../constants/inflation';

// Data Sources
import { PPK_DATA } from '../CSV/PPK';
import { KRYPTO_DATA } from '../CSV/Krypto';
import { IKE_DATA } from '../CSV/IKE';
import { CASH_DATA } from '../CSV/Cash';

interface UseGlobalHistoryProps {
  portfolioType: PortfolioType;
  omfActiveAssets: OMFDataRow[];
  omfClosedAssets: OMFDataRow[];
  dividends: DividendDataRow[];
  excludePPK: boolean;
  benchmarks: BenchmarkData | null;
}

/**
 * useGlobalHistory Hook
 * =====================
 * This hook builds the master timeline of the portfolio.
 * It merges historical CSV data (PPK, IKE, Crypto, Cash) with the current live state.
 * 
 * Key Responsibilities:
 * 1. Data Merging: Aligning all sources to a common date axis.
 * 2. Snowball Logic: Correctly calculating "Net Invested Capital" by subtracting 
 *    closed profits and reinvested dividends from the gross purchase cost.
 * 3. TWR (Time-Weighted Return): Calculating geometric returns to neutralize the impact of deposits/withdrawals.
 * 4. Real Value: Adjusting the nominal portfolio value using CPI inflation data (Chain-Linking).
 */
export const useGlobalHistory = ({ portfolioType, omfActiveAssets, omfClosedAssets, dividends, excludePPK, benchmarks }: UseGlobalHistoryProps) => {
  return useMemo<GlobalHistoryRow[]>(() => {
    if (portfolioType !== 'OMF') return [];

    const ppkData = parseCSV(PPK_DATA, 'PPK', 'Offline').data as PPKDataRow[];
    const cryptoData = parseCSV(KRYPTO_DATA, 'CRYPTO', 'Offline').data as CryptoDataRow[];
    const ikeData = parseCSV(IKE_DATA, 'IKE', 'Offline').data as IKEDataRow[];
    const cashData = parseCSV(CASH_DATA, 'CASH', 'Offline').data as CashDataRow[];

    // Map Lookups for faster access by Date
    const createMap = (arr: any[]) => new Map<string, { inv: number, profit: number }>(
        arr.map(r => [r.date, { inv: r.investment ?? (r.totalValue - r.profit), profit: r.profit }])
    );
    const ppkMap = createMap(ppkData);
    const cryptoMap = createMap(cryptoData);
    const ikeMap = createMap(ikeData);
    const cashMap = new Map(cashData.map(r => [r.date, r.value]));

    // --- LIVE TOTALS & SNOWBALL LOGIC ---
    // Calculate the current state from OMF snapshots.
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

    // Snowball Adjustments:
    // Net Invested = Gross Purchase Value (Current Open) - Realized Profits (Closed) - Reinvested Dividends.
    // This ensures that reinvesting profits isn't counted as "new money" from the user's pocket.
    const totalActiveDividendsIKE = dividends
        .filter(d => d.portfolio === 'IKE' && d.isCounted)
        .reduce((acc, row) => acc + row.value, 0);

    const liveNetInvIKE = liveTotals.IKE.inv - closedProfits.IKE - totalActiveDividendsIKE;
    const liveNetInvCrypto = liveTotals.CRYPTO.inv - closedProfits.CRYPTO;

    // Dates Union & Sorting
    const allDates = new Set([...ppkMap.keys(), ...cryptoMap.keys(), ...ikeMap.keys(), ...cashMap.keys()]);
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Update Last Point with Live Data (Live prices usually newer than CSV history)
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
    // Formula: RealValue_t = (RealValue_{t-1} + NominalChange) / (1 + InflationRate)
    let currentRealValue = 0;
    let lastTotalValueForReal = 0;
    
    // --- BENCHMARKS ---
    // Goal: Compare performance relative to Project Start (March/April 2023).
    // Base Date: 2023-03-31 (End of March) represents the starting line (0%).
    
    const findPrice = (map: Record<string, number>, targetDateStr: string): number | undefined => {
       // Exact match
       if (map[targetDateStr]) return map[targetDateStr];
       
       // Fallback: look back up to 5 days to find a closing price (handle weekends/holidays)
       const target = new Date(targetDateStr);
       for (let i = 1; i <= 5; i++) {
           const d = new Date(target);
           d.setDate(d.getDate() - i);
           const k = d.toISOString().split('T')[0];
           if (map[k]) return map[k];
       }
       return undefined;
    };

    // Helper: Find the LATEST available price in a given month.
    // This is used for the current incomplete month where End-of-Month data doesn't exist yet.
    const findLatestInMonth = (map: Record<string, number>, year: number, monthIdx: number): number | undefined => {
        // Start from the last possible day of the month (e.g. 31st) and scan backwards
        const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
        for (let d = daysInMonth; d >= 1; d--) {
             const mStr = String(monthIdx + 1).padStart(2, '0');
             const dStr = String(d).padStart(2, '0');
             const key = `${year}-${mStr}-${dStr}`;
             if (map[key]) return map[key];
        }
        return undefined;
    };

    const sp500Base = benchmarks?.sp500 ? findPrice(benchmarks.sp500, '2023-03-31') : undefined;
    const wig20Base = benchmarks?.wig20 ? findPrice(benchmarks.wig20, '2023-03-31') : undefined;

    return sortedDates.map((date, index) => {
        // Carry forward last known values if data missing for a month
        if (ppkMap.has(date)) lastPPK = ppkMap.get(date)!;
        if (cryptoMap.has(date)) lastCrypto = cryptoMap.get(date)!;
        if (ikeMap.has(date)) lastIKE = ikeMap.get(date)!;

        const currentPPKInv = excludePPK ? 0 : lastPPK.inv;
        const currentPPKProfit = excludePPK ? 0 : lastPPK.profit;
        
        // Cash Handling
        const isCurrentMonth = index === sortedDates.length - 1;
        let cashVal = 0;
        if (isCurrentMonth && liveTotals.CASH.val > 0) {
             cashVal = liveTotals.CASH.val;
        } else {
             cashVal = cashMap.get(date) || 0;
        }
        const cashInv = cashVal;
        const cashProfit = 0; // Cash generates no profit in this model

        const totalInvestment = currentPPKInv + lastCrypto.inv + lastIKE.inv + cashInv;
        const totalProfit = currentPPKProfit + lastCrypto.profit + lastIKE.profit + cashProfit;
        const totalValue = totalInvestment + totalProfit;

        // NoPPK specific calculation (Used for Heatmap/Active Management Analysis)
        const invNoPPK = lastCrypto.inv + lastIKE.inv + cashInv;
        const profitNoPPK = lastCrypto.profit + lastIKE.profit + cashProfit;
        const valNoPPK = invNoPPK + profitNoPPK;

        // --- TWR Calculation (Active Management Only - IKE + Crypto) ---
        // TWR removes the effect of cash inflows/outflows to show pure investment skill.
        const currCrypto = cryptoMap.get(date) || lastCrypto;
        const currIKE = ikeMap.get(date) || lastIKE;
        const currTwrInv = currCrypto.inv + currIKE.inv;
        const currTwrProfit = currCrypto.profit + currIKE.profit;
        const currTwrVal = currTwrInv + currTwrProfit;

        if (index > 0) {
            const flow = currTwrInv - prevTwrInv; // Net Deposit/Withdrawal
            const denom = prevTwrVal + flow;      // Denominator: Start Value + Flows
            if (denom !== 0) {
                const gain = currTwrVal - prevTwrVal - flow; // Pure Investment Gain
                const r = gain / denom;
                twrProduct *= (1 + r); // Chain link: (1+r1)*(1+r2)...
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
            // Adjust current month's ending value by inflation factor
            currentRealValue = (currentRealValue + nominalChange) / (1 + inflationRate);
        }
        lastTotalValueForReal = totalValue;

        // --- Benchmarks (Relative Performance) ---
        // Logic: 
        // Base Date: 2023-03-31 (End of March 2023) is 0%.
        // For a row date 'YYYY-MM-DD' (e.g. 2023-04-01), this represents the monthly bucket for April.
        // We compare against the benchmark closing price at the END of that same month (e.g. 2023-04-30).
        
        const rowDateObj = new Date(date);
        // Get Last Day of Current Month: new Date(Year, Month + 1, 0)
        const endOfMonth = new Date(rowDateObj.getFullYear(), rowDateObj.getMonth() + 1, 0);
        
        // Format to YYYY-MM-DD to match benchmark keys
        const y = endOfMonth.getFullYear();
        const m = endOfMonth.getMonth(); // 0-indexed month for helper
        const benchmarkDateKey = endOfMonth.toISOString().split('T')[0];

        let sp500Ret: number | undefined = undefined;
        let wig20Ret: number | undefined = undefined;

        if (benchmarks && sp500Base && wig20Base) {
            // 1. Try finding price at End of Month (Standard)
            let currentSP500 = findPrice(benchmarks.sp500, benchmarkDateKey);
            let currentWIG20 = findPrice(benchmarks.wig20, benchmarkDateKey);

            // 2. If not found (e.g. current month isn't finished yet), find LATEST price in that month
            if (currentSP500 === undefined) {
                currentSP500 = findLatestInMonth(benchmarks.sp500, y, m);
            }
            if (currentWIG20 === undefined) {
                currentWIG20 = findLatestInMonth(benchmarks.wig20, y, m);
            }

            if (currentSP500) {
                sp500Ret = ((currentSP500 - sp500Base) / sp500Base) * 100;
            }
            if (currentWIG20) {
                wig20Ret = ((currentWIG20 - wig20Base) / wig20Base) * 100;
            }
        }

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
            
            investmentNoPPK: invNoPPK,
            profitNoPPK: profitNoPPK,
            totalValueNoPPK: valNoPPK
        };
    });
  }, [portfolioType, omfActiveAssets, omfClosedAssets, excludePPK, dividends, benchmarks]);
};
