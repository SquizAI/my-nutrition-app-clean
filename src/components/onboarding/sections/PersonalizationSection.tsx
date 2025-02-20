import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { theme } from '../../../styles/theme';
import { 
  FaMicrophone, FaStop, FaCheck, FaArrowRight, FaInfoCircle, 
  FaUtensils, FaClock, FaCalendarAlt, FaChartLine
} from 'react-icons/fa';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import toast from 'react-hot-toast';
import { z } from 'zod';

// Base styled components
const Container = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.card};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.card};
  backdrop-filter: ${theme.blur.card};
`;

const Title = styled(motion.h2)`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.xl};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
  background: ${theme.gradients.text.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const QuestionText = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.lg};
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.xl} 0;
`;

const OptionButton = styled(motion.button)<{ $selected?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${props => props.$selected ? 
    'rgba(49, 229, 255, 0.1)' : 
    'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.$selected ? 
    theme.colors.primary : 
    theme.colors.border.default
  };
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(49, 229, 255, 0.05);
    transform: translateY(-2px);
  }

  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.button.background};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSizes.md};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.button.hover};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  resize: vertical;
  margin-top: ${theme.spacing.lg};
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

// Zod schema for personalization responses
export const PersonalizationSchema = z.object({
  mealPrep: z.enum(['yes', 'no', 'maybe_later']),
  additionalInfo: z.string().optional(),
  preview: z.enum(['preview', 'skip', 'finish'])
});

export type PersonalizationResponses = z.infer<typeof PersonalizationSchema>;

interface PersonalizationSectionProps {
  onComplete: (responses: PersonalizationResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<PersonalizationResponses>;
}

const QUESTIONS = [
  {
    id: 'mealPrep',
    text: 'Do you want help with meal prep strategies?',
    voicePrompt: 'Do you want help with meal prep strategies?',
    infoText: 'We can provide tips and strategies for efficient meal preparation.',
    options: [
      {
        value: 'yes',
        label: 'Yes',
        description: 'Help me prep',
        icon: FaUtensils,
        color: '#31E5FF'
      },
      {
        value: 'no',
        label: 'No',
        description: 'Not needed',
        icon: FaClock,
        color: '#FF4D4D'
      },
      {
        value: 'maybe_later',
        label: 'Maybe Later',
        description: 'Decide later',
        icon: FaCalendarAlt,
        color: '#FFB020'
      }
    ]
  },
  {
    id: 'preview',
    text: 'Would you like to see a preview of your personalized plan?',
    voicePrompt: 'Would you like to see a preview of your personalized plan?',
    infoText: 'We can show you a sample of your personalized nutrition recommendations.',
    options: [
      {
        value: 'preview',
        label: 'Show Preview',
        description: 'See sample plan',
        icon: FaChartLine,
        color: '#31E5FF'
      },
      {
        value: 'skip',
        label: 'Skip Preview',
        description: 'Go to dashboard',
        icon: FaArrowRight,
        color: '#FFB020'
      },
      {
        value: 'finish',
        label: 'Finish Setup',
        description: 'Complete onboarding',
        icon: FaCheck,
        color: '#6BFF8E'
      }
    ]
  }
];

export const PersonalizationSection: React.FC<PersonalizationSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Partial<PersonalizationResponses>>(initialResponses);
  const [additionalInfo, setAdditionalInfo] = useState(initialResponses.additionalInfo || '');

  const {
    isRecording,
    isProcessing,
    transcript,
    startRecording,
    stopRecording,
    speak,
    hasPermission,
  } = useVoiceInteraction({
    onTranscriptionComplete: (text) => {
      if (currentQuestion === 1) {
        // For additional info question, append to text area
        setAdditionalInfo(prev => prev ? `${prev}\n${text}` : text);
        toast.success('Additional details recorded');
      } else {
        handleVoiceResponse(text);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handle voice responses
  const handleVoiceResponse = useCallback((text: string) => {
    const question = QUESTIONS[currentQuestion];
    const option = question.options.find(opt => 
      text.toLowerCase().includes(opt.label.toLowerCase()) ||
      text.toLowerCase().includes(opt.value.toLowerCase())
    );

    if (option) {
      handleResponse(option.value as any);
      speak(`Selected ${option.label}. Is this correct?`);
    } else {
      speak("I didn't catch that. Please try again or use the buttons to select your response.");
    }
  }, [currentQuestion, speak]);

  // Handle responses
  const handleResponse = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [QUESTIONS[currentQuestion].id]: value
    }));

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete({
        ...responses,
        [QUESTIONS[currentQuestion].id]: value,
        additionalInfo
      } as PersonalizationResponses);
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Title>Personalization & Final Details</Title>

      <QuestionText>
        {QUESTIONS[currentQuestion].text}
      </QuestionText>

      <OptionsGrid>
        {QUESTIONS[currentQuestion].options.map(option => (
          <OptionButton
            key={option.value}
            $selected={responses[QUESTIONS[currentQuestion].id as keyof PersonalizationResponses] === option.value}
            onClick={() => handleResponse(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <option.icon />
            {option.label}
            {responses[QUESTIONS[currentQuestion].id as keyof PersonalizationResponses] === option.value && <FaCheck />}
          </OptionButton>
        ))}
      </OptionsGrid>

      {currentQuestion === 1 && (
        <TextArea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="Any final details you'd like to share? You can type or use voice recording..."
          rows={5}
        />
      )}

      <ButtonGroup>
        <Button onClick={onPrevious}>
          Back
        </Button>
        
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
          {isRecording ? 'Stop' : 'Start'} Recording
        </Button>

        <Button onClick={() => speak(QUESTIONS[currentQuestion].infoText)}>
          <FaInfoCircle /> More Info
        </Button>
      </ButtonGroup>
    </Container>
  );
}; 