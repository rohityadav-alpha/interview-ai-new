// src/app/dashboard/page.tsx
// Skeuomorphic Dashboard — fully wired to shadcn Button, Card, AlertDialog components.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Brain, Calendar, Clock, Plus, Trophy, Zap,
  ArrowRight, Trash2, AlertTriangle, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardContent,
} from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Footer from '@/components/Footer';
import PerformanceChart from '@/components/charts/PerformanceChart';

/* ── Types ─────────────────────────────────────────────────── */
type Interview = {
  id: number; skill: string; difficulty: string;
  avgScore: number | null; isCompleted: boolean;
  createdAt: string; interviewDuration: number | null;
};
type Stats = { total: number; avgScore: number; totalTime: number };

/* ── Atoms ─────────────────────────────────────────────────── */
function Led({ color = 'green', blink }: { color?: 'green' | 'amber' | 'red' | 'off'; blink?: boolean }) {
  return <span className={`sku-led sku-led-${color}${blink ? ' sku-led-blink' : ''}`} aria-hidden="true" style={{ display: 'inline-block' }} />;
}
function Meter({ value, total = 10, amber }: { value: number; total?: number; amber?: boolean }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="sku-meter-track">
      <div className={`sku-meter-fill${amber ? ' sku-meter-fill-amber' : ''}`} style={{ width: `${Math.max(2, pct)}%` }} />
    </div>
  );
}

/* ── Stat Panel ─────────────────────────────────────────────── */
function StatPanel({
  icon: Icon, label, value, unit, meterValue, meterTotal, ledColor, amber,
}: {
  icon: React.ElementType; label: string; value: string | number; unit?: string;
  meterValue: number; meterTotal?: number; ledColor: 'green' | 'amber' | 'red'; amber?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <Led color={ledColor} blink />
        <span className="sku-label">{label}</span>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div className="sku-knob" style={{ flexShrink: 0 }}>
            <Icon size={20} color="var(--sku-amber-hi)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '2.4rem', lineHeight: 1,
              color: amber ? 'var(--sku-amber-hi)' : 'var(--sku-green-lcd)',
              textShadow: amber ? '0 0 12px var(--sku-amber-glow)' : '0 0 10px rgba(0,255,65,0.7)',
            }}>
              {value}
            </span>
            {unit && <span className="sku-label" style={{ fontSize: '0.65rem' }}>{unit}</span>}
          </div>
        </div>
        <Meter value={meterValue} total={meterTotal} amber={amber} />
      </CardContent>
    </Card>
  );
}

