
import React, { useMemo } from 'react';
import {
  Cell, ResponsiveContainer, Tooltip, Treemap,
  ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, ReferenceLine, Scatter, LabelList
} from 'recharts';
import { OMFDataRow } from '../../types';
import { ThemeMode, CHART_THEMES, getTooltipStyle, formatCurrency, AssetLogo, useChartConfig } from './chartUtils';

// --- OMF Specific Charts ---

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

  // IMPORTANT: Do not render content for Group nodes (which have children).
  if (dataItem.children) return null;

  const name = nameProp || dataItem.name || '';
  const roi = props.roi !== undefined ? props.roi : (dataItem.roi !== undefined ? dataItem.roi : 0);

  const fontSizeName = Math.max(9, Math.min(width / 7, 12));
  const fontSizeRoi = Math.max(9, fontSizeName * 0.8);

  const color = getHeatmapColor(roi);

  const showText = width > 40 && height > 30;
  const padding = 5;

  const strokeColor = themeMode === 'neon' ? '#000' : '#fff';
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
          style={{ 
            textShadow: '0 2px 4px rgba(0,0,0,0.9)', 
            pointerEvents: 'none',
          }}
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
          style={{ 
            textShadow: '0 2px 4px rgba(0,0,0,0.9)', 
            pointerEvents: 'none', 
            opacity: 0.95,
          }}
        >
          {roi > 0 ? '+' : ''}{Number(roi).toFixed(1)}%
        </text>
      )}
    </g>
  );
};

interface OMFTreemapChartProps {
  data: any[]; // Expects nested structure
  themeMode?: ThemeMode;
}

export const OMFTreemapChart: React.FC<OMFTreemapChartProps> = ({ data, themeMode = 'light' }) => {
  const config = useChartConfig();
  
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          aspectRatio={4 / 3}
          stroke={themeMode === 'neon' ? '#000' : "#fff"}
          fill="#8884d8"
          content={(props) => <TreemapContent {...props} themeMode={themeMode as ThemeMode} />}
        >
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const style = getTooltipStyle(themeMode as ThemeMode, config.isMobile);
                return (
                  <div className={config.isMobile ? "p-2 shadow-lg text-[10px]" : "p-3 shadow-lg"} style={style}>
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

// --- BUBBLE RISK CHART ---

interface BubbleRiskChartProps {
  data: OMFDataRow[];
  themeMode?: ThemeMode;
}

export const BubbleRiskChart: React.FC<BubbleRiskChartProps> = ({ data, themeMode = 'light' }) => {
  const t = CHART_THEMES[themeMode || 'light'];
  const config = useChartConfig();
  
  // Transform data for ScatterChart
  const chartData = useMemo(() => {
    return data
      .filter(d => d.symbol !== 'PLN' && d.symbol !== 'PLN-IKE')
      .map(d => ({
        name: d.symbol,
        x: d.change24h || 0,
        y: d.roi || 0,
        z: d.currentValue,
        portfolio: d.portfolio,
        isLive: d.isLivePrice ?? false
      }));
  }, [data]);

  if (chartData.length === 0) return <div className="flex items-center justify-center h-full text-slate-400 text-sm">Brak danych</div>;

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 40, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.grid} strokeWidth={1} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Intraday" 
            unit="%" 
            stroke={t.axis} 
            fontSize={12}
            label={{ value: 'Intraday (%)', position: 'insideBottom', offset: -10, fill: t.axis, fontSize: 10 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="ROI" 
            unit="%" 
            stroke={t.axis} 
            fontSize={12}
            label={{ value: 'Całkowite ROI (%)', angle: -90, position: 'insideLeft', fill: t.axis, fontSize: 10, style: { textAnchor: 'middle' } }}
          />
          <ZAxis type="number" dataKey="z" range={[60, 600]} name="Wartość" unit=" zł" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div style={getTooltipStyle(themeMode as ThemeMode, config.isMobile)} className={config.isMobile ? "p-1.5 shadow-md text-xs" : "p-2 shadow-md text-xs"}>
                    <p className="font-bold mb-1 text-sm">{d.name}</p>
                    <p>Wartość: {formatCurrency(d.z)}</p>
                    {d.isLive ? (
                        <p className={d.x >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                          Intraday: {d.x > 0 ? '+' : ''}{d.x.toFixed(2)}%
                        </p>
                    ) : (
                        <p className='text-amber-500 font-bold'>Cena Offline / Brak danych</p>
                    )}
                    <p className={d.y >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                      ROI: {d.y > 0 ? '+' : ''}{d.y.toFixed(2)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine x={0} stroke={t.axis} strokeOpacity={0.5} />
          <ReferenceLine y={0} stroke={t.axis} strokeOpacity={0.5} />
          
          <Scatter name="Aktywa" data={chartData} fill="#8884d8">
            {chartData.map((entry, index) => {
              let fill = t.dailyNeu;
              if (!entry.isLive) {
                  fill = t.dailyWarning;
              } else {
                  fill = entry.x >= 0 ? t.dailyPos : t.dailyNeg;
              }

              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={fill} 
                  fillOpacity={0.7}
                  stroke={themeMode === 'neon' ? '#fff' : '#fff'}
                  strokeWidth={1}
                />
              );
            })}
            <LabelList 
                dataKey="name" 
                position="top" 
                offset={5}
                style={{ 
                    fontSize: '10px', 
                    fill: themeMode === 'neon' ? '#a5f3fc' : '#1e293b',
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                }} 
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
