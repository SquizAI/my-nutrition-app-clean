import { z } from 'zod';

// Zod schemas for validation
export const LegalResponseSchema = z.object({
  name: z.string().min(2),
  termsAccepted: z.boolean(),
  privacyAccepted: z.boolean(),
  medicalDisclaimerAccepted: z.boolean(),
});

export const BaselineMetricsSchema = z.object({
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer_not_to_say', 'custom']),
  genderDetails: z.string().optional(),
  height: z.number(),
  heightUnit: z.enum(['in', 'cm']),
  weight: z.number(),
  weightUnit: z.enum(['lbs', 'kg']),
});

// Types based on Zod schemas
export type LegalResponse = z.infer<typeof LegalResponseSchema>;
export type BaselineMetrics = z.infer<typeof BaselineMetricsSchema>;

// Section interface
export interface OnboardingSection {
  id: string;
  title: string;
  description: string;
  voicePrompt: string;
  required: boolean;
  validationSchema: z.ZodSchema<any>;
  questions: OnboardingQuestion[];
}

export interface OnboardingQuestion {
  id: string;
  text: string;
  voicePrompt: string;
  type: 'text' | 'boolean' | 'select' | 'multi-select' | 'number' | 'date';
  options?: string[];
  required: boolean;
  validation?: z.ZodSchema<any>;
  dependsOn?: {
    questionId: string;
    value: any;
  };
}

// Onboarding sections configuration
export const onboardingSections: OnboardingSection[] = [
  {
    id: 'legal',
    title: 'Terms & Legal Agreements',
    description: 'Before we get started, please review and accept our terms.',
    voicePrompt: 'Welcome to your nutrition consultation. First, I need to go through some legal requirements with you. Are you ready to begin?',
    required: true,
    validationSchema: LegalResponseSchema,
    questions: [
      {
        id: 'name',
        text: 'What is your preferred name?',
        voicePrompt: 'Please tell me your preferred name.',
        type: 'text',
        required: true,
        validation: z.string().min(2),
      },
      {
        id: 'termsAccepted',
        text: 'Do you accept our terms and conditions?',
        voicePrompt: 'We provide AI-generated nutritional guidance; this does not replace medical treatment. Do you accept these terms?',
        type: 'boolean',
        required: true,
      },
      {
        id: 'privacyAccepted',
        text: 'Do you accept our privacy policy?',
        voicePrompt: 'Would you like me to explain how we protect and store your data, or would you like to accept the privacy policy now?',
        type: 'boolean',
        required: true,
      },
      {
        id: 'medicalDisclaimerAccepted',
        text: 'Do you accept our medical disclaimer?',
        voicePrompt: 'This advice is general and not a substitute for professional medical guidance. Do you accept this disclaimer?',
        type: 'boolean',
        required: true,
      },
    ],
  },
  // Additional sections will be added here
];

// Voice synthesis configuration
export const voiceConfig = {
  defaultVoice: 'en-US-Standard-C', // Professional female voice
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

// Progress persistence configuration
export const progressConfig = {
  autoSaveInterval: 1000, // Save progress every second
  storageKey: 'onboarding_progress',
  version: '1.0.0',
};

// Navigation configuration
export const navigationConfig = {
  allowSkip: false, // Don't allow skipping legal section
  allowBack: true,
  requireConfirmation: true,
  confirmationPrompt: 'Are you sure you want to go back? Your progress in this section will be saved.',
}; 