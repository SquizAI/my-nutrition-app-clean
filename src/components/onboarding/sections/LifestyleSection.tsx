import React, { useState, useCallback } from 'react';
import { 
  BaseOnboardingSection,
  Question,
  Option 
} from './BaseOnboardingSection';
import { z } from 'zod';
import { 
  FaBolt, FaBrain, FaRegSmile, FaHeart, 
  FaUtensils, FaClock, FaMoon, FaSun,
  FaCoffee, FaWineGlass, FaAppleAlt
} from 'react-icons/fa';

// Enhanced Zod schema for lifestyle responses with follow-up details
export const LifestyleSchema = z.object({
  energyLevels: z.object({
    pattern: z.enum(['consistently_high', 'afternoon_slumps', 'tired_all_day', 'up_and_down']),
    details: z.object({
      worstTime: z.string().optional(),
      bestTime: z.string().optional(),
      caffeine: z.string().optional(),
      sleepQuality: z.string().optional(),
      mealTiming: z.string().optional()
    })
  }),
  mealEnergyIssues: z.object({
    hasIssues: z.enum(['yes', 'no', 'sometimes']),
    details: z.object({
      timing: z.string().optional(),
      symptoms: z.string().optional(),
      triggers: z.string().optional(),
      improvements: z.string().optional()
    })
  }),
  stressLevel: z.object({
    level: z.enum(['low', 'moderate', 'high', 'overwhelming']),
    details: z.object({
      triggers: z.string().optional(),
      copingMethods: z.string().optional(),
      impactOnDiet: z.string().optional(),
      supportNeeded: z.string().optional()
    })
  }),
  emotionalEating: z.object({
    frequency: z.enum(['frequently', 'occasionally', 'rarely', 'never']),
    details: z.object({
      triggers: z.string().optional(),
      foods: z.string().optional(),
      timeOfDay: z.string().optional(),
      copingStrategies: z.string().optional()
    })
  })
});

export type LifestyleResponses = z.infer<typeof LifestyleSchema>;

