
import { useMemo } from 'react';
import { GlobalHistoryRow, AnyDataRow, PPKDataRow } from '../types';

interface UseProjectionsProps {
  globalHistoryData: GlobalHistoryRow[];
  ppkData: AnyDataRow[];
  portfolioType: string;
  showProjection: boolean;
  showPPKProjection: boolean;
  projectionMethod: 'LTM' | 'CAGR' | '2xCAGR';
  customCagr?: number; // Calculated historical CAGR from stats
}

export const useProjections = ({
  globalHistoryData,
  ppkData,
  portfolioType,
  showProjection,
  showPPKProjection,
  projectionMethod,
  customCagr
}: UseProjectionsProps) => {

  // --- Calculate Rates Logic ---
  const omfRates = useMemo(() => {
      if (globalHistoryData.length < 2) {
          return { ltm: 0, cagr: 0, doubleCagr: 0, isLtmValid: true };
      }
      
      const lastData = globalHistoryData[globalHistoryData.length - 1];
      const firstData = globalHistoryData[0];
      
      // 1. Calculate Real LTM (Monthly Rate %)
      let ltmRateDecimal = 0;
      
      if (globalHistoryData.length >= 12) {
          const prev = globalHistoryData[globalHistoryData.length - 12];
          if (prev.totalValue > 0) {
             // Monthly equivalent of the last 12 months growth
             ltmRateDecimal = Math.pow(lastData.totalValue / prev.totalValue, 1/12) - 1;
          }
      } else {
          // If less than a year, annualize the total return so far -> convert to monthly
          const months = Math.max(1, globalHistoryData.length);
          if (firstData.totalValue > 0) {
             ltmRateDecimal = Math.pow(lastData.totalValue / firstData.totalValue, 1/months) - 1;
          }
      }

      const ltmRatePercent = ltmRateDecimal * 100;
      const isLtmValid = ltmRateDecimal > 0;

      // 2. Calculate CAGR Rates (Monthly Rate %)
      // Use customCagr from stats if valid, otherwise fallback to safe 10%
      // Note: customCagr is annual percentage (e.g. 15.5)
      const effectiveAnnualCagr = (customCagr && customCagr > -90) ? customCagr : 10;
      
      // Normal CAGR Monthly %
      const cagrRatePercent = (Math.pow(1 + (effectiveAnnualCagr / 100), 1/12) - 1) * 100;
      
      // 2x CAGR (Aggressive) Monthly %
      const doubleAnnualCagr = effectiveAnnualCagr * 2;
      const doubleCagrRatePercent = (Math.pow(1 + (doubleAnnualCagr / 100), 1/12) - 1) * 100;

      return { 
          ltm: ltmRatePercent, 
          cagr: cagrRatePercent, 
          doubleCagr: doubleCagrRatePercent, 
          isLtmValid 
      };
  }, [globalHistoryData, customCagr]);

  // --- OMF: Road to Million ---
  const omfProjection = useMemo(() => {
    if (!showProjection || globalHistoryData.length === 0) return globalHistoryData;
    const lastData = globalHistoryData[globalHistoryData.length - 1];
    if (!lastData || lastData.totalValue <= 0) return globalHistoryData;

    // Determine which rate to use
    let monthlyRatePercent = 0.8; // Default fallback (~10% annual)

    if (projectionMethod === 'LTM') {
        // If LTM is valid, use it. If not, internal fallback to 2xCAGR to avoid broken chart
        if (omfRates.isLtmValid) {
            monthlyRatePercent = omfRates.ltm;
        } else {
            monthlyRatePercent = omfRates.doubleCagr;
        }
    } else if (projectionMethod === '2xCAGR') {
        monthlyRatePercent = omfRates.doubleCagr;
    } else {
        // CAGR
        monthlyRatePercent = omfRates.cagr;
    }

    // Convert Monthly % to Decimal Factor
    const monthlyRate = monthlyRatePercent / 100;

    // Generate Points
    const projectionPoints: GlobalHistoryRow[] = [];
    let currentValue = lastData.totalValue;
    let currentDate = new Date(lastData.date);
    let iterations = 0;
    
    // Stop at 1M PLN or 30 years (360 months)
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
  }, [globalHistoryData, showProjection, projectionMethod, omfRates]);

  // --- PPK: Road to Retirement ---
  const ppkProjection = useMemo(() => {
    if (portfolioType !== 'PPK' || !showPPKProjection || ppkData.length === 0) return ppkData;
    
    const lastData = ppkData[ppkData.length - 1] as PPKDataRow;
    const monthlyRate = Math.pow(1.12, 1/12) - 1; // Assumed 12%
    
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
  }, [ppkData, portfolioType, showPPKProjection]);

  // --- General: Investment Duration ---
  const investmentDurationMonths = useMemo(() => {
    if (globalHistoryData.length === 0) return 0;
    const start = globalHistoryData[0].date;
    const end = globalHistoryData[globalHistoryData.length - 1].date;
    const d1 = new Date(start);
    const d2 = new Date(end);
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return Math.max(0, months);
  }, [globalHistoryData]);

  return {
    omfProjectionData: omfProjection,
    omfRates,
    ppkProjectionData: ppkProjection,
    investmentDurationMonths
  };
};
