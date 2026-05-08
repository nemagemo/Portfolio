
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Turtle, TrendingUp, Trophy, Info, Target, Wallet, Moon } from 'lucide-react';
import { Theme, themeStyles } from '../../theme/styles';
import { OMFDataRow } from '../../types';

interface TurtleDashboardProps {
  theme: Theme;
  activeAssets: OMFDataRow[];
  closedAssets: OMFDataRow[];
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
}

export const TurtleDashboard: React.FC<TurtleDashboardProps> = ({ theme, activeAssets, closedAssets }) => {
  const styles = themeStyles[theme];

  // Helper to get flag URL
  const getFlagUrl = (ticker: string) => {
    if (!ticker || ticker === '-') return 'https://flagcdn.com/w40/un.png';
    const t = ticker.toUpperCase();
    if (t.endsWith('.PL')) return 'https://flagcdn.com/w40/pl.png';
    if (t.endsWith('.US')) return 'https://flagcdn.com/w40/us.png';
    if (t.endsWith('.L')) return 'https://flagcdn.com/w40/gb.png';
    if (t.endsWith('.DE')) return 'https://flagcdn.com/w40/de.png';
    // Check common polish stocks if no prefix
    const polishSymbols = ['CDR', 'LPP', 'KRU', 'PKO', 'ALE', 'ACP', 'DNP', 'ORL'];
    if (polishSymbols.includes(t)) return 'https://flagcdn.com/w40/pl.png';
    return 'https://flagcdn.com/w40/us.png'; // Fallback
  };

  const turtles: TurtleState[] = useMemo(() => {
    // 1. Filter assets belonging to "Żółwie"
    const turtleActive = activeAssets.filter(a => a.portfolio === 'Żółwie');
    const turtleClosed = closedAssets.filter(a => a.portfolio === 'Żółwie');
    
    // 2. Fixed list of 10 turtles
    const turtleNames = ['Karol', 'Marek', 'Ania', 'Piotr', 'Kasia', 'Tomek', 'Magda', 'Robert', 'Ewa', 'Jacek'];
    const turtleColors = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#10b981', '#f97316'];
    
    // 3. Aggregate data per turtle
    return turtleNames.map((name, idx) => {
      const myActive = turtleActive.filter(a => a.sector === name);
      const myClosed = turtleClosed.filter(a => a.sector === name);
      
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

      const activeProfit = myActive.reduce((sum, a) => sum + a.profit, 0);
      const closedProfit = myClosed.reduce((sum, a) => sum + a.profit, 0);
      const totalProfit = activeProfit + closedProfit;
      
      // Each turtle started with 100 zł ONLY IF they have any activity
      // User says: "Poza karolem pozostałe żółwie na razie nic nie mają ani gotowki ani akcji."
      // So if no active/closed assets (excluding the placeholder cash), initial is 0.
      
      const hasActivity = myActive.some(a => a.currentValue > 0 || a.purchaseValue > 0) || myClosed.length > 0;
      const initialCapital = hasActivity ? 100 : 0;
      const totalEquity = initialCapital + totalProfit;
      const roi = initialCapital > 0 ? (totalProfit / initialCapital) * 100 : 0;

      return {
        id: idx + 1,
        name: hasActivity ? name : '?',
        initialCapital,
        currentValue: totalEquity,
        color: turtleColors[idx % turtleColors.length],
        currentStock,
        countryCode: 'PL', 
        roi,
        profit: totalProfit,
        isActive: hasActivity && isActive
      };
    }).sort((a, b) => b.roi - a.roi || b.initialCapital - a.initialCapital);
  }, [activeAssets, closedAssets]);

  const totalCapital = turtles.reduce((sum, t) => sum + t.initialCapital, 0);
  const totalValue = turtles.reduce((sum, t) => sum + t.currentValue, 0);
  const totalProfit = totalValue - totalCapital;
  const totalRoi = totalCapital > 0 ? (totalProfit / totalCapital) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Strategia Żółwia</h1>
          <p className="text-slate-500 mt-1">Eksperymentalny portfel oparty na strategii Żółwia.</p>
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
                className="absolute"
                style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate})` }}
              >
                <Turtle size={pos.size} />
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
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lider Zysku</p>
                <p className="text-2xl font-black text-slate-900">{turtles[0]?.name || '-'}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Turtle Grand Prix - New Horizontal Race Design */}
      <div className={`${styles.cardBg} ${styles.cardBorder} p-12 rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden relative`}>
        {/* Stadium Background Elements */}
        <div className="absolute inset-0 bg-slate-50/30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                <Trophy size={12} className="fill-amber-700" /> Live Championship
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Grand Prix Żółwi</h2>
            </div>
          </div>

          <div className="relative space-y-1">
            {/* The Track Base */}
            <div className="absolute inset-y-0 left-0 w-1 bg-slate-900 rounded-full z-20" /> {/* Start Line */}
            <div className="absolute inset-y-0 right-0 w-2 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#fff_10px,#fff_20px)] z-20 shadow-lg" /> {/* Finish Line */}

            {turtles.map((turtle, index) => {
              const isActive = turtle.isActive;
              
              // Dynamic scale calculation:
              // We find the min and max ROIs to determine the track boundaries.
              // We default to -20 and +40 to keep the view consistent for normal values.
              const allRois = turtles.map(t => t.roi);
              const minScale = Math.min(-20, ...allRois);
              const maxScale = Math.max(40, ...allRois);
              const range = maxScale - minScale;
              
              const progress = Math.max(0, Math.min(100, ((turtle.roi - minScale) / range) * 100));
              const isPositive = turtle.roi >= 0;
              
              return (
                <div key={`gp-${turtle.id}`} className="relative h-14 group/gp-lane border-y border-slate-100/50">
                  {/* Lane Background */}
                  <div className="absolute inset-0 bg-white flex items-center transition-colors group-hover/gp-lane:bg-slate-50/50">
                    <div className="w-16 pl-4 h-full flex items-center justify-start border-r border-slate-200/50 bg-slate-50 text-[10px] font-black text-slate-300 italic group-hover/gp-lane:text-indigo-400 group-hover/gp-lane:bg-indigo-50/30 transition-colors">
                      TOR {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Turtle Movable Unit */}
                  <motion.div
                    animate={{ left: `${progress}%` }}
                    style={{ x: '-50%' }}
                    transition={{ duration: 2.5, type: 'spring', stiffness: 35, damping: 15 }}
                    className="absolute top-0 bottom-0 z-30 flex items-center gap-4 pl-16"
                  >
                    {/* Shadow / Tail effect */}
                    <div className={`absolute -left-20 right-0 h-0.5 opacity-20 bg-gradient-to-r from-transparent to-current transition-opacity group-hover/gp-lane:opacity-40`} style={{ color: turtle.color }} />
                    
                    <div className="relative flex items-center">
                       {/* Turtle Badge */}
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

                       {/* Data Bubble */}
                       <div className="ml-3 pointer-events-none transition-all duration-500 translate-y-0 group-hover/gp-lane:-translate-y-1">
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
              );
            })}
          </div>

          {/* Scale Legend */}
          <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-end">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-800 uppercase italic">Progresja Metaforyczna</span>
               <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  ))}
               </div>
            </div>
          </div>
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
                return (
                  <tr key={turtle.id} className={`hover:bg-slate-50 ${!isActive ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive && index < 3 ? 'bg-amber-100 text-amber-700' : 'text-slate-400'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Turtle size={18} style={{ color: turtle.color }} className={!isActive ? 'grayscale opacity-70' : ''} />
                        <span className="font-semibold text-slate-700">{turtle.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {isActive ? (
                          <>
                            <div className="w-8 h-6 rounded bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                              <img src={getFlagUrl(turtle.currentStock)} alt="flag" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 tracking-tight">{turtle.currentStock}</span>
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
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">{turtle.initialCapital.toFixed(0)} zł</td>
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
            const allTurtAssets = [...activeAssets, ...closedAssets]
              .filter(a => a.portfolio === 'Żółwie' && a.type !== 'Gotówka')
              .sort((a, b) => new Date(b.lastPurchaseDate).getTime() - new Date(a.lastPurchaseDate).getTime());
            
            if (allTurtAssets.length === 0) return (
              <div className="p-12 text-center">
                <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
                  <Info size={32} />
                </div>
                <p className="text-slate-500 font-medium">Brak historii operacji w tym portfelu.</p>
                <p className="text-xs text-slate-400 mt-1">Operacje pojawią się automatycznie po dodaniu ich do OMFopen.ts lub OMFclosed.ts</p>
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
                  {allTurtAssets.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{t.lastPurchaseDate}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{t.sector}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Otwarta' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                          {t.status === 'Otwarta' ? 'Kupno' : 'Sprzedaż'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600 text-left">{t.symbol}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">{(t.quantity || 0).toFixed(4)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-900">{t.purchaseValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${t.status === 'Otwarta' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }, [activeAssets, closedAssets])}
        </div>
      </div>
    </div>
  );
};
