import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { theme } from '../../../styles/theme';
import { 
  FaMicrophone, FaStop, FaCheck, FaArrowRight, FaInfoCircle, 
  FaShoppingCart, FaStore, FaMoneyBillWave, FaLeaf, FaRecycle,
  FaShoppingBasket, FaTruck, FaCalendarAlt, FaMapMarkerAlt
} from 'react-icons/fa';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { IconType } from 'react-icons';

// Reuse styled components from CookingPreferencesSection
// ... (copy all styled components)

// Zod schema for grocery and budget responses
export const GroceryBudgetSchema = z.object({
  shoppingFrequency: z.enum(['daily', 'twice_week', 'weekly', 'biweekly', 'monthly']),
  preferredStores: z.array(z.string()),
  budgetRange: z.enum(['budget', 'moderate', 'premium', 'no_preference']),
  organicPreference: z.enum(['always', 'sometimes', 'rarely', 'never']),
  bulkShopping: z.object({
    interested: z.boolean(),
    items: z.array(z.string()).optional()
  }),
  onlineGrocery: z.object({
    frequency: z.enum(['always', 'sometimes', 'rarely', 'never']),
    preferredServices: z.array(z.string()).optional()
  }),
  weeklyBudget: z.object({
    range: z.enum(['under_50', '50_100', '100_200', '200_plus']),
    flexibility: z.enum(['strict', 'somewhat_flexible', 'very_flexible'])
  }),
  shoppingHabits: z.object({
    listMaking: z.boolean(),
    comparesPrices: z.boolean(),
    buysSeasonal: z.boolean(),
    checksLabels: z.boolean()
  })
});

export type GroceryBudgetResponses = z.infer<typeof GroceryBudgetSchema>;

