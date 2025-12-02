
import { useMemo } from 'react';
import { OMFDataRow, GlobalHistoryRow, PortfolioType, DividendDataRow } from '../types';

interface UseChartTransformationsProps {
  omfActiveAssets: OMFDataRow[];
  portfolioType: PortfolioType;
  globalHistoryData: GlobalHistoryRow[];
}

export const useChartTransformations = ({
  omfActiveAssets,
  portfolioType,
  globalHistoryData
}: UseChartTransformationsProps) => {

  // --- TREEMAP DATA (Structure) ---
  const omfStructureData = useMemo(() => {
    if (portfolioType !== 'OMF' || !omfActiveAssets.length) return [];
    const groups: Record<string, any[]> = {};
    let cryptoRestVal = 0, cryptoRestPurch = 0;
    let aggregatedCashVal = 0;

    omfActiveAssets.forEach(a => {
      // AGGREGATION LOGIC: Sum PLN and PLN-IKE into one variable
      if (a.symbol === 'PLN' || a.symbol === 'PLN-IKE') {
        aggregatedCashVal += a.currentValue;
        return;
      }

      let p = a.portfolio || 'Inne';
      
      if (p.toUpperCase().includes('KRYPTO') && a.currentValue < 1000) {
         cryptoRestVal += a.currentValue;
         cryptoRestPurch += a.purchaseValue;
      } else {
         if (!groups[p]) groups[p] = [];
         groups[p].push({ name: a.symbol, value: a.currentValue, roi: a.roi, portfolio: p });
      }
    });

    // Add "Reszta Krypto" Tile
    if (cryptoRestVal > 0) {
       const aggRoi = cryptoRestPurch > 0 ? ((cryptoRestVal - cryptoRestPurch)/cryptoRestPurch)*100 : 0;
       if (!groups['Krypto']) groups['Krypto'] = [];
       groups['Krypto'].push({ name: 'Reszta Krypto', value: cryptoRestVal, roi: aggRoi, portfolio: 'Krypto' });
    }

    // Add Aggregated "PLN" Tile to "Gotówka" Group
    if (aggregatedCashVal > 0) {
        if (!groups['Gotówka']) groups['Gotówka'] = [];
        groups['Gotówka'].push({ name: 'PLN', value: aggregatedCashVal, roi: 0, portfolio: 'Gotówka' });
    }

    const ORDER = ['PPK', 'IKE', 'Krypto', 'Gotówka'];
    return Object.keys(groups).map(key => ({
      name: key,
      children: groups[key].sort((a, b) => b.value - a.value)
    })).sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
  }, [omfActiveAssets, portfolioType]);

  // --- BUBBLE CHART DATA (Daily Change) ---
  const dailyChangeData = useMemo(() => {
    if (portfolioType !== 'OMF' || !omfActiveAssets.length) return [];
    const groups: Record<string, any[]> = {};
    let cryptoRestNow = 0, cryptoRestPrev = 0;
    let aggregatedCashNow = 0;

    omfActiveAssets.forEach(a => {
        if (a.symbol === 'PLN' || a.symbol === 'PLN-IKE') {
            aggregatedCashNow += a.currentValue;
            return;
        }

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

    if (aggregatedCashNow > 0) {
        if (!groups['Gotówka']) groups['Gotówka'] = [];
        groups['Gotówka'].push({ name: 'PLN', size: aggregatedCashNow, change24h: 0, portfolio: 'Gotówka' });
    }

    const ORDER = ['PPK', 'IKE', 'Krypto', 'Gotówka'];
    return Object.keys(groups).map(key => ({
        name: key,
        children: groups[key].sort((a, b) => b.size - a.size)
    })).sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
  }, [omfActiveAssets, portfolioType]);

  // --- HEATMAP DATA (Calendar) ---
  const heatmapHistoryData = useMemo(() => {
     if (portfolioType !== 'OMF') return [];
     return globalHistoryData.map(r => ({
        date: r.date,
        // ALWAYS use the calculated NoPPK values for the heatmap to show Active Management performance
        investment: r.investmentNoPPK || 0,
        profit: r.profitNoPPK || 0,
        totalValue: r.totalValueNoPPK || 0
     }));
  }, [globalHistoryData, portfolioType]);

  // --- DRAWDOWN DATA (Risk Analysis) ---
  const drawdownHistoryData = useMemo(() => {
    if (portfolioType !== 'OMF' || globalHistoryData.length === 0) return [];
    
    let maxPeakTotal = 0;
    let maxPeakNoPPK = 0;
    
    return globalHistoryData.map(row => {
        // 1. Total Drawdown
        if (row.totalValue > maxPeakTotal) {
            maxPeakTotal = row.totalValue;
        }
        const drawdownTotal = maxPeakTotal > 0 ? ((row.totalValue - maxPeakTotal) / maxPeakTotal) * 100 : 0;
        
        // 2. No PPK Drawdown (Active Management Risk)
        const valNoPPK = row.totalValueNoPPK || 0;
        if (valNoPPK > maxPeakNoPPK) {
            maxPeakNoPPK = valNoPPK;
        }
        const drawdownNoPPK = maxPeakNoPPK > 0 ? ((valNoPPK - maxPeakNoPPK) / maxPeakNoPPK) * 100 : 0;

        return {
            date: row.date,
            drawdownTotal: drawdownTotal,
            drawdownNoPPK: drawdownNoPPK,
            value: row.totalValue,
            valueNoPPK: valNoPPK
        };
    });
  }, [globalHistoryData, portfolioType]);

  // --- SECTOR ALLOCATION DATA ---
  const sectorAllocationData = useMemo(() => {
    if (portfolioType !== 'OMF' || !omfActiveAssets.length) return [];
    
    const sectorMap: Record<string, number> = {};
    let totalVal = 0;

    omfActiveAssets.forEach(asset => {
        if (asset.portfolio === 'Gotówka') return; // Optionally exclude cash

        let sectorName = asset.sector;
        
        // Normalize empty sectors based on portfolio type
        if (!sectorName) {
            if (asset.portfolio === 'PPK') sectorName = 'Emerytalne / Zdefiniowana Data';
            else if (asset.portfolio.toUpperCase().includes('KRYPTO')) sectorName = 'Digital Assets (Krypto)';
            else sectorName = 'Inne / Nieokreślony';
        }

        sectorMap[sectorName] = (sectorMap[sectorName] || 0) + asset.currentValue;
        totalVal += asset.currentValue;
    });

    return Object.entries(sectorMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // Sort descending by size

  }, [omfActiveAssets, portfolioType]);

  // --- BEST CRYPTO FINDER ---
  const bestCrypto = useMemo(() => {
    if (portfolioType !== 'CRYPTO') return null;
    return omfActiveAssets
      .filter(a => a.portfolio.toUpperCase().includes('KRYPTO'))
      .sort((a, b) => b.profit - a.profit)[0];
  }, [portfolioType, omfActiveAssets]);

  return {
    omfStructureData,
    dailyChangeData,
    heatmapHistoryData,
    drawdownHistoryData,
    sectorAllocationData,
    bestCrypto
  };
};

// --- Separate Hook for Dividends Grouping ---
export const useDividendGrouping = (dividends: DividendDataRow[], viewMode: 'Yearly' | 'Quarterly') => {
    return useMemo(() => {
        const ikeDividends = dividends.filter(d => d.portfolio === 'IKE');
        const grouped: Record<string, number> = {};
    
        ikeDividends.forEach(d => {
           let key = '';
           if (viewMode === 'Yearly') {
              key = d.dateObj.getFullYear().toString();
           } else {
              const q = Math.floor(d.dateObj.getMonth() / 3) + 1;
              const y = d.dateObj.getFullYear().toString().slice(-2);
              key = `Q${q} '${y}`;
           }
           grouped[key] = (grouped[key] || 0) + d.value;
        });
    
        return Object.entries(grouped)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => {
                if (viewMode === 'Yearly') return a.label.localeCompare(b.label);
                const yearA = parseInt(a.label.split("'")[1]);
                const yearB = parseInt(b.label.split("'")[1]);
                if (yearA !== yearB) return yearA - yearB;
                return a.label.localeCompare(b.label);
            });
      }, [dividends, viewMode]);
};
