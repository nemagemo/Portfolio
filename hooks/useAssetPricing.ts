


import { useState, useEffect } from 'react';
import { 
  AnyDataRow, ValidationReport, OMFValidationReport, OMFDataRow, 
  PortfolioType, IKEDataRow, CryptoDataRow, DividendDataRow 
} from '../types';
import { parseCSV, validateOMFIntegrity } from '../utils/parser';
import { FALLBACK_PRICES } from '../constants/fallbackPrices';

// Import Data Sources
import { PPK_DATA } from '../CSV/PPK';
import { KRYPTO_DATA } from '../CSV/Krypto';
import { IKE_DATA } from '../CSV/IKE';
import { OMF_OPEN_DATA } from '../CSV/OMFopen';
import { OMF_CLOSED_DATA } from '../CSV/OMFclosed';
import { CASH_DATA } from '../CSV/Cash';

interface UseAssetPricingProps {
  portfolioType: PortfolioType;
  onlinePrices: Record<string, number> | null;
  historyPrices: Record<string, number> | null;
  dividends: DividendDataRow[];
}

/**
 * useAssetPricing Hook
 * ====================
 * Responsible for the "Now" state of the portfolio.
 * 
 * Logic Flow:
 * 1. Parse CSV files (OMF Open/Closed).
 * 2. Apply Pricing Strategy:
 *    - IF Online Price exists -> Use it (Live Mode)
 *    - ELSE IF Fallback Price exists -> Use it (Offline Mode)
 *    - ELSE -> Use value from CSV (Snapshot Mode)
 * 3. Validate Integrity:
 *    - Cross-check sum of assets vs historical records (IKE.ts, Krypto.ts).
 */
export const useAssetPricing = ({ portfolioType, onlinePrices, historyPrices, dividends }: UseAssetPricingProps) => {
  const [data, setData] = useState<AnyDataRow[]>([]);
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
  };

  useEffect(() => {
    try {
      if (portfolioType === 'OMF') {
        const openRes = parseCSV(csvSources.OMF_OPEN, 'OMF', 'Offline');
        let omfOpenRows = openRes.data as OMFDataRow[];
        const closedRes = parseCSV(csvSources.OMF_CLOSED, 'OMF', 'Offline');
        const omfClosedRows = closedRes.data as OMFDataRow[];

        // --- Revaluation Logic ---
        omfOpenRows = omfOpenRows.map(row => {
            if (row.status !== 'Otwarta' && row.status !== 'Gotówka') return row;

            const symbolKey = row.symbol.toUpperCase();
            let finalPrice: number | undefined = undefined;
            let isLivePrice = false;

            // Priority 1: Online Price (Google Sheets)
            if (onlinePrices && onlinePrices[symbolKey] > 0) {
                finalPrice = onlinePrices[symbolKey];
                isLivePrice = true;
            } 
            // Priority 2: Fallback Price (Hardcoded in constants/fallbackPrices.ts)
            else if (FALLBACK_PRICES[symbolKey] > 0) {
                finalPrice = FALLBACK_PRICES[symbolKey];
                isLivePrice = false;
            }
            
            // If we found a valid price (Online or Fallback), recalculate current value.
            if (finalPrice !== undefined && finalPrice > 0) {
                let newCurrentValue = 0;
                if (row.quantity > 0) {
                    newCurrentValue = row.quantity * finalPrice;
                } else {
                    newCurrentValue = finalPrice;
                }
                
                const newProfit = newCurrentValue - row.purchaseValue;
                const newRoi = row.purchaseValue > 0 ? (newProfit / row.purchaseValue) * 100 : 0;

                // Calculate 24h Change if history is available
                let change24h = undefined;
                if (isLivePrice) {
                    const prevPrice = historyPrices?.[symbolKey];
                    if (prevPrice && prevPrice > 0) {
                        change24h = ((finalPrice - prevPrice) / prevPrice) * 100;
                    }
                }

                return {
                    ...row,
                    change24h, 
                    currentValue: newCurrentValue,
                    profit: newProfit,
                    roi: parseFloat(newRoi.toFixed(2)),
                    isLivePrice
                } as OMFDataRow;
            }
            
            // Fallback to CSV values if no pricing available
            return { ...row, isLivePrice: false, change24h: undefined };
        });

        const combinedData = [...omfOpenRows, ...omfClosedRows];
        const integrity = validateOMFIntegrity(combinedData, 'Offline');
        
        // --- CROSS-CHECK: Validate History vs Snapshot Integrity ---
        // This ensures that the historical data files (IKE.ts, Krypto.ts) match the mathematical reality
        // derived from the individual asset purchase history.
        const ikeHistoryRaw = parseCSV(csvSources.IKE, 'IKE', 'Offline').data as IKEDataRow[];
        const cryptoHistoryRaw = parseCSV(csvSources.CRYPTO, 'CRYPTO', 'Offline').data as CryptoDataRow[];
        
        // IKE Integrity Check
        const openIKE = omfOpenRows.filter(r => r.portfolio === 'IKE').reduce((sum, r) => sum + r.purchaseValue, 0);
        const closedIKE = omfClosedRows.filter(r => r.portfolio === 'IKE').reduce((sum, r) => sum + r.profit, 0);
        const divsIKE = dividends.filter(d => d.portfolio === 'IKE' && d.isCounted).reduce((sum, r) => sum + r.value, 0);
        
        // Theoretical Invested = Purchase Cost (Open) - Profits Taken (Closed) - Dividends (Reinvested)
        const calcIKE = openIKE - closedIKE - divsIKE;

        if (ikeHistoryRaw.length > 0) {
            const lastRecIKE = ikeHistoryRaw[ikeHistoryRaw.length - 1].investment;
            if (Math.abs(lastRecIKE - calcIKE) > 5.00) {
                integrity.isConsistent = false;
                integrity.messages.push(`Niespójność Historii IKE: Wpisano ${lastRecIKE.toFixed(2)}, wyliczono ${calcIKE.toFixed(2)} (Różnica: ${(lastRecIKE - calcIKE).toFixed(2)}). Sprawdź CSV/IKE.ts.`);
            }
        }

        // Crypto Integrity Check
        const openCrypto = omfOpenRows.filter(r => r.portfolio === 'Krypto').reduce((sum, r) => sum + r.purchaseValue, 0);
        const closedCrypto = omfClosedRows.filter(r => r.portfolio === 'Krypto').reduce((sum, r) => sum + r.profit, 0);
        const calcCrypto = openCrypto - closedCrypto;

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

      } else if (portfolioType !== 'DIVIDENDS') {
        // Standard Portfolios (PPK, IKE History, etc.)
        const sourceData = csvSources[portfolioType as keyof typeof csvSources];
        if (sourceData) {
            const result = parseCSV(sourceData, portfolioType, 'Offline');
            setData(result.data);
            setReport(result.report);
            setOmfReport(null);
        }
      }
    } catch (e) {
      console.error("Failed to parse/price CSV assets", e);
    }
  }, [portfolioType, onlinePrices, historyPrices, dividends]);

  return {
    data,
    report,
    omfReport,
    omfActiveAssets,
    omfClosedAssets
  };
};