import { useCallback, useEffect, useRef, useState } from 'react';

export type AudioRecorderStatus = 'idle' | 'recording' | 'stopped' | 'error';

export type UseAudioRecorderResult = {
  audioBlob: Blob | null;
  error: string;
  isRecording: boolean;
  status: AudioRecorderStatus;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
};

function getPreferredMimeType() {
  if (typeof window === 'undefined' || !('MediaRecorder' in window)) return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useAudioRecorder(): UseAudioRecorderResult {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const stoppingRef = useRef(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<AudioRecorderStatus>('idle');
  const [error, setError] = useState('');

  const releaseStream = useCallback(() => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    mediaStreamRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    const stream = mediaStreamRef.current;

    if (!recorder && !stream) {
      stoppingRef.current = false;
      setStatus((current) => (current === 'recording' ? 'idle' : current));
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
    setStatus((current) => (current === 'recording' ? 'stopped' : current));
  }, [releaseStream]);

  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia || !('MediaRecorder' in window)) {
      setStatus('error');
      setError('Trình duyệt chưa hỗ trợ ghi âm. Hãy thử Chrome hoặc bật quyền Microphone nha.');
      return;
    }

    stopRecording();

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

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        releaseStream();
        mediaRecorderRef.current = null;
        stoppingRef.current = false;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || preferredMimeType || 'audio/webm' });
        setAudioBlob(blob);
        setStatus(blob.size > 0 ? 'stopped' : 'idle');
      };

      recorder.onerror = () => {
        releaseStream();
        mediaRecorderRef.current = null;
        stoppingRef.current = false;
        setStatus('error');
        setError('Poo gặp lỗi khi ghi âm. Bạn kiểm tra quyền Microphone rồi thử lại nha.');
      };

      recorder.start(250);
    } catch {
      releaseStream();
      mediaRecorderRef.current = null;
      stoppingRef.current = false;
      setStatus('error');
      setError('Poo chưa được phép dùng Microphone. Hãy bật quyền Microphone rồi thử lại nha.');
    }
  }, [releaseStream, stopRecording]);

  const resetRecording = useCallback(() => {
    stopRecording();
    chunksRef.current = [];
    setAudioBlob(null);
    setError('');
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
      cleanup();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', cleanup);
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [stopRecording]);

  return {
    audioBlob,
    error,
    isRecording: status === 'recording',
    status,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
