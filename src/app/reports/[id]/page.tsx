// src/app/reports/[id]/page.tsx
// Skeuomorphic Report Page — post-session debriefing console.
// Features: performance LCD banner, VU score meters, question-by-question feedback panels.

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import Footer from '@/components/Footer';
import {
  CheckCircle, TrendingUp, FileDown, Home,
  Target, Award, AlertCircle, Sparkles, Brain, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { generatePDFReport } from '@/lib/pdf-generator';
import { toast } from 'sonner';

/* ── Atoms ────────────────────────────────────────────────── */
function Led({ color, blink }: { color: 'green' | 'amber' | 'red' | 'off'; blink?: boolean }) {
  return (
    <span
      className={`sku-led sku-led-${color}${blink ? ' sku-led-blink' : ''}`}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-hidden="true"
    />
  );
}

function ScoreMeter({ score, max = 10, color = 'amber' }: { score: number; max?: number; color?: string }) {
  const pct = (score / max) * 100;
  return (
    <div className="sku-meter-track" style={{ height: 10, margin: '4px 0' }}>
      <div
        className={`sku-meter-fill${color === 'green' ? '' : color === 'amber' ? ' sku-meter-fill-amber' : ''}`}
        style={{
          width: `${Math.max(2, pct)}%`,
          background: color === 'red'
            ? 'linear-gradient(90deg, #660000 0%, #cc2222 60%, #ff8080 100%)'
            : undefined,
        }}
      />
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useCustomAuth();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isSignedIn) router.push('/sign-in');
  }, [authLoading, isSignedIn, router]);

  useEffect(() => {
    async function fetchReport() {
      if (!isSignedIn) return;
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (res.ok) { const data = await res.json(); setReport(data.interview); }
        else toast.error('Failed to load report');
      } catch { toast.error('Error loading report'); }
      finally { setIsLoading(false); }
    }
    if (isSignedIn) fetchReport();
  }, [isSignedIn, id]);

  const handleDownloadPDF = () => {
    if (!report) return;
    const loadingToast = toast.loading('Generating PDF…');
    setTimeout(() => {
      try {
        const success = generatePDFReport({
          userName: `${report.userFirstName} ${report.userLastName}`,
          userEmail: report.userEmail,
          skill: report.skill, difficulty: report.difficulty,
          totalScore: report.totalScore, avgScore: report.avgScore,
          questionsAttempted: report.questionsAttempted, createdAt: report.createdAt,
          questions: report.responses.map((r: any) => {
            let strengths = [], improvements = [], confidenceTips = [];
            try { strengths = r.strengths ? JSON.parse(r.strengths) : []; } catch { }
            try { improvements = r.improvements ? JSON.parse(r.improvements) : []; } catch { }
            try { confidenceTips = r.confidenceTips ? JSON.parse(r.confidenceTips) : []; } catch { }
            return { question: r.question, userAnswer: r.userAnswer, aiScore: r.aiScore, aiFeedback: r.aiFeedback, strengths, improvements, confidenceTips };
          }),
        });
        toast.dismiss(loadingToast);
        if (success) toast.success('PDF downloaded!');
        else toast.error('Failed to generate PDF');
      } catch { toast.dismiss(loadingToast); toast.error('Failed to generate PDF'); }
    }, 400);
  };

  if (authLoading || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="sku-spinner" style={{ margin: '0 auto 1rem' }} />
          <p className="sku-label">Compiling Report…</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !report) return null;

  const avgScore = Number(report.avgScore || 0);
  const perfLevel = avgScore >= 8 ? 'excellent' : avgScore >= 6 ? 'good' : avgScore >= 4 ? 'average' : 'poor';

  const perfConfig: Record<string, { label: string; Icon: any; led: 'green' | 'amber' | 'red'; meterColor: string }> = {
    excellent: { label: 'Outstanding Performance!', Icon: Sparkles, led: 'green', meterColor: 'green' },
    good: { label: 'Great Job!', Icon: Award, led: 'green', meterColor: 'green' },
    average: { label: 'Good Effort!', Icon: Target, led: 'amber', meterColor: 'amber' },
    poor: { label: 'Keep Practicing!', Icon: AlertCircle, led: 'red', meterColor: 'red' },
  };
  const perf = perfConfig[perfLevel];

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        style={{
          background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 5px), linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
          borderBottom: '3px solid #0d0d0d',
          padding: '1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
          <span className="sku-screw" aria-hidden="true" />
          <Led color="green" blink />
          <h1 className="sku-heading" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)' }}>Session Report</h1>
          <Led color="green" blink />
          <span className="sku-screw" aria-hidden="true" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="sku-badge sku-badge-amber" style={{ fontSize: '0.7rem' }}>{report.skill}</span>
          <span className="sku-badge sku-badge-green" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{report.difficulty}</span>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Performance banner ────────────────────────────────── */}
        <div
          className="sku-panel"
          style={{
            borderRadius: 8, overflow: 'hidden',
            border: `1px solid rgba(212,130,10,${perfLevel === 'excellent' ? '0.5' : perfLevel === 'good' ? '0.35' : '0.2'})`,
          }}
        >
          <div className="sku-card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Led color={perf.led} blink />
              <span className="sku-label">Performance Analysis</span>
            </div>
            <div className="sku-lcd" style={{ padding: '0.2rem 0.65rem', fontSize: '0.6rem', position: 'relative' }}>
              Session #{id.slice(-6).toUpperCase()}
            </div>
          </div>

          <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="sku-knob" style={{ width: 54, height: 54, flexShrink: 0 }}>
                <perf.Icon size={20} color="var(--sku-amber-hi)" />
              </div>
              <div>
                <h2 className="sku-heading" style={{ fontSize: '1.1rem', color: 'var(--sku-amber-hi)', textShadow: '0 0 12px var(--sku-amber-glow)' }}>
                  {perf.label}
                </h2>
                <p style={{ fontFamily: 'Roboto Condensed, sans-serif', color: 'var(--sku-metal-dark)', fontSize: '0.78rem' }}>
                  You are on the right track
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '3rem',
                  lineHeight: 1,
                  color: 'var(--sku-amber-hi)',
                  textShadow: '0 0 20px var(--sku-amber-glow)',
                }}
              >
                {avgScore.toFixed(1)}
              </p>
              <span className="sku-label">Average Score</span>
              <ScoreMeter score={avgScore} color={perf.meterColor} />
            </div>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────── */}
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
            { icon: TrendingUp, label: 'Total Score', val: report.totalScore, sub: `/ ${report.responses.length * 10}` },
            { icon: Award, label: 'Average Score', val: `${avgScore.toFixed(1)}`, sub: 'per question' },
            { icon: CheckCircle, label: 'Questions', val: report.questionsAttempted, sub: `/ ${report.responses.length}` },
          ].map((s, i) => (
            <div key={i} style={{ padding: '1.25rem', textAlign: 'center', borderRight: i < 2 ? '1px solid #222' : 'none' }}>
              <div className="sku-knob" style={{ width: 38, height: 38, margin: '0 auto 8px' }}>
                <s.icon size={14} color="var(--sku-amber-hi)" />
              </div>
              <p
                style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '1.8rem',
                  color: 'var(--sku-amber-hi)',
                  textShadow: '0 0 10px var(--sku-amber-glow)',
                  lineHeight: 1,
                }}
              >
                {s.val}
              </p>
              <span className="sku-label">{s.label}</span>
              <br />
              <span className="sku-label" style={{ opacity: 0.55 }}>{s.sub}</span>
            </div>
          ))}
        </div>

        {/* ── Detailed feedback ────────────────────────────────────── */}
        <div className="sku-card" style={{ overflow: 'hidden' }}>
          <div className="sku-card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sku-screw" aria-hidden="true" />
              <Led color="amber" />
              <span className="sku-label">Question-by-Question Feedback</span>
            </div>
            <span className="sku-screw" aria-hidden="true" />
          </div>

          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {report.responses.map((response: any, index: number) => {
              const score = response.aiScore || 0;
              const scoreLed: 'green' | 'amber' | 'red' = score >= 7 ? 'green' : score >= 4 ? 'amber' : 'red';
              const meterC = score >= 7 ? 'green' : score >= 4 ? 'amber' : 'red';

              let strengths: string[] = [], improvements: string[] = [], confidenceTips: string[] = [];
              try { strengths = response.strengths ? JSON.parse(response.strengths) : []; } catch { }
              try { improvements = response.improvements ? JSON.parse(response.improvements) : []; } catch { }
              try { confidenceTips = response.confidenceTips ? JSON.parse(response.confidenceTips) : []; } catch { }

              return (
                <details
                  key={index}
                  open={score < 5}
                  style={{
                    borderRadius: 5,
                    border: '1px solid #1e1e1e',
                    borderTop: '1px solid #2a2a2a',
                    background: 'linear-gradient(145deg, #232323, #1a1a1a)',
                    boxShadow: '2px 2px 6px rgba(0,0,0,0.6)',
                    overflow: 'hidden',
                  }}
                >
                  <summary
                    style={{
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      userSelect: 'none',
                      listStyle: 'none',
                    }}
                  >
                    <div className="sku-knob" style={{ width: 32, height: 32, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sku-metal-mid)' }}>
                        {index + 1}
                      </span>
                    </div>
                    <Led color={scoreLed} />
                    <p
                      style={{
                        flex: 1,
                        fontFamily: 'Roboto Condensed, sans-serif',
                        fontSize: '0.83rem',
                        color: 'var(--sku-metal-mid)',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {response.question}
                    </p>
                    {response.aiScore !== undefined && (
                      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
                        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '1.1rem', color: scoreLed === 'green' ? 'var(--sku-green-lcd)' : 'var(--sku-amber-hi)' }}>
                          {score}/10
                        </span>
                        <ScoreMeter score={score} color={meterC} />
                      </div>
                    )}
                  </summary>

                  <div style={{ padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {/* Your answer */}
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#111',
                        borderRadius: 4,
                        borderLeft: '3px solid var(--sku-amber)',
                        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.7)',
                      }}
                    >
                      <span className="sku-label" style={{ display: 'block', marginBottom: 4 }}>Your Answer</span>
                      <p style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.82rem', color: 'var(--sku-metal-mid)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {response.userAnswer || 'No answer provided'}
                      </p>
                    </div>

                    {/* AI feedback */}
                    {response.aiFeedback && (
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          background: 'rgba(0,20,0,0.6)',
                          borderRadius: 4,
                          borderLeft: '3px solid var(--sku-green-lcd)',
                          boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.7)',
                        }}
                      >
                        <span className="sku-label" style={{ display: 'block', marginBottom: 4, color: 'var(--sku-green-lcd)' }}>AI Feedback</span>
                        <p style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.82rem', color: 'var(--sku-metal-mid)', lineHeight: 1.6 }}>
                          {response.aiFeedback}
                        </p>
                      </div>
                    )}

                    {/* Strengths / Improvements / Tips */}
                    {strengths.length > 0 && (
                      <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(0,40,0,0.4)', borderRadius: 4 }}>
                        <span className="sku-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, color: '#00cc44' }}>
                          <Led color="green" /> Strengths
                        </span>
                        {strengths.map((s: string, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: 7, marginTop: 4 }}>
                            <CheckCircle size={12} color="#00cc44" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.78rem', color: 'var(--sku-metal-dark)' }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {improvements.length > 0 && (
                      <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(40,20,0,0.4)', borderRadius: 4 }}>
                        <span className="sku-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, color: 'var(--sku-amber-hi)' }}>
                          <Led color="amber" /> Areas to Improve
                        </span>
                        {improvements.map((imp: string, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: 7, marginTop: 4 }}>
                            <Target size={12} color="var(--sku-amber-hi)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.78rem', color: 'var(--sku-metal-dark)' }}>{imp}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {confidenceTips.length > 0 && (
                      <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(0,10,40,0.4)', borderRadius: 4 }}>
                        <span className="sku-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, color: '#60a0ff' }}>
                          <Led color="off" /> Confidence Tips
                        </span>
                        {confidenceTips.map((tip: string, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: 7, marginTop: 4 }}>
                            <Sparkles size={12} color="#60a0ff" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.78rem', color: 'var(--sku-metal-dark)' }}>{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        {/* ── Action buttons ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', paddingBottom: '1rem' }}>
          <button
            id="download-pdf-btn"
            onClick={handleDownloadPDF}
            className="sku-btn sku-btn-primary"
            style={{ flex: '1', maxWidth: 260, justifyContent: 'center' }}
          >
            <FileDown size={15} style={{ marginRight: 8 }} />
            Download PDF Report
          </button>
          <Link href="/interview/new" style={{ flex: '1', maxWidth: 220 }}>
            <button
              id="new-interview-btn"
              className="sku-btn sku-btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Zap size={15} style={{ marginRight: 8 }} />
              Start New Interview
            </button>
          </Link>
          <Link href="/dashboard" style={{ flex: '1', maxWidth: 180 }}>
            <button
              id="back-dashboard-btn"
              className="sku-btn sku-btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Home size={15} style={{ marginRight: 8 }} />
              Dashboard
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
