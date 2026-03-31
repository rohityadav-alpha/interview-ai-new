'use client';

import { useEffect, useRef } from 'react';
import type { VoiceState } from '@/hooks/useVoiceEngine';
import { Mic, MicOff, Volume2, Loader2, Waves } from 'lucide-react';

interface Props {
  state: VoiceState;
  volume: number;      // 0-100
  liveText: string;
  onToggleMic: () => void;
  disabled?: boolean;
}

/**
 * Renders:
 * - Mic waveform animation when listening
 * - AI pulsing wave when speaking
 * - Spinner when processing
 * - Live transcription text
 */
export default function VoiceInterface({ state, volume, liveText, onToggleMic, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const volumeRef = useRef(volume);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Waveform canvas animation
  useEffect(() => {
    if (state !== 'listening') { cancelAnimationFrame(rafRef.current); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const amp = 8 + (volumeRef.current / 100) * 24;
      const bars = 28;
      const barW = (W / bars) * 0.5;
      const gap = (W / bars) * 0.5;
      for (let i = 0; i < bars; i++) {
        const x = i * (W / bars) + gap;
        const h = Math.max(4, amp * Math.abs(Math.sin(phase + i * 0.45)));
        const alpha = 0.4 + (h / (amp + 8)) * 0.6;
        ctx.fillStyle = `rgba(212,130,10,${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, (H - h) / 2, barW, h, 2);
        ctx.fill();
      }
      phase += 0.12;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state]);

  const isListening = state === 'listening';
  const isSpeaking  = state === 'speaking';
  const isProcessing = state === 'processing' || state === 'silence';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

      {/* ── Status bar ────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0.6rem 1rem',
        background: 'linear-gradient(145deg,#1a1a1a,#141414)',
        border: '1px solid #222', borderTop: '1px solid #2e2e2e',
        borderRadius: 6,
        boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.7)',
      }}>
        {/* State icon */}
        <div style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isListening  && <Mic  size={20} color="#d4820a" className="animate-pulse" />}
          {isSpeaking   && <Volume2 size={20} color="#00ff41" className="animate-pulse" />}
          {isProcessing && <Loader2 size={20} color="#d4820a" style={{ animation: 'sku-spin 0.8s linear infinite' }} />}
          {state === 'idle' && <MicOff size={20} color="#555" />}
        </div>

        {/* Status text */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            color: isListening ? '#d4820a' : isSpeaking ? '#00ff41' : isProcessing ? '#c0a050' : '#555' }}>
            {isListening  && '● Listening — speak now'}
            {isSpeaking   && '◈ AI Speaking…'}
            {isProcessing && '◌ Analysing your answer…'}
            {state === 'idle' && '○ Microphone off'}
          </div>
          {isListening && (
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.58rem', color: '#888', marginTop: 2 }}>
              Auto-submits after ~2.5s silence
            </div>
          )}
        </div>

        {/* Volume level */}
        {isListening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 2,
                height: 4 + i * 3,
                background: volume > (i / 6) * 100 ? '#d4820a' : '#333',
                transition: 'background 50ms',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* ── Waveform canvas (listening) ───────────────── */}
      {isListening && (
        <div style={{ position: 'relative', height: 56, borderRadius: 6, overflow: 'hidden',
          background: 'linear-gradient(145deg,#111,#0d0d0d)',
          border: '1px solid #1a1a1a', boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.8)' }}>
          <canvas ref={canvasRef} width={600} height={56} style={{ width: '100%', height: '100%' }} />
          {/* Scanlines */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.08) 0px,rgba(0,0,0,0.08) 1px,transparent 1px,transparent 3px)' }} />
        </div>
      )}

      {/* ── AI speaking wave (TTS playing) ───────────── */}
      {isSpeaking && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
          height: 56, borderRadius: 6,
          background: 'linear-gradient(145deg,#0a1a0a,#081008)',
          border: '1px solid #0d300d',
          boxShadow: 'inset 0 0 12px rgba(0,255,65,0.08)',
        }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{
              width: 4, borderRadius: 2,
              background: '#00ff41',
              animationName: 'aiWave',
              animationDuration: `${0.6 + (i % 5) * 0.15}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationDelay: `${i * 0.05}s`,
              height: 8 + (i % 7) * 4,
              opacity: 0.6 + ((i % 3) * 0.13),
            }} />
          ))}
          <style>{`
            @keyframes aiWave {
              from { transform: scaleY(0.4); }
              to   { transform: scaleY(1.6); }
            }
          `}</style>
        </div>
      )}

      {/* ── Processing indicator ──────────────────────── */}
      {isProcessing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
          height: 56, borderRadius: 6,
          background: 'linear-gradient(145deg,#1a1200,#120d00)',
          border: '1px solid #2a1800',
          boxShadow: 'inset 0 0 12px rgba(212,130,10,0.08)',
        }}>
          <Loader2 size={18} color="#d4820a" style={{ animation: 'sku-spin 0.8s linear infinite', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.1em', color: '#c0a050' }}>
            ANALYSING RESPONSE…
          </span>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%', background: '#d4820a',
              animation: `pulse ${0.8 + i * 0.2}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      )}

      {/* ── Live transcript ────────────────────────────── */}
      {(isListening || liveText) && (
        <div style={{
          minHeight: 60, padding: '0.65rem 0.9rem',
          background: '#0a0a0a', border: '1px solid #1a1a1a',
          borderRadius: 5, position: 'relative', overflow: 'hidden',
          boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.8)',
        }}>
          <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.85rem', color: '#aaa', lineHeight: 1.55 }}>
            {liveText || (
              <span style={{ color: '#444', fontStyle: 'italic' }}>Waiting for speech…</span>
            )}
            {isListening && <span style={{ animation: 'blink 1s step-end infinite', color: '#d4820a' }}>|</span>}
          </span>
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
        </div>
      )}

      {/* ── Mic button ─────────────────────────────────── */}
      <button
        id="voice-mic-btn"
        onClick={onToggleMic}
        disabled={disabled || isSpeaking || isProcessing}
        style={{
          width: '100%',
          padding: '0.85rem',
          borderRadius: 6,
          border: isListening ? '1px solid rgba(255,60,60,0.6)' : '1px solid rgba(212,130,10,0.5)',
          borderTop: isListening ? '1px solid rgba(255,80,80,0.8)' : '1px solid rgba(212,130,10,0.8)',
          background: isListening
            ? 'linear-gradient(145deg,#3a0000,#220000)'
            : (disabled || isSpeaking || isProcessing)
              ? 'linear-gradient(145deg,#222,#1a1a1a)'
              : 'linear-gradient(145deg,#2a1800,#1a1000)',
          cursor: (disabled || isSpeaking || isProcessing) ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: isListening
            ? '0 6px 0 #3a0000, 0 8px 8px rgba(0,0,0,0.5), 0 0 16px rgba(255,60,60,0.2)'
            : '0 6px 0 #555, 0 8px 6px rgba(0,0,0,0.4)',
          transform: 'translateY(0)',
          transition: 'all 120ms ease',
          opacity: (disabled || isSpeaking || isProcessing) ? 0.45 : 1,
          fontFamily: 'Oswald, sans-serif',
          fontSize: '0.82rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: isListening ? '#ff9090' : '#d4820a',
        }}
        onMouseDown={e => { if (!disabled && !isSpeaking && !isProcessing) (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; }}
        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
      >
        {isListening
          ? <><MicOff size={18} /> Stop Listening</>
          : <><Mic size={18} /> {isSpeaking ? 'AI Speaking…' : isProcessing ? 'Processing…' : 'Start Listening'}</>
        }
      </button>
    </div>
  );
}
