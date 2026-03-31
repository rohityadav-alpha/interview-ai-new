'use client';

import { useRef } from 'react';
import { useAdvancedFaceTracker } from '@/hooks/useAdvancedFaceTracker';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface Props {
  isActive: boolean;
  compact?: boolean;
}

export default function AdvancedFaceTracker({ isActive, compact = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { metrics, cameraReady, error } = useAdvancedFaceTracker(videoRef, canvasRef, {
    active: isActive,
  });

  const statusColor =
    metrics.status === 'good_eye_contact' ? '#00ff41' :
    metrics.status === 'looking_away'    ? '#d4820a' :
    metrics.status === 'no_face'         ? '#ff4040' :
                                           '#888';

  const ledClass =
    metrics.status === 'good_eye_contact' ? 'sku-led sku-led-green sku-led-blink' :
    metrics.status === 'looking_away'     ? 'sku-led sku-led-amber sku-led-blink' :
    metrics.status === 'no_face'          ? 'sku-led sku-led-red sku-led-blink' :
                                            'sku-led sku-led-off';

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: compact ? 16 : 20,
        right: compact ? 12 : 20,
        width: compact ? 180 : 220,
        zIndex: 50,
        background: 'linear-gradient(170deg,#2a2a2a 0%,#1e1e1e 60%,#181818 100%)',
        border: '2px solid #111',
        borderTop: '2px solid #3a3a3a',
        borderRadius: 8,
        boxShadow: '6px 6px 24px rgba(0,0,0,0.95),-2px -2px 8px rgba(255,255,255,0.04)',
        overflow: 'hidden',
        fontFamily: 'Oswald, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg,#333 0%,#252525 100%)',
        borderBottom: '1px solid #111',
        padding: '0.35rem 0.65rem',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span className={ledClass} aria-hidden="true" style={{ display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa' }}>
          Eye Tracker
        </span>
        {error && <AlertTriangle size={10} color="#ff6060" style={{ marginLeft: 'auto' }} />}
      </div>

      {/* Camera viewport */}
      <div style={{ position: 'relative', background: '#000', aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
        />

        {/* CRT scanlines */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.12) 0px,rgba(0,0,0,0.12) 1px,transparent 1px,transparent 3px)',
        }} />

        {/* Vignette */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,0.7) 100%)',
        }} />

        {/* Status overlay bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(0deg,rgba(0,0,0,0.85),transparent)',
          padding: '0.4rem 0.5rem',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {metrics.status === 'good_eye_contact'
            ? <Eye size={10} color={statusColor} />
            : <EyeOff size={10} color={statusColor} />}
          <span style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: statusColor, textTransform: 'uppercase' }}>
            {metrics.message}
          </span>
        </div>

        {/* Not-ready overlay */}
        {!cameraReady && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <div className="sku-spinner" style={{ width: 20, height: 20 }} />
          </div>
        )}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f0000', gap: 4, padding: 8 }}>
            <AlertTriangle size={14} color="#ff6060" />
            <span style={{ fontSize: '0.55rem', color: '#ff6060', textAlign: 'center' }}>{error}</span>
          </div>
        )}
      </div>

      {/* Eye contact score bar */}
      <div style={{ padding: '0.5rem 0.65rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: '#777', textTransform: 'uppercase' }}>Eye Contact</span>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', color: statusColor }}>
            {metrics.eyeContactScore}%
          </span>
        </div>
        <div className="sku-meter-track" style={{ height: 6 }}>
          <div
            className="sku-meter-fill"
            style={{
              width: `${metrics.eyeContactScore}%`,
              background: `linear-gradient(90deg,${statusColor}88 0%,${statusColor} 100%)`,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
