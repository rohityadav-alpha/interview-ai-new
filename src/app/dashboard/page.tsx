// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PerformanceChart from '@/components/charts/PerformanceChart'; // ✅ Added
import { 
  Brain, 
  Trophy, 
  Clock, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap, 
  ArrowRight, 
  Sparkles,
  Award,
  BarChart3,
  CheckCircle,
  Home
} from 'lucide-react';
import Link from 'next/link';

interface Interview {
  id: number;
  skill: string;
  difficulty: string;
  isCompleted: boolean;
  totalScore: number;
  avgScore: number;
  createdAt: string;
  interviewDuration: number;
}

interface Stats {
  total: number;
  avgScore: number;
  totalTime: number;
}

// ✅ Added interface
interface PerformanceData {
  date: string;
  score: number;
  interviews: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isSignedIn, isLoading, userName, userEmail } = useCustomAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, avgScore: 0, totalTime: 0 });
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]); // ✅ Added
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoading, isSignedIn, router]);

  // ✅ Added function
  const generateChartData = (interviews: Interview[]): PerformanceData[] => {
    const completed = interviews.filter(i => i.isCompleted);
    
    if (completed.length === 0) return [];

    const grouped = completed.reduce((acc: Record<string, { scores: number[], count: number }>, interview) => {
      const date = new Date(interview.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!acc[date]) {
        acc[date] = { scores: [], count: 0 };
      }
      
      acc[date].scores.push(interview.avgScore || 0);
      acc[date].count += 1;
      
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        interviews: data.count,
      }))
      .slice(-7);
  };

  useEffect(() => {
    async function fetchInterviews() {
      if (!isSignedIn) return;

      try {
        const response = await fetch('/api/interviews/list');
        if (response.ok) {
          const data = await response.json();
          setInterviews(data.interviews || []);
          setStats(data.stats || { total: 0, avgScore: 0, totalTime: 0 });
          
          // ✅ Generate chart data
          const chartData = generateChartData(data.interviews || []);
          setPerformanceData(chartData);
        }
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        setIsLoadingData(false);
      }
    }

    if (isSignedIn) {
      fetchInterviews();
    }
  }, [isSignedIn]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
            <Brain className="w-10 h-10 text-blue-600 dark:text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'green';
    if (score >= 6) return 'blue';
    if (score >= 4) return 'amber';
    return 'red';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Sparkles className="w-10 h-10 mr-3 animate-pulse" />
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-blue-100 text-lg">{userEmail}</p>
              <div className="mt-3 flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <Link href="/interview/new">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl border-2 border-white transform hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start New Interview
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 -mt-16">
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1 bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Interviews</p>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                </div>
              </div>
              <div className="h-2 bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{ width: '100%', animation: 'pulse 2s infinite' }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800 shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1 bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Average Score</p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {stats.avgScore > 0 ? Number(stats.avgScore).toFixed(1) : '0.0'}
                  </p>
                </div>
              </div>
              <div className="h-2 bg-green-100 dark:bg-green-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600"
                  style={{ width: `${(stats.avgScore / 10) * 100}%`, animation: 'pulse 2s infinite' }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1 bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Time</p>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{Math.floor(stats.totalTime / 60)}m</p>
                </div>
              </div>
              <div className="h-2 bg-purple-100 dark:bg-purple-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                  style={{ width: '100%', animation: 'pulse 2s infinite' }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Performance Chart - NEW */}
        {interviews.length > 0 && (
          <div className="mb-8">
            <PerformanceChart data={performanceData} />
          </div>
        )}

        {/* Recent Interviews */}
        <Card className="shadow-xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b-2 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-xl text-gray-900 dark:text-white">
                <Target className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
                Recent Interviews
              </CardTitle>
              {interviews.length > 0 && (
                <Link href="/leaderboard">
                  <Button variant="outline" size="sm" className="border-2 hover:shadow-md transition-all dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700">
                    <Trophy className="w-4 h-4 mr-2" />
                    View Leaderboard
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {interviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No interviews yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Start your first interview to see your progress and get AI-powered feedback!
                </p>
                <Link href="/interview/new">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start Your First Interview
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.slice(0, 5).map((interview) => {
                  const score = interview.avgScore ? Number(interview.avgScore) : 0;
                  const scoreColor = getScoreColor(score);

                  return (
                    <div
                      key={interview.id}
                      className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-xl border-2 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                          <Brain className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{interview.skill}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="capitalize font-medium">{interview.difficulty}</span>
                            <span>•</span>
                            <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {Math.floor((interview.interviewDuration || 0) / 60)}m
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {interview.isCompleted && (
                          <div className="text-right mr-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Score</p>
                            <p className={`text-2xl font-bold text-${scoreColor}-600 dark:text-${scoreColor}-400`}>
                              {interview.avgScore ? Number(interview.avgScore).toFixed(1) : '0.0'}
                            </p>
                          </div>
                        )}
                        {interview.isCompleted ? (
                          <Link href={`/reports/${interview.id}`}>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md group-hover:shadow-lg transition-all"
                            >
                              View Report
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/interview/${interview.id}`}>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                            >
                              Continue
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {interviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer group bg-white dark:bg-slate-800">
              <Link href="/interview/new">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Start New Interview</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Practice with AI-generated questions</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-colors cursor-pointer group bg-white dark:bg-slate-800">
              <Link href="/leaderboard">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">View Leaderboard</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">See how you rank globally</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
