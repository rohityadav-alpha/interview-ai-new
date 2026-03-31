'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'silence'      // final transcript being committed
  | 'speaking'     // TTS playing
  | 'processing';  // waiting for AI

interface UseVoiceEngineOptions {
  silenceMs?: number;      // ms of no speech before auto-commit (default 2500)
  onTranscript?: (text: string, isFinal: boolean) => void;
  onSilenceCommit?: (text: string) => void;
  onSpeakEnd?: () => void;
}

export function useVoiceEngine({
  silenceMs = 2500,
  onTranscript,
  onSilenceCommit,
  onSpeakEnd,
}: UseVoiceEngineOptions = {}) {
  const [state, setState] = useState<VoiceState>('idle');
  const [liveText, setLiveText] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isTTSSupported, setIsTTSSupported] = useState(false);
  const [volume, setVolume] = useState(0); // 0-100 mic volume level

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const committedTextRef = useRef('');
  const stateRef = useRef<VoiceState>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep refs for callbacks to avoid stale closures inside event listeners
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

  const onSilenceCommitRef = useRef(onSilenceCommit);
  useEffect(() => { onSilenceCommitRef.current = onSilenceCommit; }, [onSilenceCommit]);

  const onSpeakEndRef = useRef(onSpeakEnd);
  useEffect(() => { onSpeakEndRef.current = onSpeakEnd; }, [onSpeakEnd]);

  // Keep stateRef in sync for use inside callbacks
  useEffect(() => { stateRef.current = state; }, [state]);

  // -- Init on mount --
  useEffect(() => {
    setIsSpeechSupported(
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    );
    setIsTTSSupported(
      typeof window !== 'undefined' && 'speechSynthesis' in window
    );
  }, []);

  // -- Build recognition object --
  const buildRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;
    return rec;
  }, []);

  // -- Mic volume analyser (visual VU meter) --
  const startVolumeAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.min(100, Math.round((avg / 128) * 100)));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // microphone not available — volume stays 0
    }
  }, []);

  const stopVolumeAnalyser = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setVolume(0);
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current = null;
  }, []);

  // -- Clear silence timer --
  const clearSilence = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  // -- Start listening --
  const startListening = useCallback(() => {
    if (stateRef.current === 'listening' || stateRef.current === 'speaking') return;
    if (!isSpeechSupported) return;

    committedTextRef.current = '';
    setLiveText('');
    setState('listening');

    const rec = buildRecognition();
    if (!rec) return;
    recognitionRef.current = rec;

    rec.onresult = (event: any) => {
      let interim = '';
      let finalPart = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalPart += transcript;
        } else {
          interim += transcript;
        }
      }
      if (finalPart) committedTextRef.current += (committedTextRef.current ? ' ' : '') + finalPart.trim();
      const combined = committedTextRef.current + (interim ? (committedTextRef.current ? ' ' : '') + interim : '');
      setLiveText(combined);
      onTranscriptRef.current?.(combined, false);

      if (combined.trim().length > 0) {
        console.log("🗣 User speaking...");
      }

      // Reset silence timer on every new word
      clearSilence();
      if (committedTextRef.current.trim() || interim.trim()) {
        const text = combined.trim();
        
        // Primary silence detection
        silenceTimerRef.current = setTimeout(() => {
          if (text && stateRef.current === 'listening') {
            console.log("🛑 Silence detected");
            setState('silence');
            onSilenceCommitRef.current?.(text);
          }
        }, silenceMs);

        // Fallback timeout to force processing after 5000ms of max duration
        fallbackTimerRef.current = setTimeout(() => {
          if (text && stateRef.current === 'listening') {
            console.log("⏰ Force processing");
            setState('silence');
            onSilenceCommitRef.current?.(text);
          }
        }, 5000);
      }
    };

    rec.onend = () => {
      // Auto-restart if still in listening state (browser auto-stops after long silence)
      if (stateRef.current === 'listening') {
        try { rec.start(); } catch { /* already started */ }
      }
    };

    rec.onerror = (e: any) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return; // normal
      console.warn('STT error:', e.error);
    };

    try { 
      rec.start(); 
      console.log("🎤 Listening started");
    } catch { /* already started */ }
    startVolumeAnalyser();
  }, [isSpeechSupported, buildRecognition, silenceMs, clearSilence, startVolumeAnalyser]);

  // -- Stop listening --
  const stopListening = useCallback(() => {
    clearSilence();
    try { recognitionRef.current?.stop(); } catch { }
    recognitionRef.current = null;
    stopVolumeAnalyser();
    if (stateRef.current === 'listening') setState('idle');
  }, [clearSilence, stopVolumeAnalyser]);

  // -- Speak text (TTS) --
  const speak = useCallback((text: string, onEnd?: () => void) => {
    // 1. Always stop mic BEFORE AI speaks
    stopListening();

    if (!isTTSSupported || !text.trim()) {
      console.log('[TTS] speak() skipped — no TTS support or empty text, calling onEnd directly');
      onEnd?.();
      onSpeakEndRef.current?.();
      return;
    }

    console.log('[TTS] speak() — cancelling any queued speech, then speaking:', text.slice(0, 60));

    // Nullify ref BEFORE cancel so onerror/onend of old utterance
    // does NOT fire the previous callback (cancel triggers error event).
    utteranceRef.current = null;
    window.speechSynthesis.cancel();

    setState('speaking');
    stateRef.current = 'speaking';

    // cancelled flag — set to true when WE intentionally cancel so we
    // don't advance the flow via a stale utterance's onend.
    let cancelled = false;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Prefer a natural-sounding English voice
    const trySetVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.lang.startsWith('en') && (v.name.includes('Neural') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
      ) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];
      if (preferred) utterance.voice = preferred;
    };
    trySetVoice();
    // Fallback: voices may load async in some browsers
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { trySetVoice(); };
    }

    utterance.onend = () => {
      if (cancelled) return; // ignore if WE cancelled
      console.log("AI finished speaking");
      setState('idle');
      stateRef.current = 'idle';
      onEnd?.();
      onSpeakEndRef.current?.();
    };

    // onerror: do NOT call onEnd — an error should not advance the interview
    // flow; instead just reset state so it doesn't get stuck.
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      if (cancelled) return;
      // 'interrupted' is fired when cancel() is called — not a real error
      if (e.error === 'interrupted' || e.error === 'canceled') {
        console.log('[TTS] onerror: interrupted/cancelled — ignoring');
        return;
      }
      console.warn('[TTS] onerror:', e.error, '— resetting state, NOT advancing flow');
      setState('idle');
      stateRef.current = 'idle';
      onSpeakEndRef.current?.();
    };

    // Chrome bug: speechSynthesis silently pauses after ~15s of speech.
    // Safe workaround: use resume() only — do NOT call pause() first, as
    // pause()+resume() can re-trigger the onend event in some Chrome builds.
    const resumeHack = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(resumeHack);
        return;
      }
      window.speechSynthesis.resume();
    }, 10000);

    // Attach cleanup to utterance end/error so interval is always cleared
    const origOnEnd = utterance.onend;
    utterance.onend = (e) => {
      clearInterval(resumeHack);
      (origOnEnd as EventListener)?.(e);
    };
    const origOnError = utterance.onerror;
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      clearInterval(resumeHack);
      (origOnError as EventListener)?.(e);
    };

    // Store cancel fn on the utterance so cancelSpeech() can set the flag
    (utterance as any).__cancel = () => { cancelled = true; clearInterval(resumeHack); };

    window.speechSynthesis.speak(utterance);
    console.log('[TTS] window.speechSynthesis.speak() called');
  }, [isTTSSupported, onSpeakEnd]);

  // -- Cancel speech --
  const cancelSpeech = useCallback(() => {
    console.log('[TTS] cancelSpeech() called');
    // Fire the cancelled flag on the current utterance BEFORE cancel()
    // so that its onend/onerror do not advance the flow.
    if (utteranceRef.current) {
      (utteranceRef.current as any).__cancel?.();
      utteranceRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setState('idle');
    stateRef.current = 'idle';
  }, []);

  // -- Cleanup on unmount --
  useEffect(() => {
    return () => {
      clearSilence();
      try { recognitionRef.current?.stop(); } catch { }
      window.speechSynthesis?.cancel();
      stopVolumeAnalyser();
    };
  }, [clearSilence, stopVolumeAnalyser]);

  return {
    state,
    setState,
    liveText,
    setLiveText,
    volume,
    isSpeechSupported,
    isTTSSupported,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
  };
}
