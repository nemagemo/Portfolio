
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
          <p className="text-slate-500 mt-1">Eksperymentalny portfel 10 żółwi inwestujących po 100 zł (IKE).</p>
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
                <p className="text-2xl font-black text-slate-900">{totalCapital.toLocaleString('pl-PL')} zł</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Wallet size={24} /></div>
            </motion.div>

            <motion.div whileHover={{ x: 10 }} className="flex items-center gap-4 text-right justify-end">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wartość Portfela</p>
                <p className="text-2xl font-black text-slate-900">{totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
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
                  {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
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

      {/* Race Track Section */}
      <div className={`${styles.cardBg} ${styles.cardBorder} p-10 rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100 opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Trophy className="text-amber-500 fill-amber-200" size={28} /> Wyścig Żółwi
            </h2>
          </div>
          
          <div className="space-y-4 relative py-4 px-4">
            <div className="absolute inset-0 flex justify-between pointer-events-none px-4">
              {[ -20, -10, 0, 10, 20, 30, 40 ].map((roi) => (
                <div key={roi} className="flex flex-col items-center h-full">
                  <div className={`w-px h-full ${roi === 0 ? 'bg-slate-400 w-0.5' : 'bg-slate-200'} border-dashed`} />
                  <span className={`text-[9px] font-bold mt-2 ${roi === 0 ? 'text-slate-900' : 'text-slate-400'}`}>{roi}%</span>
                </div>
              ))}
            </div>

            {turtles.map((turtle, index) => {
              const isActive = turtle.isActive;
              // Position: map -20% to 40% left. 
              const normalizedPos = Math.max(0, Math.min(100, ((turtle.roi + 20) / 60) * 100));
              const isLeader = index === 0 && isActive;
              const isLoss = turtle.roi < 0 && isActive;

              return (
                <div key={turtle.id} className="relative h-14 group/lane transition-all duration-300">
                  <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 ${isLoss ? 'bg-rose-50 animate-pulse' : 'bg-slate-50/50'} rounded-xl border border-slate-100`} />
                  <motion.div 
                    animate={{ left: `${normalizedPos}%` }}
                    style={{ x: '-50%' }}
                    transition={{ 
                      duration: 2.5, 
                      type: 'spring',
                      stiffness: 40,
                      damping: 12
                    }}
                    className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center gap-3"
                  >
                    <div className="relative">
                      {!isActive && (
                        <motion.div animate={{ opacity: [0.6, 1, 0.6], y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -right-6 -top-8 text-slate-600 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-slate-200">
                          <Moon size={10} className="mr-0.5 fill-slate-300" />
                          <span className="text-[14px] font-black tracking-widest leading-none">ZZZ</span>
                        </motion.div>
                      )}
                      <div className="p-2 rounded-2xl shadow-lg bg-white border-2" style={{ borderColor: turtle.color, transform: isLoss ? 'scaleX(-1)' : 'none' }}>
                        <Turtle size={28} style={{ color: turtle.color }} className={isActive ? 'animate-bounce' : 'opacity-40'} />
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col">
                      <span className="text-[10px] font-black text-slate-800 leading-none">{turtle.name}</span>
                      <span className={`text-[10px] font-bold ${!isActive ? 'text-slate-400' : turtle.roi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {turtle.roi.toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
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
                <th className="px-6 py-3">Portfel / Akcje</th>
                <th className="px-6 py-3 text-right">Kapitał Liniowy</th>
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
                      <td className="px-6 py-4 text-sm font-bold text-blue-600 text-left">{t.symbol}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">{(t.quantity || 0).toFixed(4)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-900">{t.purchaseValue.toLocaleString('pl-PL')} zł</span>
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
