import React from 'react';
import { BaseOnboardingSection } from './BaseOnboardingSection';
import { z } from 'zod';
import { 
  FaLeaf, 
  FaCarrot, 
  FaDrumstickBite, 
  FaFish,
  FaBreadSlice,
  FaCheese,
  FaAppleAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

// Define the response type for this section
interface DietaryPreferencesResponses {
  dietType: string;
  restrictions: string[];
  preferences: {
    likes: string[];
    dislikes: string[];
  };
  intolerances: string[];
  religiousRestrictions: string[];
  sustainabilityPreferences: string[];
}

// Validation schema
const dietaryPreferencesSchema = z.object({
  dietType: z.string(),
  restrictions: z.array(z.string()),
  preferences: z.object({
    likes: z.array(z.string()),
    dislikes: z.array(z.string())
  }),
  intolerances: z.array(z.string()),
  religiousRestrictions: z.array(z.string()),
  sustainabilityPreferences: z.array(z.string())
});

// Questions configuration
const dietaryPreferencesQuestions = [
  {
    id: 'dietType',
    text: 'What type of diet do you follow?',
    voicePrompt: 'Please tell me about your dietary preferences.',
    infoText: 'This helps us understand your primary dietary approach.',
    type: 'select',
    options: [
      {
        value: 'omnivore',
        label: 'Omnivore',
        description: 'Eat both plant and animal products',
        icon: FaDrumstickBite,
        color: '#31E5FF'
      },
      {
        value: 'vegetarian',
        label: 'Vegetarian',
        description: 'No meat or fish',
        icon: FaLeaf,
        color: '#6BFF8E'
      },
      {
        value: 'vegan',
        label: 'Vegan',
        description: 'No animal products',
        icon: FaCarrot,
        color: '#FFB020'
      },
      {
        value: 'pescatarian',
        label: 'Pescatarian',
        description: 'Fish but no meat',
        icon: FaFish,
        color: '#9747FF'
      }
    ],
    multiSelect: false,
    requiresDetails: false
  },
  {
    id: 'restrictions',
    text: 'Do you have any dietary restrictions?',
    voicePrompt: 'Please tell me about any foods you cannot or choose not to eat.',
    infoText: 'This helps us avoid recommending foods that don\'t align with your diet.',
    type: 'multiSelect',
    options: [
      {
        value: 'gluten_free',
        label: 'Gluten-Free',
        description: 'No gluten-containing foods',
        icon: FaBreadSlice,
        color: '#31E5FF'
      },
      {
        value: 'dairy_free',
        label: 'Dairy-Free',
        description: 'No dairy products',
        icon: FaCheese,
        color: '#6BFF8E'
      },
      {
        value: 'nut_free',
        label: 'Nut-Free',
        description: 'No nuts or nut products',
        icon: FaExclamationTriangle,
        color: '#FFB020'
      },
      {
        value: 'soy_free',
        label: 'Soy-Free',
        description: 'No soy products',
        icon: FaExclamationTriangle,
        color: '#9747FF'
      }
    ],
    multiSelect: true,
    requiresDetails: 'Please specify any additional restrictions'
  },
  {
    id: 'preferences',
    text: 'What are your food preferences?',
    voicePrompt: 'Tell me about foods you particularly enjoy or dislike.',
    infoText: 'This helps us personalize your meal recommendations.',
    type: 'multiSelect',
    options: [
      {
        value: 'fruits',
        label: 'Fruits',
        description: 'Fresh and dried fruits',
        icon: FaAppleAlt,
        color: '#31E5FF'
      },
      {
        value: 'vegetables',
        label: 'Vegetables',
        description: 'All types of vegetables',
        icon: FaCarrot,
        color: '#6BFF8E'
      },
      {
        value: 'grains',
        label: 'Whole Grains',
        description: 'Whole grain products',
        icon: FaBreadSlice,
        color: '#FFB020'
      },
      {
        value: 'proteins',
        label: 'Proteins',
        description: 'Various protein sources',
        icon: FaDrumstickBite,
        color: '#9747FF'
      }
    ],
    multiSelect: true,
    requiresDetails: 'Please list specific foods you like or dislike'
  },
  {
    id: 'intolerances',
    text: 'Do you have any food intolerances?',
    voicePrompt: 'Please tell me about any foods that cause you discomfort.',
    infoText: 'This helps us avoid foods that might cause adverse reactions.',
    type: 'multiSelect',
    options: [
      {
        value: 'lactose',
        label: 'Lactose',
        description: 'Dairy sugar intolerance',
        icon: FaCheese,
        color: '#31E5FF'
      },
      {
        value: 'fructose',
        label: 'Fructose',
        description: 'Fruit sugar intolerance',
        icon: FaAppleAlt,
        color: '#6BFF8E'
      },
      {
        value: 'gluten',
        label: 'Gluten',
        description: 'Gluten sensitivity',
        icon: FaBreadSlice,
        color: '#FFB020'
      },
      {
        value: 'other',
        label: 'Other',
        description: 'Other intolerances',
        icon: FaExclamationTriangle,
        color: '#9747FF'
      }
    ],
    multiSelect: true,
    requiresDetails: 'Please describe any symptoms or reactions'
  },
  {
    id: 'religiousRestrictions',
    text: 'Do you have any religious dietary restrictions?',
    voicePrompt: 'Please tell me about any religious dietary requirements.',
    infoText: 'This helps us respect your religious dietary practices.',
    type: 'multiSelect',
    options: [
      {
        value: 'kosher',
        label: 'Kosher',
        description: 'Jewish dietary laws',
        icon: FaExclamationTriangle,
        color: '#31E5FF'
      },
      {
        value: 'halal',
        label: 'Halal',
        description: 'Islamic dietary laws',
        icon: FaExclamationTriangle,
        color: '#6BFF8E'
      },
      {
        value: 'other',
        label: 'Other',
        description: 'Other religious restrictions',
        icon: FaExclamationTriangle,
        color: '#FFB020'
      }
    ],
    multiSelect: true,
    requiresDetails: 'Please specify any additional requirements'
  }
];

interface DietaryPreferencesSectionProps {
  onComplete: (responses: DietaryPreferencesResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<DietaryPreferencesResponses>;
}

export const DietaryPreferencesSection: React.FC<DietaryPreferencesSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  return (
    <BaseOnboardingSection<DietaryPreferencesResponses>
      title="Dietary Preferences"
      sectionId="dietary-preferences"
      questions={dietaryPreferencesQuestions}
      currentQuestion={0}
      responses={initialResponses}
      onComplete={onComplete}
      onPrevious={onPrevious}
      initialResponses={initialResponses}
    />
  );
}; 