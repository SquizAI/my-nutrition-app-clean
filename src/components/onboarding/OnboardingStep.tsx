import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useUserPreferences } from '../../services/userPreferences';
import { useMacroCalculator } from '../../services/macroCalculator';
import OpenAI from 'openai';
import { File } from '@web-std/file';
import { Mic, MicOff, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../shared/Button';
import { useToast } from '../shared/Toast';
import Modal from '../shared/Modal';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface OnboardingQuestion {
  id: string;
  text: string;
  voicePrompt: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'boolean' | 'date' | 'voice' | 'custom';
  options?: string[];
  validation?: (value: any) => boolean;
  required?: boolean;
  conditionalQuestions?: {
    if: string | string[];
    then: OnboardingQuestion[];
  };
}

interface OnboardingStepProps {
  step: {
    id: string;
    title: string;
    description: string;
    type: 'legal' | 'metrics' | 'health' | 'lifestyle' | 'nutrition' | 'preferences' | 'fitness' | 'cooking' | 'grocery' | 'tracking' | 'personalization';
    questions: OnboardingQuestion[];
  };
  currentStep: number;
  totalSteps: number;
  onNext: (responses: Record<string, any>) => void;
  onBack: () => void;
  onSkip?: () => void;
}

const StepContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const StepHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StepTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.gradients.text.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StepDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  line-height: 1.6;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.button.background};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;
`;

const Progress = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => `${$progress}%`};
  background: ${({ theme }) => theme.gradients.primary};
  transition: width 0.3s ease;
`;

const QuestionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Question = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const QuestionText = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (prefers-contrast: more) {
    color: ${({ theme }) => theme.colors.text.highContrast};
  }
`;

const VoiceInputContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
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

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const VoiceButton = styled(Button)<{ $isRecording: boolean }>`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  background: ${({ theme, $isRecording }) => 
    $isRecording ? theme.colors.error : theme.colors.button.background};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: block;
`;

const LegalAgreementButton = styled(motion.button)<{ $accepted: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $accepted }) => 
    $accepted ? `${theme.colors.primary}15` : theme.colors.background.card};
  border: 2px solid ${({ theme, $accepted }) => 
    $accepted ? theme.colors.primary : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}10`};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }

  &:hover::before {
    transform: translateX(100%);
  }
`;

const CheckIcon = styled(motion.div)<{ $accepted: boolean }>`
  width: 24px;
  height: 24px;
  border: 2px solid ${({ theme, $accepted }) => 
    $accepted ? theme.colors.primary : theme.colors.border.default};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  background: ${({ theme, $accepted }) => 
    $accepted ? `${theme.colors.primary}15` : 'transparent'};

  svg {
    color: ${({ theme }) => theme.colors.primary};
    opacity: ${({ $accepted }) => ($accepted ? 1 : 0)};
    transform: scale(${({ $accepted }) => ($accepted ? 1 : 0)});
    transition: all 0.2s ease;
  }
`;

const LegalText = styled.div`
  flex: 1;
`;

const LegalTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`;

const LegalDescription = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  line-height: 1.5;
`;

const MoreInfoButton = styled(Button)`
  margin-left: auto;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  min-width: 100px;
`;

const LegalContent = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  line-height: 1.6;

  h3 {
    color: ${({ theme }) => theme.colors.primary};
    margin: ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  ul {
    margin: ${({ theme }) => theme.spacing.md} 0;
    padding-left: ${({ theme }) => theme.spacing.xl};

    li {
      margin-bottom: ${({ theme }) => theme.spacing.sm};
    }
  }
`;

