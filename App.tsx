
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Building2, 
  Landmark, 
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Coins,
  Briefcase,
  PiggyBank,
  LayoutGrid,
  Lock,
  Scale,
  Banknote,
  PieChart,
  Activity,
  BarChart3,
  CalendarDays,
  Percent,
  BarChart4,
  Timer,
  Calendar,
  LayoutTemplate,
  Milestone,
  Snowflake,
  ArrowUpRight,
  DoorOpen,
  Search,
  Palette,
  Sun,
  Zap,
  PenTool,
  Trophy,
  Wifi,
  WifiOff
} from 'lucide-react';
import { parseCSV, validateOMFIntegrity, parseCurrency } from './utils/parser';
import { AnyDataRow, SummaryStats, ValidationReport, PortfolioType, PPKDataRow, CryptoDataRow, IKEDataRow, OMFValidationReport, OMFDataRow, GlobalHistoryRow } from './types';
import { StatsCard } from './components/StatsCard';
import { ValueCompositionChart, ROIChart, ContributionComparisonChart, CryptoValueChart, OMFAllocationChart, GlobalSummaryChart, GlobalPerformanceChart, OMFStructureChart, OMFTreemapChart, PortfolioAllocationHistoryChart, CapitalStructureHistoryChart, SeasonalityChart } from './components/Charts';
import { HistoryTable } from './components/HistoryTable';
import { ReturnsHeatmap } from './components/ReturnsHeatmap';

// Import local data
import { PPK_DATA } from './CSV/PPK';
import { KRYPTO_DATA } from './CSV/Krypto';
import { IKE_DATA } from './CSV/IKE';
import { OMF_DATA } from './CSV/OMF';
// Import global settings
import { DATA_LAST_UPDATED } from './constants/appData';
// Import benchmarks & inflation
import { SP500_DATA, WIG20_DATA } from './constants/benchmarks';
import { CPI_DATA } from './constants/inflation';
// Import Fallback Prices
import { FALLBACK_PRICES } from './constants/fallbackPrices';

// --- CONFIGURATION ---
const PRICES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7p1b_z69_W5vbjwuA-FI_1J2FOPU-iPTXNwOyVkO_NCr7DJ6SPgyn1n2lnK8_fqPMU3mhZonDhR5U/pub?gid=194990672&single=true&output=csv';

/**
 * ============================================================================
 * ARCHITECTURAL CONTEXT FOR AI DEVELOPERS & MAINTAINERS
 * ============================================================================
 * 
 * 1. DATA SOURCE: HYBRID (OFFLINE + ONLINE PRICES)
 *    - Transaction History & Quantities are loaded from local .ts files (CSV/OMF.ts).
 *    - Current Prices are fetched from a Google Sheets CSV URL.
 *    - If Online fetch fails, we fall back to `fallbackPrices.ts` and finally to the values in `OMF.ts`.
 * 
 * 2. PARSING LOGIC: ROBUST & AGGRESSIVE
 *    The `utils/parser.ts` contains very aggressive regex to clean currency strings.
 * 
 * 3. CALCULATIONS: REAL-TIME REVALUATION
 *    The App recalculates `Current Value`, `Profit`, and `ROI` for every asset based on
 *    the latest available price (Online > Fallback > Local CSV).
 */

// Custom Icon for "No PPK"
const NoPPKIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 34 14" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="11.5" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="1px">PPK</text>
    <line x1="2" y1="7" x2="32" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Custom Icon for "Tax Toggle"
const TaxToggleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="10" x2="15" y2="16" />
    <circle cx="10.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="13.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// --- THEME DEFINITIONS ---
type Theme = 'light' | 'comic' | 'neon';

const themeStyles: Record<Theme, {
  appBg: string;
  text: string;
  textSub: string;
  headerBg: string;
  headerBorder: string;
  cardContainer: string;
  cardHeaderIconBg: string;
  buttonActive: string;
  buttonInactive: string;
  // Specific Toggle Colors
  toggleProjectionActive: string;
  toggleCPIActive: string;
  toggleNoPPKActive: string;
}> = {
  light: {
    appBg: 'bg-slate-50',
    text: 'text-slate-900 font-sans',
    textSub: 'text-slate-500',
    headerBg: 'bg-white',
    headerBorder: 'border-slate-200',
    cardContainer: 'bg-white rounded-xl shadow-sm border border-slate-200',
    cardHeaderIconBg: 'bg-slate-50 border border-slate-100',
    buttonActive: 'bg-slate-800 text-white shadow-sm',
    buttonInactive: 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200',
    // Specifics
    toggleProjectionActive: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200',
    toggleCPIActive: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-200',
    toggleNoPPKActive: 'bg-slate-100 text-slate-800 border-slate-300 ring-1 ring-slate-300',
  },
  comic: {
    appBg: 'bg-yellow-50',
    text: 'text-black font-bold',
    textSub: 'text-black opacity-80 font-medium',
    headerBg: 'bg-white',
    headerBorder: 'border-black border-b-4',
    cardContainer: 'bg-white rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    cardHeaderIconBg: 'bg-yellow-300 border-2 border-black',
    buttonActive: 'bg-cyan-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black',
    buttonInactive: 'bg-white text-black border-2 border-black hover:bg-gray-100 font-bold',
    // Specifics
    toggleProjectionActive: 'bg-orange-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    toggleCPIActive: 'bg-pink-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    toggleNoPPKActive: 'bg-gray-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  },
  neon: {
    appBg: 'bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black',
    text: 'text-cyan-50 font-mono tracking-tight',
    textSub: 'text-cyan-600/80 font-mono',
    headerBg: 'bg-black/80 backdrop-blur-md',
    headerBorder: 'border-cyan-900/50 border-b',
    cardContainer: 'bg-black/40 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)] backdrop-blur-sm rounded-none',
    cardHeaderIconBg: 'bg-cyan-950/30 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    buttonActive: 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)] font-mono',
    buttonInactive: 'bg-black text-cyan-800 border border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700 font-mono',
    // Specifics
    toggleProjectionActive: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(250,204,21,0.3)]',
    toggleCPIActive: 'bg-pink-900/30 text-pink-400 border-pink-500/50 shadow-[0_0_10px_rgba(244,114,182,0.3)]',
    toggleNoPPKActive: 'bg-slate-800 text-slate-300 border-slate-500',
  }
};

