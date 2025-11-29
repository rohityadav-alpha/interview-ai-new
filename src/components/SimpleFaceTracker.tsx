'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Eye, Minimize2, Maximize2, Video } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleFaceTrackerProps {
  isInterviewActive: boolean;
}

export default function SimpleFaceTracker({ isInterviewActive }: SimpleFaceTrackerProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Timer effect
  useEffect(() => {
    if (isStreaming) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStreaming]);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      console.log('Starting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      console.log('Stream obtained:', stream);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // ✅ Multiple event listeners for reliability
        videoRef.current.onloadedmetadata = async () => {
          console.log('Video metadata loaded');
          try {
            await videoRef.current?.play();
            console.log('Video playing');
            // ✅ Force state update
            setTimeout(() => {
              setIsStreaming(true);
              setIsEnabled(true);
              toast.success('Camera ON! 📹');
            }, 100);
          } catch (err) {
            console.error('Play error:', err);
            setError('Failed to start video');
          }
        };

        // ✅ Backup: onplaying event
        videoRef.current.onplaying = () => {
          console.log('Video onplaying event');
          setIsStreaming(true);
          setIsEnabled(true);
        };

        // ✅ Start playing immediately
        try {
          await videoRef.current.play();
          setIsStreaming(true);
          setIsEnabled(true);
          toast.success('Camera connected! 📹');
        } catch (playErr) {
          console.log('Immediate play failed, waiting for metadata');
        }
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera permission denied' 
        : 'Camera access failed';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsEnabled(false);
      setIsStreaming(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onplaying = null;
    }

    setIsStreaming(false);
    console.log('Camera stopped, streaming set to false');
  }, []);

  useEffect(() => {
    if (isEnabled && isInterviewActive) {
      startCamera();
    } else if (!isEnabled) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isEnabled, isInterviewActive, startCamera, stopCamera]);

  const toggleCamera = () => {
    console.log('Toggle clicked. Current state:', { isEnabled, isStreaming });
    
    if (isStreaming) {
      stopCamera();
      setIsEnabled(false);
      toast.info('Camera disabled');
    } else {
      setIsEnabled(true);
      startCamera();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isInterviewActive) return null;

  return (
    <div className="fixed top-20 right-4 z-50 transition-all duration-300">
      <Card className="overflow-hidden shadow-2xl border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span className="text-sm font-bold">Interview Monitor</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Video Preview */}
            <div className="relative w-64 h-48 bg-black">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover mirror ${isStreaming ? 'block' : 'hidden'}`}
                autoPlay
                playsInline
                muted
              />

              {isStreaming ? (
                <>
                  {/* Live Indicator */}
                  <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 bg-red-500 rounded-full shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-bold">LIVE</span>
                  </div>

                  {/* Recording Time */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/70 px-3 py-2 rounded-lg text-center">
                      <p className="text-white text-sm font-mono font-bold">
                        ⏱️ {formatTime(recordingTime)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2 px-3 py-1 rounded-full flex items-center space-x-2 bg-green-500 text-white text-xs font-semibold shadow-lg">
                    <Eye className="w-4 h-4 animate-pulse" />
                    <span>ACTIVE</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-black">
                  <CameraOff className="w-12 h-12 mb-2" />
                  <p className="text-sm font-semibold">Camera Off</p>
                  {error && (
                    <p className="text-xs text-red-400 mt-2 px-4 text-center">{error}</p>
                  )}
                </div>
              )}
            </div>

            {/* Stats & Controls */}
            <CardContent className="p-3 bg-gray-50 dark:bg-slate-900 border-t dark:border-slate-700">
              {/* Debug Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                Debug: {isStreaming ? '✅ Streaming' : '❌ Not Streaming'}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                  <div className="font-bold text-blue-600 dark:text-blue-400 text-base">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Time</div>
                </div>
                <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                  <div className={`font-bold text-base ${isStreaming ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isStreaming ? 'ON' : 'OFF'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Status</div>
                </div>
              </div>

              <Button
                onClick={toggleCamera}
                variant={isStreaming ? "destructive" : "default"}
                size="sm"
                className={`w-full text-xs font-semibold ${
                  isStreaming 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isStreaming ? (
                  <>
                    <CameraOff className="w-3 h-3 mr-1" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="w-3 h-3 mr-1" />
                    Start Camera
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                📹 Your interview is being monitored
              </p>
            </CardContent>
          </>
        )}
      </Card>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
