// src/components/Footer.tsx
// Skeuomorphic footer — dark brushed-aluminum base panel with engraved text and LEDs.

import { Brain, Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background:
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 5px), linear-gradient(180deg, #222 0%, #161616 100%)',
        borderTop: '3px solid #0a0a0a',
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.7)',
        padding: '2.5rem 1.5rem 1.5rem',
        marginTop: 0,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Top section — 4 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* ── Brand ──────────────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #3a6ad4, #1a3a8a, #0d1f55)',
                  border: '2px solid #111',
                  boxShadow:
                    '3px 3px 7px rgba(0,0,0,0.8), -1px -1px 3px rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Brain size={16} color="#80b0ff" />
              </div>
              <div>
                <span
                  style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--sku-metal-light)',
                    textShadow:
                      '1px 1px 0 rgba(255,255,255,0.08), -1px -1px 0 rgba(0,0,0,0.6)',
                    display: 'block',
                    lineHeight: 1.1,
                  }}
                >
                  Interview AI
                </span>
                <span
                  style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: '0.58rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--sku-amber-hi)',
                    textShadow: '0 0 8px var(--sku-amber-glow)',
                    display: 'block',
                  }}
                >
                  v2.4.1
                </span>
              </div>
            </div>
            <p
              style={{
                fontFamily: 'Roboto Condensed, sans-serif',
                color: 'var(--sku-metal-dark)',
                fontSize: '0.75rem',
                lineHeight: 1.5,
                letterSpacing: '0.03em',
              }}
            >
              AI-powered interview preparation platform for serious developers.
            </p>
          </div>

          {/* ── Product ────────────────────────────────────── */}
          <div>
            <h3
              className="sku-label"
              style={{ color: 'var(--sku-amber-hi)', marginBottom: '0.85rem', display: 'block' }}
            >
              Product
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/interview/new', label: 'Start Interview' },
                { href: '/leaderboard', label: 'Leaderboard' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: 'Roboto Condensed, sans-serif',
                      fontSize: '0.78rem',
                      color: 'var(--sku-metal-dark)',
                      textDecoration: 'none',
                      letterSpacing: '0.04em',
                      transition: 'color 150ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--sku-amber-hi)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--sku-metal-dark)'; }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'var(--sku-metal-dark)',
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Resources ──────────────────────────────────── */}
          <div>
            <h3
              className="sku-label"
              style={{ color: 'var(--sku-amber-hi)', marginBottom: '0.85rem', display: 'block' }}
            >
              Resources
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { href: '#', label: 'Documentation' },
                { href: '#', label: 'Blog' },
                { href: '#', label: 'FAQ' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: 'Roboto Condensed, sans-serif',
                      fontSize: '0.78rem',
                      color: 'var(--sku-metal-dark)',
                      textDecoration: 'none',
                      letterSpacing: '0.04em',
                      transition: 'color 150ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--sku-amber-hi)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--sku-metal-dark)'; }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'var(--sku-metal-dark)',
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Connect ────────────────────────────────────── */}
          <div>
            <h3
              className="sku-label"
              style={{ color: 'var(--sku-amber-hi)', marginBottom: '0.85rem', display: 'block' }}
            >
              Connect
            </h3>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                {
                  href: 'https://github.com/rohityadav-alpha',
                  icon: Github,
                  label: 'GitHub',
                },
                {
                  href: 'https://www.linkedin.com/in/rohit-yadav-a7636b36a/',
                  icon: Linkedin,
                  label: 'LinkedIn',
                },
                {
                  href: 'mailto:rohityadav474747@gmail.com',
                  icon: Mail,
                  label: 'Email',
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 5,
                    background: 'linear-gradient(145deg, #333, #222)',
                    border: '1px solid #1a1a1a',
                    borderTop: '1px solid #3a3a3a',
                    boxShadow: '2px 2px 6px rgba(0,0,0,0.7), -1px -1px 3px rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sku-metal-dark)',
                    textDecoration: 'none',
                    transition: 'color 150ms ease, box-shadow 150ms ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = 'var(--sku-amber-hi)';
                    el.style.boxShadow = '2px 2px 6px rgba(0,0,0,0.7), -1px -1px 3px rgba(255,255,255,0.04), 0 0 10px var(--sku-amber-glow)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = 'var(--sku-metal-dark)';
                    el.style.boxShadow = '2px 2px 6px rgba(0,0,0,0.7), -1px -1px 3px rgba(255,255,255,0.04)';
                  }}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>

            {/* Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '1rem' }}>
              <span className="sku-led sku-led-green sku-led-blink" aria-hidden="true" />
              <span className="sku-label" style={{ color: '#00cc44' }}>All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom divider */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, #333, #222, #333, transparent)',
            marginBottom: '1.25rem',
          }}
        />

        {/* Copyright row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto Condensed, sans-serif',
              fontSize: '0.7rem',
              color: 'var(--sku-metal-dark)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            © {year} Interview AI — All rights reserved.
          </p>
          <div
            className="sku-lcd"
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.6rem', position: 'relative' }}
          >
            BUILD 2.4.1 — STABLE
          </div>
        </div>
      </div>
    </footer>
  );
}
