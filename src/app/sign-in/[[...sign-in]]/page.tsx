// src/app/sign-in/[[...sign-in]]/page.tsx
'use client';

import { SignIn } from '@clerk/nextjs';
import { Shield, Users, Award, ArrowRight } from 'lucide-react';

import { Brain, Zap, Trophy, TrendingUp, Sparkles } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
  {/* Background Decorations - Enhanced */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-64 h-64 sm:w-96 sm:h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
    <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-64 h-64 sm:w-96 sm:h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
  </div>

  <div className="relative max-w-md w-full space-y-6 sm:space-y-8">
    {/* Header - Mobile Optimized */}
    <div className="text-center">
      <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <Brain className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
          </div>
          {/* Decorative badge */}
          <div className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-2xl border-4 border-blue-400/30 animate-ping"></div>
          <div className="absolute inset-0 rounded-2xl border-4 border-purple-400/20 animate-pulse"></div>
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 px-4">
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to Interview AI
        </span>
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg px-4">
        Sign in to continue your interview journey
      </p>
    </div>

    {/* Clerk Sign In Component - Enhanced */}
    <div className="flex justify-center">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            card: "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl border-2 border-gray-200 dark:border-slate-700 rounded-2xl",
            formButtonPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg",
            footerActionLink: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
            formFieldInput: "border-2 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white",
            headerTitle: "text-2xl font-bold text-gray-900 dark:text-white",
            headerSubtitle: "text-gray-600 dark:text-gray-400",
            socialButtonsBlockButton: "border-2 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800",
            dividerLine: "bg-gray-300 dark:bg-slate-600",
            dividerText: "text-gray-500 dark:text-gray-400",
          }
        }}
      />
    </div>

    {/* Features - Enhanced Cards */}
    <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
      {[
        { icon: Zap, text: 'AI-powered interview practice', gradient: 'from-blue-500 to-blue-600' },
        { icon: Trophy, text: 'Instant feedback & scoring', gradient: 'from-purple-500 to-purple-600' },
        { icon: TrendingUp, text: 'Track your progress', gradient: 'from-pink-500 to-pink-600' },
      ].map((feature, index) => (
        <div
          key={index}
          className="flex items-center space-x-3 p-3 sm:p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border-2 border-gray-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all transform hover:-translate-y-1 group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}>
            <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-semibold">{feature.text}</span>
        </div>
      ))}
    </div>

    {/* Trust Badges - New Section */}
    <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t-2 border-gray-200 dark:border-slate-700">
      <div className="flex items-center space-x-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <Shield className="w-4 h-4 text-green-500" />
        <span>Secure</span>
      </div>
      <div className="flex items-center space-x-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <Users className="w-4 h-4 text-blue-500" />
        <span>1000+ Users</span>
      </div>
      <div className="flex items-center space-x-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <Award className="w-4 h-4 text-purple-500" />
        <span>AI-Powered</span>
      </div>
    </div>

    {/* Terms - Mobile Optimized */}
    <p className="text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-4 sm:mt-6 px-2">
      By signing in, you agree to our{' '}
      <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
        Terms of Service
      </a>{' '}
      and{' '}
      <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
        Privacy Policy
      </a>
    </p>

    {/* Footer CTA */}
    <div className="text-center pt-4">
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
        Don't have an account?
      </p>
      <a 
        href="/sign-up" 
        className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
      >
        <span>Create one now</span>
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  </div>
</div>

  );
}
