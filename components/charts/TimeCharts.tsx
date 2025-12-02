
import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, ComposedChart,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine
} from 'recharts';
import { ChartProps, CHART_THEMES, formatDate, getTooltipStyle, useChartConfig } from './chartUtils';
import { ThemeMode } from './chartUtils';

export const ValueCompositionChart: React.FC<ChartProps> = ({ data, showProjection, themeMode = 'light' }) => {
  if (data.length === 0) return null;
  const isPPK = 'employeeContribution' in data[0];
  const t = CHART_THEMES[themeMode || 'light'];
  const config = useChartConfig();

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
        <ComposedChart data={chartData as any[]} margin={config.margin}>
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} strokeWidth={1} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={10}
            tickMargin={config.tickMargin}
            padding={config.xAxisPadding}
          />
          <YAxis 
            tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
            stroke={t.axis} 
            fontSize={10}
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
            contentStyle={getTooltipStyle(themeMode as ThemeMode, config.isMobile)}
          />
          <Legend 
            verticalAlign="top" 
            height={config.legendHeight} 
            iconSize={config.iconSize}
            wrapperStyle={config.legendStyle}
          />
          
          {isPPK ? (
            <>
              <Area type={t.lineType || "monotone"} dataKey="employeeContribution" name="Pracownik" stackId="1" stroke={t.investment} fill={t.investment} fillOpacity={0.9} strokeWidth={t.strokeWidth} style={{ color: t.investment }} />
              <Area type={t.lineType || "monotone"} dataKey="employerContribution" name="Pracodawca" stackId="1" stroke={t.employer} fill={t.employer} fillOpacity={0.9} strokeWidth={t.strokeWidth} style={{ color: t.employer }} />
              <Area type={t.lineType || "monotone"} dataKey="stateContribution" name="Państwo" stackId="1" stroke={t.state} fill={t.state} fillOpacity={0.9} strokeWidth={t.strokeWidth} style={{ color: t.state }} />
              <Area type={t.lineType || "monotone"} dataKey="fundProfit" name="Zysk Funduszu" stackId="1" stroke={t.profit} fill={t.profit} fillOpacity={0.9} strokeWidth={t.strokeWidth} style={{ color: t.profit }} />
              
              <Area 
                type={t.lineType || "monotone"} 
                dataKey="taxSigned" 
                name="Podatek" 
                stroke={t.tax} 
                fill={t.tax} 
                fillOpacity={0.9}
                strokeWidth={t.strokeWidth}
                style={{ color: t.tax }}
              />
              
              {/* Dashed Lines for Net and Exit */}
              <Line 
                type={t.lineType || "monotone"} 
                dataKey="netValue" 
                name="Wartość Netto" 
                stroke={t.net} 
                strokeWidth={t.strokeWidth} 
                strokeDasharray="4 4"
                dot={false} 
              />
              <Line 
                type={t.lineType || "monotone"} 
                dataKey="exitValue" 
                name="Wartość Exit" 
                stroke={t.exit} 
                strokeWidth={t.strokeWidth} 
                strokeDasharray="4 4"
                dot={false} 
              />
              
              {showProjection && (
                <Line 
                  type={t.lineType || "monotone"} 
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
                type={t.lineType || "monotone"} 
                dataKey="totalValue" 
                name="Wartość Całkowita" 
                stroke={t.investment} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={t.strokeWidth}
                style={{ color: t.investment }}
              />
              <Area 
                type={t.lineType || "monotone"} 
                dataKey="investment" 
                name="Wkład Własny" 
                stroke={t.axis} 
                fillOpacity={1} 
                fill="url(#colorInvest)" 
                strokeWidth={t.strokeWidth}
                strokeDasharray="5 5"
                style={{ color: t.axis }}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ROIChart: React.FC<ChartProps> = ({ data, showExitRoi = true, themeMode = 'light' }) => {
  const hasExitRoi = showExitRoi && data.length > 0 && 'exitRoi' in data[0];
  const t = CHART_THEMES[themeMode || 'light'];
  const config = useChartConfig();

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data as any[]} margin={config.margin}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} strokeWidth={1} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={10}
            tickMargin={config.tickMargin}
            minTickGap={15}
            padding={config.xAxisPadding}
          />
          <YAxis 
            stroke={t.axis} 
            fontSize={10} 
            unit="%" 
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)}%`, 
              name === 'exitRoi' ? 'Exit ROI' : 'ROI'
            ]}
            labelFormatter={formatDate}
            contentStyle={getTooltipStyle(themeMode as ThemeMode, config.isMobile)}
          />
          <Legend 
            verticalAlign="top" 
            height={config.legendHeight} 
            iconSize={config.iconSize}
            wrapperStyle={config.legendStyle}
          />
          <ReferenceLine y={0} stroke={t.tax} strokeDasharray="3 3" strokeWidth={1} />
          <Line 
            type={t.lineType || "monotone"} 
            dataKey="roi" 
            name="ROI"
            stroke={t.profit} 
            strokeWidth={t.strokeWidth} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
          {hasExitRoi && (
            <Line 
              type={t.lineType || "monotone"} 
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

export const CryptoValueChart: React.FC<ChartProps> = ({ data, showTaxComparison, themeMode = 'light' }) => {
  const hasTaxedValue = useMemo(() => {
     return data.length > 0 && data.some(d => (d as any).taxedTotalValue !== undefined);
  }, [data]);

  const t = CHART_THEMES[themeMode || 'light'];
  const config = useChartConfig();

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data as any[]} margin={config.margin}>
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} strokeWidth={1} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={10}
            tickMargin={config.tickMargin}
            minTickGap={15}
            padding={config.xAxisPadding}
          />
          <YAxis 
            tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
            stroke={t.axis} 
            fontSize={10}
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
            contentStyle={getTooltipStyle(themeMode as ThemeMode, config.isMobile)}
          />
          <Legend 
            verticalAlign="top" 
            height={config.legendHeight} 
            iconSize={config.iconSize}
            wrapperStyle={config.legendStyle}
          />
          
          <Area 
            type={t.lineType || "monotone"} 
            dataKey="totalValue" 
            name="Wycena Portfela" 
            stroke={t.employer} 
            fillOpacity={1} 
            fill="url(#colorTotal)" 
            strokeWidth={t.strokeWidth}
            style={{ color: t.employer }}
          />
          <Area 
            type={t.lineType || "monotone"} 
            dataKey="investment" 
            name="Zainwestowany Kapitał" 
            stroke={t.axis} 
            fillOpacity={1} 
            fill="url(#colorInvest2)" 
            strokeWidth={t.strokeWidth}
            strokeDasharray="5 5"
            style={{ color: t.axis }}
          />

          {hasTaxedValue && showTaxComparison && (
            <Line
              type={t.lineType || "monotone"}
              dataKey="taxedTotalValue"
              name="Konto Opodatkowane"
              stroke={t.taxedAccount} 
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

export const GlobalSummaryChart: React.FC<ChartProps> = ({ data, showProjection, showCPI, themeMode = 'light' }) => {
  const t = CHART_THEMES[themeMode || 'light'];
  const config = useChartConfig();

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data as any[]} margin={config.margin}>
          <defs>
            <linearGradient id="colorTotalGlobal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={t.profit} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={t.profit} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInvestGlobal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={t.axis} stopOpacity={0.5}/>
              <stop offset="95%" stopColor={t.axis} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} strokeWidth={1} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={10}
            tickMargin={config.tickMargin}
            padding={config.xAxisPadding}
          />
          <YAxis 
            tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
            stroke={t.axis} 
            fontSize={10}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                    totalValue: 'Wycena Portfela',
                    investment: 'Zainwestowany Kapitał',
                    projectedValue: 'Prognoza (Droga do Miliona)',
                    realTotalValue: 'Wartość Realna (CPI)'
                };
                return [`${value.toLocaleString('pl-PL')} zł`, labels[name] || name];
            }}
            labelFormatter={formatDate}
            contentStyle={getTooltipStyle(themeMode as ThemeMode, config.isMobile)}
          />
          <Legend 
            verticalAlign="top" 
            height={config.legendHeight} 
            iconSize={config.iconSize}
            wrapperStyle={config.legendStyle}
          />
          
          {/* Total Value - Background Area (Green) */}
          <Area 
            type={t.lineType || "monotone"} 
            dataKey="totalValue" 
            name="Wycena Portfela" 
            stroke={t.profit} 
            fillOpacity={1}
            fill="url(#colorTotalGlobal)" 
            strokeWidth={t.strokeWidth}
            style={{ color: t.profit }}
          />

          {/* Investment - Overlay Area (Matches Crypto Chart Style) */}
          <Area 
            type={t.lineType || "monotone"} 
            dataKey="investment" 
            name="Zainwestowany Kapitał" 
            stroke={t.axis} 
            fillOpacity={1}
            fill="url(#colorInvestGlobal)" 
            strokeWidth={t.strokeWidth}
            strokeDasharray="5 5"
            style={{ color: t.axis }}
          />

          {showCPI && (
            <Line 
              type={t.lineType || "monotone"} 
              dataKey="realTotalValue" 
              name="Wartość Realna (CPI)" 
              stroke={t.tax} 
              strokeWidth={t.strokeWidth} 
              strokeDasharray="3 3"
              dot={false} 
            />
          )}

          {showProjection && (
            <Line 
              type={t.lineType || "monotone"} 
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

export const GlobalPerformanceChart: React.FC<ChartProps> = ({ data, themeMode = 'light' }) => {
  const [showSP500, setShowSP500] = useState(false);
  const [showWIG20, setShowWIG20] = useState(false);
  const t = CHART_THEMES[themeMode || 'light'];
  const config = useChartConfig();

  const chartData = data.filter((d, i) => i >= 0);

  return (
    <div className="w-full">
      <div className="flex justify-end space-x-2 md:space-x-3 mb-2 px-1 md:px-2">
        <button
          onClick={() => setShowSP500(!showSP500)}
          className={`px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-medium rounded-full transition-all ${
            showSP500 
              ? 'bg-slate-700 text-white ring-2 ring-slate-700 ring-offset-1' 
              : `border border-slate-300 ${themeMode === 'neon' ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-600'} hover:opacity-80`
          }`}
        >
          S&P 500
        </button>
        <button
          onClick={() => setShowWIG20(!showWIG20)}
          className={`px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-medium rounded-full transition-all ${
            showWIG20 
              ? 'bg-purple-800 text-white ring-2 ring-purple-800 ring-offset-1' 
              : `border border-slate-300 ${themeMode === 'neon' ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-600'} hover:opacity-80`
          }`}
        >
          WIG20
        </button>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData as any[]} margin={config.margin}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} strokeWidth={1} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              stroke={t.axis} 
              fontSize={10}
              tickMargin={config.tickMargin}
              padding={config.xAxisPadding}
            />
            <YAxis 
              stroke={t.axis} 
              fontSize={10} 
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
              contentStyle={getTooltipStyle(themeMode as ThemeMode, config.isMobile)}
            />
            <Legend 
              verticalAlign="top" 
              height={config.legendHeight} 
              iconSize={config.iconSize}
              wrapperStyle={config.legendStyle}
            />
            <ReferenceLine y={0} stroke={t.axis} strokeDasharray="3 3" strokeWidth={1} />
            
            <Line 
              type={t.lineType || "monotone"} 
              dataKey="roi" 
              name="ROI" 
              stroke={t.profit} 
              strokeWidth={t.strokeWidth} 
              dot={false} 
            />
            
            <Line 
              type={t.lineType || "monotone"} 
              dataKey="cumulativeTwr" 
              name="TWR" 
              stroke={t.projection} 
              strokeWidth={t.strokeWidth} 
              strokeDasharray="5 5"
              dot={false} 
            />

            {showSP500 && (
              <Line 
                type={t.lineType || "monotone"} 
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
                type={t.lineType || "monotone"} 
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

export const PortfolioAllocationHistoryChart: React.FC<ChartProps> = ({ data, themeMode = 'light' }) => {
  const t = CHART_THEMES[themeMode || 'light'];
  const config = useChartConfig();

  const chartData = data.map(row => {
    const r = row as any;
    // Handle specific artifact where 0 value in stacked area can sometimes show stroke
    const ikeVal = (r.ikeShare || 0) * 100;
    
    return {
      date: r.date,
      ppk: (r.ppkShare || 0) * 100,
      crypto: (r.cryptoShare || 0) * 100,
      // FIX: Use undefined to prevent visible stroke line when value is 0.
      ike: ikeVal > 0 ? ikeVal : undefined,
    };
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} stackOffset="expand" margin={config.margin}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} strokeWidth={1} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke={t.axis} 
            fontSize={10}
            tickMargin={config.tickMargin}
            padding={config.xAxisPadding}
          />
          <YAxis 
            stroke={t.axis} 
            fontSize={10} 
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(2)}%`]} 
            labelFormatter={formatDate}
            contentStyle={getTooltipStyle(themeMode as ThemeMode, config.isMobile)}
          />
          <Legend 
            verticalAlign="top" 
            height={config.legendHeight} 
            iconSize={config.iconSize}
            wrapperStyle={config.legendStyle}
          />
          <Area type={t.lineType || "monotone"} dataKey="ppk" name="PPK" stackId="1" stroke={t.investment} fill={t.investment} fillOpacity={0.8} strokeWidth={t.strokeWidth} style={{ color: t.investment }} />
          <Area type={t.lineType || "monotone"} dataKey="crypto" name="Krypto" stackId="1" stroke={t.employer} fill={t.employer} fillOpacity={0.8} strokeWidth={t.strokeWidth} style={{ color: t.employer }} />
          <Area type={t.lineType || "monotone"} dataKey="ike" name="IKE" stackId="1" stroke={t.state} fill={t.state} fillOpacity={0.8} strokeWidth={t.strokeWidth} style={{ color: t.state }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