const QUESTIONS: Question[] = [
  {
    id: 'energyLevels',
    text: 'How are your energy levels throughout the day?',
    voicePrompt: 'How would you describe your energy levels throughout the day?',
    infoText: 'Understanding your energy patterns helps us optimize your nutrition and meal timing recommendations.',
    options: [
      {
        value: 'consistently_high',
        label: 'Consistently High',
        description: 'Steady energy throughout the day',
        icon: FaSun,
        color: '#31E5FF',
        followUpQuestions: [
          {
            id: 'bestTime',
            text: 'When do you feel most energetic?',
            voicePrompt: 'What time of day do you typically feel most energetic?',
            placeholder: 'e.g., Morning, 6-8am'
          },
          {
            id: 'caffeine',
            text: 'How much caffeine do you consume daily?',
            voicePrompt: 'Tell me about your caffeine consumption throughout the day.',
            placeholder: 'e.g., 2 cups of coffee in morning'
          },
          {
            id: 'sleepQuality',
            text: 'How would you rate your sleep quality?',
            voicePrompt: 'How well do you typically sleep at night?',
            placeholder: 'Describe your typical sleep pattern'
          }
        ]
      },
      {
        value: 'afternoon_slumps',
        label: 'Afternoon Slumps',
        description: 'Energy drops in the afternoon',
        icon: FaClock,
        color: '#9747FF',
        followUpQuestions: [
          {
            id: 'worstTime',
            text: 'When exactly do you experience the energy drop?',
            voicePrompt: 'What time do you usually start feeling the afternoon slump?',
            placeholder: 'e.g., Between 2-4pm'
          },
          {
            id: 'mealTiming',
            text: 'How does this relate to your meal timing?',
            voicePrompt: 'Tell me about when you eat lunch and if you notice any connection to your energy levels.',
            placeholder: 'e.g., Usually 1 hour after lunch'
          },
          {
            id: 'improvements',
            text: 'What helps improve your energy during these times?',
            voicePrompt: 'What strategies have you tried to combat the afternoon slump?',
            placeholder: 'e.g., Coffee, snacks, walking'
          }
        ]
      },
      {
        value: 'tired_all_day',
        label: 'Tired All Day',
        description: 'Consistently low energy levels',
        icon: FaMoon,
        color: '#FF4D4D',
        followUpQuestions: [
          {
            id: 'sleepQuality',
            text: 'How is your sleep quality and duration?',
            voicePrompt: 'Tell me about your typical sleep pattern and quality.',
            placeholder: 'e.g., 7 hours but restless'
          },
          {
            id: 'worstTime',
            text: 'When is your energy lowest?',
            voicePrompt: 'What time of day do you feel most tired?',
            placeholder: 'e.g., Especially in mornings'
          },
          {
            id: 'caffeine',
            text: 'How do you currently manage your energy levels?',
            voicePrompt: 'What do you currently do to try to boost your energy?',
            placeholder: 'e.g., Multiple coffees, energy drinks'
          }
        ]
      },
      {
        value: 'up_and_down',
        label: 'Up and Down',
        description: 'Energy fluctuates throughout the day',
        icon: FaBolt,
        color: '#FFB020',
        followUpQuestions: [
          {
            id: 'pattern',
            text: 'Can you describe your typical energy pattern?',
            voicePrompt: 'Walk me through your typical energy fluctuations during the day.',
            placeholder: 'e.g., High morning, crash after lunch'
          },
          {
            id: 'mealTiming',
            text: 'How does this relate to your eating pattern?',
            voicePrompt: 'Do you notice any connection between your meals and energy levels?',
            placeholder: 'e.g., Energy drops 2 hours after meals'
          },
          {
            id: 'improvements',
            text: 'What helps stabilize your energy?',
            voicePrompt: 'Have you found anything that helps maintain more stable energy levels?',
            placeholder: 'e.g., Regular snacks, protein with meals'
          }
        ]
      }
    ]
  },
  {
    id: 'mealEnergyIssues',
    text: 'Do you experience energy crashes after meals?',
    voicePrompt: 'Do you ever feel fatigue, dizziness, or energy crashes after meals?',
    infoText: 'This helps us identify potential blood sugar regulation issues or meal composition needs.',
    options: [
      { 
        value: 'yes',
        label: 'Yes',
        description: 'Regular post-meal energy crashes',
        icon: FaBrain,
        color: '#FF4D4D',
        followUpQuestions: [
          {
            id: 'timing',
            text: 'When do these crashes typically occur?',
            voicePrompt: 'How long after eating do you usually experience these crashes?',
            placeholder: 'e.g., 1-2 hours after lunch'
          },
          {
            id: 'symptoms',
            text: 'What symptoms do you experience?',
            voicePrompt: 'Describe the symptoms you experience during these energy crashes.',
            placeholder: 'e.g., Sleepiness, difficulty focusing'
          },
          {
            id: 'triggers',
            text: 'Have you noticed any specific food triggers?',
            voicePrompt: 'Are there any particular foods that seem to trigger these crashes?',
            placeholder: 'e.g., High carb meals, sugary foods'
          }
        ]
      },
      { 
        value: 'sometimes',
        label: 'Sometimes',
        description: 'Occasional energy dips',
        icon: FaRegSmile,
        color: '#FFB020',
        followUpQuestions: [
          {
            id: 'pattern',
            text: 'Can you identify any patterns?',
            voicePrompt: 'Have you noticed any patterns to when these occasional crashes occur?',
            placeholder: 'e.g., After large meals, certain foods'
          },
          {
            id: 'improvements',
            text: 'What helps prevent these crashes?',
            voicePrompt: 'Have you found anything that helps prevent these occasional crashes?',
            placeholder: 'e.g., Smaller portions, protein with meals'
          }
        ]
      },
      { 
        value: 'no',
        label: 'No',
        description: 'Stable energy after meals',
        icon: FaBolt,
        color: '#6BFF8E'
      }
    ]
  },
  {
    id: 'stressLevel',
    text: 'How would you rate your current stress level?',
    voicePrompt: 'How would you rate your current stress level?',
    infoText: 'Stress levels can impact nutrition needs and eating patterns.',
    options: [
      {
        value: 'low',
        label: 'Low',
        description: 'Generally relaxed and calm',
        icon: FaRegSmile,
        color: '#6BFF8E'
      },
      {
        value: 'moderate',
        label: 'Moderate',
        description: 'Some stress but manageable',
        icon: FaBrain,
        color: '#FFB020',
        followUpQuestions: [
          {
            id: 'triggers',
            text: 'What are your main sources of stress?',
            voicePrompt: 'What typically causes you stress?',
            placeholder: 'e.g., Work deadlines, family'
          },
          {
            id: 'copingMethods',
            text: 'How do you currently manage stress?',
            voicePrompt: 'What methods do you use to cope with stress?',
            placeholder: 'e.g., Exercise, meditation'
          }
        ]
      },
      {
        value: 'high',
        label: 'High',
        description: 'Frequently stressed',
        icon: FaBolt,
        color: '#FF4D4D',
        followUpQuestions: [
          {
            id: 'triggers',
            text: 'What are your main sources of stress?',
            voicePrompt: 'What are the primary causes of your high stress levels?',
            placeholder: 'e.g., Work, relationships, health'
          },
          {
            id: 'impactOnDiet',
            text: 'How does stress affect your eating?',
            voicePrompt: 'How does your stress level impact your eating habits?',
            placeholder: 'e.g., Skip meals, stress eating'
          },
          {
            id: 'supportNeeded',
            text: 'What kind of support would help?',
            voicePrompt: 'What type of support would be most helpful for managing your stress?',
            placeholder: 'e.g., Meal planning, stress management tips'
          }
        ]
      }
    ]
  },
  {
    id: 'emotionalEating',
    text: 'Do you experience emotional eating?',
    voicePrompt: 'How often do you find yourself eating in response to emotions?',
    infoText: 'Understanding emotional eating patterns helps us provide better strategies for managing cravings.',
    options: [
      {
        value: 'frequently',
        label: 'Frequently',
        description: 'Regular emotional eating',
        icon: FaHeart,
        color: '#FF4D4D',
        followUpQuestions: [
          {
            id: 'triggers',
            text: 'What emotions typically trigger eating?',
            voicePrompt: 'What emotions most often lead to emotional eating?',
            placeholder: 'e.g., Stress, anxiety, boredom'
          },
          {
            id: 'foods',
            text: 'What foods do you typically crave?',
            voicePrompt: 'What types of foods do you usually eat during emotional eating?',
            placeholder: 'e.g., Sweet, salty, comfort foods'
          },
          {
            id: 'timeOfDay',
            text: 'When does this usually occur?',
            voicePrompt: 'What time of day do you most often experience emotional eating?',
            placeholder: 'e.g., Late evening, after work'
          },
          {
            id: 'copingStrategies',
            text: 'What strategies have you tried?',
            voicePrompt: 'What strategies have you tried to manage emotional eating?',
            placeholder: 'e.g., Distraction, meditation'
          }
        ]
      },
      {
        value: 'occasionally',
        label: 'Occasionally',
        description: 'Sometimes eat due to emotions',
        icon: FaRegSmile,
        color: '#FFB020',
        followUpQuestions: [
          {
            id: 'triggers',
            text: 'What typically triggers these occasions?',
            voicePrompt: 'What situations or emotions typically lead to emotional eating?',
            placeholder: 'e.g., Stressful events, celebrations'
          },
          {
            id: 'copingStrategies',
            text: 'How do you handle these situations?',
            voicePrompt: 'What strategies do you use when you notice emotional eating?',
            placeholder: 'e.g., Portion control, alternative activities'
          }
        ]
      },
      {
        value: 'rarely',
        label: 'Rarely',
        description: 'Seldom emotional eating',
        icon: FaBolt,
        color: '#31E5FF'
      },
      {
        value: 'never',
        label: 'Never',
        description: 'No emotional eating',
        icon: FaRegSmile,
        color: '#6BFF8E'
      }
    ]
  }
];

interface LifestyleSectionProps {
  onComplete: (responses: LifestyleResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<LifestyleResponses>;
}

export const LifestyleSection: React.FC<LifestyleSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Partial<LifestyleResponses>>(initialResponses);

  const handleResponse = useCallback((newResponses: Partial<LifestyleResponses>) => {
    setResponses(prev => {
      const updated = { ...prev, ...newResponses };
      
      // Check if we should move to next question
      if (Object.keys(newResponses).includes(QUESTIONS[currentQuestion].id)) {
        if (currentQuestion < QUESTIONS.length - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          // If this was the last question, complete the section
          onComplete(updated as LifestyleResponses);
        }
      }
      
      return updated;
    });
  }, [currentQuestion, onComplete]);

  return (
    <BaseOnboardingSection<LifestyleResponses>
      title="Lifestyle & Energy"
      questions={QUESTIONS}
      currentQuestion={currentQuestion}
      responses={responses}
      onComplete={handleResponse}
      onPrevious={onPrevious}
      initialResponses={initialResponses}
    />
  );
}; 