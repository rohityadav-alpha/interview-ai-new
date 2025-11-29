// src/app/leaderboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, TrendingUp, Filter, Crown } from 'lucide-react';

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
  const { isSignedIn, userEmail } = useCustomAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Trophy className="w-11 h-11 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Global Leaderboard
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Top performers across all interviews
          </p>
        </div>

        {/* Filter */}
        <Card className="mb-6 shadow-xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Skill:</label>
              </div>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="w-[200px] border-2 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-300">
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="all" className="dark:text-gray-300 dark:focus:bg-slate-700">All Skills</SelectItem>
                  {skills.map((skill) => (
                    <SelectItem key={skill} value={skill} className="dark:text-gray-300 dark:focus:bg-slate-700">
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="shadow-2xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b-2 dark:border-slate-700">
            <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-white">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
              Top {leaderboard.length} Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">
                  No entries yet. Be the first to appear!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.userEmail}`}
                    className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all hover:shadow-lg transform hover:-translate-y-1 ${getRankBg(
                      entry.rank
                    )} ${isCurrentUser(entry.userEmail) ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                  >
                    {/* Rank & User */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {entry.userName?.[0]?.toUpperCase() || 'U'}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {entry.userName || 'Anonymous'}
                          </h3>
                          {isCurrentUser(entry.userEmail) && (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-md">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.skill} • {entry.interviewCount} interview{entry.interviewCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{entry.totalScore}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{Number(entry.avgScore).toFixed(1)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Avg</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        {leaderboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-white dark:bg-slate-800">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">{leaderboard.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Participants</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 dark:border-yellow-800 shadow-xl bg-white dark:bg-slate-800">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{leaderboard[0]?.totalScore || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Highest Score</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800 shadow-xl bg-white dark:bg-slate-800">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {(leaderboard.reduce((sum, e) => sum + Number(e.avgScore), 0) / leaderboard.length).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Average Score</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
