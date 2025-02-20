import { z } from 'zod';
import { OnboardingStep, QuestionType, StepType } from '../types';

export type UserType = 'basic' | 'advanced';

// Basic onboarding steps - simplified flow
export const basicOnboardingSteps: OnboardingStep[] = [
  {
    id: 'legal',
    title: 'Getting Started',
    description: 'Let\'s set up your account.',
    type: 'legal',
    questions: [
      {
        id: 'name',
        text: 'What should we call you?',
        type: 'text',
        required: true,
        voicePrompt: 'What should we call you?'
      },
      {
        id: 'terms',
        text: 'Do you accept our terms of service?',
        type: 'boolean',
        required: true,
        voicePrompt: 'Do you accept our terms of service?'
      }
    ]
  },
  {
    id: 'metrics',
    title: 'Basic Information',
    description: 'Tell us about yourself.',
    type: 'metrics',
    questions: [
      {
        id: 'age',
        text: 'How old are you?',
        type: 'number',
        required: true,
        voicePrompt: 'How old are you?',
        validation: (value: number) => value >= 13 && value <= 100
      },
      {
        id: 'gender',
        text: 'What\'s your gender?',
        type: 'select',
        options: ['Male', 'Female', 'Other'],
        required: true,
        voicePrompt: 'What\'s your gender?'
      },
      {
        id: 'height',
        text: 'What\'s your height?',
        type: 'number',
        required: true,
        voicePrompt: 'What\'s your height?'
      },
      {
        id: 'weight',
        text: 'What\'s your weight?',
        type: 'number',
        required: true,
        voicePrompt: 'What\'s your weight?'
      }
    ]
  },
  {
    id: 'goals',
    title: 'Your Goals',
    description: 'What would you like to achieve?',
    type: 'preferences',
    questions: [
      {
        id: 'goal',
        text: 'What\'s your main goal?',
        type: 'select',
        options: [
          'Lose Weight',
          'Maintain Weight',
          'Gain Weight',
          'Eat Healthier',
          'Track Nutrition'
        ],
        required: true,
        voicePrompt: 'What\'s your main goal?'
      },
      {
        id: 'activity_level',
        text: 'How active are you?',
        type: 'select',
        options: [
          'Not Very Active',
          'Somewhat Active',
          'Very Active'
        ],
        required: true,
        voicePrompt: 'How active are you?'
      }
    ]
  }
];

