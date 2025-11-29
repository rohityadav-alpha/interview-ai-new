// src/app/sign-up/[[...sign-up]]/page.tsx
'use client';

import { SignUp } from '@clerk/nextjs';
import { Brain, Zap, Award, TrendingUp, Target, Sparkles, Rocket } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <Brain className="w-11 h-11 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                <Rocket className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join Interview AI Today
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Start your journey to interview success
          </p>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-white dark:bg-slate-800 shadow-2xl border-2 border-gray-200 dark:border-slate-700",
              }
            }}
          />
        </div>

        {/* Benefits */}
        <div className="mt-8 space-y-3">
          {[
            { icon: Zap, desc: 'AI-powered personalized questions', color: 'from-yellow-500 to-orange-500' },
            { icon: Award, desc: 'Instant feedback with detailed scoring', color: 'from-green-500 to-emerald-500' },
            { icon: TrendingUp, desc: 'Track progress & compete globally', color: 'from-blue-500 to-purple-500' },
            { icon: Target, desc: '100% free - no credit card required', color: 'from-pink-500 to-rose-500' },
          ].map((benefit, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${benefit.color} rounded-lg flex items-center justify-center shadow-md`}>
                <benefit.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">{benefit.desc}</span>
            </div>
          ))}
        </div>

        {/* Call to Action Badge */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
              Join 1,000+ developers mastering interviews! 🚀
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          By signing up, you agree to our{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
