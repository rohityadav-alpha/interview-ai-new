// src/app/interview/[id]/page.tsx
// Skeuomorphic Interview Session — physical recorder/terminal aesthetic.
// Features: LCD question display, VU progress meter, physical submit/nav buttons, LED recording indicator.

'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import {
  Mic, MicOff, ChevronLeft, ChevronRight,
  Send, Loader2, AlertCircle, Clock,
  Keyboard, Volume2, CheckCircle, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import SimpleFaceTracker from '@/components/SimpleFaceTracker';

interface Question {
  id: number;
  questionNumber: number;
  question: string;
  userAnswer: string | null;
}

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

/* ── Main page ─────────────────────────────────────────────── */
export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useCustomAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<number>>(new Set());
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('text');

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!authLoading && !isSignedIn) router.push('/sign-in');
  }, [authLoading, isSignedIn, router]);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimeSpent(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime]);

  useEffect(() => {
    async function fetchQuestions() {
      if (!isSignedIn) return;
      try {
        const res = await fetch(`/api/interviews/${id}/questions`);
        if (!res.ok) throw new Error('Failed to fetch questions');
        const data = await res.json();
        setQuestions(data.questions || []);
        if (data.questions?.[0]?.userAnswer) setCurrentAnswer(data.questions[0].userAnswer);
        toast.success('Session loaded!');
      } catch {
        setError('Failed to load interview questions');
        toast.error('Failed to load interview');
      } finally { setIsLoading(false); }
    }
    if (isSignedIn && !authLoading) fetchQuestions();
  }, [isSignedIn, authLoading, id]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      setCurrentAnswer(questions[currentIndex].userAnswer || '');
      setError('');
      if (inputMode === 'voice' && isRecording) toggleRecording();
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SR = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const t = Array.from(event.results).map((r: any) => r[0].transcript).join('');
        setCurrentAnswer(t);
      };
      recognitionRef.current.onend = () => { isRecordingRef.current = false; setIsRecording(false); };
      recognitionRef.current.onerror = () => { isRecordingRef.current = false; setIsRecording(false); toast.error('Voice recognition error'); };
    }
    return () => { try { recognitionRef.current?.stop(); } catch { } };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) { toast.error('Speech not supported in this browser'); return; }
    if (isRecordingRef.current) {
      try { recognitionRef.current.stop(); } catch { }
      isRecordingRef.current = false; setIsRecording(false);
    } else {
      try {
        setInputMode('voice');
        recognitionRef.current.start();
        isRecordingRef.current = true; setIsRecording(true);
        toast.success('Recording… Speak now!');
      } catch (e: any) {
        if (e.message?.includes('already started')) { isRecordingRef.current = true; setIsRecording(true); }
        else toast.error('Failed to start recording');
      }
    }
  };

  const switchToTextMode = () => {
    if (isRecording) toggleRecording();
    setInputMode('text');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSubmitAnswer = async () => {
    const answer = currentAnswer.trim();
    if (!answer) { setError('Please provide an answer'); toast.error('Please provide an answer'); return; }
    try {
      setIsSubmitting(true); setError('');
      if (isRecordingRef.current) { try { recognitionRef.current?.stop(); } catch { } isRecordingRef.current = false; setIsRecording(false); }
      const toastId = toast.loading('Submitting answer…');
      const res = await fetch(`/api/interviews/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: questions[currentIndex].id, answer }),
      });
      if (!res.ok) throw new Error('Failed to submit answer');
      const data = await res.json();
      toast.dismiss(toastId);
      toast.success(`Score: ${data.score}/10`, { description: data.feedback?.substring(0, 100) + '…', duration: 5000 });
      setSubmittedAnswers(prev => new Set([...prev, questions[currentIndex].id]));
      if (currentIndex < questions.length - 1) {
        setTimeout(() => { setCurrentIndex(currentIndex + 1); setCurrentAnswer(''); setInputMode('text'); }, 1000);
      } else {
        setTimeout(() => completeInterview(), 1500);
      }
    } catch {
      setError('Failed to submit. Please try again.');
      toast.error('Failed to submit answer');
    } finally { setIsSubmitting(false); }
  };

  const completeInterview = async () => {
    try {
      toast.loading('Compiling report…');
      const res = await fetch(`/api/interviews/${id}/complete`, { method: 'POST' });
      if (res.ok) { toast.success('Session complete! Redirecting…'); setTimeout(() => router.push(`/reports/${id}`), 1000); }
    } catch { setError('Failed to complete interview'); toast.error('Failed to complete interview'); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  /* Loading / error states */
  if (authLoading || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="sku-spinner" style={{ margin: '0 auto 1rem' }} />
          <p className="sku-label">Loading Session…</p>
        </div>
      </div>
    );
  }
  if (!isSignedIn) return null;
  if (error && questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="sku-card" style={{ maxWidth: 440, padding: 0, overflow: 'hidden' }}>
          <div className="sku-card-header"><AlertCircle size={16} color="#ff6060" /><span className="sku-label" style={{ color: '#ff6060' }}>Error Loading Session</span></div>
          <div style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <p style={{ fontFamily: 'Roboto Condensed', color: 'var(--sku-metal-mid)', fontSize: '0.85rem' }}>{error}</p>
            <button className="sku-btn sku-btn-secondary" onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }
  if (questions.length === 0) return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p className="sku-label">No questions available</p>
    </div>
  );

  const currentQuestion = questions[currentIndex];
  const isSubmitted = submittedAnswers.has(currentQuestion.id);

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      <SimpleFaceTracker isInterviewActive={!isSubmitting && questions.length > 0} />

      {/* ── Session header bar ─────────────────────────────────── */}
      <div
        style={{
          background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 5px), linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
          borderBottom: '3px solid #0d0d0d',
          padding: '0.9rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="sku-screw" aria-hidden="true" />
          <Led color="green" blink />
          <span className="sku-heading" style={{ fontSize: '0.9rem' }}>Interview in Progress</span>
        </div>
        {/* Timer LCD */}
        <div className="sku-lcd" style={{ padding: '0.3rem 0.85rem', position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={12} style={{ flexShrink: 0, color: 'var(--sku-green-lcd)' }} />
          <span>{formatTime(timeSpent)}</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ── Progress VU meter ─────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="sku-label">Question {currentIndex + 1} of {questions.length}</span>
            <span className="sku-label">{Math.round(progressPct)}% Complete</span>
          </div>
          <div className="sku-meter-track" style={{ height: 12 }}>
            <div className="sku-meter-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* ── Error alert ──────────────────────────────────────── */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', background: '#1f0000', border: '1px solid #5a0000', borderRadius: 5 }}>
            <AlertCircle size={15} color="#ff6060" style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: 'Roboto Condensed', fontSize: '0.82rem', color: '#ff6060' }}>{error}</span>
          </div>
        )}

        {/* ── Question card ───────────────────────────────────────── */}
        <div className="sku-card" style={{ overflow: 'hidden' }}>
          <div className="sku-card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Led color={isSubmitted ? 'green' : 'amber'} blink={!isSubmitted} />
              <span className="sku-label">Question {currentIndex + 1}</span>
            </div>
            {isSubmitted && (
              <span className="sku-badge sku-badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={10} />
                Submitted
              </span>
            )}
          </div>

          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Question LCD */}
            <div className="sku-lcd" style={{ position: 'relative', lineHeight: 1.7, fontSize: '0.9rem', padding: '1rem 1.2rem' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>{currentQuestion.question}</div>
            </div>

            {/* Input mode toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                background: 'linear-gradient(145deg, #1e1e1e, #161616)',
                border: '1px solid #1a1a1a',
                borderRadius: 5,
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.6)',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <span className="sku-label">Input Mode</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  id="text-mode-btn"
                  onClick={switchToTextMode}
                  disabled={isSubmitting}
                  className={`sku-btn ${inputMode === 'text' ? 'sku-nav-active' : 'sku-btn-ghost'}`}
                  style={{ fontSize: '0.68rem', padding: '0.3rem 0.75rem' }}
                >
                  <Keyboard size={12} style={{ marginRight: 5 }} />
                  Text
                </button>
                <button
                  id="voice-mode-btn"
                  onClick={() => { setInputMode('voice'); toast.info('Click Start Recording to use voice'); }}
                  disabled={isSubmitting}
                  className={`sku-btn ${inputMode === 'voice' ? 'sku-nav-active' : 'sku-btn-ghost'}`}
                  style={{ fontSize: '0.68rem', padding: '0.3rem 0.75rem' }}
                >
                  <Volume2 size={12} style={{ marginRight: 5 }} />
                  Voice
                </button>
              </div>
            </div>

            {/* Answer textarea */}
            <div style={{ position: 'relative' }}>
              <textarea
                ref={textareaRef}
                id="answer-textarea"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={inputMode === 'voice' ? "Click 'Start Recording' or type here to edit…" : 'Type your answer here…'}
                disabled={isSubmitting}
                rows={7}
                style={{
                  width: '100%',
                  background: '#111',
                  border: '1px solid #1a1a1a',
                  borderTop: '1px solid #0a0a0a',
                  boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.8), inset -1px -1px 4px rgba(255,255,255,0.04)',
                  color: 'var(--sku-metal-light)',
                  fontFamily: 'Roboto Condensed, sans-serif',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  padding: '0.85rem 1rem',
                  borderRadius: 4,
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.borderColor = 'var(--sku-amber)';
                  (e.target as HTMLElement).style.boxShadow = 'inset 3px 3px 8px rgba(0,0,0,0.9), 0 0 0 2px rgba(212,130,10,0.2)';
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#1a1a1a';
                  (e.target as HTMLElement).style.boxShadow = 'inset 2px 2px 6px rgba(0,0,0,0.8)';
                }}
              />
              {isRecording && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8, right: 8,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0.25rem 0.65rem',
                    background: '#7a1818',
                    border: '1px solid #aa2222',
                    borderRadius: 20,
                  }}
                >
                  <span className="sku-led sku-led-red sku-led-blink" />
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', color: '#ff9090', textTransform: 'uppercase' }}>
                    Recording
                  </span>
                </div>
              )}
            </div>

            {/* Char count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="sku-label">{currentAnswer.length} chars</span>
              {inputMode === 'voice' && !isRecording && currentAnswer && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Oswald, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sku-amber-hi)' }}>
                  <Keyboard size={11} />
                  Editable
                </span>
              )}
            </div>

            {/* Action buttons row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {/* Voice / Submit */}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  id="record-btn"
                  onClick={toggleRecording}
                  disabled={isSubmitting}
                  className={`sku-btn ${isRecording ? 'sku-btn-danger' : 'sku-btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center', minWidth: 130 }}
                >
                  {isRecording ? <><MicOff size={15} style={{ marginRight: 8 }} />Stop Recording</> : <><Mic size={15} style={{ marginRight: 8 }} />Start Recording</>}
                </button>
                <button
                  id="submit-btn"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !currentAnswer.trim()}
                  className="sku-btn sku-btn-primary"
                  style={{
                    flex: 1, justifyContent: 'center', minWidth: 150,
                    opacity: !currentAnswer.trim() ? 0.45 : 1,
                    cursor: !currentAnswer.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting
                    ? <><Loader2 size={15} style={{ marginRight: 8, animation: 'sku-spin 0.8s linear infinite' }} />Submitting…</>
                    : currentIndex === questions.length - 1
                    ? <><Send size={15} style={{ marginRight: 8 }} />Submit & Finish</>
                    : <><Send size={15} style={{ marginRight: 8 }} />Submit Answer</>
                  }
                </button>
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  id="prev-btn"
                  onClick={() => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); }}
                  disabled={currentIndex === 0 || isSubmitting}
                  className="sku-btn sku-btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', opacity: currentIndex === 0 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={16} style={{ marginRight: 4 }} />
                  Previous
                </button>
                <button
                  id="next-btn"
                  onClick={() => { if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1); }}
                  disabled={currentIndex === questions.length - 1 || isSubmitting}
                  className="sku-btn sku-btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', opacity: currentIndex === questions.length - 1 ? 0.4 : 1 }}
                >
                  Next
                  <ChevronRight size={16} style={{ marginLeft: 4 }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tips panel ─────────────────────────────────────────── */}
        <div className="sku-card" style={{ overflow: 'hidden' }}>
          <div className="sku-card-header">
            <Led color="green" />
            <Sparkles size={12} color="var(--sku-amber-hi)" />
            <span className="sku-label">Session Tips</span>
          </div>
          <div style={{ padding: '0.85rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.4rem' }}>
            {[
              'Navigate between questions using Previous / Next',
              'Use voice recording OR type — both work',
              'Voice mode: Record → edit text → submit',
              'Eye tracking monitors your eye contact',
              'Submit each answer to get instant AI feedback',
              'No time limit — take your time',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--sku-metal-dark)', marginTop: 5, flexShrink: 0 }} />
                <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.72rem', color: 'var(--sku-metal-dark)', lineHeight: 1.4 }}>
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
