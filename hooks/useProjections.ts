
import { useMemo } from 'react';
import { GlobalHistoryRow, AnyDataRow, PPKDataRow } from '../types';

interface UseProjectionsProps {
  globalHistoryData: GlobalHistoryRow[];
  ppkData: AnyDataRow[];
  portfolioType: string;
  showProjection: boolean;
  showPPKProjection: boolean;
  projectionMethod: 'CAGR' | 'CAGR_TWR';
  customCagr?: number; // Calculated historical CAGR (ROI based)
  customCagrTwr?: number; // Calculated historical CAGR (TWR based)
}

export const useProjections = ({
  globalHistoryData,
  ppkData,
  portfolioType,
  showProjection,
  showPPKProjection,
  projectionMethod,
  customCagr,
  customCagrTwr
}: UseProjectionsProps) => {

  // --- Calculate Rates Logic ---
  const omfRates = useMemo(() => {
      // 1. Calculate CAGR Rates (Monthly Rate %)
      
      // CAGR ROI (Money-Weighted)
      const effectiveAnnualCagr = (customCagr && customCagr > -90) ? customCagr : 10;
      const cagrRatePercent = (Math.pow(1 + (effectiveAnnualCagr / 100), 1/12) - 1) * 100;
      
      // CAGR TWR (Time-Weighted)
      const effectiveAnnualCagrTwr = (customCagrTwr && customCagrTwr > -90) ? customCagrTwr : 10;
      const cagrTwrRatePercent = (Math.pow(1 + (effectiveAnnualCagrTwr / 100), 1/12) - 1) * 100;

      return { 
          cagr: cagrRatePercent, 
          cagrTwr: cagrTwrRatePercent
      };
  }, [globalHistoryData, customCagr, customCagrTwr]);

  // --- OMF: Road to Million ---
  const omfProjection = useMemo(() => {
    if (!showProjection || globalHistoryData.length === 0) return globalHistoryData;
    const lastData = globalHistoryData[globalHistoryData.length - 1];
    if (!lastData || lastData.totalValue <= 0) return globalHistoryData;

    // Determine which rate to use
    let monthlyRatePercent = 0.8; // Default fallback (~10% annual)

    if (projectionMethod === 'CAGR_TWR') {
        monthlyRatePercent = omfRates.cagrTwr;
    } else {
        // Default to CAGR (ROI)
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
