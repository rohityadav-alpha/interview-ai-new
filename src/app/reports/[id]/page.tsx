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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <CheckCircle className="w-11 h-11 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Interview Complete!
            </span>
          </h1>
          <div className="flex items-center justify-center space-x-4 text-lg">
            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-bold border-2 border-blue-300 dark:border-blue-700">
              {report.skill}
            </span>
            <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold border-2 border-purple-300 dark:border-purple-700 capitalize">
              {report.difficulty}
            </span>
          </div>
        </div>

        {/* Performance Banner */}
        <Card className={`mb-8 border-2 shadow-xl ${
          performanceLevel === 'excellent' 
            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-300 dark:border-emerald-700'
            : performanceLevel === 'good'
            ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-300 dark:border-blue-700'
            : performanceLevel === 'average'
            ? 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-300 dark:border-amber-700'
            : 'bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-300 dark:border-rose-700'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  performanceLevel === 'excellent' 
                    ? 'bg-emerald-500'
                    : performanceLevel === 'good'
                    ? 'bg-blue-500'
                    : performanceLevel === 'average'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}>
                  <config.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${
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
                  <p className={`${
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
              <div className="text-right">
                <div className={`text-5xl font-bold ${
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
                <div className={`text-sm ${
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl hover:shadow-2xl transition-all bg-white dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">{report.totalScore}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Score</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Out of {report.responses.length * 10}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800 shadow-xl hover:shadow-2xl transition-all bg-white dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">{avgScore.toFixed(1)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Average Score</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Per Question</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl hover:shadow-2xl transition-all bg-white dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">{report.questionsAttempted}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Questions Answered</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Out of {report.responses.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <Card className="shadow-2xl border-2 border-purple-200 dark:border-purple-800 mb-8 bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b-2 dark:border-slate-700">
            <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-white">
              <Brain className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
              Detailed Question-wise Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
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
                  <Card key={index} className="border-2 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-xl bg-white dark:bg-slate-900">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                            {index + 1}
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-relaxed flex-1">
                            {response.question}
                          </h3>
                        </div>
                        {response.aiScore && (
                          <div className={`ml-4 px-4 py-2 rounded-full text-lg font-bold border-2 flex-shrink-0 ${
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

                      <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Answer:</p>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {response.userAnswer || 'No answer provided'}
                        </p>
                      </div>

                      {response.aiFeedback && (
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-purple-500 dark:border-purple-400">
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">AI Feedback:</p>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{response.aiFeedback}</p>
                        </div>
                      )}

                      {strengths.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-bold text-green-700 dark:text-green-300 mb-2 flex items-center">
                            💪 Strengths:
                          </p>
                          <ul className="space-y-2">
                            {strengths.map((strength: string, i: number) => (
                              <li key={i} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {improvements.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-2 flex items-center">
                            🎯 Areas for Improvement:
                          </p>
                          <ul className="space-y-2">
                            {improvements.map((improvement: string, i: number) => (
                              <li key={i} className="flex items-start space-x-2">
                                <Target className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {confidenceTips.length > 0 && (
                        <div>
                          <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                            💡 Confidence Tips:
                          </p>
                          <ul className="space-y-2">
                            {confidenceTips.map((tip: string, i: number) => (
                              <li key={i} className="flex items-start space-x-2">
                                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{tip}</span>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleDownloadPDF}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl w-full sm:w-auto"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Download PDF Report
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full border-2 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800">
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/interview/new" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl">
              <Sparkles className="w-5 h-5 mr-2" />
              Start New Interview
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
