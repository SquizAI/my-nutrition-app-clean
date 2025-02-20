import React, { useEffect, useCallback, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { theme } from '../../../styles/theme';
import { FaMicrophone, FaStop, FaCheck, FaArrowRight, FaInfoCircle, FaRedo, FaPlus } from 'react-icons/fa';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import toast from 'react-hot-toast';
import { z } from 'zod';

// Styled components (reuse common styles)
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

// Add missing styled components after the Title component
const Question = styled(motion.div)`
  margin: ${theme.spacing.lg} 0;
`;

const QuestionText = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.lg};
  margin-bottom: ${theme.spacing.md};
`;

const ResponseArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
`;

const OptionButton = styled(motion.button)<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
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
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    background: rgba(49, 229, 255, 0.05);
    transform: translateY(-2px);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
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

const InfoButton = styled(Button)`
  background: transparent;
  border: 1px solid ${theme.colors.border.default};
  
  &:hover {
    border-color: ${theme.colors.border.hover};
  }
`;

const ErrorMessage = styled(motion.div)`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSizes.sm};
  margin-top: ${theme.spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

// Zod schema for eating habits responses
export const EatingHabitsSchema = z.object({
  mealsPerDay: z.number().min(1).max(10),
  mealTiming: z.array(z.string()),
  snackingHabits: z.enum(['rarely', 'sometimes', 'often', 'very_often']),
  trackingMethod: z.enum(['none', 'app', 'journal', 'mental_tracking', 'other']),
  foodRelationship: z.enum(['positive', 'neutral', 'complicated', 'negative']),
  emotionalEating: z.enum(['rarely', 'sometimes', 'often', 'very_often']),
  mealPlanningStyle: z.enum(['strict', 'flexible', 'intuitive', 'none']),
  dietaryRestrictions: z.array(z.string()),
  customRestrictions: z.array(z.string()).optional(),
});

export type EatingHabitsResponses = z.infer<typeof EatingHabitsSchema>;

interface EatingHabitsSectionProps {
  onComplete: (responses: EatingHabitsResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<EatingHabitsResponses>;
}

export const EatingHabitsSection: React.FC<EatingHabitsSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {},
}) => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Partial<EatingHabitsResponses>>(initialResponses);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localTranscript, setLocalTranscript] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    initialResponses.dietaryRestrictions || []
  );
  const [customRestriction, setCustomRestriction] = useState('');

  const {
    isRecording,
    isProcessing,
    error,
    transcript,
    startRecording,
    stopRecording,
    speak,
    requestPermissions,
    hasPermission,
  } = useVoiceInteraction({
    onTranscriptionComplete: (text) => {
      setLocalTranscript(text);
      toast.success('Response recorded successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const questions = [
    {
      id: 'mealsPerDay',
      text: 'How many meals do you typically eat per day?',
      voicePrompt: 'How many meals do you typically eat in a day, including snacks?',
      infoText: 'This helps us understand your eating frequency and meal distribution.',
      options: [
        { value: 2, label: '2 Meals' },
        { value: 3, label: '3 Meals' },
        { value: 4, label: '4 Meals' },
        { value: 5, label: '5+ Meals' },
      ],
    },
    {
      id: 'mealTiming',
      text: 'When do you usually eat your meals?',
      voicePrompt: 'What times of day do you usually eat your meals? You can select multiple options.',
      infoText: 'Understanding your meal timing helps us optimize your nutrition schedule.',
      options: [
        { value: 'early_morning', label: 'Early Morning (5-7am)' },
        { value: 'morning', label: 'Morning (7-10am)' },
        { value: 'late_morning', label: 'Late Morning (10am-12pm)' },
        { value: 'early_afternoon', label: 'Early Afternoon (12-2pm)' },
        { value: 'afternoon', label: 'Afternoon (2-4pm)' },
        { value: 'evening', label: 'Evening (4-7pm)' },
        { value: 'late_evening', label: 'Late Evening (7-10pm)' },
        { value: 'night', label: 'Night (After 10pm)' },
      ],
      isMultiSelect: true,
    },
    {
      id: 'snackingHabits',
      text: 'How often do you snack between meals?',
      voicePrompt: 'How often do you find yourself snacking between meals?',
      infoText: 'This helps us understand your eating patterns and plan appropriate snacks.',
      options: [
        { value: 'rarely', label: 'Rarely' },
        { value: 'sometimes', label: 'Sometimes' },
        { value: 'often', label: 'Often' },
        { value: 'very_often', label: 'Very Often' },
      ],
    },
    {
      id: 'trackingMethod',
      text: 'How do you currently track your food intake?',
      voicePrompt: 'Do you use any method to track your food intake? This could be an app, journal, or mental tracking.',
      infoText: 'Understanding your tracking preferences helps us provide suitable recommendations.',
      options: [
        { value: 'none', label: 'No Tracking' },
        { value: 'app', label: 'Food Tracking App' },
        { value: 'journal', label: 'Food Journal' },
        { value: 'mental_tracking', label: 'Mental Tracking' },
        { value: 'other', label: 'Other Method' },
      ],
    },
    {
      id: 'foodRelationship',
      text: 'How would you describe your relationship with food?',
      voicePrompt: 'How would you describe your overall relationship with food? Is it positive, neutral, complicated, or negative?',
      infoText: 'This helps us provide appropriate support and guidance.',
      options: [
        { value: 'positive', label: 'Positive' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'complicated', label: 'Complicated' },
        { value: 'negative', label: 'Negative' },
      ],
    },
    {
      id: 'mealPlanningStyle',
      text: 'What is your preferred meal planning style?',
      voicePrompt: 'How do you prefer to plan your meals? Are you strict, flexible, intuitive, or do you prefer not to plan?',
      infoText: 'This helps us tailor our meal planning recommendations to your style.',
      options: [
        { value: 'strict', label: 'Strict Planning' },
        { value: 'flexible', label: 'Flexible Planning' },
        { value: 'intuitive', label: 'Intuitive Eating' },
        { value: 'none', label: 'No Planning' },
      ],
    },
    {
      id: 'dietaryRestrictions',
      text: 'Do you have any dietary restrictions or preferences?',
      voicePrompt: 'Do you have any dietary restrictions or preferences? You can select multiple options or add your own.',
      infoText: 'This ensures our recommendations align with your dietary needs and preferences.',
      options: [
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
        { value: 'gluten_free', label: 'Gluten-Free' },
        { value: 'dairy_free', label: 'Dairy-Free' },
        { value: 'keto', label: 'Ketogenic' },
        { value: 'paleo', label: 'Paleo' },
        { value: 'halal', label: 'Halal' },
        { value: 'kosher', label: 'Kosher' },
        { value: 'low_carb', label: 'Low-Carb' },
        { value: 'low_fat', label: 'Low-Fat' },
      ],
      isMultiSelect: true,
    },
  ];

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      await startRecording();
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
  };

  const showInfo = useCallback(() => {
    const question = questions[currentQuestion];
    if (hasPermission) {
      speak(question.infoText).catch(error => {
        console.error('Failed to speak info:', error);
        toast.error('Failed to speak additional information. Please try again.');
      });
    } else {
      toast.error('Please enable voice features to hear additional information.');
    }
  }, [currentQuestion, questions, speak, hasPermission]);

  const handleResponse = useCallback((response: string | string[] | number) => {
    const question = questions[currentQuestion];
    
    if (Array.isArray(response)) {
      setResponses(prev => ({
        ...prev,
        [question.id]: response,
      }));
    } else {
      setResponses(prev => ({
        ...prev,
        [question.id]: response,
      }));
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setLocalTranscript('');
    } else {
      try {
        const validated = EatingHabitsSchema.parse({
          ...responses,
          dietaryRestrictions: selectedRestrictions,
        });
        onComplete(validated);
      } catch (error) {
        if (error instanceof Error) {
          setValidationError(error.message);
          toast.error('Please ensure all questions are answered before continuing.');
        }
      }
    }
  }, [currentQuestion, questions, responses, selectedRestrictions, onComplete]);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      role="region"
      aria-label="Eating Habits Collection"
    >
      <Title>Current Eating & Food Relationships</Title>
      
      <AnimatePresence mode="wait">
        <Question
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <QuestionText>{questions[currentQuestion].text}</QuestionText>
          
          <ResponseArea>
            {!hasPermission && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button onClick={requestPermissions}>
                  Enable Voice Features
                </Button>
              </motion.div>
            )}

            {hasPermission && (
              <>
                <AudioVisualizer
                  stream={audioStream}
                  isRecording={isRecording}
                />

                <OptionGrid>
                  {questions[currentQuestion].options.map(option => (
                    <OptionButton
                      key={option.value}
                      $selected={
                        questions[currentQuestion].isMultiSelect
                          ? (questions[currentQuestion].id === 'dietaryRestrictions' 
                              ? selectedRestrictions.includes(String(option.value))
                              : false)
                          : responses[questions[currentQuestion].id as keyof EatingHabitsResponses] === option.value
                      }
                      onClick={() => {
                        if (questions[currentQuestion].isMultiSelect) {
                          if (questions[currentQuestion].id === 'dietaryRestrictions') {
                            const newRestrictions = selectedRestrictions.includes(String(option.value))
                              ? selectedRestrictions.filter(r => r !== String(option.value))
                              : [...selectedRestrictions, String(option.value)];
                            setSelectedRestrictions(newRestrictions);
                            setResponses(prev => ({
                              ...prev,
                              dietaryRestrictions: newRestrictions,
                            }));
                          }
                        } else {
                          handleResponse(option.value);
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option.label}
                      {(questions[currentQuestion].isMultiSelect
                        ? (questions[currentQuestion].id === 'dietaryRestrictions' 
                            ? selectedRestrictions.includes(String(option.value))
                            : false)
                        : responses[questions[currentQuestion].id as keyof EatingHabitsResponses] === option.value) && <FaCheck />}
                    </OptionButton>
                  ))}
                </OptionGrid>

                {questions[currentQuestion].id === 'dietaryRestrictions' && (
                  <>
                    <Input
                      value={customRestriction}
                      onChange={(e) => setCustomRestriction(e.target.value)}
                      placeholder="Add a custom dietary restriction..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && customRestriction.trim()) {
                          const newRestrictions = [...selectedRestrictions, customRestriction.trim()];
                          setSelectedRestrictions(newRestrictions);
                          setResponses(prev => ({
                            ...prev,
                            dietaryRestrictions: newRestrictions,
                          }));
                          setCustomRestriction('');
                        }
                      }}
                    />
                    <Button 
                      onClick={() => {
                        if (customRestriction.trim()) {
                          const newRestrictions = [...selectedRestrictions, customRestriction.trim()];
                          setSelectedRestrictions(newRestrictions);
                          setResponses(prev => ({
                            ...prev,
                            dietaryRestrictions: newRestrictions,
                          }));
                          setCustomRestriction('');
                        }
                      }}
                      disabled={!customRestriction.trim()}
                    >
                      <FaPlus /> Add Custom Restriction
                    </Button>
                  </>
                )}

                <ButtonGroup>
                  <Button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isProcessing}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isRecording ? <FaStop /> : <FaMicrophone />}
                    {isRecording ? 'Stop' : 'Start'} Recording
                  </Button>

                  <InfoButton onClick={showInfo}>
                    <FaInfoCircle /> More Info
                  </InfoButton>

                  {questions[currentQuestion].isMultiSelect && (
                    <Button
                      onClick={() => {
                        if (questions[currentQuestion].id === 'dietaryRestrictions') {
                          handleResponse(selectedRestrictions);
                        }
                      }}
                      disabled={
                        questions[currentQuestion].id === 'dietaryRestrictions'
                          ? selectedRestrictions.length === 0
                          : false
                      }
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaCheck /> Confirm Selection
                    </Button>
                  )}
                </ButtonGroup>
              </>
            )}

            {(error || validationError) && (
              <ErrorMessage
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error?.message || validationError}
              </ErrorMessage>
            )}
          </ResponseArea>
        </Question>
      </AnimatePresence>

      <ButtonGroup>
        <Button onClick={onPrevious}>
          Back
        </Button>
        <Button
          onClick={() => setCurrentQuestion(prev => 
            prev < questions.length - 1 ? prev + 1 : prev
          )}
          disabled={currentQuestion === questions.length - 1}
        >
          <span>Next</span> <FaArrowRight />
        </Button>
      </ButtonGroup>
    </Container>
  );
}; 