interface GroceryBudgetSectionProps {
  onComplete: (responses: GroceryBudgetResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<GroceryBudgetResponses>;
}

// Define valid question IDs
type QuestionId = keyof GroceryBudgetResponses;

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
    id: 'shoppingFrequency',
    text: 'How often do you grocery shop?',
    voicePrompt: 'How frequently do you typically go grocery shopping?',
    infoText: 'This helps us plan your meal schedule and shopping lists.',
    options: [
      {
        value: 'daily',
        label: 'Daily',
        description: 'Fresh ingredients daily',
        icon: FaShoppingCart,
        color: '#31E5FF'
      },
      {
        value: 'twice_week',
        label: 'Twice a Week',
        description: 'Mid-week refresh',
        icon: FaShoppingCart,
        color: '#6BFF8E'
      },
      {
        value: 'weekly',
        label: 'Weekly',
        description: 'Weekly stock up',
        icon: FaCalendarAlt,
        color: '#FFB020'
      },
      {
        value: 'biweekly',
        label: 'Biweekly',
        description: 'Every two weeks',
        icon: FaCalendarAlt,
        color: '#9747FF'
      },
      {
        value: 'monthly',
        label: 'Monthly',
        description: 'Monthly bulk shop',
        icon: FaCalendarAlt,
        color: '#FF4D4D'
      }
    ]
  },
  {
    id: 'preferredStores',
    text: 'Where do you prefer to shop?',
    voicePrompt: 'Which grocery stores do you prefer to shop at? You can select multiple options.',
    infoText: 'This helps us provide store-specific recommendations and pricing.',
    options: [
      {
        value: 'supermarket',
        label: 'Supermarket',
        description: 'Traditional grocery',
        icon: FaStore,
        color: '#31E5FF'
      },
      {
        value: 'farmers_market',
        label: 'Farmers Market',
        description: 'Local & fresh',
        icon: FaLeaf,
        color: '#6BFF8E'
      },
      {
        value: 'specialty',
        label: 'Specialty Store',
        description: 'Specific items',
        icon: FaStore,
        color: '#FFB020'
      },
      {
        value: 'wholesale',
        label: 'Wholesale Club',
        description: 'Bulk shopping',
        icon: FaShoppingBasket,
        color: '#9747FF'
      },
      {
        value: 'online',
        label: 'Online Grocery',
        description: 'Delivery service',
        icon: FaTruck,
        color: '#FF4D4D'
      }
    ],
    multiSelect: true,
    requiresDetails: 'store_names'
  },
  {
    id: 'budgetRange',
    text: 'What is your grocery budget preference?',
    voicePrompt: 'How would you describe your grocery budget range?',
    infoText: 'This helps us recommend ingredients and recipes within your budget.',
    options: [
      {
        value: 'budget',
        label: 'Budget-Conscious',
        description: 'Cost-effective options',
        icon: FaMoneyBillWave,
        color: '#31E5FF'
      },
      {
        value: 'moderate',
        label: 'Moderate',
        description: 'Balance cost & quality',
        icon: FaMoneyBillWave,
        color: '#6BFF8E'
      },
      {
        value: 'premium',
        label: 'Premium',
        description: 'Quality focused',
        icon: FaMoneyBillWave,
        color: '#FFB020'
      },
      {
        value: 'no_preference',
        label: 'No Preference',
        description: 'Flexible on cost',
        icon: FaMoneyBillWave,
        color: '#9747FF'
      }
    ]
  },
  {
    id: 'organicPreference',
    text: 'Do you prefer organic products?',
    voicePrompt: 'How often do you choose organic products when available?',
    infoText: 'This helps us tailor our ingredient recommendations.',
    options: [
      {
        value: 'always',
        label: 'Always',
        description: 'Organic only',
        icon: FaLeaf,
        color: '#6BFF8E'
      },
      {
        value: 'sometimes',
        label: 'Sometimes',
        description: 'When reasonable',
        icon: FaLeaf,
        color: '#31E5FF'
      },
      {
        value: 'rarely',
        label: 'Rarely',
        description: 'Occasionally',
        icon: FaLeaf,
        color: '#FFB020'
      },
      {
        value: 'never',
        label: 'Never',
        description: 'Not important',
        icon: FaLeaf,
        color: '#FF4D4D'
      }
    ]
  },
  {
    id: 'bulkShopping',
    text: 'Are you interested in bulk shopping?',
    voicePrompt: 'Would you like to buy ingredients in bulk to save money?',
    infoText: 'Bulk shopping can help reduce costs and packaging waste.',
    options: [
      {
        value: true,
        label: 'Yes',
        description: 'Interested in bulk',
        icon: FaShoppingBasket,
        color: '#31E5FF'
      },
      {
        value: false,
        label: 'No',
        description: 'Prefer smaller quantities',
        icon: FaShoppingCart,
        color: '#FF4D4D'
      }
    ],
    requiresDetails: 'items'
  },
  {
    id: 'onlineGrocery',
    text: 'How often do you use online grocery services?',
    voicePrompt: 'How frequently do you use online grocery shopping or delivery services?',
    infoText: 'This helps us provide relevant shopping recommendations.',
    options: [
      {
        value: 'always',
        label: 'Always',
        description: 'Primary shopping method',
        icon: FaTruck,
        color: '#31E5FF'
      },
      {
        value: 'sometimes',
        label: 'Sometimes',
        description: 'Occasional use',
        icon: FaTruck,
        color: '#6BFF8E'
      },
      {
        value: 'rarely',
        label: 'Rarely',
        description: 'Infrequent use',
        icon: FaTruck,
        color: '#FFB020'
      },
      {
        value: 'never',
        label: 'Never',
        description: 'Don\'t use',
        icon: FaTruck,
        color: '#FF4D4D'
      }
    ],
    requiresDetails: 'preferred_services'
  },
  {
    id: 'weeklyBudget',
    text: 'What is your typical weekly grocery budget?',
    voicePrompt: 'How much do you typically spend on groceries per week?',
    infoText: 'This helps us recommend recipes and meal plans within your budget.',
    options: [
      {
        value: 'under_50',
        label: 'Under $50',
        description: 'Budget conscious',
        icon: FaMoneyBillWave,
        color: '#31E5FF'
      },
      {
        value: '50_100',
        label: '$50-$100',
        description: 'Moderate budget',
        icon: FaMoneyBillWave,
        color: '#6BFF8E'
      },
      {
        value: '100_200',
        label: '$100-$200',
        description: 'Comfortable budget',
        icon: FaMoneyBillWave,
        color: '#FFB020'
      },
      {
        value: '200_plus',
        label: '$200+',
        description: 'Premium budget',
        icon: FaMoneyBillWave,
        color: '#9747FF'
      }
    ],
    requiresDetails: 'flexibility'
  },
  {
    id: 'shoppingHabits',
    text: 'What are your shopping habits?',
    voicePrompt: 'Tell me about your shopping habits. Do you make lists, compare prices, buy seasonal items, or check labels?',
    infoText: 'Understanding your shopping habits helps us provide better recommendations.',
    options: [
      {
        value: 'listMaking',
        label: 'Make Lists',
        description: 'Plan purchases',
        icon: FaShoppingCart,
        color: '#31E5FF'
      },
      {
        value: 'comparesPrices',
        label: 'Compare Prices',
        description: 'Price conscious',
        icon: FaMoneyBillWave,
        color: '#6BFF8E'
      },
      {
        value: 'buysSeasonal',
        label: 'Buy Seasonal',
        description: 'Seasonal shopper',
        icon: FaLeaf,
        color: '#FFB020'
      },
      {
        value: 'checksLabels',
        label: 'Check Labels',
        description: 'Label reader',
        icon: FaRecycle,
        color: '#9747FF'
      }
    ],
    multiSelect: true
  }
];

