import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'recorded' | 'error';

const UNSUPPORTED_MESSAGE = 'Trình duyệt này chưa hỗ trợ ghi âm.';
const PERMISSION_DENIED_MESSAGE = 'P-English cần quyền micro để ghi âm câu đọc.';
const NO_MICROPHONE_MESSAGE = 'Không tìm thấy micro trên thiết bị.';
const INTERRUPTED_MESSAGE = 'Micro bị ngắt khi đang ghi âm. Hãy thử lại với quyền micro đã bật.';
const EMPTY_RECORDING_MESSAGE = 'Chưa ghi được âm thanh. Hãy cho phép micro và thử nói lại câu mẫu.';

function getRecordingSupport() {
  return typeof window !== 'undefined'
    && typeof navigator !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia)
    && typeof MediaRecorder !== 'undefined';
}

function getPreferredAudioMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? '';
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function getRecorderErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError' || error.name === 'PermissionDeniedError') {
      return PERMISSION_DENIED_MESSAGE;
    }

    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return NO_MICROPHONE_MESSAGE;
    }
  }

  return PERMISSION_DENIED_MESSAGE;
}

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isSupported] = useState(getRecordingSupport);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const objectUrlRef = useRef<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const revokeAudioUrl = useCallback(() => {
    if (!objectUrlRef.current) return;
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const resetRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder?.state === 'recording') {
      recorder.stop();
    }

    stopTimer();
    stopStream(streamRef.current);
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = null;
    revokeAudioUrl();
    setAudioUrl(null);
    setDurationSeconds(0);
    setErrorMessage('');
    setState('idle');
  }, [revokeAudioUrl, stopTimer]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;
    recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setErrorMessage(UNSUPPORTED_MESSAGE);
      setState('error');
      return;
    }

    stopTimer();
    stopStream(streamRef.current);
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = null;
    revokeAudioUrl();
    setAudioUrl(null);
    setDurationSeconds(0);
    setErrorMessage('');
    setState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getPreferredAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        stopTimer();
        stopStream(streamRef.current);
        streamRef.current = null;
        recorderRef.current = null;
        setErrorMessage(INTERRUPTED_MESSAGE);
        setState('error');
      };

      recorder.onstop = () => {
        stopTimer();
        const elapsedSeconds = startedAtRef.current ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)) : durationSeconds;
        const type = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        stopStream(streamRef.current);
        streamRef.current = null;
        recorderRef.current = null;
        startedAtRef.current = null;

        if (!blob.size) {
          setDurationSeconds(0);
          setErrorMessage(EMPTY_RECORDING_MESSAGE);
          setState('error');
          return;
        }

        revokeAudioUrl();
        const nextUrl = URL.createObjectURL(blob);
        objectUrlRef.current = nextUrl;
        setAudioUrl(nextUrl);
        setDurationSeconds(elapsedSeconds);
        setErrorMessage('');
        setState('recorded');
      };

      recorder.start();
      startedAtRef.current = Date.now();
      setDurationSeconds(0);
      timerRef.current = window.setInterval(() => {
        if (!startedAtRef.current) return;
        setDurationSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);
      setState('recording');
    } catch (error) {
      stopTimer();
      stopStream(streamRef.current);
      streamRef.current = null;
      recorderRef.current = null;
      setDurationSeconds(0);
      setAudioUrl(null);
      setErrorMessage(getRecorderErrorMessage(error));
      setState('error');
    }
  }, [durationSeconds, isSupported, revokeAudioUrl, stopTimer]);

  useEffect(() => () => {
    const recorder = recorderRef.current;
    if (recorder?.state === 'recording') {
      recorder.stop();
    }
    stopTimer();
    stopStream(streamRef.current);
    revokeAudioUrl();
  }, [revokeAudioUrl, stopTimer]);

  return {
    state,
    errorMessage: !isSupported && state !== 'recording' ? UNSUPPORTED_MESSAGE : errorMessage,
    audioUrl,
    durationSeconds,
    startRecording,
    stopRecording,
    resetRecording,
    isSupported,
  };
}