const OnboardingStep: React.FC<OnboardingStepProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [modalContent, setModalContent] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    content: null
  });
  const audioChunks = useRef<BlobPart[]>([]);
  const { addToast } = useToast();

  const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB

  useEffect(() => {
    // Load saved responses for this step if they exist
    const savedProgress = localStorage.getItem('onboardingProgress');
    if (savedProgress) {
      const { responses: savedResponses } = JSON.parse(savedProgress);
      if (savedResponses[step.id]) {
        setResponses(savedResponses[step.id]);
      }
    }
  }, [step.id]);

  const startRecording = async (questionId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await processAudioToText(audioBlob, questionId);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      addToast({
        type: 'error',
        message: 'Unable to start recording. Please check your microphone permissions.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  const processAudioToText = async (audioBlob: Blob, questionId: string) => {
    try {
      if (audioBlob.size > MAX_AUDIO_SIZE) {
        throw new Error('Audio file too large');
      }

      const file = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
      
      const response = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
      });

      if (response.text) {
        handleResponse(questionId, response.text);
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      addToast({
        type: 'error',
        message: 'Failed to process audio. Please try again or use text input.',
      });
    }
  };

  const validateResponse = (question: OnboardingQuestion, value: any): string | null => {
    if (question.required && !value) {
      return 'This field is required';
    }

    if (question.validation && !question.validation(value)) {
      switch (question.type) {
        case 'number':
          return 'Please enter a valid number within the acceptable range';
        case 'date':
          return 'Please enter a valid date';
        default:
          return 'Invalid input';
      }
    }

    return null;
  };

  const handleResponse = (questionId: string, value: any) => {
    const question = step.questions.find(q => q.id === questionId);
    if (!question) return;

    const error = validateResponse(question, value);
    
    setErrors(prev => ({
      ...prev,
      [questionId]: error || ''
    }));

    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Save progress to localStorage
    const savedProgress = localStorage.getItem('onboardingProgress');
    const progress = savedProgress ? JSON.parse(savedProgress) : { responses: {} };
    
    progress.responses[step.id] = {
      ...progress.responses[step.id],
      [questionId]: value
    };
    
    localStorage.setItem('onboardingProgress', JSON.stringify(progress));
  };

  const validateResponses = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    step.questions.forEach(question => {
      const error = validateResponse(question, responses[question.id]);
      if (error) {
        newErrors[question.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateResponses()) {
      onNext(responses);
    } else {
      addToast({
        type: 'error',
        message: 'Please fill in all required fields correctly before proceeding.',
      });
    }
  };

  const getLegalContent = (id: string) => {
    switch (id) {
      case 'terms':
        return (
          <LegalContent>
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing and using this application, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

            <h3>2. AI-Generated Content</h3>
            <p>Our application uses artificial intelligence to provide nutritional guidance and recommendations. You acknowledge that:</p>
            <ul>
              <li>AI-generated content is for informational purposes only</li>
              <li>Recommendations are based on the information you provide</li>
              <li>AI guidance does not replace professional medical advice</li>
            </ul>

            <h3>3. User Responsibilities</h3>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate information during onboarding</li>
              <li>Use the application responsibly</li>
              <li>Not rely solely on AI recommendations for medical decisions</li>
            </ul>
          </LegalContent>
        );
      case 'privacy':
        return (
          <LegalContent>
            <h3>1. Information Collection</h3>
            <p>We collect information you provide during onboarding and usage, including:</p>
            <ul>
              <li>Personal information (name, age, gender)</li>
              <li>Health metrics (height, weight, activity level)</li>
              <li>Dietary preferences and restrictions</li>
            </ul>

            <h3>2. Data Usage</h3>
            <p>Your information is used to:</p>
            <ul>
              <li>Personalize your nutrition recommendations</li>
              <li>Improve our AI models and services</li>
              <li>Provide customer support</li>
            </ul>

            <h3>3. Data Protection</h3>
            <p>We implement industry-standard security measures to protect your data, including:</p>
            <ul>
              <li>Encryption of sensitive information</li>
              <li>Secure data storage and transmission</li>
              <li>Regular security audits</li>
            </ul>
          </LegalContent>
        );
      default:
        return null;
    }
  };

  const renderLegalAgreement = (question: OnboardingQuestion) => {
    const isAccepted = responses[question.id];
    
    let title = '';
    let description = '';
    
    switch (question.id) {
      case 'terms':
        title = 'Terms of Service';
        description = 'By accepting, you agree to our terms of service and acknowledge that our AI-generated guidance does not replace medical treatment.';
        break;
      case 'privacy':
        title = 'Privacy Policy';
        description = 'Learn how we collect, use, and protect your personal information.';
        break;
      case 'medical':
        title = 'Medical Disclaimer';
        description = 'Our advice is general and not a substitute for professional medical guidance.';
        break;
    }

    return (
      <LegalAgreementButton
        key={question.id}
        $accepted={isAccepted}
        onClick={() => handleResponse(question.id, !isAccepted)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <CheckIcon 
          $accepted={isAccepted}
          initial={false}
          animate={isAccepted ? { scale: [1.2, 1] } : { scale: 1 }}
        >
          {isAccepted && <Check size={16} />}
        </CheckIcon>
        <LegalText>
          <LegalTitle>{title}</LegalTitle>
          <LegalDescription>{description}</LegalDescription>
        </LegalText>
        {question.id !== 'medical' && (
          <MoreInfoButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              const content = getLegalContent(question.id);
              if (content) {
                setModalContent({
                  isOpen: true,
                  title,
                  content
                });
              }
            }}
          >
            More Info
          </MoreInfoButton>
        )}
      </LegalAgreementButton>
    );
  };

  const renderQuestion = (question: OnboardingQuestion) => {
    if (step.type === 'legal' && (question.type === 'custom' || question.type === 'boolean')) {
      return renderLegalAgreement(question);
    }

    return (
      <Question key={question.id}>
        <QuestionText>
          {question.text}
          {question.required && <span aria-label="required" style={{ color: 'red' }}> *</span>}
        </QuestionText>
        <VoiceInputContainer>
          {question.type === 'text' && (
            <>
              <Input
                type="text"
                value={responses[question.id] || ''}
                onChange={(e) => handleResponse(question.id, e.target.value)}
                placeholder={question.voicePrompt}
                aria-label={question.text}
                aria-required={question.required}
                aria-invalid={!!errors[question.id]}
              />
              <VoiceButton
                $isRecording={isRecording}
                onClick={() => isRecording ? stopRecording() : startRecording(question.id)}
                variant="ghost"
                size="sm"
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </VoiceButton>
            </>
          )}

          {question.type === 'select' && (
            <Select
              value={responses[question.id] || ''}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              aria-label={question.text}
              aria-required={question.required}
              aria-invalid={!!errors[question.id]}
            >
              <option value="">{question.voicePrompt}</option>
              {question.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          )}

          {errors[question.id] && (
            <ErrorMessage role="alert">{errors[question.id]}</ErrorMessage>
          )}
        </VoiceInputContainer>
      </Question>
    );
  };

  return (
    <>
      <StepContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <ProgressBar>
          <Progress $progress={((currentStep + 1) / totalSteps) * 100} />
        </ProgressBar>

        <StepHeader>
          <StepTitle>{step.title}</StepTitle>
          <StepDescription>{step.description}</StepDescription>
        </StepHeader>

        <QuestionContainer>
          {step.questions.map(renderQuestion)}
        </QuestionContainer>

        <ButtonGroup>
          <Button
            onClick={onBack}
            variant="ghost"
            icon={<ChevronLeft size={20} />}
            aria-label="Go back"
          >
            Back
          </Button>
          {onSkip && (
            <Button
              onClick={onSkip}
              variant="secondary"
              aria-label="Skip this step"
            >
              Skip
            </Button>
          )}
          <Button
            onClick={handleNext}
            variant="primary"
            icon={<ChevronRight size={20} />}
            aria-label="Continue to next step"
            disabled={!validateResponses()}
          >
            Continue
          </Button>
        </ButtonGroup>
      </StepContainer>

      <Modal
        isOpen={modalContent.isOpen}
        onClose={() => setModalContent(prev => ({ ...prev, isOpen: false }))}
        title={modalContent.title}
      >
        {modalContent.content}
      </Modal>
    </>
  );
};

export default OnboardingStep; 