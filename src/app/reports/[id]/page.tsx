// src/app/reports/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, TrendingUp, Clock, FileDown, Home, Target, Award, AlertCircle, Sparkles, Brain } from 'lucide-react';
import Link from 'next/link';
import { generatePDFReport } from '@/lib/pdf-generator';
import { toast } from 'sonner';

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useCustomAuth();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [authLoading, isSignedIn, router]);

  useEffect(() => {
    async function fetchReport() {
      if (!isSignedIn) return;

      try {
        const response = await fetch(`/api/reports/${id}`);
        if (response.ok) {
          const data = await response.json();
          setReport(data.interview);
        } else {
          toast.error('Failed to load report');
        }
      } catch (error) {
        console.error('Fetch report error:', error);
        toast.error('Error loading report');
      } finally {
        setIsLoading(false);
      }
    }

    if (isSignedIn) {
      fetchReport();
    }
  }, [isSignedIn, id]);

  const handleDownloadPDF = () => {
    if (!report) return;

    const loadingToast = toast.loading('Generating PDF...');

    setTimeout(() => {
      try {
        const success = generatePDFReport({
          userName: `${report.userFirstName} ${report.userLastName}`,
          userEmail: report.userEmail,
          skill: report.skill,
          difficulty: report.difficulty,
          totalScore: report.totalScore,
          avgScore: report.avgScore,
          questionsAttempted: report.questionsAttempted,
          createdAt: report.createdAt,
          questions: report.responses.map((r: any) => {
            let strengths = [];
            let improvements = [];
            let confidenceTips = [];

            try {
              strengths = r.strengths ? JSON.parse(r.strengths) : [];
              improvements = r.improvements ? JSON.parse(r.improvements) : [];
              confidenceTips = r.confidenceTips ? JSON.parse(r.confidenceTips) : [];
            } catch (e) {
              console.error('Parse error:', e);
            }

            return {
              question: r.question,
              userAnswer: r.userAnswer,
              aiScore: r.aiScore,
              aiFeedback: r.aiFeedback,
              strengths,
              improvements,
              confidenceTips,
            };
          }),
        });

        toast.dismiss(loadingToast);
        if (success) {
          toast.success('PDF downloaded successfully!');
        } else {
          toast.error('Failed to generate PDF');
        }
      } catch (error) {
        console.error('PDF error:', error);
        toast.dismiss(loadingToast);
        toast.error('Failed to generate PDF');
      }
    }, 400);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
            <Brain className="w-10 h-10 text-blue-600 dark:text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-semibold">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !report) {
    return null;
  }

  const avgScore = Number(report.avgScore || 0);
  const performanceLevel = avgScore >= 8 ? 'excellent' : avgScore >= 6 ? 'good' : avgScore >= 4 ? 'average' : 'needs-improvement';

  const performanceConfig: any = {
    excellent: { color: 'emerald', icon: Sparkles, message: 'Outstanding Performance!' },
    good: { color: 'blue', icon: Award, message: 'Great Job!' },
    average: { color: 'amber', icon: Target, message: 'Good Effort!' },
    'needs-improvement': { color: 'rose', icon: AlertCircle, message: 'Keep Practicing!' },
  };

  const config = performanceConfig[performanceLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 sm:py-8">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header - Enhanced & Mobile Optimized */}
    <div className="text-center mb-6 sm:mb-8">
      <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <CheckCircle className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
          </div>
          {/* Decorative rings */}
          <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-ping"></div>
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 px-4">
        <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Interview Complete!
        </span>
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base lg:text-lg px-4">
        <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-bold border-2 border-blue-300 dark:border-blue-700">
          {report.skill}
        </span>
        <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold border-2 border-purple-300 dark:border-purple-700 capitalize">
          {report.difficulty}
        </span>
      </div>
    </div>

    {/* Performance Banner - Enhanced Glassmorphism */}
    <Card className={`mb-6 sm:mb-8 border-2 shadow-xl backdrop-blur-sm relative overflow-hidden ${
      performanceLevel === 'excellent' 
        ? 'bg-gradient-to-r from-emerald-50/90 to-emerald-100/90 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-300 dark:border-emerald-700'
        : performanceLevel === 'good'
        ? 'bg-gradient-to-r from-blue-50/90 to-blue-100/90 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-300 dark:border-blue-700'
        : performanceLevel === 'average'
        ? 'bg-gradient-to-r from-amber-50/90 to-amber-100/90 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-300 dark:border-amber-700'
        : 'bg-gradient-to-r from-rose-50/90 to-rose-100/90 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-300 dark:border-rose-700'
    }`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent"></div>
      </div>
      
      <CardContent className="p-4 sm:p-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${
              performanceLevel === 'excellent' 
                ? 'bg-emerald-500'
                : performanceLevel === 'good'
                ? 'bg-blue-500'
                : performanceLevel === 'average'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}>
              <config.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className={`text-xl sm:text-2xl font-bold ${
                performanceLevel === 'excellent'
                  ? 'text-emerald-900 dark:text-emerald-100'
                  : performanceLevel === 'good'
                  ? 'text-blue-900 dark:text-blue-100'
                  : performanceLevel === 'average'
                  ? 'text-amber-900 dark:text-amber-100'
                  : 'text-rose-900 dark:text-rose-100'
              }`}>
                {config.message}
              </h2>
              <p className={`text-sm sm:text-base ${
                performanceLevel === 'excellent'
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : performanceLevel === 'good'
                  ? 'text-blue-700 dark:text-blue-300'
                  : performanceLevel === 'average'
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-rose-700 dark:text-rose-300'
              }`}>
                You are on the right track
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className={`text-4xl sm:text-5xl font-bold ${
              performanceLevel === 'excellent'
                ? 'text-emerald-600 dark:text-emerald-400'
                : performanceLevel === 'good'
                ? 'text-blue-600 dark:text-blue-400'
                : performanceLevel === 'average'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {avgScore.toFixed(1)}
            </div>
            <div className={`text-xs sm:text-sm mt-1 ${
              performanceLevel === 'excellent'
                ? 'text-emerald-700 dark:text-emerald-300'
                : performanceLevel === 'good'
                ? 'text-blue-700 dark:text-blue-300'
                : performanceLevel === 'average'
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-rose-700 dark:text-rose-300'
            }`}>
              Average Score
            </div>
            {/* Progress bar */}
            <div className="w-24 sm:w-32 h-2 bg-white/30 dark:bg-slate-800/30 rounded-full mt-2 mx-auto sm:mx-0 sm:ml-auto overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  performanceLevel === 'excellent'
                    ? 'bg-emerald-500'
                    : performanceLevel === 'good'
                    ? 'bg-blue-500'
                    : performanceLevel === 'average'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${(avgScore / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Stats Grid - Enhanced Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 bg-white dark:bg-slate-800 group">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">{report.totalScore}</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Score</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1">Out of {report.responses.length * 10}</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-200 dark:border-green-800 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 bg-white dark:bg-slate-800 group">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-1">{avgScore.toFixed(1)}</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Average Score</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1">Per Question</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 bg-white dark:bg-slate-800 group sm:col-span-3 lg:col-span-1">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
            <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">{report.questionsAttempted}</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Questions Answered</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1">Out of {report.responses.length}</p>
        </CardContent>
      </Card>
    </div>

    {/* Detailed Feedback - Mobile Optimized */}
    <Card className="shadow-2xl border-2 border-purple-200 dark:border-purple-800 mb-6 sm:mb-8 bg-white dark:bg-slate-800">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b-2 dark:border-slate-700 p-4 sm:p-6">
        <CardTitle className="flex items-center text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-white">
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          Detailed Question-wise Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-4 sm:space-y-6">
          {report.responses.map((response: any, index: number) => {
            const score = response.aiScore || 0;
            const scoreColor = score >= 8 ? 'green' : score >= 6 ? 'blue' : score >= 4 ? 'amber' : 'red';

            let strengths = [];
            let improvements = [];
            let confidenceTips = [];

            try {
              strengths = response.strengths ? JSON.parse(response.strengths) : [];
              improvements = response.improvements ? JSON.parse(response.improvements) : [];
              confidenceTips = response.confidenceTips ? JSON.parse(response.confidenceTips) : [];
            } catch (e) {
              console.error('Parse error:', e);
            }

            return (
              <Card key={index} className="border-2 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-xl bg-white dark:bg-slate-900 group">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
                    <div className="flex items-start space-x-2 sm:space-x-3 flex-1 w-full sm:w-auto">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md flex-shrink-0 group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-relaxed flex-1">
                        {response.question}
                      </h3>
                    </div>
                    {response.aiScore && (
                      <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-base sm:text-lg font-bold border-2 flex-shrink-0 w-fit ${
                        scoreColor === 'green'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                          : scoreColor === 'blue'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                          : scoreColor === 'amber'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                      }`}>
                        {response.aiScore}/10
                      </div>
                    )}
                  </div>

                  {/* Score Progress Bar */}
                  {response.aiScore && (
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full mb-3 sm:mb-4 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          scoreColor === 'green' ? 'bg-green-500' :
                          scoreColor === 'blue' ? 'bg-blue-500' :
                          scoreColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(response.aiScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  )}

                  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <span className="mr-1">💬</span> Your Answer:
                    </p>
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {response.userAnswer || 'No answer provided'}
                    </p>
                  </div>

                  {response.aiFeedback && (
                    <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-purple-500 dark:border-purple-400">
                      <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                        <span className="mr-1">🤖</span> AI Feedback:
                      </p>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{response.aiFeedback}</p>
                    </div>
                  )}

                  {strengths.length > 0 && (
                    <div className="mb-3 sm:mb-4 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                      <p className="text-xs sm:text-sm font-bold text-green-700 dark:text-green-300 mb-2 flex items-center">
                        💪 Strengths:
                      </p>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {strengths.map((strength: string, i: number) => (
                          <li key={i} className="flex items-start space-x-2">
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {improvements.length > 0 && (
                    <div className="mb-3 sm:mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                      <p className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 mb-2 flex items-center">
                        🎯 Areas for Improvement:
                      </p>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {improvements.map((improvement: string, i: number) => (
                          <li key={i} className="flex items-start space-x-2">
                            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {confidenceTips.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                        💡 Confidence Tips:
                      </p>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {confidenceTips.map((tip: string, i: number) => (
                          <li key={i} className="flex items-start space-x-2">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>

    {/* Action Buttons - Mobile Stacked */}
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
      <Button
        onClick={handleDownloadPDF}
        size="lg"
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl w-full sm:w-auto text-sm sm:text-base py-5 sm:py-6 transform hover:scale-105 transition-all"
      >
        <FileDown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Download PDF Report
      </Button>
      <Link href="/dashboard" className="w-full sm:w-auto">
        <Button variant="outline" size="lg" className="w-full border-2 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800 text-sm sm:text-base py-5 sm:py-6">
          <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
      <Link href="/interview/new" className="w-full sm:w-auto">
        <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl text-sm sm:text-base py-5 sm:py-6 transform hover:scale-105 transition-all">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Start New Interview
        </Button>
      </Link>
    </div>
  </div>
  <Footer />
</div>

  );
}
