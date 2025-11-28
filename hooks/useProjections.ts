
import { useMemo } from 'react';
import { GlobalHistoryRow, AnyDataRow, PPKDataRow } from '../types';

interface UseProjectionsProps {
  globalHistoryData: GlobalHistoryRow[];
  ppkData: AnyDataRow[];
  portfolioType: string;
  showProjection: boolean;
  showPPKProjection: boolean;
  projectionMethod: 'LTM' | 'CAGR';
}

export const useProjections = ({
  globalHistoryData,
  ppkData,
  portfolioType,
  showProjection,
  showPPKProjection,
  projectionMethod
}: UseProjectionsProps) => {

  // --- OMF: Road to Million ---
  const omfProjection = useMemo(() => {
    if (!showProjection || globalHistoryData.length === 0) return globalHistoryData;
    const lastData = globalHistoryData[globalHistoryData.length - 1];
    if (!lastData || lastData.totalValue <= 0) return globalHistoryData;

    // 1. Growth Rate Calculation
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

    // 2. Generate Points
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
  }, [globalHistoryData, showProjection, projectionMethod]);

  const omfRates = useMemo(() => {
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

  // --- PPK: Road to Retirement ---
  const ppkProjection = useMemo(() => {
    if (portfolioType !== 'PPK' || !showPPKProjection || ppkData.length === 0) return ppkData;
    
    // Cast to PPKDataRow to access specific properties like totalValue and date
    const lastData = ppkData[ppkData.length - 1] as PPKDataRow;
    
    // Assumed 12% Annual Growth for Projection
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
