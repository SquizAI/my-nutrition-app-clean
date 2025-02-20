import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface AdvancedOnboardingStepProps {
  step: {
    id: string;
    title: string;
    description: string;
    voicePrompt: string;
    questions: Array<{
      id: string;
      text: string;
      voicePrompt: string;
      type: 'text' | 'select' | 'multiselect' | 'number' | 'boolean' | 'voice' | 'custom' | 'date';
      options?: string[];
      required?: boolean;
      additionalInfo?: string;
      conditionalQuestions?: Array<{
        condition: string;
        question: string;
        type: string;
        options?: string[];
      }>;
    }>;
  };
  currentStep: number;
  totalSteps: number;
  onNext: (responses: Record<string, any>) => void;
  onBack: () => void;
  onSkip?: () => void;
}

// Create base styled components
const StyledButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'skip' }>`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary':
        return theme.gradients.primary;
      case 'skip':
        return 'transparent';
      default:
        return theme.colors.background.card;
    }
  }};
  border: 2px solid ${({ theme, $variant }) => 
    $variant === 'primary' ? 'transparent' : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.colors.text.inverse : theme.colors.text.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ $variant }) => $variant === 'primary' ? 'bold' : 'normal'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 120px;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme, $variant }) => 
      $variant === 'primary' ? theme.shadows.button : 'none'};

    &:before {
      opacity: 0.05;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StyledReadyToSpeakButton = styled.button<{ $enabled: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ theme, $enabled }) => 
    $enabled ? theme.colors.primary : theme.colors.button.background};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme, $enabled }) => 
    $enabled ? theme.colors.text.inverse : theme.colors.text.secondary};
  cursor: ${({ $enabled }) => $enabled ? 'pointer' : 'not-allowed'};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  opacity: ${({ $enabled }) => $enabled ? 1 : 0.5};
  transition: all 0.2s ease;

  &:hover {
    transform: ${({ $enabled }) => $enabled ? 'translateY(-2px)' : 'none'};
  }
`;

const StyledVoiceButton = styled.button<{ $isRecording: boolean; $large?: boolean }>`
  background: ${({ theme, $isRecording }) => 
    $isRecording ? `rgba(${theme.colors.error}, 0.1)` : theme.colors.button.background};
  border: 2px solid ${({ theme, $isRecording }) => 
    $isRecording ? theme.colors.error : theme.colors.border.default};
  color: ${({ theme, $isRecording }) => 
    $isRecording ? theme.colors.error : theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  width: ${({ $large }) => $large ? '64px' : '44px'};
  height: ${({ $large }) => $large ? '64px' : '44px'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: scale(1.05);
    background: ${({ theme, $isRecording }) => 
      $isRecording ? `rgba(${theme.colors.error}, 0.2)` : theme.colors.button.hover};
  }

  &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.colors.primary};
    opacity: ${({ $isRecording }) => $isRecording ? 0.2 : 0};
    border-radius: 50%;
    animation: ${({ $isRecording }) => $isRecording ? 'pulse 2s infinite' : 'none'};
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.2; }
    50% { transform: scale(1.2); opacity: 0.1; }
    100% { transform: scale(1); opacity: 0.2; }
  }

  svg {
    width: ${({ $large }) => $large ? '32px' : '24px'};
    height: ${({ $large }) => $large ? '32px' : '24px'};
  }
`;

const StyledOptionButton = styled.button<{ $selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $selected }) => 
    $selected ? theme.colors.primary + '20' : theme.colors.background.card};
  border: 1px solid ${({ theme, $selected }) => 
    $selected ? theme.colors.primary : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const StyledStepContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const StyledAdditionalInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
`;

// Update motion components creation
const Button = motion.create(StyledButton);
const ReadyToSpeakButton = motion.create(StyledReadyToSpeakButton);
const VoiceButton = motion.create(StyledVoiceButton);
const OptionButton = motion.create(StyledOptionButton);
const StepContainer = motion.create(StyledStepContainer);
const AdditionalInfo = motion.create(StyledAdditionalInfo);

const StepHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StepTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StepDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const QuestionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Question = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const QuestionText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-right: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const VoiceInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const VoiceStatus = styled.div<{ $isRecording: boolean }>`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme, $isRecording }) => 
    $isRecording ? theme.colors.error : theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  white-space: nowrap;
  opacity: ${({ $isRecording }) => $isRecording ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const VoicePrompt = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
  justify-content: space-between;
  align-items: center;
`;

const NavigationInfo = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ButtonIcon = styled.span`
  font-size: 20px;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const VoiceProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const VoiceInteractionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const AIStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const AISpeakingIndicator = styled.div<{ $isSpeaking: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, $isSpeaking }) => 
    $isSpeaking ? theme.colors.primary + '20' : theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};

  svg {
    animation: ${({ $isSpeaking }) => $isSpeaking ? 'pulse 1s infinite' : 'none'};
  }
