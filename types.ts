

export type PortfolioType = 'PPK' | 'CRYPTO' | 'IKE' | 'OMF';

export interface PPKDataRow {
  date: string;
  dateObj: Date;
  employeeContribution: number;
  employerContribution: number;
  stateContribution: number;
  fundProfit: number; // Zysk z funduszu (CSV column)
  profit: number;     // Total User Profit (Total Value - Employee Contribution)
  tax: number;
  roi: number;
  exitRoi: number;
  totalValue: number; // Calculated field
}

export interface CryptoDataRow {
  date: string;
  dateObj: Date;
  investment: number; // Wkład
  profit: number; // Zysk
  roi: number;
  totalValue: number; // Calculated (Investment + Profit)
}

export interface IKEDataRow extends CryptoDataRow {
  // Same structure as Crypto for now
}

// New OMF Data Structure based on provided CSV
export interface OMFDataRow {
  status: string;       // Status pozycji (Otwarta, Zamknięta, etc.)
  portfolio: string;    // Portfel (PPK, IKE, Krypto, Gotówka)
  type: string;         // Typ (ETF, Akcje, etc.)
  symbol: string;       // Symbol (AMZN, BTC, PLN)
  sector: string;       // Sektor
  lastPurchaseDate: string; // Ostatni zakup
  investmentPeriod: string; // Okres inwestycji (dni/lata)
  quantity: number;     // Ilość
  currentValue: number; // Obecna wartośc
  purchaseValue: number;// Wartośc zakupu
  profit: number;       // Zysk/Strata
  roi: number;          // ROI
}

// Structure for Global History Aggregation
export interface GlobalHistoryRow {
  date: string;
  investment: number;
  profit: number;
  totalValue: number;
  roi: number;
  cumulativeTwr: number;
  ppkShare: number;
  cryptoShare: number;
  ikeShare: number;
}

// Union type for general usage in tables/charts where applicable
export type AnyDataRow = PPKDataRow | CryptoDataRow | IKEDataRow | OMFDataRow | GlobalHistoryRow;

export interface SummaryStats {
  totalValue: number;
  totalProfit: number;
  currentRoi: number;
  profitTrend?: number; // Month-over-Month profit trend
  
  // Performance Metrics
  cagr?: number;
  ltm?: number; // Last Twelve Months
  ytd?: number; // Year To Date

  // PPK Specific
  totalEmployee?: number;
  totalEmployer?: number;
  totalState?: number;
  currentExitRoi?: number;
  // Crypto/IKE Specific
  totalInvestment?: number;
}

export interface ValidationReport {
  isValid: boolean;
  source?: 'Online' | 'Offline'; // Source of data (Google Sheets vs Local TS)
  checks: {
    structure: boolean; // Headers and column count
    dataTypes: boolean; // Number and Date parsing
    logic: boolean;     // Sanity checks (e.g. positive values where expected)
  };
  errors: string[];
  stats: {
    totalRows: number;
    validRows: number;
  };
}

// Updated OMF Validation Report for the new logic
export interface OMFValidationReport {
  isConsistent: boolean;
  source?: 'Online' | 'Offline'; // Added source field
  checks: {
    structure: boolean;
    mathIntegrity: boolean; // Purchase + Profit == Current
  };
  messages: string[];
  stats: {
    totalAssets: number;
    openAssets: number;
    closedAssets: number;
  };
}