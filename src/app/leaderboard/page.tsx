// src/app/leaderboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, TrendingUp, Filter, Crown, Sparkles } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userEmail: string;
  userName: string;
  skill: string;
  totalScore: number;
  avgScore: number;
  interviewCount: number;
}

export default function LeaderboardPage() {
  const { userEmail } = useCustomAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedSkill]);

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/leaderboard/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error('Fetch skills error:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const url = selectedSkill === 'all'
        ? '/api/leaderboard'
        : `/api/leaderboard?skill=${encodeURIComponent(selectedSkill)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return <span className="text-sm font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-700';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-gray-300 dark:border-gray-700';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-300 dark:border-orange-700';
    return 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700';
  };

  const isCurrentUser = (email: string) => email === userEmail;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 mx-auto"></div>
            <Trophy className="w-10 h-10 text-purple-600 dark:text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-semibold">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 sm:py-8">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header - Enhanced with Animation */}
    <div className="text-center mb-6 sm:mb-8">
      <div className="inline-flex items-center justify-center mb-3 sm:mb-4 relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
          <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border-4 border-orange-400/20 animate-pulse"></div>
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 px-4">
        <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-gradient">
          Global Leaderboard
        </span>
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-4">
        Top performers across all interviews 🌟
      </p>
    </div>

    {/* Filter - Enhanced Card */}
    <Card className="mb-4 sm:mb-6 shadow-xl border-2 border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
            </div>
            <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Skill:</label>
          </div>
          <Select value={selectedSkill} onValueChange={setSelectedSkill}>
            <SelectTrigger className="w-full sm:w-[200px] border-2 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-300 text-sm hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
              <SelectValue placeholder="All Skills" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all" className="dark:text-gray-300 dark:focus:bg-slate-700 text-sm">All Skills</SelectItem>
              {skills.map((skill) => (
                <SelectItem key={skill} value={skill} className="dark:text-gray-300 dark:focus:bg-slate-700 text-sm">
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    {/* Leaderboard - Enhanced with Podium Effect */}
    <Card className="shadow-2xl border-2 border-blue-200 dark:border-blue-800 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b-2 dark:border-slate-700 p-4 sm:p-6">
        <CardTitle className="flex items-center text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-white">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
          </div>
          Top {leaderboard.length} Performers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 font-semibold px-4">
              No entries yet. Be the first to appear! 🚀
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {leaderboard.map((entry, idx) => {
              const isPodium = entry.rank <= 3;
              const podiumGradients: Record<number, string> = {
                1: 'from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-400 dark:border-yellow-600',
                2: 'from-gray-100 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-400 dark:border-gray-600',
                3: 'from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-orange-400 dark:border-orange-600'
              };

              return (
                <div
                  key={`${entry.rank}-${entry.userEmail}`}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 lg:p-5 rounded-xl border-2 transition-all hover:shadow-lg transform hover:-translate-y-1 gap-3 sm:gap-4 group ${
                  isPodium
                   ? `bg-gradient-to-r ${podiumGradients[entry.rank] ?? ''} shadow-lg scale-105 sm:scale-100 hover:scale-105`
                   : getRankBg(entry.rank)
                  } ${isCurrentUser(entry.userEmail) ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Sparkle effect for top 3 */}
                  {isPodium && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                    </div>
                  )}

                  {/* Rank & User */}
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md flex-shrink-0 group-hover:scale-110 transition-transform">
                      {entry.userName?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                          {entry.userName || 'Anonymous'}
                        </h3>
                        {isCurrentUser(entry.userEmail) && (
                          <span className="px-2 py-0.5 sm:py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-md flex-shrink-0 animate-pulse">
                            You
                          </span>
                        )}
                        {isPodium && (
                          <span className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold rounded uppercase tracking-wide shadow-sm flex-shrink-0">
                            Top {entry.rank}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {entry.skill} • {entry.interviewCount} interview{entry.interviewCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Scores - Enhanced */}
                  <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto justify-end">
                    <div className="text-center relative">
                      <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{entry.totalScore}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-semibold">Total</p>
                      {/* Progress indicator */}
                      <div className="w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((entry.totalScore / (leaderboard[0]?.totalScore || 100)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center relative">
                      <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{Number(entry.avgScore).toFixed(1)}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-semibold">Avg</p>
                      {/* Progress indicator */}
                      <div className="w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000"
                          style={{ width: `${(Number(entry.avgScore) / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Stats - Enhanced Cards with Animations */}
    {leaderboard.length > 0 && (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-white dark:bg-slate-800 hover:shadow-2xl transition-all transform hover:-translate-y-1 group">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform">{leaderboard.length}</p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Participants</p>
            <div className="w-full h-1 bg-blue-200 dark:bg-blue-900 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 dark:border-yellow-800 shadow-xl bg-white dark:bg-slate-800 hover:shadow-2xl transition-all transform hover:-translate-y-1 group">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform relative">
              <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-1 group-hover:scale-110 transition-transform">{leaderboard[0]?.totalScore || 0}</p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Highest Score</p>
            <div className="w-full h-1 bg-yellow-200 dark:bg-yellow-900 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 dark:border-green-800 shadow-xl bg-white dark:bg-slate-800 hover:shadow-2xl transition-all transform hover:-translate-y-1 group sm:col-span-3 lg:col-span-1">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-1 group-hover:scale-110 transition-transform">
              {(leaderboard.reduce((sum, e) => sum + Number(e.avgScore), 0) / leaderboard.length).toFixed(1)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Average Score</p>
            <div className="w-full h-1 bg-green-200 dark:bg-green-900 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
  </div>
  <Footer />
</div>
  );
}
