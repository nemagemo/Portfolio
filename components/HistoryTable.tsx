
import React from 'react';
import { AnyDataRow, OMFDataRow, PortfolioType } from '../types';
import { AssetsTable } from './tables/AssetsTable';
import { TimeSeriesTable } from './tables/TimeSeriesTable';

interface HistoryTableProps {
  data: AnyDataRow[];
  type: PortfolioType;
  omfVariant?: 'active' | 'closed';
  title?: string;
  themeMode?: 'light' | 'comic' | 'neon' | 'dark';
}

/**
 * FACADE COMPONENT
 * ================
 * This component now delegates rendering to specialized components:
 * 1. AssetsTable: For OMF snapshots (Active/Closed assets)
 * 2. TimeSeriesTable: For historical data (PPK, IKE, Crypto timelines)
 */
export const HistoryTable: React.FC<HistoryTableProps> = ({ 
  data, 
  type, 
  omfVariant = 'active', 
  title, 
  themeMode = 'light' 
}) => {
  
  if (type === 'OMF') {
    return (
      <AssetsTable 
        data={data as OMFDataRow[]} 
        variant={omfVariant} 
        title={title} 
        themeMode={themeMode} 
      />
    );
  }

  return (
    <TimeSeriesTable 
      data={data} 
      type={type} 
      themeMode={themeMode} 
    />
  );
};