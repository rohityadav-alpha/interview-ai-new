// src/app/interview/[id]/page.tsx
'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Loader2, 
  AlertCircle, 
  Clock,
  Keyboard,
  Volume2,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import SimpleFaceTracker from '@/components/SimpleFaceTracker'; // ✅ Import Face Tracker

interface Question {
  id: number;
  questionNumber: number;
  question: string;
  userAnswer: string | null;
}

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useCustomAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<number>>(new Set());
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('text');
  
 const recognitionRef = useRef<any>(null);
const isRecordingRef = useRef(false);
const timerRef = useRef<NodeJS.Timeout | null>(null); // ✅ Fixed
const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [authLoading, isSignedIn, router]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime]);

  // Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      if (!isSignedIn) return;

      try {
        const response = await fetch(`/api/interviews/${id}/questions`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data.questions || []);
        
        if (data.questions && data.questions[0]?.userAnswer) {
          setCurrentAnswer(data.questions[0].userAnswer);
        }
        
        toast.success('Interview loaded successfully!');
      } catch (err: any) {
        console.error('Fetch questions error:', err);
        setError('Failed to load interview questions');
        toast.error('Failed to load interview');
      } finally {
        setIsLoading(false);
      }
    }

    if (isSignedIn && !authLoading) {
      fetchQuestions();
    }
  }, [isSignedIn, authLoading, id]);

  // Update current answer when question changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      const currentQuestion = questions[currentIndex];
      setCurrentAnswer(currentQuestion.userAnswer || '');
      setError('');
      if (inputMode === 'voice' && isRecording) {
        toggleRecording();
      }
    }
  }, [currentIndex, questions]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setCurrentAnswer(transcript);
      };

      recognitionRef.current.onend = () => {
        isRecordingRef.current = false;
        setIsRecording(false);
        toast.info('Recording stopped. You can now edit your answer.');
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        isRecordingRef.current = false;
        setIsRecording(false);
        toast.error('Voice recognition error');
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isRecordingRef.current) {
      try {
        recognitionRef.current.stop();
        isRecordingRef.current = false;
        setIsRecording(false);
        toast.info('Recording stopped - Edit your answer if needed');
      } catch (error) {
        console.log('Stop error:', error);
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    } else {
      try {
        setInputMode('voice');
        recognitionRef.current.start();
        isRecordingRef.current = true;
        setIsRecording(true);
        toast.success('🎤 Recording... Speak now!');
      } catch (error: any) {
        console.log('Start error:', error);
        if (error.message && error.message.includes('already started')) {
          isRecordingRef.current = true;
          setIsRecording(true);
        } else {
          toast.error('Failed to start recording');
        }
      }
    }
  };

  const switchToTextMode = () => {
    if (isRecording) {
      toggleRecording();
    }
    setInputMode('text');
    toast.success('Switched to text mode');
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleSubmitAnswer = async () => {
    const answer = currentAnswer.trim();

    if (!answer) {
      setError('Please provide an answer');
      toast.error('Please provide an answer');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (isRecordingRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
        isRecordingRef.current = false;
        setIsRecording(false);
      }

      const toastId = toast.loading('Submitting answer...');

      const response = await fetch(`/api/interviews/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: questions[currentIndex].id,
          answer: answer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();

      toast.dismiss(toastId);
      toast.success(`Answer submitted! Score: ${data.score}/10`, {
        description: data.feedback?.substring(0, 100) + '...',
        duration: 5000,
      });

      setSubmittedAnswers(prev => new Set([...prev, questions[currentIndex].id]));

      if (currentIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setCurrentAnswer('');
          setInputMode('text');
        }, 1000);
      } else {
        setTimeout(() => {
          completeInterview();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError('Failed to submit answer. Please try again.');
      toast.error('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeInterview = async () => {
    try {
      toast.loading('Completing interview...');
      
      const response = await fetch(`/api/interviews/${id}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Interview completed! Redirecting to report...');
        setTimeout(() => {
          router.push(`/reports/${id}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Complete interview error:', err);
      setError('Failed to complete interview');
      toast.error('Failed to complete interview');
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      toast.info('Previous question');
    }
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      toast.info('Next question');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <Card className="max-w-md border-2 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Error Loading Interview</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <p className="text-gray-600 dark:text-gray-400">No questions available</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-4 sm:py-6 lg:py-8">
  {/* Face Tracking Component */}
  <SimpleFaceTracker isInterviewActive={!isSubmitting && questions.length > 0} />

  <div className="max-w-4xl mx-auto px-4 sm:px-6">
    {/* Header with Timer - Mobile Optimized */}
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center text-gray-900 dark:text-white">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        Interview in Progress
      </h1>
      <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-md border-2 dark:border-slate-700">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="font-mono text-base sm:text-lg font-bold">{formatTime(timeSpent)}</span>
        </div>
      </div>
    </div>

    {/* Progress - Enhanced */}
    <div className="mb-4 sm:mb-6">
      <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-semibold">Question {currentIndex + 1} of {questions.length}</span>
        <span className="font-semibold">{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 sm:h-3 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 relative overflow-hidden"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Error - Mobile Optimized */}
    {error && (
      <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm sm:text-base text-red-600 dark:text-red-400 flex items-start">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </p>
      </div>
    )}

    {/* Question Card - Enhanced */}
    <Card className="mb-4 sm:mb-6 shadow-2xl border-2 border-blue-200 dark:border-blue-800 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
                {currentIndex + 1}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Question {currentIndex + 1}</h2>
            </div>
            {submittedAnswers.has(currentQuestion.id) && (
              <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs sm:text-sm font-semibold flex items-center shadow-md">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Submitted
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-800 dark:text-gray-200 leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border-l-4 border-blue-600 dark:border-blue-400">
            {currentQuestion.question}
          </p>
        </div>

        {/* Input Mode Toggle - Mobile Stack */}
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 dark:bg-slate-900 p-2.5 sm:p-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Input Mode:</span>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              onClick={switchToTextMode}
              disabled={isSubmitting}
              className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center ${
                inputMode === 'text'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Text
            </button>
            <button
              onClick={() => {
                setInputMode('voice');
                toast.info('Click "Start Recording" to use voice');
              }}
              disabled={isSubmitting}
              className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center ${
                inputMode === 'voice'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Voice
            </button>
          </div>
        </div>

        {/* Answer Textarea - Enhanced */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={inputMode === 'voice' 
              ? "Click 'Start Recording' to speak your answer, or type here to edit..." 
              : "Type your answer here..."}
            className="min-h-[150px] sm:min-h-[200px] mb-3 sm:mb-4 text-sm sm:text-base border-2 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white resize-none"
            disabled={isSubmitting}
          />
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              <span>Recording</span>
            </div>
          )}
        </div>

        {/* Character count - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-1 sm:gap-0">
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {currentAnswer.length} characters
          </span>
          {inputMode === 'voice' && !isRecording && currentAnswer && (
            <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold flex items-center">
              <Keyboard className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              You can edit the text above
            </span>
          )}
        </div>

        {/* Recording Controls - Mobile Stack */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4">
          <Button
            onClick={toggleRecording}
            variant={isRecording ? 'destructive' : 'outline'}
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:min-w-[150px] dark:border-slate-600 text-sm sm:text-base py-4 sm:py-2"
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 mr-2 animate-pulse" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>

          <Button
            onClick={handleSubmitAnswer}
            disabled={isSubmitting || !currentAnswer.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 sm:min-w-[180px] shadow-lg text-sm sm:text-base py-4 sm:py-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : currentIndex === questions.length - 1 ? (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit & Finish
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Navigation - Mobile Full Width */}
    <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
      <Button
        onClick={goToPrevious}
        disabled={currentIndex === 0 || isSubmitting}
        variant="outline"
        className="w-full sm:w-auto sm:min-w-[120px] border-2 dark:border-slate-600 dark:text-gray-300 text-sm sm:text-base py-4 sm:py-2"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <Button
        onClick={goToNext}
        disabled={currentIndex === questions.length - 1 || isSubmitting}
        variant="outline"
        className="w-full sm:w-auto sm:min-w-[120px] border-2 dark:border-slate-600 dark:text-gray-300 text-sm sm:text-base py-4 sm:py-2"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>

    {/* Instructions - Enhanced Card */}
    <Card className="bg-blue-50/80 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base text-blue-900 dark:text-blue-300 mb-2 flex items-center">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          💡 Tips:
        </h3>
        <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>• Navigate between questions using Previous/Next buttons</p>
          <p>• <strong>Use voice recording OR type</strong> - both work!</p>
          <p>• <strong>Voice mode:</strong> Click record, speak, then edit if needed</p>
          <p>• <strong>Eye tracking:</strong> Monitor shows your eye contact</p>
          <p>• Submit each answer to get instant AI feedback</p>
          <p>• Take your time - there's no time limit!</p>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
  );
}
