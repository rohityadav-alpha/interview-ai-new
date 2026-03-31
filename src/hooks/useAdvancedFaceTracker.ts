'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type FaceStatus =
  | 'initializing'
  | 'no_face'
  | 'looking_away'
  | 'good_eye_contact'
  | 'error';

export interface FaceMetrics {
  status: FaceStatus;
  eyeContactScore: number;   // 0-100 running average
  totalFrames: number;
  goodFrames: number;
  message: string;
}

interface UseAdvancedFaceTrackerOptions {
  active: boolean;
  onMetricsUpdate?: (metrics: FaceMetrics) => void;
}

export function useAdvancedFaceTracker(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  { active, onMetricsUpdate }: UseAdvancedFaceTrackerOptions
) {
  const [metrics, setMetrics] = useState<FaceMetrics>({
    status: 'initializing',
    eyeContactScore: 0,
    totalFrames: 0,
    goodFrames: 0,
    message: 'Initializing camera…',
  });
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const faceApiRef = useRef<any>(null);
  const metricsRef = useRef<FaceMetrics>({ status: 'initializing', eyeContactScore: 0, totalFrames: 0, goodFrames: 0, message: 'Initializing…' });
  const loadedRef = useRef(false);
  const hasStarted = useRef(false);

  // ── Load face-api.js lazily ────────────────────────────────
  const loadFaceApi = useCallback(async () => {
    if (loadedRef.current) return faceApiRef.current;
    try {
      const faceapi = await import('@vladmandic/face-api');
      const MODEL_URL = '/models'; // served from /public/models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      ]);
      faceApiRef.current = faceapi;
      loadedRef.current = true;
      return faceapi;
    } catch (e) {
      console.warn('face-api load error:', e);
      return null;
    }
  }, []);

  // ── Start camera ────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          if (!hasStarted.current && videoRef.current) {
            try {
              if (videoRef.current.paused) {
                await videoRef.current.play();
              }
              hasStarted.current = true;
            } catch (e: any) {
              if (e.name !== 'AbortError') console.error('Video play error:', e);
            }
          }
        };
        setCameraReady(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);

      if (err.name === "NotAllowedError") {
        setError("Camera permission denied");
        setMetrics(m => ({ ...m, status: 'error', message: "Camera permission denied" }));
      } else if (err.name === "NotReadableError") {
        setError("Camera already in use");
        setMetrics(m => ({ ...m, status: 'error', message: "Camera already in use" }));
      } else {
        setError("Camera unavailable");
        setMetrics(m => ({ ...m, status: 'error', message: "Camera unavailable" }));
      }
    }
  }, [videoRef]);

  // ── Frame detection loop ────────────────────────────────────
  const runDetection = useCallback(async (faceapi: any) => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      rafRef.current = requestAnimationFrame(() => runDetection(faceapi));
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
        .withFaceLandmarks(true);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      const prev = metricsRef.current;
      let next: FaceMetrics;

      if (!detection) {
        next = {
          ...prev,
          status: 'no_face',
          totalFrames: prev.totalFrames + 1,
          message: 'No face detected — please look at the camera',
        };
      } else {
        // Eye contact heuristic:
        // Measure how centred the eye landmarks are in the frame.
        const landmarks = detection.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const eyeCenterX = (
          leftEye.reduce((s: number, p: any) => s + p.x, 0) / leftEye.length +
          rightEye.reduce((s: number, p: any) => s + p.x, 0) / rightEye.length
        ) / 2;
        const eyeCenterY = (
          leftEye.reduce((s: number, p: any) => s + p.y, 0) / leftEye.length +
          rightEye.reduce((s: number, p: any) => s + p.y, 0) / rightEye.length
        ) / 2;

        const relX = eyeCenterX / video.videoWidth;
        const relY = eyeCenterY / video.videoHeight;

        // "good contact" if eyes are horizontally centred (0.3-0.7) and high enough (0.2-0.6)
        const isGoodContact = relX > 0.3 && relX < 0.7 && relY > 0.15 && relY < 0.6;

        const newGood = prev.goodFrames + (isGoodContact ? 1 : 0);
        const newTotal = prev.totalFrames + 1;
        const runningScore = Math.round((newGood / newTotal) * 100);

        // Draw overlay
        if (ctx) {
          faceapi.draw.drawDetections(canvas, [detection]);
          faceapi.draw.drawFaceLandmarks(canvas, [detection]);
          ctx.beginPath();
          ctx.arc(eyeCenterX, eyeCenterY, 8, 0, 2 * Math.PI);
          ctx.strokeStyle = isGoodContact ? '#00ff41' : '#ff4040';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        next = {
          status: isGoodContact ? 'good_eye_contact' : 'looking_away',
          eyeContactScore: runningScore,
          totalFrames: newTotal,
          goodFrames: newGood,
          message: isGoodContact ? 'Good eye contact ✓' : 'Please look at the screen',
        };
      }

      metricsRef.current = next;
      setMetrics(next);
      onMetricsUpdate?.(next);
    } catch { /* silently skip frame */ }

    rafRef.current = requestAnimationFrame(() => runDetection(faceapi));
  }, [videoRef, canvasRef, onMetricsUpdate]);

  // ── Main effect ─────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    (async () => {
      await startCamera();
      const faceapi = await loadFaceApi();
      if (cancelled) return;
      if (!faceapi) {
        // Fallback: no model — still run camera but skip ML
        setMetrics(m => ({ ...m, status: 'good_eye_contact', message: 'Camera active' }));
        setCameraReady(true);
        return;
      }
      setMetrics(m => ({ ...m, status: 'no_face', message: 'Scanning for face…' }));
      rafRef.current = requestAnimationFrame(() => runDetection(faceapi));
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraReady(false);
    };
  }, [active, startCamera, loadFaceApi, runDetection]);

  return { metrics, cameraReady, error };
}
