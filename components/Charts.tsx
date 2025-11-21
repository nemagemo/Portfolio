
import React from 'react';
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
import { PPKDataRow, CryptoDataRow, AnyDataRow } from '../types';

interface ChartProps {
  data: AnyDataRow[];
  className?: string; // Added className prop for flexibility
}

const formatCurrency = (value: number | undefined) => `${(value || 0).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł`;
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
};

// --- OMF Specific Charts ---

interface OMFAllocationProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#64748b'];
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

// Helper to determine color based on ROI
const getRoiColor = (roi: number) => {
  if (roi === undefined || roi === null || isNaN(roi)) return '#64748b'; // Slate 500 (Neutral)

  if (roi > 0) {
    if (roi >= 50) return '#047857'; // Emerald 700
    if (roi >= 20) return '#059669'; // Emerald 600
    if (roi >= 10) return '#10b981'; // Emerald 500
    return '#34d399'; // Emerald 400
  } else if (roi < 0) {
    if (roi <= -50) return '#b91c1c'; // Red 700
    if (roi <= -20) return '#dc2626'; // Red 600
    if (roi <= -10) return '#ef4444'; // Red 500
    return '#f87171'; // Red 400
  }
  
  return '#64748b'; // Zero ROI
};

// Custom Content for Treemap
const TreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name } = props;
  
  // Access ROI from data via root.children if available
  const itemData = root.children && root.children[index];
  const roi = itemData ? itemData.roi : 0;

  // Calculate Color based on ROI
  const fillColor = getRoiColor(roi);
  
  return (
    <g>
      {/* Background Rectangle */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fillColor,
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />

      {/* Asset Symbol */}
      {width > 40 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2 - 8}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(14, width / 5)}
          fontWeight="bold"
          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
        >
          {name}
        </text>
      )}
      
      {/* ROI Percentage */}
      {width > 40 && height > 50 && roi !== undefined && (
         <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize={11}
          fontWeight="medium"
        >
          {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
        </text>
      )}
    </g>
  );
};

