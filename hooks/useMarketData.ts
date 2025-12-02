
import { useState, useEffect, useCallback } from 'react';
import { parseCurrency } from '../utils/parser';
import { SP500_BACKUP, WIG20_BACKUP } from '../constants/benchmarks';

const PRICES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7p1b_z69_W5vbjwuA-FI_1J2FOPU-iPTXNwOyVkO_NCr7DJ6SPgyn1n2lnK8_fqPMU3mhZonDhR5U/pub?gid=194990672&single=true&output=csv';
const HISTORY_PRICES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7p1b_z69_W5vbjwuA-FI_1J2FOPU-iPTXNwOyVkO_NCr7DJ6SPgyn1n2lnK8_fqPMU3mhZonDhR5U/pub?gid=1067187811&single=true&output=csv';
const BENCHMARKS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7p1b_z69_W5vbjwuA-FI_1J2FOPU-iPTXNwOyVkO_NCr7DJ6SPgyn1n2lnK8_fqPMU3mhZonDhR5U/pub?gid=2132851861&single=true&output=csv';

export interface MarketDataState {
  onlinePrices: Record<string, number> | null;
  historyPrices: Record<string, number> | null;
  benchmarks: { sp500: Record<string, number>; wig20: Record<string, number> } | null;
  pricingMode: 'Offline' | 'Online';
  isRefreshing: boolean;
  fetchPrices: () => Promise<void>;
}

export const useMarketData = (): MarketDataState => {
  const [onlinePrices, setOnlinePrices] = useState<Record<string, number> | null>(null);
  const [historyPrices, setHistoryPrices] = useState<Record<string, number> | null>(null);
  const [benchmarks, setBenchmarks] = useState<{ sp500: Record<string, number>; wig20: Record<string, number> } | null>(null);
  const [pricingMode, setPricingMode] = useState<'Offline' | 'Online'>('Offline');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPrices = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const timestamp = Date.now();
      
      // 1. Fetch Benchmarks (Fail-safe)
      let benchmarkData = null;
      try {
          const benchmarkRes = await fetch(`${BENCHMARKS_CSV_URL}&t=${timestamp}`);
          if (benchmarkRes.ok) {
              const text = await benchmarkRes.text();
              const cleanText = text.replace(/^\uFEFF/, '');
              const lines = cleanText.trim().split('\n');
              
              const sp500: Record<string, number> = {};
              const wig20: Record<string, number> = {};

              lines.forEach((line) => {
                  const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                  if (parts.length >= 2) {
                      const date1Raw = parts[0]?.trim().replace(/^"|"$/g, '');
                      const val1Raw = parts[1]?.trim().replace(/^"|"$/g, '');
                      const date1 = date1Raw ? new Date(date1Raw) : null;
                      const val1 = parseCurrency(val1Raw);
                      if (date1 && !isNaN(date1.getTime()) && !isNaN(val1)) {
                          sp500[date1.toISOString().split('T')[0]] = val1;
                      }
                  }
                  if (parts.length >= 4) {
                      const date2Raw = parts[2]?.trim().replace(/^"|"$/g, '');
                      const val2Raw = parts[3]?.trim().replace(/^"|"$/g, '');
                      const date2 = date2Raw ? new Date(date2Raw) : null;
                      const val2 = parseCurrency(val2Raw);
                      if (date2 && !isNaN(date2.getTime()) && !isNaN(val2)) {
                          wig20[date2.toISOString().split('T')[0]] = val2;
                      }
                  }
              });
              benchmarkData = { sp500, wig20 };
          }
      } catch (err) {
          console.warn("Benchmark fetch failed, will use backup.");
      }

      // Use Backup if online fetch failed or returned empty
      if (!benchmarkData || Object.keys(benchmarkData.sp500).length === 0) {
          console.log("Using Backup Benchmark Data");
          benchmarkData = { sp500: SP500_BACKUP, wig20: WIG20_BACKUP };
      }
      setBenchmarks(benchmarkData);

      // 2. Fetch Prices (Core)
      const [currentRes, historyRes] = await Promise.all([
        fetch(`${PRICES_CSV_URL}&t=${timestamp}`),
        fetch(`${HISTORY_PRICES_CSV_URL}&t=${timestamp}`)
      ]);

      const parseOnlinePriceCsv = async (response: Response): Promise<{ prices: Record<string, number>, totalRows: number }> => {
        if (!response.ok) return { prices: {}, totalRows: 0 };
        const text = await response.text();
        const cleanText = text.replace(/^\uFEFF/, '');
        const lines = cleanText.trim().split('\n');
        const prices: Record<string, number> = {};
        
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
      // Ensure benchmarks are set even if main price fetch fails entirely
      if (!benchmarks) {
          setBenchmarks({ sp500: SP500_BACKUP, wig20: WIG20_BACKUP });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { onlinePrices, historyPrices, benchmarks, pricingMode, isRefreshing, fetchPrices };
};
