
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
  LayoutTemplate
} from 'lucide-react';
import { parseCSV, validateOMFIntegrity } from './utils/parser';
import { AnyDataRow, SummaryStats, ValidationReport, PortfolioType, PPKDataRow, CryptoDataRow, IKEDataRow, OMFValidationReport, OMFDataRow } from './types';
import { StatsCard } from './components/StatsCard';
import { ValueCompositionChart, ROIChart, ContributionComparisonChart, CryptoValueChart, CryptoProfitChart, OMFAllocationChart, GlobalSummaryChart, GlobalPerformanceChart, OMFStructureChart, OMFTreemapChart, PortfolioAllocationHistoryChart, CapitalStructureHistoryChart } from './components/Charts';
import { HistoryTable } from './components/HistoryTable';
import { ReturnsHeatmap } from './components/ReturnsHeatmap';

// Import local data as fallback
import { PPK_DATA } from './CSV/PPK';
import { KRYPTO_DATA } from './CSV/Krypto';
import { IKE_DATA } from './CSV/IKE';
import { OMF_DATA } from './CSV/OMF';

// --- GOOGLE SHEETS CONFIGURATION ---
// Instrukcja:
// 1. W Google Sheets wejdź w Plik -> Udostępnij -> Opublikuj w internecie.
// 2. Wybierz odpowiedni arkusz i format "Wartości oddzielone przecinkami (.csv)".
// 3. Skopiuj link i wklej go poniżej w odpowiednie miejsce.
// Jeśli link pozostanie pusty (""), aplikacja użyje danych lokalnych z plików .ts.
const GOOGLE_SHEET_URLS = {
  OMF: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7p1b_z69_W5vbjwuA-FI_1J2FOPU-iPTXNwOyVkO_NCr7DJ6SPgyn1n2lnK8_fqPMU3mhZonDhR5U/pub?gid=1842953590&single=true&output=csv",
  PPK: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7p1b_z69_W5vbjwuA-FI_1J2FOPU-iPTXNwOyVkO_NCr7DJ6SPgyn1n2lnK8_fqPMU3mhZonDhR5U/pub?gid=2039918761&single=true&output=csv",
  CRYPTO: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7p1b_z69_W5vbjwuA-FI_1J2FOPU-iPTXNwOyVkO_NCr7DJ6SPgyn1n2lnK8_fqPMU3mhZonDhR5U/pub?gid=924747651&single=true&output=csv",
  IKE: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7p1b_z69_W5vbjwuA-FI_1J2FOPU-iPTXNwOyVkO_NCr7DJ6SPgyn1n2lnK8_fqPMU3mhZonDhR5U/pub?gid=622379915&single=true&output=csv"
};

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
          <div className="text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Zaimportowano {report.stats.validRows} wierszy
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
              <p className="text-xs text-slate-300">Potrójna weryfikacja: Struktura OK • Typy OK • Matematyka (Zakup+Zysk) OK</p>
            </div>
          </div>
          <div className="text-xs font-medium text-white bg-emerald-600 px-3 py-1 rounded-full">
            Spójność 100%
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
                    Matematyka
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
  
  // Initialize with local TS data, but can be overridden by Google Sheets fetch
  const [csvSources, setCsvSources] = useState({
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

  // Fetch data from Google Sheets if URLs are configured
  useEffect(() => {
    const fetchSheetData = async () => {
      const newSources = { ...csvSources };
      let hasUpdates = false;

      const fetchPromises = Object.entries(GOOGLE_SHEET_URLS).map(async ([key, url]) => {
        if (url && url.trim() !== "") {
          try {
            const response = await fetch(url);
            if (response.ok) {
              const text = await response.text();
              newSources[key as keyof typeof csvSources] = text;
              hasUpdates = true;
            } else {
              console.error(`Failed to fetch ${key} data: ${response.status}`);
            }
          } catch (error) {
            console.error(`Error fetching ${key} data:`, error);
          }
        }
      });

      await Promise.all(fetchPromises);

      if (hasUpdates) {
        setCsvSources(newSources);
      }
    };

    fetchSheetData();
  }, []); // Run once on mount

  useEffect(() => {
    try {
      // Universal Parse
      const result = parseCSV(csvSources[portfolioType], portfolioType);
      
      if (portfolioType === 'OMF') {
        // Special Handling for OMF
        const omfData = result.data as OMFDataRow[];
        
        // Run OMF Integrity Check
        const integrity = validateOMFIntegrity(omfData);
        
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
        checks: { structure: false, dataTypes: false, logic: false },
        errors: ["Krytyczny błąd aplikacji podczas parsowania."],
        stats: { totalRows: 0, validRows: 0 }
      });
    }
  }, [csvSources, portfolioType]);

  // --- GLOBAL HISTORY DATA (For OMF Chart) ---
  // Merges PPK, Crypto, and IKE timelines
  const globalHistoryData = useMemo(() => {
    const ppkRes = parseCSV(csvSources.PPK, 'PPK');
    const cryptoRes = parseCSV(csvSources.CRYPTO, 'CRYPTO');
    const ikeRes = parseCSV(csvSources.IKE, 'IKE');

    const ppkData = ppkRes.data as PPKDataRow[];
    const cryptoData = cryptoRes.data as CryptoDataRow[];
    const ikeData = ikeRes.data as IKEDataRow[];

    const ppkMap = new Map<string, { inv: number, profit: number }>();
    ppkData.forEach(row => ppkMap.set(row.date, { 
      inv: row.totalValue - row.profit,
      profit: row.profit 
    }));

    const cryptoMap = new Map<string, { inv: number, profit: number }>();
    cryptoData.forEach(row => cryptoMap.set(row.date, { inv: row.investment, profit: row.profit }));

    const ikeMap = new Map<string, { inv: number, profit: number }>();
    ikeData.forEach(row => ikeMap.set(row.date, { inv: row.investment, profit: row.profit }));

    const allDates = new Set([...ppkMap.keys(), ...cryptoMap.keys(), ...ikeMap.keys()]);
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let lastPPK = { inv: 0, profit: 0 };
    let lastCrypto = { inv: 0, profit: 0 };
    let lastIKE = { inv: 0, profit: 0 };
    
    // Variables for Cumulative TWR Calculation (Crypto + IKE Only)
    let twrProduct = 1;
    let prevTwrVal = 0;
    let prevTwrInv = 0;

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

      // Calculate period return if not the first point
      if (index > 0) {
         const flow = currTwrInv - prevTwrInv;
         
         // TWR Assumption: Cash flows occur at the BEGINNING of the period (Flow at Start).
         const denominator = prevTwrVal + flow;
         
         if (denominator !== 0) {
             const gain = currTwrVal - prevTwrVal - flow;
             const r = gain / denominator;
             twrProduct *= (1 + r);
         }
      }

      // Update 'prev' pointers for next iteration
      prevTwrVal = currTwrVal;
      prevTwrInv = currTwrInv;

      // For Allocation Chart
      // Calculate Value for each component to determine share
      const ppkVal = lastPPK.inv + lastPPK.profit;
      const cryptoVal = lastCrypto.inv + lastCrypto.profit;
      const ikeVal = lastIKE.inv + lastIKE.profit;
      
      const sumVal = ppkVal + cryptoVal + ikeVal;

      return {
        date,
        investment: totalInvestment,
        profit: totalProfit,
        totalValue: totalValue, // Store for calculation checks
        roi: totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0,
        cumulativeTwr: (twrProduct - 1) * 100,
        
        // Shares
        ppkShare: sumVal > 0 ? ppkVal / sumVal : 0,
        cryptoShare: sumVal > 0 ? cryptoVal / sumVal : 0,
        ikeShare: sumVal > 0 ? ikeVal / sumVal : 0,
      };
    });

    return history;
  }, [csvSources]);

  // --- HEATMAP DATA (OMF - Crypto + IKE only) ---
  const heatmapHistoryData = useMemo(() => {
    if (portfolioType !== 'OMF') return [];

    // Only parse Crypto and IKE
    const cryptoRes = parseCSV(csvSources.CRYPTO, 'CRYPTO');
    const ikeRes = parseCSV(csvSources.IKE, 'IKE');

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
         // Updated Request: Use GLOBAL data (including PPK) but keep the TWR Logic + Real ROI for CAGR.
         
         // Use globalHistoryData which includes PPK + Crypto + IKE
         const perfData = globalHistoryData;
         
         if (perfData.length > 0) {
             const currentIndex = perfData.length - 1;
             
             // Function to calculate accumulated TWR from a start index to an end index
             // Matches Heatmap: R = (V_curr - V_prev - Flow) / (V_prev + Flow)
             const calculateAccumulatedTWR = (startIdx: number, endIdx: number) => {
                let product = 1;
                for (let i = startIdx; i <= endIdx; i++) {
                   if (i <= 0) continue; // Need a previous day to calc return for current day
                   
                   const prev = perfData[i-1];
                   const curr = perfData[i];
                   
                   // Global data might not have 'totalValue' explicit prop if derived differently,
                   // so we calculate it on the fly to be safe.
                   const prevVal = prev['totalValue'] !== undefined ? prev['totalValue'] : (prev.investment + prev.profit);
                   const currVal = curr['totalValue'] !== undefined ? curr['totalValue'] : (curr.investment + curr.profit);
                   
                   const flow = curr.investment - prev.investment; 
                   
                   // TWR Flow at Start Assumption
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
             // Aligned with Heatmap Date Shifting Logic.
             // We sum returns starting from the first entry of the current year.
             const currentYear = new Date().getFullYear();
             const firstIndexThisYear = perfData.findIndex(d => new Date(d.date).getFullYear() === currentYear);
             
             if (firstIndexThisYear !== -1) {
                ytd = calculateAccumulatedTWR(firstIndexThisYear, currentIndex);
             }

             // --- LTM (TWR on GLOBAL data) ---
             // Last 12 periods.
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
      return {
        totalValue: row.totalValue,
        totalProfit: row.profit,
        totalEmployee: row.employeeContribution,
        totalEmployer: row.employerContribution,
        totalState: row.stateContribution,
        currentRoi: row.roi,
        currentExitRoi: row.exitRoi
      };
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
      // Check specifically for Krypto portfolio
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
         // Add all non-crypto open assets individually
         result.push({ 
           name: asset.symbol, 
           value: asset.currentValue,
           roi: asset.roi
          });
      }
    });

    if (cryptoRestValue > 0) {
      // Calculate aggregated ROI for "Reszta Krypto"
      const aggRoi = cryptoRestPurchaseValue > 0 
        ? ((cryptoRestValue - cryptoRestPurchaseValue) / cryptoRestPurchaseValue) * 100 
        : 0;

      result.push({ 
        name: 'Reszta Krypto', 
        value: cryptoRestValue,
        roi: aggRoi 
      });
    }

    // Sort by value descending
    return result.sort((a, b) => b.value - a.value);
  }, [omfActiveAssets, portfolioType]);


  // PPK Specific Ratio
  const freeMoneyRatio = useMemo(() => {
    if (portfolioType !== 'PPK' || !stats || !stats.totalEmployee) return 0;
    return (stats.totalProfit / stats.totalEmployee) * 100;
  }, [stats, portfolioType]);

  const getColorClass = (type: string) => {
    switch(type) {
      case 'PPK': return 'bg-indigo-600';
      case 'CRYPTO': return 'bg-violet-600';
      case 'IKE': return 'bg-cyan-600';
      case 'OMF': return 'bg-slate-800';
      default: return 'bg-blue-600';
    }
  };

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
              onClick={() => setPortfolioType('OMF')}
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
              onClick={() => setPortfolioType('PPK')}
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
              onClick={() => setPortfolioType('CRYPTO')}
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
              onClick={() => setPortfolioType('IKE')}
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

            {/* Performance Metrics Grid (Reverted to StatsCard) */}
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

            {/* Global Portfolio History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Globalna Historia Portfela</h3>
                  <p className="text-sm text-slate-500">Symulacja skumulowanego majątku w czasie (PPK + Crypto + IKE)</p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Activity className="text-indigo-600" size={20} />
                </div>
              </div>
              <GlobalSummaryChart data={globalHistoryData} />
            </div>

            {/* Global Performance Chart (Separated) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Efektywność Inwestycyjna</h3>
                  <p className="text-sm text-slate-500">Analiza stopy zwrotu (ROI) oraz TWR w czasie</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
              </div>
              <GlobalPerformanceChart data={globalHistoryData} />
            </div>

            {/* OMF Treemap Chart (NEW) */}
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

            {/* Portfolio Allocation History Chart (New) */}
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
                {/* Active Positions: Title is passed to component to handle dynamic count */}
                <HistoryTable 
                  data={omfActiveAssets} 
                  type="OMF" 
                  omfVariant="active" 
                  title="Aktywne Pozycje" 
                />
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
              <div className={`grid grid-cols-1 gap-6 mb-8 ${portfolioType === 'PPK' ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-4'}`}>
                <StatsCard 
                  title="Wartość Całkowita" 
                  value={`${(stats.totalValue || 0).toLocaleString('pl-PL')} zł`} 
                  icon={Wallet} 
                  colorClass={getTextColorClass(portfolioType)}
                />
                <StatsCard 
                  title={portfolioType === 'PPK' ? "Wkład Własny" : "Zainwestowano"} 
                  value={`${(stats.totalInvestment ?? stats.totalEmployee ?? 0).toLocaleString('pl-PL')} zł`} 
                  icon={Building2} 
                  colorClass={getTextColorClass(portfolioType)}
                />
                
                {/* Removed Employer Card for PPK as requested */}
                {portfolioType === 'PPK' && stats.totalState !== undefined && (
                   /* We display State Contribution in the chart, but maybe not as a card if grid is 3. 
                      Actually, let's put Profit here to fit 3 cols nicely or State. 
                      Let's stick to Profit as the 3rd main card.
                   */
                   <StatsCard 
                    title="Wynik (Mój Zysk)" 
                    value={`${(stats.totalProfit || 0).toLocaleString('pl-PL')} zł`} 
                    trend={stats.currentRoi || 0} 
                    icon={TrendingUp} 
                    colorClass="text-emerald-600" 
                  />
                )}

                {portfolioType !== 'PPK' && (
                  <StatsCard 
                    title="Zysk/Strata" 
                    value={`${(stats.totalProfit || 0).toLocaleString('pl-PL')} zł`} 
                    trend={stats.currentRoi || 0} 
                    icon={TrendingUp} 
                    colorClass={(stats.totalProfit || 0) >= 0 ? "text-emerald-600" : "text-rose-600"} 
                  />
                )}

                {portfolioType === 'PPK' && stats.totalEmployee && (
                   /* Replaced Efficiency calculation */
                   <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-500">Efektywność wpłat</h3>
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                           <Activity size={20} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-2xl font-bold text-slate-900">{(freeMoneyRatio || 0).toFixed(2)}%</span>
                         <span className="text-sm text-slate-400 mt-1">Zysku do wkładu własnego</span>
                      </div>
                   </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'dashboard'
                      ? `border-${portfolioType === 'PPK' ? 'indigo' : portfolioType === 'IKE' ? 'cyan' : 'violet'}-500 text-${portfolioType === 'PPK' ? 'indigo' : portfolioType === 'IKE' ? 'cyan' : 'violet'}-600`
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
                      ? `border-${portfolioType === 'PPK' ? 'indigo' : portfolioType === 'IKE' ? 'cyan' : 'violet'}-500 text-${portfolioType === 'PPK' ? 'indigo' : portfolioType === 'IKE' ? 'cyan' : 'violet'}-600`
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Historia
                </button>
              </nav>
            </div>

            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {portfolioType === 'PPK' ? (
                  /* PPK Visualizations */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Make Value Chart Full Width */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">Wzrost Wartości Portfela</h3>
                      <ValueCompositionChart data={data} />
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">ROI w czasie</h3>
                      <ROIChart data={data} />
                    </div>

                    {/* New Capital Structure History Chart (Full Width below ROI) */}
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
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">Zysk/Strata Netto (Miesięcznie)</h3>
                      <CryptoProfitChart data={data} />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">ROI w czasie</h3>
                      <ROIChart data={data} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
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
