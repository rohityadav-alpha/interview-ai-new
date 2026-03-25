// src/app/interview/new/page.tsx
// Skeuomorphic New Interview Setup — physical hardware config panel.

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2, Brain, Zap, Code, Database, Cpu, Terminal,
  Target, ArrowRight, AlertCircle, Info,
} from 'lucide-react';
import { toast } from 'sonner';

/* ── Data ─────────────────────────────────────────────────── */
const SKILLS = [
  { value: 'JavaScript', icon: Code },
  { value: 'TypeScript', icon: Code },
  { value: 'React', icon: Code },
  { value: 'Next.js', icon: Terminal },
  { value: 'Node.js', icon: Terminal },
  { value: 'Python', icon: Code },
  { value: 'Java', icon: Code },
  { value: 'C++', icon: Code },
  { value: 'SQL', icon: Database },
  { value: 'MongoDB', icon: Database },
  { value: 'System Design', icon: Cpu },
  { value: 'Data Structures', icon: Brain },
  { value: 'Algorithms', icon: Brain },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', led: 'green' as const, desc: 'Basic concepts & fundamentals' },
  { value: 'medium', label: 'Medium', led: 'amber' as const, desc: 'Intermediate level questions' },
  { value: 'hard', label: 'Hard', led: 'red' as const, desc: 'Advanced & complex topics' },
];

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

