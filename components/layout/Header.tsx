
import React, { useState, useMemo } from 'react';
import { Briefcase, Coins, PiggyBank, Menu, X, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { PortfolioType, OMFDataRow } from '../../types';
import { Theme, themeStyles } from '../../theme/styles';
import { HeaderLogo } from '../logos/HeaderLogo';
import { HeaderMobile } from '../logos/HeaderMobile';
import { OMF_LAST_UPDATED } from '../../CSV/OMFopen';

interface HeaderProps {
  theme: Theme;
  portfolioType: PortfolioType;
  setPortfolioType: (t: PortfolioType) => void;
  pricingMode: 'Offline' | 'Online';
  isRefreshing: boolean;
  fetchPrices: () => Promise<void>;
  onlinePrices: Record<string, number> | null;
  omfActiveAssets: OMFDataRow[];
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  portfolioType,
  setPortfolioType,
  pricingMode,
  isRefreshing,
  fetchPrices,
  onlinePrices,
  omfActiveAssets
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const styles = themeStyles[theme];

  const handlePortfolioChange = (type: PortfolioType) => {
    setPortfolioType(type);
    setIsMobileMenuOpen(false);
  };

  // Determine Status Label logic
  const statusLogic = useMemo(() => {
    if (isRefreshing) return { label: 'Odświeżanie danych...', icon: RefreshCw, colorClass: 'bg-blue-50 text-blue-600 border-blue-200', spin: true, percent: 0, isPartial: false };
    
    const dateInfo = OMF_LAST_UPDATED ? ` (Dane z: ${OMF_LAST_UPDATED})` : '';

    if (pricingMode === 'Offline') return { 
        label: `Tryb Offline - Kliknij aby odświeżyć${dateInfo}`, 
        icon: WifiOff, 
        colorClass: 'bg-slate-100 text-slate-500 border-slate-200',
        spin: false,
        percent: 0,
        isPartial: false
    };
    
    let isPartial = false;
    let percent = 100;
    let tooltipLabel = 'Tryb Online (Wszystkie ceny aktualne)';

    if (portfolioType === 'OMF' && onlinePrices) {
        const investableAssets = omfActiveAssets.filter(a => a.status === 'Otwarta' && a.type !== 'Gotówka');
        const totalAssets = investableAssets.length;
        const loadedAssets = investableAssets.filter(a => a.isLivePrice).length;
        
        if (totalAssets > 0 && loadedAssets < totalAssets) {
           isPartial = true;
           percent = Math.round((loadedAssets / totalAssets) * 100);
           tooltipLabel = `Tryb Online (${percent}% cen pobranych)`;
        }
    }

    if (isPartial) {
        return { 
            label: tooltipLabel, 
            icon: AlertCircle, 
            colorClass: 'bg-amber-50 text-amber-600 border-amber-200',
            spin: false,
            percent,
            isPartial: true
        };
    }

    return { 
        label: tooltipLabel, 
        icon: Wifi, 
        colorClass: 'bg-blue-50 text-blue-600 border-blue-200',
        spin: false,
        percent: 100,
        isPartial: false
    };
  }, [pricingMode, isRefreshing, theme, onlinePrices, omfActiveAssets, portfolioType]);

  // Styles for Mobile Menu Overlay
  const mobileMenuClass = 'bg-white border-b border-slate-200 text-slate-800';

  // Check if current setup allows refresh (Offline is valid if explicit or fallback)
  const isOfflineValid = true; 

  return (
    <header className={`${styles.headerBg} ${styles.headerBorder} sticky top-0 z-50 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LEFT: Logo - Flex-1 to push center */}
        <div className="flex-1 flex items-center justify-start">
           {/* Desktop/Tablet Logo */}
           <HeaderLogo className="hidden md:block md:h-5 lg:h-8 w-auto text-slate-800" />
           {/* Mobile Logo */}
           <HeaderMobile className="md:hidden h-8 w-auto text-slate-800" />
        </div>

        {/* CENTER: Navigation Tabs (Desktop/Tablet) */}
        <div className="hidden md:flex p-1 space-x-1 overflow-x-auto shrink-0 bg-slate-100 rounded-lg">
          <button onClick={() => handlePortfolioChange('OMF')} className={`flex items-center justify-center md:px-2 md:py-1 md:text-lg lg:px-4 lg:text-2xl font-bold leading-none transition-all whitespace-nowrap ${portfolioType === 'OMF' ? styles.buttonActive : styles.buttonInactive} rounded-md`}>
            Σ
          </button>
          <button onClick={() => handlePortfolioChange('PPK')} className={`flex items-center md:px-2 md:py-1 md:text-[10px] lg:px-4 lg:py-1.5 lg:text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'PPK' ? styles.buttonActive : styles.buttonInactive} rounded-md`}><Briefcase size={16} className="md:mr-1 lg:mr-2 hidden sm:block" />PPK</button>
          <button onClick={() => handlePortfolioChange('CRYPTO')} className={`flex items-center md:px-2 md:py-1 md:text-[10px] lg:px-4 lg:py-1.5 lg:text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'CRYPTO' ? styles.buttonActive : styles.buttonInactive} rounded-md`}><Coins size={16} className="md:mr-1 lg:mr-2 hidden sm:block" />Krypto</button>
          <button onClick={() => handlePortfolioChange('IKE')} className={`flex items-center md:px-2 md:py-1 md:text-[10px] lg:px-4 lg:py-1.5 lg:text-sm font-medium transition-all whitespace-nowrap ${portfolioType === 'IKE' ? styles.buttonActive : styles.buttonInactive} rounded-md`}><PiggyBank size={16} className="md:mr-1 lg:mr-2 hidden sm:block" />IKE</button>
        </div>

        {/* RIGHT: Status & Hamburger */}
        <div className="flex-1 flex items-center justify-end space-x-0.5 md:space-x-1 lg:space-x-3">
           {/* Status Indicator */}
           {isOfflineValid && (
              <div 
                className={`
                  flex items-center transition-all duration-300 overflow-hidden
                  ${statusLogic.colorClass}
                  rounded-full
                  ${statusLogic.isPartial ? 'hover:pr-3 hover:pl-1 cursor-help group' : 'p-1.5 md:p-1 lg:p-2'}
                `}
                title={statusLogic.label}
              >
                <button 
                  onClick={fetchPrices} 
                  disabled={isRefreshing} 
                  className={`p-0 focus:outline-none ${isRefreshing ? 'opacity-75 cursor-wait' : ''}`}
                >
                   {/* Icon Size: 20px on Mobile, 18px on Tablet/Desktop */}
                   <statusLogic.icon size={20} className={`${statusLogic.spin ? 'animate-spin' : ''} md:w-[18px] md:h-[18px]`} />
                </button>
                
                {statusLogic.isPartial && (
                   <span className="max-w-0 overflow-hidden group-hover:max-w-[60px] transition-all duration-500 text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pl-0 group-hover:pl-1.5">
                      {statusLogic.percent}%
                   </span>
                )}
              </div>
           )}

           {/* Mobile Menu Toggle (Right Side) */}
           <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg transition-colors text-slate-700 hover:bg-slate-100"
           >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className={`md:hidden absolute top-16 left-0 w-full z-40 p-4 shadow-xl ${mobileMenuClass} animate-in slide-in-from-top-2 duration-200`}>
           <div className="grid grid-cols-1 gap-2">
              <button onClick={() => handlePortfolioChange('OMF')} className={`flex items-center justify-between px-4 py-3 text-lg font-bold rounded-lg ${portfolioType === 'OMF' ? styles.buttonActive : styles.buttonInactive}`}>
                 <span>Portfel Główny</span>
                 <span className="text-2xl font-black leading-none">Σ</span>
              </button>
              <div className="grid grid-cols-3 gap-2 mt-2">
                 <button onClick={() => handlePortfolioChange('PPK')} className={`flex flex-col items-center justify-center p-3 rounded-lg text-sm font-medium ${portfolioType === 'PPK' ? styles.buttonActive : styles.buttonInactive}`}>
                    <Briefcase size={20} className="mb-1" /> PPK
                 </button>
                 <button onClick={() => handlePortfolioChange('CRYPTO')} className={`flex flex-col items-center justify-center p-3 rounded-lg text-sm font-medium ${portfolioType === 'CRYPTO' ? styles.buttonActive : styles.buttonInactive}`}>
                    <Coins size={20} className="mb-1" /> Krypto
                 </button>
                 <button onClick={() => handlePortfolioChange('IKE')} className={`flex flex-col items-center justify-center p-3 rounded-lg text-sm font-medium ${portfolioType === 'IKE' ? styles.buttonActive : styles.buttonInactive}`}>
                    <PiggyBank size={20} className="mb-1" /> IKE
                 </button>
              </div>
           </div>
        </div>
      )}
    </header>
  );
};
