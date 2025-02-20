import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { theme } from '../../../styles/theme';
import { 
  FaMicrophone, FaStop, FaCheck, FaArrowRight, FaInfoCircle, 
  FaGlobeAmericas, FaLeaf, FaFire, FaUtensils, FaHeart,
  FaCarrot, FaAppleAlt, FaFish, FaBreadSlice, FaWineGlass
} from 'react-icons/fa';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { IconType } from 'react-icons';

// Reuse styled components from previous sections
const Container = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.card};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.card};
  backdrop-filter: ${theme.blur.card};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${theme.gradients.primary};
    opacity: 0.5;
  }
`;

const Title = styled(motion.h2)`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.xl};
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
  background: ${theme.gradients.text.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${theme.gradients.primary};
    opacity: 0.5;
  }
`;

const QuestionContainer = styled(motion.div)`
  margin: ${theme.spacing.xl} 0;
  position: relative;
`;

const QuestionText = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.lg};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
  line-height: 1.4;
`;

const OptionGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  margin: ${theme.spacing.xl} 0;
`;

const OptionCard = styled(motion.button)<{ $selected?: boolean; $color?: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  background: ${props => props.$selected ? 
    `rgba(${props.$color || '49, 229, 255'}, 0.15)` : 
    'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.$selected ? 
    props.$color || theme.colors.primary : 
    theme.colors.border.default
  };
  border-radius: ${theme.borderRadius.large};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$color || theme.colors.primary};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.$color || theme.colors.primary};

    &::before {
      opacity: 0.05;
    }
  }

  svg {
    font-size: 24px;
    color: ${props => props.$color || theme.colors.primary};
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

const OptionTitle = styled.span`
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  text-align: center;
`;

const OptionDescription = styled.span`
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
`;

const DetailInput = styled(motion.div)`
  margin-top: ${theme.spacing.lg};
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
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: rgba(49, 229, 255, 0.05);
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
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
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.button.background};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSizes.md};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    background: ${theme.colors.button.hover};

    &::before {
      transform: translateX(100%);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProgressIndicator = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

// Zod schema for food and cuisine responses
export const FoodCuisineSchema = z.object({
  favoriteCuisines: z.array(z.string()),
  spicePreference: z.enum(['mild', 'medium', 'spicy', 'very_spicy']),
  foodGroups: z.object({
    vegetables: z.enum(['love', 'like', 'neutral', 'dislike']),
    fruits: z.enum(['love', 'like', 'neutral', 'dislike']),
    grains: z.enum(['love', 'like', 'neutral', 'dislike']),
    proteins: z.enum(['love', 'like', 'neutral', 'dislike']),
    dairy: z.enum(['love', 'like', 'neutral', 'dislike'])
  }),
  dietaryPreferences: z.array(z.string()),
  allergies: z.array(z.string()),
  avoidedIngredients: z.array(z.string()),
  comfortFoods: z.array(z.string()),
  mealComplexity: z.enum(['simple', 'moderate', 'complex', 'any']),
  newFoodOpenness: z.enum(['very_open', 'somewhat_open', 'selective', 'conservative'])
});

export type FoodCuisineResponses = z.infer<typeof FoodCuisineSchema>;

interface FoodCuisineSectionProps {
  onComplete: (responses: FoodCuisineResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<FoodCuisineResponses>;
}

// Define valid question IDs
type QuestionId = keyof Omit<FoodCuisineResponses, 'upcomingEvents'>;

// Define option interface
interface Option {
  value: string;
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
    id: 'favoriteCuisines',
    text: 'What are your favorite cuisines?',
    voicePrompt: 'Which types of cuisine do you enjoy most? You can select multiple options.',
    infoText: 'This helps us recommend recipes that match your taste preferences.',
    options: [
      {
        value: 'italian',
        label: 'Italian',
        description: 'Mediterranean flavors',
        icon: FaUtensils,
        color: '#31E5FF'
      },
      {
        value: 'asian',
        label: 'Asian',
        description: 'East Asian cuisines',
        icon: FaUtensils,
        color: '#6BFF8E'
      },
      {
        value: 'mexican',
        label: 'Mexican',
        description: 'Latin flavors',
        icon: FaUtensils,
        color: '#FFB020'
      },
      {
        value: 'mediterranean',
        label: 'Mediterranean',
        description: 'Healthy & fresh',
        icon: FaUtensils,
        color: '#9747FF'
      },
      {
        value: 'indian',
        label: 'Indian',
        description: 'Rich spices',
        icon: FaUtensils,
        color: '#FF4D4D'
      }
    ],
    multiSelect: true
  },
  {
    id: 'spicePreference',
    text: 'What is your spice preference?',
    voicePrompt: 'How spicy do you like your food?',
    infoText: 'This helps us adjust recipe recommendations to your spice tolerance.',
    options: [
      {
        value: 'mild',
        label: 'Mild',
        description: 'Little to no spice',
        icon: FaFire,
        color: '#6BFF8E'
      },
      {
        value: 'medium',
        label: 'Medium',
        description: 'Moderate heat',
        icon: FaFire,
        color: '#31E5FF'
      },
      {
        value: 'spicy',
        label: 'Spicy',
        description: 'Significant heat',
        icon: FaFire,
        color: '#FFB020'
      },
      {
        value: 'very_spicy',
        label: 'Very Spicy',
        description: 'Maximum heat',
        icon: FaFire,
        color: '#FF4D4D'
      }
    ]
  },
  {
    id: 'foodGroups',
    text: 'How do you feel about different food groups?',
    voicePrompt: 'Please rate your preference for each food group.',
    infoText: 'This helps us balance your meal plans according to your preferences.',
    options: [
      {
        value: 'vegetables',
        label: 'Vegetables',
        description: 'Fresh produce',
        icon: FaCarrot,
        color: '#6BFF8E'
      },
      {
        value: 'fruits',
        label: 'Fruits',
        description: 'Sweet & fresh',
        icon: FaAppleAlt,
        color: '#31E5FF'
      },
      {
        value: 'proteins',
        label: 'Proteins',
        description: 'Meat & alternatives',
        icon: FaFish,
        color: '#FFB020'
      },
      {
        value: 'grains',
        label: 'Grains',
        description: 'Breads & cereals',
        icon: FaBreadSlice,
        color: '#9747FF'
      },
      {
        value: 'dairy',
        label: 'Dairy',
        description: 'Milk products',
        icon: FaWineGlass,
        color: '#FF4D4D'
      }
    ],
    requiresDetails: 'preferences'
  },
  {
    id: 'dietaryPreferences',
    text: 'Do you have any dietary preferences?',
    voicePrompt: 'Do you follow any specific dietary patterns or have preferences?',
    infoText: 'This ensures our recommendations align with your dietary choices.',
    options: [
      {
        value: 'vegetarian',
        label: 'Vegetarian',
        description: 'No meat',
        icon: FaLeaf,
        color: '#6BFF8E'
      },
      {
        value: 'vegan',
        label: 'Vegan',
        description: 'Plant-based only',
        icon: FaLeaf,
        color: '#31E5FF'
      },
      {
        value: 'pescatarian',
        label: 'Pescatarian',
        description: 'Fish & vegetables',
        icon: FaFish,
        color: '#FFB020'
      },
      {
        value: 'flexitarian',
        label: 'Flexitarian',
        description: 'Mostly plant-based',
        icon: FaLeaf,
        color: '#9747FF'
      }
    ],
    multiSelect: true
  },
  {
    id: 'allergies',
    text: 'Do you have any food allergies?',
    voicePrompt: 'Please tell me about any food allergies or intolerances you have.',
    infoText: 'This helps us ensure your safety by avoiding allergens.',
    options: [
      {
        value: 'dairy',
        label: 'Dairy',
        description: 'Milk products',
        icon: FaWineGlass,
        color: '#FF4D4D'
      },
      {
        value: 'nuts',
        label: 'Nuts',
        description: 'Tree nuts & peanuts',
        icon: FaLeaf,
        color: '#FFB020'
      },
      {
        value: 'gluten',
        label: 'Gluten',
        description: 'Wheat products',
        icon: FaBreadSlice,
        color: '#31E5FF'
      },
      {
        value: 'shellfish',
        label: 'Shellfish',
        description: 'Seafood',
        icon: FaFish,
        color: '#9747FF'
      }
    ],
    multiSelect: true,
    requiresDetails: 'other_allergies'
  },
  {
    id: 'mealComplexity',
    text: 'What level of recipe complexity do you prefer?',
    voicePrompt: 'How complex would you like your recipes to be?',
    infoText: 'This helps us recommend recipes that match your cooking comfort level.',
    options: [
      {
        value: 'simple',
        label: 'Simple',
        description: 'Quick & easy',
        icon: FaUtensils,
        color: '#6BFF8E'
      },
      {
        value: 'moderate',
        label: 'Moderate',
        description: 'Balanced complexity',
        icon: FaUtensils,
        color: '#31E5FF'
      },
      {
        value: 'complex',
        label: 'Complex',
        description: 'Advanced recipes',
        icon: FaUtensils,
        color: '#FFB020'
      },
      {
        value: 'any',
        label: 'Any',
        description: 'All levels',
        icon: FaUtensils,
        color: '#9747FF'
      }
    ]
  },
  {
    id: 'newFoodOpenness',
    text: 'How open are you to trying new foods?',
    voicePrompt: 'How would you describe your openness to trying new foods and ingredients?',
    infoText: 'This helps us gauge how adventurous to be with our recommendations.',
    options: [
      {
        value: 'very_open',
        label: 'Very Open',
        description: 'Love trying new things',
        icon: FaGlobeAmericas,
        color: '#6BFF8E'
      },
      {
        value: 'somewhat_open',
        label: 'Somewhat Open',
        description: 'Occasionally try new things',
        icon: FaGlobeAmericas,
        color: '#31E5FF'
      },
      {
        value: 'selective',
        label: 'Selective',
        description: 'Prefer familiar foods',
        icon: FaHeart,
        color: '#FFB020'
      },
      {
        value: 'conservative',
        label: 'Conservative',
        description: 'Stick to favorites',
        icon: FaHeart,
        color: '#FF4D4D'
      }
    ]
  }
];

// Helper function to safely access responses
const getResponseValue = (responses: Partial<FoodCuisineResponses>, questionId: QuestionId) => {
  switch (questionId) {
    case 'spicePreference':
      return responses.spicePreference;
    case 'mealComplexity':
      return responses.mealComplexity;
    case 'newFoodOpenness':
      return responses.newFoodOpenness;
    case 'foodGroups':
      return responses.foodGroups;
    default:
      if (Array.isArray(responses[questionId])) {
        return responses[questionId];
      }
      return undefined;
  }
};

export const FoodCuisineSection: React.FC<FoodCuisineSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Partial<FoodCuisineResponses>>(initialResponses);
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
  const handleResponse = useCallback((value: string | string[]) => {
    const question = QUESTIONS[currentQuestion];
    
    if (Array.isArray(value)) {
      setResponses(prev => ({
        ...prev,
        [question.id]: value
      }));
    } else {
      switch (question.id) {
        case 'spicePreference':
          setResponses(prev => ({
            ...prev,
            spicePreference: value as FoodCuisineResponses['spicePreference']
          }));
          break;
        case 'foodGroups':
          setResponses(prev => ({
            ...prev,
            foodGroups: {
              ...prev.foodGroups,
              [details]: value as 'love' | 'like' | 'neutral' | 'dislike'
            }
          }));
          break;
        case 'mealComplexity':
          setResponses(prev => ({
            ...prev,
            mealComplexity: value as FoodCuisineResponses['mealComplexity']
          }));
          break;
        case 'newFoodOpenness':
          setResponses(prev => ({
            ...prev,
            newFoodOpenness: value as FoodCuisineResponses['newFoodOpenness']
          }));
          break;
        default:
          if (question.multiSelect) {
            setResponses(prev => ({
              ...prev,
              [question.id]: [...(prev[question.id as keyof FoodCuisineResponses] as string[] || []), value]
            }));
          } else {
            setResponses(prev => ({
              ...prev,
              [question.id]: value
            }));
          }
      }
    }

    if (question.requiresDetails) {
      setShowDetails(true);
    } else {
      setShowDetails(false);
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedItems(new Set());
      } else {
        onComplete(responses as FoodCuisineResponses);
      }
    }
  }, [currentQuestion, responses, details, onComplete]);

  // Handle voice responses
  const handleVoiceResponse = useCallback((text: string) => {
    const question = QUESTIONS[currentQuestion];
    if (!question) return;

    if (question.multiSelect) {
      // Handle multiple selections from voice input
      const selectedOptions = question.options.filter(opt => 
        text.toLowerCase().includes(opt.label.toLowerCase()) ||
        text.toLowerCase().includes(opt.value.toLowerCase())
      );

      if (selectedOptions.length > 0) {
        const newSelected = new Set(selectedItems);
        selectedOptions.forEach(opt => newSelected.add(opt.value));
        setSelectedItems(newSelected);
        handleResponse(Array.from(newSelected));
        speak(`Selected: ${selectedOptions.map(opt => opt.label).join(', ')}. Is this correct?`);
      } else {
        speak("I didn't catch any specific options. Please try again or use the buttons to select.");
      }
    } else {
      // Handle single selection
      const option = question.options.find(opt => 
        text.toLowerCase().includes(opt.label.toLowerCase()) ||
        text.toLowerCase().includes(opt.value.toLowerCase())
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
      case 'foodGroups':
        setResponses(prev => ({
          ...prev,
          foodGroups: {
            ...prev.foodGroups,
            [details]: 'like'
          }
        }));
        break;
      case 'allergies':
        setResponses(prev => ({
          ...prev,
          allergies: [
            ...(prev.allergies || []),
            ...details.split(',').map(a => a.trim())
          ]
        }));
        break;
      case 'avoidedIngredients':
        setResponses(prev => ({
          ...prev,
          avoidedIngredients: [
            ...(prev.avoidedIngredients || []),
            ...details.split(',').map(i => i.trim())
          ]
        }));
        break;
      case 'comfortFoods':
        setResponses(prev => ({
          ...prev,
          comfortFoods: [
            ...(prev.comfortFoods || []),
            ...details.split(',').map(f => f.trim())
          ]
        }));
        break;
    }

    setShowDetails(false);
    setDetails('');
    
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete(responses as FoodCuisineResponses);
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

      <Title>Food & Cuisine Preferences</Title>

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
                ? selectedItems.has(option.value)
                : currentResponse === option.value;

              return (
                <OptionCard
                  key={option.value}
                  $selected={isSelected}
                  $color={option.color}
                  onClick={() => {
                    if (QUESTIONS[currentQuestion].multiSelect) {
                      const newSelected = new Set(selectedItems);
                      if (newSelected.has(option.value)) {
                        newSelected.delete(option.value);
                      } else {
                        newSelected.add(option.value);
                      }
                      setSelectedItems(newSelected);
                      handleResponse(Array.from(newSelected));
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
                  QUESTIONS[currentQuestion].id === 'foodGroups'
                    ? "Rate this food group (love, like, neutral, dislike)..."
                    : QUESTIONS[currentQuestion].id === 'allergies'
                    ? "List any other allergies or intolerances..."
                    : QUESTIONS[currentQuestion].id === 'avoidedIngredients'
                    ? "List ingredients you prefer to avoid..."
                    : "List your favorite comfort foods..."
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