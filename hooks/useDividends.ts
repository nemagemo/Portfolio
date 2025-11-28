
import { useMemo } from 'react';
import { parseCSV } from '../utils/parser';
import { DIVIDENDS_DATA } from '../CSV/Dividends';
import { DividendDataRow } from '../types';

export const useDividends = () => {
  const dividends = useMemo(() => {
    try {
      const divRes = parseCSV(DIVIDENDS_DATA, 'DIVIDENDS', 'Offline');
      return divRes.data as DividendDataRow[];
    } catch (e) {
      console.error("Failed to parse Dividends", e);
      return [];
    }
  }, []);

  return dividends;
};
