// src/app/interview/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Brain, Zap, Code, Database, Cpu, Terminal, Sparkles, Target, ArrowRight, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

const SKILLS = [
  { value: 'JavaScript', icon: Code, color: 'yellow' },
  { value: 'TypeScript', icon: Code, color: 'blue' },
  { value: 'React', icon: Code, color: 'cyan' },
  { value: 'Next.js', icon: Terminal, color: 'black' },
  { value: 'Node.js', icon: Terminal, color: 'green' },
  { value: 'Python', icon: Code, color: 'blue' },
  { value: 'Java', icon: Code, color: 'red' },
  { value: 'C++', icon: Code, color: 'blue' },
  { value: 'SQL', icon: Database, color: 'orange' },
  { value: 'MongoDB', icon: Database, color: 'green' },
  { value: 'System Design', icon: Cpu, color: 'purple' },
  { value: 'Data Structures', icon: Brain, color: 'pink' },
  { value: 'Algorithms', icon: Brain, color: 'purple' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'green', description: 'Basic concepts and fundamentals', icon: CheckCircle },
  { value: 'medium', label: 'Medium', color: 'blue', description: 'Intermediate level questions', icon: Target },
  { value: 'hard', label: 'Hard', color: 'red', description: 'Advanced and complex topics', icon: Zap },
];

