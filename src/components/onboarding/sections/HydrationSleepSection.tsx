import React from 'react';
import { BaseOnboardingSection } from './BaseOnboardingSection';
import { z } from 'zod';
import { 
  FaGlassWhiskey, 
  FaTint, 
  FaBed, 
  FaMoon, 
  FaClock,
  FaWineBottle, 
  FaCoffee, 
  FaRegMoon, 
  FaSun, 
  FaUtensils
} from 'react-icons/fa';

// Define the response type for this section
interface HydrationSleepResponses {
  waterIntake: {
    amount: number;
    unit: 'cups' | 'liters' | 'oz';
    trackingMethod: string;
  };
  hydrationHabits: {
    regularReminders: boolean;
    preferredDrinks: string[];
    hydrationChallenges: string[];
  };
  sleepSchedule: {
    bedtime: string;
    wakeTime: string;
    consistency: string;
  };
  sleepQuality: {
    quality: string;
    challenges: string[];
    improvementGoals: string[];
  };
  mealTiming: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
  };
  eveningRoutine: {
    lastMealTime: string;
    caffeineCutoff: string;
    windDownActivities: string[];
    screenTime: string;
  };
}

// Validation schema
const hydrationSleepSchema = z.object({
  waterIntake: z.object({
    amount: z.number(),
    unit: z.enum(['cups', 'liters', 'oz']),
    trackingMethod: z.enum(['app', 'bottle', 'reminders', 'none'])
  }),
  hydrationHabits: z.object({
    regularReminders: z.boolean(),
    preferredDrinks: z.array(z.string()),
    hydrationChallenges: z.array(z.string())
  }),
  sleepSchedule: z.object({
    bedtime: z.string(),
    wakeTime: z.string(),
    consistency: z.enum(['very_consistent', 'somewhat_consistent', 'inconsistent'])
  }),
  sleepQuality: z.object({
    quality: z.enum(['excellent', 'good', 'fair', 'poor']),
    challenges: z.array(z.string()),
    improvementGoals: z.array(z.string())
  }),
  mealTiming: z.object({
    breakfast: z.string(),
    lunch: z.string(),
    dinner: z.string(),
    snacks: z.array(z.string())
  }),
  eveningRoutine: z.object({
    lastMealTime: z.string(),
    caffeineCutoff: z.string(),
    windDownActivities: z.array(z.string()),
    screenTime: z.enum(['none', 'limited', 'unrestricted'])
  })
});