const DataStatus: React.FC<{ report: ValidationReport, theme: Theme }> = ({ report, theme }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Compact success state
  if (report.isValid && report.errors.length === 0) {
    return null; // Handled by parent to group with OMF status
  }

  const isCritical = !report.isValid;
  const containerClass = themeStyles[theme].cardContainer;

  return (
    <div className={`${containerClass} p-4 mb-6 transition-all ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isCritical ? 'bg-rose-100' : 'bg-amber-100'}`}>
            {isCritical ? <XCircle className="text-rose-600 w-5 h-5" /> : <AlertTriangle className="text-amber-600 w-5 h-5" />}
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${isCritical ? 'text-rose-800' : 'text-amber-800'}`}>
              {isCritical ? 'Błąd weryfikacji danych' : 'Ostrzeżenia dotyczące danych'}
            </h3>
            <div className="flex space-x-4 text-xs mt-1 opacity-80">
              <span className="flex items-center">
                {report.checks.structure ? <CheckCircle2 size={12} className="mr-1 text-emerald-600"/> : <XCircle size={12} className="mr-1"/>} 
                Struktura
              </span>
              <span className="flex items-center">
                {report.checks.dataTypes ? <CheckCircle2 size={12} className="mr-1 text-emerald-600"/> : <XCircle size={12} className="mr-1"/>} 
                Formaty
              </span>
              <span className="flex items-center">
                {report.checks.logic ? <CheckCircle2 size={12} className="mr-1 text-emerald-600"/> : <XCircle size={12} className="mr-1"/>} 
                Logika
                {report.source && <span className="ml-1 font-bold opacity-75">• {report.source}</span>}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/50">
            {report.stats.validRows} / {report.stats.totalRows} wierszy
          </span>
          {expanded ? <ChevronUp size={18} className="opacity-50"/> : <ChevronDown size={18} className="opacity-50"/>}
        </div>
      </div>
      
      {expanded && report.errors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/5 text-xs font-mono">
          <p className="font-semibold mb-2 opacity-70">Log błędów:</p>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {report.errors.map((err, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-slate-700">
                <span className="mt-0.5">•</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const OMFIntegrityStatus: React.FC<{ report: OMFValidationReport, theme: Theme }> = ({ report, theme }) => {
  const [expanded, setExpanded] = useState(false);
  const isPerfect = report.isConsistent && report.messages.length === 0;
  const isCritical = !report.isConsistent;
  const containerClass = themeStyles[theme].cardContainer;

  // Compact success state
  if (isPerfect) {
    return null; // Handled by parent
  }

  return (
    <div className={`${containerClass} p-4 mb-6 transition-all shadow-sm ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
       <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
         <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isCritical ? 'bg-rose-100' : 'bg-amber-100'}`}>
              <Scale className={`${isCritical ? 'text-rose-600' : 'text-amber-600'} w-5 h-5`} />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isCritical ? 'text-rose-800' : 'text-amber-800'}`}>
                {isCritical ? 'Błąd spójności OMF' : 'Uwagi do spójności OMF'}
              </h3>
              <div className="flex space-x-4 text-xs mt-1 opacity-80 text-slate-700">
                 <span className="flex items-center">
                    {report.checks.structure ? <CheckCircle2 size={12} className="mr-1 text-emerald-600"/> : <XCircle size={12} className="mr-1 text-rose-600"/>}
                    Struktura
                 </span>
                 <span className="flex items-center">
                    {report.checks.mathIntegrity ? <CheckCircle2 size={12} className="mr-1 text-emerald-600"/> : <AlertTriangle size={12} className="mr-1 text-amber-600"/>}
                    Logika
                    {report.source && <span className="ml-1 font-bold opacity-75">• {report.source}</span>}
                 </span>
              </div>
            </div>
         </div>
         {expanded ? <ChevronUp size={18} className="opacity-50"/> : <ChevronDown size={18} className="opacity-50"/>}
       </div>

       {expanded && (
         <div className="mt-4 pt-4 border-t border-black/5 text-xs">
            {report.messages.length > 0 && (
              <ul className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                {report.messages.map((msg, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-700 font-medium">
                    <span className="mt-0.5 text-rose-500">•</span>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="bg-white/50 p-2 rounded text-slate-600 font-mono text-[10px] sm:text-xs">
               <p>Statystyki Aktywów:</p>
               <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>Wszystkie: {report.stats.totalAssets}</div>
                  <div>Otwarte: {report.stats.openAssets}</div>
                  <div>Zamknięte: {report.stats.closedAssets}</div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export const App: React.FC = () => {
  const [portfolioType, setPortfolioType] = useState<PortfolioType>('OMF');
  const [theme, setTheme] = useState<Theme>('light');
  const styles = themeStyles[theme];
  
  // Use local TS data exclusively (OFFLINE MODE BASE)
  const [csvSources] = useState({
    PPK: PPK_DATA,
    CRYPTO: KRYPTO_DATA,
    IKE: IKE_DATA,
    OMF: OMF_DATA
  });

  // State for Online Pricing
  const [onlinePrices, setOnlinePrices] = useState<Record<string, number> | null>(null);
  const [pricingMode, setPricingMode] = useState<'Offline' | 'Online'>('Offline');

  const [data, setData] = useState<AnyDataRow[]>([]);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [omfReport, setOmfReport] = useState<OMFValidationReport | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  // OMF Data State
  const [omfActiveAssets, setOmfActiveAssets] = useState<OMFDataRow[]>([]);
  const [omfClosedAssets, setOmfClosedAssets] = useState<OMFDataRow[]>([]);
  const [isClosedHistoryExpanded, setIsClosedHistoryExpanded] = useState(false);
  const [isActivePositionsExpanded, setIsActivePositionsExpanded] = useState(false);

  // Road to Million State (OMF)
  const [showProjection, setShowProjection] = useState(false);
  const [projectionMethod, setProjectionMethod] = useState<'LTM' | 'CAGR'>('LTM');
  const [showCPI, setShowCPI] = useState(false);
  const [excludePPK, setExcludePPK] = useState(false);

  // Road to Retirement State (PPK)
  const [showPPKProjection, setShowPPKProjection] = useState(false);

  // IKE Tax Comparison State
  const [showTaxComparison, setShowTaxComparison] = useState(false);

  // --- EFFECT: Fetch Online Prices ---
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(PRICES_CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch prices');
        const text = await response.text();
        
        const lines = text.trim().split('\n');
        const prices: Record<string, number> = {};
        
        // Skip header if present, assume Symbol,Price format
        lines.forEach((line, idx) => {
           if (idx === 0 && line.toLowerCase().includes('symbol')) return;
           const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma, ignore quotes
           if (parts.length >= 2) {
              const symbol = parts[0].trim().replace(/^"|"$/g, '');
              const priceStr = parts[1].trim().replace(/^"|"$/g, '');
              const price = parseCurrency(priceStr);
              if (!isNaN(price) && price > 0) {
                 prices[symbol] = price;
              }
           }
        });

        if (Object.keys(prices).length > 0) {
           setOnlinePrices(prices);
           setPricingMode('Online');
        }
      } catch (err) {
        console.warn("Could not fetch online prices, using fallback/offline mode.", err);
        setPricingMode('Offline');
      }
    };

    fetchPrices();
  }, []);

  const handlePortfolioChange = (type: PortfolioType) => {
    setPortfolioType(type);
    // Force reset to dashboard when switching to prevent getting stuck in 'history' tab for portfolios that hide it
    setActiveTab('dashboard');
    // Reset Tax Toggle to avoid state bleeding between portfolios
    setShowTaxComparison(false);
  };

  useEffect(() => {
    try {
      // Universal Parse with Source Indication
      const result = parseCSV(csvSources[portfolioType], portfolioType, 'Offline');
      
      if (portfolioType === 'OMF') {
        // Special Handling for OMF
        let omfData = result.data as OMFDataRow[];
        
        // --- LIVE PRICING INJECTION ---
        // Use Online Prices if available, otherwise use Fallback Prices (Offline mode)
        const currentPricing = onlinePrices || FALLBACK_PRICES;
        const sourceLabel = onlinePrices ? 'Online' : 'Fallback';

        if (currentPricing) {
           omfData = omfData.map(row => {
              // Only reprice Active assets
              if (row.status !== 'Otwarta' && row.status !== 'Gotówka') return row;

              const price = currentPricing[row.symbol];
              
              // Special logic for PPK: If symbol matches "PPK", check if price > 1000 (Total Value) or < 1000 (Unit Price)
              // Simplification: Assume fallback/online map contains UNIT PRICE or TOTAL VALUE for PPK
              
              if (price !== undefined && price > 0) {
                 let newCurrentValue = 0;
                 
                 // Heuristic: If price is very close to row.currentValue, assume it's Total Value update
                 // If row has quantity > 0 and price is reasonable unit price, calculate.
                 // PPK row often has quantity ~45 and price ~178.
                 
                 if (row.quantity > 0) {
                    newCurrentValue = row.quantity * price;
                 } else {
                    // Fallback if quantity missing (e.g. raw total value tracking)
                    newCurrentValue = price;
                 }

                 // Recalculate Derived Stats
                 const newProfit = newCurrentValue - row.purchaseValue;
                 const newRoi = row.purchaseValue > 0 ? (newProfit / row.purchaseValue) * 100 : 0;

                 return {
                    ...row,
                    currentValue: newCurrentValue,
                    profit: newProfit,
                    roi: parseFloat(newRoi.toFixed(2))
                 };
              }
              return row;
           });
        }

        // Run OMF Integrity Check with Source
        const integrity = validateOMFIntegrity(omfData, 'Offline');
        
        // Standard Validation Report is also available from parseCSV, but we prioritize OMFIntegrity
        setOmfReport(integrity); 
        setReport(result.report); // Also keep basic parse report for structure errors

        // Filter Data
        const active = omfData.filter(r => r.status === 'Otwarta' || (r.status === 'Gotówka' && r.symbol === 'PLN'));
        const closed = omfData.filter(r => r.status === 'Zamknięta');
        
        setOmfActiveAssets(active);
        setOmfClosedAssets(closed);
        setData(omfData); // Full data for reference

      } else {
        // Standard Handling
        setData(result.data);
        setReport(result.report);
        setOmfReport(null);
      }

    } catch (e) {
      console.error("Failed to parse CSV", e);
      setReport({
        isValid: false,
        source: 'Offline',
        checks: { structure: false, dataTypes: false, logic: false },
        errors: ["Krytyczny błąd aplikacji podczas parsowania."],
        stats: { totalRows: 0, validRows: 0 }
      });
    }
  }, [csvSources, portfolioType, onlinePrices]); // Re-run when onlinePrices load

  // --- GLOBAL HISTORY DATA (For OMF Chart) ---
  // Merges PPK, Crypto, and IKE timelines
  const globalHistoryData = useMemo<GlobalHistoryRow[]>(() => {
    const ppkRes = parseCSV(csvSources.PPK, 'PPK', 'Offline');
    const cryptoRes = parseCSV(csvSources.CRYPTO, 'CRYPTO', 'Offline');
    const ikeRes = parseCSV(csvSources.IKE, 'IKE', 'Offline');

    const ppkData = ppkRes.data as PPKDataRow[];
    const cryptoData = cryptoRes.data as CryptoDataRow[];
    const ikeData = ikeRes.data as IKEDataRow[];

    // Create Map lookup for O(1) access by date
    const ppkMap = new Map<string, { inv: number, profit: number }>();
    ppkData.forEach(row => ppkMap.set(row.date, { 
      inv: row.totalValue - row.profit,
      profit: row.profit 
    }));

    const cryptoMap = new Map<string, { inv: number, profit: number }>();
    cryptoData.forEach(row => cryptoMap.set(row.date, { inv: row.investment, profit: row.profit }));

    const ikeMap = new Map<string, { inv: number, profit: number }>();
    ikeData.forEach(row => ikeMap.set(row.date, { inv: row.investment, profit: row.profit }));

    // Union of all dates across portfolios
    const allDates = new Set([...ppkMap.keys(), ...cryptoMap.keys(), ...ikeMap.keys()]);
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // State variables to hold "last known value" to fill gaps (Forward Fill logic)
    let lastPPK = { inv: 0, profit: 0 };
    let lastCrypto = { inv: 0, profit: 0 };
    let lastIKE = { inv: 0, profit: 0 };
    
    // Variables for Cumulative TWR Calculation (Strictly Crypto + IKE, No PPK)
    let twrProduct = 1;
    let prevTwrVal = 0;
    let prevTwrInv = 0;

    // Variable for Inflation Calculation
    let cumulativeInflation = 1.0;

    // Benchmarks Baseline
    let startSP500 = 0;
    let startWIG20 = 0;
    
    if (sortedDates.length > 0) {
       const firstDate = sortedDates[0];
       startSP500 = SP500_DATA[firstDate] || Object.values(SP500_DATA)[0];
       startWIG20 = WIG20_DATA[firstDate] || Object.values(WIG20_DATA)[0];
    }

    const history = sortedDates.map((date, index) => {
      if (ppkMap.has(date)) lastPPK = ppkMap.get(date)!;
      if (cryptoMap.has(date)) lastCrypto = cryptoMap.get(date)!;
      if (ikeMap.has(date)) lastIKE = ikeMap.get(date)!;

      // Apply Exclusion Logic for PPK
      // If excludePPK is true, we force PPK contribution to 0 for the current row logic
      const currentPPKInv = excludePPK ? 0 : lastPPK.inv;
      const currentPPKProfit = excludePPK ? 0 : lastPPK.profit;

      // Global Totals (Possibly Excluding PPK)
      const totalInvestment = currentPPKInv + lastCrypto.inv + lastIKE.inv;
      const totalProfit = currentPPKProfit + lastCrypto.profit + lastIKE.profit;
      const totalValue = totalInvestment + totalProfit;
      
      // --- Cumulative TWR Calculation (Strictly Crypto + IKE, No PPK) ---
      const currCrypto = cryptoMap.get(date) || lastCrypto;
      const currIKE = ikeMap.get(date) || lastIKE;
      
      const currTwrInv = currCrypto.inv + currIKE.inv;
      const currTwrProfit = currCrypto.profit + currIKE.profit;
      const currTwrVal = currTwrInv + currTwrProfit; // Total Value = Inv + Profit

      // Calculate period return
      if (index > 0) {
         const flow = currTwrInv - prevTwrInv;
         
         // TWR Assumption: Cash flows occur at the BEGINNING of the period (Flow at Start).
         const denominator = prevTwrVal + flow;
         
         if (denominator !== 0) {
             const gain = currTwrVal - prevTwrVal - flow;
             const r = gain / denominator;
             twrProduct *= (1 + r);
         }
      } else {
         // Handle first month (Index 0)
         if (currTwrInv > 0) {
             const r = currTwrProfit / currTwrInv;
             twrProduct *= (1 + r);
         }
      }

      prevTwrVal = currTwrVal;
      prevTwrInv = currTwrInv;

      // --- Real Value Calculation (Inflation Adjusted) ---
      // CPI_DATA is Month-over-Month.
      // If we are at date X, we apply the inflation that occurred *during* that month (or ending at that month).
      // We assume the portfolio starts at index 1.0 relative to start date.
      
      if (index > 0) {
         // Lookup inflation for this specific month
         // CPI_DATA keys map to the row date (e.g. "2023-04-01" has 0.7% inflation)
         const inflationRate = CPI_DATA[date] || 0;
         cumulativeInflation *= (1 + inflationRate);
      }
      
      const realTotalValue = totalValue / cumulativeInflation;

      // For Allocation Chart
      // If excludePPK is true, ppkVal should be 0 so it disappears from charts
      const ppkVal = excludePPK ? 0 : (lastPPK.inv + lastPPK.profit);
      const cryptoVal = lastCrypto.inv + lastCrypto.profit;
      const ikeVal = lastIKE.inv + lastIKE.profit;
      
      const sumVal = ppkVal + cryptoVal + ikeVal;

      // Benchmarks Calculation
      const [yStr, mStr, dStr] = date.split('-');
      let nextY = parseInt(yStr);
      let nextM = parseInt(mStr) + 1;
      if (nextM > 12) {
        nextM = 1;
        nextY++;
      }
      const nextDateKey = `${nextY}-${String(nextM).padStart(2, '0')}-${dStr}`;

      const currentSP500 = SP500_DATA[nextDateKey];
      const currentWIG20 = WIG20_DATA[nextDateKey];
      
      const sp500Return = currentSP500 && startSP500 ? ((currentSP500 - startSP500) / startSP500) * 100 : undefined;
      const wig20Return = currentWIG20 && startWIG20 ? ((currentWIG20 - startWIG20) / startWIG20) * 100 : undefined;

      return {
        date,
        investment: totalInvestment,
        profit: totalProfit,
        totalValue: totalValue, 
        realTotalValue, // Add this new calculated field
        roi: totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0,
        cumulativeTwr: (twrProduct - 1) * 100,
        
        ppkShare: sumVal > 0 ? ppkVal / sumVal : 0,
        cryptoShare: sumVal > 0 ? cryptoVal / sumVal : 0,
        ikeShare: sumVal > 0 ? ikeVal / sumVal : 0,

        sp500Return,
        wig20Return
      };
    });

    return history;
  }, [csvSources, excludePPK]); // Add excludePPK as dependency

  // Use global date constant
  const lastUpdateDate = DATA_LAST_UPDATED;

  // --- ROAD TO MILLION PROJECTION LOGIC (OMF) ---
  const chartDataWithProjection = useMemo(() => {
    if (!showProjection || globalHistoryData.length === 0) return globalHistoryData;

    const lastData = globalHistoryData[globalHistoryData.length - 1];
    if (!lastData) return globalHistoryData;

    // 1. Calculate Growth Rate based on selected method
    
    // LTM (Last Twelve Months) Average Monthly Growth
    // Look back 12 months
    let ltmMonthlyRate = 0.01; // Fallback 1%
    if (globalHistoryData.length >= 12) {
       const prevData = globalHistoryData[globalHistoryData.length - 12];
       const growthFactor = lastData.totalValue / prevData.totalValue;
       // (Final / Start)^(1/12) - 1
       ltmMonthlyRate = Math.pow(growthFactor, 1/12) - 1;
    } else {
       // Use All time if less than 12 months
       const firstData = globalHistoryData[0];
       if (firstData.totalValue > 0) {
          const months = globalHistoryData.length;
          const growthFactor = lastData.totalValue / firstData.totalValue;
          ltmMonthlyRate = Math.pow(growthFactor, 1/months) - 1;
       }
    }

    // 2. CAGR - FIXED 10% ANNUAL (Requested Update)
    let cagrMonthlyRate = 0.005; // Fallback

    // Fixed 10% Annual CAGR
    const annualCagrDecimal = 0.10;
    // Convert Annual CAGR to Monthly Compounding Rate: (1 + Annual)^(1/12) - 1
    cagrMonthlyRate = Math.pow(1 + annualCagrDecimal, 1/12) - 1;

    // Store rates for UI display
    
    const monthlyRate = projectionMethod === 'LTM' ? ltmMonthlyRate : cagrMonthlyRate;
    
    // If rate is negative or zero, projection is flat or downwards, handled gracefully
    // Only project if we have value
    if (lastData.totalValue <= 0) return globalHistoryData;

    const projectionPoints: GlobalHistoryRow[] = [];
    let currentValue = lastData.totalValue;
    let currentDate = new Date(lastData.date);
    const targetValue = 1000000;
    
    // Safety break: max 30 years (360 months)
    let iterations = 0;
    
    while (currentValue < targetValue && iterations < 360) {
       iterations++;
       // Increment Month
       currentDate.setMonth(currentDate.getMonth() + 1);
       
       // Compound Interest
       currentValue = currentValue * (1 + monthlyRate);
       
       // Generate Date String YYYY-MM-DD
       const y = currentDate.getFullYear();
       const m = String(currentDate.getMonth() + 1).padStart(2, '0');
       const d = String(currentDate.getDate()).padStart(2, '0');
       const dateStr = `${y}-${m}-${d}`;

       projectionPoints.push({
         date: dateStr,
         investment: 0, // Optional: Could project investment growth too, but let's keep simple
         profit: 0,
         totalValue: 0, // We don't fill historical bars
         projectedValue: currentValue,
         roi: 0,
         cumulativeTwr: 0,
         ppkShare: 0, cryptoShare: 0, ikeShare: 0
       });
    }

    // Add the starting point for the line (connect to last historical point)
    const connectionPoint = {
        ...lastData,
        projectedValue: lastData.totalValue
    };

    // Replace last point in history with connected point, append projection
    const historyWithConnection = [...globalHistoryData];
    historyWithConnection[historyWithConnection.length - 1] = connectionPoint;

    return [...historyWithConnection, ...projectionPoints];

  }, [globalHistoryData, showProjection, projectionMethod]);

  // Calculates display rates for the UI (OMF)
  const rateDisplay = useMemo(() => {
      if (globalHistoryData.length < 2) return { ltm: 0, cagr: 0 };
      
      const lastData = globalHistoryData[globalHistoryData.length - 1];
      const firstData = globalHistoryData[0];
      
      // LTM
      let ltmRate = 0;
      if (globalHistoryData.length >= 12) {
          const prev = globalHistoryData[globalHistoryData.length - 12];
          ltmRate = (Math.pow(lastData.totalValue / prev.totalValue, 1/12) - 1) * 100;
      } else {
          ltmRate = (Math.pow(lastData.totalValue / firstData.totalValue, 1/globalHistoryData.length) - 1) * 100;
      }

      // CAGR - FIXED 10% ANNUAL DISPLAY
      const annualCagr = 0.10;
      const cagrMonthly = (Math.pow(1 + annualCagr, 1/12) - 1) * 100;

      return { ltm: ltmRate, cagr: cagrMonthly };
  }, [globalHistoryData]);

  // --- ROAD TO RETIREMENT PROJECTION LOGIC (PPK) ---
  const ppkChartDataWithProjection = useMemo(() => {
    if (portfolioType !== 'PPK' || !showPPKProjection || data.length === 0) return data;

    const ppkData = data as PPKDataRow[];
    const lastData = ppkData[ppkData.length - 1];

    // Fixed Annual CAGR of 12% for Projection as requested (changed from 10%)
    const annualCagr = 0.12; 
    // Monthly Compounding Rate: (1 + 12%)^(1/12) - 1
    const monthlyRate = Math.pow(1 + annualCagr, 1/12) - 1;

    const projectionPoints: any[] = [];
    let currentValue = lastData.totalValue;
    let currentDate = new Date(lastData.date);
    const targetDate = new Date('2049-05-01');

    // Loop until May 2049
    while (currentDate < targetDate) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentValue = currentValue * (1 + monthlyRate);

        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        projectionPoints.push({
            date: dateStr,
            // Historical fields are undefined, so areas won't render
            projectedTotalValue: currentValue
        });
    }

    // Connect last historical point
    const connectionPoint = {
        ...lastData,
        projectedTotalValue: lastData.totalValue
    };

    const historyWithConnection = [...ppkData];
    historyWithConnection[historyWithConnection.length - 1] = connectionPoint;

    return [...historyWithConnection, ...projectionPoints];

  }, [data, portfolioType, showPPKProjection]);

  const ppkRateDisplay = useMemo(() => {
      // Simply return 12.00% as it is fixed for the projection
      return { cagr: 12.00 };
  }, [data, portfolioType]);


  // --- HEATMAP DATA (OMF - Crypto + IKE only) ---
  const heatmapHistoryData = useMemo(() => {
    if (portfolioType !== 'OMF') return [];

    // Only parse Crypto and IKE
    const cryptoRes = parseCSV(csvSources.CRYPTO, 'CRYPTO', 'Offline');
    const ikeRes = parseCSV(csvSources.IKE, 'IKE', 'Offline');

    const cryptoData = cryptoRes.data as CryptoDataRow[];
    const ikeData = ikeRes.data as IKEDataRow[];

    const cryptoMap = new Map<string, { inv: number, profit: number }>();
    cryptoData.forEach(row => cryptoMap.set(row.date, { inv: row.investment, profit: row.profit }));

    const ikeMap = new Map<string, { inv: number, profit: number }>();
    ikeData.forEach(row => ikeMap.set(row.date, { inv: row.investment, profit: row.profit }));

    const allDates = new Set([...cryptoMap.keys(), ...ikeMap.keys()]);
    const sortedDates = Array.from(allDates).sort((a, b) => a.localeCompare(b));

    let lastCrypto = { inv: 0, profit: 0 };
    let lastIKE = { inv: 0, profit: 0 };

    const history = sortedDates.map(date => {
      if (cryptoMap.has(date)) lastCrypto = cryptoMap.get(date)!;
      if (ikeMap.has(date)) lastIKE = ikeMap.get(date)!;

      const totalInvestment = lastCrypto.inv + lastIKE.inv;
      const totalProfit = lastCrypto.profit + lastIKE.profit;
      
      return {
        date,
        investment: totalInvestment,
        profit: totalProfit,
        totalValue: totalInvestment + totalProfit
      };
    });

    return history;
  }, [csvSources, portfolioType]);


  const stats: SummaryStats | null = useMemo(() => {
    if (portfolioType === 'OMF') {
       // OMF Stats Calculation 
       // Update: If excludePPK is active, we filter the active assets to calculate "Net Worth" and "Invested" correctly
       const assetsToSum = excludePPK 
          ? omfActiveAssets.filter(a => a.portfolio !== 'PPK') 
          : omfActiveAssets;

       const totalValue = assetsToSum.reduce((acc, row) => acc + row.currentValue, 0);
       const totalInvestedSnapshot = assetsToSum.reduce((acc, row) => acc + row.purchaseValue, 0);

       let aggregatedProfit = 0;
       let totalRoi = 0;
       let profitTrend = 0;
       let cagr = 0;
       let ltm = 0;
       let ytd = 0;

       if (globalHistoryData.length > 0) {
         const current = globalHistoryData[globalHistoryData.length - 1];
         aggregatedProfit = current.profit;
         totalRoi = current.roi;

         // MoM Trend
         if (globalHistoryData.length > 1) {
             const prevPeriod = globalHistoryData[globalHistoryData.length - 2];
             if (prevPeriod.profit !== 0) {
                 profitTrend = ((aggregatedProfit - prevPeriod.profit) / Math.abs(prevPeriod.profit)) * 100;
             } else if (aggregatedProfit !== 0) {
                 profitTrend = 100;
             }
         }

         // --- PERFORMANCE METRICS (CAGR, LTM, YTD) ---
         // Use globalHistoryData which includes PPK + Crypto + IKE
         const perfData = globalHistoryData;
         
         if (perfData.length > 0) {
             const currentIndex = perfData.length - 1;
             
             // Function to calculate accumulated TWR from a start index to an end index
             const calculateAccumulatedTWR = (startIdx: number, endIdx: number) => {
                let product = 1;
                for (let i = startIdx; i <= endIdx; i++) {
                   if (i <= 0) continue; 
                   
                   const prev = perfData[i-1];
                   const curr = perfData[i];
                   
                   const prevVal = prev['totalValue'] !== undefined ? prev['totalValue'] : (prev.investment + prev.profit);
                   const currVal = curr['totalValue'] !== undefined ? curr['totalValue'] : (curr.investment + curr.profit);
                   
                   const flow = curr.investment - prev.investment; 
                   
                   const denominator = prevVal + flow;
                   if (denominator !== 0) {
                      const gain = currVal - prevVal - flow;
                      const r = gain / denominator;
                      product *= (1 + r);
                   }
                }
                return (product - 1) * 100;
             };

             // --- CAGR (Real ROI based on GLOBAL data) ---
             const startDate = new Date(perfData[0].date);
             const currentDate = new Date(perfData[currentIndex].date);
             const years = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
             
             const currentTotalRoi = perfData[currentIndex].investment > 0 
                ? (perfData[currentIndex].profit / perfData[currentIndex].investment) * 100 
                : 0;

             if (years > 0.5) {
                const totalFactor = 1 + (currentTotalRoi / 100);
                cagr = (Math.pow(totalFactor, 1 / years) - 1) * 100;
             } else {
                cagr = currentTotalRoi;
             }

             // --- YTD (TWR on GLOBAL data) ---
             const currentYear = new Date().getFullYear();
             const firstIndexThisYear = perfData.findIndex(d => new Date(d.date).getFullYear() === currentYear);
             
             if (firstIndexThisYear !== -1) {
                ytd = calculateAccumulatedTWR(firstIndexThisYear, currentIndex);
             }

             // --- LTM (TWR on GLOBAL data) ---
             const ltmStartIdx = Math.max(1, currentIndex - 11); 
             ltm = calculateAccumulatedTWR(ltmStartIdx, currentIndex);
         }
       }

       return { 
         totalValue, 
         totalProfit: aggregatedProfit, 
         totalInvestment: totalInvestedSnapshot, 
         currentRoi: totalRoi,
         profitTrend,
         cagr,
         ltm,
         ytd
       };
    }
    
    if (data.length === 0) return null;
    const last = data[data.length - 1];
    
    if (portfolioType === 'PPK') {
      const row = last as PPKDataRow;
      const taxAbs = Math.abs(row.tax || 0);
      const netValue = row.totalValue - taxAbs;
      const exitValue = netValue - (0.30 * row.employerContribution) - row.stateContribution - (0.19 * row.fundProfit);

      return {
        totalValue: row.totalValue,
        totalProfit: row.profit,
        totalEmployee: row.employeeContribution,
        totalEmployer: row.employerContribution,
        totalState: row.stateContribution,
        currentRoi: row.roi,
        currentExitRoi: row.exitRoi,
        // Storing exitValue as a custom property in the stat object for the card
        customExitValue: exitValue
      } as SummaryStats & { customExitValue?: number };
    } else {
      const row = last as CryptoDataRow | IKEDataRow;
      
      // For IKE, calculate tax saved
      let taxSaved = 0;
      if (portfolioType === 'IKE') {
         // Calculate Tax Saved based on CLOSED positions from OMF data
         // logic: Sum of profits from closed IKE positions * 19%
         if (omfClosedAssets.length > 0) {
            const ikeClosedProfits = omfClosedAssets
              .filter(a => a.portfolio === 'IKE' || a.portfolio === 'ike')
              .reduce((sum, a) => sum + a.profit, 0);
            
            taxSaved = ikeClosedProfits > 0 ? ikeClosedProfits * 0.19 : 0;
         } else {
            // Fallback to old logic if no closed assets (or before OMF parsing)
            taxSaved = row.profit > 0 ? row.profit * 0.19 : 0;
         }
      }

      return {
        totalValue: row.totalValue,
        totalProfit: row.profit,
        totalInvestment: row.investment,
        currentRoi: row.roi,
        taxSaved
      };
    }
  }, [data, portfolioType, omfActiveAssets, omfClosedAssets, globalHistoryData, heatmapHistoryData, excludePPK]); // Added omfClosedAssets to deps

  // --- OMF Structure Data Calculation ---
  const omfStructureData = useMemo(() => {
    if (portfolioType !== 'OMF' || omfActiveAssets.length === 0) return [];
    
    let cryptoRestValue = 0;
    let cryptoRestPurchaseValue = 0;
    const result: { name: string; value: number; roi: number; }[] = [];

    omfActiveAssets.forEach(asset => {
      if (asset.portfolio === 'Krypto' || asset.portfolio === 'CRYPTO') {
         if (asset.currentValue > 1000) {
           result.push({ 
             name: asset.symbol, 
             value: asset.currentValue,
             roi: asset.roi 
            });
         } else {
           cryptoRestValue += asset.currentValue;
           cryptoRestPurchaseValue += asset.purchaseValue;
         }
      } else {
         result.push({ 
           name: asset.symbol, 
           value: asset.currentValue,
           roi: asset.roi
          });
      }
    });

    if (cryptoRestValue > 0) {
      const aggRoi = cryptoRestPurchaseValue > 0 
        ? ((cryptoRestValue - cryptoRestPurchaseValue) / cryptoRestPurchaseValue) * 100 
        : 0;

      result.push({ 
        name: 'Reszta Krypto', 
        value: cryptoRestValue,
        roi: aggRoi 
      });
    }

    return result.sort((a, b) => b.value - a.value);
  }, [omfActiveAssets, portfolioType]);


  const ppkFlowData = useMemo(() => {
    if (!stats || portfolioType !== 'PPK') return [];
    
    const employee = stats.totalEmployee || 0;
    const employer = stats.totalEmployer || 0;
    const state = stats.totalState || 0;
    const fundResult = (stats.totalValue || 0) - (employee + employer + state);

    return [
      { name: 'Pracownik', value: employee, fill: '#3b82f6' }, // Blue
      { name: 'Pracodawca', value: employer, fill: '#8b5cf6' }, // Violet
      { name: 'Państwo', value: state, fill: '#ec4899' }, // Pink
      { name: 'Wynik Funduszu', value: fundResult, fill: fundResult >= 0 ? '#10b981' : '#ef4444' }, // Green/Red
      { name: 'Wartość Portfela', value: stats.totalValue || 0, isTotal: true, fill: '#6366f1' } // Indigo
    ];
  }, [stats, portfolioType]);

  // PPK Time to Payout Calculation
  const monthsToPayout = useMemo(() => {
    if (portfolioType !== 'PPK') return 0;
    
    const targetDate = new Date('2049-05-01');
    const now = new Date();
    
    let months = (targetDate.getFullYear() - now.getFullYear()) * 12;
    months -= now.getMonth();
    months += targetDate.getMonth();
    
    return Math.max(0, months);
  }, [portfolioType]);

  const getTextColorClass = (type: string) => {
    if (theme === 'neon') return 'text-cyan-400';
    switch(type) {
      case 'PPK': return 'text-indigo-700';
      case 'CRYPTO': return 'text-violet-700';
      case 'IKE': return 'text-cyan-700';
      case 'OMF': return 'text-slate-800';
      default: return 'text-blue-700';
    }
  };

  const isOfflineValid = (portfolioType === 'OMF' && omfReport?.isConsistent) || (portfolioType !== 'OMF' && report?.isValid);

  return (
    <div className={`min-h-screen ${styles.appBg} ${styles.text} pb-12 transition-colors duration-300`}>
      {/* Header */}
      <header className={`${styles.headerBg} ${styles.headerBorder} border-b sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Empty Left Space for Balance */}
          <div className="w-24"></div>

          {/* Portfolio Switcher (Centered) */}
          <div className={`p-1 rounded-lg flex space-x-1 overflow-x-auto ${theme === 'neon' ? 'bg-black border border-cyan-900/50' : 'bg-slate-100'}`}>
            <button
              onClick={() => handlePortfolioChange('OMF')}
              className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                portfolioType === 'OMF' ? styles.buttonActive : styles.buttonInactive
              }`}
            >
              <LayoutGrid size={16} className="mr-2 hidden sm:block" />
              OMF
            </button>
            <button
              onClick={() => handlePortfolioChange('PPK')}
              className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                portfolioType === 'PPK' ? styles.buttonActive : styles.buttonInactive
              }`}
            >
              <Briefcase size={16} className="mr-2 hidden sm:block" />
              PPK
            </button>
            <button
              onClick={() => handlePortfolioChange('CRYPTO')}
              className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                portfolioType === 'CRYPTO' ? styles.buttonActive : styles.buttonInactive
              }`}
            >
              <Coins size={16} className="mr-2 hidden sm:block" />
              Krypto
            </button>
            <button
              onClick={() => handlePortfolioChange('IKE')}
              className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                portfolioType === 'IKE' ? styles.buttonActive : styles.buttonInactive
              }`}
            >
              <PiggyBank size={16} className="mr-2 hidden sm:block" />
              IKE
            </button>
          </div>

          {/* Theme Switcher (Right) */}
          <div className="w-24 flex justify-end space-x-2">
             <button 
               onClick={() => setTheme('light')} 
               className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100'}`} 
               title="Professional Light"
             >
               <Sun size={16} />
             </button>
             <button 
               onClick={() => setTheme('comic')} 
               className={`p-2 rounded-md transition-all ${theme === 'comic' ? 'bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400 hover:bg-slate-100'}`} 
               title="Comic"
             >
               <Palette size={16} />
             </button>
             <button 
               onClick={() => setTheme('neon')} 
               className={`p-2 rounded-md transition-all ${theme === 'neon' ? 'bg-cyan-900/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'text-slate-400 hover:bg-slate-100'}`} 
               title="Neon Cyberpunk"
             >
               <Zap size={16} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Data Status Section */}
        {isOfflineValid ? (
           <div className="flex flex-col items-center mb-6 space-y-1">
              <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm ${
                  pricingMode === 'Online'
                    ? (theme === 'neon' ? 'bg-blue-900/80 text-blue-300 border border-blue-600/50' : 'bg-blue-50 text-blue-600 border border-blue-200')
                    : (theme === 'neon' ? 'bg-slate-800/80 text-slate-400 border border-slate-600/50' : 'bg-slate-100 text-slate-500 border border-slate-200')
              }`}>
                 {pricingMode === 'Online' ? <Wifi size={14} className="mr-1.5" /> : <WifiOff size={14} className="mr-1.5" />}
                 {pricingMode === 'Online' ? 'ONLINE' : 'OFFLINE'}
              </span>
              {pricingMode === 'Online' ? (
                <span className={`text-[10px] ${theme === 'neon' ? 'text-cyan-600' : 'text-blue-500'}`}>
                  Ceny na żywo z Google Sheets
                </span>
              ) : (
                lastUpdateDate && (
                  <span className={`text-[10px] ${theme === 'neon' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Ostatnia aktualizacja: {lastUpdateDate}
                  </span>
                )
              )}
           </div>
        ) : (
           <>
             {portfolioType === 'OMF' && omfReport && <OMFIntegrityStatus report={omfReport} theme={theme} />}
             {portfolioType !== 'OMF' && report && <DataStatus report={report} theme={theme} />}
           </>
        )}

        {/* OMF VIEW */}
        {portfolioType === 'OMF' && stats ? (
          <div className="space-y-8">
            {/* OMF Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard 
                title="Majątek Netto" 
                value={`${(stats.totalValue || 0).toLocaleString('pl-PL')} zł`} 
                subValue="Aktywa Otwarte + Gotówka" 
                icon={LayoutGrid} 
                colorClass={theme === 'neon' ? 'text-cyan-400' : "text-slate-800 bg-slate-100"}
                className={styles.cardContainer}
              />
              <StatsCard 
                title="Zysk" 
                value={`${(stats.totalProfit || 0).toLocaleString('pl-PL')} zł`}
                trend={stats.profitTrend}
                trendLabel="m/m"
                icon={TrendingUp} 
                colorClass={theme === 'neon' ? 'text-emerald-400' : "text-emerald-600 bg-emerald-50"} 
                className={styles.cardContainer}
              />
              <StatsCard 
                title="Zainwestowano" 
                value={`${(stats.totalInvestment || 0).toLocaleString('pl-PL')} zł`} 
                subValue="Kapitał (OMF)" 
                icon={Wallet} 
                colorClass={theme === 'neon' ? 'text-blue-400' : "text-blue-600 bg-blue-50"} 
                className={styles.cardContainer}
              />
              <StatsCard 
                title="Pozycja Gotówkowa" 
                value={`${(omfActiveAssets.filter(a => a.symbol === 'PLN').reduce((acc, c) => acc + c.currentValue, 0) || 0).toLocaleString('pl-PL')} zł`} 
                subValue="PLN" 
                icon={Banknote} 
                colorClass={theme === 'neon' ? 'text-violet-400' : "text-violet-600 bg-violet-50"} 
                className={styles.cardContainer}
              />
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard 
                title="Całkowite ROI" 
                value={`${(stats.currentRoi || 0).toFixed(2)}%`} 
                icon={Percent}
                colorClass={theme === 'neon' ? 'text-indigo-400' : "text-indigo-600 bg-indigo-50"} 
                className={styles.cardContainer}
              />
              <StatsCard 
                title="CAGR" 
                value={`${(stats.cagr || 0).toFixed(2)}%`} 
                subValue="(ROI Based)"
                icon={Activity}
                colorClass={theme === 'neon' ? 'text-purple-400' : "text-purple-600 bg-purple-50"} 
                className={styles.cardContainer}
              />
              <StatsCard 
                title="LTM" 
                value={`${(stats.ltm || 0).toFixed(2)}%`} 
                subValue="(TWR)"
                icon={Timer}
                colorClass={theme === 'neon' ? 'text-amber-400' : "text-amber-600 bg-amber-50"} 
                className={styles.cardContainer}
              />
              <StatsCard 
                title="YTD" 
                value={`${(stats.ytd || 0).toFixed(2)}%`} 
                subValue="(TWR)"
                icon={Calendar}
                colorClass={theme === 'neon' ? 'text-teal-400' : "text-teal-600 bg-teal-50"} 
                className={styles.cardContainer}
              />
            </div>

            {/* Global Portfolio History & Road to Million */}
            <div className={`${styles.cardContainer} p-6`}>
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                <div>
                  <h3 className={`text-lg font-bold ${styles.text}`}>Historia Old Man Fund</h3>
                  <p className={`text-sm ${styles.textSub}`}>Wkład Łączny vs Zysk Łączny (PPK + Krypto + IKE)</p>
                </div>
                
                {/* Road to Million & CPI Controls */}
                <div className={`flex items-center space-x-3 p-2 rounded-lg border ${theme === 'neon' ? 'bg-black/50 border-cyan-900/50' : 'bg-slate-50 border-slate-100'}`}>
                   {/* No PPK Button */}
                   <button
                     onClick={() => setExcludePPK(!excludePPK)}
                     disabled={showCPI || showProjection}
                     className={`flex items-center justify-center w-20 px-2 py-1.5 rounded-md transition-all ${
                       excludePPK 
                         ? styles.toggleNoPPKActive
                         : `bg-transparent ${theme === 'neon' ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`
                     } ${showCPI || showProjection ? 'opacity-50 cursor-not-allowed' : ''}`}
                     title={excludePPK ? "Pokaż PPK" : "Ukryj PPK"}
                   >
                     <NoPPKIcon className="w-full h-4" />
                   </button>

                   <button
                     onClick={() => setShowCPI(!showCPI)}
                     disabled={excludePPK}
                     className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                       showCPI 
                         ? styles.toggleCPIActive
                         : `bg-transparent ${theme === 'neon' ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`
                     } ${excludePPK ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     CPI
                   </button>

                   <div className={`w-px h-6 mx-1 ${theme === 'neon' ? 'bg-cyan-900/50' : 'bg-slate-200'}`}></div>

                   <button
                     onClick={() => setShowProjection(!showProjection)}
                     disabled={excludePPK}
                     className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                       showProjection 
                         ? styles.toggleProjectionActive
                         : `bg-transparent ${theme === 'neon' ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`
                     } ${excludePPK ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     <Milestone size={14} className="mr-2" />
                     Droga do Miliona
                   </button>

                   {showProjection && (
                     <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className={`flex rounded-md border p-0.5 ${theme === 'neon' ? 'bg-black border-cyan-900/50' : 'bg-white border-slate-200'}`}>
                          <button 
                            onClick={() => setProjectionMethod('LTM')}
                            className={`px-2 py-1 text-[10px] font-medium rounded ${projectionMethod === 'LTM' ? (theme === 'neon' ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-800 text-white') : (theme === 'neon' ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}
                          >
                            LTM
                          </button>
                          <button 
                            onClick={() => setProjectionMethod('CAGR')}
                            className={`px-2 py-1 text-[10px] font-medium rounded ${projectionMethod === 'CAGR' ? (theme === 'neon' ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-800 text-white') : (theme === 'neon' ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100')}`}
                          >
                            CAGR
                          </button>
                        </div>
                        <span className={`text-[10px] font-mono ${styles.textSub}`}>
                          +{projectionMethod === 'LTM' ? rateDisplay.ltm.toFixed(2) : rateDisplay.cagr.toFixed(2)}% m/m
                        </span>
                     </div>
                   )}
                </div>
              </div>
              
              <GlobalSummaryChart data={chartDataWithProjection} showProjection={showProjection} showCPI={showCPI} themeMode={theme} />
            </div>

            {/* Global Performance Chart */}
            <div className={`${styles.cardContainer} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${styles.text}`}>Efektywność Old Man Fund</h3>
                  <p className={`text-sm ${styles.textSub}`}>Analiza stopy zwrotu (ROI) oraz TWR w czasie</p>
                </div>
                <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
                  <TrendingUp className={theme === 'neon' ? 'text-purple-400' : 'text-purple-600'} size={20} />
                </div>
              </div>
              <GlobalPerformanceChart data={globalHistoryData} themeMode={theme} />
            </div>

            {/* OMF Treemap Chart */}
            <div className={`${styles.cardContainer} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${styles.text}`}>Mapa Aktywów (Treemap)</h3>
                  <p className={`text-sm ${styles.textSub}`}>Wizualizacja kafelkowa struktury portfela.</p>
                </div>
                <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
                  <LayoutTemplate className={theme === 'neon' ? 'text-cyan-400' : 'text-cyan-600'} size={20} />
                </div>
              </div>
              <OMFTreemapChart data={omfStructureData} themeMode={theme} />
            </div>

            {/* Heatmap */}
            <div className={`${styles.cardContainer} p-6 overflow-x-auto`}>
              <div className="flex items-center justify-between mb-6 min-w-[600px]">
                <div>
                  <h3 className={`text-lg font-bold ${styles.text}`}>Miesięczne Stopy Zwrotu</h3>
                  <p className={`text-sm ${styles.textSub}`}>Analiza efektywności portfela (Crypto + IKE) bez uwzględnienia PPK</p>
                </div>
                <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
                  <CalendarDays className={theme === 'neon' ? 'text-emerald-400' : 'text-emerald-600'} size={20} />
                </div>
              </div>
              <ReturnsHeatmap data={heatmapHistoryData} themeMode={theme} />
            </div>

            {/* Seasonality Chart (Separate Card) */}
            <div className={`${styles.cardContainer} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${styles.text}`}>Sezonowość</h3>
                  <p className={`text-sm ${styles.textSub}`}>Średnia stopa zwrotu w poszczególnych miesiącach</p>
                </div>
                <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
                  <Snowflake className={theme === 'neon' ? 'text-blue-400' : 'text-blue-600'} size={20} />
                </div>
              </div>
              <SeasonalityChart data={heatmapHistoryData} themeMode={theme} />
            </div>

            {/* Portfolio Allocation History Chart */}
            <div className={`${styles.cardContainer} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${styles.text}`}>Historia Alokacji Portfela</h3>
                  <p className={`text-sm ${styles.textSub}`}>Zmiana udziału procentowego PPK, Crypto i IKE w czasie</p>
                </div>
                <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
                  <PieChart className={theme === 'neon' ? 'text-blue-400' : 'text-blue-600'} size={20} />
                </div>
              </div>
              <PortfolioAllocationHistoryChart data={globalHistoryData} themeMode={theme} />
            </div>

            {/* Tables */}
            <div className="space-y-8">
              <div className={`${styles.cardContainer} overflow-hidden`}>
                <div 
                  className={`px-6 py-4 border-b flex justify-between items-center cursor-pointer transition-colors ${theme === 'neon' ? 'bg-black/20 border-cyan-900/30 hover:bg-cyan-950/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                  onClick={() => setIsActivePositionsExpanded(!isActivePositionsExpanded)}
                >
                  <div className="flex items-center space-x-2">
                     <h3 className={`text-lg font-bold ${styles.text}`}>Aktywne Pozycje</h3>
                     {isActivePositionsExpanded ? <ChevronUp size={20} className={theme === 'neon' ? 'text-cyan-600' : 'text-slate-400'}/> : <ChevronDown size={20} className={theme === 'neon' ? 'text-cyan-600' : 'text-slate-400'}/>}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${theme === 'neon' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50' : 'bg-emerald-100 text-emerald-700'}`}>
                    {omfActiveAssets.length} pozycji
                  </span>
                </div>
                {isActivePositionsExpanded && (
                  <HistoryTable 
                    data={omfActiveAssets} 
                    type="OMF" 
                    omfVariant="active" 
                    themeMode={theme}
                  />
                )}
              </div>

              <div className={`${styles.cardContainer} overflow-hidden`}>
                <div 
                  className={`px-6 py-4 border-b flex justify-between items-center cursor-pointer transition-colors ${theme === 'neon' ? 'bg-black/20 border-cyan-900/30 hover:bg-cyan-950/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                  onClick={() => setIsClosedHistoryExpanded(!isClosedHistoryExpanded)}
                >
                  <div className="flex items-center space-x-2">
                     <h3 className={`text-lg font-bold ${styles.text}`}>Historia Zamkniętych Pozycji</h3>
                     {isClosedHistoryExpanded ? <ChevronUp size={20} className={theme === 'neon' ? 'text-cyan-600' : 'text-slate-400'}/> : <ChevronDown size={20} className={theme === 'neon' ? 'text-cyan-600' : 'text-slate-400'}/>}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${theme === 'neon' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-600'}`}>
                    {omfClosedAssets.length} pozycji
                  </span>
                </div>
                {isClosedHistoryExpanded && (
                  <HistoryTable data={omfClosedAssets} type="OMF" omfVariant="closed" themeMode={theme} />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD VIEW (PPK, CRYPTO, IKE) */
          <>
            {/* Stats Grid */}
            {stats && (
              <div className={`grid grid-cols-1 gap-6 mb-4 ${portfolioType === 'PPK' ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-4'}`}>
                
                {portfolioType === 'PPK' ? (
                   // CUSTOM "WARTOŚĆ" CARD FOR PPK (With Exit Value)
                   <div className={`${styles.cardContainer} p-6 hover:shadow-md transition-shadow duration-300`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-medium ${styles.textSub}`}>Wartość</h3>
                        <div className={`p-2 rounded-lg ${theme === 'neon' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/50' : 'bg-slate-50 text-indigo-700'}`}>
                           <Wallet size={20} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                         <span className={`text-2xl font-bold ${styles.text}`}>{`${(stats.totalValue || 0).toLocaleString('pl-PL')} zł`}</span>
                         <div className="flex items-center mt-1 text-sm space-x-2">
                            {/* Exit Value */}
                            <span className={`flex items-center font-bold text-base ${theme === 'neon' ? 'text-slate-400' : 'text-slate-600'}`}>
                               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                  <polyline points="16 17 21 12 16 7" />
                                  <line x1="21" y1="12" x2="9" y2="12" />
                                  {/* Custom "Running man" stick figure approximation */}
                                  <path d="M13 10l-2 3l2 3" strokeWidth="1.5" /> 
                                  <circle cx="13" cy="8" r="1.5" fill="currentColor" stroke="none"/>
                               </svg>
                               {((stats as any).customExitValue || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
                            </span>
                         </div>
                      </div>
                   </div>
                ) : (
                  <StatsCard 
                    title="Wartość Całkowita" 
                    value={`${(stats.totalValue || 0).toLocaleString('pl-PL')} zł`} 
                    icon={Wallet} 
                    colorClass={getTextColorClass(portfolioType)}
                    className={styles.cardContainer}
                  />
                )}

                <StatsCard 
                  title={portfolioType === 'PPK' ? "Wkład Własny" : "Zainwestowano"} 
                  value={`${(stats.totalInvestment ?? stats.totalEmployee ?? 0).toLocaleString('pl-PL')} zł`} 
                  icon={Building2} 
                  colorClass={getTextColorClass(portfolioType)}
                  className={styles.cardContainer}
                />
                
                {portfolioType === 'PPK' && stats.totalState !== undefined ? (
                   // CUSTOM "ZYSK" CARD FOR PPK
                   <div className={`${styles.cardContainer} p-6 hover:shadow-md transition-shadow duration-300`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-medium ${styles.textSub}`}>Zysk</h3>
                        <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg} ${theme === 'neon' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                           <TrendingUp size={20} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                         <span className={`text-2xl font-bold ${styles.text}`}>{`${(stats.totalProfit || 0).toLocaleString('pl-PL')} zł`}</span>
                         <div className="flex items-center mt-1 text-sm space-x-2">
                            {/* Gross ROI (Profit / Employee Contribution) */}
                            <span className={`flex items-center font-bold text-base ${theme === 'neon' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                               <ArrowUpRight size={18} className="mr-0.5" />
                               {stats.totalEmployee ? ((stats.totalProfit / stats.totalEmployee) * 100).toFixed(2) : '0.00'}%
                            </span>
                            {/* Net ROI (Current standard ROI from CSV) */}
                            <span className={`flex items-center font-normal text-xs ${theme === 'neon' ? 'text-cyan-700' : 'text-slate-400'}`}>
                               {stats.currentRoi ? stats.currentRoi.toFixed(2) : '0.00'}% netto
                            </span>
                         </div>
                      </div>
                   </div>
                ) : (
                  <StatsCard 
                    title="Zysk/Strata" 
                    value={`${(stats.totalProfit || 0).toLocaleString('pl-PL')} zł`} 
                    trend={stats.currentRoi || 0} 
                    icon={TrendingUp} 
                    colorClass={theme === 'neon' ? ((stats.totalProfit || 0) >= 0 ? "text-emerald-400" : "text-rose-400") : ((stats.totalProfit || 0) >= 0 ? "text-emerald-600" : "text-rose-600")} 
                    className={styles.cardContainer}
                  />
                )}

                {portfolioType === 'PPK' ? (
                   // CUSTOM "CZAS DO WYPŁATY" CARD FOR PPK (Clean, No Background Icon)
                   <div className={`${styles.cardContainer} p-6 hover:shadow-md transition-shadow duration-300`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-medium ${styles.textSub}`}>Czas do wypłaty</h3>
                        <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg} ${theme === 'neon' ? 'text-amber-400' : 'text-amber-600'}`}>
                           <Timer size={20} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                         <span className={`text-2xl font-bold ${styles.text}`}>{monthsToPayout}</span>
                         <span className={`text-sm mt-1 ${theme === 'neon' ? 'text-cyan-700' : 'text-slate-400'}`}>miesięcy (maj 2049)</span>
                      </div>
                   </div>
                ) : null}

                {/* NEW: IKE Tax Shield Card */}
                {portfolioType === 'IKE' && stats.taxSaved !== undefined && (
                   <StatsCard 
                     title="Tarcza Podatkowa" 
                     value={`${(stats.taxSaved).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`} 
                     subValue="Zaoszczędzony podatek (19%)"
                     icon={ShieldCheck} 
                     colorClass={theme === 'neon' ? 'text-cyan-400' : "text-cyan-700 bg-cyan-50"} 
                     className={styles.cardContainer}
                   />
                )}

                {/* NEW: Crypto Best Asset Card */}
                {portfolioType === 'CRYPTO' && (
                  (() => {
                    // Find best active crypto asset
                    const bestCrypto = omfActiveAssets
                      .filter(a => a.portfolio === 'Krypto' || a.portfolio === 'CRYPTO')
                      .sort((a, b) => b.profit - a.profit)[0]; // Sort by absolute profit

                    if (bestCrypto) {
                      return (
                        <StatsCard
                          title="Najlepszy Aktyw"
                          value={bestCrypto.symbol}
                          subValue={`${bestCrypto.profit.toLocaleString('pl-PL')} zł`}
                          trend={bestCrypto.roi}
                          icon={Trophy}
                          colorClass={theme === 'neon' ? 'text-yellow-400' : "text-yellow-600 bg-yellow-50"}
                          className={styles.cardContainer}
                        />
                      );
                    }
                    return null;
                  })()
                )}
              </div>
            )}

            {/* Tabs */}
            {(portfolioType === 'OMF') && (
              <div className={`border-b mb-8 ${styles.headerBorder}`}>
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === 'dashboard'
                        ? `border-slate-500 ${styles.text}`
                        : `border-transparent ${styles.textSub} hover:border-slate-300`
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === 'history'
                        ? `border-slate-500 ${styles.text}`
                        : `border-transparent ${styles.textSub} hover:border-slate-300`
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Historia
                  </button>
                </nav>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {portfolioType === 'PPK' ? (
                  /* PPK Visualizations (Dashboard Only) */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Make Value Chart Full Width */}
                    <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
                      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                        <div className="flex flex-col">
                          <h3 className={`text-lg font-bold ${styles.text}`}>Historyczna Wartość Portfela</h3>
                          <p className="text-[10px] sm:text-xs text-slate-400 mt-2 font-medium leading-tight max-w-2xl">
                            Wartość netto = Wartość po odjęciu podatku od wpłaty Pracodawcy<br/>
                            Wartość Exit = Wartość netto - 30% wpłat od Pracodawcy - wpłaty od Państwa - 19% podatku od zysku
                          </p>
                        </div>
                        
                        {/* Road to Retirement Controls */}
                        <div className={`flex items-center space-x-4 p-2 rounded-lg border ${theme === 'neon' ? 'bg-black/50 border-cyan-900/50' : 'bg-slate-50 border-slate-100'}`}>
                           <button
                             onClick={() => setShowPPKProjection(!showPPKProjection)}
                             className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                               showPPKProjection 
                                 ? styles.toggleProjectionActive
                                 : `bg-transparent ${theme === 'neon' ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`
                             }`}
                           >
                             <Milestone size={14} className="mr-2" />
                             Droga do Emerytury
                           </button>

                           {showPPKProjection && (
                             <span className={`text-[10px] font-mono ${styles.textSub} animate-in fade-in slide-in-from-right-4 duration-300`}>
                               +{ppkRateDisplay.cagr.toFixed(2)}% m/m (CAGR)
                             </span>
                           )}
                        </div>
                      </div>
                      <ValueCompositionChart data={ppkChartDataWithProjection} showProjection={showPPKProjection} themeMode={theme} />
                    </div>
                    
                    {/* ROI Chart */}
                    <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
                      <h3 className={`text-lg font-bold ${styles.text} mb-6`}>ROI w czasie</h3>
                      <ROIChart data={data} themeMode={theme} />
                    </div>

                    {/* Capital Structure History Chart (Full Width below ROI) */}
                    <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
                      <h3 className={`text-lg font-bold ${styles.text} mb-6`}>Struktura Kapitału w czasie</h3>
                      <CapitalStructureHistoryChart data={data} themeMode={theme} />
                    </div>
                  </div>
                ) : (
                  /* Crypto / IKE Visualizations */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className={`text-lg font-bold ${styles.text}`}>
                          {portfolioType === 'IKE' && showTaxComparison 
                            ? 'Historyczna Wartość Portfela (IKE vs Opodatkowane)' 
                            : 'Historyczna Wartość Portfela'}
                        </h3>
                        {portfolioType === 'IKE' && (
                          <button
                            onClick={() => setShowTaxComparison(!showTaxComparison)}
                            className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                              showTaxComparison 
                                ? styles.toggleCPIActive
                                : `bg-transparent ${theme === 'neon' ? 'text-cyan-700 border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700' : 'text-slate-500 hover:text-slate-700 border-slate-200'} border`
                            }`}
                            title="Pokaż porównanie z kontem opodatkowanym"
                          >
                            <TaxToggleIcon className="w-4 h-4 mr-2" />
                            Belka
                          </button>
                        )}
                      </div>
                      <CryptoValueChart data={data} showTaxComparison={showTaxComparison} themeMode={theme} />
                    </div>
                    <div className={`${styles.cardContainer} p-6 lg:col-span-2`}>
                      <h3 className={`text-lg font-bold ${styles.text} mb-6`}>ROI w czasie</h3>
                      <ROIChart data={data} themeMode={theme} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && portfolioType === 'OMF' && (
              <div className={`${styles.cardContainer} overflow-hidden`}>
                <HistoryTable data={data} type={portfolioType} themeMode={theme} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
