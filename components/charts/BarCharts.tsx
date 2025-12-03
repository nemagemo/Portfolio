
import React, { useMemo } from 'react';
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, LabelList, Cell
} from 'recharts';
import { ChartProps, CHART_THEMES, formatDate, getTooltipStyle, ThemeMode, useChartConfig } from './chartUtils';
import { PPKDataRow } from '../../types';

export const PPKLeverageChart: React.FC<ChartProps> = ({ data, themeMode = 'light' }) => {
  if (data.length === 0 || !('employeeContribution' in data[0])) return null;
  const t = CHART_THEMES[themeMode || 'light'];
  const config = useChartConfig();

  const chartData = data.map(row => {
    const r = row as PPKDataRow;
    const own = r.employeeContribution;
    const free = r.totalValue - r.employeeContribution; // Employer + State + Profit
    return {
      date: r.date,
      own,
      free,
      total: r.totalValue
    };
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={config.margin}>
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
               const percent = payload.total > 0 ? (value / payload.total) * 100 : 0;
               const labels: Record<string, string> = {
                 own: 'Mój Wkład',
                 free: 'Darmowe Środki (Pracodawca+Państwo+Zysk)'
               };
               return [`${value.toLocaleString('pl-PL')} zł (${percent.toFixed(1)}%)`, labels[name] || name];
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
          <Bar dataKey="own" name="Mój Wkład" stackId="a" fill={t.investment} radius={[0, 0, 4, 4]} />
          <Bar dataKey="free" name="Darmowe Środki" stackId="a" fill={t.profit} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SeasonalityChart: React.FC<{ data: any[], themeMode?: ThemeMode }> = ({ data, themeMode = 'light' }) => {
  if (data.length < 2) return null;
  const t = CHART_THEMES[themeMode || 'light'];
  const config = useChartConfig();

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
            <BarChart data={chartData} margin={config.margin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} strokeWidth={1} />
                <XAxis dataKey="name" stroke={t.axis} fontSize={10} tickMargin={5} />
                <YAxis stroke={t.axis} fontSize={10} unit="%" />
                <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Średnia stopa zwrotu']}
                    contentStyle={getTooltipStyle(themeMode as ThemeMode, config.isMobile)}
                />
                <ReferenceLine y={0} stroke={t.axis} strokeWidth={2} />
                <Bar dataKey="value" name="Średnia Stopa Zwrotu" strokeWidth={0}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? t.barProfitPos : t.barProfitNeg} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

interface DividendChartProps {
  data: { label: string; value: number }[];
  themeMode?: ThemeMode;
}

export const DividendChart: React.FC<DividendChartProps> = ({ data, themeMode = 'light' }) => {
  const t = CHART_THEMES[themeMode || 'light'];
  const config = useChartConfig();

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} strokeWidth={1} />
          <XAxis 
            dataKey="label" 
            stroke={t.axis} 
            fontSize={10} 
            tickMargin={config.tickMargin}
          />
          <YAxis 
            stroke={t.axis} 
            fontSize={10} 
            tickFormatter={(val) => `${val} zł`}
          />
          <Bar 
            dataKey="value" 
            name="Dywidendy" 
            fill={t.barProfitPos} 
            stroke={(themeMode as string) === 'comic' ? '#000' : undefined} 
            strokeWidth={(themeMode as string) === 'comic' ? 2 : 0}
            radius={[4, 4, 0, 0]}
          >
            <LabelList 
                dataKey="value" 
                position="top" 
                formatter={(val: number) => `${val.toLocaleString('pl-PL')} zł`}
                style={{ fill: t.axis, fontSize: '10px', fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
