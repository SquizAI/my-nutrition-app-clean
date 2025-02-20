import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useUserPreferences } from '../../services/userPreferences';
import { useMacroCalculator, UserStats } from '../../services/macroCalculator';
import { useToast } from '../shared/Toast';
import AdvancedOnboardingStep from './AdvancedOnboardingStep';
import { advancedOnboardingConfig } from '../../config/advancedOnboardingConfig';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { OnboardingStep } from '../../types';

const OnboardingContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.gradient};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const OnboardingContent = styled(motion.div)`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const OnboardingHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const OnboardingLogo = styled(motion.div)`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  overflow: hidden;
`;

const Progress = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => `${$progress}%`};
  background: ${({ theme }) => theme.gradients.primary};
  transition: width 0.3s ease;
`;

const AdvancedOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { updatePreferences } = useUserPreferences();
  const { setUserStats } = useMacroCalculator();
  const { addToast } = useToast();

  // Get current step data
  const currentStepData = advancedOnboardingConfig[currentStep];

  // Load saved progress
  useEffect(() => {
    const savedProgress = localStorage.getItem('advancedOnboardingProgress');
    if (savedProgress) {
      try {
        const { step, responses: savedResponses } = JSON.parse(savedProgress);
        setCurrentStep(step);
        setResponses(savedResponses);
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, []);

  const saveProgress = () => {
    try {
      localStorage.setItem('advancedOnboardingProgress', JSON.stringify({
        step: currentStep,
        responses
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleNext = (stepResponses: Record<string, any>) => {
    const newResponses = {
      ...responses,
      [advancedOnboardingConfig[currentStep].id]: stepResponses
    };
    setResponses(newResponses);
    
    if (currentStep < advancedOnboardingConfig.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finalizeOnboarding(newResponses);
    }

    saveProgress();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      saveProgress();
    }
  };

  const handleSkip = () => {
    if (currentStep < advancedOnboardingConfig.length - 1) {
      setCurrentStep(prev => prev + 1);
      saveProgress();
    }
  };

  const finalizeOnboarding = async (finalResponses: Record<string, any>) => {
    setIsProcessing(true);
    try {
      // Process metrics
      const userStats: UserStats = {
        age: calculateAge(new Date(finalResponses.metrics?.dob)),
        gender: (finalResponses.metrics?.gender?.toLowerCase() || 'male') as 'male' | 'female',
        weight: parseFloat(finalResponses.metrics?.weight),
        height: parseFloat(finalResponses.metrics?.height),
        activityLevel: determineActivityLevel(finalResponses),
        goal: determineGoal(finalResponses),
        unitSystem: 'imperial' as const,
        stepsPerDay: finalResponses.fitness?.stepTracking ? parseInt(finalResponses.fitness.stepCount) : 10000,
        workoutsPerWeek: determineWorkoutsPerWeek(finalResponses),
      };

      // Process preferences
      const preferences = {
        name: finalResponses.name?.name,
        dietaryRestrictions: extractDietaryRestrictions(finalResponses),
        cookingStyle: finalResponses.cooking?.cookingStyle?.toLowerCase(),
        groceryPreference: determineGroceryPreference(finalResponses),
        profile: {
          healthConditions: finalResponses.health?.conditions || [],
          allergies: [],
          goals: {
            type: determineGoal(finalResponses),
          },
        },
      };

      // Update user stats and preferences
      setUserStats(userStats);
      updatePreferences(preferences);

      // Clear saved progress
      localStorage.removeItem('advancedOnboardingProgress');

      // Show success message
      addToast({
        type: 'success',
        message: 'Profile created successfully! Redirecting to dashboard...',
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Error finalizing onboarding:', error);
      addToast({
        type: 'error',
        message: 'There was an error saving your profile. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const determineActivityLevel = (responses: Record<string, any>): 'sedentary' | 'moderatelyActive' | 'veryActive' => {
    const energyLevels = responses.lifestyle?.energyLevels;
    const exerciseFrequency = responses.fitness?.exerciseFrequency;
    
    if (energyLevels === 'Consistently High' || exerciseFrequency === '5+ Days') {
      return 'veryActive';
    }
    if (energyLevels === 'Tired All Day' || exerciseFrequency === '0 Days') {
      return 'sedentary';
    }
    return 'moderatelyActive';
  };

  const determineGoal = (responses: Record<string, any>): 'lose' | 'maintain' | 'gain' => {
    const primaryGoal = responses.tracking?.primaryGoal;
    if (primaryGoal?.includes('Losing Weight')) return 'lose';
    if (primaryGoal?.includes('Gaining Muscle')) return 'gain';
    return 'maintain';
  };

  const determineWorkoutsPerWeek = (responses: Record<string, any>): number => {
    const frequency = responses.fitness?.exerciseFrequency;
    switch (frequency) {
      case '0 Days': return 0;
      case '1–2 Days': return 2;
      case '3–4 Days': return 4;
      case '5+ Days': return 5;
      default: return 3;
    }
  };

  const extractDietaryRestrictions = (responses: Record<string, any>): string[] => {
    const restrictions: string[] = [];
    if (responses.health?.conditions) {
      restrictions.push(...responses.health.conditions);
    }
    return restrictions;
  };

  const determineGroceryPreference = (responses: Record<string, any>): 'budget' | 'organic' | 'local' | 'no-preference' => {
    const sourcing = responses.grocery?.sourcing;
    if (sourcing?.includes('Organic')) return 'organic';
    if (sourcing?.includes('Local')) return 'local';
    if (responses.grocery?.savingPreference === 'Yes') return 'budget';
    return 'no-preference';
  };

  const ensureVoicePrompts = (step: OnboardingStep) => {
    return {
      ...step,
      voicePrompt: step.voicePrompt || step.description,
      questions: step.questions.map(q => ({
        ...q,
        voicePrompt: q.voicePrompt || q.text
      }))
    };
  };

  if (isProcessing) {
    return (
      <OnboardingContainer>
        <LoadingSpinner 
          size="lg" 
          label="Creating your personalized profile..."
        />
      </OnboardingContainer>
    );
  }

  if (!currentStepData) {
    return (
      <OnboardingContainer>
        <OnboardingContent>
          <OnboardingHeader>
            <OnboardingLogo>🤖</OnboardingLogo>
          </OnboardingHeader>
          <div>Error: Could not load onboarding step.</div>
        </OnboardingContent>
      </OnboardingContainer>
    );
  }

  return (
    <OnboardingContainer>
      <OnboardingContent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <OnboardingHeader>
          <OnboardingLogo
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            🤖
          </OnboardingLogo>
        </OnboardingHeader>

        <ProgressBar>
          <Progress 
            $progress={(currentStep / (advancedOnboardingConfig.length - 1)) * 100} 
          />
        </ProgressBar>

        <AdvancedOnboardingStep
          step={ensureVoicePrompts(currentStepData)}
          currentStep={currentStep}
          totalSteps={advancedOnboardingConfig.length}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={currentStep < advancedOnboardingConfig.length - 1 ? handleSkip : undefined}
        />
      </OnboardingContent>
    </OnboardingContainer>
  );
};

export default AdvancedOnboarding; 