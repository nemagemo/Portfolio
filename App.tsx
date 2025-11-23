
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
  Search
} from 'lucide-react';
import { parseCSV, validateOMFIntegrity } from './utils/parser';
import { AnyDataRow, SummaryStats, ValidationReport, PortfolioType, PPKDataRow, CryptoDataRow, IKEDataRow, OMFValidationReport, OMFDataRow, GlobalHistoryRow } from './types';
import { StatsCard } from './components/StatsCard';
import { ValueCompositionChart, ROIChart, ContributionComparisonChart, CryptoValueChart, OMFAllocationChart, GlobalSummaryChart, GlobalPerformanceChart, OMFStructureChart, OMFTreemapChart, PortfolioAllocationHistoryChart, CapitalStructureHistoryChart, SeasonalityChart, PPKStructureBar } from './components/Charts';
import { HistoryTable } from './components/HistoryTable';
import { ReturnsHeatmap } from './components/ReturnsHeatmap';

// Import local data
import { PPK_DATA } from './CSV/PPK';
import { KRYPTO_DATA } from './CSV/Krypto';
import { IKE_DATA } from './CSV/IKE';
import { OMF_DATA } from './CSV/OMF';
// Import benchmarks & inflation
import { SP500_DATA, WIG20_DATA } from './constants/benchmarks';
import { CPI_DATA } from './constants/inflation';

/**
 * ============================================================================
 * ARCHITECTURAL CONTEXT FOR AI DEVELOPERS & MAINTAINERS
 * ============================================================================
 * 
 * 1. DATA SOURCE: OFFLINE FIRST
 *    We explicitly switched from fetching CSVs via URL (Google Sheets) to importing
 *    local .ts files containing CSV strings (in folder `CSV/`).
 *    Reason: Netlify/Vite build process does not bundle raw .csv files by default,
 *    causing 404 errors in production. Using .ts modules ensures data is bundled correctly.
 * 
 * 2. PARSING LOGIC: ROBUST & AGGRESSIVE
 *    The `utils/parser.ts` contains very aggressive regex to clean currency strings.
 *    Reason: Google Sheets exports often contain non-breaking spaces (\u00A0) or
 *    narrow spaces (\u202F) as thousand separators, which `parseFloat` cannot handle.
 *    We strip everything except digits, minus sign, and decimal separator.
 * 
 * 3. CALCULATIONS: TWR & HEATMAP ALIGNMENT
 *    - CAGR, LTM, YTD metrics are calculated using TWR (Time-Weighted Return).
 *    - Heatmap Logic: The return shown in column "May" represents the period 
 *      ending in May (April 1st -> May 1st).
 *    - Calculations for metrics strictly follow this "shifted" logic to match the visual heatmap.
 * 
 * 4. UI STRUCTURE:
 *    - Menu is centered. Logo removed for cleaner look.
 *    - Data integrity messages persist (no auto-hide) to ensure issues with source files are visible.
 *    - OMF is the default starting tab as it aggregates everything.
 */

