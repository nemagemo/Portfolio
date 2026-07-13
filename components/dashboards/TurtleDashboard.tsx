
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Turtle, TrendingUp, Trophy, Info, Target, Wallet, Moon, Activity, Flag, ChevronDown, ChevronUp, X } from 'lucide-react';
import { CesarzLogo } from '../../logos/CesarzLogo';
import { Theme, themeStyles } from '../../theme/styles';
import { OMFDataRow, DividendDataRow } from '../../types';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { CryptoValueChart, ROIChart } from '../Charts';

interface TurtleDashboardProps {
  theme: Theme;
  activeAssets: OMFDataRow[];
  closedAssets: OMFDataRow[];
  onlinePrices: Record<string, number> | null;
  historyPrices: Record<string, number> | null;
  dividends?: DividendDataRow[];
}

interface TurtleState {
  id: number;
  name: string;
  initialCapital: number;
  currentValue: number;
  color: string;
  currentStock: string;
  countryCode: string;
  roi: number;
  profit: number;
  isActive: boolean;
  trackNumber: number;
  isDanger: boolean;
}

export const TurtleDashboard: React.FC<TurtleDashboardProps> = ({ 
  theme, 
  activeAssets, 
  closedAssets,
  onlinePrices,
  historyPrices,
  dividends = []
}) => {
  const styles = themeStyles[theme];
  const [isGPInfoExpanded, setIsGPInfoExpanded] = useState(false);
  const [expandedTurtleName, setExpandedTurtleName] = useState<string | null>(null);

  // Fetch history data for Turtle portfolio
  const { data: historyData } = usePortfolioData({
    portfolioType: 'TURTLES_HISTORY',
    onlinePrices,
    historyPrices
  });

  // Helper to get flag URL
  const getFlagUrl = (ticker: string) => {
    if (!ticker || ticker === '-') return 'https://flagcdn.com/w40/un.png';
    const t = ticker.toUpperCase();
    if (t.endsWith('.PL')) return 'https://flagcdn.com/w40/pl.png';
    if (t.endsWith('.US')) return 'https://flagcdn.com/w40/us.png';
    if (t.endsWith('.L')) return 'https://flagcdn.com/w40/gb.png';
    if (t.endsWith('.DE')) return 'https://flagcdn.com/w40/de.png';
    // Check common polish symbols
    const polishSymbols = ['ARH', 'ODL', 'CMP', 'LBW', 'MBR', 'VRG', 'XTB', 'ORL', 'SEK', 'APE', 'TOR', 'OPN', 'UNT'];
    if (polishSymbols.includes(t)) return 'https://flagcdn.com/w40/pl.png';
    const ukSymbols = ['RPI'];
    if (ukSymbols.includes(t)) return 'https://flagcdn.com/w40/gb.png';
    return 'https://flagcdn.com/w40/us.png'; // Fallback
  };

  const cleanSymbol = (symbol: string) => {
    if (!symbol) return '';
    return symbol.split('.')[0];
  };

  const turtles: TurtleState[] = useMemo(() => {
    // 1. Filter assets belonging to "Żółwie"
    const turtleActive = activeAssets.filter(a => a.portfolio === 'Żółwie');
    const turtleClosed = closedAssets.filter(a => a.portfolio === 'Żółwie');
    
    // 2. Setup predefined ones and dynamically discover new ones from active/closed assets
    const predefinedNames = ['Oktawian', 'Tyberiusz', 'Kaligula', 'Klaudiusz', 'Neron', 'Galba', 'Oton', 'Witeliusz', 'Wespazjan', 'Tytus'];
    const turtleColors = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#10b981', '#f97316'];
    
    const parsedNamesSet = new Set<string>();
    [...turtleActive, ...turtleClosed].forEach(a => {
      if (a.sector && a.sector.trim()) {
        const name = a.sector.trim();
        // Capitalize first letter neatly
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        parsedNamesSet.add(formattedName);
      }
    });

    const turtleNamesMap = new Set<string>(predefinedNames);
    parsedNamesSet.forEach(name => {
      const hasItem = Array.from(turtleNamesMap).some(existing => existing.toLowerCase() === name.toLowerCase());
      if (!hasItem) {
        turtleNamesMap.add(name);
      }
    });
    const turtleNames = Array.from(turtleNamesMap);
    
    // 2.5 Calculate the total value of "Żółwie" portfolio to check 1.5% threshold
    let totalTurtlesValue = 0;
    turtleNames.forEach(name => {
      const myActive = turtleActive.filter(a => a.sector?.trim().toLowerCase() === name.toLowerCase());
      const myClosed = turtleClosed.filter(a => a.sector?.trim().toLowerCase() === name.toLowerCase());
      
      const mySymbols = [...myActive, ...myClosed].map(a => a.symbol.toLowerCase());
      const turtleDividends = dividends
        .filter(d => (d.portfolio === 'Żółwie' || d.portfolio === 'IKE') && d.symbol && mySymbols.includes(d.symbol.toLowerCase()))
        .reduce((sum, d) => sum + d.value, 0);

      const activeProfit = myActive.reduce((sum, a) => sum + a.profit, 0);
      const closedProfit = myClosed.reduce((sum, a) => sum + a.profit, 0);
      const totalProfit = activeProfit + closedProfit + turtleDividends;
      
      const initialCapital = myActive.filter(a => a.type !== 'Gotówka' && a.symbol !== 'PLN-Żółwie').reduce((sum, a) => sum + a.purchaseValue, 0) + myClosed.reduce((sum, a) => sum + a.purchaseValue, 0);
      totalTurtlesValue += (initialCapital + totalProfit);
    });

    // 3. Calculate fixed track assignments
    const allAssets = [...turtleActive, ...turtleClosed];
    const turtleFirstDates = turtleNames.map(name => {
      const assets = allAssets.filter(a => a.sector?.trim().toLowerCase() === name.toLowerCase());
      // We look for any lastPurchaseDate in all assets for this turtle
      const dates = assets
        .map(a => new Date(a.lastPurchaseDate).getTime())
        .filter(t => !isNaN(t));
      const firstDate = dates.length > 0 ? Math.min(...dates) : Infinity;
      return { name, firstDate };
    });

    // Special rule: Oktawian is always Track 1
    // Others are sorted by first transaction date, then by name order if no date
    const othersSorted = turtleFirstDates
      .filter(t => t.name !== 'Oktawian')
      .sort((a, b) => {
        if (a.firstDate !== b.firstDate) return a.firstDate - b.firstDate;
        return turtleNames.indexOf(a.name) - turtleNames.indexOf(b.name);
      });

    const trackMap = new Map<string, number>();
    trackMap.set('Oktawian', 1);
    othersSorted.forEach((t, i) => {
      trackMap.set(t.name, i + 2);
    });

    // 4. Aggregate data per turtle
    return turtleNames.map((name, idx) => {
      const myActive = turtleActive.filter(a => a.sector?.trim().toLowerCase() === name.toLowerCase());
      const myClosed = turtleClosed.filter(a => a.sector?.trim().toLowerCase() === name.toLowerCase());
      
      let currentValue = 0;
      let purchaseValue = 0;
      let currentStock = '-';
      let isActive = false;

      // Current portfolio content (Open)
      myActive.forEach(a => {
        currentValue += a.currentValue;
        purchaseValue += a.purchaseValue;
        if (a.type !== 'Gotówka' && a.quantity > 0) {
          currentStock = a.symbol;
          isActive = true;
        }
      });

      const mySymbols = [...myActive, ...myClosed].map(a => a.symbol.toLowerCase());
      const turtleDividends = dividends
        .filter(d => (d.portfolio === 'Żółwie' || d.portfolio === 'IKE') && d.symbol && mySymbols.includes(d.symbol.toLowerCase()))
        .reduce((sum, d) => sum + d.value, 0);

      const activeProfit = myActive.reduce((sum, a) => sum + a.profit, 0);
      const closedProfit = myClosed.reduce((sum, a) => sum + a.profit, 0);
      const totalProfit = activeProfit + closedProfit + turtleDividends;
      
      const hasActivity = myActive.some(a => a.currentValue > 0 || a.purchaseValue > 0) || myClosed.length > 0;
      
      // Calculate real capital based on purchase values (excluding virtual cash PLN-Żółwie rows to prevent double-counting of dividends)
      const initialCapital = myActive.filter(a => a.type !== 'Gotówka' && a.symbol !== 'PLN-Żółwie').reduce((sum, a) => sum + a.purchaseValue, 0) + myClosed.reduce((sum, a) => sum + a.purchaseValue, 0);
      const totalEquity = initialCapital + totalProfit;
      const roi = initialCapital > 0 ? (totalProfit / initialCapital) * 100 : 0;

      // Check if loss on any position is > 1.5% of the total turtles portfolio value
      const hasLargeLoss = myActive.some(a => {
        const lossOnPosition = a.profit < 0 ? -a.profit : 0;
        return totalTurtlesValue > 0 && lossOnPosition > 0.015 * totalTurtlesValue;
      });

      const isDanger = hasLargeLoss;

      return {
        id: idx + 1,
        name: hasActivity ? name : (name === 'Oktawian' ? 'Oktawian' : '?'), // Keep Oktawian's name visible
        initialCapital,
        currentValue: totalEquity,
        color: turtleColors[idx % turtleColors.length],
        currentStock,
        countryCode: 'PL', 
        roi,
        profit: totalProfit,
        isActive: hasActivity && isActive,
        trackNumber: trackMap.get(name) || (idx + 1),
        isDanger
      };
    }).sort((a, b) => {
      // Prioritize turtles with activity (initialCapital > 0)
      if (a.initialCapital > 0 && b.initialCapital > 0) {
        return b.roi - a.roi || b.profit - a.profit;
      }
      if (a.initialCapital > 0) return -1;
      if (b.initialCapital > 0) return 1;
      return 0;
    });
  }, [activeAssets, closedAssets, dividends]);

  const totalCapital = turtles.reduce((sum, t) => sum + t.initialCapital, 0);
  const totalValue = turtles.reduce((sum, t) => sum + t.currentValue, 0);
  const totalProfit = totalValue - totalCapital;
  const totalRoi = totalCapital > 0 ? (totalProfit / totalCapital) * 100 : 0;

  const targetValue = 10000;
  const progressPercent = Math.min(100, (totalValue / targetValue) * 100);

  const profitLeader = useMemo(() => {
    const activeOnes = turtles.filter(t => t.initialCapital > 0);
    if (activeOnes.length === 0) return '-';
    // The sorting in the main memo already handles this, but let's be explicit if needed.
    // Since turtles is already sorted by profit for those with capital, turtles[0] is the leader.
    return activeOnes[0].name;
  }, [turtles]);

  const trackScale = useMemo(() => {
    const allRois = turtles.map(t => t.roi);
    const minScale = Math.min(-20, ...allRois);
    const maxScale = Math.max(40, ...allRois);
    const range = maxScale - minScale;
    const zeroPos = Math.max(0, Math.min(100, ((0 - minScale) / range) * 100));
    return { minScale, maxScale, range, zeroPos };
  }, [turtles]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Strategia Żółwia</h1>
          <p className="text-slate-500 mt-1">Eksperymentalny portfel częściowo oparty na strategii Żółwia.</p>
          <p className="text-slate-300 mt-1">Prezentowane wyniki uwzględniają dywidendy.</p>
        </div>
      </div>

      {/* Graphical Summary Section */}
      <div className={`${styles.cardBg} ${styles.cardBorder} p-10 rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative group`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          {turtles.map((t, i) => {
            const positions = [
              { top: '10%', left: '15%', rotate: '12deg', size: 120 },
              { top: '65%', left: '5%', rotate: '-15deg', size: 80 },
              { top: '80%', left: '30%', rotate: '45deg', size: 100 },
              { top: '15%', left: '80%', rotate: '-10deg', size: 140 },
              { top: '60%', left: '85%', rotate: '20deg', size: 90 },
              { top: '40%', left: '10%', rotate: '180deg', size: 60 },
              { top: '5%', left: '45%', rotate: '-90deg', size: 110 },
              { top: '85%', left: '65%', rotate: '30deg', size: 70 },
              { top: '45%', left: '75%', rotate: '10deg', size: 130 },
              { top: '25%', left: '40%', rotate: '-20deg', size: 85 },
            ];
            const pos = positions[i] || { top: '50%', left: '50%', rotate: '0deg', size: 50 };
            return (
              <div 
                key={`bg-turtle-${t.id}`}
                className="absolute text-slate-200/40"
                style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate})` }}
              >
                {t.name === 'Oktawian' ? (
                  <CesarzLogo style={{ width: pos.size, height: pos.size }} />
                ) : (
                  <Turtle size={pos.size} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">
          <div className="flex flex-col gap-8 w-full lg:w-1/3">
            <motion.div whileHover={{ x: 10 }} className="flex items-center gap-4 text-right justify-end">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suma Wkładu</p>
                <p className="text-2xl font-black text-slate-900">{totalCapital.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Wallet size={24} /></div>
            </motion.div>

            <motion.div whileHover={{ x: 10 }} className="flex items-center gap-4 text-right justify-end">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wartość Portfela</p>
                <p className="text-2xl font-black text-slate-900">{totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><Target size={24} /></div>
            </motion.div>
          </div>

          <div className="relative flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute w-64 h-64 ${totalProfit >= 0 ? 'bg-emerald-100' : 'bg-rose-100'} rounded-full blur-3xl`} 
            />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`absolute w-72 h-72 border-2 border-dashed ${totalProfit >= 0 ? 'border-emerald-200' : 'border-rose-200'} rounded-full`} 
            />
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`relative z-20 w-48 h-48 bg-white rounded-full shadow-2xl border-4 ${totalProfit >= 0 ? 'border-emerald-500 group-hover:border-emerald-400' : 'border-rose-500 group-hover:border-rose-400'} flex flex-col items-center justify-center overflow-hidden transition-colors`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${totalProfit >= 0 ? 'from-emerald-500/10' : 'from-rose-500/10'} to-transparent`} />
              <div className={`mb-2 p-4 ${totalProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} rounded-full shadow-sm`}>
                <Turtle size={48} className="animate-pulse" />
              </div>
              <div className="text-center px-4">
                <p className={`text-[10px] font-bold ${totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'} uppercase tracking-tighter leading-none mb-1`}>Status Portfela</p>
                <p className={`text-xl font-black tracking-tighter ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {totalRoi >= 0 ? '+' : ''}{totalRoi.toFixed(2)}%
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-8 w-full lg:w-1/3">
            <motion.div whileHover={{ x: -10 }} className="flex items-center gap-4 text-left justify-start">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner"><TrendingUp size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zysk Całkowity</p>
                <p className={`text-2xl font-black ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: -10 }} className="flex items-center gap-4 text-left justify-start">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-inner"><Trophy size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lider</p>
                <p className="text-2xl font-black text-slate-900">{profitLeader}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Turtle Grand Prix - New Horizontal Race Design */}
      <div className={`${styles.cardBg} ${styles.cardBorder} p-6 md:px-10 md:pt-8 md:pb-6 rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative`}>
        {/* Stadium Background Elements */}
        <div className="absolute inset-0 bg-slate-50/30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                <Trophy size={12} className="fill-amber-700" /> Live Championship
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Grand Prix Żółwi</h2>
            </div>
          </div>

          {/* Grand Prix Race Tracker Alert/Progress */}
          <div className="mb-8 p-6 bg-slate-50 text-slate-850 rounded-3xl shadow-sm border border-slate-200/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-slate-50/10 to-transparent pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full" />
            
            <div className="relative z-10 space-y-4">
              {/* Header with Title and Rules toggle in the upper area */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-md tracking-wider uppercase">
                  Wyścig #1
                </span>
                <button
                  onClick={() => setIsGPInfoExpanded(!isGPInfoExpanded)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition-all font-semibold cursor-pointer py-1 px-2.5 rounded"
                >
                  <Info size={13} className="text-slate-400" />
                  <span>Zasady Grand Prix</span>
                  {isGPInfoExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {/* Dynamiczny Tor Postępu - Full Width (od brzegu do brzegu) */}
              <div className="w-full bg-white p-4 rounded-2xl border border-slate-200/85 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Flag size={14} className="text-slate-500" />
                    Bieżący Dystans: <span className="text-slate-900 text-sm font-black">{totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł</span>
                  </span>
                  <span className="text-emerald-600 font-extrabold text-sm">{progressPercent.toFixed(1)}%</span>
                </div>
                
                {/* Visual road progress track */}
                <div className="relative h-7 bg-slate-100 rounded-full border border-slate-200/70 p-0.5 overflow-hidden flex items-center">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_50%,#f1f5f9_50%,#f1f5f9_75%,transparent_75%,transparent)] bg-[length:16px_16px] opacity-60" />
                  
                  {/* Progress fill */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-emerald-400 rounded-full flex items-center justify-end px-1.5 relative shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    <div className="h-4 w-4 bg-white rounded-full flex items-center justify-center shadow-lg border border-emerald-500 animate-pulse">
                      <Turtle size={10} className="text-emerald-600 rotate-12" />
                    </div>
                  </motion.div>
                  
                  {/* Flag indicator at finish */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-md border border-slate-200 shadow-xs pointer-events-none">
                    <Flag size={10} className="text-amber-500 fill-amber-500 animate-bounce" />
                    <span className="text-[8px] font-black tracking-wider text-slate-700 uppercase">10k META</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Start: 0,00 zł</span>
                  <span className="text-emerald-600 font-extrabold">Pozostało: {(10000 - totalValue > 0 ? 10000 - totalValue : 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł</span>
                </div>
              </div>

              {/* Zasady Grand Prix - Dropping / Expanding BELOW the track */}
              {isGPInfoExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-1.5 overflow-hidden shadow-xs"
                >
                  <h3 className="text-xs font-black tracking-wider uppercase text-emerald-600">
                    Misja 10 000,00 PLN
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Żółwie dobierają, kupują lub sprzedają pozycje w ramach aktualnego <strong className="text-slate-800 font-bold">Wyścigu #1</strong>. 
                    Po osiągnięciu wyceny całego portfela <span className="text-emerald-600 font-bold">10 000,00 zł</span> rozpocznie się <strong className="text-slate-800 font-bold">Wyścigu #2</strong>. 
                    Nowo otwierane pozycje będą odtąd klasyfikowane w kolejnej edycji zmagań.
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="relative space-y-1">
            {/* The Track Base - Overlay layer for lines */}
            <div className="absolute inset-y-0 left-16 right-0 z-20 pointer-events-none">
              <div className="absolute inset-y-0 left-0 w-1 bg-slate-200/50 rounded-full" />
              
              {/* FINISH Line (The Meta) - Checkerboard lane on the right, across whole height */}
              <div className="absolute inset-y-0 right-0 w-8 z-10">
                <div className="absolute inset-0 bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] opacity-20 shadow-inner" />
                <div className="absolute inset-y-0 left-0 w-px bg-slate-300/50" />
              </div>
              
              {/* START Line (0% ROI) */}
              <div 
                className="absolute inset-y-0 border-l-2 border-slate-900/30"
                style={{ left: `${trackScale.zeroPos}%` }}
              />
            </div>

            {turtles.slice().sort((a, b) => a.trackNumber - b.trackNumber).map((turtle) => {
              const isActive = turtle.isActive;
              let progress = Math.max(0, Math.min(100, ((turtle.roi - trackScale.minScale) / trackScale.range) * 100));
              if (totalValue < 10000) {
                progress = Math.min(92, progress);
              }
              const isPositive = turtle.roi >= 0;
              
              return (
                <div key={`gp-${turtle.id}`} className={`relative h-14 group/gp-lane border-y ${turtle.isDanger ? 'border-red-200' : 'border-slate-100/50'}`}>
                  {/* Lane Label (Fixed on the left) */}
                  <div className={`absolute inset-y-0 left-0 w-16 z-30 flex items-center justify-start pl-4 border-r ${turtle.isDanger ? 'border-red-200 bg-red-100/40 text-red-500 font-bold' : 'border-slate-200/50 bg-slate-50 text-slate-300'} text-[10px] font-black italic group-hover/gp-lane:text-indigo-400 group-hover/gp-lane:bg-indigo-50/30 transition-colors`}>
                    TOR {String(turtle.trackNumber).padStart(2, '0')}
                  </div>

                  {/* Lane Background (placed under the lines layer z-20) */}
                  <div className="absolute inset-0 left-16 right-0 z-10">
                    <div className={`absolute inset-0 ${turtle.isDanger ? 'bg-gradient-to-r from-red-50/30 to-rose-50/50 group-hover/gp-lane:bg-red-100/20' : 'bg-white group-hover/gp-lane:bg-slate-50/50'} transition-colors`} />
                  </div>

                  {/* Movable Area Content (placed above the lines layer z-20) */}
                  <div className="absolute inset-y-0 left-16 right-0 z-30">
                    {/* Track Safe Zone: Prevents any turtle elements from overlapping labels or the checkerboard finish region */}
                    <div className="absolute inset-y-0 left-7 right-10">
                      {/* Turtle Movable Unit */}
                      <motion.div
                        animate={{ left: `${progress}%` }}
                        transition={{ duration: 2.5, type: 'spring', stiffness: 35, damping: 15 }}
                        className="absolute top-0 bottom-0 z-50 flex items-center"
                      >
                        <div className="relative flex items-center">
                          {/* THE CENTERING WRAPPER: Centers the badge on the coordinate */}
                          <div className="absolute left-0 -translate-x-1/2 flex items-center justify-center">
                            {/* Shadow / Tail effect */}
                            <div className={`absolute -left-20 right-0 h-0.5 opacity-20 bg-gradient-to-r from-transparent to-current transition-opacity group-hover/gp-lane:opacity-40`} style={{ color: turtle.color }} />
                            
                            {/* Turtle Badge */}
                            {turtle.name === 'Oktawian' ? (
                              <div className={`relative transition-all duration-500 group-hover/gp-lane:rotate-6 ${!isActive ? 'grayscale opacity-40' : ''}`}>
                                {!isActive && (
                                  <div className="absolute -right-1 -top-1 bg-indigo-100 text-indigo-600 rounded-full p-1 border-2 border-white shadow-sm z-10">
                                    <Moon size={10} className="fill-indigo-300" />
                                  </div>
                                )}
                                <CesarzLogo style={{ color: turtle.color }} className={`w-9 h-9 ${isActive ? 'animate-bounce' : ''}`} />
                              </div>
                            ) : (
                              <div 
                                className={`relative p-2.5 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 transition-all duration-500 group-hover/gp-lane:rotate-6 ${!isActive ? 'grayscale opacity-40' : ''}`}
                                style={{ borderColor: turtle.color }}
                              >
                                {!isActive && (
                                  <div className="absolute -right-3 -top-3 bg-indigo-100 text-indigo-600 rounded-full p-1 border-2 border-white shadow-sm">
                                    <Moon size={10} className="fill-indigo-300" />
                                  </div>
                                )}
                                <Turtle size={24} style={{ color: turtle.color }} className={isActive ? 'animate-bounce' : ''} />
                              </div>
                            )}
                          </div>

                          {/* Data Bubble (Offset to clear the badge) */}
                          <div className="ml-8 pointer-events-none transition-all duration-500 translate-y-0 group-hover/gp-lane:-translate-y-1">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-2">
                                {turtle.name}
                                {isActive && (
                                  <img src={getFlagUrl(turtle.currentStock)} alt="" className="w-3 h-2.5 object-cover rounded shadow-sm" />
                                )}
                              </span>
                              <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1`}>
                                {isPositive ? '▲' : '▼'} {Math.abs(turtle.roi).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Value Composition */}
        <div className={`p-6 ${styles.cardBg} ${styles.cardBorder} rounded-2xl border border-slate-200 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" /> Wartość Portfela
            </h3>
            <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
              <Wallet size={20} className="text-blue-600" />
            </div>
          </div>
          <CryptoValueChart 
            data={historyData} 
            themeMode={theme as any} 
          />
        </div>

        {/* 2. ROI Analysis */}
        <div className={`p-6 ${styles.cardBg} ${styles.cardBorder} rounded-2xl border border-slate-200 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity size={20} className="text-purple-600" /> Stopa zwrotu w czasie
            </h3>
            <div className={`p-2 rounded-lg ${styles.cardHeaderIconBg}`}>
              <TrendingUp size={20} className="text-purple-600" />
            </div>
          </div>
          <ROIChart 
            data={historyData} 
            themeMode={theme as any} 
          />
        </div>
      </div>

      {/* Ranking Żółwi Table */}
      <div className={`${styles.cardBg} ${styles.cardBorder} rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12`}>
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold flex items-center gap-2"><Target size={18} className="text-blue-500" /> Ranking Żółwi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/30">
                <th className="px-6 py-3">Poz.</th>
                <th className="px-6 py-3">Żółw</th>
                <th className="px-6 py-3">Aktualna pozycja</th>
                <th className="px-6 py-3 text-right">Kapitał Początkowy</th>
                <th className="px-6 py-3 text-right">Wycena</th>
                <th className="px-6 py-3 text-right">Zysk</th>
                <th className="px-6 py-3 text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {turtles.map((turtle, index) => {
                const isActive = turtle.isActive;
                const name = turtle.name;
                const myActive = activeAssets.filter(a => a.portfolio === 'Żółwie' && a.sector?.trim().toLowerCase() === name.toLowerCase());
                const myClosed = closedAssets.filter(a => a.portfolio === 'Żółwie' && a.sector?.trim().toLowerCase() === name.toLowerCase());
                const mySymbols = [...myActive, ...myClosed].map(a => a.symbol.toLowerCase());
                const myDividends = dividends.filter(d => 
                  (d.portfolio === 'Żółwie' || d.portfolio === 'IKE') && 
                  d.symbol &&
                  mySymbols.includes(d.symbol.toLowerCase())
                );

                const activeProfitSum = myActive.reduce((sum, a) => sum + a.profit, 0);
                const closedProfitSum = myClosed.reduce((sum, a) => sum + a.profit, 0);
                const totalDividendsSum = myDividends.reduce((sum, d) => sum + d.value, 0);
                const calculatedTotalProfit = activeProfitSum + closedProfitSum + totalDividendsSum;
                const isExpanded = expandedTurtleName === turtle.name;

                return (
                  <React.Fragment key={turtle.id}>
                    <tr className={`transition-all duration-300 ${turtle.isDanger ? 'bg-red-50/50 hover:bg-red-100/40 text-red-900 border-l-4 border-l-red-500' : 'hover:bg-slate-50'} ${!isActive ? 'opacity-60' : ''} ${isExpanded ? 'bg-slate-50/55' : ''}`}>
                      <td className="px-6 py-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive && index < 3 && !turtle.isDanger ? 'bg-amber-100 text-amber-700' : turtle.isDanger ? 'bg-red-100 text-red-700' : 'text-slate-400'}`}>
                          {index + 1}
                        </div>
                      </td>
                      <td 
                        className="px-6 py-4 cursor-pointer select-none group/turtle-name"
                        onClick={() => setExpandedTurtleName(isExpanded ? null : turtle.name)}
                      >
                        <div className="flex items-center gap-3">
                          {turtle.name === 'Oktawian' ? (
                            <CesarzLogo 
                              style={{ color: turtle.isDanger ? '#ef4444' : turtle.color }} 
                              className={`w-[18px] h-[18px] transition-all duration-300 ${!isActive ? 'grayscale opacity-70' : ''} ${turtle.isDanger ? 'animate-pulse' : ''} group-hover/turtle-name:scale-110`} 
                            />
                          ) : (
                            <Turtle 
                              size={18} 
                              style={{ color: turtle.isDanger ? '#ef4444' : turtle.color }} 
                              className={`transition-all duration-300 ${!isActive ? 'grayscale opacity-70' : ''} ${turtle.isDanger ? 'animate-pulse' : ''} group-hover/turtle-name:scale-110`} 
                            />
                          )}
                          <span className={`font-semibold transition-colors duration-200 group-hover/turtle-name:text-blue-600 ${turtle.isDanger ? 'text-red-700 font-black' : 'text-slate-700'}`}>
                            {turtle.name}
                          </span>
                          <ChevronDown 
                            size={14} 
                            className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} 
                          />
                          {turtle.isDanger && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] font-black rounded-full uppercase tracking-wider animate-pulse border border-red-200">
                              WYSOKIE RYZYKO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {isActive ? (
                            <>
                              <div className="w-8 h-6 rounded bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                <img src={getFlagUrl(turtle.currentStock)} alt="flag" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-xs font-bold text-slate-900 tracking-tight">{cleanSymbol(turtle.currentStock)}</span>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full shadow-inner ring-4 ring-indigo-50/10">
                              <div className="relative">
                                <Moon size={9} className="text-indigo-500 fill-indigo-200 animate-pulse" />
                                <div className="absolute inset-0 bg-indigo-400 blur-sm opacity-20" />
                              </div>
                              <span className="text-[7px] font-black text-indigo-400 tracking-widest leading-none">ZZZ</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">{turtle.initialCapital.toFixed(2)} zł</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">{turtle.currentValue.toFixed(2)} zł</td>
                      <td className={`px-6 py-4 text-right font-bold ${turtle.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {turtle.profit.toFixed(2)} zł
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${turtle.roi >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {turtle.roi.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={7} className="p-0 border-t border-b border-dashed border-slate-200">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                            className="px-6 py-6 overflow-hidden"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Left Panel: ROI Calculation Details (col-span-12 lg:col-span-4) */}
                              <div className="lg:col-span-4 space-y-4">
                                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Target size={14} className="text-blue-500" /> Obliczenia ROI: {turtle.name}
                                  </h4>
                                  
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500 font-medium">Wkład początkowy (Wpłaty):</span>
                                      <span className="font-mono font-bold text-slate-800">
                                        {turtle.initialCapital.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                                      </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500 font-medium">Wynik otwartych pozycji:</span>
                                      <span className={`font-mono font-bold ${activeProfitSum >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {activeProfitSum >= 0 ? '+' : ''}{activeProfitSum.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500 font-medium">Wynik zamkniętych pozycji:</span>
                                      <span className={`font-mono font-bold ${closedProfitSum >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {closedProfitSum >= 0 ? '+' : ''}{closedProfitSum.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500 font-medium">Otrzymane dywidendy:</span>
                                      <span className="font-mono font-bold text-emerald-600">
                                        +{totalDividendsSum.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                                      </span>
                                    </div>

                                    <div className="border-t border-slate-100 my-2 pt-3 flex justify-between items-center">
                                      <span className="text-xs font-bold text-slate-700">Całkowity zysk (Suma):</span>
                                      <span className={`font-mono font-black text-sm ${calculatedTotalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {calculatedTotalProfit >= 0 ? '+' : ''}{calculatedTotalProfit.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                                      </span>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center mt-3 border border-slate-100">
                                      <span className="text-xs font-bold text-slate-600">ROI Żółwia:</span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-black ${turtle.roi >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                        {turtle.roi.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium leading-relaxed">
                                    Wzór: <code>(Wynik Otwartych + Wynik Zamkniętych + Dywidendy) / Wpłaty</code>. Wszystkie dywidendy ze spółek posiadanych przez danego Żółwia powiększają jego zysk i ROI.
                                  </div>
                                </div>
                              </div>

                              {/* Right Panel: Operations & Dividends (col-span-12 lg:col-span-8) */}
                              <div className="lg:col-span-8 space-y-6">
                                {/* Positions section */}
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                  <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                                    <Activity size={14} className="text-purple-500" />
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Historia Pozycji ({[...myActive, ...myClosed].length})</h4>
                                  </div>
                                  
                                  {[...myActive, ...myClosed].length === 0 ? (
                                    <p className="p-4 text-xs text-slate-400 italic">Brak aktywnych lub zamkniętych pozycji dla tego Żółwia.</p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs">
                                        <thead>
                                          <tr className="bg-slate-50/10 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                                            <th className="px-4 py-2">Symbol</th>
                                            <th className="px-4 py-2">Ilość</th>
                                            <th className="px-4 py-2 text-right">Koszt zakupu</th>
                                            <th className="px-4 py-2 text-right">Bieżąca wycena</th>
                                            <th className="px-4 py-2 text-right">Zysk / Strata</th>
                                            <th className="px-4 py-2 text-right">ROI</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-mono">
                                          {[...myActive, ...myClosed].map((item, idx) => {
                                            const itemRoi = item.purchaseValue > 0 ? (item.profit / item.purchaseValue) * 100 : 0;
                                            const isPlnCash = item.symbol === 'PLN-Żółwie' || item.symbol === 'PLN';
                                            return (
                                              <tr key={idx} className="hover:bg-slate-50/30">
                                                <td className="px-4 py-2.5 font-bold text-slate-800 flex items-center gap-2 font-sans text-left">
                                                  <div className="w-5 h-4 rounded bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    <img src={isPlnCash ? 'https://flagcdn.com/w40/pl.png' : getFlagUrl(item.symbol)} alt="flag" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                  </div>
                                                  <span>{isPlnCash ? 'PLN' : cleanSymbol(item.symbol)}</span>
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-600">
                                                  {isPlnCash ? '-' : item.quantity.toFixed(4)}
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-slate-600">
                                                  {item.purchaseValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-slate-800">
                                                  {isPlnCash 
                                                    ? '-' 
                                                    : item.status === 'Otwarta' 
                                                      ? item.currentValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł'
                                                      : '-'
                                                  }
                                                </td>
                                                <td className={isPlnCash ? 'px-4 py-2.5 text-right text-slate-400' : `px-4 py-2.5 text-right font-bold ${item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                  {isPlnCash 
                                                    ? '-' 
                                                    : (item.profit >= 0 ? '+' : '') + item.profit.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł'
                                                  }
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                  {isPlnCash ? (
                                                    <span className="text-slate-400">-</span>
                                                  ) : (
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${itemRoi >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                      {itemRoi.toFixed(1)}%
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="px-4 py-2.5 text-center font-sans text-slate-400">
                                                  {isPlnCash ? '-' : (
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${item.status === 'Otwarta' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                                                      {item.status}
                                                    </span>
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>

                                {/* Dividends section */}
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                  <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                                    <TrendingUp size={14} className="text-emerald-500" />
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Otrzymane Dywidendy ({myDividends.length})</h4>
                                  </div>
                                  
                                  {myDividends.length === 0 ? (
                                    <p className="p-4 text-xs text-slate-400 italic font-sans text-left">Brak otrzymanych dywidend dla spółek tego Żółwia.</p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs">
                                        <thead>
                                          <tr className="bg-slate-50/10 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                                            <th className="px-4 py-2">Data</th>
                                            <th className="px-4 py-2 flex items-center gap-1.5">Spółka</th>
                                            <th className="px-4 py-2 text-right">Kwota Netto</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-mono">
                                          {myDividends.map((div, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/30">
                                              <td className="px-4 py-2.5 text-slate-500">{div.date}</td>
                                              <td className="px-4 py-2.5 font-bold text-slate-800 font-sans text-left">{cleanSymbol(div.symbol)}</td>
                                              <td className="px-4 py-2.5 text-right font-black text-emerald-600 font-mono">
                                                +{div.value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                                              </td>
                                              <td className="px-4 py-2.5 text-center font-sans">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black ${div.isCounted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                  {div.isCounted ? 'UWZGLĘDNIONA' : 'Tylko wizualna'}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions Section (Derived from OMF Data) */}
      <div className={`${styles.cardBg} ${styles.cardBorder} rounded-2xl shadow-sm border border-slate-200 overflow-hidden`}>
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500" /> Historia Operacji Żółwi</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wszystkie akcje</span>
        </div>
        <div className="overflow-x-auto">
          {useMemo(() => {
            const turtleAssetsSymbols = [...activeAssets, ...closedAssets]
              .filter(a => a.portfolio === 'Żółwie' && a.type !== 'Gotówka')
              .reduce((acc, a) => {
                if (a.sector) {
                  acc[a.symbol.toLowerCase()] = a.sector;
                }
                return acc;
              }, {} as Record<string, string>);

            const turtleTransactions = [...activeAssets, ...closedAssets]
              .filter(a => a.portfolio === 'Żółwie' && a.type !== 'Gotówka')
              .map(a => ({
                date: a.lastPurchaseDate,
                dateObj: new Date(a.lastPurchaseDate),
                turtle: a.sector || 'Nieznany Żółw',
                type: a.status === 'Otwarta' ? 'Kupno' : 'Sprzedaż',
                symbol: a.symbol,
                quantity: a.quantity,
                value: a.purchaseValue,
                status: a.status,
                isDividend: false
              }));

            const turtleDividends = dividends
              .filter(d => (d.portfolio === 'Żółwie' || d.portfolio === 'IKE') && d.symbol && turtleAssetsSymbols[d.symbol.toLowerCase()])
              .map(d => ({
                date: d.date,
                dateObj: d.dateObj || new Date(d.date),
                turtle: turtleAssetsSymbols[d.symbol.toLowerCase()],
                type: 'Dywidenda',
                symbol: d.symbol,
                quantity: null as number | null,
                value: d.value,
                status: 'Otrzymana',
                isDividend: true
              }));

            const combinedHistory = [...turtleTransactions, ...turtleDividends]
              .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
            
            if (combinedHistory.length === 0) return (
              <div className="p-12 text-center">
                <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
                  <Info size={32} />
                </div>
                <p className="text-slate-500 font-medium">Brak historii operacji w tym portfelu.</p>
                <p className="text-xs text-slate-400 mt-1">Operacje i dywidendy pojawią się automatycznie.</p>
              </div>
            );

            return (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Żółw</th>
                    <th className="px-6 py-3">Typ</th>
                    <th className="px-6 py-3">Symbol</th>
                    <th className="px-6 py-3">Ilość</th>
                    <th className="px-6 py-3 text-right">Koszt / Wartość</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {combinedHistory.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{t.date}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{t.turtle}</td>
                      <td className="px-6 py-4">
                        {t.isDividend ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            Dywidenda
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Otwarta' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                            {t.type}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600 text-left">{cleanSymbol(t.symbol)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">
                        {t.isDividend || t.quantity === null ? '-' : t.quantity.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-900">
                          {t.value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {t.isDividend ? (
                          <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Otrzymana
                          </span>
                        ) : (
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${t.status === 'Otwarta' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {t.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }, [activeAssets, closedAssets, dividends])}
        </div>
      </div>
    </div>
  );
};
