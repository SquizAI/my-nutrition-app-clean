import { IconType } from 'react-icons';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  icon: IconType;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  validation?: (value: string) => true | string;
  options?: Array<{ value: string; label: string }>;
  max?: string | number;
}

export interface BaseQuestion {
  id: string;
  text: string;
  description?: string;
  voicePrompt: string;
  infoText: string;
}

export interface FormQuestion extends BaseQuestion {
  type: 'form';
  fields: FormField[];
}

export interface SelectQuestion extends BaseQuestion {
  type: 'select' | 'multiSelect';
  options: Array<{
    value: string;
    label: string;
    description: string;
    icon: IconType;
    color?: string;
    onClick?: () => void;
  }>;
  multiSelect?: boolean;
  requiresDetails?: boolean | string;
}

export type Question = FormQuestion | SelectQuestion;

export interface BaseOnboardingSectionProps {
  questions: Question[];
  currentQuestionIndex: number;
  onComplete: (data: Record<string, any>) => void;
  customComponents?: {
    beforeQuestion?: React.ReactNode;
    afterQuestion?: React.ReactNode;
  };
}

export interface InteractionEvent {
  type: 'form_input' | 'selection' | 'voice' | 'ai' | 'question' | 'retry';
  data?: Record<string, any>;
  timestamp?: number;
}

export interface Option {
  value: string;
  label: string;
  description: string;
  icon: IconType;
  color?: string;
  onClick?: () => void;
} 