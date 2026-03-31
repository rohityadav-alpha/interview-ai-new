// src/app/interview/[id]/page.tsx
// Real-time conversational AI interview with voice I/O, eye tracking, and live feedback.
'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import VoiceInterface from '@/components/VoiceInterface';
import AdvancedFaceTracker from '@/components/AdvancedFaceTracker';
import {
  Clock, AlertCircle, CheckCircle, ChevronRight,
  SkipForward, Mic, Keyboard, RotateCcw, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────
interface Question {
  id: number;
  questionNumber: number;
  question: string;
  userAnswer: string | null;
  aiScore: number | null;
  aiFeedback: string | null;
}

interface FeedbackPanel {
  score: number;
  spokenResponse: string;
  verboseFeedback: string;
  strengths: string[];
  improvements: string[];
}

type InterviewPhase =
  | 'loading'
  | 'intro'           // brief "session starting" screen
  | 'asking'          // AI speaks the question
  | 'listening'       // waiting for user to answer
  | 'processing'      // submitting to AI
  | 'feedback'        // AI speaks/displays feedback
  | 'done';           // all questions complete

// ── Sub-components ──────────────────────────────────────────
function Led({ color, blink }: { color: 'green' | 'amber' | 'red' | 'off'; blink?: boolean }) {
  return <span className={`sku-led sku-led-${color}${blink ? ' sku-led-blink' : ''}`} style={{ display: 'inline-block', flexShrink: 0 }} aria-hidden="true" />;
}

function PhaseLabel({ phase }: { phase: InterviewPhase }) {
  const map: Record<InterviewPhase, { label: string; color: string }> = {
    loading:    { label: 'Loading…',           color: '#777' },
    intro:      { label: 'Initializing',       color: '#d4820a' },
    asking:     { label: 'AI Speaking',        color: '#00ff41' },
    listening:  { label: 'Listening',          color: '#d4820a' },
    processing: { label: 'Analysing',          color: '#d4820a' },
    feedback:   { label: 'AI Feedback',        color: '#00ff41' },
    done:       { label: 'Session Complete',   color: '#00ff41' },
  };
  const { label, color } = map[phase];
  return (
    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.12em', color }}>
      {label}
    </span>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useCustomAuth();

  // session data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [skill, setSkill] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<InterviewPhase>('loading');
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textAnswer, setTextAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackPanel | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [submittedIds, setSubmittedIds] = useState<Set<number>>(new Set());

  // conversation history (interviewer + candidate turns)
  const historyRef = useRef<{ role: 'interviewer' | 'candidate'; text: string }[]>([]);
  const phaseRef = useRef<InterviewPhase>('loading');
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Keep an up-to-date ref for submitAnswer to bypass stale closures
  const submitAnswerRef = useRef<(text: string) => void>(() => {});

  // ── Voice engine ───────────────────────────────────────────
  const {
    state: voiceState, setState: setVoiceState,
    liveText, setLiveText, volume,
    isSpeechSupported, isTTSSupported,
    startListening, stopListening,
    speak, cancelSpeech,
  } = useVoiceEngine({
    silenceMs: 2500,
    onSilenceCommit: useCallback((text: string) => {
      if (phaseRef.current === 'listening' && inputMode === 'voice') {
        submitAnswerRef.current(text);
      }
    }, [inputMode]),
  });

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTimeSpent(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  // ── Auth guard ─────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isSignedIn) router.push('/sign-in');
  }, [authLoading, isSignedIn, router]);

  // ── Load questions ─────────────────────────────────────────
  useEffect(() => {
    if (!isSignedIn || authLoading) return;
    (async () => {
      try {
        const res = await fetch(`/api/interviews/${id}/questions`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setQuestions(data.questions || []);
        setSkill(data.interview?.skill || '');
        setDifficulty(data.interview?.difficulty || 'medium');
        setPhase('intro');
      } catch {
        toast.error('Failed to load interview');
        setPhase('done');
      }
    })();
  }, [isSignedIn, authLoading, id]);

  // ── Kick-off: speak intro then ask Q1 ─────────────────────
  useEffect(() => {
    if (phase !== 'intro' || questions.length === 0) return;
    const introText = `Welcome to your ${difficulty} ${skill} interview. I will ask you ${questions.length} questions. Please answer when the microphone activates. You can also type your answer below. Let's begin.`;
    setPhase('asking');
    speak(introText, () => askQuestion(0));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questions]);

  // ── Ask a question (speak it, then start listening) ────────
  const askQuestion = useCallback((index: number) => {
    if (index >= questions.length) return;
    const q = questions[index];
    setCurrentIndex(index);
    setFeedback(null);
    setTextAnswer('');
    setLiveText('');
    setPhase('asking');

    historyRef.current.push({ role: 'interviewer', text: q.question });

    speak(`Question ${index + 1}. ${q.question}`, () => {
      setPhase('listening');
      if (inputMode === 'voice') startListening();
    });
  }, [questions, speak, startListening, inputMode, setLiveText]);

  // ── Submit answer (voice or text) ─────────────────────────
  const submitAnswer = useCallback(async (answer: string) => {
    if (phaseRef.current === 'processing' || phaseRef.current === 'feedback') return;
    const trimmed = answer.trim();
    if (!trimmed) { toast.error('Please provide an answer'); return; }

    console.log("🔥 Processing answer:", trimmed);

    // 1. Always stop mic before processing
    stopListening();
    cancelSpeech();
    
    setPhase('processing');
    setVoiceState('processing');
    setLiveText(trimmed);

    // FIX: Grab fresh question (prevent crashing on undefined if stale closure)
    const q = questions[currentIndex];
    if (!q) {
      console.error("❌ Stale state detected: q is undefined");
      toast.error("An error occurred passing the question.");
      setPhase('listening');
      setVoiceState('idle');
      return;
    }

    historyRef.current.push({ role: 'candidate', text: trimmed });

    console.log("📡 Calling API...");

    try {
      const res = await fetch(`/api/interviews/${id}/converse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: q.id,
          answer: trimmed,
          conversationHistory: historyRef.current.slice(-10), // last 5 turns context
        }),
      });
      if (!res.ok) throw new Error('API error');
      
      const data = await res.json();
      console.log("✅ API response received");

      setSubmittedIds(prev => new Set([...prev, q.id]));
      setFeedback({
        score: data.score,
        spokenResponse: data.spokenResponse,
        verboseFeedback: data.verboseFeedback,
        strengths: data.strengths,
        improvements: data.improvements,
      });

      historyRef.current.push({ role: 'interviewer', text: data.spokenResponse });
      setPhase('feedback');

      // Speak AI feedback, then advance
      speak(data.spokenResponse, () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < questions.length) {
          setTimeout(() => askQuestion(nextIndex), 800);
        } else {
          setPhase('done');
          setSessionComplete(true);
          completeInterview();
        }
      });

    } catch (err: any) {
      console.error("❌ API Call Failed", err.message);
      toast.error('Failed to evaluate answer');
      setPhase('listening');
      setVoiceState('idle');
    }
  }, [questions, currentIndex, id, stopListening, cancelSpeech, speak, askQuestion]);

  // Sync ref to latest function instance
  useEffect(() => { submitAnswerRef.current = submitAnswer; }, [submitAnswer]);

  // ── Handle text mode submit ────────────────────────────────
  const handleTextSubmit = () => {
    if (textAnswer.trim()) submitAnswer(textAnswer);
  };

  // ── Skip question ──────────────────────────────────────────
  const handleSkip = () => {
    stopListening();
    cancelSpeech();
    const next = currentIndex + 1;
    if (next < questions.length) {
      askQuestion(next);
    } else {
      setPhase('done');
      setSessionComplete(true);
      completeInterview();
    }
  };

  // ── Replay current question ───────────────────────────────
  const handleReplay = () => {
    if (phase === 'listening' || phase === 'asking') {
      stopListening();
      cancelSpeech();
      askQuestion(currentIndex);
    }
  };

  // ── Complete interview ────────────────────────────────────
  const completeInterview = async () => {
    try {
      const res = await fetch(`/api/interviews/${id}/complete`, { method: 'POST' });
      if (res.ok) {
        toast.success('Session complete! Generating report…');
        setTimeout(() => router.push(`/reports/${id}`), 2500);
      }
    } catch { toast.error('Failed to finalize session'); }
  };

  // ── Toggle mic ───────────────────────────────────────────
  const handleToggleMic = () => {
    if (phase !== 'listening') return;
    if (voiceState === 'listening') {
      stopListening();
    } else {
      setLiveText('');
      startListening();
    }
  };

  // ── Switch to text mode ──────────────────────────────────
  const switchToText = () => {
    stopListening();
    setInputMode('text');
  };

  const switchToVoice = () => {
    setInputMode('voice');
    if (phase === 'listening') startListening();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // ── Render ───────────────────────────────────────────────
  if (authLoading || phase === 'loading') {
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

  const currentQuestion = questions[currentIndex];
  const isSubmitted = currentQuestion && submittedIds.has(currentQuestion.id);
  const canSkip = phase === 'listening' || (phase === 'feedback' && !sessionComplete);
  const canReplay = phase === 'listening' || phase === 'asking';

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>

      {/* ── Advanced face tracker (fixed bottom-right) ─── */}
      <AdvancedFaceTracker isActive={(['intro','asking','listening','processing','feedback'] as InterviewPhase[]).includes(phase)} compact />

      {/* ── Session header bar ────────────────────────── */}
      <div style={{
        background: 'repeating-linear-gradient(90deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 5px),linear-gradient(180deg,#3a3a3a 0%,#2a2a2a 100%)',
        borderBottom: '3px solid #0d0d0d',
        padding: '0.9rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="sku-screw" aria-hidden="true" />
          <Led
            color={phase === 'listening' ? 'red' : phase === 'asking' || phase === 'feedback' ? 'green' : 'amber'}
            blink={phase !== 'done'}
          />
          <span className="sku-heading" style={{ fontSize: '0.9rem' }}>{skill} Interview</span>
          <span style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, padding: '0.15rem 0.45rem', fontFamily: 'Oswald', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#777' }}>
            {difficulty}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <PhaseLabel phase={phase} />
          {/* Timer LCD */}
          <div className="sku-lcd" style={{ padding: '0.25rem 0.75rem', position: 'relative', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={11} style={{ color: 'var(--sku-green-lcd)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem' }}>{formatTime(timeSpent)}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ── Progress meter ─────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span className="sku-label">Question {currentIndex + 1} of {questions.length}</span>
            <span className="sku-label">{submittedIds.size} answered</span>
          </div>
          <div className="sku-meter-track" style={{ height: 10 }}>
            <div className="sku-meter-fill" style={{ width: `${progressPct}%`, transition: 'width 600ms ease' }} />
          </div>
          {/* Question dots */}
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            {questions.map((q, i) => (
              <div key={q.id} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: submittedIds.has(q.id) ? '#00ff41' : i === currentIndex ? '#d4820a' : '#2a2a2a',
                border: i === currentIndex ? '1px solid #d4820a' : '1px solid #1a1a1a',
                transition: 'background 400ms ease',
                boxShadow: submittedIds.has(q.id) ? '0 0 4px rgba(0,255,65,0.5)' : 'none',
              }} />
            ))}
          </div>
        </div>

        {/* ── Question card ──────────────────────────── */}
        <div className="sku-card" style={{ overflow: 'hidden' }}>
          <div className="sku-card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Led color={isSubmitted ? 'green' : phase === 'listening' ? 'red' : 'amber'} blink={phase === 'listening'} />
              <span className="sku-label">Question {currentIndex + 1}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isSubmitted && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Oswald, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00ff41' }}>
                  <CheckCircle size={10} /> Answered
                </span>
              )}
              <span className="sku-screw" aria-hidden="true" />
            </div>
          </div>

          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Question text LCD */}
            <div className="sku-lcd" style={{ position: 'relative', lineHeight: 1.7, fontSize: '0.92rem', padding: '0.9rem 1.1rem', transition: 'opacity 300ms ease', opacity: phase === 'asking' ? 0.7 : 1 }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                {phase === 'asking' && (
                  <span style={{ marginRight: 8, fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#00ff41', animation: 'blink 0.8s step-end infinite' }}>▶</span>
                )}
                {currentQuestion?.question}
              </div>
            </div>

            {/* ── Input mode toggle ─────────────────── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.5rem', borderRadius: 5,
              background: 'linear-gradient(145deg,#1a1a1a,#141414)',
              border: '1px solid #1e1e1e',
            }}>
              <span className="sku-label" style={{ marginRight: 'auto' }}>Input Mode</span>
              <button
                onClick={switchToVoice}
                disabled={phase === 'processing' || phase === 'feedback' || phase === 'asking'}
                style={{
                  padding: '0.3rem 0.75rem', borderRadius: 4, cursor: 'pointer', border: 'none',
                  background: inputMode === 'voice' ? 'linear-gradient(145deg,#2a1800,#1a1000)' : 'transparent',
                  color: inputMode === 'voice' ? '#d4820a' : '#555',
                  fontFamily: 'Oswald, sans-serif', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 5,
                  boxShadow: inputMode === 'voice' ? '0 0 8px rgba(212,130,10,0.15)' : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                <Mic size={11} /> Voice
              </button>
              <button
                onClick={switchToText}
                disabled={phase === 'processing' || phase === 'feedback' || phase === 'asking'}
                style={{
                  padding: '0.3rem 0.75rem', borderRadius: 4, cursor: 'pointer', border: 'none',
                  background: inputMode === 'text' ? 'linear-gradient(145deg,#1a2a00,#111a00)' : 'transparent',
                  color: inputMode === 'text' ? '#90c040' : '#555',
                  fontFamily: 'Oswald, sans-serif', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 150ms ease',
                }}
              >
                <Keyboard size={11} /> Text
              </button>
            </div>

            {/* ── Voice interface ───────────────────── */}
            {inputMode === 'voice' && (
              <VoiceInterface
                state={voiceState}
                volume={volume}
                liveText={liveText}
                onToggleMic={handleToggleMic}
                disabled={phase !== 'listening'}
              />
            )}

            {/* ── Text input ────────────────────────── */}
            {inputMode === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <textarea
                  id="text-answer"
                  value={textAnswer}
                  onChange={e => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here…"
                  disabled={phase !== 'listening'}
                  rows={6}
                  style={{
                    width: '100%', background: '#111',
                    border: '1px solid #1a1a1a', borderTop: '1px solid #0a0a0a',
                    boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.8),inset -1px -1px 4px rgba(255,255,255,0.04)',
                    color: 'var(--sku-metal-light)',
                    fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.9rem', lineHeight: 1.6,
                    padding: '0.85rem 1rem', borderRadius: 4, resize: 'vertical', outline: 'none',
                    opacity: phase !== 'listening' ? 0.5 : 1,
                    transition: 'all 150ms ease',
                  }}
                  onFocus={e => {
                    (e.target as HTMLElement).style.borderColor = 'var(--sku-amber)';
                    (e.target as HTMLElement).style.boxShadow = 'inset 3px 3px 8px rgba(0,0,0,0.9),0 0 0 2px rgba(212,130,10,0.2)';
                  }}
                  onBlur={e => {
                    (e.target as HTMLElement).style.borderColor = '#1a1a1a';
                    (e.target as HTMLElement).style.boxShadow = 'inset 2px 2px 6px rgba(0,0,0,0.8)';
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleTextSubmit(); }}
                />
                <button
                  id="text-submit-btn"
                  onClick={handleTextSubmit}
                  disabled={!textAnswer.trim() || phase !== 'listening'}
                  className="sku-btn sku-btn-primary"
                  style={{ justifyContent: 'center', opacity: (!textAnswer.trim() || phase !== 'listening') ? 0.45 : 1 }}
                >
                  {phase === 'processing'
                    ? <><Loader2 size={15} style={{ marginRight: 8, animation: 'sku-spin 0.8s linear infinite' }} />Submitting…</>
                    : <><ChevronRight size={15} style={{ marginRight: 6 }} />Submit Answer <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', marginLeft: 8, color: '#888' }}>Ctrl+Enter</span></>
                  }
                </button>
              </div>
            )}

            {/* ── Action controls ───────────────────── */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleReplay}
                disabled={!canReplay}
                className="sku-btn sku-btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.72rem', padding: '0.45rem 0.75rem', opacity: canReplay ? 1 : 0.35 }}
              >
                <RotateCcw size={13} style={{ marginRight: 5 }} /> Replay Question
              </button>
              <button
                onClick={handleSkip}
                disabled={!canSkip}
                className="sku-btn sku-btn-ghost"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.72rem', padding: '0.45rem 0.75rem', opacity: canSkip ? 1 : 0.35 }}
              >
                <SkipForward size={13} style={{ marginRight: 5 }} /> Skip
              </button>
            </div>

            {/* ── Compatibility warning ─────────────── */}
            {!isSpeechSupported && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0.85rem', background: '#1a0f00', border: '1px solid #3a2000', borderRadius: 4 }}>
                <AlertCircle size={14} color="#d4820a" />
                <span style={{ fontFamily: 'Roboto Condensed', fontSize: '0.75rem', color: '#d4820a' }}>
                  Speech recognition not supported in this browser. Use Chrome for voice mode.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Feedback panel ────────────────────────── */}
        {feedback && (
          <div className="sku-card" style={{ overflow: 'hidden', transition: 'opacity 300ms ease', opacity: feedback ? 1 : 0 }}>
            <div className="sku-card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Led color="green" blink={phase === 'feedback'} />
                <span className="sku-label">AI Feedback — Q{currentIndex + 1}</span>
              </div>
              {/* Score LCD */}
              <div className="sku-lcd" style={{ padding: '0.25rem 0.75rem', position: 'relative', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', color: 'var(--sku-green-lcd-dim)' }}>SCORE</span>
                <span style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '1.1rem',
                  color: feedback.score >= 8 ? '#00ff41' : feedback.score >= 5 ? '#d4820a' : '#ff4040',
                  textShadow: '0 0 8px currentColor',
                }}>
                  {feedback.score}/10
                </span>
              </div>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Score meter */}
              <div className="sku-meter-track" style={{ height: 10 }}>
                <div
                  className={`sku-meter-fill${feedback.score < 8 ? ' sku-meter-fill-amber' : ''}`}
                  style={{
                    width: `${feedback.score * 10}%`,
                    background: feedback.score < 5 ? 'linear-gradient(90deg,#660000,#cc2222,#ff4040)' : undefined,
                    transition: 'width 800ms ease',
                  }}
                />
              </div>

              {/* Verbose feedback */}
              <div style={{ padding: '0.75rem 0.9rem', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 4, boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.6)' }}>
                <p style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.83rem', color: '#bbb', lineHeight: 1.6 }}>
                  {feedback.verboseFeedback}
                </p>
              </div>

              {/* Strengths & improvements */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div className="sku-label" style={{ marginBottom: 6, color: '#00ff41' }}>Strengths</div>
                  {feedback.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 3 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ff41', flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontFamily: 'Roboto Condensed', fontSize: '0.73rem', color: '#90c090', lineHeight: 1.4 }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="sku-label" style={{ marginBottom: 6, color: '#d4820a' }}>Improvements</div>
                  {feedback.improvements.map((imp, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 3 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d4820a', flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontFamily: 'Roboto Condensed', fontSize: '0.73rem', color: '#c0a060', lineHeight: 1.4 }}>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI speaking indicator */}
              {phase === 'feedback' && voiceState === 'speaking' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.4rem 0.75rem', background: '#081008', border: '1px solid #0d2a0d', borderRadius: 4 }}>
                  <Led color="green" blink />
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.1em', color: '#00cc33' }}>
                    AI INTERVIEWER SPEAKING…
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Done card ─────────────────────────────── */}
        {phase === 'done' && sessionComplete && (
          <div className="sku-card" style={{ overflow: 'hidden' }}>
            <div className="sku-card-header">
              <Led color="green" blink />
              <span className="sku-label">Session Complete</span>
            </div>
            <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="sku-knob" style={{ width: 64, height: 64 }}>
                <CheckCircle size={28} color="var(--sku-green-lcd)" />
              </div>
              <h3 className="sku-heading" style={{ fontSize: '1.2rem' }}>Interview Complete!</h3>
              <p style={{ fontFamily: 'Roboto Condensed', color: 'var(--sku-metal-dark)', fontSize: '0.85rem' }}>
                Generating your performance report…
              </p>
              <div className="sku-spinner" />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
