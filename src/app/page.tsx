// src/app/page.tsx  — Skeuomorphic landing page using shadcn Button + Card components.
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Brain, Zap, Award, TrendingUp, Users, Clock, ArrowRight, Sparkles, Trophy,
} from 'lucide-react';

function Led({ color = 'green', blink }: { color?: 'green' | 'amber' | 'red'; blink?: boolean }) {
  return <span className={`sku-led sku-led-${color}${blink ? ' sku-led-blink' : ''}`} aria-hidden="true" style={{ display: 'inline-block' }} />;
}
function Meter({ value }: { value: number }) {
  return (
    <div className="sku-meter-track" aria-hidden="true">
      <div className="sku-meter-fill" style={{ width: `${Math.max(2, value)}%` }} />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, meterValue }: {
  icon: React.ElementType; title: string; description: string; meterValue: number;
}) {
  return (
    <Card>
      <CardHeader>
        <Led color="green" />
        <span className="sku-label">{title}</span>
        <div style={{ marginLeft: 'auto' }}>
          <span className="sku-screw" style={{ width: 10, height: 10 }} aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="sku-knob" style={{ width: 52, height: 52 }} aria-hidden="true">
          <Icon size={20} color="var(--sku-amber-hi)" />
        </div>
        <p style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.82rem', color: 'var(--sku-metal-mid)', lineHeight: 1.55 }}>
          {description}
        </p>
        <div>
          <span className="sku-label" style={{ display: 'block', marginBottom: 4 }}>Activity</span>
          <Meter value={meterValue} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  const { isSignedIn, isLoading } = useCustomAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isSignedIn) router.push('/dashboard');
  }, [isLoading, isSignedIn, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="sku-spinner" style={{ margin: '0 auto 1rem' }} />
          <p className="sku-label">Initializing System…</p>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Brain, title: 'AI Feedback Engine', description: 'Instant, detailed AI-powered feedback on every answer with actionable improvement signals.', meter: 94 },
    { icon: Trophy, title: 'Real Interview Qs', description: 'Questions sourced from top tech companies across multiple difficulty levels.', meter: 87 },
    { icon: TrendingUp, title: 'Progress Analytics', description: 'Monitor your performance over time with detailed charts and session reports.', meter: 76 },
    { icon: Award, title: 'Global Leaderboard', description: 'Compete with thousands of candidates and climb the worldwide ranking board.', meter: 81 },
  ];

  const stats = [
    { label: 'Developers Trained', value: '1,000+', led: 'green' as const },
    { label: 'Questions in Bank', value: '500+', led: 'amber' as const },
    { label: 'Avg. Score Gain', value: '+34%', led: 'green' as const },
    { label: 'Completion Rate', value: '92%', led: 'amber' as const },
  ];

  const checklist = [
    { icon: Zap, text: 'Instant AI-powered feedback' },
    { icon: Clock, text: 'Practice anytime, anywhere' },
    { icon: TrendingUp, text: 'Track improvement over time' },
    { icon: Users, text: 'Join an active dev community' },
    { icon: Award, text: 'No credit card required' },
    { icon: Brain, text: 'Certificate of completion' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ paddingTop: '5rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Brushed texture bg */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(90deg,rgba(255,255,255,0.012) 0px,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 5px)',
          pointerEvents: 'none',
        }} />
        {/* Radial vignette */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212,130,10,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center', position: 'relative' }}>

          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0.35rem 0.9rem', borderRadius: 4,
            background: '#0a1f0a', border: '1px solid #1a5a1a',
            boxShadow: 'inset 0 0 10px rgba(0,255,65,0.08)',
          }}>
            <Led color="green" blink />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00ff41', textShadow: '0 0 8px rgba(0,255,65,0.8)' }}>
              System Online — AI Feedback Active
            </span>
          </div>

          {/* Headline */}
          <h1 className="sku-heading" style={{ fontSize: 'clamp(2.2rem,6vw,4rem)', lineHeight: 1.1, letterSpacing: '0.04em' }}>
            Master Your Next<br />
            <span style={{ color: 'var(--sku-amber-hi)', textShadow: '0 0 12px var(--sku-amber-glow),1px 1px 0 rgba(0,0,0,0.8),-1px -1px 0 rgba(255,255,255,0.05)' }}>
              Technical Interview
            </span>
          </h1>

          {/* Sub */}
          <p style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '1rem', color: 'var(--sku-metal-mid)', lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
            Practice with real interview questions, receive instant AI feedback, and track
            your improvement on a production-grade platform built for serious developers.
          </p>

          {/* LCD readout */}
          <div className="sku-lcd" style={{ maxWidth: 520, width: '100%', margin: '0 auto', position: 'relative', padding: '0.7rem 1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>&gt; STATUS: READY</span>
              <span>&gt; USERS: 1,024</span>
              <span>&gt; AI_VER: 2.4.1</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/sign-up">
              <Button id="hero-cta-primary" size="lg">
                <Sparkles size={15} style={{ marginRight: 8 }} />
                Get Started Free
                <ArrowRight size={15} style={{ marginLeft: 8 }} />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button id="hero-cta-secondary" variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--sku-metal-dark)', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.78rem' }}>
            <Led color="green" />
            Join 1,000+ developers already improving their interview skills
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <div style={{
        background: 'repeating-linear-gradient(90deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 5px),linear-gradient(180deg,#111,#161616)',
        borderTop: '2px solid #0a0a0a', borderBottom: '2px solid #0a0a0a',
        padding: '1.5rem',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: '1.25rem 1.5rem', borderRight: i < stats.length - 1 ? '1px solid #222' : 'none', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                <Led color={s.led} />
                <span className="sku-label">{s.label}</span>
              </div>
              <p className="sku-heading" style={{ fontSize: '2rem', lineHeight: 1, color: 'var(--sku-amber-hi)', textShadow: '0 0 12px var(--sku-amber-glow)' }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="sku-screw" aria-hidden="true" />
              <h2 className="sku-heading" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)' }}>System Capabilities</h2>
              <span className="sku-screw" aria-hidden="true" />
            </div>
            <p style={{ fontFamily: 'Roboto Condensed, sans-serif', color: 'var(--sku-metal-dark)', fontSize: '0.88rem', letterSpacing: '0.05em' }}>
              Enterprise-grade AI modules powering your interview preparation
            </p>
            <div className="sku-divider" style={{ marginTop: '1.5rem' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} meterValue={f.meter} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CHECKLIST ─────────────────────────────────────────── */}
      <section style={{ padding: '0 1.5rem 5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Card>
            <CardHeader style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="sku-screw" aria-hidden="true" />
                <Led color="amber" />
                <span className="sku-label">Everything You Need to Succeed</span>
              </div>
              <span className="sku-screw" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
                {checklist.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '0.85rem 1rem',
                    background: 'linear-gradient(145deg,#252525,#1e1e1e)',
                    border: '1px solid #1a1a1a', borderTop: '1px solid #333',
                    borderRadius: 5,
                    boxShadow: '2px 2px 6px rgba(0,0,0,0.6),-1px -1px 3px rgba(255,255,255,0.04)',
                  }}>
                    <div className="sku-knob" style={{ width: 34, height: 34 }} aria-hidden="true">
                      <item.icon size={14} color="var(--sku-amber-hi)" />
                    </div>
                    <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.82rem', color: 'var(--sku-metal-mid)', letterSpacing: '0.02em' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <section style={{ padding: '4rem 1.5rem', textAlign: 'center', background: 'linear-gradient(180deg,#1a1a1a,#111)', borderTop: '2px solid #0a0a0a' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Led color="amber" blink /><Led color="green" blink /><Led color="amber" blink />
          </div>
          <h2 className="sku-heading" style={{ fontSize: 'clamp(1.5rem,4vw,2.4rem)' }}>Ready to Ace Your Interview?</h2>
          <p style={{ fontFamily: 'Roboto Condensed, sans-serif', color: 'var(--sku-metal-dark)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Join thousands of developers who have improved their interview performance with our AI-powered practice system.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/sign-up">
              <Button id="cta-start-btn" size="lg" className="sku-glow-pulse">
                Start Practicing Now <ArrowRight size={16} style={{ marginLeft: 8 }} />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button id="cta-leaderboard-btn" variant="secondary" size="lg">
                <Trophy size={15} style={{ marginRight: 8 }} /> View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
