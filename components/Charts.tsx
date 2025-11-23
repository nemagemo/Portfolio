
import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  LabelList,
  ComposedChart,
  Treemap
} from 'recharts';
import { PPKDataRow, AnyDataRow, SummaryStats } from '../types';

// Logo Imports
import { PPKLogo } from '../logos/PPKLogo';
import { GAWLogo } from '../logos/GAWLogo';
import { AMZNLogo } from '../logos/AMZNLogo';
import { CRWDLogo } from '../logos/CRWDLogo';
import { MSFTLogo } from '../logos/MSFTLogo';
import { USDCLogo } from '../logos/USDCLogo';
import { ABSLogo } from '../logos/ABSLogo';
import { KLELogo } from '../logos/KLELogo';
import { KTYLogo } from '../logos/KTYLogo';
import { CDRLogo } from '../logos/CDRLogo';
import { LPPLogo } from '../logos/LPPLogo';
import { KRULogo } from '../logos/KRULogo';
import { PLWLogo } from '../logos/PLWLogo';
import { ROLLogo } from '../logos/ROLLogo';
import { NUKL_DELogo } from '../logos/NUKL_DELogo';
import { NDIA_LLogo } from '../logos/NDIA_LLogo';
import { IUIT_LLogo } from '../logos/IUIT_LLogo';
import { SFDLogo } from '../logos/SFDLogo';
import { FASTLogo } from '../logos/FASTLogo';
import { FROLogo } from '../logos/FROLogo';
import { ACNLogo } from '../logos/ACNLogo';
import { PLNLogo } from '../logos/PLNLogo';
import { ResztaKryptoLogo } from '../logos/ResztaKryptoLogo';
import { ETFBS80TRLogo } from '../logos/ETFBS80TRLogo';
import { ETHLogo } from '../logos/ETHLogo';

type ThemeMode = 'default' | 'dark' | 'comic' | 'light' | 'neon';

interface ChartProps {
  data: AnyDataRow[];
  className?: string;
  showProjection?: boolean;
  showCPI?: boolean;
  showTaxComparison?: boolean;
  themeMode?: ThemeMode;
}

// --- CHART THEME DEFINITIONS ---
const CHART_THEMES: Record<ThemeMode, {
  investment: string; // Employee / Base Capital
  profit: string;     // Fund Profit / Gains
  employer: string;   // Employer Contribution
  state: string;      // State Contribution
  tax: string;        // Tax
  net: string;        // Net Value
  exit: string;       // Exit Value
  projection: string; // Projection Line
  grid: string;       // Grid Lines
  axis: string;       // Axis Text/Lines
  tooltipBg: string;  // Tooltip Background
  tooltipText: string;// Tooltip Text
  tooltipBorder: string;
  strokeWidth: number;
  pieColors: string[];
  barProfitPos: string;
  barProfitNeg: string;
}> = {
  default: {
    investment: '#3b82f6', // Blue-500
    profit: '#10b981',     // Emerald-500
    employer: '#8b5cf6',   // Violet-500
    state: '#ec4899',      // Pink-500
    tax: '#ef4444',        // Red-500
    net: '#064e3b',        // Emerald-900
    exit: '#475569',       // Slate-600
    projection: '#d97706', // Amber-600
    grid: '#e2e8f0',       // Slate-200
    axis: '#64748b',       // Slate-500
    tooltipBg: '#ffffff',
    tooltipText: '#1e293b',
    tooltipBorder: '#e2e8f0',
    strokeWidth: 2,
    pieColors: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#64748b'],
    barProfitPos: '#10b981',
    barProfitNeg: '#ef4444'
  },
  dark: {
    investment: '#60a5fa', // Blue-400 (Brighter)
    profit: '#34d399',     // Emerald-400
    employer: '#a78bfa',   // Violet-400
    state: '#f472b6',      // Pink-400
    tax: '#f87171',        // Red-400
    net: '#6ee7b7',        // Emerald-300
    exit: '#94a3b8',       // Slate-400
    projection: '#fbbf24', // Amber-400
    grid: '#334155',       // Slate-700
    axis: '#94a3b8',       // Slate-400
    tooltipBg: '#1e293b',
    tooltipText: '#f8fafc',
    tooltipBorder: '#334155',
    strokeWidth: 2,
    pieColors: ['#38bdf8', '#c084fc', '#4ade80', '#fcd34d', '#fb7185', '#94a3b8'],
    barProfitPos: '#34d399',
    barProfitNeg: '#f87171'
  },
  comic: {
    investment: '#0ea5e9', // Cyan
    profit: '#22c55e',     // Green
    employer: '#a855f7',   // Purple
    state: '#ec4899',      // Pink
    tax: '#ef4444',        // Red
    net: '#000000',        // Black
    exit: '#57534e',       // Warm Grey
    projection: '#f59e0b', // Orange
    grid: '#000000',       // Black Grid
    axis: '#000000',       // Black Axis
    tooltipBg: '#ffffff',
    tooltipText: '#000000',
    tooltipBorder: '#000000',
    strokeWidth: 3,        // Bold Lines
    pieColors: ['#0ea5e9', '#a855f7', '#22c55e', '#f59e0b', '#f43f5e', '#64748b'],
    barProfitPos: '#22c55e',
    barProfitNeg: '#ef4444'
  },
  light: {
    investment: '#475569', // Slate-600
    profit: '#059669',     // Emerald-600
    employer: '#7c3aed',   // Violet-600
    state: '#db2777',      // Pink-600
    tax: '#b91c1c',        // Red-700
    net: '#1e293b',        // Slate-800
    exit: '#9ca3af',       // Gray-400
    projection: '#d97706', // Amber-600
    grid: '#e5e7eb',       // Gray-200
    axis: '#4b5563',       // Gray-600
    tooltipBg: '#f9fafb',
    tooltipText: '#111827',
    tooltipBorder: '#e5e7eb',
    strokeWidth: 1.5,      // Thinner Lines
    pieColors: ['#475569', '#7c3aed', '#059669', '#d97706', '#be123c', '#1e293b'],
    barProfitPos: '#059669',
    barProfitNeg: '#b91c1c'
  },
  neon: {
    investment: '#22d3ee', // Cyan-400
    profit: '#39ff14',     // Neon Green
    employer: '#d946ef',   // Fuchsia-500
    state: '#f472b6',      // Pink-400
    tax: '#ef4444',        // Red
    net: '#ccfbf1',        // Teal-100
    exit: '#94a3b8',       // Slate-400
    projection: '#facc15', // Yellow-400
    grid: '#1e293b',       // Slate-800
    axis: '#67e8f9',       // Cyan-300
    tooltipBg: '#000000',
    tooltipText: '#22d3ee',
    tooltipBorder: '#22d3ee',
    strokeWidth: 2,
    pieColors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#64748b'],
    barProfitPos: '#39ff14',
    barProfitNeg: '#ef4444'
  }
};

