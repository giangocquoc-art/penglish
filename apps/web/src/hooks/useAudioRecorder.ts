import { useCallback, useEffect, useRef, useState } from 'react';

export type AudioRecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

export type UseAudioRecorderResult = {
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string;
  errorMessage: string;
  isRecording: boolean;
  isSupported: boolean;
  durationSeconds: number;
  status: AudioRecorderStatus;
  state: AudioRecorderStatus;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
};

function getPreferredMimeType() {
  if (typeof window === 'undefined' || !('MediaRecorder' in window)) return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/wav'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function isRecorderSupported() {
  return typeof window !== 'undefined' && 'MediaRecorder' in window && Boolean(navigator.mediaDevices?.getUserMedia);
}

export function useAudioRecorder(): UseAudioRecorderResult {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const stoppingRef = useRef(false);
  const startTimeRef = useRef(0);
  const tickerRef = useRef<number | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AudioRecorderStatus>('idle');
  const [error, setError] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);

  const clearTicker = useCallback(() => {
    if (tickerRef.current !== null) {
      window.clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  const releaseStream = useCallback(() => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    mediaStreamRef.current = null;
  }, []);

  // Keep a revocable object URL in sync with the latest blob.
  useEffect(() => {
    if (!audioBlob) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [audioBlob]);

  // Publish a stable object URL reference whenever one is created.
  const commitAudioUrl = useCallback((blob: Blob) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    setAudioUrl(url);
  }, []);

  const stopTicker = useCallback(() => {
    clearTicker();
    if (startTimeRef.current !== 0) {
      setDurationSeconds(Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000)));
    }
    startTimeRef.current = 0;
  }, [clearTicker]);

  const startTicker = useCallback(() => {
    startTimeRef.current = Date.now();
    setDurationSeconds(0);
    clearTicker();
    tickerRef.current = window.setInterval(() => {
      if (startTimeRef.current !== 0) {
        setDurationSeconds(Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000)));
      }
    }, 1000);
  }, [clearTicker]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    const stream = mediaStreamRef.current;

    if (!recorder && !stream) {
      stoppingRef.current = false;
      setStatus((current) => (current === 'recording' ? 'stopped' : current));
      return;
    }

    if (stoppingRef.current && !stream) return;
    stoppingRef.current = true;

    if (recorder) {
      mediaRecorderRef.current = null;
      if (recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          stoppingRef.current = false;
          setStatus('error');
          setError('Poo chưa dừng được lượt ghi âm. Bạn thử lại một lần nữa nha.');
        }
      } else {
        stoppingRef.current = false;
      }
    }

    releaseStream();
    stopTicker();
    setStatus((current) => (current === 'recording' ? 'stopped' : current));
  }, [releaseStream, stopTicker]);

  const startRecording = useCallback(async () => {
    if (!isRecorderSupported()) {
      setStatus('error');
      setError('Trình duyệt chưa hỗ trợ ghi âm. Hãy thử Chrome hoặc bật quyền Microphone nha.');
      return;
    }

    stopRecording();
    setStatus('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeType = getPreferredMimeType();
      const recorder = preferredMimeType ? new MediaRecorder(stream, { mimeType: preferredMimeType }) : new MediaRecorder(stream);
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      stoppingRef.current = false;
      setAudioBlob(null);
      setError('');
      setStatus('recording');
      startTicker();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        releaseStream();
        mediaRecorderRef.current = null;
        stoppingRef.current = false;
        stopTicker();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || preferredMimeType || 'audio/webm' });
        setAudioBlob(blob);
        setStatus(blob.size > 0 ? 'stopped' : 'idle');
      };

      recorder.onerror = () => {
        releaseStream();
        mediaRecorderRef.current = null;
        stoppingRef.current = false;
        stopTicker();
        setStatus('error');
        setError('Poo gặp lỗi khi ghi âm. Bạn kiểm tra quyền Microphone rồi thử lại nha.');
      };

      recorder.start(250);
    } catch {
      releaseStream();
      mediaRecorderRef.current = null;
      stoppingRef.current = false;
      stopTicker();
      setStatus('error');
      setError('Poo chưa được phép dùng Microphone. Hãy bật quyền Microphone rồi thử lại nha.');
    }
  }, [releaseStream, stopRecording, startTicker, stopTicker]);

  const resetRecording = useCallback(() => {
    stopRecording();
    chunksRef.current = [];
    setAudioBlob(null);
    setError('');
    setDurationSeconds(0);
    setStatus('idle');
  }, [stopRecording]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const cleanup = () => stopRecording();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') cleanup();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('beforeunload', cleanup);

    return () => {
      stopTicker();
      cleanup();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', cleanup);
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [stopRecording, stopTicker]);

  return {
    audioBlob,
    audioUrl,
    error,
    errorMessage: error,
    isRecording: status === 'recording',
    isSupported: isRecorderSupported(),
    durationSeconds,
    status,
    state: status,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