`;

const HeightInputContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  width: 100%;
`;

const HeightInput = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1;
`;

const UnitLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  min-width: 30px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  overflow: hidden;
`;

const Progress = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => `${$progress}%`};
  background: ${({ theme }) => theme.gradients.primary};
  transition: width 0.3s ease;
`;

// Update type declarations for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  results: {
    0: {
      0: {
        transcript: string;
      };
    };
  };
}

const AdvancedOnboardingStep: React.FC<AdvancedOnboardingStepProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [canUserSpeak, setCanUserSpeak] = useState(false);
  const audioChunks = useRef<BlobPart[]>([]);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Add new state for speech synthesis
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechInitialized, setSpeechInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const currentQuestion = step.questions[currentQuestionIndex] || step.questions[0];

  const speakPrompt = useCallback((text: string) => {
    console.log('Attempting to speak:', text);
    console.log('Speech initialized:', speechInitialized);
    console.log('Selected voice:', selectedVoice);
    
    if (!speechInitialized || !selectedVoice) {
      console.warn('Speech not initialized or no voice selected');
      setSpeechError('Speech not initialized. Click to initialize.');
      return;
    }

    try {
      // Ensure speech synthesis is in a clean state
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      console.log('Created utterance:', utterance);
      console.log('Using voice:', utterance.voice);

      let speakTimeout: number;
      let resetInterval: number;
      
      const cleanupSpeech = () => {
        if (speakTimeout) window.clearTimeout(speakTimeout);
        if (resetInterval) window.clearInterval(resetInterval);
        window.speechSynthesis.cancel();
      };

      utterance.onstart = () => {
        console.log('Speech started');
        setIsAISpeaking(true);
        
        // Chrome fix: Keep speech synthesis active
        resetInterval = window.setInterval(() => {
          if (window.speechSynthesis.speaking) {
            // Briefly pause and resume to keep the speech going
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else {
            window.clearInterval(resetInterval);
          }
        }, 5000);
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
        setIsAISpeaking(false);
        setCanUserSpeak(true);
        cleanupSpeech();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        cleanupSpeech();
        if (event.error !== 'canceled') {
          setIsAISpeaking(false);
          setCanUserSpeak(true);
          setSpeechError(`Error during speech: ${event.error}`);
          
          // Try speaking again after a short delay
          speakTimeout = window.setTimeout(() => {
            console.log('Retrying speech...');
            window.speechSynthesis.speak(utterance);
          }, 1000);
        }
      };
      
      // Force a clean state before speaking
      window.speechSynthesis.resume();
      console.log('Speaking utterance');
      window.speechSynthesis.speak(utterance);

      // Cleanup on component unmount or when speech changes
      return cleanupSpeech;
    } catch (error) {
      console.error('Speech error:', error);
      setSpeechError(`Error during speech: ${error}`);
      setIsAISpeaking(false);
      setCanUserSpeak(true);
    }
  }, [speechInitialized, selectedVoice]);

  const initializeSpeech = useCallback(async () => {
    if (isInitializing) {
      console.log('Already initializing speech');
      return;
    }
    
    console.log('Starting speech initialization');
    setIsInitializing(true);
    
    try {
      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis not supported in this browser');
      }

      // Force a clean state
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      // Test audio context to ensure audio is allowed
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        await audioContext.resume();
      }

      console.log('Getting voices...');
      const waitForVoices = new Promise<SpeechSynthesisVoice[]>((resolve, reject) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log('Voices immediately available:', voices.length);
          resolve(voices);
        } else {
          console.log('Waiting for voices to load...');
          let attempts = 0;
          const maxAttempts = 5;
          
          const checkVoices = () => {
            attempts++;
            const newVoices = window.speechSynthesis.getVoices();
            if (newVoices.length > 0) {
              console.log('Voices loaded after wait:', newVoices.length);
              resolve(newVoices);
            } else if (attempts >= maxAttempts) {
              reject(new Error('Failed to load voices after multiple attempts'));
            } else {
              setTimeout(checkVoices, 1000); // Try again after 1 second
            }
          };

          window.speechSynthesis.onvoiceschanged = checkVoices;
          checkVoices();
        }
      });

      const voices = await waitForVoices;
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      if (voices.length === 0) {
        throw new Error('No voices available - please try again');
      }

      setVoices(voices);
      
      // Try to find a good English voice, preferring native voices
      const preferredVoices = [
        voices.find(v => v.name === 'Samantha' && v.lang === 'en-US'),  // macOS default
        voices.find(v => v.name === 'Google US English' && v.lang === 'en-US'),
        voices.find(v => v.name.includes('English') && v.lang === 'en-US' && !v.name.includes('Eddy')),
        voices.find(v => v.lang === 'en-US'),
        voices.find(v => v.lang.startsWith('en')),
        voices[0]
      ];
      
      const selectedVoice = preferredVoices.find(v => v !== undefined);
      console.log('Selected voice:', selectedVoice?.name);
      
      if (selectedVoice) {
        setSelectedVoice(selectedVoice);
        
        // Test the voice with a silent utterance
        const testUtterance = new SpeechSynthesisUtterance('');
        testUtterance.voice = selectedVoice;
        testUtterance.volume = 0;
        window.speechSynthesis.speak(testUtterance);
        
        console.log('Speech initialization successful');
        setSpeechInitialized(true);
        setSpeechError(null);
      } else {
        throw new Error('No suitable voice found');
      }
    } catch (error) {
      console.error('Speech initialization error:', error);
      setSpeechError(error instanceof Error ? error.message : 'Unknown speech error');
      // Reset initialization state to allow retry
      setSpeechInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing]);

  // Remove the one-time initialization effect and replace with continuous initialization check
  useEffect(() => {
    const initializeVoiceFeatures = async () => {
      if (!speechInitialized && !isInitializing) {
        await initializeSpeech();
      }
    };

    // Try to initialize on mount and whenever the component updates
    initializeVoiceFeatures();

    // Cleanup function
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechInitialized, isInitializing, initializeSpeech]);

  // Update the voice prompt effect to retry if initialization fails
  useEffect(() => {
    if (step?.voicePrompt) {
      if (!speechInitialized || !selectedVoice) {
        // If speech isn't initialized, try to initialize it
        if (!isInitializing) {
          console.log('Speech not initialized, attempting initialization...');
          initializeSpeech();
        }
      } else if (!isInitializing) {
        const intro = `Step ${currentStep + 1} of ${totalSteps}. ${step.title}.`;
        speakPrompt(intro + ' ' + step.voicePrompt);
      }
    }
  }, [
    step,
    currentStep,
    totalSteps,
    speechInitialized,
    selectedVoice,
    speakPrompt,
    isInitializing,
    initializeSpeech
  ]);

  // Add this useEffect to check microphone permission on component mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setMicPermission('granted'))
      .catch(() => setMicPermission('denied'));
  }, []);

  // Update the voice command handling
  useEffect(() => {
    if (canUserSpeak && micPermission === 'granted') {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionConstructor) {
        console.warn('Speech recognition not supported in this browser');
        return;
      }

      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const command = event.results[0][0].transcript.toLowerCase();
        
        // Handle navigation commands
        if (command.includes('back') || command.includes('previous')) {
          onBack();
        } else if (command.includes('skip')) {
          onSkip?.();
        } else if (command.includes('next') || command.includes('continue')) {
          onNext(responses);
        }
      };

      return () => {
        recognition.stop();
      };
    }
  }, [canUserSpeak, micPermission, onBack, onSkip, onNext, responses]);

  const startRecording = async (questionId: string) => {
    if (!canUserSpeak) {
      alert('Please wait for the AI to finish speaking.');
      return;
    }

    try {
      if (micPermission === 'denied') {
        alert('Please enable microphone access to use voice input.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await processAudioResponse(audioBlob, questionId);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setCanUserSpeak(false);

      // Auto-stop recording after 10 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          stopRecording();
        }
      }, 10000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('There was an error accessing your microphone. Please try again.');
      setMicPermission('denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
      setCanUserSpeak(true);
    }
  };

  const processAudioResponse = async (audioBlob: Blob, questionId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en'); // Force English language
      formData.append('response_format', 'json');

      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBlob], 'audio.wav', { type: 'audio/wav' }),
        model: 'whisper-1',
        language: 'en', // Force English language
        response_format: 'json',
      });

      console.log('Transcription result:', transcription);

      if (transcription.text) {
        // Validate the transcription is in English
        const isEnglishRegex = /^[a-zA-Z0-9\s.,!?'-]+$/;
        const cleanedText = transcription.text.trim();
        
        if (!isEnglishRegex.test(cleanedText)) {
          console.warn('Non-English text detected:', cleanedText);
          alert('Please speak in English.');
          return;
        }

        // For height input, try to parse feet and inches
        if (questionId === 'height') {
          const heightRegex = /(\d+)\s*(?:feet|foot|ft)?\s*(?:and)?\s*(\d+)?\s*(?:inches|inch|in)?/i;
          const match = cleanedText.match(heightRegex);
          
          if (match) {
            const feet = parseInt(match[1]) || 0;
            const inches = parseInt(match[2]) || 0;
            handleResponse(`${questionId}_feet`, feet.toString());
            handleResponse(`${questionId}_inches`, inches.toString());
            handleResponse(questionId, (feet * 12) + inches);
          } else {
            handleResponse(questionId, cleanedText);
          }
        } else {
          handleResponse(questionId, cleanedText);
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('There was an error processing your voice input. Please try typing instead.');
    }
  };

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Get the current question safely
    const currentQuestion = step?.questions?.[currentQuestionIndex];
    
    // Only process conditional questions if they exist
    if (currentQuestion && 'conditionalQuestions' in currentQuestion && Array.isArray(currentQuestion.conditionalQuestions)) {
      const conditionalQuestion = currentQuestion.conditionalQuestions.find(q => 
        q.condition === value
      );
      
      if (conditionalQuestion) {
        // Create a copy of the questions array instead of modifying the original
        const updatedQuestions = [...step.questions];
        updatedQuestions.splice(currentQuestionIndex + 1, 0, {
          ...conditionalQuestion,
          id: `${questionId}_conditional`,
          text: conditionalQuestion.question,
          voicePrompt: conditionalQuestion.question,
          type: conditionalQuestion.type as any,
          options: conditionalQuestion.options
        });
        
        // Update the step with the new questions
        step.questions = updatedQuestions;
      }
    }

    // Only move to next question if there are more questions
    if (currentQuestionIndex < (step?.questions?.length ?? 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const renderQuestion = (question: typeof step.questions[0]) => {
    if (!question) return null;

    return (
      <VoiceInteractionContainer>
        <StepIndicator>
          <VoiceProgressIndicator>
            Step {currentStep + 1} of {totalSteps}
          </VoiceProgressIndicator>
        </StepIndicator>

        <AIStatusContainer>
          <AISpeakingIndicator $isSpeaking={isAISpeaking}>
            <Volume2 size={16} />
            {isAISpeaking ? 'AI is speaking...' : 'AI finished speaking'}
          </AISpeakingIndicator>
          {!speechInitialized && (
            <ReadyToSpeakButton
              $enabled={true}
              onClick={() => initializeSpeech()}
              initial={{ scale: 1 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isInitializing}
            >
              {isInitializing ? 'Initializing...' : 'Initialize Speech'}
            </ReadyToSpeakButton>
          )}
          {speechError && (
            <div style={{ color: 'red', fontSize: '14px' }}>{speechError}</div>
          )}
        </AIStatusContainer>

        {question.voicePrompt && (
          <VoicePrompt>
            <span>🎤</span> {question.voicePrompt}
            <small>
              {canUserSpeak ? 
                'You can speak now or use the buttons below' : 
                'Please wait for AI to finish speaking'}
            </small>
          </VoicePrompt>
        )}
        
        <VoiceInputContainer>
          {renderInput(question)}
          <VoiceButton
            $isRecording={isRecording}
            $large={true}
            onClick={() => {
              if (isRecording) {
                stopRecording();
              } else if (canUserSpeak) {
                startRecording(question.id);
              } else {
                alert('Please wait for the AI to finish speaking.');
              }
            }}
            whileHover={{ scale: canUserSpeak || isRecording ? 1.05 : 1 }}
            whileTap={{ scale: canUserSpeak || isRecording ? 0.95 : 1 }}
            title={isRecording ? "Stop Recording" : canUserSpeak ? "Start Recording" : "Wait for AI"}
            disabled={!canUserSpeak && !isRecording}
          >
            {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            <VoiceStatus $isRecording={isRecording}>
              {isRecording ? 'Recording...' : canUserSpeak ? 'Click to speak' : 'Wait for AI'}
            </VoiceStatus>
          </VoiceButton>
        </VoiceInputContainer>

        {question.additionalInfo && (
          <AdditionalInfo
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {question.additionalInfo}
          </AdditionalInfo>
        )}
      </VoiceInteractionContainer>
    );
  };

  const renderInput = (question: typeof step.questions[0]) => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            placeholder={question.text || ''}
          />
        );

      case 'number':
        if (question.id === 'height') {
          return (
            <HeightInputContainer>
              <HeightInput>
                <Input
                  type="number"
                  value={responses[`${question.id}_feet`] || ''}
                  onChange={(e) => {
                    const feet = parseInt(e.target.value) || 0;
                    const inches = parseInt(responses[`${question.id}_inches`]) || 0;
                    const totalInches = (feet * 12) + inches;
                    handleResponse(`${question.id}_feet`, e.target.value);
                    handleResponse(question.id, totalInches);
                  }}
                  placeholder="Feet"
                  min="0"
                  max="8"
                />
                <UnitLabel>ft</UnitLabel>
              </HeightInput>
              <HeightInput>
                <Input
                  type="number"
                  value={responses[`${question.id}_inches`] || ''}
                  onChange={(e) => {
                    const inches = parseInt(e.target.value) || 0;
                    const feet = parseInt(responses[`${question.id}_feet`]) || 0;
                    const totalInches = (feet * 12) + inches;
                    handleResponse(`${question.id}_inches`, e.target.value);
                    handleResponse(question.id, totalInches);
                  }}
                  placeholder="Inches"
                  min="0"
                  max="11"
                />
                <UnitLabel>in</UnitLabel>
              </HeightInput>
            </HeightInputContainer>
          );
        }
        return (
          <Input
            type="number"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            placeholder={question.text || ''}
          />
        );

      case 'select':
      case 'multiselect':
        return (
          <OptionsGrid>
            {question.options?.map(option => (
              <OptionButton
                key={option}
                $selected={question.type === 'multiselect' 
                  ? responses[question.id]?.includes(option)
                  : responses[question.id] === option
                }
                onClick={() => {
                  if (question.type === 'multiselect') {
                    const current = responses[question.id] || [];
                    const updated = current.includes(option)
                      ? current.filter((o: string) => o !== option)
                      : [...current, option];
                    handleResponse(question.id, updated);
                  } else {
                    handleResponse(question.id, option);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsGrid>
        );

      case 'boolean':
        return (
          <OptionsGrid>
            <OptionButton
              $selected={responses[question.id] === true}
              onClick={() => handleResponse(question.id, true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Yes
            </OptionButton>
            <OptionButton
              $selected={responses[question.id] === false}
              onClick={() => handleResponse(question.id, false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              No
            </OptionButton>
          </OptionsGrid>
        );

      default:
        return null;
    }
  };

  return (
    <StepContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <ProgressBar>
        <Progress $progress={(currentStep / totalSteps) * 100} />
      </ProgressBar>

      <StepHeader>
        <StepTitle>{step.title || 'Loading...'}</StepTitle>
        <StepDescription>{step.description || ''}</StepDescription>
      </StepHeader>

      <QuestionContainer>
        <Question>
          <QuestionText>
            {currentQuestion?.text || ''}
            {currentQuestion?.required && <span style={{ color: 'red' }}>*</span>}
          </QuestionText>
          {currentQuestion && renderQuestion(currentQuestion)}
        </Question>
      </QuestionContainer>

      <NavigationInfo>
        {currentStep === 0 ? (
          "Let's get started with your personalized setup"
        ) : currentStep === totalSteps - 1 ? (
          "Almost done! Review and complete your profile"
        ) : (
          `Step ${currentStep + 1} of ${totalSteps} - ${step.title}`
        )}
      </NavigationInfo>

      <ButtonGroup>
        <Button
          onClick={onBack}
          $variant="secondary"
          initial={false}
          layout
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={currentStep === 0}
        >
          <ButtonIcon>←</ButtonIcon>
          Back
        </Button>

        {onSkip && (
          <Button
            onClick={onSkip}
            $variant="skip"
            initial={false}
            layout
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Skip for now
          </Button>
        )}

        <Button
          $variant="primary"
          onClick={() => onNext(responses)}
          initial={false}
          layout
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {currentStep === totalSteps - 1 ? (
            <>
              Finish <ButtonIcon>✨</ButtonIcon>
            </>
          ) : (
            <>
              Continue <ButtonIcon>→</ButtonIcon>
            </>
          )}
        </Button>
      </ButtonGroup>
    </StepContainer>
  );
};

export default AdvancedOnboardingStep; 