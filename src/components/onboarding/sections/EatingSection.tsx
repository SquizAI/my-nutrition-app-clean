import React from 'react';
import { BaseOnboardingSection } from './BaseOnboardingSection';
import { z } from 'zod';
import { 
  FaUtensils, 
  FaClock, 
  FaAppleAlt, 
  FaCarrot, 
  FaSeedling,
  FaBalanceScale,
  FaHeart,
  FaLeaf,
  FaBook,
  FaBrain,
  FaMobile
} from 'react-icons/fa';

// Define the response type for this section
interface EatingResponses {
  mealPattern: {
    frequency: string;
    timing: string[];
  };
  fastingProtocol: {
    follows: boolean;
    type?: string;
  };
  trackingMethod: string;
  foodRelationship: {
    satisfaction: string;
    challenges: string[];
    goals: string[];
  };
  snackingHabits: {
    frequency: string;
    triggers: string[];
  };
}

// Validation schema
const eatingSchema = z.object({
  mealPattern: z.object({
    frequency: z.enum(['2_meals', '3_meals', '4_plus_meals', 'irregular']),
    timing: z.array(z.string())
  }),
  fastingProtocol: z.object({
    follows: z.boolean(),
    type: z.enum(['16_8', '18_6', '20_4', 'omad', 'other']).optional()
  }),
  trackingMethod: z.enum(['app', 'journal', 'mental', 'none']),
  foodRelationship: z.object({
    satisfaction: z.enum(['very_satisfied', 'satisfied', 'neutral', 'dissatisfied']),
    challenges: z.array(z.string()),
    goals: z.array(z.string())
  }),
  snackingHabits: z.object({
    frequency: z.enum(['rarely', 'sometimes', 'often', 'very_often']),
    triggers: z.array(z.string())
  })
});

// Questions configuration
const eatingQuestions = [
  {
    id: 'mealPattern',
    text: 'How many meals do you typically eat per day?',
    voicePrompt: 'How many meals do you typically eat in a day? Include your usual meal timing if possible.',
    infoText: 'Understanding your meal patterns helps us optimize your nutrition plan.',
    type: 'select',
    options: [
      {
        value: '2_meals',
        label: '2 Meals',
        description: 'Two main meals daily',
        icon: FaUtensils,
        color: '#31E5FF'
      },
      {
        value: '3_meals',
        label: '3 Meals',
        description: 'Traditional breakfast, lunch, dinner',
        icon: FaUtensils,
        color: '#6BFF8E'
      },
      {
        value: '4_plus_meals',
        label: '4+ Meals',
        description: 'Multiple smaller meals',
        icon: FaUtensils,
        color: '#FFB020'
      },
      {
        value: 'irregular',
        label: 'Irregular',
        description: 'No fixed pattern',
        icon: FaClock,
        color: '#FF4D4D'
      }
    ],
    multiSelect: false,
    requiresDetails: 'Please specify your typical meal times (e.g., 8am, 1pm, 7pm)'
  },
  {
    id: 'fastingProtocol',
    text: 'Do you follow any intermittent fasting protocol?',
    voicePrompt: 'Do you practice intermittent fasting? If yes, which protocol do you follow?',
    infoText: 'This helps us understand your eating window and meal timing preferences.',
    type: 'select',
    options: [
      {
        value: 'true',
        label: 'Yes',
        description: 'I follow a fasting protocol',
        icon: FaClock,
        color: '#31E5FF'
      },
      {
        value: 'false',
        label: 'No',
        description: 'No fasting protocol',
        icon: FaUtensils,
        color: '#FF4D4D'
      }
    ],
    multiSelect: false,
    requiresDetails: 'Please specify your fasting protocol (16/8, 18/6, etc.)'
  },
  {
    id: 'trackingMethod',
    text: 'How do you track your food intake?',
    voicePrompt: 'How do you keep track of what you eat?',
    infoText: 'Understanding your tracking preferences helps us provide suitable recommendations.',
    type: 'select',
    options: [
      {
        value: 'app',
        label: 'Food Tracking App',
        description: 'Using a mobile app',
        icon: FaMobile,
        color: '#31E5FF'
      },
      {
        value: 'journal',
        label: 'Food Journal',
        description: 'Written tracking',
        icon: FaBook,
        color: '#6BFF8E'
      },
      {
        value: 'mental',
        label: 'Mental Tracking',
        description: 'Keeping track mentally',
        icon: FaBrain,
        color: '#FFB020'
      },
      {
        value: 'none',
        label: 'No Tracking',
        description: 'Don\'t track food',
        icon: FaUtensils,
        color: '#FF4D4D'
      }
    ],
    multiSelect: false,
    requiresDetails: false
  },
  {
    id: 'foodRelationship',
    text: 'How would you describe your relationship with food?',
    voicePrompt: 'How satisfied are you with your current relationship with food?',
    infoText: 'This helps us provide appropriate support and guidance.',
    type: 'select',
    options: [
      {
        value: 'very_satisfied',
        label: 'Very Satisfied',
        description: 'Positive and balanced',
        icon: FaHeart,
        color: '#6BFF8E'
      },
      {
        value: 'satisfied',
        label: 'Satisfied',
        description: 'Generally good',
        icon: FaHeart,
        color: '#31E5FF'
      },
      {
        value: 'neutral',
        label: 'Neutral',
        description: 'Neither good nor bad',
        icon: FaBalanceScale,
        color: '#FFB020'
      },
      {
        value: 'dissatisfied',
        label: 'Dissatisfied',
        description: 'Needs improvement',
        icon: FaLeaf,
        color: '#FF4D4D'
      }
    ],
    multiSelect: false,
    requiresDetails: 'Please describe any challenges you face with food'
  },
  {
    id: 'snackingHabits',
    text: 'How often do you snack between meals?',
    voicePrompt: 'How frequently do you snack between meals?',
    infoText: 'Understanding your snacking habits helps us plan appropriate portions and timing.',
    type: 'select',
    options: [
      {
        value: 'rarely',
        label: 'Rarely',
        description: 'Almost never snack',
        icon: FaAppleAlt,
        color: '#6BFF8E'
      },
      {
        value: 'sometimes',
        label: 'Sometimes',
        description: 'Occasional snacks',
        icon: FaCarrot,
        color: '#31E5FF'
      },
      {
        value: 'often',
        label: 'Often',
        description: 'Regular snacking',
        icon: FaSeedling,
        color: '#FFB020'
      },
      {
        value: 'very_often',
        label: 'Very Often',
        description: 'Frequent snacking',
        icon: FaUtensils,
        color: '#FF4D4D'
      }
    ],
    multiSelect: false,
    requiresDetails: 'Please describe what triggers your snacking'
  }
];

interface EatingSectionProps {
  onComplete: (responses: EatingResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<EatingResponses>;
}

export const EatingSection: React.FC<EatingSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  return (
    <BaseOnboardingSection<EatingResponses>
      title="Eating & Food Relationships"
      sectionId="eating"
      questions={eatingQuestions}
      currentQuestion={0}
      responses={initialResponses}
      onComplete={onComplete}
      onPrevious={onPrevious}
      initialResponses={initialResponses}
    />
  );
};