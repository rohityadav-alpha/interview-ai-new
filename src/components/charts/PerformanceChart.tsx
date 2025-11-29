'use client';
import { useTheme } from 'next-themes';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerformanceData {
  date: string;
  score: number;
  interviews: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#1f2937' : '#ffffff',
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
    line1: '#3b82f6',
    line2: '#10b981',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 border-blue-200 dark:border-blue-800 p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Performance Overview
      </h2>
      
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <p>Complete more interviews to see your performance trends!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              dataKey="date" 
              stroke={colors.text}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke={colors.text}
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.grid}`,
                borderRadius: '8px',
                color: colors.text,
              }}
              labelStyle={{ color: colors.text }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke={colors.line1} 
              strokeWidth={2}
              name="Avg Score"
              dot={{ fill: colors.line1, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="interviews" 
              stroke={colors.line2} 
              strokeWidth={2}
              name="Interviews"
              dot={{ fill: colors.line2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
