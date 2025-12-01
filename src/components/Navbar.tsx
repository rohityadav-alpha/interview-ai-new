// src/components/Navbar.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { Button } from '@/components/ui/button';
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
  Moon,
  Sun
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Initialize theme
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActivePath = (path: string) => pathname === path;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/interview/new', label: 'Start Interview', icon: Zap },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  if (!mounted) {
    return <nav className="h-16 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800" />;
  }

  return (
    <>
      <nav
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg'
            : 'bg-white dark:bg-slate-950'
        } border-b border-gray-200 dark:border-slate-800`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Mobile Optimized */}
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 sm:p-2 rounded-lg">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Interview AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {isSignedIn ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all ${
                        isActivePath(link.href)
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      <span className="font-medium text-sm lg:text-base">{link.label}</span>
                    </Link>
                  ))}

                  {/* Theme Toggle Button */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? (
                      <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    ) : (
                      <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    )}
                  </button>

                  {/* User Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {userName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden lg:block font-medium text-gray-900 dark:text-white text-sm">
                        {userName}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          isUserMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {userName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {userName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {userEmail}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Home className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Dashboard</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 dark:text-red-400"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? (
                      <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    ) : (
                      <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/sign-in')}
                    className="text-sm lg:text-base"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push('/sign-up')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm lg:text-base"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-in slide-in-from-top duration-200">
            <div className="px-4 py-4 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Theme Toggle - Mobile */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="font-medium">Theme</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{theme}</span>
              </button>

              {isSignedIn ? (
                <>
                  {/* User Info - Mobile */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {userName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {userName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nav Links - Mobile */}
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          isActivePath(link.href)
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <link.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Sign Out - Mobile */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/sign-in')}
                    className="w-full justify-center py-6 text-base"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push('/sign-up')}
                    className="w-full justify-center py-6 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-01" />
    </>
  );
}
