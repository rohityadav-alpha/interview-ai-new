'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  date: string;
  score: number;
  skill: string;
}

interface PerformanceChartProps {
  data: ChartData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No interview history yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis 
          domain={[0, 10]}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                  <p className="font-semibold">{payload[0].payload.skill}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(payload[0].payload.date).toLocaleDateString()}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    Score: {payload[0].value}/10
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#2563eb" 
          strokeWidth={2}
          dot={{ fill: '#2563eb', r: 4 }}
          activeDot={{ r: 6 }}
          name="Average Score"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
