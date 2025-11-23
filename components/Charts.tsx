
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
  const { x, y, width, height, index, payload, name: nameProp } = props;
  
  if (x === undefined || y === undefined || width === undefined || height === undefined) return null;

  const dataItem = payload || {};
  const name = nameProp || dataItem.name || '';
  const roi = props.roi !== undefined ? props.roi : dataItem.roi;

  const fontSizeName = Math.max(9, Math.min(width / 7, 12));
  const fontSizeRoi = Math.max(9, fontSizeName * 0.8);

  const color = getHeatmapColor(roi);

  const showText = width > 40 && height > 30;
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
            <>
              <Area type="monotone" dataKey="employeeContribution" name="Pracownik" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.9} />
              <Area type="monotone" dataKey="employerContribution" name="Pracodawca" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.9} />
              <Area type="monotone" dataKey="stateContribution" name="Państwo" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.9} />
              <Area type="monotone" dataKey="fundProfit" name="Zysk Funduszu" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.9} />
            </>
          ) : (
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

export const GlobalSummaryChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data as any[]}>
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
            formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                    investment: 'Wkład Łączny',
                    profit: 'Zysk Łączny',
                    projectedValue: 'Prognoza (Droga do Miliona)'
                };
                return [`${value.toLocaleString('pl-PL')} zł`, labels[name] || name];
            }}
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

          <Line 
            type="monotone" 
            dataKey="projectedValue" 
            name="Prognoza" 
            stroke="#d97706" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false} 
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GlobalPerformanceChart: React.FC<ChartProps> = ({ data }) => {
  const [showSP500, setShowSP500] = useState(false);
  const [showWIG20, setShowWIG20] = useState(false);

  const chartData = data.filter((d, i) => i >= 0);

  return (
    <div className="w-full">
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

export const SeasonalityChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (data.length < 2) return null;

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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={5} />
                <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Średnia stopa zwrotu']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <ReferenceLine y={0} stroke="#64748b" />
                <Bar dataKey="value" name="Średnia Stopa Zwrotu">
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

interface PPKWaterfallItem {
  name: string;
  value: number;
  fill: string;
  isTotal?: boolean;
}

export const PPKFlowChart: React.FC<{ data: PPKWaterfallItem[] }> = ({ data }) => {
  // Filter data to get inputs and total
  const totalItem = data.find(item => item.isTotal);
  const inputs = data.filter(item => !item.isTotal);
  
  if (!totalItem || inputs.length === 0) return null;

  const totalValue = totalItem.value;
  if (totalValue <= 0) return null;

  // SVG Dimensions
  const width = 600;
  const height = 300;
  const padding = 20;
  const barWidth = 40;
  const flowStartX = padding + barWidth;
  const flowEndX = width - padding - barWidth;
  
  // Calculate heights proportional to total value
  const availableHeight = height - (padding * 2);
  const gap = 10;
  
  // Total bar (Right side)
  const totalBarHeight = availableHeight;
  const totalBarY = padding;

  // Input bars (Left side)
  // We need to distribute them with gaps
  const totalInputsValue = inputs.reduce((sum, item) => sum + Math.abs(item.value), 0);
  const scale = (availableHeight - (inputs.length - 1) * gap) / totalInputsValue;

  let currentY = padding;
  
  // Render Flows
  const flows = [];
  const inputRects = [];
  let currentTotalY = totalBarY; // Track where next flow connects to Total bar

  // Sort inputs to match specific visual order if needed (Employee top) or leave as is
  // Data order from App.tsx is: Employee, Employer, State, Fund Result
  
  for (let i = 0; i < inputs.length; i++) {
      const item = inputs[i];
      const absValue = Math.abs(item.value);
      const itemHeight = absValue * scale;
      const isNegative = item.value < 0;
      
      // Input Rect
      inputRects.push(
          <g key={`rect-${i}`}>
             <rect 
                x={padding} 
                y={currentY} 
                width={barWidth} 
                height={itemHeight} 
                fill={item.fill} 
                rx={4}
             />
             <text 
                x={padding + barWidth / 2} 
                y={currentY + itemHeight / 2} 
                dy={4}
                textAnchor="middle" 
                fill="#fff" 
                fontSize={10} 
                fontWeight="bold"
                style={{pointerEvents: 'none'}}
             >
                {((absValue / totalValue) * 100).toFixed(0)}%
             </text>
             {/* Label outside */}
             <text 
                x={padding} 
                y={currentY - 5} 
                fill="#64748b" 
                fontSize={10} 
                fontWeight="500"
             >
                {item.name}
             </text>
          </g>
      );

      // Flow Path (Bezier Curve)
      // Start: Middle Right of Input Rect
      // End: Left side of Total Rect, mapped strictly to value contribution
      // Note: Total Bar is continuous, so we map flows to stacks on the Total Bar
      
      // Calculate the portion of the total bar this input represents
      // (If value is negative, it technically reduces total, but for visualization we often show it contributing 
      // or flowing out. For simplicity here, we map absolute magnitude to flow width visually)
      
      // Correction: PPK Fund result can be negative. A Sankey for negative flow usually flows OUT of the total or into a loss node.
      // Given the request for "Sankey-style" and simple visuals, if negative, we draw it, but maybe thinner or faded?
      // Let's treat all as contributors to the visual "block" of value for now to keep the visual simple and "flowing".
      // Or better: The visual block on the right represents the Net Total. 
      // Inputs are components.
      // To make it look like a Sankey: 
      // y_start = currentY + itemHeight / 2
      // y_end_top = currentTotalY
      // y_end_bottom = currentTotalY + (itemHeight proportional to Right Side scale?)
      
      // Actually, Total Bar height is `availableHeight`. Total Value is `totalValue`.
      // So scale on right is `availableHeight / totalValue`.
      // But we used `scale` calculated from SUM of abs(inputs). 
      // If sum(inputs) != totalValue (due to negative), heights won't match exactly.
      // For the purpose of this specific chart (PPK Breakdown), components SUM to Total exactly if all positive.
      // If Fund Profit is negative, Total < Sum(Inputs).
      // Visual trick: We scale flows to match the Right Bar visually.
      
      const rightScale = availableHeight / totalValue; 
      // If we have negative value, this logic gets tricky. 
      // Let's assume standard PPK growth where Profit is positive for the nice visual.
      // If negative, we'll just render it but it might look slightly overlapping or detached. 
      // Standard fallback: Map flows to source height.
      
      const flowHeight = itemHeight; 
      
      // Path coordinates
      const startX = padding + barWidth;
      const startYTop = currentY;
      const startYBot = currentY + itemHeight;
      
      const endX = flowEndX;
      // Target Y on the Total Bar
      // We stack them downwards
      // We need to normalize the target height to fit the Total Bar exactly
      const targetHeight = (item.value / totalValue) * availableHeight; 
      
      // If negative, we can't easily stack it "inside" the total bar in a standard flow.
      // We will skip flow for negative values or draw a thin line to bottom.
      
      if (!isNegative) {
          const endYTop = currentTotalY;
          const endYBot = currentTotalY + targetHeight;
          
          const controlPointX1 = startX + (endX - startX) / 2;
          const controlPointX2 = endX - (endX - startX) / 2;

          flows.push(
              <path 
                  key={`flow-${i}`}
                  d={`
                      M ${startX} ${startYTop} 
                      C ${controlPointX1} ${startYTop}, ${controlPointX2} ${endYTop}, ${endX} ${endYTop}
                      L ${endX} ${endYBot}
                      C ${controlPointX2} ${endYBot}, ${controlPointX1} ${startYBot}, ${startX} ${startYBot}
                      Z
                  `}
                  fill={item.fill}
                  fillOpacity={0.3}
                  stroke={item.fill}
                  strokeOpacity={0.5}
                  strokeWidth={1}
              />
          );
          currentTotalY += targetHeight;
      }

      currentY += itemHeight + gap;
  }

  // Total Rect (Right Side)
  const totalRect = (
      <g>
          <rect 
              x={width - padding - barWidth} 
              y={padding} 
              width={barWidth} 
              height={availableHeight} 
              fill={totalItem.fill} 
              rx={4}
          />
          <text 
              x={width - padding - barWidth / 2} 
              y={height / 2} 
              transform={`rotate(-90, ${width - padding - barWidth / 2}, ${height / 2})`}
              textAnchor="middle" 
              fill="#fff" 
              fontSize={12} 
              fontWeight="bold"
          >
              {totalItem.name}
          </text>
          <text 
              x={width - padding - barWidth / 2} 
              y={padding + availableHeight + 15} 
              textAnchor="middle"
              fill="#475569" 
              fontSize={11} 
              fontWeight="bold"
          >
              {(totalValue / 1000).toFixed(1)}k
          </text>
      </g>
  );

  return (
    <div className="h-full w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
            {flows}
            {inputRects}
            {totalRect}
        </svg>
    </div>
  );
};