// Update the advanced onboarding steps to separate name input
const advancedOnboardingSteps: OnboardingStep[] = [
  {
    id: 'name',
    title: 'Welcome to JME AI',
    description: "Before we begin, let's get to know you.",
    type: 'intro',
    questions: [
      { 
        id: 'name', 
        text: 'Please tell me your preferred name.',
        type: 'text',
        required: true,
        voicePrompt: 'Please tell me your preferred name.'
      }
    ]
  },
  {
    id: 'legal',
    title: 'Terms & Legal Agreements',
    description: "Before we get started, please review and accept our terms.",
    type: 'legal',
    questions: [
      { 
        id: 'terms', 
        text: 'We provide AI-generated nutritional guidance; this does not replace medical treatment. Do you accept?', 
        type: 'boolean', 
        required: true,
        voicePrompt: 'We provide AI-generated nutritional guidance; this does not replace medical treatment. Do you accept?'
      },
      { 
        id: 'privacy', 
        text: 'Would you like to read or listen to our Privacy Policy? It explains how we protect and store your data.', 
        type: 'select', 
        required: true,
        options: ['Accept', 'Decline', 'Read Policy', 'Listen to Policy'],
        voicePrompt: 'Would you like to read or listen to our Privacy Policy? It explains how we protect and store your data.'
      },
      { 
        id: 'medical', 
        text: 'This advice is general and not a substitute for professional medical guidance. Do you accept?', 
        type: 'boolean', 
        required: true,
        voicePrompt: 'This advice is general and not a substitute for professional medical guidance. Do you accept?'
      }
    ]
  },
  {
    id: 'profile',
    title: 'User Profile: Baseline Metrics',
    description: "Let's gather some basic information about you.",
    type: 'metrics',
    questions: [
      { id: 'dob', text: 'What is your date of birth?', type: 'date', required: true },
      { id: 'gender', text: 'What gender do you identify with?', type: 'select', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Custom'], required: true },
      { id: 'height', text: 'Please share your height (e.g., 5 feet 10 inches).', type: 'text', required: true },
      { id: 'weight', text: 'Please share your weight (e.g., in lbs).', type: 'number', required: true }
    ]
  },
  {
    id: 'health',
    title: 'Health History & Medical Information',
    description: 'Tell us about your health history so we can tailor recommendations.',
    type: 'health',
    questions: [
      { id: 'conditions', text: 'Do you have any conditions or take any medications we should know about?', type: 'multiselect', options: ['Hypertension', 'High Cholesterol', 'Diabetes', 'Heart Disease', 'PCOS', 'Hypothyroidism', 'None'], required: true },
      { id: 'injuries', text: 'Do you have any current or past injuries, surgeries, or movement restrictions?', type: 'boolean', required: true },
      { id: 'injuryDetails', text: 'If yes, which activities or movements are most challenging?', type: 'text' }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle, Energy & Mental Health',
    description: "Let's talk about your daily lifestyle and energy levels.",
    type: 'lifestyle',
    questions: [
      { id: 'energy', text: 'How are your energy levels throughout the day?', type: 'select', options: ['Consistently High', 'Afternoon Slumps', 'Tired All Day', 'Up-and-Down'], required: true },
      { id: 'postMeal', text: 'Do you experience fatigue or energy crashes after meals?', type: 'select', options: ['Yes', 'No', 'Sometimes'], required: true },
      { id: 'stress', text: 'How would you rate your current stress level?', type: 'select', options: ['Low', 'Moderate', 'High', 'Overwhelming'], required: true },
      { id: 'emotionalEating', text: 'Do you experience emotional eating or stress-related cravings?', type: 'select', options: ['Yes – Frequently', 'Occasionally', 'Rarely', 'Never'], required: true }
    ]
  },
  {
    id: 'eating',
    title: 'Current Eating & Food Relationships',
    description: "Let's explore your eating habits and relationship with food.",
    type: 'nutrition',
    questions: [
      { id: 'mealTiming', text: 'How do you usually handle breakfast, lunch, and dinner?', type: 'select', options: ['Big Meal', 'Grab-and-Go', 'Cook Fresh', 'Prepped Ahead'], required: true },
      { id: 'fasting', text: 'Do you follow any fasting protocols like 16:8 or OMAD?', type: 'select', options: ['16:8', 'OMAD', 'No Preference'], required: true },
      { id: 'mealSize', text: 'Do you prefer more frequent small meals or fewer large meals?', type: 'select', options: ['3 Large Meals', '4–5 Smaller Meals', 'Flexible'], required: true },
      { id: 'tracking', text: 'Are you currently tracking your food intake or macros?', type: 'select', options: ['Yes – App', 'Yes – Paper Log', 'No Tracking', 'Other'], required: true }
    ]
  },
  {
    id: 'cooking',
    title: 'Cooking Preferences & Equipment',
    description: "Let's see how you like to cook.",
    type: 'preferences',
    questions: [
      { id: 'cookingSkill', text: 'How comfortable are you cooking, and how much time do you have?', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'], required: true },
      { id: 'equipment', text: 'Which appliances do you regularly use?', type: 'multiselect', options: ['Oven', 'Microwave', 'Air Fryer', 'Other'], required: false },
      { id: 'cookingStyle', text: 'Which cooking style do you prefer?', type: 'select', options: ['Simple & Fast', 'Balanced', 'Gourmet & Complex'], required: true }
    ]
  },
  {
    id: 'grocery',
    title: 'Grocery & Budget Preferences',
    description: 'Share your grocery habits to help us with meal planning.',
    type: 'preferences',
    questions: [
      { id: 'shoppingFrequency', text: 'How often do you shop, and what is your preferred method?', type: 'select', options: ['Weekly', 'Every Few Days', 'Daily'], required: true },
      { id: 'shoppingMethod', text: 'Do you prefer in-store, delivery, or pickup?', type: 'select', options: ['In-store', 'Delivery', 'Pickup'], required: true },
      { id: 'budget', text: 'Do you want to set a maximum weekly grocery budget?', type: 'text' },
      { id: 'sourcing', text: 'Do you prefer organic, seasonal, or local foods?', type: 'multiselect', options: ['Organic', 'Seasonal', 'Local'], required: false }
    ]
  },
  {
    id: 'cuisine',
    title: 'Food & Cuisine Preferences',
    description: "We'll personalize your meal plans based on taste and cuisine preferences.",
    type: 'preferences',
    questions: [
      { id: 'favoriteCuisines', text: 'Which cuisines do you enjoy?', type: 'multiselect', options: ['Italian', 'Mexican', 'Grilled', 'Other'], required: true },
      { id: 'avoidCuisines', text: 'Are there any cuisines you want to avoid?', type: 'text' },
      { id: 'spiceTolerance', text: 'What is your spice tolerance?', type: 'select', options: ['Mild', 'Medium', 'Hot'], required: true }
    ]
  },
  {
    id: 'hydration',
    title: 'Hydration & Sleep',
    description: "Let's capture some hydration and sleep details.",
    type: 'preferences',
    questions: [
      { id: 'hydration', text: 'How much water do you drink in a day?', type: 'text', required: true },
      { id: 'sleep', text: 'How many hours do you sleep at night, and do you have trouble sleeping?', type: 'select', options: ['Enter # Hours', 'Yes, difficulty sleeping', 'No'], required: true }
    ]
  },
  {
    id: 'tracking',
    title: 'Tracking & Macro Preferences',
    description: 'How would you like to handle macros moving forward?',
    type: 'preferences',
    questions: [
      { id: 'macroControl', text: 'Would you like daily macro adjustments or manual control?', type: 'select', options: ['Auto', 'Manual', 'Both'], required: true },
      { id: 'snackSuggestions', text: 'Would you like snack suggestions to help meet your macro targets?', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'primaryGoal', text: 'What is your primary goal?', type: 'multiselect', options: ['Losing Weight', 'Gaining Muscle', 'Improving Energy', 'Better Digestion', 'Hormonal Balance', 'General Health'], required: true },
      { id: 'resultsTimeline', text: 'How quickly do you want to see results?', type: 'select', options: ['ASAP', '1 Month', '3 Months', 'Long-Term'], required: true },
      { id: 'macroComfort', text: 'On a scale of 1 to 10, how comfortable are you with setting or adjusting macros?', type: 'number', required: true }
    ]
  },
  {
    id: 'final',
    title: 'Personalization & Final Details',
    description: "Almost done! Let's finalize your preferences.",
    type: 'preferences',
    questions: [
      { id: 'mealPrep', text: 'Do you want help with meal prep strategies?', type: 'select', options: ['Yes', 'No', 'Maybe Later'], required: true },
      { id: 'additionalInfo', text: "Any final details you'd like to share?", type: 'text' },
      { id: 'preview', text: 'Shall we show you a quick preview of your personalized plan?', type: 'select', options: ['Preview', 'Skip', 'Finish'], required: true }
    ]
  }
];

export function getOnboardingSteps(userType: UserType): OnboardingStep[] {
  if (userType === 'advanced') {
    return advancedOnboardingSteps;
  }
  return basicOnboardingSteps;
} 