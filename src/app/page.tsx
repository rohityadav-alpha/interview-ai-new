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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
            <Brain className="w-10 h-10 text-blue-600 dark:text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-semibold">Loading Interview AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                  <Brain className="w-14 h-14 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Master Technical Interviews
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">with AI-Powered Feedback</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Practice with real interview questions, get instant AI feedback, and track your improvement 📈
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  <Zap className="w-6 h-6 mr-2" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-lg border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white font-bold"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold">
                Join <span className="text-blue-600 dark:text-blue-400">1,000+</span> developers improving their skills
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Advanced AI Technology
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Meets practical interview preparation for the ultimate learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                color: 'blue',
                title: 'AI-Generated Questions',
                description: 'Get intelligent, skill-specific questions powered by Google Gemini AI',
              },
              {
                icon: Award,
                color: 'green',
                title: 'Instant Feedback',
                description: 'Receive detailed AI evaluation with scores and improvement suggestions',
              },
              {
                icon: TrendingUp,
                color: 'purple',
                title: 'Track Progress',
                description: 'Monitor improvement with analytics, reports, and global leaderboards',
              },
              {
                icon: Target,
                color: 'pink',
                title: 'Personalized Learning',
                description: 'Adaptive difficulty and skill-specific questions tailored to your needs',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Interview AI</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Clock, text: 'Practice anytime, anywhere at your own pace' },
              { icon: Target, text: 'Skill-specific questions tailored to your needs' },
              { icon: Zap, text: 'Free to use vs expensive coaching programs' },
              { icon: Users, text: 'Compare your performance on global leaderboards' },
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mr-2" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{benefit.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of developers who have improved their interview skills with our AI-powered platform
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="px-10 py-6 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Start Practicing Now - It&apos;s Free!
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
