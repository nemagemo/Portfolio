
import React, { useState } from 'react';
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
import { PPKDataRow, CryptoDataRow, AnyDataRow, GlobalHistoryRow } from '../types';

// Logo Imports
// Each logo is a separate React Component wrapping an SVG.
// This prevents "broken image" icons found when using <img> tags with relative paths in some hosted envs.
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

interface ChartProps {
  data: AnyDataRow[];
  className?: string;
}

const formatCurrency = (value: number | undefined) => `${(value || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł`;
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
};

// --- OMF Specific Charts ---

interface OMFAllocationProps {
  data: { name: string; value: number; color?: string; roi?: number }[];
  title?: string;
}

// Standard Palette
const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#64748b'];
// Extended Palette for larger charts
const EXTENDED_COLORS = [
  '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#64748b',
  '#06b6d4', '#ec4899', '#84cc16', '#eab308', '#d946ef', '#6366f1',
  '#14b8a6', '#f97316', '#a855f7', '#ef4444', '#22c55e', '#3b82f6'
];

export const OMFAllocationChart: React.FC<OMFAllocationProps> = ({ data, title }) => {
  return (
    <div className="h-80 w-full flex flex-col items-center">
      {title && <h4 className="text-sm font-semibold text-slate-500 mb-2">{title}</h4>}
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
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} strokeWidth={1} stroke="#fff" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${(value || 0).toLocaleString('pl-PL')} zł`, 'Wartość']}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="bottom" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const OMFStructureChart: React.FC<OMFAllocationProps> = ({ data }) => {
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
              <Cell key={`cell-${index}`} fill={entry.color || EXTENDED_COLORS[index % EXTENDED_COLORS.length]} strokeWidth={1} stroke="#fff" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${(value || 0).toLocaleString('pl-PL')} zł`, 'Wartość']}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            iconType="circle" 
            wrapperStyle={{ fontSize: '12px', maxHeight: '480px', overflowY: 'auto' }}
            formatter={(value, entry: any) => {
                const val = entry.payload.value;
                return <span className="text-slate-600 font-medium ml-1">{value} <span className="text-slate-400 text-xs ml-1">({val.toLocaleString('pl-PL')} zł)</span></span>;
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
  ETFBS80TR: ETFBS80TRLogo
};

interface AssetLogoProps {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Renders a logo centered within a treemap tile.
 * Chooses an SVG component if available in LOGO_MAP.
 * If no logo is found, renders nothing (no image fallback).
 */
const AssetLogo: React.FC<AssetLogoProps> = ({ name, x, y, width, height }) => {
  const LogoComponent = LOGO_MAP[name];
  
  // Safety check for dimensions to prevent rendering errors
  if (!width || !height || width <= 0 || height <= 0) return null;

  // Calculate size for the logo to fit nicely (e.g., 60% of the smallest dimension)
  const padding = Math.min(width, height) * 0.2;
  const size = Math.max(0, Math.min(width, height) - (padding * 2));
  
  if (size <= 0) return null;

  // Center the logo
  const logoX = x + (width - size) / 2;
  const logoY = y + (height - size) / 2;

  const commonProps = {
    x: logoX,
    y: logoY,
    width: size,
    height: size,
    opacity: 0.8, // Increased visibility to 0.8 per user request
    stroke: "none", // Explicitly disable inherited stroke from Treemap parent
    style: { pointerEvents: 'none' as const }
  };

  if (LogoComponent) {
    return <LogoComponent {...commonProps} />;
  }

  // Fallback removed: if no logo component exists, render nothing.
  return null;
};

/**
 * Returns a background color based on ROI.
 * Green for positive, Red for negative.
 * Darker shades for higher absolute values to allow white text to pop.
 */
const getHeatmapColor = (roi: number | undefined): string => {
  if (roi === undefined) return '#475569'; // Slate 600 (Neutral)

  // Positive ROI (Greens)
  if (roi >= 50) return '#064e3b'; // Emerald 900
  if (roi >= 20) return '#047857'; // Emerald 700
  if (roi >= 0) return '#059669'; // Emerald 600

  // Negative ROI (Reds)
  if (roi <= -30) return '#881337'; // Rose 900
  if (roi <= -10) return '#be123c'; // Rose 700
  return '#e11d48'; // Rose 600
};

// Extracted Content Component for Treemap
// NOTE: This must be passed as a function `(props) => <TreemapContent ... />` 
// to the Treemap `content` prop to ensure Recharts passes the dynamic layout props (x, y, width, height).
const TreemapContent = (props: any) => {
  const { x, y, width, height, index, payload, name: nameProp } = props;
  
  // Ensure we have valid coordinates and dimensions
  if (x === undefined || y === undefined || width === undefined || height === undefined) return null;

  // Robust data extraction - Recharts can pass data in different ways depending on nesting
  const dataItem = payload || {};
  const name = nameProp || dataItem.name || '';
  const roi = props.roi !== undefined ? props.roi : dataItem.roi;

  // Font Sizing Logic - REDUCED per user request
  // Reduced max size from 14 to 12, and increased divisor slightly
  const fontSizeName = Math.max(9, Math.min(width / 7, 12));
  const fontSizeRoi = Math.max(9, fontSizeName * 0.8);

  const color = getHeatmapColor(roi);

  // Hide text if the box is too small
  const showText = width > 40 && height > 30;
  
  // Padding for text in corners
  const padding = 5;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
      {name && <AssetLogo name={name} x={x} y={y} width={width} height={height} />}
      
      {showText && name && (
        <text
          x={x + padding}
          y={y + padding + fontSizeName * 0.8} // Top-Left
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
          y={y + height - padding} // Bottom-Right
          textAnchor="end"
          fill="#fff" // Always white for better contrast against colored backgrounds
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
}

export const OMFTreemapChart: React.FC<OMFTreemapChartProps> = ({ data }) => {
  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          // Using a render function here is critical for passing props down to custom SVG content
          content={(props) => <TreemapContent {...props} />}
        >
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                    <p className="font-bold text-slate-800">{data.name}</p>
                    <p className="text-sm text-slate-600">
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

export const ValueCompositionChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  const isPPK = 'employeeContribution' in data[0];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data as any[]}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke="#94a3b8" 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
            stroke="#94a3b8" 
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
                fundProfit: 'Zysk Funduszu'
              };
              return [`${value.toLocaleString('pl-PL')} zł`, nameMap[name] || name];
            }}
            labelFormatter={formatDate}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="top" height={36} />
          
          {isPPK ? (
            // PPK Stacked View: Employee + Employer + State + FundProfit
            <>
              <Area type="monotone" dataKey="employeeContribution" name="Pracownik" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.9} />
              <Area type="monotone" dataKey="employerContribution" name="Pracodawca" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.9} />
              <Area type="monotone" dataKey="stateContribution" name="Państwo" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.9} />
              <Area type="monotone" dataKey="fundProfit" name="Zysk Funduszu" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.9} />
            </>
          ) : (
            // Generic View (Crypto/IKE)
            <>
              <Area 
                type="monotone" 
                dataKey="totalValue" 
                name="Wartość Całkowita" 
                stroke="#4f46e5" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="investment" 
                name="Wkład Własny" 
                stroke="#94a3b8" 
                fillOpacity={1} 
                fill="url(#colorInvest)" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ROIChart: React.FC<ChartProps> = ({ data }) => {
  const hasExitRoi = data.length > 0 && 'exitRoi' in data[0];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data as any[]}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke="#94a3b8" 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            unit="%" 
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)}%`, 
              name === 'exitRoi' ? 'Exit ROI' : 'ROI'
            ]}
            labelFormatter={formatDate}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="top" height={36} />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
          <Line 
            type="monotone" 
            dataKey="roi" 
            name="ROI"
            stroke="#10b981" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
          {hasExitRoi && (
            <Line 
              type="monotone" 
              dataKey="exitRoi" 
              name="Exit ROI"
              stroke="#f59e0b" 
              strokeWidth={2} 
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

export const ContributionComparisonChart: React.FC<ChartProps> = ({ data }) => (
  <div className="h-80 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data as any[]}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate} 
          stroke="#94a3b8" 
          fontSize={12}
          tickMargin={10}
        />
        <YAxis 
          tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
          stroke="#94a3b8" 
          fontSize={12}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toLocaleString('pl-PL')} zł`]}
          labelFormatter={formatDate}
          cursor={{fill: '#f1f5f9'}}
          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />
        <Legend verticalAlign="top" height={36} />
        <Bar dataKey="employeeContribution" name="Pracownik" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
        <Bar dataKey="employerContribution" name="Pracodawca" stackId="a" fill="#8b5cf6" />
        <Bar dataKey="stateContribution" name="Państwo" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const CryptoValueChart: React.FC<ChartProps> = ({ data }) => (
  <div className="h-80 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data as any[]}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorInvest2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#64748b" stopOpacity={0.5}/>
            <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate} 
          stroke="#94a3b8" 
          fontSize={12}
          tickMargin={10}
        />
        <YAxis 
          tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
          stroke="#94a3b8" 
          fontSize={12}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toLocaleString('pl-PL')} zł`]}
          labelFormatter={formatDate}
          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />
        <Legend verticalAlign="top" height={36} />
        <Area 
          type="monotone" 
          dataKey="totalValue" 
          name="Wycena Portfela" 
          stroke="#8b5cf6" 
          fillOpacity={1} 
          fill="url(#colorTotal)" 
          strokeWidth={2}
        />
        <Area 
          type="monotone" 
          dataKey="investment" 
          name="Zainwestowany Kapitał" 
          stroke="#64748b" 
          fillOpacity={1} 
          fill="url(#colorInvest2)" 
          strokeWidth={2}
          strokeDasharray="5 5"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const CryptoProfitChart: React.FC<ChartProps> = ({ data }) => (
  <div className="h-80 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data as any[]}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate} 
          stroke="#94a3b8" 
          fontSize={12}
          tickMargin={10}
        />
        <YAxis 
          tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
          stroke="#94a3b8" 
          fontSize={12}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toLocaleString('pl-PL')} zł`, 'Zysk/Strata']}
          labelFormatter={formatDate}
          cursor={{fill: '#f1f5f9'}}
          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />
        <ReferenceLine y={0} stroke="#64748b" />
        <Bar dataKey="profit" name="Zysk/Strata Netto">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={(entry.profit || 0) >= 0 ? '#10b981' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const GlobalSummaryChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data as any[]}>
          <defs>
            <linearGradient id="colorInvestGlobal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorProfitGlobal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke="#94a3b8" 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
            stroke="#94a3b8" 
            fontSize={12}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [`${value.toLocaleString('pl-PL')} zł`, name]}
            labelFormatter={formatDate}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="top" height={36} />
          
          <Area 
            type="monotone" 
            dataKey="investment" 
            name="Wkład Łączny" 
            stackId="1" 
            stroke="#3b82f6" 
            fill="url(#colorInvestGlobal)" 
          />
          
          <Area 
            type="monotone" 
            dataKey="profit" 
            name="Zysk Łączny" 
            stackId="1" 
            stroke="#10b981" 
            fill="url(#colorProfitGlobal)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GlobalPerformanceChart: React.FC<ChartProps> = ({ data }) => {
  const [showSP500, setShowSP500] = useState(false);
  const [showWIG20, setShowWIG20] = useState(false);

  // Include first month if it has meaningful data, otherwise filter as usual
  const chartData = data.filter((d, i) => i >= 0);

  return (
    <div className="w-full">
      {/* Toggles */}
      <div className="flex justify-end space-x-3 mb-2 px-2">
        <button
          onClick={() => setShowSP500(!showSP500)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
            showSP500 
              ? 'bg-slate-700 text-white ring-2 ring-slate-700 ring-offset-1' 
              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          S&P 500
        </button>
        <button
          onClick={() => setShowWIG20(!showWIG20)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
            showWIG20 
              ? 'bg-purple-800 text-white ring-2 ring-purple-800 ring-offset-1' 
              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          WIG20
        </button>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData as any[]}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              stroke="#94a3b8" 
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              stroke="#94a3b8" 
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
                 // Only format if value is valid number
                 if (typeof value !== 'number') return [value, name];
                 return [`${value.toFixed(2)}%`, labels[name] || name];
              }}
              labelFormatter={formatDate}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Legend verticalAlign="top" height={36} />
            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
            
            <Line 
              type="monotone" 
              dataKey="roi" 
              name="ROI" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={false} 
            />
            
            <Line 
              type="monotone" 
              dataKey="cumulativeTwr" 
              name="TWR" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={false} 
            />

            {showSP500 && (
              <Line 
                type="monotone" 
                dataKey="sp500Return" 
                name="S&P 500" 
                stroke="#475569" 
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
                stroke="#6b21a8" 
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

export const PortfolioAllocationHistoryChart: React.FC<ChartProps> = ({ data }) => {
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke="#94a3b8" 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
          />
          <Tooltip 
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`]} 
            labelFormatter={formatDate}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Area type="monotone" dataKey="ppk" name="PPK" stackId="1" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.8} />
          <Area type="monotone" dataKey="crypto" name="Krypto" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.8} />
          <Area type="monotone" dataKey="ike" name="IKE" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.8} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CapitalStructureHistoryChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0 || !('employeeContribution' in data[0])) return null;

  // Mapping logic update:
  // Previous: profit = r.profit (Total User Profit = Employer + State + FundProfit).
  // Issue: If we stack Employee + Employer + State + TotalUserProfit, we double count Employer and State.
  // Fix: Use r.fundProfit for the profit layer. The combination of Employee + Employer + State + FundProfit equals Total Value.
  
  const chartData = data.map(row => {
    const r = row as PPKDataRow;
    return {
      date: r.date,
      employee: r.employeeContribution,
      employer: r.employerContribution,
      state: r.stateContribution,
      profit: r.fundProfit, // Use raw Fund Profit for correct stacking
      total: r.totalValue
    };
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} stackOffset="expand">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke="#94a3b8" 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
          />
          <Tooltip 
            formatter={(value: number, name: string, item: any) => {
               const payload = item.payload;
               // Calculate total dynamically to ensure percentage is based on the stack
               const total = payload.employee + payload.employer + payload.state + payload.profit;
               const percent = total !== 0 ? (value / total) * 100 : 0;
               
               const nameMap: Record<string, string> = {
                 employee: 'Wkład Własny',
                 employer: 'Pracodawca',
                 state: 'Państwo',
                 profit: 'Zysk Funduszu' // Correct label
               };

               return [
                 `${percent.toFixed(1)}% (${value.toLocaleString('pl-PL')} zł)`, 
                 nameMap[name] || name
               ];
            }}
            labelFormatter={formatDate}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Area type="monotone" dataKey="employee" name="Wkład Własny" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.9} />
          <Area type="monotone" dataKey="employer" name="Pracodawca" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.9} />
          <Area type="monotone" dataKey="state" name="Państwo" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.9} />
          <Area type="monotone" dataKey="profit" name="Zysk Funduszu" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.9} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