const formatCurrency = (value: number | undefined) => `${(value || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł`;
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
};

// Helper to get tooltip content style based on theme
const getTooltipStyle = (theme: ThemeMode) => {
  const t = CHART_THEMES[theme];
  const style: any = { 
    backgroundColor: t.tooltipBg, 
    color: t.tooltipText, 
    border: `1px solid ${t.tooltipBorder}`,
    borderRadius: '8px'
  };
  
  if (theme === 'comic') {
    style.borderRadius = '0px';
    style.border = '2px solid #000000';
    style.boxShadow = '4px 4px 0px 0px #000000';
  }

  if (theme === 'neon') {
    style.borderRadius = '0px';
    style.boxShadow = '0 0 10px rgba(34, 211, 238, 0.3)';
  }
  
  return style;
};

// --- OMF Specific Charts ---

interface OMFAllocationProps {
  data: { name: string; value: number; color?: string; roi?: number }[];
  title?: string;
  themeMode?: ThemeMode;
}

export const OMFAllocationChart: React.FC<OMFAllocationProps> = ({ data, title, themeMode = 'default' }) => {
  const t = CHART_THEMES[themeMode];
  
  return (
    <div className="h-80 w-full flex flex-col items-center">
      {title && <h4 className={`text-sm font-semibold mb-2 ${themeMode === 'dark' ? 'text-slate-400' : themeMode === 'neon' ? 'text-cyan-700' : 'text-slate-500'}`}>{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || t.pieColors[index % t.pieColors.length]} 
                stroke={themeMode === 'dark' ? '#1e293b' : themeMode === 'neon' ? '#000' : '#fff'} 
                strokeWidth={themeMode === 'comic' ? 2 : 1} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${(value || 0).toLocaleString('pl-PL')} zł`, 'Wartość']}
            contentStyle={getTooltipStyle(themeMode as ThemeMode)}
          />
          <Legend verticalAlign="bottom" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const OMFStructureChart: React.FC<OMFAllocationProps> = ({ data, themeMode = 'default' }) => {
  const t = CHART_THEMES[themeMode];
  // Generate a larger palette by repeating/shifting basic pie colors
  const extendedColors = [...t.pieColors, ...t.pieColors].map((c, i) => i % 2 === 0 ? c : c + 'CC'); 

  return (
    <div className="h-[500px] w-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={160}
            paddingAngle={1}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || extendedColors[index % extendedColors.length]} 
                stroke={themeMode === 'dark' ? '#1e293b' : themeMode === 'neon' ? '#000' : '#fff'} 
                strokeWidth={themeMode === 'comic' ? 2 : 1} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${(value || 0).toLocaleString('pl-PL')} zł`, 'Wartość']}
            contentStyle={getTooltipStyle(themeMode as ThemeMode)}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            iconType="circle" 
            wrapperStyle={{ fontSize: '12px', maxHeight: '480px', overflowY: 'auto' }}
            formatter={(value, entry: any) => {
                const val = entry.payload.value;
                const textColor = themeMode === 'dark' ? 'text-slate-300' : themeMode === 'neon' ? 'text-cyan-400' : 'text-slate-600';
                const subTextColor = themeMode === 'dark' ? 'text-slate-500' : themeMode === 'neon' ? 'text-cyan-800' : 'text-slate-400';
                return <span className={`${textColor} font-medium ml-1`}>{value} <span className={`${subTextColor} text-xs ml-1`}>({val.toLocaleString('pl-PL')} zł)</span></span>;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Mapping of asset names to their respective Logo components
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

const AssetLogo: React.FC<AssetLogoProps> = ({ name, x, y, width, height }) => {
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

const getHeatmapColor = (roi: number | undefined): string => {
  if (roi === undefined) return '#475569'; 

  if (roi >= 50) return '#064e3b'; 
  if (roi >= 20) return '#047857'; 
  if (roi >= 0) return '#059669'; 

  if (roi <= -30) return '#881337'; 
  if (roi <= -10) return '#be123c'; 
  return '#e11d48'; 
};

const TreemapContent = (props: any) => {
  const { x, y, width, height, index, payload, name: nameProp, themeMode } = props;
  
  if (x === undefined || y === undefined || width === undefined || height === undefined) return null;

  const dataItem = payload || {};
  const name = nameProp || dataItem.name || '';
  const roi = props.roi !== undefined ? props.roi : dataItem.roi;

  const fontSizeName = Math.max(9, Math.min(width / 7, 12));
  const fontSizeRoi = Math.max(9, fontSizeName * 0.8);

  const color = getHeatmapColor(roi);

  const showText = width > 40 && height > 30;
  const padding = 5;

  const strokeColor = themeMode === 'dark' ? '#1e293b' : themeMode === 'neon' ? '#000' : '#fff';
  const strokeWidth = themeMode === 'comic' ? 2 : 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {name && <AssetLogo name={name} x={x} y={y} width={width} height={height} />}
      
      {showText && name && (
        <text
          x={x + padding}
          y={y + padding + fontSizeName * 0.8} 
          textAnchor="start"
          fill="#fff"
          fontSize={fontSizeName}
          fontWeight="700"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)', pointerEvents: 'none' }}
        >
          {name}
        </text>
      )}
      
      {showText && roi !== undefined && (
        <text
          x={x + width - padding}
          y={y + height - padding} 
          textAnchor="end"
          fill="#fff" 
          fontSize={fontSizeRoi}
          fontWeight="500"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)', pointerEvents: 'none', opacity: 0.95 }}
        >
          {roi > 0 ? '+' : ''}{Number(roi).toFixed(1)}%
        </text>
      )}
    </g>
  );
};

interface OMFTreemapChartProps {
  data: { name: string; value: number; roi: number }[];
  themeMode?: ThemeMode;
}

export const OMFTreemapChart: React.FC<OMFTreemapChartProps> = ({ data, themeMode = 'default' }) => {
  const t = CHART_THEMES[themeMode];
  
  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          aspectRatio={4 / 3}
          stroke={themeMode === 'dark' ? "#1e293b" : themeMode === 'neon' ? '#000' : "#fff"}
          fill="#8884d8"
          content={(props) => <TreemapContent {...props} themeMode={themeMode as ThemeMode} />}
        >
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const style = getTooltipStyle(themeMode as ThemeMode);
                return (
                  <div className="p-3 shadow-lg" style={style}>
                    <p className="font-bold">{data.name}</p>
                    <p className="text-sm opacity-80">
                      Wartość: <span className="font-semibold">{formatCurrency(data.value)}</span>
                    </p>
                    {data.roi !== undefined && (
                      <p className={`text-sm font-semibold ${data.roi >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ROI: {data.roi > 0 ? '+' : ''}{Number(data.roi).toFixed(2)}%
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

// --- Standard Charts ---

export const ValueCompositionChart: React.FC<ChartProps> = ({ data, showProjection, themeMode = 'default' }) => {
  if (data.length === 0) return null;
  const isPPK = 'employeeContribution' in data[0];
  const t = CHART_THEMES[themeMode];

  // Prepare data with additional computed fields for PPK
  const chartData = useMemo(() => {
    if (!isPPK) return data;
    return data.map(d => {
      const r = d as any;
      if (r.employeeContribution === undefined) return r;

      const taxAbs = Math.abs(r.tax || 0);
      const netValue = r.totalValue - taxAbs;
      const exitValue = netValue - (0.30 * r.employerContribution) - r.stateContribution - (0.19 * r.fundProfit);

      return {
        ...r,
        taxSigned: r.tax,
        netValue,
        exitValue
      };
    });
  }, [data, isPPK]);

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData as any[]}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={t.investment} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={t.investment} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={t.axis} stopOpacity={0.5}/>
              <stop offset="95%" stopColor={t.axis} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
            stroke={t.axis} 
            fontSize={12}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              const nameMap: Record<string, string> = {
                totalValue: 'Wartość Całkowita',
                investment: 'Wkład Własny',
                employeeContribution: 'Pracownik',
                employerContribution: 'Pracodawca',
                stateContribution: 'Państwo',
                fundProfit: 'Zysk Funduszu',
                taxSigned: 'Podatek',
                netValue: 'Wartość Netto',
                exitValue: 'Wartość Exit',
                projectedTotalValue: 'Prognoza (Emerytura)'
              };
              return [`${value.toLocaleString('pl-PL')} zł`, nameMap[name] || name];
            }}
            labelFormatter={formatDate}
            contentStyle={getTooltipStyle(themeMode as ThemeMode)}
          />
          <Legend verticalAlign="top" height={36} />
          
          {isPPK ? (
            <>
              <Area type="monotone" dataKey="employeeContribution" name="Pracownik" stackId="1" stroke={t.investment} fill={t.investment} fillOpacity={0.9} strokeWidth={t.strokeWidth} />
              <Area type="monotone" dataKey="employerContribution" name="Pracodawca" stackId="1" stroke={t.employer} fill={t.employer} fillOpacity={0.9} strokeWidth={t.strokeWidth} />
              <Area type="monotone" dataKey="stateContribution" name="Państwo" stackId="1" stroke={t.state} fill={t.state} fillOpacity={0.9} strokeWidth={t.strokeWidth} />
              <Area type="monotone" dataKey="fundProfit" name="Zysk Funduszu" stackId="1" stroke={t.profit} fill={t.profit} fillOpacity={0.9} strokeWidth={t.strokeWidth} />
              
              <Area 
                type="monotone" 
                dataKey="taxSigned" 
                name="Podatek" 
                stroke={t.tax} 
                fill={t.tax} 
                fillOpacity={0.9}
                strokeWidth={t.strokeWidth}
              />
              <Line type="monotone" dataKey="netValue" name="Wartość Netto" stroke={t.net} strokeWidth={t.strokeWidth} dot={false} />
              <Line type="monotone" dataKey="exitValue" name="Wartość Exit" stroke={t.exit} strokeWidth={t.strokeWidth} dot={false} />
              
              {showProjection && (
                <Line 
                  type="monotone" 
                  dataKey="projectedTotalValue" 
                  name="Prognoza" 
                  stroke={t.projection} 
                  strokeWidth={t.strokeWidth} 
                  strokeDasharray="5 5"
                  dot={false} 
                  activeDot={{ r: 6 }}
                />
              )}
            </>
          ) : (
            <>
              <Area 
                type="monotone" 
                dataKey="totalValue" 
                name="Wartość Całkowita" 
                stroke={t.investment} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={t.strokeWidth}
              />
              <Area 
                type="monotone" 
                dataKey="investment" 
                name="Wkład Własny" 
                stroke={t.axis} 
                fillOpacity={1} 
                fill="url(#colorInvest)" 
                strokeWidth={t.strokeWidth}
                strokeDasharray="5 5"
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ROIChart: React.FC<ChartProps> = ({ data, themeMode = 'default' }) => {
  const hasExitRoi = data.length > 0 && 'exitRoi' in data[0];
  const t = CHART_THEMES[themeMode];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data as any[]}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            stroke={t.axis} 
            fontSize={12} 
            unit="%" 
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)}%`, 
              name === 'exitRoi' ? 'Exit ROI' : 'ROI'
            ]}
            labelFormatter={formatDate}
            contentStyle={getTooltipStyle(themeMode as ThemeMode)}
          />
          <Legend verticalAlign="top" height={36} />
          <ReferenceLine y={0} stroke={t.tax} strokeDasharray="3 3" />
          <Line 
            type="monotone" 
            dataKey="roi" 
            name="ROI"
            stroke={t.profit} 
            strokeWidth={t.strokeWidth} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
          {hasExitRoi && (
            <Line 
              type="monotone" 
              dataKey="exitRoi" 
              name="Exit ROI"
              stroke={t.projection} 
              strokeWidth={t.strokeWidth} 
              strokeDasharray="5 5"
              dot={false} 
              activeDot={{ r: 6 }} 
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ContributionComparisonChart: React.FC<ChartProps> = ({ data, themeMode = 'default' }) => {
  const t = CHART_THEMES[themeMode];
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data as any[]}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
            stroke={t.axis} 
            fontSize={12}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toLocaleString('pl-PL')} zł`]}
            labelFormatter={formatDate}
            cursor={{fill: themeMode === 'dark' ? '#334155' : themeMode === 'neon' ? '#22d3ee10' : '#f1f5f9'}}
            contentStyle={getTooltipStyle(themeMode as ThemeMode)}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="employeeContribution" name="Pracownik" stackId="a" fill={t.investment} radius={[0, 0, 4, 4]} stroke={themeMode === 'comic' ? '#000' : undefined} strokeWidth={themeMode === 'comic' ? 2 : 0} />
          <Bar dataKey="employerContribution" name="Pracodawca" stackId="a" fill={t.employer} stroke={themeMode === 'comic' ? '#000' : undefined} strokeWidth={themeMode === 'comic' ? 2 : 0} />
          <Bar dataKey="stateContribution" name="Państwo" stackId="a" fill={t.state} radius={[4, 4, 0, 0]} stroke={themeMode === 'comic' ? '#000' : undefined} strokeWidth={themeMode === 'comic' ? 2 : 0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CryptoValueChart: React.FC<ChartProps> = ({ data, showTaxComparison, themeMode = 'default' }) => {
  const hasTaxedValue = data.length > 0 && 'taxedTotalValue' in data[data.length - 1];
  const t = CHART_THEMES[themeMode];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data as any[]}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={t.employer} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={t.employer} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInvest2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={t.axis} stopOpacity={0.5}/>
              <stop offset="95%" stopColor={t.axis} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
            stroke={t.axis} 
            fontSize={12}
          />
          <Tooltip 
            formatter={(value: number, name: string, item: any) => {
               const payload = item.payload;
               if (name === 'taxedTotalValue') {
                  const total = payload.totalValue;
                  const taxed = value;
                  const saved = total - taxed;
                  return [
                    `${value.toLocaleString('pl-PL')} zł`, 
                    `Konto Opodatkowane (oszczędzasz: ${saved.toLocaleString('pl-PL')} zł)`
                  ];
               }
               const labels: Record<string, string> = {
                 totalValue: 'Wycena Portfela',
                 investment: 'Zainwestowany Kapitał',
               }
               return [`${value.toLocaleString('pl-PL')} zł`, labels[name] || name];
            }}
            labelFormatter={formatDate}
            contentStyle={getTooltipStyle(themeMode as ThemeMode)}
          />
          <Legend verticalAlign="top" height={36} />
          
          <Area 
            type="monotone" 
            dataKey="totalValue" 
            name="Wycena Portfela" 
            stroke={t.employer} 
            fillOpacity={1} 
            fill="url(#colorTotal)" 
            strokeWidth={t.strokeWidth}
          />
          <Area 
            type="monotone" 
            dataKey="investment" 
            name="Zainwestowany Kapitał" 
            stroke={t.axis} 
            fillOpacity={1} 
            fill="url(#colorInvest2)" 
            strokeWidth={t.strokeWidth}
            strokeDasharray="5 5"
          />

          {hasTaxedValue && showTaxComparison && (
            <Line
              type="monotone"
              dataKey="taxedTotalValue"
              name="Konto Opodatkowane"
              stroke={t.axis}
              strokeWidth={t.strokeWidth}
              strokeDasharray="3 3"
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GlobalSummaryChart: React.FC<ChartProps> = ({ data, showProjection, showCPI, themeMode = 'default' }) => {
  const t = CHART_THEMES[themeMode];

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data as any[]}>
          <defs>
            <linearGradient id="colorInvestGlobal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={t.investment} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={t.investment} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorProfitGlobal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={t.profit} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={t.profit} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
            stroke={t.axis} 
            fontSize={12}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                    investment: 'Wkład',
                    profit: 'Zysk',
                    projectedValue: 'Prognoza (Droga do Miliona)',
                    realTotalValue: 'Wartość&CPI'
                };
                return [`${value.toLocaleString('pl-PL')} zł`, labels[name] || name];
            }}
            labelFormatter={formatDate}
            contentStyle={getTooltipStyle(themeMode as ThemeMode)}
          />
          <Legend verticalAlign="top" height={36} />
          
          <Area 
            type="monotone" 
            dataKey="investment" 
            name="Wkład" 
            stackId="1" 
            stroke={t.investment} 
            fill="url(#colorInvestGlobal)" 
            strokeWidth={t.strokeWidth}
          />
          
          <Area 
            type="monotone" 
            dataKey="profit" 
            name="Zysk" 
            stackId="1" 
            stroke={t.profit} 
            fill="url(#colorProfitGlobal)" 
            strokeWidth={t.strokeWidth}
          />

          {showCPI && (
            <Line 
              type="monotone" 
              dataKey="realTotalValue" 
              name="Wartość&CPI" 
              stroke={t.exit} 
              strokeWidth={t.strokeWidth} 
              strokeDasharray="3 3"
              dot={false} 
            />
          )}

          {showProjection && (
            <Line 
              type="monotone" 
              dataKey="projectedValue" 
              name="Prognoza" 
              stroke={t.projection} 
              strokeWidth={t.strokeWidth} 
              strokeDasharray="5 5"
              dot={false} 
              activeDot={{ r: 6 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GlobalPerformanceChart: React.FC<ChartProps> = ({ data, themeMode = 'default' }) => {
  const [showSP500, setShowSP500] = useState(false);
  const [showWIG20, setShowWIG20] = useState(false);
  const t = CHART_THEMES[themeMode];

  const chartData = data.filter((d, i) => i >= 0);

  return (
    <div className="w-full">
      <div className="flex justify-end space-x-3 mb-2 px-2">
        <button
          onClick={() => setShowSP500(!showSP500)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
            showSP500 
              ? 'bg-slate-700 text-white ring-2 ring-slate-700 ring-offset-1' 
              : `border border-slate-300 ${themeMode === 'dark' || themeMode === 'neon' ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-600'} hover:opacity-80`
          }`}
        >
          S&P 500
        </button>
        <button
          onClick={() => setShowWIG20(!showWIG20)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
            showWIG20 
              ? 'bg-purple-800 text-white ring-2 ring-purple-800 ring-offset-1' 
              : `border border-slate-300 ${themeMode === 'dark' || themeMode === 'neon' ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-600'} hover:opacity-80`
          }`}
        >
          WIG20
        </button>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData as any[]}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              stroke={t.axis} 
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              stroke={t.axis} 
              fontSize={12} 
              unit="%" 
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                 const labels: Record<string, string> = {
                   roi: 'ROI',
                   cumulativeTwr: 'TWR',
                   sp500Return: 'S&P 500',
                   wig20Return: 'WIG20'
                 };
                 if (typeof value !== 'number') return [value, name];
                 return [`${value.toFixed(2)}%`, labels[name] || name];
              }}
              labelFormatter={formatDate}
              contentStyle={getTooltipStyle(themeMode as ThemeMode)}
            />
            <Legend verticalAlign="top" height={36} />
            <ReferenceLine y={0} stroke={t.axis} strokeDasharray="3 3" />
            
            <Line 
              type="monotone" 
              dataKey="roi" 
              name="ROI" 
              stroke={t.profit} 
              strokeWidth={t.strokeWidth} 
              dot={false} 
            />
            
            <Line 
              type="monotone" 
              dataKey="cumulativeTwr" 
              name="TWR" 
              stroke={t.projection} 
              strokeWidth={t.strokeWidth} 
              strokeDasharray="5 5"
              dot={false} 
            />

            {showSP500 && (
              <Line 
                type="monotone" 
                dataKey="sp500Return" 
                name="S&P 500" 
                stroke={t.exit} 
                strokeWidth={1.5} 
                strokeOpacity={0.7}
                dot={false} 
              />
            )}

            {showWIG20 && (
              <Line 
                type="monotone" 
                dataKey="wig20Return" 
                name="WIG20" 
                stroke={t.employer} 
                strokeWidth={1.5} 
                strokeOpacity={0.7}
                dot={false} 
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const PortfolioAllocationHistoryChart: React.FC<ChartProps> = ({ data, themeMode = 'default' }) => {
  const t = CHART_THEMES[themeMode];
  const chartData = data.map(row => {
    const r = row as any;
    return {
      date: r.date,
      ppk: (r.ppkShare || 0) * 100,
      crypto: (r.cryptoShare || 0) * 100,
      ike: (r.ikeShare || 0) * 100,
    };
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} stackOffset="expand">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            stroke={t.axis} 
            fontSize={12} 
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
          />
          <Tooltip 
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`]} 
            labelFormatter={formatDate}
            contentStyle={getTooltipStyle(themeMode as ThemeMode)}
          />
          <Legend verticalAlign="top" height={36} />
          <Area type="monotone" dataKey="ppk" name="PPK" stackId="1" stroke={t.investment} fill={t.investment} fillOpacity={0.8} strokeWidth={t.strokeWidth} />
          <Area type="monotone" dataKey="crypto" name="Krypto" stackId="1" stroke={t.employer} fill={t.employer} fillOpacity={0.8} strokeWidth={t.strokeWidth} />
          <Area type="monotone" dataKey="ike" name="IKE" stackId="1" stroke={t.state} fill={t.state} fillOpacity={0.8} strokeWidth={t.strokeWidth} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CapitalStructureHistoryChart: React.FC<ChartProps> = ({ data, themeMode = 'default' }) => {
  if (data.length === 0 || !('employeeContribution' in data[0])) return null;
  const t = CHART_THEMES[themeMode];

  const chartData = data.map(row => {
    const r = row as PPKDataRow;
    return {
      date: r.date,
      employee: r.employeeContribution,
      employer: r.employerContribution,
      state: r.stateContribution,
      profit: r.fundProfit, 
      total: r.totalValue
    };
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} stackOffset="expand">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            stroke={t.axis} 
            fontSize={12} 
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
          />
          <Tooltip 
            formatter={(value: number, name: string, item: any) => {
               const payload = item.payload;
               const total = payload.employee + payload.employer + payload.state + payload.profit;
               const percent = total !== 0 ? (value / total) * 100 : 0;
               
               const nameMap: Record<string, string> = {
                 employee: 'Wkład Własny',
                 employer: 'Pracodawca',
                 state: 'Państwo',
                 profit: 'Zysk Funduszu' 
               };

               return [
                 `${percent.toFixed(1)}% (${value.toLocaleString('pl-PL')} zł)`, 
                 nameMap[name] || name
               ];
            }}
            labelFormatter={formatDate}
            contentStyle={getTooltipStyle(themeMode as ThemeMode)}
          />
          <Legend verticalAlign="top" height={36} />
          <Area type="monotone" dataKey="employee" name="Wkład Własny" stackId="1" stroke={t.investment} fill={t.investment} fillOpacity={0.9} strokeWidth={t.strokeWidth} />
          <Area type="monotone" dataKey="employer" name="Pracodawca" stackId="1" stroke={t.employer} fill={t.employer} fillOpacity={0.9} strokeWidth={t.strokeWidth} />
          <Area type="monotone" dataKey="state" name="Państwo" stackId="1" stroke={t.state} fill={t.state} fillOpacity={0.9} strokeWidth={t.strokeWidth} />
          <Area type="monotone" dataKey="profit" name="Zysk Funduszu" stackId="1" stroke={t.profit} fill={t.profit} fillOpacity={0.9} strokeWidth={t.strokeWidth} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SeasonalityChart: React.FC<{ data: any[], themeMode?: ThemeMode }> = ({ data, themeMode = 'default' }) => {
  if (data.length < 2) return null;
  const t = CHART_THEMES[themeMode];

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const dataMap = new Map<string, any>();
  
  const parseDateKey = (dateStr: string) => {
      const parts = dateStr.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1; 
      return { y, m, key: `${y}-${m}` };
  };

  sorted.forEach(row => {
      const { key } = parseDateKey(row.date);
      dataMap.set(key, row);
  });

  const monthReturns: number[][] = Array(12).fill(null).map(() => []);

  const startYear = parseDateKey(sorted[0].date).y;
  const endYear = parseDateKey(sorted[sorted.length - 1].date).y;

  for (let y = startYear; y <= endYear; y++) {
      for (let m = 0; m < 12; m++) {
          const currentKey = `${y}-${m}`;
          
          let prevY = y;
          let prevM = m - 1;
          if (prevM < 0) { prevM = 11; prevY = y - 1; }
          const prevKey = `${prevY}-${prevM}`;

          const curr = dataMap.get(currentKey);
          const prev = dataMap.get(prevKey);

          if (curr) {
              let r = 0;
              if (prev) {
                  const startVal = prev.totalValue ?? (prev.investment + prev.profit);
                  const endVal = curr.totalValue ?? (curr.investment + curr.profit);
                  const flow = curr.investment - prev.investment;
                  const denom = startVal + flow;
                  if (denom !== 0) {
                      r = ((endVal - startVal - flow) / denom) * 100;
                  }
              } else {
                  if (curr.investment !== 0) {
                      r = (curr.profit / curr.investment) * 100;
                  }
              }
              monthReturns[m].push(r);
          }
      }
  }

  const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
  const chartData = monthNames.map((name, idx) => {
      const returns = monthReturns[idx];
      const avg = returns.length > 0 
          ? returns.reduce((a, b) => a + b, 0) / returns.length 
          : 0;
      return { name, value: avg, count: returns.length };
  });

  return (
    <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
                <XAxis dataKey="name" stroke={t.axis} fontSize={12} tickMargin={5} />
                <YAxis stroke={t.axis} fontSize={12} unit="%" />
                <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Średnia stopa zwrotu']}
                    contentStyle={getTooltipStyle(themeMode as ThemeMode)}
                />
                <ReferenceLine y={0} stroke={t.axis} />
                <Bar dataKey="value" name="Średnia Stopa Zwrotu" stroke={themeMode === 'comic' ? '#000' : undefined} strokeWidth={themeMode === 'comic' ? 2 : 0}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? t.barProfitPos : t.barProfitNeg} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

const renderCustomLabel = (props: any, text: string) => {
  const { x, y, width, height } = props;
  if (width < 40) return null; // Hide label if bar segment is too small
  return (
    <text 
      x={x + width / 2} 
      y={y + height / 2} 
      fill="#fff" 
      textAnchor="middle" 
      dominantBaseline="middle"
      fontSize={12}
      fontWeight="bold"
      style={{ pointerEvents: 'none', textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
    >
      {text}
    </text>
  );
};

interface PPKStructureBarProps {
  data: SummaryStats;
  themeMode?: ThemeMode;
}

export const PPKStructureBar: React.FC<PPKStructureBarProps> = ({ data, themeMode = 'default' }) => {
  if (!data.totalEmployee) return null;
  const t = CHART_THEMES[themeMode];

  const employee = data.totalEmployee || 0;
  const employer = data.totalEmployer || 0;
  const state = data.totalState || 0;
  const fundProfit = (data.totalValue || 0) - (employee + employer + state);

  const chartData = [
    {
      name: "Struktura",
      employee,
      employer,
      state,
      profit: fundProfit,
    }
  ];

  const strokeProps = themeMode === 'comic' ? { stroke: '#000', strokeWidth: 2 } : {};

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis type="category" dataKey="name" hide width={1} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            formatter={(value: number, name: string) => {
               const total = employee + employer + state + fundProfit;
               const percent = total > 0 ? (value / total) * 100 : 0;
               const labels: Record<string, string> = {
                 employee: 'Pracownik',
                 employer: 'Pracodawca',
                 state: 'Państwo',
                 profit: 'Wynik Funduszu'
               };
               return [`${value.toLocaleString('pl-PL')} zł (${percent.toFixed(1)}%)`, labels[name] || name];
            }}
            contentStyle={getTooltipStyle(themeMode as ThemeMode)}
          />
          <Bar dataKey="employee" name="Pracownik" stackId="a" fill={t.investment} radius={[4, 0, 0, 4]} barSize={60} {...strokeProps}>
            <LabelList content={(props) => renderCustomLabel(props, "Pracownik")} />
          </Bar>
          <Bar dataKey="employer" name="Pracodawca" stackId="a" fill={t.employer} barSize={60} {...strokeProps}>
            <LabelList content={(props) => renderCustomLabel(props, "Pracodawca")} />
          </Bar>
          <Bar dataKey="state" name="Państwo" stackId="a" fill={t.state} barSize={60} {...strokeProps}>
            <LabelList content={(props) => renderCustomLabel(props, "Państwo")} />
          </Bar>
          <Bar dataKey="profit" name="Wynik Funduszu" stackId="a" fill={fundProfit >= 0 ? t.barProfitPos : t.barProfitNeg} radius={[0, 4, 4, 0]} barSize={60} {...strokeProps}>
            <LabelList content={(props) => renderCustomLabel(props, "Zysk Funduszu")} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
