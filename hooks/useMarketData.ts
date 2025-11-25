
import { useState, useEffect, useCallback } from 'react';
import { parseCurrency } from '../utils/parser';

const PRICES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7p1b_z69_W5vbjwuA-FI_1J2FOPU-iPTXNwOyVkO_NCr7DJ6SPgyn1n2lnK8_fqPMU3mhZonDhR5U/pub?gid=194990672&single=true&output=csv';
const HISTORY_PRICES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7p1b_z69_W5vbjwuA-FI_1J2FOPU-iPTXNwOyVkO_NCr7DJ6SPgyn1n2lnK8_fqPMU3mhZonDhR5U/pub?gid=1067187811&single=true&output=csv';

export interface MarketDataState {
  onlinePrices: Record<string, number> | null;
  historyPrices: Record<string, number> | null;
  pricingMode: 'Offline' | 'Online';
  isRefreshing: boolean;
  fetchPrices: () => Promise<void>;
}

export const useMarketData = (): MarketDataState => {
  const [onlinePrices, setOnlinePrices] = useState<Record<string, number> | null>(null);
  const [historyPrices, setHistoryPrices] = useState<Record<string, number> | null>(null);
  const [pricingMode, setPricingMode] = useState<'Offline' | 'Online'>('Offline');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPrices = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const timestamp = Date.now();
      const [currentRes, historyRes] = await Promise.all([
        fetch(`${PRICES_CSV_URL}&t=${timestamp}`),
        fetch(`${HISTORY_PRICES_CSV_URL}&t=${timestamp}`)
      ]);

      const parseOnlinePriceCsv = async (response: Response): Promise<{ prices: Record<string, number>, totalRows: number }> => {
        if (!response.ok) return { prices: {}, totalRows: 0 };
        const text = await response.text();
        const cleanText = text.replace(/^\uFEFF/, ''); // Remove BOM
        const lines = cleanText.trim().split('\n');
        const prices: Record<string, number> = {};
        
        // Calculate potential rows (excluding header) based on non-empty lines
        const dataLines = lines.filter((l, idx) => idx > 0 && l.trim().length > 0);
        const totalRows = dataLines.length;

        lines.forEach((line, idx) => {
           if (idx === 0 && line.toLowerCase().includes('symbol')) return;
           const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
           if (parts.length >= 2) {
              const symbol = parts[0].trim().replace(/^"|"$/g, '').toUpperCase();
              const priceStr = parts[1].trim().replace(/^"|"$/g, '');
              const price = parseCurrency(priceStr);
              if (!isNaN(price) && price > 0) {
                 prices[symbol] = price;
              }
           }
        });
        return { prices, totalRows };
      };

      const currentData = await parseOnlinePriceCsv(currentRes);
      const historyData = await parseOnlinePriceCsv(historyRes);

      const validCount = Object.keys(currentData.prices).length;
      const totalRows = currentData.totalRows;

      // Threshold Logic:
      // We enable Online mode ONLY if we successfully fetched prices for MORE THAN HALF of the assets in the sheet.
      // If totalRows is 0, we treat it as offline.
      const isQualityData = totalRows > 0 && validCount > (totalRows / 2);

      if (isQualityData) {
         setOnlinePrices(currentData.prices);
         setHistoryPrices(historyData.prices);
         setPricingMode('Online');
      } else {
         console.warn(`Insufficient data for Online mode. Fetched ${validCount}/${totalRows} prices. Switching to Offline.`);
         setPricingMode('Offline');
      }
    } catch (err) {
      console.warn("Could not fetch online prices, using fallback/offline mode.", err);
      setPricingMode('Offline');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { onlinePrices, historyPrices, pricingMode, isRefreshing, fetchPrices };
};
