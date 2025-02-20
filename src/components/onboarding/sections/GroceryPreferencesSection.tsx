import React, { useEffect, useCallback, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { theme } from '../../../styles/theme';
import { FaMicrophone, FaStop, FaCheck, FaArrowRight, FaInfoCircle, FaRedo, FaPlus } from 'react-icons/fa';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import toast from 'react-hot-toast';
import { z } from 'zod';

// Styled components (reuse from previous sections)
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

// Zod schema for grocery preferences responses
export const GroceryPreferencesSchema = z.object({
  shoppingFrequency: z.enum(['daily', 'twice_week', 'weekly', 'biweekly', 'monthly']),
  preferredStores: z.array(z.string()),
  budgetRange: z.enum(['budget', 'moderate', 'premium', 'no_preference']),
  organicPreference: z.enum(['always', 'sometimes', 'rarely', 'never']),
  bulkShopping: z.boolean(),
  onlineGrocery: z.enum(['always', 'sometimes', 'rarely', 'never']),
  customStores: z.array(z.string()).optional(),
});

export type GroceryPreferencesResponses = z.infer<typeof GroceryPreferencesSchema>;

interface GroceryPreferencesSectionProps {
  onComplete: (responses: GroceryPreferencesResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<GroceryPreferencesResponses>;
}

export const GroceryPreferencesSection: React.FC<GroceryPreferencesSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {},
}) => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Partial<GroceryPreferencesResponses>>(initialResponses);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localTranscript, setLocalTranscript] = useState('');
  const [selectedStores, setSelectedStores] = useState<string[]>(
    initialResponses.preferredStores || []
  );
  const [customStore, setCustomStore] = useState('');

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
      id: 'shoppingFrequency',
      text: 'How often do you grocery shop?',
      voicePrompt: 'How often do you typically go grocery shopping?',
      infoText: 'This helps us plan your meal schedule and shopping lists.',
      options: [
        { value: 'daily', label: 'Daily' },
        { value: 'twice_week', label: 'Twice a Week' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Biweekly' },
        { value: 'monthly', label: 'Monthly' },
      ],
    },
    {
      id: 'preferredStores',
      text: 'Where do you prefer to shop?',
      voicePrompt: 'Which grocery stores do you prefer to shop at? You can select multiple options or add your own.',
      infoText: 'This helps us provide store-specific recommendations and pricing.',
      options: [
        { value: 'supermarket', label: 'Supermarket' },
        { value: 'farmers_market', label: 'Farmers Market' },
        { value: 'specialty_store', label: 'Specialty Store' },
        { value: 'wholesale_club', label: 'Wholesale Club' },
        { value: 'health_food', label: 'Health Food Store' },
        { value: 'convenience', label: 'Convenience Store' },
        { value: 'online', label: 'Online Grocery' },
      ],
      isMultiSelect: true,
    },
    {
      id: 'budgetRange',
      text: 'What is your grocery budget preference?',
      voicePrompt: 'How would you describe your grocery budget preference?',
      infoText: 'This helps us recommend ingredients and recipes within your budget range.',
      options: [
        { value: 'budget', label: 'Budget-Conscious' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'premium', label: 'Premium' },
        { value: 'no_preference', label: 'No Preference' },
      ],
    },
    {
      id: 'organicPreference',
      text: 'Do you prefer organic products?',
      voicePrompt: 'How often do you choose organic products when available?',
      infoText: 'This helps us tailor our ingredient recommendations.',
      options: [
        { value: 'always', label: 'Always' },
        { value: 'sometimes', label: 'Sometimes' },
        { value: 'rarely', label: 'Rarely' },
        { value: 'never', label: 'Never' },
      ],
    },
    {
      id: 'bulkShopping',
      text: 'Are you interested in bulk shopping?',
      voicePrompt: 'Are you interested in buying ingredients in bulk?',
      infoText: 'This helps us optimize your shopping lists and meal planning.',
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
    {
      id: 'onlineGrocery',
      text: 'How often do you use online grocery services?',
      voicePrompt: 'How frequently do you use online grocery shopping or delivery services?',
      infoText: 'This helps us provide relevant shopping recommendations.',
      options: [
        { value: 'always', label: 'Always' },
        { value: 'sometimes', label: 'Sometimes' },
        { value: 'rarely', label: 'Rarely' },
        { value: 'never', label: 'Never' },
      ],
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

  const handleResponse = useCallback((response: string | string[] | boolean) => {
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
        const validated = GroceryPreferencesSchema.parse({
          ...responses,
          preferredStores: selectedStores,
        });
        onComplete(validated);
      } catch (error) {
        if (error instanceof Error) {
          setValidationError(error.message);
          toast.error('Please ensure all questions are answered before continuing.');
        }
      }
    }
  }, [currentQuestion, questions, responses, selectedStores, onComplete]);

  // Request permissions when component mounts
  useEffect(() => {
    const requestInitialPermissions = async () => {
      if (!hasPermission) {
        try {
          await requestPermissions();
        } catch (error) {
          console.error('Failed to request permissions:', error);
          toast.error('Please grant microphone and speech permissions to use voice features');
        }
      }
    };
    requestInitialPermissions();
  }, [hasPermission, requestPermissions]);

  // Speak the current question when it changes
  useEffect(() => {
    let isMounted = true;
    
    const speakQuestion = async () => {
      if (hasPermission && isMounted) {
        const question = questions[currentQuestion];
        if (question) {
          try {
            await speak(question.voicePrompt);
          } catch (error) {
            console.error('Failed to speak:', error);
            if (error instanceof Error) {
              if (error.message.includes('permission denied')) {
                toast.error('Speech synthesis permission was denied. Please enable it in your browser settings.');
              } else if (error.message.includes('not supported')) {
                toast.error('Speech synthesis is not supported in your browser.');
              } else {
                toast.error('Failed to speak the question. Please try again.');
              }
            }
          }
        }
      }
    };

    speakQuestion();
    
    return () => {
      isMounted = false;
    };
  }, [currentQuestion, hasPermission, speak, questions]);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      role="region"
      aria-label="Grocery Preferences Collection"
    >
      <Title>Grocery & Budget Preferences</Title>
      
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
                      key={String(option.value)}
                      $selected={
                        questions[currentQuestion].isMultiSelect
                          ? (questions[currentQuestion].id === 'preferredStores'
                              ? selectedStores.includes(String(option.value))
                              : false)
                          : responses[questions[currentQuestion].id as keyof GroceryPreferencesResponses] === option.value
                      }
                      onClick={() => {
                        if (questions[currentQuestion].isMultiSelect) {
                          if (questions[currentQuestion].id === 'preferredStores') {
                            const newStores = selectedStores.includes(String(option.value))
                              ? selectedStores.filter(s => s !== String(option.value))
                              : [...selectedStores, String(option.value)];
                            setSelectedStores(newStores);
                            setResponses(prev => ({
                              ...prev,
                              preferredStores: newStores,
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
                        ? (questions[currentQuestion].id === 'preferredStores'
                            ? selectedStores.includes(String(option.value))
                            : false)
                        : responses[questions[currentQuestion].id as keyof GroceryPreferencesResponses] === option.value) && <FaCheck />}
                    </OptionButton>
                  ))}
                </OptionGrid>

                {questions[currentQuestion].id === 'preferredStores' && (
                  <>
                    <Input
                      value={customStore}
                      onChange={(e) => setCustomStore(e.target.value)}
                      placeholder="Add a custom store..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && customStore.trim()) {
                          const newStores = [...selectedStores, customStore.trim()];
                          setSelectedStores(newStores);
                          setResponses(prev => ({
                            ...prev,
                            preferredStores: newStores,
                            customStores: [...(prev.customStores || []), customStore.trim()],
                          }));
                          setCustomStore('');
                        }
                      }}
                    />
                    <Button 
                      onClick={() => {
                        if (customStore.trim()) {
                          const newStores = [...selectedStores, customStore.trim()];
                          setSelectedStores(newStores);
                          setResponses(prev => ({
                            ...prev,
                            preferredStores: newStores,
                            customStores: [...(prev.customStores || []), customStore.trim()],
                          }));
                          setCustomStore('');
                        }
                      }}
                      disabled={!customStore.trim()}
                    >
                      <FaPlus /> Add Custom Store
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
                        if (questions[currentQuestion].id === 'preferredStores') {
                          handleResponse(selectedStores);
                        }
                      }}
                      disabled={
                        questions[currentQuestion].id === 'preferredStores'
                          ? selectedStores.length === 0
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