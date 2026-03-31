// src/components/SimpleFaceTracker.tsx
// Skeuomorphic Face Tracker — hardware security-cam monitor panel.
// Floating fixed panel with dark metal bezel, CRT-style video viewport, LED indicators.

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, CameraOff, Eye, Minimize2, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleFaceTrackerProps {
  isInterviewActive: boolean;
}

export default function SimpleFaceTracker({ isInterviewActive }: SimpleFaceTrackerProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (isStreaming) {
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStreaming]);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            if (videoRef.current?.paused) {
              await videoRef.current?.play();
            }
            setTimeout(() => { setIsStreaming(true); setIsEnabled(true); }, 100);
          } catch (e: any) {
            // Ignore AbortError on play, log others
            if (e.name !== 'AbortError') {
              setError('Failed to start video');
            }
          }
        };
        videoRef.current.onplaying = () => { setIsStreaming(true); setIsEnabled(true); };
      }
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError' ? 'Camera permission denied' : 'Camera access failed';
      setError(msg); toast.error(msg);
      setIsEnabled(false); setIsStreaming(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onplaying = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    if (isEnabled && isInterviewActive) startCamera();
    else if (!isEnabled) stopCamera();
    return () => { stopCamera(); };
  }, [isEnabled, isInterviewActive, startCamera, stopCamera]);

  const toggleCamera = () => {
    if (isStreaming) { stopCamera(); setIsEnabled(false); toast.info('Camera disabled'); }
    else { setIsEnabled(true); startCamera(); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!isInterviewActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 76,
        right: 12,
        zIndex: 50,
        // Dark metal bezel
        borderRadius: 8,
        border: '1px solid #1a1a1a',
        borderTop: '1px solid #484848',
        borderLeft: '1px solid #404040',
        background: 'repeating-linear-gradient(93deg,rgba(255,255,255,0.014) 0px,rgba(255,255,255,0.014) 1px,transparent 1px,transparent 4px),linear-gradient(170deg,#363636 0%,#2c2c2c 60%,#252525 100%)',
        boxShadow: '6px 6px 24px rgba(0,0,0,0.9),-2px -2px 8px rgba(255,255,255,0.04)',
        overflow: 'hidden',
        width: 220,
        // Smooth height animation
        transition: 'width 200ms ease',
      }}
    >
      {/* ─── Bezel Header ─── */}
      <div
        style={{
          background: 'linear-gradient(180deg, #3e3e3e, #303030)',
          borderBottom: '1px solid #1a1a1a',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
          padding: '0.45rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {/* Screw */}
          <span
            style={{
              width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
              background: 'radial-gradient(circle at 35% 35%, #c0c0c0, #666)',
              boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.2), inset -1px -1px 3px rgba(0,0,0,0.8)',
              position: 'relative',
            }}
          />
          {/* Recording LED */}
          {isStreaming && (
            <span
              style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: 'radial-gradient(circle at 35% 35%, #ff8080, #cc2222)',
                boxShadow: '0 0 5px #e53e3e, 0 0 10px rgba(229,62,62,0.5)',
                border: '1px solid rgba(0,0,0,0.5)',
                animation: 'sku-blink 1.4s ease-in-out infinite',
              }}
            />
          )}
          <span
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: '0.55rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#888',
              textShadow: '0 1px 0 rgba(0,0,0,0.8)',
            }}
          >
            Monitor
          </span>
        </div>

        {/* Minimize toggle — physical button */}
        <button
          id="tracker-minimize-btn"
          onClick={() => setIsMinimized(m => !m)}
          style={{
            width: 22, height: 22, borderRadius: 3,
            background: 'linear-gradient(145deg, #484848, #303030)',
            border: '1px solid #1a1a1a',
            borderTop: '1px solid #555',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#888',
            transition: 'transform 100ms ease, box-shadow 100ms ease',
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '1px 1px 2px rgba(0,0,0,0.7)';
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '2px 2px 4px rgba(0,0,0,0.7)';
          }}
        >
          {isMinimized
            ? <Maximize2 size={11} />
            : <Minimize2 size={11} />
          }
        </button>
      </div>

      {/* ─── Video + controls ─── */}
      {!isMinimized && (
        <>
          {/* CRT viewport */}
          <div
            style={{
              width: '100%',
              height: 150,
              background: '#000',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Scanlines */}
            <div
              style={{
                position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)',
              }}
            />
            {/* Vignette */}
            <div
              style={{
                position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)',
              }}
            />

            <video
              ref={videoRef}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: isStreaming ? 'block' : 'none',
              }}
              autoPlay playsInline muted
            />

            {isStreaming ? (
              <>
                {/* LIVE badge */}
                <div
                  style={{
                    position: 'absolute', top: 7, right: 7, zIndex: 3,
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '0.15rem 0.45rem',
                    background: '#7a1818', border: '1px solid #aa2222',
                    borderRadius: 20,
                  }}
                >
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 35%, #ff8080, #cc2222)',
                      boxShadow: '0 0 4px #e53e3e',
                      animation: 'sku-blink 1.4s ease-in-out infinite',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '0.5rem', color: '#ff9090',
                      letterSpacing: '0.1em',
                    }}
                  >
                    REC
                  </span>
                </div>

                {/* ACTIVE badge */}
                <div
                  style={{
                    position: 'absolute', top: 7, left: 7, zIndex: 3,
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '0.15rem 0.45rem',
                    background: 'rgba(0,30,0,0.85)', border: '1px solid #1a5a1a',
                    borderRadius: 20,
                  }}
                >
                  <Eye size={10} color="#00ff41" />
                  <span
                    style={{
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '0.5rem', color: '#00ff41',
                      textShadow: '0 0 6px rgba(0,255,65,0.8)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    ACTIVE
                  </span>
                </div>

                {/* Timer strip */}
                <div
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
                    padding: '0.2rem 0.4rem',
                    background: 'rgba(0,0,0,0.75)',
                    borderTop: '1px solid #1a1a1a',
                    display: 'flex', justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '0.65rem', color: '#00ff41',
                      textShadow: '0 0 6px rgba(0,255,65,0.8)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {formatTime(recordingTime)}
                  </span>
                </div>
              </>
            ) : (
              <div
                style={{
                  position: 'absolute', inset: 0, zIndex: 3,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 6, background: '#000',
                }}
              >
                <CameraOff size={28} color="#333" />
                {error ? (
                  <p
                    style={{
                      fontFamily: 'Roboto Condensed, sans-serif',
                      fontSize: '0.6rem', color: '#ff6060', textAlign: 'center',
                      padding: '0 0.5rem',
                    }}
                  >
                    {error}
                  </p>
                ) : (
                  <span
                    style={{
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '0.58rem', color: '#444', letterSpacing: '0.08em',
                    }}
                  >
                    NO SIGNAL
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ─── Controls strip ─── */}
          <div
            style={{
              padding: '0.6rem 0.65rem',
              background: 'linear-gradient(180deg, #222, #1a1a1a)',
              borderTop: '1px solid #1a1a1a',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}
          >
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                {
                  label: 'Time',
                  val: formatTime(recordingTime),
                  color: '#00ff41',
                  glow: 'rgba(0,255,65,0.6)',
                },
                {
                  label: 'Status',
                  val: isStreaming ? 'ON' : 'OFF',
                  color: isStreaming ? '#00ff41' : '#ff6060',
                  glow: isStreaming ? 'rgba(0,255,65,0.6)' : 'rgba(255,96,96,0.6)',
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, textAlign: 'center', padding: '0.35rem 0.4rem',
                    background: '#0d0d0d',
                    border: '1px solid #1a1a1a', borderTop: '1px solid #0a0a0a',
                    borderRadius: 3,
                    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.7)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '0.8rem',
                      color: s.color,
                      textShadow: `0 0 6px ${s.glow}`,
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </p>
                  <span
                    style={{
                      fontFamily: 'Oswald, sans-serif', fontSize: '0.5rem',
                      letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555',
                      textShadow: '0 1px 0 rgba(0,0,0,0.8)',
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Toggle button */}
            <button
              id="tracker-toggle-btn"
              onClick={toggleCamera}
              style={{
                width: '100%',
                padding: '0.4rem',
                borderRadius: 4,
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontFamily: 'Oswald, sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                ...(isStreaming
                  ? {
                      background: 'linear-gradient(180deg, #c03030 0%, #7a1818 40%, #922020 100%)',
                      color: '#ffe0e0',
                      borderTop: '1px solid #e04040',
                      boxShadow: '0 5px 0 #2a0000, 0 7px 12px rgba(0,0,0,0.7)',
                    }
                  : {
                      background: 'linear-gradient(180deg, #1a5a1a 0%, #0d3a0d 40%, #144014 100%)',
                      color: '#a0ffa0',
                      borderTop: '1px solid #2a8a2a',
                      boxShadow: '0 5px 0 #030f03, 0 7px 12px rgba(0,0,0,0.7)',
                      textShadow: '0 0 6px rgba(0,255,65,0.4)',
                    }),
                transition: 'transform 100ms ease, box-shadow 100ms ease',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 rgba(0,0,0,0.9), 0 3px 5px rgba(0,0,0,0.6)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              {isStreaming
                ? <><CameraOff size={11} /> Stop Camera</>
                : <><Camera size={11} /> Start Camera</>
              }
            </button>
          </div>
        </>
      )}
    </div>
  );
}
