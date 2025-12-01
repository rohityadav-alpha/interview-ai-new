'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';

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
      <div className="w-full h-48 sm:h-56 lg:h-64 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800 shadow-xl flex items-center justify-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Complete more interviews to see your performance trends!
      </div>
    );
  }

  const colors = {
    background: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
    bar: '#ec4899',
  };

  return (
    <div className="w-full h-64 sm:h-72 lg:h-80 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800 shadow-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-900 dark:text-white">
        Your Performance Over Time
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: colors.text }}
            tickMargin={10}
            axisLine={{ stroke: colors.grid }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: colors.text }}
            axisLine={{ stroke: colors.grid }}
            label={{
              value: 'Average Score',
              angle: -90,
              position: 'insideLeft',
              style: { fill: colors.text, fontSize: 12 },
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
          <Legend
            wrapperStyle={{ fontSize: 12, color: colors.text }}
          />
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
      </ResponsiveContainer>
    </div>
  );
}