// Questions configuration
const hydrationSleepQuestions = [
  {
    id: 'waterIntake',
    text: 'How much water do you typically drink per day?',
    voicePrompt: 'Please tell me about your daily water intake and how you track it.',
    infoText: 'This helps us ensure you stay properly hydrated throughout the day.',
    type: 'select',
    options: [
      {
        value: 'tracking_app',
        label: 'Track with App',
        description: 'Digital tracking',
        icon: FaGlassWhiskey,
        color: '#31E5FF'
      },
      {
        value: 'water_bottle',
        label: 'Water Bottle',
        description: 'Track by refills',
        icon: FaWineBottle,
        color: '#6BFF8E'
      },
      {
        value: 'reminders',
        label: 'Reminders',
        description: 'Regular alerts',
        icon: FaClock,
        color: '#FFB020'
      },
      {
        value: 'no_tracking',
        label: 'No Tracking',
        description: 'Drink as needed',
        icon: FaTint,
        color: '#FF4D4D'
      }
    ],
    multiSelect: false,
    requiresDetails: 'Enter amount and unit (e.g., 8 cups, 2 liters, 64 oz)'
  },
  {
    id: 'hydrationHabits',
    text: 'What are your hydration preferences?',
    voicePrompt: 'Tell me about your preferred drinks and any hydration challenges.',
    infoText: 'Understanding your habits helps us provide better hydration recommendations.',
    type: 'multiSelect',
    options: [
      {
        value: 'water',
        label: 'Plain Water',
        description: 'Pure hydration',
        icon: FaTint,
        color: '#31E5FF'
      },
      {
        value: 'tea',
        label: 'Tea',
        description: 'Herbal/caffeinated',
        icon: FaCoffee,
        color: '#6BFF8E'
      },
      {
        value: 'coffee',
        label: 'Coffee',
        description: 'Caffeinated drinks',
        icon: FaCoffee,
        color: '#FFB020'
      },
      {
        value: 'sports_drinks',
        label: 'Sports Drinks',
        description: 'Electrolyte drinks',
        icon: FaWineBottle,
        color: '#9747FF'
      }
    ],
    multiSelect: true,
    requiresDetails: 'List any hydration challenges you face'
  },
  {
    id: 'sleepSchedule',
    text: 'What is your typical sleep schedule?',
    voicePrompt: 'When do you usually go to bed and wake up?',
    infoText: 'This helps us optimize your meal timing and evening routine.',
    type: 'select',
    options: [
      {
        value: 'very_consistent',
        label: 'Very Consistent',
        description: 'Same times daily',
        icon: FaClock,
        color: '#6BFF8E'
      },
      {
        value: 'somewhat_consistent',
        label: 'Somewhat Consistent',
        description: 'Minor variations',
        icon: FaClock,
        color: '#31E5FF'
      },
      {
        value: 'inconsistent',
        label: 'Inconsistent',
        description: 'Varies significantly',
        icon: FaClock,
        color: '#FF4D4D'
      }
    ],
    multiSelect: false,
    requiresDetails: 'Enter bedtime and wake time (e.g., 10:30 PM, 6:30 AM)'
  },
  {
    id: 'sleepQuality',
    text: 'How would you rate your sleep quality?',
    voicePrompt: 'How would you describe the quality of your sleep?',
    infoText: 'Understanding your sleep quality helps us provide better evening routine recommendations.',
    type: 'select',
    options: [
      {
        value: 'excellent',
        label: 'Excellent',
        description: 'Consistently great',
        icon: FaBed,
        color: '#6BFF8E'
      },
      {
        value: 'good',
        label: 'Good',
        description: 'Usually good',
        icon: FaBed,
        color: '#31E5FF'
      },
      {
        value: 'fair',
        label: 'Fair',
        description: 'Could improve',
        icon: FaBed,
        color: '#FFB020'
      },
      {
        value: 'poor',
        label: 'Poor',
        description: 'Needs improvement',
        icon: FaBed,
        color: '#FF4D4D'
      }
    ],
    multiSelect: false,
    requiresDetails: 'List any sleep challenges you experience'
  },
  {
    id: 'mealTiming',
    text: 'When do you prefer to eat your meals?',
    voicePrompt: 'What are your preferred meal times throughout the day?',
    infoText: 'This helps us create a meal schedule that works with your natural rhythm.',
    type: 'select',
    options: [
      {
        value: 'early_bird',
        label: 'Early Bird',
        description: 'Early meals',
        icon: FaSun,
        color: '#6BFF8E'
      },
      {
        value: 'traditional',
        label: 'Traditional',
        description: 'Standard times',
        icon: FaUtensils,
        color: '#31E5FF'
      },
      {
        value: 'late_eater',
        label: 'Late Eater',
        description: 'Later meals',
        icon: FaMoon,
        color: '#FFB020'
      },
      {
        value: 'variable',
        label: 'Variable',
        description: 'Flexible timing',
        icon: FaClock,
        color: '#9747FF'
      }
    ],
    multiSelect: false,
    requiresDetails: 'Enter preferred meal times (breakfast, lunch, dinner)'
  },
  {
    id: 'eveningRoutine',
    text: 'Tell me about your evening routine',
    voicePrompt: 'What time do you have your last meal and how do you wind down for sleep?',
    infoText: 'This helps us optimize your evening nutrition and sleep preparation.',
    type: 'multiSelect',
    options: [
      {
        value: 'early_dinner',
        label: 'Early Dinner',
        description: 'Eat early',
        icon: FaUtensils,
        color: '#6BFF8E'
      },
      {
        value: 'no_caffeine',
        label: 'No Late Caffeine',
        description: 'Caffeine cutoff',
        icon: FaCoffee,
        color: '#31E5FF'
      },
      {
        value: 'wind_down',
        label: 'Wind Down',
        description: 'Relaxing routine',
        icon: FaRegMoon,
        color: '#FFB020'
      },
      {
        value: 'screen_limit',
        label: 'Screen Limits',
        description: 'Reduce blue light',
        icon: FaMoon,
        color: '#9747FF'
      }
    ],
    multiSelect: true,
    requiresDetails: 'Enter last meal time and caffeine cutoff time'
  }
];

interface HydrationSleepSectionProps {
  onComplete: (responses: HydrationSleepResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<HydrationSleepResponses>;
}

export const HydrationSleepSection: React.FC<HydrationSleepSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  return (
    <BaseOnboardingSection<HydrationSleepResponses>
      title="Hydration & Sleep Habits"
      sectionId="hydration-sleep"
      questions={hydrationSleepQuestions}
      currentQuestion={0}
      responses={initialResponses}
      onComplete={onComplete}
      onPrevious={onPrevious}
      initialResponses={initialResponses}
    />
  );
};