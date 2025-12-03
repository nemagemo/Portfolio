
export type Theme = 'light';

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
  }
};
