import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { theme } from '../../../styles/theme';
import { 
  FaMicrophone, FaStop, FaCheck, FaArrowRight, FaInfoCircle, 
  FaUtensils, FaFire, FaBlender, FaClock, FaBook,
  FaShoppingBasket, FaTools, FaRegClock, FaRegLightbulb
} from 'react-icons/fa';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { IconType } from 'react-icons';

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

const OptionCard = styled(motion.div)<{ $selected?: boolean, $color: string }>`
  display: flex;
  flex-direction: column;
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

const OptionTitle = styled.h4`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  margin-bottom: ${theme.spacing.sm};
`;

const OptionDescription = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.sm};
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

const DetailInput = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background.card};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.card};
  backdrop-filter: ${theme.blur.card};
`;

const TextArea = styled.textarea`
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

// Zod schema for cooking preferences responses
export const CookingPreferencesSchema = z.object({
  cookingSkill: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  cookingFrequency: z.enum(['rarely', 'few_times_month', 'few_times_week', 'daily', 'multiple_daily']),
  preferredMethods: z.array(z.string()),
  availableEquipment: z.array(z.string()),
  mealPrepTime: z.enum(['15_min', '30_min', '45_min', '60_min', 'over_60_min']),
  batchCooking: z.object({
    interested: z.boolean(),
    frequency: z.enum(['weekly', 'biweekly', 'monthly', 'never']).optional()
  }),
  cookingChallenges: z.array(z.string()),
  recipePreferences: z.object({
    complexity: z.enum(['simple', 'moderate', 'complex']),
    servingSize: z.enum(['single', 'couple', 'family', 'large_batch']),
    cuisineTypes: z.array(z.string())
  })
});

export type CookingPreferencesResponses = z.infer<typeof CookingPreferencesSchema>;

interface CookingPreferencesSectionProps {
  onComplete: (responses: CookingPreferencesResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<CookingPreferencesResponses>;
}

// Define valid question IDs
type QuestionId = keyof CookingPreferencesResponses;

// Define option interface
interface Option {
  value: string | boolean;
  label: string;
  description: string;
  icon: IconType;
  color: string;
}

// Define question interface
interface Question {
  id: QuestionId;
  text: string;
  voicePrompt: string;
  infoText: string;
  options: Option[];
  multiSelect?: boolean;
  requiresDetails?: boolean | string;
}

const QUESTIONS: Question[] = [
  {
    id: 'cookingSkill',
    text: 'How would you rate your cooking skills?',
    voicePrompt: 'How would you describe your cooking experience and skill level?',
    infoText: 'This helps us recommend recipes that match your skill level.',
    options: [
      {
        value: 'beginner',
        label: 'Beginner',
        description: 'Learning basics',
        icon: FaUtensils,
        color: '#FF4D4D'
      },
      {
        value: 'intermediate',
        label: 'Intermediate',
        description: 'Comfortable cooking',
        icon: FaUtensils,
        color: '#FFB020'
      },
      {
        value: 'advanced',
        label: 'Advanced',
        description: 'Skilled home cook',
        icon: FaUtensils,
        color: '#31E5FF'
      },
      {
        value: 'expert',
        label: 'Expert',
        description: 'Professional level',
        icon: FaUtensils,
        color: '#6BFF8E'
      }
    ]
  },
  {
    id: 'cookingFrequency',
    text: 'How often do you cook meals from scratch?',
    voicePrompt: 'How frequently do you prepare meals from scratch at home?',
    infoText: 'Understanding your cooking frequency helps us plan appropriate meal recommendations.',
    options: [
      {
        value: 'rarely',
        label: 'Rarely',
        description: 'Almost never cook',
        icon: FaClock,
        color: '#FF4D4D'
      },
      {
        value: 'few_times_month',
        label: 'Few Times Monthly',
        description: 'Occasional cooking',
        icon: FaClock,
        color: '#FFB020'
      },
      {
        value: 'few_times_week',
        label: 'Few Times Weekly',
        description: 'Regular cooking',
        icon: FaClock,
        color: '#31E5FF'
      },
      {
        value: 'daily',
        label: 'Daily',
        description: 'Cook every day',
        icon: FaClock,
        color: '#6BFF8E'
      },
      {
        value: 'multiple_daily',
        label: 'Multiple Times Daily',
        description: 'Cook most meals',
        icon: FaClock,
        color: '#9747FF'
      }
    ]
  },
  {
    id: 'preferredMethods',
    text: 'What cooking methods do you prefer?',
    voicePrompt: 'What are your preferred cooking methods? You can select multiple options.',
    infoText: 'This helps us suggest recipes that match your cooking style.',
    options: [
      {
        value: 'stovetop',
        label: 'Stovetop',
        description: 'Pan cooking, sautéing',
        icon: FaFire,
        color: '#31E5FF'
      },
      {
        value: 'oven',
        label: 'Oven',
        description: 'Baking, roasting',
        icon: FaFire,
        color: '#FF4D4D'
      },
      {
        value: 'slow_cooker',
        label: 'Slow Cooker',
        description: 'Set and forget',
        icon: FaClock,
        color: '#FFB020'
      },
      {
        value: 'pressure_cooker',
        label: 'Pressure Cooker',
        description: 'Quick cooking',
        icon: FaTools,
        color: '#6BFF8E'
      },
      {
        value: 'grill',
        label: 'Grill',
        description: 'Outdoor cooking',
        icon: FaFire,
        color: '#9747FF'
      },
      {
        value: 'air_fryer',
        label: 'Air Fryer',
        description: 'Healthy frying',
        icon: FaTools,
        color: '#31E5FF'
      }
    ],
    multiSelect: true
  },
  {
    id: 'availableEquipment',
    text: 'What cooking equipment do you have?',
    voicePrompt: 'What cooking equipment do you have available in your kitchen?',
    infoText: 'This ensures we recommend recipes you can make with your available equipment.',
    options: [
      {
        value: 'basic_pots',
        label: 'Basic Pots & Pans',
        description: 'Essential cookware',
        icon: FaUtensils,
        color: '#31E5FF'
      },
      {
        value: 'blender',
        label: 'Blender',
        description: 'For smoothies/sauces',
        icon: FaBlender,
        color: '#FFB020'
      },
      {
        value: 'food_processor',
        label: 'Food Processor',
        description: 'For prep work',
        icon: FaBlender,
        color: '#6BFF8E'
      },
      {
        value: 'mixer',
        label: 'Stand/Hand Mixer',
        description: 'For baking',
        icon: FaTools,
        color: '#9747FF'
      },
      {
        value: 'scale',
        label: 'Kitchen Scale',
        description: 'For precise measuring',
        icon: FaTools,
        color: '#FF4D4D'
      }
    ],
    multiSelect: true,
    requiresDetails: 'custom_equipment'
  },
  {
    id: 'mealPrepTime',
    text: 'How much time do you typically spend preparing a meal?',
    voicePrompt: 'How long do you usually spend preparing a meal?',
    infoText: 'This helps us recommend recipes that fit your schedule.',
    options: [
      {
        value: '15_min',
        label: '15 Minutes',
        description: 'Quick meals',
        icon: FaRegClock,
        color: '#31E5FF'
      },
      {
        value: '30_min',
        label: '30 Minutes',
        description: 'Standard prep time',
        icon: FaRegClock,
        color: '#6BFF8E'
      },
      {
        value: '45_min',
        label: '45 Minutes',
        description: 'More involved',
        icon: FaRegClock,
        color: '#FFB020'
      },
      {
        value: '60_min',
        label: '60 Minutes',
        description: 'Elaborate meals',
        icon: FaRegClock,
        color: '#9747FF'
      },
      {
        value: 'over_60_min',
        label: 'Over 60 Minutes',
        description: 'Complex dishes',
        icon: FaRegClock,
        color: '#FF4D4D'
      }
    ]
  },
  {
    id: 'batchCooking',
    text: 'Are you interested in batch cooking or meal prep?',
    voicePrompt: 'Would you like to learn about batch cooking and meal preparation?',
    infoText: 'Batch cooking can save time and help with meal planning.',
    options: [
      {
        value: true,
        label: 'Yes',
        description: 'Interested in meal prep',
        icon: FaShoppingBasket,
        color: '#31E5FF'
      },
      {
        value: false,
        label: 'No',
        description: 'Prefer cooking fresh',
        icon: FaUtensils,
        color: '#FF4D4D'
      }
    ],
    requiresDetails: 'frequency'
  },
  {
    id: 'recipePreferences',
    text: 'What type of recipes do you prefer?',
    voicePrompt: 'What level of recipe complexity are you comfortable with?',
    infoText: 'This helps us recommend recipes that match your preferences.',
    options: [
      {
        value: 'simple',
        label: 'Simple',
        description: 'Basic recipes',
        icon: FaRegLightbulb,
        color: '#31E5FF'
      },
      {
        value: 'moderate',
        label: 'Moderate',
        description: 'Some complexity',
        icon: FaBook,
        color: '#FFB020'
      },
      {
        value: 'complex',
        label: 'Complex',
        description: 'Challenging recipes',
        icon: FaBook,
        color: '#FF4D4D'
      }
    ],
    requiresDetails: 'serving_size'
  }
];

// Helper function to safely access responses
const getResponseValue = (responses: Partial<CookingPreferencesResponses>, questionId: QuestionId) => {
  switch (questionId) {
    case 'cookingSkill':
      return responses.cookingSkill;
    case 'cookingFrequency':
      return responses.cookingFrequency;
    case 'mealPrepTime':
      return responses.mealPrepTime;
    case 'batchCooking':
      return responses.batchCooking?.interested;
    case 'recipePreferences':
      return responses.recipePreferences?.complexity;
    default:
      return undefined;
  }
};

export const CookingPreferencesSection: React.FC<CookingPreferencesSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Partial<CookingPreferencesResponses>>(initialResponses);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
      handleVoiceResponse(text);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handle responses
  const handleResponse = useCallback((value: string | boolean) => {
    const question = QUESTIONS[currentQuestion];
    
    switch (question.id) {
      case 'cookingSkill':
        setResponses(prev => ({
          ...prev,
          cookingSkill: value as CookingPreferencesResponses['cookingSkill']
        }));
        break;
      case 'cookingFrequency':
        setResponses(prev => ({
          ...prev,
          cookingFrequency: value as CookingPreferencesResponses['cookingFrequency']
        }));
        break;
      case 'preferredMethods':
        if (typeof value === 'string') {
          setResponses(prev => ({
            ...prev,
            preferredMethods: value.split(',').filter(Boolean)
          }));
        }
        break;
      case 'availableEquipment':
        if (typeof value === 'string') {
          setResponses(prev => ({
            ...prev,
            availableEquipment: value.split(',').filter(Boolean)
          }));
        }
        break;
      case 'mealPrepTime':
        setResponses(prev => ({
          ...prev,
          mealPrepTime: value as CookingPreferencesResponses['mealPrepTime']
        }));
        break;
      case 'batchCooking':
        setResponses(prev => ({
          ...prev,
          batchCooking: {
            interested: Boolean(value),
            frequency: prev.batchCooking?.frequency
          }
        }));
        break;
      case 'recipePreferences':
        setResponses(prev => ({
          ...prev,
          recipePreferences: {
            ...prev.recipePreferences,
            complexity: value as CookingPreferencesResponses['recipePreferences']['complexity']
          }
        }));
        break;
    }

    if (question.requiresDetails) {
      setShowDetails(true);
    } else {
      setShowDetails(false);
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedItems(new Set());
      } else {
        onComplete(responses as CookingPreferencesResponses);
      }
    }
  }, [currentQuestion, responses, onComplete]);

  // Handle voice responses
  const handleVoiceResponse = useCallback((text: string) => {
    const question = QUESTIONS[currentQuestion];
    if (!question) return;

    if (question.multiSelect) {
      // Handle multiple selections from voice input
      const selectedOptions = question.options.filter(opt => 
        text.toLowerCase().includes(String(opt.label).toLowerCase()) ||
        text.toLowerCase().includes(String(opt.value).toLowerCase())
      );

      if (selectedOptions.length > 0) {
        const newSelected = new Set(selectedItems);
        selectedOptions.forEach(opt => newSelected.add(String(opt.value)));
        setSelectedItems(newSelected);
        const selectedValues = Array.from(newSelected).join(',');
        handleResponse(selectedValues);
        speak(`Selected: ${selectedOptions.map(opt => opt.label).join(', ')}. Is this correct?`);
      } else {
        speak("I didn't catch any specific options. Please try again or use the buttons to select.");
      }
    } else {
      // Handle single selection
      const option = question.options.find(opt => 
        text.toLowerCase().includes(String(opt.label).toLowerCase()) ||
        text.toLowerCase().includes(String(opt.value).toLowerCase())
      );

      if (option) {
        handleResponse(option.value);
        speak(`Selected ${option.label}. Is this correct?`);
      } else {
        speak("I didn't catch that. Please try again or use the buttons to select your response.");
      }
    }
  }, [currentQuestion, selectedItems, speak, handleResponse]);

  // Handle details submission
  const handleDetailsSubmit = useCallback(() => {
    const question = QUESTIONS[currentQuestion];
    
    switch (question.id) {
      case 'availableEquipment':
        setResponses(prev => ({
          ...prev,
          availableEquipment: [
            ...(prev.availableEquipment || []),
            ...details.split(',').map(e => e.trim())
          ]
        }));
        break;
      case 'batchCooking':
        setResponses(prev => ({
          ...prev,
          batchCooking: {
            ...prev.batchCooking!,
            frequency: details as CookingPreferencesResponses['batchCooking']['frequency']
          }
        }));
        break;
      case 'recipePreferences':
        setResponses(prev => ({
          ...prev,
          recipePreferences: {
            ...prev.recipePreferences!,
            servingSize: details as CookingPreferencesResponses['recipePreferences']['servingSize']
          }
        }));
        break;
    }

    setShowDetails(false);
    setDetails('');
    
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete(responses as CookingPreferencesResponses);
    }
  }, [currentQuestion, details, responses, onComplete]);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <ProgressIndicator>
        Question {currentQuestion + 1} of {QUESTIONS.length}
      </ProgressIndicator>

      <Title>Cooking Preferences & Equipment</Title>

      <AnimatePresence mode="wait">
        <QuestionContainer
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <QuestionText>{QUESTIONS[currentQuestion].text}</QuestionText>

          <OptionGrid>
            {QUESTIONS[currentQuestion].options.map((option) => {
              const questionId = QUESTIONS[currentQuestion].id;
              const currentResponse = getResponseValue(responses, questionId);
              
              const isSelected = QUESTIONS[currentQuestion].multiSelect
                ? selectedItems.has(String(option.value))
                : currentResponse !== undefined && String(currentResponse) === String(option.value);

              return (
                <OptionCard
                  key={String(option.value)}
                  $selected={isSelected}
                  $color={option.color}
                  onClick={() => {
                    if (QUESTIONS[currentQuestion].multiSelect) {
                      const newSelected = new Set(selectedItems);
                      if (newSelected.has(String(option.value))) {
                        newSelected.delete(String(option.value));
                      } else {
                        newSelected.add(String(option.value));
                      }
                      setSelectedItems(newSelected);
                      handleResponse(Array.from(newSelected).join(','));
                    } else {
                      handleResponse(option.value);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <option.icon />
                  <OptionTitle>{option.label}</OptionTitle>
                  <OptionDescription>{option.description}</OptionDescription>
                </OptionCard>
              );
            })}
          </OptionGrid>

          {showDetails && (
            <DetailInput
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <TextArea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={
                  QUESTIONS[currentQuestion].id === 'availableEquipment'
                    ? "Please list any additional equipment you have..."
                    : QUESTIONS[currentQuestion].id === 'batchCooking'
                    ? "How often would you like to do meal prep? (weekly, biweekly, monthly)..."
                    : "What serving size do you usually cook for? (single, couple, family)..."
                }
                onKeyPress={(e) => e.key === 'Enter' && handleDetailsSubmit()}
              />
              <Button onClick={handleDetailsSubmit}>
                <FaCheck /> Confirm Details
              </Button>
            </DetailInput>
          )}
        </QuestionContainer>
      </AnimatePresence>

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