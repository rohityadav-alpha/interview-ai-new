// src/app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain,
  Zap,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  Sparkles,
  Target,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn, isLoading } = useCustomAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoading, isSignedIn, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center space-y-4 px-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading Interview AI...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Feedback',
      description: 'Get instant, detailed feedback on your answers with actionable improvement tips',
    },
    {
      icon: Target,
      title: 'Real Interview Questions',
      description: 'Practice with questions from top tech companies and various difficulty levels',
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor your improvement over time with detailed analytics and reports',
    },
    {
      icon: Award,
      title: 'Compete & Learn',
      description: 'Join the leaderboard and see how you rank against other candidates',
    },
  ];

  const benefits = [
    { icon: Zap, text: 'Instant AI-powered feedback' },
    { icon: Clock, text: 'Practice anytime, anywhere' },
    { icon: TrendingUp, text: 'Track your improvement' },
    { icon: Users, text: 'Join a community of learners' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative pt-20 sm:pt-24 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              AI-Powered Interview Practice
            </div>

            {/* Headline - Mobile Responsive */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight px-4 sm:px-0">
              Master Your Next
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Technical Interview
              </span>
            </h1>

            {/* Subheadline - Mobile Responsive */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4 sm:px-6">
              Practice with real interview questions, get instant AI feedback, and track your improvement 📈
            </p>

            {/* CTA Buttons - Mobile Stacked */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 px-4 sm:px-0">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6"
              >
                <Link href="/sign-up" className="flex items-center justify-center">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Get Started Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 border-2"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>

            {/* Social Proof - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-green-500" />
                <span>Join 1,000+ developers improving their skills</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Grid */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white px-4">
              Why Choose Interview AI?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4 sm:px-6">
              Meets practical interview preparation for the ultimate learning experience
            </p>
          </div>

          {/* Features Grid - Mobile 1 col, Tablet 2 cols, Desktop 4 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-slate-900"
              >
                <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Mobile List */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-blue-200 dark:border-blue-800">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12 space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Everything You Need to Succeed
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                All the tools and features to ace your next interview
              </p>
            </div>

            {/* Benefits Grid - Mobile 1 col, Desktop 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white px-4">
            Ready to Ace Your Interview?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4 sm:px-6">
            Join thousands of developers who have improved their interview skills with our AI-powered platform
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 px-4 sm:px-0">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6"
            >
              <Link href="/sign-up" className="flex items-center justify-center">
                Start Practicing Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 border-2"
            >
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
