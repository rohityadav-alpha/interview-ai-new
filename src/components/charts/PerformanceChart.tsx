// src/components/charts/PerformanceChart.tsx
// Skeuomorphic Performance Chart — LCD oscilloscope / VU-analyzer panel.

'use client';

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export interface PerformanceData {
  date: string;
  score: number;
  interviews: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

// Custom dark tooltip
function SkuTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#0a150a',
        border: '2px solid #000',
        borderRadius: 4,
        padding: '0.6rem 0.85rem',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.8)',
      }}
    >
      <p
        style={{
          fontFamily: 'Oswald, sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#558855',
          marginBottom: 4,
          textShadow: '0 0 6px rgba(0,255,65,0.6)',
        }}
      >
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <p
          key={i}
          style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.85rem',
            color: '#00ff41',
            textShadow: '0 0 8px rgba(0,255,65,0.8)',
          }}
        >
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('chartType') as 'line' | 'bar') || 'line';
    }
    return 'line';
  });

  const handleToggle = (type: 'line' | 'bar') => {
    setChartType(type);
    if (typeof window !== 'undefined') localStorage.setItem('chartType', type);
  };

  // Colors for dark oscilloscope theme
  const colors = {
    grid:   'rgba(0,255,65,0.06)',
    axis:   '#336633',
    line:   '#00ff41',
    bar:    '#d4820a',
    barHi:  '#f0a830',
  };

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          borderRadius: 6,
          border: '1px solid #1e1e1e',
          borderTop: '1px solid #484848',
          background: 'repeating-linear-gradient(93deg,rgba(255,255,255,0.014) 0px,rgba(255,255,255,0.014) 1px,transparent 1px,transparent 4px),linear-gradient(170deg,#363636 0%,#2c2c2c 60%,#252525 100%)',
          boxShadow: '6px 6px 20px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'linear-gradient(180deg, #3e3e3e, #303030)',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #444, #222)',
              border: '1px solid rgba(0,0,0,0.5)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#888',
              textShadow: '0 1px 0 rgba(0,0,0,0.8)',
            }}
          >
            Performance Analyzer
          </span>
        </div>
        {/* LCD empty state */}
        <div
          style={{
            margin: '1rem',
            padding: '2rem 1rem',
            background: '#0a150a',
            border: '2px solid #000',
            borderRadius: 4,
            textAlign: 'center',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9)',
          }}
        >
          <p
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.75rem',
              color: '#00cc33',
              textShadow: '0 0 8px rgba(0,255,65,0.8)',
              letterSpacing: '0.05em',
            }}
          >
            &gt; Complete more interviews to unlock trend data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 6,
        border: '1px solid #1e1e1e',
        borderTop: '1px solid #484848',
        borderLeft: '1px solid #404040',
        background: 'repeating-linear-gradient(93deg,rgba(255,255,255,0.014) 0px,rgba(255,255,255,0.014) 1px,transparent 1px,transparent 4px),linear-gradient(170deg,#363636 0%,#2c2c2c 60%,#252525 100%)',
        boxShadow: '6px 6px 20px rgba(0,0,0,0.8),-2px -2px 8px rgba(255,255,255,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* ─── Panel header ─── */}
      <div
        style={{
          background: 'linear-gradient(180deg, #3e3e3e, #303030)',
          borderBottom: '1px solid #1a1a1a',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Screw */}
          <span
            style={{
              width: 14, height: 14, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #c0c0c0, #666)',
              boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.2), inset -1px -1px 3px rgba(0,0,0,0.8)',
              flexShrink: 0,
            }}
          />
          {/* LED */}
          <span
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #80ff90, #00cc33)',
              boxShadow: '0 0 6px #00ff41, 0 0 12px rgba(0,255,65,0.5)',
              border: '1px solid rgba(0,0,0,0.5)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#888',
              textShadow: '0 1px 0 rgba(0,0,0,0.8)',
            }}
          >
            Performance Analyzer
          </span>
        </div>

        {/* Chart type toggle — physical rocker */}
        <div
          style={{
            display: 'flex',
            background: '#111',
            border: '1px solid #0a0a0a',
            borderRadius: 4,
            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.8)',
            overflow: 'hidden',
          }}
        >
          {(['line', 'bar'] as const).map((t) => (
            <button
              key={t}
              id={`chart-type-${t}`}
              onClick={() => handleToggle(t)}
              style={{
                padding: '0.3rem 0.65rem',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: 'Oswald, sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                ...(chartType === t
                  ? {
                      background: 'linear-gradient(180deg, #2a1800, #1a1000)',
                      color: '#f0a830',
                      boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.9)',
                    }
                  : {
                      background: 'transparent',
                      color: '#666',
                    }),
                transition: 'all 150ms ease',
              }}
            >
              {t === 'line' ? <TrendingUp size={12} /> : <BarChart3 size={12} />}
              {t === 'line' ? 'Line' : 'Bar'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── LCD Oscilloscope chart area ─── */}
      <div
        style={{
          margin: '1rem',
          borderRadius: 4,
          border: '2px solid #000',
          background: '#060e06',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.95), inset 0 0 4px rgba(0,255,65,0.05)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <div style={{ height: 240, padding: '0.75rem 0.5rem 0.25rem', position: 'relative', zIndex: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={data} margin={{ top: 5, right: 15, left: -10, bottom: 15 }}>
                <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: colors.axis, fontFamily: 'Share Tech Mono, monospace' }}
                  tickMargin={8}
                  axisLine={{ stroke: colors.axis }}
                  tickLine={{ stroke: colors.axis }}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: colors.axis, fontFamily: 'Share Tech Mono, monospace' }}
                  axisLine={{ stroke: colors.axis }}
                  tickLine={{ stroke: colors.axis }}
                  domain={[0, 10]}
                />
                <Tooltip content={<SkuTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: 10,
                    fontFamily: 'Oswald, sans-serif',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: colors.axis,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Avg Score"
                  stroke={colors.line}
                  strokeWidth={2}
                  dot={{ r: 3, fill: colors.line, stroke: '#000', strokeWidth: 1 }}
                  activeDot={{ r: 5, fill: colors.line, stroke: '#000', strokeWidth: 1 }}
                  style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,65,0.6))' }}
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 15, left: -10, bottom: 15 }}>
                <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: colors.axis, fontFamily: 'Share Tech Mono, monospace' }}
                  tickMargin={8}
                  axisLine={{ stroke: colors.axis }}
                  tickLine={{ stroke: colors.axis }}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: colors.axis, fontFamily: 'Share Tech Mono, monospace' }}
                  axisLine={{ stroke: colors.axis }}
                  tickLine={{ stroke: colors.axis }}
                  domain={[0, 10]}
                />
                <Tooltip content={<SkuTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: 10,
                    fontFamily: 'Oswald, sans-serif',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: colors.axis,
                  }}
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.barHi} stopOpacity={0.9} />
                    <stop offset="60%" stopColor={colors.bar} stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#552200" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey="score"
                  name="Avg Score"
                  fill="url(#barGrad)"
                  radius={[3, 3, 0, 0]}
                  style={{ filter: 'drop-shadow(0 0 4px rgba(212,130,10,0.4))' }}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
