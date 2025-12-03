
import React, { useState, useEffect } from 'react';
import { PPKLogo } from '../../logos/PPKLogo';
import { GAWLogo } from '../../logos/GAWLogo';
import { AMZNLogo } from '../../logos/AMZNLogo';
import { CRWDLogo } from '../../logos/CRWDLogo';
import { MSFTLogo } from '../../logos/MSFTLogo';
import { USDCLogo } from '../../logos/USDCLogo';
import { ABSLogo } from '../../logos/ABSLogo';
import { KLELogo } from '../../logos/KLELogo';
import { KTYLogo } from '../../logos/KTYLogo';
import { CDRLogo } from '../../logos/CDRLogo';
import { LPPLogo } from '../../logos/LPPLogo';
import { KRULogo } from '../../logos/KRULogo';
import { PLWLogo } from '../../logos/PLWLogo';
import { ROLLogo } from '../../logos/ROLLogo';
import { NUKL_DELogo } from '../../logos/NUKL_DELogo';
import { NDIA_LLogo } from '../../logos/NDIA_LLogo';
import { IUIT_LLogo } from '../../logos/IUIT_LLogo';
import { SFDLogo } from '../../logos/SFDLogo';
import { FASTLogo } from '../../logos/FASTLogo';
import { FROLogo } from '../../logos/FROLogo';
import { ACNLogo } from '../../logos/ACNLogo';
import { PLNLogo } from '../../logos/PLNLogo';
import { ResztaKryptoLogo } from '../../logos/ResztaKryptoLogo';
import { ETFBS80TRLogo } from '../../logos/ETFBS80TRLogo';
import { ETHLogo } from '../../logos/ETHLogo';
import { AnyDataRow } from '../../types';

export type ThemeMode = 'light';

export interface ChartProps {
  data: AnyDataRow[];
  className?: string;
  showProjection?: boolean;
  showCPI?: boolean;
  showTaxComparison?: boolean;
  showExitRoi?: boolean;
  themeMode?: ThemeMode;
}

// --- CHART THEME DEFINITIONS ---
export const CHART_THEMES: Record<ThemeMode, {
  investment: string;
  profit: string;
  employer: string;
  state: string;
  tax: string;
  net: string;
  exit: string;
  projection: string;
  taxedAccount: string;
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipText: string;
  tooltipBorder: string;
  strokeWidth: number;
  pieColors: string[];
  barProfitPos: string;
  barProfitNeg: string;
  dailyPos: string;
  dailyNeg: string;
  dailyNeu: string;
  dailyWarning: string;
  lineType?: 'monotone' | 'linear' | 'step'; 
}> = {
  light: {
    investment: '#475569', // Slate-600
    profit: '#059669',     // Emerald-600
    employer: '#7c3aed',   // Violet-600
    state: '#db2777',      // Pink-600
    tax: '#dc2626',        // Red-600
    net: '#115e59',        // Teal-800
    exit: '#ca8a04',       // Dark Yellow/Gold for visibility on white
    projection: '#d97706', // Amber-600
    taxedAccount: '#ea580c', 
    grid: '#e5e7eb',       
    axis: '#6b7280',       
    tooltipBg: '#ffffff',
    tooltipText: '#111827',
    tooltipBorder: '#e5e7eb',
    strokeWidth: 2,      
    pieColors: ['#475569', '#7c3aed', '#059669', '#d97706', '#be123c', '#1e293b'],
    barProfitPos: '#059669',
    barProfitNeg: '#b91c1c',
    dailyPos: '#16a34a', 
    dailyNeg: '#dc2626', 
    dailyNeu: '#94a3b8',  
    dailyWarning: '#fbbf24',
    lineType: 'monotone'
  }
};

export const formatCurrency = (value: number | undefined) => `${(value || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł`;
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
};

// Helper to get tooltip content style based on theme and mobile status
export const getTooltipStyle = (theme: ThemeMode, isMobile: boolean = false) => {
  const t = CHART_THEMES[theme];
  const style: any = { 
    backgroundColor: t.tooltipBg, 
    color: t.tooltipText, 
    border: `1px solid ${t.tooltipBorder}`,
    borderRadius: '8px',
    fontSize: isMobile ? '10px' : '12px',
    padding: isMobile ? '4px 8px' : '8px 12px',
  };
  return style;
};

// --- RESPONSIVE CHART CONFIG HOOK ---
/**
 * Detects if the screen is mobile (< 768px) and provides optimized Recharts configuration.
 * On Mobile:
 * - Reduced legend size (iconSize: 8)
 * - Tighter margins (left: -20) to maximize chart width
 * - Centered legends
 * - Reduced font sizes
 */
export const useChartConfig = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return {
      isMobile: true,
      iconSize: 8,
      margin: { top: 10, right: 10, left: -20, bottom: 20 },
      xAxisPadding: { left: 0, right: 5 },
      legendHeight: 44,
      // Force centering for mobile legends
      legendStyle: { 
        fontSize: '9px', 
        width: '100%', 
        left: 0, 
        textAlign: 'center' as const,
        paddingTop: '0px'
      },
      tickMargin: 5
    };
  }

  return {
    isMobile: false,
    iconSize: 14,
    margin: { top: 10, right: 5, left: -20, bottom: 10 },
    xAxisPadding: { left: 0, right: 10 },
    legendHeight: 30,
    legendStyle: { 
      fontSize: '12px',
      paddingTop: '0px'
    },
    tickMargin: 10
  };
};

// --- LOGO LOGIC ---

// Mapping of asset names to their respective Logo components
// Used by AssetLogo to dynamically render the correct SVG based on asset symbol.
const LOGO_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  PPK: PPKLogo,
  GAW: GAWLogo,
  AMZN: AMZNLogo,
  CRWD: CRWDLogo,
  MSFT: MSFTLogo,
  USDC: USDCLogo,
  ABS: ABSLogo,
  KLE: KLELogo,
  KTY: KTYLogo,
  CDR: CDRLogo,
  LPP: LPPLogo,
  KRU: KRULogo,
  PLW: PLWLogo,
  ROL: ROLLogo,
  'NUKL.DE': NUKL_DELogo,
  'NDIA.L': NDIA_LLogo,
  'IUIT.L': IUIT_LLogo,
  SFD: SFDLogo,
  FAST: FASTLogo,
  FRO: FROLogo,
  ACN: ACNLogo,
  PLN: PLNLogo,
  'Reszta Krypto': ResztaKryptoLogo,
  ETFBS80TR: ETFBS80TRLogo,
  ETH: ETHLogo
};

interface AssetLogoProps {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const AssetLogo: React.FC<AssetLogoProps> = ({ name, x, y, width, height }) => {
  const LogoComponent = LOGO_MAP[name];
  
  if (!width || !height || width <= 0 || height <= 0) return null;

  const padding = Math.min(width, height) * 0.2;
  const size = Math.max(0, Math.min(width, height) - (padding * 2));
  
  if (size <= 0) return null;

  const logoX = x + (width - size) / 2;
  const logoY = y + (height - size) / 2;

  const commonProps = {
    x: logoX,
    y: logoY,
    width: size,
    height: size,
    opacity: 0.8, 
    stroke: "none", 
    style: { pointerEvents: 'none' as const }
  };

  if (LogoComponent) {
    return <LogoComponent {...commonProps} />;
  }

  return null;
};
