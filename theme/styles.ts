
export type Theme = 'light' | 'neon';

export const themeStyles: Record<Theme, {
  appBg: string;
  text: string;
  textSub: string;
  headerBg: string;
  headerBorder: string;
  cardContainer: string;
  cardHeaderIconBg: string;
  buttonActive: string;
  buttonInactive: string;
  toggleProjectionActive: string;
  toggleCPIActive: string;
  toggleNoPPKActive: string;
  footerBg: string;
  footerBorder: string;
  footerText: string;
}> = {
  light: {
    appBg: 'bg-slate-50',
    text: 'text-slate-900 font-sans',
    textSub: 'text-slate-500',
    headerBg: 'bg-white',
    headerBorder: 'border-slate-200',
    // Increased shadow for better depth/contrast against the background
    cardContainer: 'bg-white rounded-xl shadow-md border border-slate-200/60',
    cardHeaderIconBg: 'bg-slate-50 border border-slate-100',
    buttonActive: 'bg-slate-800 text-white shadow-sm',
    buttonInactive: 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200',
    toggleProjectionActive: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200',
    toggleCPIActive: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-200',
    toggleNoPPKActive: 'bg-slate-100 text-slate-800 border-slate-300 ring-1 ring-slate-300',
    footerBg: 'bg-white',
    footerBorder: 'border-t border-slate-200',
    footerText: 'text-slate-400',
  },
  neon: {
    appBg: 'bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black',
    text: 'text-cyan-50 font-mono tracking-tight',
    textSub: 'text-cyan-600/80 font-mono',
    headerBg: 'bg-black/80 backdrop-blur-md',
    headerBorder: 'border-cyan-900/50 border-b',
    // Reduced border opacity to reduce visual noise (grid effect)
    cardContainer: 'bg-[#0a0a0a]/90 border border-cyan-500/20 shadow-[0_0_20px_-5px_rgba(6,182,212,0.1)] backdrop-blur-sm rounded-none',
    cardHeaderIconBg: 'bg-cyan-950/30 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    buttonActive: 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)] font-mono',
    buttonInactive: 'bg-black text-cyan-800 border border-cyan-900/30 hover:text-cyan-400 hover:border-cyan-700 font-mono',
    toggleProjectionActive: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(250,204,21,0.3)]',
    toggleCPIActive: 'bg-pink-900/30 text-pink-400 border-pink-500/50 shadow-[0_0_10px_rgba(244,114,182,0.3)]',
    toggleNoPPKActive: 'bg-slate-800 text-slate-300 border-slate-500',
    footerBg: 'bg-black/80 backdrop-blur-sm',
    footerBorder: 'border-t border-cyan-900/30',
    footerText: 'text-cyan-700',
  }
};
