import React from 'react';
import { BaseOnboardingSection } from './BaseOnboardingSection';
import { z } from 'zod';
import { 
  FaRunning, 
  FaDumbbell, 
  FaChartLine, 
  FaHeart, 
  FaMedal,
  FaCalendarAlt,
  FaClock,
  FaStopwatch,
  FaCheckCircle
} from 'react-icons/fa';

// Define the response type for this section
interface FitnessResponses {
  activityLevel: string;
  exerciseFrequency: string;
  exerciseTypes: string[];
  fitnessGoals: string[];
  workoutDuration: string;
  preferredTime: string;
  limitations: string;
}

// Validation schema
const fitnessSchema = z.object({
  activityLevel: z.string(),
  exerciseFrequency: z.string(),
  exerciseTypes: z.array(z.string()),
  fitnessGoals: z.array(z.string()),
  workoutDuration: z.string(),
  preferredTime: z.string(),
  limitations: z.string()
});

// Questions configuration
const fitnessQuestions = [
  {
    id: 'activityLevel',
    text: 'How would you describe your current activity level?',
    voicePrompt: 'Please tell me about your current activity level.',
    infoText: 'This helps us understand your baseline and create appropriate recommendations.',
    type: 'select',
    options: [
      {
        value: 'sedentary',
        label: 'Sedentary',
        description: 'Little to no regular exercise',
        icon: FaHeart,
        color: '#FF4D4D'
      },
      {
        value: 'lightly_active',
        label: 'Lightly Active',
        description: 'Light exercise 1-3 times/week',
        icon: FaHeart,
        color: '#31E5FF'
      },
      {
        value: 'moderately_active',
        label: 'Moderately Active',
        description: 'Moderate exercise 3-5 times/week',
        icon: FaHeart,
        color: '#FFB020'
      },
      {
        value: 'very_active',
        label: 'Very Active',
        description: 'Hard exercise 6-7 times/week',
        icon: FaHeart,
        color: '#6BFF8E'
      },
      {
        value: 'extra_active',
        label: 'Extra Active',
        description: 'Very hard exercise & physical job',
        icon: FaHeart,
        color: '#9747FF'
      }
    ],
    multiSelect: false,
    requiresDetails: false
  },
  {
    id: 'exerciseFrequency',
    text: 'How often do you plan to exercise?',
    voicePrompt: 'How many times per week do you plan to exercise?',
    infoText: 'Regular exercise is key to achieving your fitness goals.',
    type: 'select',
    options: [
      {
        value: '1-2',
        label: '1-2 times/week',
        description: 'Getting started',
        icon: FaCalendarAlt,
        color: '#FF4D4D'
      },
      {
        value: '3-4',
        label: '3-4 times/week',
        description: 'Building consistency',
        icon: FaCalendarAlt,
        color: '#31E5FF'
      },
      {
        value: '5-6',
        label: '5-6 times/week',
        description: 'Dedicated routine',
        icon: FaCalendarAlt,
        color: '#FFB020'
      },
      {
        value: '7',
        label: 'Every day',
        description: 'Maximum commitment',
        icon: FaCalendarAlt,
        color: '#6BFF8E'
      }
    ],
    multiSelect: false,
    requiresDetails: false
  },
  {
    id: 'exerciseTypes',
    text: 'What types of exercise do you enjoy or want to try?',
    voicePrompt: 'What types of exercise do you prefer?',
    infoText: 'Choose activities you enjoy to make your fitness journey more sustainable.',
    type: 'multiSelect',
    options: [
      {
        value: 'cardio',
        label: 'Cardio',
        description: 'Running, cycling, swimming',
        icon: FaRunning,
        color: '#FF4D4D'
      },
      {
        value: 'strength',
        label: 'Strength Training',
        description: 'Weights, resistance training',
        icon: FaDumbbell,
        color: '#31E5FF'
      },
      {
        value: 'hiit',
        label: 'HIIT',
        description: 'High-intensity interval training',
        icon: FaStopwatch,
        color: '#FFB020'
      },
      {
        value: 'yoga',
        label: 'Yoga/Stretching',
        description: 'Flexibility and mindfulness',
        icon: FaHeart,
        color: '#6BFF8E'
      },
      {
        value: 'sports',
        label: 'Sports',
        description: 'Team or individual sports',
        icon: FaMedal,
        color: '#9747FF'
      }
    ],
    multiSelect: true,
    requiresDetails: false
  },
  {
    id: 'fitnessGoals',
    text: 'What are your fitness goals?',
    voicePrompt: 'What are your main fitness goals?',
    infoText: 'Your goals help us tailor your nutrition and exercise recommendations.',
    type: 'multiSelect',
    options: [
      {
        value: 'weight_loss',
        label: 'Weight Loss',
        description: 'Reduce body fat',
        icon: FaChartLine,
        color: '#FF4D4D'
      },
      {
        value: 'muscle_gain',
        label: 'Muscle Gain',
        description: 'Build strength/size',
        icon: FaDumbbell,
        color: '#31E5FF'
      },
      {
        value: 'endurance',
        label: 'Endurance',
        description: 'Improve stamina',
        icon: FaRunning,
        color: '#FFB020'
      },
      {
        value: 'health',
        label: 'General Health',
        description: 'Overall wellness',
        icon: FaHeart,
        color: '#6BFF8E'
      },
      {
        value: 'performance',
        label: 'Performance',
        description: 'Athletic goals',
        icon: FaMedal,
        color: '#9747FF'
      }
    ],
    multiSelect: true,
    requiresDetails: false
  },
  {
    id: 'workoutDuration',
    text: 'How long do you prefer your workouts to be?',
    voicePrompt: 'How many minutes do you want to spend on each workout?',
    infoText: 'We\'ll help you make the most of your available time.',
    type: 'select',
    options: [
      {
        value: '15-30',
        label: '15-30 minutes',
        description: 'Quick and effective',
        icon: FaClock,
        color: '#FF4D4D'
      },
      {
        value: '30-45',
        label: '30-45 minutes',
        description: 'Balanced duration',
        icon: FaClock,
        color: '#31E5FF'
      },
      {
        value: '45-60',
        label: '45-60 minutes',
        description: 'Comprehensive workout',
        icon: FaClock,
        color: '#FFB020'
      },
      {
        value: '60+',
        label: '60+ minutes',
        description: 'Extended session',
        icon: FaClock,
        color: '#6BFF8E'
      }
    ],
    multiSelect: false,
    requiresDetails: false
  },
  {
    id: 'preferredTime',
    text: 'When do you prefer to exercise?',
    voicePrompt: 'What time of day do you prefer to exercise?',
    infoText: 'Choosing a time that fits your schedule increases consistency.',
    type: 'select',
    options: [
      {
        value: 'morning',
        label: 'Morning',
        description: 'Start the day strong',
        icon: FaClock,
        color: '#FF4D4D'
      },
      {
        value: 'afternoon',
        label: 'Afternoon',
        description: 'Mid-day energy boost',
        icon: FaClock,
        color: '#31E5FF'
      },
      {
        value: 'evening',
        label: 'Evening',
        description: 'End of day workout',
        icon: FaClock,
        color: '#FFB020'
      },
      {
        value: 'flexible',
        label: 'Flexible',
        description: 'Varies by day',
        icon: FaClock,
        color: '#6BFF8E'
      }
    ],
    multiSelect: false,
    requiresDetails: false
  },
  {
    id: 'limitations',
    text: 'Do you have any physical limitations or injuries we should know about?',
    voicePrompt: 'Please tell me about any physical limitations or injuries you have.',
    infoText: 'This helps us provide safe and appropriate exercise recommendations.',
    type: 'text',
    options: [],
    multiSelect: false,
    requiresDetails: 'Please include any specific movements or activities to avoid.'
  }
];

interface FitnessSectionProps {
  onComplete: (responses: FitnessResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<FitnessResponses>;
}

export const FitnessSection: React.FC<FitnessSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  return (
    <BaseOnboardingSection<FitnessResponses>
      title="Fitness Profile"
      sectionId="fitness"
      questions={fitnessQuestions}
      currentQuestion={0}
      responses={initialResponses}
      onComplete={onComplete}
      onPrevious={onPrevious}
      initialResponses={initialResponses}
    />
  );
}; 