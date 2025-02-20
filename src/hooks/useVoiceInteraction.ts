import { useState, useCallback, useEffect, useRef } from 'react';

interface VoiceInteractionOptions {
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: Error) => void;
  language?: string;
}

// Web Speech API types
interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal?: boolean;
}

interface SpeechRecognitionResults {
  [index: number]: SpeechRecognitionResult[];
  length: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResults;
  resultIndex: number;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useVoiceInteraction = ({
  onTranscriptionComplete,
  onError,
  language = 'en-US'
}: VoiceInteractionOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionConstructor();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1][0];
        const text = lastResult.transcript;
        setTranscript(text);
        
        if (lastResult.isFinal) {
          setIsProcessing(true);
          onTranscriptionComplete?.(text);
          setIsProcessing(false);
        }
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        onError?.(new Error(event.error));
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognitionRef.current = recognitionInstance;
    } else {
      onError?.(new Error('Speech recognition not supported in this browser'));
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [language, onTranscriptionComplete, onError]);

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setHasPermission(true);
    } catch (error) {
      onError?.(new Error('Microphone permission denied'));
      setHasPermission(false);
    }
  }, [onError]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || !hasPermission) return;
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      onError?.(new Error('Failed to start recording'));
      setIsRecording(false);
    }
  }, [hasPermission, onError]);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch (error) {
      onError?.(new Error('Failed to stop recording'));
    }
  }, [onError]);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
    } else {
      onError?.(new Error('Text-to-speech not supported in this browser'));
    }
  }, [language, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);

  return {
    isRecording,
    isProcessing,
    transcript,
    audioStream,
    hasPermission,
    startRecording,
    stopRecording,
    speak,
    requestPermissions
  };
}; 