// Helper function to safely access responses
const getResponseValue = (responses: Partial<GroceryBudgetResponses>, questionId: QuestionId) => {
  switch (questionId) {
    case 'shoppingFrequency':
      return responses.shoppingFrequency;
    case 'budgetRange':
      return responses.budgetRange;
    case 'organicPreference':
      return responses.organicPreference;
    case 'bulkShopping':
      return responses.bulkShopping?.interested;
    case 'onlineGrocery':
      return responses.onlineGrocery?.frequency;
    case 'weeklyBudget':
      return responses.weeklyBudget?.range;
    case 'shoppingHabits':
      return responses.shoppingHabits;
    default:
      return undefined;
  }
};

export const GroceryBudgetSection: React.FC<GroceryBudgetSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Partial<GroceryBudgetResponses>>(initialResponses);
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
      case 'shoppingFrequency':
        setResponses(prev => ({
          ...prev,
          shoppingFrequency: value as GroceryBudgetResponses['shoppingFrequency']
        }));
        break;
      case 'preferredStores':
        if (typeof value === 'string') {
          setResponses(prev => ({
            ...prev,
            preferredStores: value.split(',').filter(Boolean)
          }));
        }
        break;
      case 'budgetRange':
        setResponses(prev => ({
          ...prev,
          budgetRange: value as GroceryBudgetResponses['budgetRange']
        }));
        break;
      case 'organicPreference':
        setResponses(prev => ({
          ...prev,
          organicPreference: value as GroceryBudgetResponses['organicPreference']
        }));
        break;
      case 'bulkShopping':
        setResponses(prev => ({
          ...prev,
          bulkShopping: {
            interested: Boolean(value),
            items: prev.bulkShopping?.items
          }
        }));
        break;
      case 'onlineGrocery':
        setResponses(prev => ({
          ...prev,
          onlineGrocery: {
            frequency: value as GroceryBudgetResponses['onlineGrocery']['frequency'],
            preferredServices: prev.onlineGrocery?.preferredServices
          }
        }));
        break;
      case 'weeklyBudget':
        setResponses(prev => ({
          ...prev,
          weeklyBudget: {
            range: value as GroceryBudgetResponses['weeklyBudget']['range'],
            flexibility: prev.weeklyBudget?.flexibility || 'somewhat_flexible'
          }
        }));
        break;
      case 'shoppingHabits':
        if (typeof value === 'string') {
          const habits = value.split(',').filter(Boolean);
          setResponses(prev => ({
            ...prev,
            shoppingHabits: {
              listMaking: habits.includes('listMaking'),
              comparesPrices: habits.includes('comparesPrices'),
              buysSeasonal: habits.includes('buysSeasonal'),
              checksLabels: habits.includes('checksLabels')
            }
          }));
        }
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
        onComplete(responses as GroceryBudgetResponses);
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
      case 'preferredStores':
        setResponses(prev => ({
          ...prev,
          preferredStores: [
            ...(prev.preferredStores || []),
            ...details.split(',').map(s => s.trim())
          ]
        }));
        break;
      case 'bulkShopping':
        setResponses(prev => ({
          ...prev,
          bulkShopping: {
            ...prev.bulkShopping!,
            items: details.split(',').map(i => i.trim())
          }
        }));
        break;
      case 'onlineGrocery':
        setResponses(prev => ({
          ...prev,
          onlineGrocery: {
            ...prev.onlineGrocery!,
            preferredServices: details.split(',').map(s => s.trim())
          }
        }));
        break;
      case 'weeklyBudget':
        setResponses(prev => ({
          ...prev,
          weeklyBudget: {
            ...prev.weeklyBudget!,
            flexibility: details as GroceryBudgetResponses['weeklyBudget']['flexibility']
          }
        }));
        break;
    }

    setShowDetails(false);
    setDetails('');
    
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete(responses as GroceryBudgetResponses);
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

      <Title>Grocery & Budget Preferences</Title>

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
                  QUESTIONS[currentQuestion].id === 'preferredStores'
                    ? "Please list your preferred store names..."
                    : QUESTIONS[currentQuestion].id === 'bulkShopping'
                    ? "What items would you like to buy in bulk?"
                    : QUESTIONS[currentQuestion].id === 'onlineGrocery'
                    ? "Which delivery services do you prefer?"
                    : "How flexible is your budget? (strict, somewhat_flexible, very_flexible)"
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