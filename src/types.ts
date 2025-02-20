export type QuestionType = 'text' | 'select' | 'multiselect' | 'number' | 'boolean' | 'date' | 'voice' | 'custom';
export type StepType = 
  | 'intro'
  | 'legal' 
  | 'metrics' 
  | 'health' 
  | 'lifestyle' 
  | 'nutrition' 
  | 'preferences' 
  | 'fitness' 
  | 'cooking' 
  | 'grocery' 
  | 'tracking' 
  | 'personalization';

export interface ConditionalQuestion {
  condition: string;
  question: string;
  type: string;
  options?: string[];
}

export interface OnboardingQuestion {
  id: string;
  text: string;
  voicePrompt?: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  additionalInfo?: string;
  validation?: (value: any) => boolean;
  conditionalQuestions?: ConditionalQuestion[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  voicePrompt?: string;
  type: StepType;
  questions: OnboardingQuestion[];
} 