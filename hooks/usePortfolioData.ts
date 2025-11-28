
import { useMemo } from 'react';
import { PortfolioType, SummaryStats, AnyDataRow, ValidationReport, OMFValidationReport, OMFDataRow, GlobalHistoryRow, DividendDataRow } from '../types';
import { useDividends } from './useDividends';
import { useAssetPricing } from './useAssetPricing';
import { useGlobalHistory } from './useGlobalHistory';
import { usePortfolioStats } from './usePortfolioStats';

interface UsePortfolioDataProps {
  portfolioType: PortfolioType;
  onlinePrices: Record<string, number> | null;
  historyPrices: Record<string, number> | null;
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
  excludePPK = false 
}: UsePortfolioDataProps): UsePortfolioDataReturn => {
  
  // 1. Fetch Dividends
  const dividends = useDividends();

  // 2. Process Asset Pricing & Parsing
  const { 
    data, 
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

  // 3. Build Global History (Timeline)
  const globalHistoryData = useGlobalHistory({
    portfolioType,
    omfActiveAssets,
    omfClosedAssets,
    dividends,
    excludePPK
  });

  // 4. Calculate Summary Stats
  const stats = usePortfolioStats({
    portfolioType,
    globalHistoryData,
    omfActiveAssets,
    omfClosedAssets,
    data,
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