export const OMFTreemapChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          aspectRatio={4 / 3}
          stroke="#fff"
          content={<TreemapContent />}
        >
          <Tooltip 
             formatter={(value: number, name: string, props: any) => {
                const roi = props.payload.roi;
                const roiText = roi !== undefined ? ` (ROI: ${roi > 0 ? '+' : ''}${roi.toFixed(2)}%)` : '';
                return [`${(value || 0).toLocaleString('pl-PL')} zł${roiText}`, 'Wartość'];
             }}
             contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export const OMFPerformanceBarChart: React.FC<{ data: any[] }> = ({ data }) => {
  // Filter and Sort: Only Top 3 Gainers
  const sorted = [...data]
    .sort((a, b) => (b.profit || 0) - (a.profit || 0))
    .slice(0, 3); 
  
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sorted}
          margin={{ top: 5, right: 50, left: 40, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 12, fontWeight: 600}} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            formatter={(value: number) => [`${(value || 0).toLocaleString('pl-PL')} zł`, 'Zysk']}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="profit" radius={[0, 6, 6, 0]}>
            {sorted.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#34d399' : '#6ee7b7'} />
            ))}
            <LabelList 
              dataKey="profit" 
              position="right" 
              formatter={(val: number) => `+${(val || 0).toLocaleString('pl-PL')} zł`}
              style={{ fontSize: '12px', fontWeight: 'bold', fill: '#059669' }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Global Aggregated Charts ---

// 1. Value & Profit Chart (Area)
export const GlobalSummaryChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#64748b" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorProfitGlobal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            tick={{fontSize: 12, fontWeight: 500, fill: '#64748b'}} 
            axisLine={false} 
            tickLine={false} 
            minTickGap={40}
          />
          <YAxis 
            tickFormatter={(val) => `${((val || 0) / 1000).toFixed(0)}k`} 
            axisLine={false} 
            tickLine={false}
            label={{ value: 'PLN', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
          />
          
          <Tooltip 
            labelFormatter={formatDate}
            formatter={(value: number, name: string) => [`${value.toLocaleString('pl-PL')} zł`, name]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="top" height={36}/>
          
          <Area 
            type="monotone" 
            dataKey="investment" 
            name="Łączny Wkład" 
            stackId="1"
            fill="url(#colorInv)" 
            stroke="#64748b" 
            strokeWidth={2}
          />
          <Area
            type="monotone" 
            dataKey="profit" 
            name="Łączny Zysk" 
            stackId="1"
            fill="url(#colorProfitGlobal)"
            stroke="#10b981" 
            strokeWidth={2} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Performance Chart (Lines: ROI & TWR)
export const GlobalPerformanceChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            tick={{fontSize: 12, fontWeight: 500, fill: '#64748b'}} 
            axisLine={false} 
            tickLine={false} 
            minTickGap={40}
          />
          <YAxis 
            unit="%"
            axisLine={false} 
            tickLine={false}
            tick={{fill: '#64748b', fontSize: 12}}
          />
          
          <Tooltip 
            labelFormatter={formatDate}
            formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="top" height={36}/>
          <ReferenceLine y={0} stroke="#cbd5e1" />
          
          <Line 
            type="monotone" 
            dataKey="roi" 
            name="Globalne ROI" 
            stroke="#f59e0b" 
            strokeWidth={2} 
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="cumulativeTwr" 
            name="TWR (bez PPK)" 
            stroke="#8b5cf6" 
            strokeWidth={2} 
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Portfolio Allocation History Chart (Stacked Area)
export const PortfolioAllocationHistoryChart: React.FC<{ data: any[] }> = ({ data }) => {
  // Filter data to start from the first point where there is actual value
  // This prevents the chart from showing empty space on the left if the dates started before investment.
  const startIndex = data.findIndex(item => (item.totalValue || 0) > 0);
  const activeData = startIndex !== -1 ? data.slice(startIndex) : [];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={activeData}
          stackOffset="expand"
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            tick={{fontSize: 12, fontWeight: 500, fill: '#64748b'}} 
            axisLine={false} 
            tickLine={false} 
            minTickGap={40}
          />
          <YAxis 
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} 
            axisLine={false} 
            tickLine={false}
            tick={{fill: '#64748b', fontSize: 12}}
          />
          
          <Tooltip 
            labelFormatter={formatDate}
            formatter={(value: number, name: string) => [`${(value * 100).toFixed(2)}%`, name]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="top" height={36}/>
          
          <Area 
            type="monotone" 
            dataKey="ppkShare" 
            name="PPK" 
            stackId="1"
            stroke="#6366f1" // Indigo
            fill="#6366f1"
            fillOpacity={0.8}
          />
          <Area
            type="monotone" 
            dataKey="cryptoShare" 
            name="Krypto" 
            stackId="1"
            stroke="#8b5cf6" // Violet
            fill="#8b5cf6"
            fillOpacity={0.8}
          />
          <Area
            type="monotone" 
            dataKey="ikeShare" 
            name="IKE" 
            stackId="1"
            stroke="#06b6d4" // Cyan
            fill="#06b6d4"
            fillOpacity={0.8}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


// --- PPK Charts ---

export const ValueCompositionChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {/* Changed to ComposedChart to allow mixing Areas and Lines */}
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFundProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorState" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEmployer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEmployee" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            {/* NEW TAX DEF for area fill */}
            <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} minTickGap={30} />
          <YAxis tickFormatter={(val) => `${(val || 0) / 1000}k`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value: number) => [`${(value || 0).toLocaleString('pl-PL')} zł`, '']} labelFormatter={formatDate} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          
          <Area type="monotone" dataKey="employeeContribution" name="Wkład własny" stackId="1" stroke="#3b82f6" fill="url(#colorEmployee)" />
          <Area type="monotone" dataKey="employerContribution" name="Pracodawca" stackId="1" stroke="#6366f1" fill="url(#colorEmployer)" />
          <Area type="monotone" dataKey="stateContribution" name="Dopłaty Państwa" stackId="1" stroke="#f59e0b" fill="url(#colorState)" />
          {/* Use fundProfit for correct stacking summation */}
          <Area type="monotone" dataKey="fundProfit" name="Zysk Funduszu" stackId="1" stroke="#10b981" fill="url(#colorFundProfit)" />
          
          {/* REPLACED Line WITH Area for Tax to create "poświata" (fill) effect towards zero */}
          <Area
            type="monotone"
            dataKey="tax"
            name="Podatek"
            stroke="#ef4444"
            fill="url(#colorTax)"
            strokeWidth={2}
            // No stackId, so it renders independently below the axis (negative values)
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CapitalStructureHistoryChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          stackOffset="expand"
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
             dataKey="date" 
             tickFormatter={formatDate} 
             tick={{fontSize: 12, fill: '#64748b'}} 
             axisLine={false} 
             tickLine={false} 
             minTickGap={30} 
          />
          <YAxis 
             tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} 
             tick={{fontSize: 12, fill: '#64748b'}} 
             axisLine={false} 
             tickLine={false} 
          />
          <Tooltip 
             formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, '']} 
             labelFormatter={formatDate} 
             contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
          />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          
          <Area type="monotone" dataKey="employeeContribution" name="Wkład własny" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} />
          <Area type="monotone" dataKey="employerContribution" name="Pracodawca" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.8} />
          <Area type="monotone" dataKey="stateContribution" name="Dopłaty Państwa" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} />
          <Area type="monotone" dataKey="fundProfit" name="Zysk Funduszu" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ContributionComparisonChart: React.FC<ChartProps> = ({ data, className }) => {
  const latest = data[data.length - 1] as PPKDataRow;
  if (!latest) return null;

  const compData = [
    { name: 'Ja', value: latest.employeeContribution, fill: '#3b82f6' },
    { name: 'Pracodawca', value: latest.employerContribution, fill: '#6366f1' },
    { name: 'Państwo', value: latest.stateContribution, fill: '#f59e0b' },
    { name: 'Wynik Funduszu', value: latest.fundProfit, fill: '#10b981' },
  ];

  return (
    <div className={className || "h-80 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={compData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" tick={{fontSize: 11, fill: '#1e293b', fontWeight: 500}} width={90} axisLine={false} tickLine={false} />
          <Tooltip cursor={{fill: 'transparent'}} formatter={(value: number) => [`${(value || 0).toLocaleString('pl-PL')} zł`, 'Wartość']} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Crypto Charts ---

export const CryptoValueChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} minTickGap={30} />
          <YAxis tickFormatter={(val) => `${(val || 0) / 1000}k`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value: number) => [`${(value || 0).toLocaleString('pl-PL')} zł`, '']} labelFormatter={formatDate} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
          <Legend verticalAlign="top" height={36} />
          <Area type="monotone" dataKey="totalValue" name="Wartość Całkowita" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorTotal)" />
          <Area type="monotone" dataKey="investment" name="Wkład Własny" stroke="#64748b" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CryptoProfitChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} minTickGap={30} />
          <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value: number) => [`${(value || 0).toLocaleString('pl-PL')} zł`, '']} labelFormatter={formatDate} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
          <Legend verticalAlign="top" height={36} />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Bar dataKey="profit" name="Zysk/Strata" fill="#10b981">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={((entry as CryptoDataRow).profit || 0) >= 0 ? '#10b981' : '#f43f5e'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ROIChart: React.FC<ChartProps> = ({ data }) => {
  // Safely check if data exists and has exitRoi property
  const hasExitRoi = data && data.length > 0 && 'exitRoi' in data[0];

  if (!data || data.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
        Brak danych do wyświetlenia wykresu ROI
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} minTickGap={30} />
          <YAxis unit="%" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value: number) => [`${(value || 0)}%`, '']} labelFormatter={formatDate} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="roi" name="ROI" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          {hasExitRoi && (
            <Line type="monotone" dataKey="exitRoi" name="Exit ROI" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
