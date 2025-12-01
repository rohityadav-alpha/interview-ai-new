// src/components/PerformanceChart.tsx
'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PerformanceData {
  date: string;
  score: number;
  interviews: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [isDark, setIsDark] = useState(false);

  const [chartType, setChartType] = useState<'line' | 'bar'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('chartType') as 'line' | 'bar') || 'line';
    }
    return 'line';
  });

  const handleToggle = (type: 'line' | 'bar') => {
    setChartType(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chartType', type);
    }
  };

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800 shadow-xl flex items-center justify-center px-3 py-6 sm:p-6 text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Complete more interviews to see your performance trends!
      </div>
    );
  }

  const colors = {
    background: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
    line: '#3b82f6',
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800 shadow-xl px-3 py-3 sm:p-6 flex flex-col gap-3">
      {/* Header + Toggle */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          Your Performance Over Time
        </h3>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          <Button
            size="sm"
            variant={chartType === 'line' ? 'default' : 'ghost'}
            onClick={() => handleToggle('line')}
            className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1"
          >
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Line</span>
          </Button>
          <Button
            size="sm"
            variant={chartType === 'bar' ? 'default' : 'ghost'}
            onClick={() => handleToggle('bar')}
            className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1"
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Bar</span>
          </Button>
        </div>
      </div>

      {/* Chart area */}
      <div className="mt-1 h-52 sm:h-64 lg:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: colors.text }}
                tickMargin={8}
                axisLine={{ stroke: colors.grid }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: colors.text }}
                axisLine={{ stroke: colors.grid }}
                label={{
                  value: 'Average Score',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: colors.text, fontSize: 10 },
                }}
                domain={[0, 10]}
              />
              <Tooltip
                contentStyle={{
                  background: colors.background,
                  borderRadius: 8,
                  borderColor: colors.grid,
                  fontSize: 12,
                  color: colors.text,
                }}
                labelStyle={{ color: colors.text }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: colors.text }} />
              <Line
                type="monotone"
                dataKey="score"
                name="Average Score"
                stroke={colors.line}
                strokeWidth={2}
                dot={{ r: 4, fill: colors.line }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: colors.text }}
                tickMargin={8}
                axisLine={{ stroke: colors.grid }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: colors.text }}
                axisLine={{ stroke: colors.grid }}
                label={{
                  value: 'Average Score',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: colors.text, fontSize: 10 },
                }}
                domain={[0, 10]}
              />
              <Tooltip
                contentStyle={{
                  background: colors.background,
                  borderRadius: 8,
                  borderColor: colors.grid,
                  fontSize: 12,
                  color: colors.text,
                }}
                labelStyle={{ color: colors.text }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: colors.text }} />
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <Bar
                dataKey="score"
                name="Average Score"
                fill="url(#scoreGradient)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
