// src/app/sign-up/[[...sign-up]]/page.tsx
// Skeuomorphic Sign-Up — new operator registration panel.

'use client';

import { SignUp } from '@clerk/nextjs';
import { Brain, Zap, Award, TrendingUp, Shield, Lock } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 5px), linear-gradient(160deg, #1e1e1e 0%, #161616 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ─── Panel Header ─── */}
        <div className="sku-panel" style={{ borderRadius: 8, overflow: 'hidden' }}>
          <div className="sku-card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sku-screw" aria-hidden="true" />
              <span className="sku-led sku-led-amber sku-led-blink" />
              <span className="sku-label">New Operator Registration</span>
            </div>
            <span className="sku-screw" aria-hidden="true" />
          </div>

          <div style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div className="sku-knob" style={{ width: 64, height: 64 }}>
              <Brain size={26} color="var(--sku-amber-hi)" />
            </div>
            <h1 className="sku-heading" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', letterSpacing: '0.08em' }}>
              Join Interview AI Today
            </h1>
            <p style={{ fontFamily: 'Roboto Condensed, sans-serif', color: 'var(--sku-metal-dark)', fontSize: '0.82rem' }}>
              Start your journey to interview success
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '1.5rem', width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
              {[
                { val: '1K+', label: 'Users' },
                { val: '10K+', label: 'Sessions' },
                { val: '4.9★', label: 'Rating' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p
                    className="sku-heading"
                    style={{
                      fontSize: '1.2rem',
                      color: 'var(--sku-amber-hi)',
                      textShadow: '0 0 10px var(--sku-amber-glow)',
                      fontFamily: 'Share Tech Mono, monospace',
                    }}
                  >
                    {s.val}
                  </p>
                  <span className="sku-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Clerk Sign Up ─── */}
        <div className="sku-card" style={{ padding: '1rem', overflow: 'hidden' }}>
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none border-0 p-0',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'border border-[#3a3a3a] bg-[#242424] hover:bg-[#2e2e2e] text-[#b0b0b0] font-["Roboto_Condensed"] text-sm rounded',
                dividerLine: 'bg-[#333]',
                dividerText: 'text-[#666] font-["Roboto_Condensed"] text-xs',
                formFieldLabel: 'text-[#888] font-["Oswald"] text-xs tracking-widest uppercase',
                formFieldInput:
                  'bg-[#111] border-[#1a1a1a] border-t-[#0a0a0a] text-[#e0e0e0] font-["Roboto_Condensed"] rounded shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8),inset_-1px_-1px_4px_rgba(255,255,255,0.06)] focus:border-[#d4820a] focus:ring-0 placeholder-[#444]',
                formButtonPrimary:
                  'font-["Oswald"] tracking-widest uppercase text-sm bg-[linear-gradient(180deg,#e09030_0%,#b06010_40%,#c07020_100%)] text-[#1a0e00] border-t border-[#f0b040] shadow-[0_6px_0_#0a0a0a,0_8px_14px_rgba(0,0,0,0.7)] hover:shadow-[0_6px_0_#0a0a0a,0_8px_14px_rgba(0,0,0,0.7),0_0_16px_rgba(212,130,10,0.35)] active:translate-y-1 rounded transition-all',
                footerActionLink: 'text-[#d4820a] hover:text-[#f0a830]',
                identityPreviewText: 'text-[#b0b0b0]',
                formResendCodeLink: 'text-[#d4820a]',
                otpCodeFieldInput: 'bg-[#111] border-[#333] text-[#00ff41] font-["Share_Tech_Mono"]',
                alert: 'bg-[#1f0000] border border-[#5a0000] text-[#ff6060]',
              },
            }}
          />
        </div>

        {/* ─── Benefits ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {[
            { icon: Zap, text: 'AI-powered questions' },
            { icon: Award, text: 'Instant feedback' },
            { icon: TrendingUp, text: 'Global rankings' },
            { icon: Brain, text: '100% free' },
          ].map((f, i) => (
            <div
              key={i}
              className="sku-card"
              style={{ padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <div className="sku-knob" style={{ width: 28, height: 28, flexShrink: 0 }}>
                <f.icon size={11} color="var(--sku-amber-hi)" />
              </div>
              <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.72rem', color: 'var(--sku-metal-mid)' }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', borderTop: '1px solid #222', paddingTop: '0.75rem' }}>
          {[
            { icon: Shield, label: 'Secure' },
            { icon: Lock, label: 'Private' },
            { icon: Zap, label: 'Free Forever' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <b.icon size={13} color="var(--sku-metal-dark)" />
              <span className="sku-label">{b.label}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '0.75rem', color: 'var(--sku-metal-dark)' }}>
          Already have an account?{' '}
          <a
            href="/sign-in"
            style={{
              color: 'var(--sku-amber-hi)',
              textDecoration: 'none',
              fontFamily: 'Oswald, sans-serif',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontSize: '0.72rem',
            }}
          >
            Sign In →
          </a>
        </p>
      </div>
    </div>
  );
}
