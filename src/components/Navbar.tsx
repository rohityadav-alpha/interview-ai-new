// src/components/Navbar.tsx
// Skeuomorphic navigation bar — physical control-panel aesthetic.
// Brushed aluminum surface with beveled edges, metal screws and amber glow.

'use client';

import { useState, useEffect, useRef } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import {
  Brain,
  Menu,
  X,
  Trophy,
  LogOut,
  Home,
  Zap,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const { isSignedIn, userName, userEmail, isLoading } = useCustomAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/interview/new', label: 'Start Interview', icon: Zap },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  // SSR placeholder — same height, dark panel
  if (!mounted) {
    return <nav style={{ height: 64, background: '#2e2e2e', borderBottom: '2px solid #1a1a1a' }} />;
  }

  return (
    <>
      {/* ── Main Navigation Bar ───────────────────────────── */}
      <nav
        className="sticky top-0 left-0 right-0 z-50"
        style={{
          /* Brushed-aluminum horizontal panel */
          background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px), linear-gradient(180deg, #484848 0%, #363636 40%, #2e2e2e 100%)',
          borderBottom: '2px solid #1a1a1a',
          borderTop: '1px solid #5a5a5a',
          boxShadow: scrolled
            ? '0 6px 24px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.06) inset'
            : '0 4px 16px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06) inset',
          transition: 'box-shadow 200ms ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between" style={{ height: 64 }}>

            {/* ── Decorative screw TL ─────────────────────── */}
            <div className="hidden lg:flex items-center gap-3">
              <span className="sku-screw" aria-hidden="true" />
            </div>

            {/* ── Logo ─────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              style={{ textDecoration: 'none', transition: 'opacity 150ms ease' }}
            >
              {/* Knob-style logo icon */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #3a6ad4, #1a3a8a, #0d1f55)',
                  border: '3px solid #111',
                  boxShadow: '3px 3px 8px rgba(0,0,0,0.8), -1px -1px 4px rgba(255,255,255,0.1), inset 0 0 10px rgba(0,60,200,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'box-shadow 150ms ease',
                }}
              >
                <Brain size={18} color="#80b0ff" />
              </div>
              <div>
                <span
                  className="sku-heading"
                  style={{ fontSize: '1.1rem', display: 'block', lineHeight: 1 }}
                >
                  Interview
                </span>
                <span
                  style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--sku-amber-hi)',
                    textShadow: '0 0 8px var(--sku-amber-glow)',
                    display: 'block',
                  }}
                >
                  A.I. System
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav links ─────────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              {isSignedIn && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sku-btn sku-btn-ghost flex items-center gap-2 ${isActive(link.href) ? 'sku-nav-active' : ''}`}
                  style={{ textDecoration: 'none', fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
                >
                  <link.icon size={14} style={{ flexShrink: 0 }} />
                  <span>{link.label}</span>
                </Link>
              ))}

              {!isSignedIn && !isLoading && (
                <>
                  <button
                    onClick={() => router.push('/sign-in')}
                    className="sku-btn sku-btn-ghost"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/sign-up')}
                    className="sku-btn sku-btn-primary"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 1rem' }}
                  >
                    <Sparkles size={14} style={{ marginRight: 6 }} />
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* ── User Dropdown ────────────────────────────── */}
            {isSignedIn && (
              <div className="hidden md:flex items-center gap-3">
                {/* LED status indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="sku-led sku-led-green sku-led-blink" title="Online" />
                  <span className="sku-label" style={{ fontSize: '0.6rem' }}>Online</span>
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button
                    id="user-menu-trigger"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(180deg, #444 0%, #2e2e2e 100%)',
                      border: '1px solid #1a1a1a',
                      borderTop: '1px solid #555',
                      borderRadius: 5,
                      padding: '0.35rem 0.75rem',
                      cursor: 'pointer',
                      boxShadow: '2px 2px 6px rgba(0,0,0,0.6), -1px -1px 3px rgba(255,255,255,0.06)',
                      transition: 'box-shadow 150ms ease',
                    }}
                    aria-label="User menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    {/* Avatar knob */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 35%, #d0a040, #7a5010)',
                        border: '2px solid #111',
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Oswald, sans-serif',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span
                      className="hidden lg:block sku-label"
                      style={{ fontSize: '0.72rem', color: 'var(--sku-metal-light)' }}
                    >
                      {userName}
                    </span>
                    <ChevronDown
                      size={12}
                      color="var(--sku-metal-dark)"
                      style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {isUserMenuOpen && (
                    <div
                      id="user-dropdown"
                      className="absolute right-0 mt-2"
                      style={{
                        width: 240,
                        background: 'linear-gradient(170deg, #3a3a3a, #2a2a2a)',
                        border: '1px solid #1a1a1a',
                        borderTop: '1px solid #4a4a4a',
                        borderRadius: 6,
                        boxShadow: '6px 6px 20px rgba(0,0,0,0.9), -2px -2px 6px rgba(255,255,255,0.04)',
                        overflow: 'hidden',
                        zIndex: 100,
                      }}
                    >
                      {/* User info panel */}
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid #1a1a1a',
                          background: 'linear-gradient(180deg, #333, #282828)',
                        }}
                      >
                        <p style={{ color: 'var(--sku-metal-light)', fontFamily: 'Oswald, sans-serif', fontWeight: 500, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                          {userName}
                        </p>
                        <p style={{ color: 'var(--sku-metal-dark)', fontSize: '0.7rem', fontFamily: 'Roboto Condensed, sans-serif', marginTop: 2 }}>
                          {userEmail}
                        </p>
                      </div>

                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2"
                        style={{
                          padding: '0.65rem 1rem',
                          color: 'var(--sku-metal-mid)',
                          textDecoration: 'none',
                          fontFamily: 'Oswald, sans-serif',
                          fontSize: '0.78rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          transition: 'background 150ms ease, color 150ms ease',
                          display: 'flex',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(212,130,10,0.1)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--sku-amber-hi)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = 'var(--sku-metal-mid)';
                        }}
                      >
                        <Home size={14} />
                        Dashboard
                      </Link>

                      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #333, transparent)', margin: '0 0.5rem' }} />

                      <button
                        onClick={handleSignOut}
                        id="sign-out-btn"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '0.65rem 1rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#ff6060',
                          fontFamily: 'Oswald, sans-serif',
                          fontSize: '0.78rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          transition: 'background 150ms ease',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,0,0,0.12)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Decorative screw TR ─────────────────────── */}
            <div className="hidden lg:flex items-center gap-3">
              <span className="sku-screw" aria-hidden="true" />
            </div>

            {/* ── Mobile hamburger ─────────────────────────── */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden sku-btn sku-btn-secondary"
              style={{ padding: '0.45rem 0.65rem', fontSize: '0.75rem' }}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────── */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            style={{
              background: 'linear-gradient(180deg, #303030, #252525)',
              borderTop: '1px solid #1a1a1a',
              boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* User info – mobile */}
              {isSignedIn && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(145deg, #2e2e2e, #222)',
                    border: '1px solid #1a1a1a',
                    borderTop: '1px solid #3a3a3a',
                    borderRadius: 5,
                    boxShadow: '2px 2px 8px rgba(0,0,0,0.6)',
                    marginBottom: '0.25rem',
                  }}
                >
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 35%, #d0a040, #7a5010)',
                      border: '2px solid #111',
                      boxShadow: '2px 2px 5px rgba(0,0,0,0.7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.9rem',
                      flexShrink: 0,
                    }}
                  >
                    {userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p style={{ color: 'var(--sku-metal-light)', fontFamily: 'Oswald, sans-serif', fontSize: '0.82rem', letterSpacing: '0.05em' }}>{userName}</p>
                    <p style={{ color: 'var(--sku-metal-dark)', fontSize: '0.68rem', fontFamily: 'Roboto Condensed, sans-serif' }}>{userEmail}</p>
                  </div>
                  <span className="sku-led sku-led-green sku-led-blink" style={{ marginLeft: 'auto' }} />
                </div>
              )}

              {/* Nav links – mobile */}
              {isSignedIn
                ? navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 ${isActive(link.href) ? 'sku-nav-active' : ''}`}
                      style={{
                        padding: '0.7rem 1rem',
                        borderRadius: 5,
                        textDecoration: 'none',
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '0.82rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: isActive(link.href) ? 'var(--sku-amber-hi)' : 'var(--sku-metal-mid)',
                        background: isActive(link.href) ? 'rgba(212,130,10,0.12)' : 'transparent',
                        border: isActive(link.href) ? '1px solid rgba(212,130,10,0.35)' : '1px solid transparent',
                        transition: 'all 150ms ease',
                      }}
                    >
                      <link.icon size={16} style={{ flexShrink: 0 }} />
                      {link.label}
                    </Link>
                  ))
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button onClick={() => router.push('/sign-in')} className="sku-btn sku-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Sign In</button>
                    <button onClick={() => router.push('/sign-up')} className="sku-btn sku-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      <Sparkles size={14} style={{ marginRight: 6 }} /> Get Started
                    </button>
                  </div>
                )}

              {isSignedIn && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3"
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: 5,
                    background: 'rgba(120,0,0,0.2)',
                    border: '1px solid rgba(200,0,0,0.25)',
                    cursor: 'pointer',
                    color: '#ff6060',
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: '0.82rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transition: 'background 150ms ease',
                    marginTop: 4,
                  }}
                >
                  <LogOut size={16} style={{ flexShrink: 0 }} />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