export default function NewInterviewPage() {
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading, userName } = useCustomAuth();
  const [skill, setSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [authLoading, isSignedIn, router]);

  const handleStartInterview = async () => {
    const selectedSkill = showCustomInput ? customSkill.trim() : skill;

    if (!selectedSkill) {
      setError('Please select or enter a skill');
      toast.error('Please select or enter a skill');
      return;
    }

    try {
      setIsStarting(true);
      setError('');

      const loadingToast = toast.loading('Creating your personalized interview...');

      const response = await fetch('/api/interviews/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: selectedSkill,
          difficulty,
        }),
      });

      toast.dismiss(loadingToast);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start interview');
      }

      const data = await response.json();

      if (data.success && data.interviewId) {
        toast.success('Interview created! Good luck! 🚀');
        router.push(`/interview/${data.interviewId}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Start interview error:', err);
      const errorMsg = err.message || 'Failed to start interview. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSkillSelect = (selectedSkill: string) => {
    setSkill(selectedSkill);
    setShowCustomInput(false);
    setCustomSkill('');
    toast.success(`Selected ${selectedSkill}`);
  };

  const handleCustomSkill = () => {
    setShowCustomInput(true);
    setSkill('');
    toast.info('Enter your custom skill');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
            <Brain className="w-10 h-10 text-blue-600 dark:text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 sm:py-8">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header - Enhanced & Mobile Optimized */}
    <div className="text-center mb-6 sm:mb-8">
      <div className="inline-flex items-center justify-center mb-3 sm:mb-4 relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
          <Sparkles className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-400/20 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border-4 border-purple-400/20 animate-pulse"></div>
      </div>
      <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-3 px-4">
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Hey {userName}! Ready to level up? 🚀
        </span>
      </h1>
      <p className="text-sm sm:text-base lg:text-xl text-gray-600 dark:text-gray-300 px-4">
        Choose your skill and difficulty to begin your AI-powered practice
      </p>
    </div>

    {/* Error Alert - Mobile Optimized */}
    {error && (
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-2 sm:space-x-3 animate-slideDown">
        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm sm:text-base text-red-700 dark:text-red-300 font-semibold">{error}</p>
      </div>
    )}

    {/* Skill Selection - Enhanced Grid */}
    <Card className="mb-4 sm:mb-6 shadow-2xl border-2 border-blue-200 dark:border-blue-800 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b-2 dark:border-slate-700 p-4 sm:p-6">
        <CardTitle className="flex items-center text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-white">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          Select Your Skill
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
          {SKILLS.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSkillSelect(s.value)}
              disabled={isStarting}
              className={`group p-3 sm:p-4 rounded-xl border-2 transition-all transform hover:-translate-y-1 hover:shadow-xl ${
                skill === s.value
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <s.icon className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mx-auto mb-1.5 sm:mb-2 transition-transform ${
                skill === s.value 
                  ? 'text-blue-600 dark:text-blue-400 scale-110' 
                  : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110'
              }`} />
              <p className={`text-xs sm:text-sm font-bold text-center truncate ${
                skill === s.value 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {s.value}
              </p>
            </button>
          ))}
        </div>

        {/* Custom Skill - Mobile Optimized */}
        <div className="border-t-2 border-gray-200 dark:border-slate-700 pt-3 sm:pt-4">
          {!showCustomInput ? (
            <Button
              onClick={handleCustomSkill}
              variant="outline"
              className="w-full border-2 border-dashed dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 text-sm sm:text-base py-4 sm:py-5"
              disabled={isStarting}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Or enter custom skill
            </Button>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Custom Skill</Label>
              <Input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="e.g., GraphQL, Docker, AWS..."
                className="border-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm sm:text-base"
                disabled={isStarting}
              />
              <Button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomSkill('');
                }}
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm dark:text-gray-400 dark:hover:bg-slate-700"
              >
                Back to preset skills
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Difficulty Selection - Enhanced Cards */}
    <Card className="mb-4 sm:mb-6 shadow-2xl border-2 border-purple-200 dark:border-purple-800 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b-2 dark:border-slate-700 p-4 sm:p-6">
        <CardTitle className="flex items-center text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-white">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          Choose Difficulty
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => {
                setDifficulty(d.value);
                toast.success(`Difficulty set to ${d.label}`);
              }}
              disabled={isStarting}
              className={`group p-4 sm:p-5 lg:p-6 rounded-xl border-2 transition-all transform hover:-translate-y-1 hover:shadow-xl ${
                difficulty === d.value
                  ? d.color === 'green'
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-500 shadow-lg scale-105'
                    : d.color === 'blue'
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 shadow-lg scale-105'
                    : 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-500 shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              <d.icon className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 mx-auto mb-2 sm:mb-3 transition-transform ${
                difficulty === d.value
                  ? d.color === 'green'
                    ? 'text-green-600 dark:text-green-400 scale-110'
                    : d.color === 'blue'
                    ? 'text-blue-600 dark:text-blue-400 scale-110'
                    : 'text-red-600 dark:text-red-400 scale-110'
                  : 'text-gray-600 dark:text-gray-400 group-hover:scale-110'
              }`} />
              <h3 className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-center ${
                difficulty === d.value
                  ? d.color === 'green'
                    ? 'text-green-700 dark:text-green-300'
                    : d.color === 'blue'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-red-700 dark:text-red-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {d.label}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">{d.description}</p>
              {/* Progress indicator */}
              {difficulty === d.value && (
                <div className="w-full h-1 bg-white/30 dark:bg-slate-800/30 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full rounded-full animate-pulse ${
                    d.color === 'green' ? 'bg-green-500' : 
                    d.color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Info Card - Mobile Optimized */}
    <Card className="mb-4 sm:mb-6 bg-blue-50/80 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2 text-sm sm:text-base">What to expect:</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              {[
                { icon: Brain, desc: '10 AI-generated questions tailored to your skill' },
                { icon: Zap, desc: 'Real-time feedback with detailed scoring' },
                { icon: Target, desc: 'Strengths, improvements, and confidence tips' },
                { icon: Sparkles, desc: 'Comprehensive report at the end' },
              ].map((feature, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>{feature.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Start Button - Enhanced */}
    <div className="text-center">
      <Button
        onClick={handleStartInterview}
        disabled={isStarting || (!skill && !customSkill)}
        size="lg"
        className="w-full md:w-auto px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <span className="relative z-10 flex items-center justify-center">
          {isStarting ? (
            <>
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin" />
              Creating Interview...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Start Interview
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
      </Button>
      
      {/* Helper text */}
      {(!skill && !customSkill) && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 animate-pulse">
          Please select a skill to continue
        </p>
      )}
    </div>
    <br />
  </div>
  <Footer />
</div>
  );
}