const DataStatus: React.FC<{ report: ValidationReport }> = ({ report }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (report.isValid && report.errors.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 p-2 rounded-full">
              <ShieldCheck className="text-emerald-600 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-800">Weryfikacja danych pomyślna</h3>
              <p className="text-xs text-emerald-600">Potrójne sprawdzanie: Struktura OK • Formaty OK • Logika OK</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <div className="text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
               Zaimportowano {report.stats.validRows} wierszy
             </div>
             {report.source && (
               <span className="text-[10px] uppercase font-bold text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded bg-white/50">
                 {report.source}
               </span>
             )}
          </div>
        </div>
      </div>
    );
  }

  const isCritical = !report.isValid;

  return (
    <div className={`border rounded-lg p-4 mb-6 transition-all ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
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

const OMFIntegrityStatus: React.FC<{ report: OMFValidationReport }> = ({ report }) => {
  const [expanded, setExpanded] = useState(false);
  const isPerfect = report.isConsistent && report.messages.length === 0;
  const isCritical = !report.isConsistent;

  if (isPerfect) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-full">
              <Scale className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Raport Integralności OMF</h3>
              <p className="text-xs text-slate-300">Potrójna weryfikacja: Struktura OK • Format OK • Logika OK</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs font-medium text-white bg-emerald-600 px-3 py-1 rounded-full">
              Spójność 100%
            </div>
            {report.source && (
              <span className="text-[10px] uppercase font-bold text-slate-300 border border-slate-500 px-2 py-0.5 rounded bg-slate-700">
                {report.source}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 mb-6 transition-all shadow-sm ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
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

const App: React.FC = () => {
  const [portfolioType, setPortfolioType] = useState<PortfolioType>('OMF');
  
  // Use local TS data exclusively (OFFLINE MODE)
  const [csvSources] = useState({
    PPK: PPK_DATA,
    CRYPTO: KRYPTO_DATA,
    IKE: IKE_DATA,
    OMF: OMF_DATA
  });

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

  // Road to Retirement State (PPK)
  const [showPPKProjection, setShowPPKProjection] = useState(false);

  const handlePortfolioChange = (type: PortfolioType) => {
    setPortfolioType(type);
    // Force reset to dashboard when switching to prevent getting stuck in 'history' tab for portfolios that hide it
    setActiveTab('dashboard');
  };

  useEffect(() => {
    try {
      // Universal Parse with Source Indication ('Offline' because we use local TS files)
      const result = parseCSV(csvSources[portfolioType], portfolioType, 'Offline');
      
      if (portfolioType === 'OMF') {
        // Special Handling for OMF
        const omfData = result.data as OMFDataRow[];
        
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
  }, [csvSources, portfolioType]);

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

      // Global Totals (Including PPK)
      const totalInvestment = lastPPK.inv + lastCrypto.inv + lastIKE.inv;
      const totalProfit = lastPPK.profit + lastCrypto.profit + lastIKE.profit;
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
      const ppkVal = lastPPK.inv + lastPPK.profit;
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
  }, [csvSources]);

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

    // 2. CAGR (All Time) Average Monthly Growth - Aligned with Stats Card Logic
    const firstData = globalHistoryData[0];
    
    let cagrMonthlyRate = 0.005; // Fallback

    if (globalHistoryData.length > 0) {
        const startDate = new Date(firstData.date);
        const endDate = new Date(lastData.date);
        // Use exact same year duration constant as in stats calculation
        const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        
        const currentTotalRoi = lastData.investment > 0 
            ? (lastData.profit / lastData.investment) 
            : 0; // Decimal (e.g. 0.50 for 50%)

        let annualCagrDecimal = 0;

        if (years > 0.5) {
            const totalFactor = 1 + currentTotalRoi;
            annualCagrDecimal = Math.pow(totalFactor, 1 / years) - 1;
        } else {
            // Fallback for short history < 6 months (consistent with Stats Card)
            annualCagrDecimal = currentTotalRoi;
        }
        
        // Convert Annual CAGR to Monthly Compounding Rate: (1 + Annual)^(1/12) - 1
        cagrMonthlyRate = Math.pow(1 + annualCagrDecimal, 1/12) - 1;
    }

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

      // CAGR - ALIGNED WITH STATS CARD (ROI Based)
      const startD = new Date(firstData.date);
      const endD = new Date(lastData.date);
      const yrs = (endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      
      // ROI Based Calculation
      const currentTotalRoi = lastData.investment > 0 
          ? (lastData.profit / lastData.investment)
          : 0;

      let annualCagr = 0;
      if (yrs > 0.5) {
          const totalFactor = 1 + currentTotalRoi;
          annualCagr = Math.pow(totalFactor, 1/yrs) - 1;
      } else {
          annualCagr = currentTotalRoi;
      }
      
      const cagrMonthly = (Math.pow(1 + annualCagr, 1/12) - 1) * 100;

      return { ltm: ltmRate, cagr: cagrMonthly };
  }, [globalHistoryData]);

  // --- ROAD TO RETIREMENT PROJECTION LOGIC (PPK) ---
  const ppkChartDataWithProjection = useMemo(() => {
    if (portfolioType !== 'PPK' || !showPPKProjection || data.length === 0) return data;

    const ppkData = data as PPKDataRow[];
    const lastData = ppkData[ppkData.length - 1];
    const firstData = ppkData[0];

    // Calculate Growth Rate based on TOTAL VALUE (CAGR/All-time Growth only)
    // Formula: (Last Total / First Total) ^ (1/Years)
    let monthlyRate = 0.005; // Default fallback

    const startD = new Date(firstData.date);
    const endD = new Date(lastData.date);
    const yrs = (endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    // Total Growth Factor of the Portfolio Value
    const totalFactor = lastData.totalValue / firstData.totalValue;
    
    if (yrs > 0.5) {
        const annualCagr = Math.pow(totalFactor, 1/yrs) - 1;
        monthlyRate = Math.pow(1 + annualCagr, 1/12) - 1;
    } else {
        // Fallback for very short periods, use simple period growth normalized
        if (ppkData.length > 1) {
             monthlyRate = Math.pow(totalFactor, 1/ppkData.length) - 1;
        }
    }

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
      if (portfolioType !== 'PPK' || data.length < 2) return { cagr: 0 };
      const ppkData = data as PPKDataRow[];
      const lastData = ppkData[ppkData.length - 1];
      const firstData = ppkData[0];

      // CAGR based on Total Value growth
      const startD = new Date(firstData.date);
      const endD = new Date(lastData.date);
      const yrs = (endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      const totalFactor = lastData.totalValue / firstData.totalValue;
      
      let annualCagr = 0;
      if (yrs > 0.5) {
          annualCagr = Math.pow(totalFactor, 1/yrs) - 1;
      } else if (ppkData.length > 1) {
          // fallback for short duration
          annualCagr = Math.pow(totalFactor, 12/ppkData.length) - 1;
      }
      const cagrMonthly = (Math.pow(1 + annualCagr, 1/12) - 1) * 100;

      return { cagr: cagrMonthly };
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
       const totalValue = omfActiveAssets.reduce((acc, row) => acc + row.currentValue, 0);
       const totalInvestedSnapshot = omfActiveAssets.reduce((acc, row) => acc + row.purchaseValue, 0);

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
      return {
        totalValue: row.totalValue,
        totalProfit: row.profit,
        totalInvestment: row.investment,
        currentRoi: row.roi
      };
    }
  }, [data, portfolioType, omfActiveAssets, globalHistoryData, heatmapHistoryData]);

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
    switch(type) {
      case 'PPK': return 'text-indigo-700';
      case 'CRYPTO': return 'text-violet-700';
      case 'IKE': return 'text-cyan-700';
      case 'OMF': return 'text-slate-800';
      default: return 'text-blue-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
          {/* Portfolio Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 overflow-x-auto">
            <button
              onClick={() => handlePortfolioChange('OMF')}
              className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                portfolioType === 'OMF' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={16} className="mr-2 hidden sm:block" />
              OMF
            </button>
            <button
              onClick={() => handlePortfolioChange('PPK')}
              className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                portfolioType === 'PPK' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase size={16} className="mr-2 hidden sm:block" />
              PPK
            </button>
            <button
              onClick={() => handlePortfolioChange('CRYPTO')}
              className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                portfolioType === 'CRYPTO' 
                  ? 'bg-white text-violet-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins size={16} className="mr-2 hidden sm:block" />
              Krypto
            </button>
            <button
              onClick={() => handlePortfolioChange('IKE')}
              className={`flex items-center px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                portfolioType === 'IKE' 
                  ? 'bg-white text-cyan-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PiggyBank size={16} className="mr-2 hidden sm:block" />
              IKE
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Data Status Section */}
        {portfolioType === 'OMF' && omfReport && <OMFIntegrityStatus report={omfReport} />}
        {portfolioType !== 'OMF' && report && <DataStatus report={report} />}

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
                colorClass="text-slate-800 bg-slate-100" 
              />
              <StatsCard 
                title="Zysk" 
                value={`${(stats.totalProfit || 0).toLocaleString('pl-PL')} zł`}
                trend={stats.profitTrend}
                trendLabel="m/m"
                icon={TrendingUp} 
                colorClass="text-emerald-600 bg-emerald-50" 
              />
              <StatsCard 
                title="Zainwestowano" 
                value={`${(stats.totalInvestment || 0).toLocaleString('pl-PL')} zł`} 
                subValue="Kapitał (OMF)" 
                icon={Wallet} 
                colorClass="text-blue-600 bg-blue-50" 
              />
              <StatsCard 
                title="Pozycja Gotówkowa" 
                value={`${(omfActiveAssets.filter(a => a.symbol === 'PLN').reduce((acc, c) => acc + c.currentValue, 0) || 0).toLocaleString('pl-PL')} zł`} 
                subValue="PLN" 
                icon={Banknote} 
                colorClass="text-violet-600 bg-violet-50" 
              />
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard 
                title="Całkowite ROI" 
                value={`${(stats.currentRoi || 0).toFixed(2)}%`} 
                icon={Percent}
                colorClass="text-indigo-600 bg-indigo-50" 
              />
              <StatsCard 
                title="CAGR" 
                value={`${(stats.cagr || 0).toFixed(2)}%`} 
                subValue="(ROI Based)"
                icon={Activity}
                colorClass="text-purple-600 bg-purple-50" 
              />
              <StatsCard 
                title="LTM" 
                value={`${(stats.ltm || 0).toFixed(2)}%`} 
                subValue="(TWR)"
                icon={Timer}
                colorClass="text-amber-600 bg-amber-50" 
              />
              <StatsCard 
                title="YTD" 
                value={`${(stats.ytd || 0).toFixed(2)}%`} 
                subValue="(TWR)"
                icon={Calendar}
                colorClass="text-teal-600 bg-teal-50" 
              />
            </div>

            {/* Global Portfolio History & Road to Million */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Historia Old Man Fund</h3>
                  <p className="text-sm text-slate-500">Wkład Łączny vs Zysk Łączny (PPK + Krypto + IKE)</p>
                </div>
                
                {/* Road to Million & CPI Controls */}
                <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                   <button
                     onClick={() => setShowCPI(!showCPI)}
                     className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                       showCPI 
                         ? 'bg-slate-200 text-slate-800 shadow-sm ring-1 ring-slate-300' 
                         : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
                     }`}
                   >
                     CPI
                   </button>

                   <div className="w-px h-6 bg-slate-200 mx-1"></div>

                   <button
                     onClick={() => setShowProjection(!showProjection)}
                     className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                       showProjection 
                         ? 'bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200' 
                         : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
                     }`}
                   >
                     <Milestone size={14} className="mr-2" />
                     Droga do Miliona
                   </button>

                   {showProjection && (
                     <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex bg-white rounded-md border border-slate-200 p-0.5">
                          <button 
                            onClick={() => setProjectionMethod('LTM')}
                            className={`px-2 py-1 text-[10px] font-medium rounded ${projectionMethod === 'LTM' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                          >
                            LTM
                          </button>
                          <button 
                            onClick={() => setProjectionMethod('CAGR')}
                            className={`px-2 py-1 text-[10px] font-medium rounded ${projectionMethod === 'CAGR' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                          >
                            CAGR
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          +{projectionMethod === 'LTM' ? rateDisplay.ltm.toFixed(2) : rateDisplay.cagr.toFixed(2)}% m/m
                        </span>
                     </div>
                   )}
                </div>
              </div>
              
              <GlobalSummaryChart data={chartDataWithProjection} showProjection={showProjection} showCPI={showCPI} />
            </div>

            {/* Global Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Efektywność Old Man Fund</h3>
                  <p className="text-sm text-slate-500">Analiza stopy zwrotu (ROI) oraz TWR w czasie</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
              </div>
              <GlobalPerformanceChart data={globalHistoryData} />
            </div>

            {/* OMF Treemap Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Mapa Aktywów (Treemap)</h3>
                  <p className="text-sm text-slate-500">Wizualizacja kafelkowa struktury portfela.</p>
                </div>
                <div className="p-2 bg-cyan-50 rounded-lg">
                  <LayoutTemplate className="text-cyan-600" size={20} />
                </div>
              </div>
              <OMFTreemapChart data={omfStructureData} />
            </div>

            {/* Heatmap */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-6 min-w-[600px]">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Miesięczne Stopy Zwrotu</h3>
                  <p className="text-sm text-slate-500">Analiza efektywności portfela (Crypto + IKE) bez uwzględnienia PPK</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CalendarDays className="text-emerald-600" size={20} />
                </div>
              </div>
              <ReturnsHeatmap data={heatmapHistoryData} />
            </div>

            {/* Seasonality Chart (Separate Card) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Sezonowość</h3>
                  <p className="text-sm text-slate-500">Średnia stopa zwrotu w poszczególnych miesiącach</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Snowflake className="text-blue-600" size={20} />
                </div>
              </div>
              <SeasonalityChart data={heatmapHistoryData} />
            </div>

            {/* Portfolio Allocation History Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Historia Alokacji Portfela</h3>
                  <p className="text-sm text-slate-500">Zmiana udziału procentowego PPK, Crypto i IKE w czasie</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <PieChart className="text-blue-600" size={20} />
                </div>
              </div>
              <PortfolioAllocationHistoryChart data={globalHistoryData} />
            </div>

            {/* Tables */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div 
                  className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => setIsActivePositionsExpanded(!isActivePositionsExpanded)}
                >
                  <div className="flex items-center space-x-2">
                     <h3 className="text-lg font-bold text-slate-800">Aktywne Pozycje</h3>
                     {isActivePositionsExpanded ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                  </div>
                  <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    {omfActiveAssets.length} pozycji
                  </span>
                </div>
                {isActivePositionsExpanded && (
                  <HistoryTable 
                    data={omfActiveAssets} 
                    type="OMF" 
                    omfVariant="active" 
                  />
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div 
                  className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => setIsClosedHistoryExpanded(!isClosedHistoryExpanded)}
                >
                  <div className="flex items-center space-x-2">
                     <h3 className="text-lg font-bold text-slate-800">Historia Zamkniętych Pozycji</h3>
                     {isClosedHistoryExpanded ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                  </div>
                  <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                    {omfClosedAssets.length} pozycji
                  </span>
                </div>
                {isClosedHistoryExpanded && (
                  <HistoryTable data={omfClosedAssets} type="OMF" omfVariant="closed" />
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
                   <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-500">Wartość</h3>
                        <div className="p-2 rounded-lg bg-slate-50 text-indigo-700">
                           <Wallet size={20} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-2xl font-bold text-slate-900">{`${(stats.totalValue || 0).toLocaleString('pl-PL')} zł`}</span>
                         <div className="flex items-center mt-1 text-sm space-x-2">
                            {/* Exit Value */}
                            <span className="flex items-center font-bold text-slate-600 text-base">
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
                  />
                )}

                <StatsCard 
                  title={portfolioType === 'PPK' ? "Wkład Własny" : "Zainwestowano"} 
                  value={`${(stats.totalInvestment ?? stats.totalEmployee ?? 0).toLocaleString('pl-PL')} zł`} 
                  icon={Building2} 
                  colorClass={getTextColorClass(portfolioType)}
                />
                
                {portfolioType === 'PPK' && stats.totalState !== undefined ? (
                   // CUSTOM "ZYSK" CARD FOR PPK
                   <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-500">Zysk</h3>
                        <div className="p-2 rounded-lg bg-slate-50 text-emerald-600">
                           <TrendingUp size={20} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-2xl font-bold text-slate-900">{`${(stats.totalProfit || 0).toLocaleString('pl-PL')} zł`}</span>
                         <div className="flex items-center mt-1 text-sm space-x-2">
                            {/* Gross ROI (Profit / Employee Contribution) */}
                            <span className="flex items-center font-bold text-emerald-600 text-base">
                               <ArrowUpRight size={18} className="mr-0.5" />
                               {stats.totalEmployee ? ((stats.totalProfit / stats.totalEmployee) * 100).toFixed(2) : '0.00'}%
                            </span>
                            {/* Net ROI (Current standard ROI from CSV) */}
                            <span className="flex items-center font-normal text-slate-400 text-xs">
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
                    colorClass={(stats.totalProfit || 0) >= 0 ? "text-emerald-600" : "text-rose-600"} 
                  />
                )}

                {portfolioType === 'PPK' ? (
                   // CUSTOM "CZAS DO WYPŁATY" CARD FOR PPK (Clean, No Background Icon)
                   <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-500">Czas do wypłaty</h3>
                        <div className="p-2 rounded-lg bg-slate-50 text-amber-600">
                           <Timer size={20} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-2xl font-bold text-slate-900">{monthsToPayout}</span>
                         <span className="text-sm text-slate-400 mt-1">miesięcy (maj 2049)</span>
                      </div>
                   </div>
                ) : null}
              </div>
            )}

            {/* Extra Chart for PPK: Current Structure Bar (Full Width) */}
            {portfolioType === 'PPK' && stats && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                   <PPKStructureBar data={stats} />
                </div>
            )}

            {/* Tabs - Hidden for PPK and Crypto/IKE as requested */}
            {(portfolioType === 'OMF') && (
              <div className="border-b border-slate-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === 'dashboard'
                        ? `border-${portfolioType === 'PPK' ? 'indigo' : 'slate'}-500 text-${portfolioType === 'PPK' ? 'indigo' : 'slate'}-600`
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === 'history'
                        ? `border-${portfolioType === 'PPK' ? 'indigo' : 'slate'}-500 text-${portfolioType === 'PPK' ? 'indigo' : 'slate'}-600`
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                        <h3 className="text-lg font-bold text-slate-800">Wartość Portfela</h3>
                        
                        {/* Road to Retirement Controls */}
                        <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                           <button
                             onClick={() => setShowPPKProjection(!showPPKProjection)}
                             className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                               showPPKProjection 
                                 ? 'bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200' 
                                 : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
                             }`}
                           >
                             <Milestone size={14} className="mr-2" />
                             Droga do Emerytury
                           </button>

                           {showPPKProjection && (
                             <span className="text-[10px] font-mono text-slate-500 animate-in fade-in slide-in-from-right-4 duration-300">
                               +{ppkRateDisplay.cagr.toFixed(2)}% m/m (CAGR)
                             </span>
                           )}
                        </div>
                      </div>
                      <ValueCompositionChart data={ppkChartDataWithProjection} showProjection={showPPKProjection} />
                    </div>
                    
                    {/* ROI Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">ROI w czasie</h3>
                      <ROIChart data={data} />
                    </div>

                    {/* Capital Structure History Chart (Full Width below ROI) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">Struktura Kapitału w czasie</h3>
                      <CapitalStructureHistoryChart data={data} />
                    </div>
                  </div>
                ) : (
                  /* Crypto / IKE Visualizations */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">Kapitał vs Wycena</h3>
                      <CryptoValueChart data={data} />
                    </div>
                    {/* CryptoProfitChart removed as requested */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">ROI w czasie</h3>
                      <ROIChart data={data} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Table rendered directly if no tabs are shown (or if activeTab is history) */}
            {/* For PPK, we removed the History tab, so we only show HistoryTable if we add it back. 
                Current requirement says "Usuń zakładkę Historia" for PPK. So it's gone. */}
            {activeTab === 'history' && portfolioType === 'OMF' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <HistoryTable data={data} type={portfolioType} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