/* ── Page ─────────────────────────────────────────────────── */
export default function NewInterviewPage() {
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading, userName } = useCustomAuth();
  const [skill, setSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (!authLoading && !isSignedIn) router.push('/sign-in');
  }, [authLoading, isSignedIn, router]);

  const handleStartInterview = async () => {
    const selectedSkill = showCustomInput ? customSkill.trim() : skill;
    if (!selectedSkill) {
      setError('Please select or enter a skill');
      toast.error('Please select or enter a skill');
      return;
    }
    try {
      setIsStarting(true);
      setError('');
      const loadingToast = toast.loading('Initializing interview session...');
      const response = await fetch('/api/interviews/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: selectedSkill, difficulty }),
      });
      toast.dismiss(loadingToast);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start interview');
      }
      const data = await response.json();
      if (data.success && data.interviewId) {
        toast.success('Session initialized — Good luck!');
        router.push(`/interview/${data.interviewId}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start interview. Please try again.');
      toast.error(err.message || 'Failed to start interview');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSkillSelect = (s: string) => {
    setSkill(s);
    setShowCustomInput(false);
    setCustomSkill('');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="sku-spinner" style={{ margin: '0 auto 1rem' }} />
          <p className="sku-label">Authenticating…</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  const canStart = !isStarting && (skill || (showCustomInput && customSkill.trim()));

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div
        style={{
          background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 5px), linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
          borderBottom: '3px solid #0d0d0d',
          padding: '1.5rem',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="sku-screw" aria-hidden="true" />
          <span className="sku-led sku-led-amber sku-led-blink" />
          <h1 className="sku-heading" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
            Configure New Session — {userName}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Error alert ──────────────────────────────────────── */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0.75rem 1rem',
              background: '#1f0000',
              border: '1px solid #5a0000',
              borderRadius: 5,
              boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            <AlertCircle size={16} color="#ff6060" style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.82rem', color: '#ff6060' }}>
              {error}
            </span>
          </div>
        )}

        {/* ── Skill Selection ──────────────────────────────────── */}
        <Card>
          <CardHeader style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sku-screw" aria-hidden="true" />
              <Led color={skill ? 'green' : 'off'} />
              <span className="sku-label">Step 1 — Select Skill Module</span>
            </div>
            <span className="sku-screw" aria-hidden="true" />
          </CardHeader>

          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
              {SKILLS.map((s) => {
                const isSelected = skill === s.value && !showCustomInput;
                return (
                  <button
                    key={s.value}
                    id={`skill-${s.value.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleSkillSelect(s.value)}
                    disabled={isStarting}
                    style={{
                      padding: '0.7rem 0.5rem', borderRadius: 5,
                      border: isSelected ? '1px solid rgba(212,130,10,0.6)' : '1px solid #1a1a1a',
                      borderTop: isSelected ? '1px solid rgba(212,130,10,0.8)' : '1px solid #333',
                      background: isSelected ? 'linear-gradient(145deg,#2a1800,#1a1000)' : 'linear-gradient(145deg,#2e2e2e,#222)',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      boxShadow: isSelected ? '2px 2px 6px rgba(0,0,0,0.6),0 0 10px rgba(212,130,10,0.2)' : '2px 2px 6px rgba(0,0,0,0.6)',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <div className="sku-knob" style={{ width: 34, height: 34 }} aria-hidden="true">
                      <s.icon size={13} color={isSelected ? 'var(--sku-amber-hi)' : 'var(--sku-metal-dark)'} />
                    </div>
                    <span className="sku-label" style={{ color: isSelected ? 'var(--sku-amber-hi)' : 'var(--sku-metal-dark)', textAlign: 'center', fontSize: '0.6rem', lineHeight: 1.2 }}>
                      {s.value}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom skill */}
            <div style={{ borderTop: '1px solid #222', paddingTop: '1rem' }}>
              {!showCustomInput ? (
                <Button variant="outline" className="w-full" disabled={isStarting}
                  onClick={() => { setShowCustomInput(true); setSkill(''); }}
                  style={{ justifyContent: 'center', borderStyle: 'dashed', width: '100%' }}
                >
                  + Enter Custom Skill
                </Button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Label htmlFor="custom-skill-input">Custom Skill</Label>
                  <Input
                    id="custom-skill-input"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="e.g., GraphQL, Docker, AWS…"
                    disabled={isStarting}
                  />
                  <Button variant="ghost" size="sm" style={{ alignSelf: 'flex-start' }}
                    onClick={() => { setShowCustomInput(false); setCustomSkill(''); }}
                  >
                    ← Back to preset skills
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Difficulty Selection ─────────────────────────────── */}
        <Card>
          <CardHeader style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sku-screw" aria-hidden="true" />
              <Led color="amber" />
              <span className="sku-label">Step 2 — Set Difficulty Level</span>
            </div>
            <span className="sku-screw" aria-hidden="true" />
          </CardHeader>

          <CardContent style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem' }}>
            {DIFFICULTIES.map((d) => {
              const isSelected = difficulty === d.value;
              return (
                <button
                  key={d.value}
                  id={`difficulty-${d.value}`}
                  onClick={() => { setDifficulty(d.value); toast.success(`Difficulty: ${d.label}`); }}
                  disabled={isStarting}
                  style={{
                    padding: '1rem',
                    borderRadius: 5,
                    border: isSelected ? '1px solid rgba(212,130,10,0.5)' : '1px solid #1a1a1a',
                    borderTop: isSelected ? '1px solid rgba(212,130,10,0.7)' : '1px solid #333',
                    background: isSelected
                      ? 'linear-gradient(145deg, #2a1800, #1a1000)'
                      : 'linear-gradient(145deg, #2e2e2e, #222)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: isSelected
                      ? '2px 2px 8px rgba(0,0,0,0.7), 0 0 12px rgba(212,130,10,0.2)'
                      : '2px 2px 6px rgba(0,0,0,0.6)',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Led color={isSelected ? d.led : 'off'} />
                    <span
                      className="sku-heading"
                      style={{
                        fontSize: '0.9rem',
                        color: isSelected ? 'var(--sku-amber-hi)' : 'var(--sku-metal-mid)',
                      }}
                    >
                      {d.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'Roboto Condensed, sans-serif',
                      fontSize: '0.72rem',
                      color: 'var(--sku-metal-dark)',
                      textAlign: 'center',
                    }}
                  >
                    {d.desc}
                  </span>
                  {/* VU meter when selected */}
                  {isSelected && (
                    <div className="sku-meter-track" style={{ width: '100%', height: 8 }}>
                      <div
                        className={`sku-meter-fill${d.led === 'amber' ? ' sku-meter-fill-amber' : ''}`}
                        style={{
                          width: d.value === 'easy' ? '33%' : d.value === 'medium' ? '66%' : '100%',
                          background: d.led === 'red'
                            ? 'linear-gradient(90deg, #660000 0%, #cc2222 60%, #ff8080 100%)'
                            : undefined,
                        }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* ── Info panel ───────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <Led color="green" />
            <span className="sku-label">Session Specifications</span>
          </CardHeader>
          <CardContent style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.6rem' }}>
            {[
              { icon: Brain, text: '10 AI-generated questions tailored to your skill' },
              { icon: Zap, text: 'Real-time scoring with detailed feedback' },
              { icon: Target, text: 'Strengths, improvements & confidence tips' },
              { icon: Info, text: 'Full performance report at session end' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem' }}>
                <div className="sku-knob" style={{ width: 28, height: 28, flexShrink: 0 }}>
                  <f.icon size={11} color="var(--sku-green-lcd)" />
                </div>
                <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.75rem', color: 'var(--sku-metal-dark)' }}>
                  {f.text}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Launch button ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem' }}>
          <Button
            id="launch-interview-btn"
            onClick={handleStartInterview}
            disabled={!canStart}
            size="lg"
            className={canStart ? 'sku-glow-pulse' : ''}
            style={{ width: '100%', maxWidth: 360, justifyContent: 'center' }}
          >
            {isStarting ? (
              <><Loader2 size={16} style={{ marginRight: 8, animation: 'sku-spin 0.8s linear infinite' }} /> Initializing…</>
            ) : (
              <><Zap size={16} style={{ marginRight: 8 }} /> Launch Interview Session <ArrowRight size={16} style={{ marginLeft: 8 }} /></>
            )}
          </Button>
          {!canStart && !isStarting && (
            <span className="sku-label" style={{ color: 'var(--sku-amber-hi)' }}>↑ Please select a skill to continue</span>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
