// src/app/leaderboard/page.tsx
// Skeuomorphic Leaderboard — global ranking control panel with medal indicators.

'use client';

import { useState, useEffect } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import Footer from '@/components/Footer';
import { Trophy, Award, TrendingUp, Filter, Crown } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userEmail: string;
  userName: string;
  skill: string;
  totalScore: number;
  avgScore: number;
  interviewCount: number;
}

/* ── Atoms ────────────────────────────────────────────────── */
function Led({ color }: { color: 'green' | 'amber' | 'red' | 'off' }) {
  return (
    <span
      className={`sku-led sku-led-${color}`}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-hidden="true"
    />
  );
}

function Meter({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="sku-meter-track" style={{ width: 80 }}>
      <div className="sku-meter-fill sku-meter-fill-amber" style={{ width: `${Math.max(2, pct)}%` }} />
    </div>
  );
}

/* ── Rank badge ───────────────────────────────────────────── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div
      className="sku-knob"
      style={{ width: 38, height: 38, background: 'radial-gradient(circle at 35% 35%, #ffd700, #b8860b)', flexShrink: 0 }}
    >
      <Crown size={14} color="#1a0e00" />
    </div>
  );
  if (rank === 2) return (
    <div
      className="sku-knob"
      style={{ width: 38, height: 38, background: 'radial-gradient(circle at 35% 35%, #e0e0e0, #888)', flexShrink: 0 }}
    >
      <Trophy size={14} color="#111" />
    </div>
  );
  if (rank === 3) return (
    <div
      className="sku-knob"
      style={{ width: 38, height: 38, background: 'radial-gradient(circle at 35% 35%, #f4a460, #8b4513)', flexShrink: 0 }}
    >
      <Award size={14} color="#1a0800" />
    </div>
  );
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: 'linear-gradient(145deg, #2e2e2e, #1a1a1a)',
        border: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: '0.72rem',
        color: 'var(--sku-metal-dark)',
        flexShrink: 0,
        boxShadow: '2px 2px 5px rgba(0,0,0,0.6)',
      }}
    >
      #{rank}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function LeaderboardPage() {
  const { userEmail } = useCustomAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchSkills(); }, []);
  useEffect(() => { fetchLeaderboard(); }, [selectedSkill]);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/leaderboard/skills');
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const url = selectedSkill === 'all'
        ? '/api/leaderboard'
        : `/api/leaderboard?skill=${encodeURIComponent(selectedSkill)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const isCurrentUser = (email: string) => email === userEmail;

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="sku-spinner" style={{ margin: '0 auto 1rem' }} />
          <p className="sku-label">Loading Rankings…</p>
        </div>
      </div>
    );
  }

  const topScore = leaderboard[0]?.totalScore || 100;

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 5px), linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
          borderBottom: '3px solid #0d0d0d',
          padding: '1.5rem',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="sku-screw" aria-hidden="true" />
            <Led color="amber" />
            <h1 className="sku-heading" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)' }}>Global Leaderboard</h1>
            <Led color="amber" />
            <span className="sku-screw" aria-hidden="true" />
          </div>
          <p style={{ fontFamily: 'Roboto Condensed, sans-serif', color: 'var(--sku-metal-dark)', fontSize: '0.82rem' }}>
            Top performers across all interview sessions
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Stats row ─────────────────────────────────────────── */}
        {leaderboard.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              background: 'linear-gradient(180deg, #0d0d0d, #161616)',
              border: '1px solid #1a1a1a',
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
            }}
          >
            {[
              { icon: TrendingUp, label: 'Participants', val: leaderboard.length, led: 'green' as const },
              { icon: Trophy, label: 'Top Score', val: leaderboard[0]?.totalScore || 0, led: 'amber' as const },
              {
                icon: Award, label: 'Avg Score',
                val: (leaderboard.reduce((s, e) => s + Number(e.avgScore), 0) / leaderboard.length).toFixed(1),
                led: 'green' as const
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '1.25rem',
                  textAlign: 'center',
                  borderRight: i < 2 ? '1px solid #222' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Led color={s.led} />
                  <span className="sku-label">{s.label}</span>
                </div>
                <p
                  className="sku-heading"
                  style={{ fontSize: '1.8rem', color: 'var(--sku-amber-hi)', textShadow: '0 0 10px var(--sku-amber-glow)', fontFamily: 'Share Tech Mono, monospace' }}
                >
                  {s.val}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter ──────────────────────────────────────────────── */}
        <div className="sku-card" style={{ overflow: 'hidden' }}>
          <div className="sku-card-header">
            <Led color="amber" />
            <Filter size={12} color="var(--sku-metal-dark)" />
            <span className="sku-label">Filter by Skill Module</span>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['all', ...skills].map((s) => (
              <button
                key={s}
                id={`filter-${s}`}
                onClick={() => setSelectedSkill(s)}
                className={`sku-btn ${selectedSkill === s ? 'sku-nav-active' : 'sku-btn-ghost'}`}
                style={{ fontSize: '0.7rem', padding: '0.35rem 0.85rem' }}
              >
                {s === 'all' ? 'All Skills' : s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Rankings table ──────────────────────────────────────── */}
        <div className="sku-card" style={{ overflow: 'hidden' }}>
          <div className="sku-card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sku-screw" aria-hidden="true" />
              <Led color="green" />
              <span className="sku-label">Top {leaderboard.length} Performers</span>
            </div>
            <span className="sku-screw" aria-hidden="true" />
          </div>

          <div style={{ padding: '1rem' }}>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div className="sku-knob" style={{ width: 64, height: 64 }}>
                  <Trophy size={24} color="var(--sku-metal-dark)" />
                </div>
                <h3 className="sku-heading" style={{ fontSize: '1rem' }}>No Entries Yet</h3>
                <p style={{ fontFamily: 'Roboto Condensed, sans-serif', color: 'var(--sku-metal-dark)', fontSize: '0.82rem' }}>
                  Be the first to appear on the leaderboard!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {leaderboard.map((entry, idx) => {
                  const isCurrent = isCurrentUser(entry.userEmail);
                  const isPodium = entry.rank <= 3;

                  return (
                    <div
                      key={`${entry.rank}-${entry.userEmail}`}
                      id={`rank-${entry.rank}`}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 5,
                        border: isCurrent
                          ? '1px solid rgba(212,130,10,0.6)'
                          : isPodium
                          ? '1px solid rgba(212,130,10,0.25)'
                          : '1px solid #1a1a1a',
                        borderTop: isCurrent
                          ? '1px solid rgba(212,130,10,0.8)'
                          : isPodium
                          ? '1px solid rgba(212,130,10,0.4)'
                          : '1px solid #2e2e2e',
                        background: isCurrent
                          ? 'linear-gradient(145deg, #2a1800, #1a1000)'
                          : isPodium
                          ? 'linear-gradient(145deg, #252015, #1a1a12)'
                          : 'linear-gradient(145deg, #272727, #1e1e1e)',
                        boxShadow: isCurrent
                          ? '2px 2px 8px rgba(0,0,0,0.7), 0 0 14px rgba(212,130,10,0.2)'
                          : '2px 2px 6px rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        transition: 'box-shadow 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) (e.currentTarget as HTMLElement).style.boxShadow = '2px 2px 8px rgba(0,0,0,0.7), 0 0 10px rgba(212,130,10,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) (e.currentTarget as HTMLElement).style.boxShadow = '2px 2px 6px rgba(0,0,0,0.6)';
                      }}
                    >
                      <RankBadge rank={entry.rank} />

                      {/* Avatar */}
                      <div
                        style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'radial-gradient(circle at 35% 35%, #d0a040, #7a5010)',
                          border: '2px solid #111',
                          boxShadow: '2px 2px 5px rgba(0,0,0,0.7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        {entry.userName?.[0]?.toUpperCase() || 'U'}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span
                            className="sku-heading"
                            style={{ fontSize: '0.85rem', color: isCurrent ? 'var(--sku-amber-hi)' : 'var(--sku-metal-light)' }}
                          >
                            {entry.userName || 'Anonymous'}
                          </span>
                          {isCurrent && (
                            <span
                              className="sku-badge sku-badge-amber"
                              style={{ fontSize: '0.58rem' }}
                            >
                              You
                            </span>
                          )}
                          {isPodium && (
                            <span
                              className="sku-badge sku-badge-green"
                              style={{ fontSize: '0.55rem' }}
                            >
                              Top {entry.rank}
                            </span>
                          )}
                        </div>
                        <span className="sku-label">
                          {entry.skill} · {entry.interviewCount} session{entry.interviewCount !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Scores + meter */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <p
                            style={{
                              fontFamily: 'Share Tech Mono, monospace',
                              fontSize: '1.3rem',
                              color: 'var(--sku-amber-hi)',
                              textShadow: '0 0 8px var(--sku-amber-glow)',
                              lineHeight: 1,
                            }}
                          >
                            {entry.totalScore}
                          </p>
                          <span className="sku-label">Total</span>
                          <Meter value={entry.totalScore} total={topScore} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p
                            style={{
                              fontFamily: 'Share Tech Mono, monospace',
                              fontSize: '1.3rem',
                              color: 'var(--sku-green-lcd)',
                              textShadow: '0 0 6px rgba(0,255,65,0.6)',
                              lineHeight: 1,
                            }}
                          >
                            {Number(entry.avgScore).toFixed(1)}
                          </p>
                          <span className="sku-label">Avg</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