/* ── Interview Row ──────────────────────────────────────────── */
function InterviewRow({ interview, onDelete }: { interview: Interview; onDelete: () => void }) {
  const score = interview.avgScore ? Number(interview.avgScore) : 0;
  const ledColor = score >= 8 ? 'green' : score >= 5 ? 'amber' : 'red';
  const diffLed = ({ easy: 'green', medium: 'amber', hard: 'red' }[interview.difficulty?.toLowerCase()] || 'amber') as 'green' | 'amber' | 'red';

  return (
    <Card>
      <CardHeader style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Led color={interview.isCompleted ? 'green' : 'amber'} />
          <span className="sku-label">{interview.isCompleted ? 'Completed' : 'In Progress'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Led color={diffLed} />
          <span className="sku-label">{interview.difficulty}</span>
        </div>
      </CardHeader>

      <CardContent style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="sku-knob" style={{ width: 42, height: 42, flexShrink: 0 }}>
          <Brain size={16} color="var(--sku-amber-hi)" />
        </div>

        <div style={{ flex: 1, minWidth: 140 }}>
          <h4 className="sku-heading" style={{ fontSize: '0.9rem', marginBottom: 4 }}>{interview.skill}</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="sku-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={10} /> {new Date(interview.createdAt).toLocaleDateString()}
            </span>
            <span className="sku-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={10} /> {Math.floor((interview.interviewDuration || 0) / 60)}m
            </span>
          </div>
        </div>

        {interview.isCompleted && (
          <div className="sku-lcd" style={{ padding: '0.4rem 0.8rem', textAlign: 'center', minWidth: 64, position: 'relative' }}>
            <div className="sku-label" style={{ color: 'var(--sku-green-lcd-dim)', marginBottom: 2 }}>Score</div>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '1.4rem', lineHeight: 1,
              color: ledColor === 'green' ? '#00ff41' : ledColor === 'amber' ? '#d4820a' : '#ff4040',
              textShadow: '0 0 8px currentColor',
            }}>
              {score.toFixed(1)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {interview.isCompleted ? (
            <Link href={`/reports/${interview.id}`}>
              <Button size="sm">
                Report <ArrowRight size={13} />
              </Button>
            </Link>
          ) : (
            <Link href={`/interview/${interview.id}`}>
              <Button variant="secondary" size="sm">
                Continue <ArrowRight size={13} />
              </Button>
            </Link>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete} title="Delete">
            <Trash2 size={13} />
          </Button>
        </div>
      </CardContent>

      {interview.isCompleted && (
        <div style={{ padding: '0 1rem 0.75rem' }}>
          <Meter value={score} total={10} amber={score < 8} />
        </div>
      )}
    </Card>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, avgScore: 0, totalTime: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const userName = user?.firstName || 'Operator';

  const performanceData = interviews
    .filter(i => i.isCompleted && i.avgScore !== null)
    .map(i => ({ date: new Date(i.createdAt).toLocaleDateString(), score: Number(i.avgScore), interviews: 1 }));

  const loadDashboardData = async () => {
    try {
      const res = await fetch('/api/interviews/list');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInterviews(data.interviews || []);
      setStats(data.stats || { total: 0, avgScore: 0, totalTime: 0 });
    } catch { toast.error('Failed to load dashboard'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push('/sign-in'); return; }
    loadDashboardData();
  }, [isLoaded, isSignedIn, router]);

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/interviews/list?id=${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Session deleted'); await loadDashboardData(); setDeleteId(null); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to delete'); }
    } catch { toast.error('Failed to delete'); }
    finally { setIsDeleting(false); }
  };

  if (!isLoaded || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="sku-spinner" style={{ margin: '0 auto 1rem' }} />
          <p className="sku-label">Loading Mission Control…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      {/* ── Header banner ─────────────────────────────────────── */}
      <div style={{
        background: 'repeating-linear-gradient(90deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 5px),linear-gradient(180deg,#3a3a3a 0%,#2a2a2a 100%)',
        borderBottom: '3px solid #0d0d0d',
        boxShadow: '0 6px 20px rgba(0,0,0,0.8)',
        padding: '1.5rem',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className="sku-screw" aria-hidden="true" />
              <Led color="green" blink />
              <h1 className="sku-heading" style={{ fontSize: 'clamp(1.2rem,3vw,1.7rem)' }}>
                Mission Control — {userName}
              </h1>
            </div>
            <div className="sku-lcd" style={{ display: 'inline-block', padding: '0.3rem 0.8rem', fontSize: '0.72rem', position: 'relative' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <Link href="/interview/new">
            <Button size="lg">
              <Plus size={16} style={{ marginRight: 6 }} />
              Start New Interview
            </Button>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* ── Stats row ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.25rem' }}>
          <StatPanel icon={Brain} label="Total Sessions" value={stats.total}
            meterValue={stats.total} meterTotal={Math.max(stats.total, 10)} ledColor="green" />
          <StatPanel icon={Trophy} label="Avg Score"
            value={stats.avgScore > 0 ? Number(stats.avgScore).toFixed(1) : '0.0'} unit="/ 10"
            meterValue={stats.avgScore} meterTotal={10} ledColor="amber" amber />
          <StatPanel icon={Clock} label="Total Time" value={Math.floor(stats.totalTime / 60)} unit="min"
            meterValue={stats.totalTime} meterTotal={Math.max(stats.totalTime, 3600)} ledColor="green" />
        </div>

        {/* ── Performance chart ─────────────────────────────────── */}
        {interviews.length > 0 && (
          <Card>
            <CardHeader style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="sku-screw" aria-hidden="true" />
                <Led color="amber" blink />
                <span className="sku-label">Performance Trend</span>
              </div>
              <span className="sku-screw" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <PerformanceChart data={performanceData} />
            </CardContent>
          </Card>
        )}

        {/* ── Recent sessions ─────────────────────────────────────── */}
        <Card>
          <CardHeader style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sku-screw" aria-hidden="true" />
              <Led color="green" blink />
              <span className="sku-label">Recent Interview Sessions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {interviews.length > 0 && (
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm">
                    <Trophy size={12} style={{ marginRight: 4 }} /> Leaderboard
                  </Button>
                </Link>
              )}
              <span className="sku-screw" aria-hidden="true" />
            </div>
          </CardHeader>

          <CardContent>
            {interviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <div className="sku-knob" style={{ width: 72, height: 72 }}>
                  <Brain size={28} color="var(--sku-metal-dark)" />
                </div>
                <h3 className="sku-heading" style={{ fontSize: '1.1rem' }}>No Sessions Logged</h3>
                <p style={{ fontFamily: 'Roboto Condensed, sans-serif', color: 'var(--sku-metal-dark)', fontSize: '0.85rem', maxWidth: 360 }}>
                  Initiate your first interview session to begin tracking performance metrics.
                </p>
                <Link href="/interview/new">
                  <Button size="lg">
                    <Zap size={15} style={{ marginRight: 8 }} /> Start First Session
                  </Button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {interviews.slice(0, 5).map(iv => (
                  <InterviewRow key={iv.id} interview={iv} onDelete={() => setDeleteId(iv.id)} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Quick actions ────────────────────────────────────────── */}
        {interviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.25rem' }}>
            {[
              { href: '/interview/new', icon: Plus, led: 'amber' as const, label: 'New Session', title: 'Start New Interview', desc: 'Practice with AI-generated questions' },
              { href: '/leaderboard', icon: Trophy, led: 'green' as const, label: 'Rankings', title: 'View Leaderboard', desc: 'See how you rank globally' },
            ].map(q => (
              <Link key={q.href} href={q.href}>
                <Card style={{ cursor: 'pointer' }}>
                  <CardHeader>
                    <Led color={q.led} blink />
                    <span className="sku-label">{q.label}</span>
                  </CardHeader>
                  <CardContent style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="sku-knob" style={{ flexShrink: 0 }}>
                      <q.icon size={20} color="var(--sku-amber-hi)" />
                    </div>
                    <div>
                      <p className="sku-heading" style={{ fontSize: '0.85rem', marginBottom: 2 }}>{q.title}</p>
                      <p style={{ fontFamily: 'Roboto Condensed, sans-serif', color: 'var(--sku-metal-dark)', fontSize: '0.72rem' }}>{q.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Delete confirmation ──────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff6060' }}>
              <AlertTriangle size={18} /> Confirm Deletion
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            This will permanently delete this interview session and all associated response data. This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter style={{ gap: 8 }}>
            <AlertDialogCancel asChild>
              <Button variant="ghost" disabled={isDeleting}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" id="confirm-delete-btn" onClick={() => deleteId && handleDelete(deleteId)} disabled={isDeleting}>
                {isDeleting ? <><Loader2 size={14} style={{ marginRight: 6, animation: 'sku-spin 0.8s linear infinite' }} /> Deleting…</> : <><Trash2 size={14} style={{ marginRight: 6 }} /> Delete</>}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
