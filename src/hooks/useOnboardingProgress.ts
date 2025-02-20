import { useState, useEffect, useCallback } from 'react';
import { progressConfig } from '../config/onboardingConfig';
import type { OnboardingSection } from '../config/onboardingConfig';

interface OnboardingProgress {
  currentSectionIndex: number;
  currentQuestionIndex: number;
  responses: Record<string, any>;
  completedSections: string[];
  lastUpdated: number;
}

const initialProgress: OnboardingProgress = {
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  responses: {},
  completedSections: [],
  lastUpdated: Date.now(),
};

export const useOnboardingProgress = (sections: OnboardingSection[]) => {
  const [progress, setProgress] = useState<OnboardingProgress>(() => {
    try {
      const saved = localStorage.getItem(progressConfig.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate the version
        if (parsed.version === progressConfig.version) {
          return parsed.data;
        }
      }
      return initialProgress;
    } catch {
      return initialProgress;
    }
  });

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: OnboardingProgress) => {
    try {
      localStorage.setItem(progressConfig.storageKey, JSON.stringify({
        version: progressConfig.version,
        data: newProgress,
      }));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, []);

  // Auto-save progress
  useEffect(() => {
    const timer = setInterval(() => {
      saveProgress(progress);
    }, progressConfig.autoSaveInterval);

    return () => clearInterval(timer);
  }, [progress, saveProgress]);

  // Navigate to next question
  const nextQuestion = useCallback(() => {
    setProgress(prev => {
      const currentSection = sections[prev.currentSectionIndex];
      if (!currentSection) return prev;

      const questions = currentSection.questions;
      if (prev.currentQuestionIndex < questions.length - 1) {
        // Move to next question in current section
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          lastUpdated: Date.now(),
        };
      } else if (prev.currentSectionIndex < sections.length - 1) {
        // Move to next section
        const completedSectionId = currentSection.id;
        return {
          ...prev,
          currentSectionIndex: prev.currentSectionIndex + 1,
          currentQuestionIndex: 0,
          completedSections: [...prev.completedSections, completedSectionId],
          lastUpdated: Date.now(),
        };
      }
      return prev;
    });
  }, [sections]);

  // Navigate to previous question
  const previousQuestion = useCallback(() => {
    setProgress(prev => {
      if (prev.currentQuestionIndex > 0) {
        // Move to previous question in current section
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex - 1,
          lastUpdated: Date.now(),
        };
      } else if (prev.currentSectionIndex > 0) {
        // Move to last question of previous section
        const previousSection = sections[prev.currentSectionIndex - 1];
        return {
          ...prev,
          currentSectionIndex: prev.currentSectionIndex - 1,
          currentQuestionIndex: previousSection.questions.length - 1,
          lastUpdated: Date.now(),
        };
      }
      return prev;
    });
  }, [sections]);

  // Save response for current question
  const saveResponse = useCallback((response: any) => {
    setProgress(prev => {
      const currentSection = sections[prev.currentSectionIndex];
      const currentQuestion = currentSection?.questions[prev.currentQuestionIndex];
      if (!currentSection || !currentQuestion) return prev;

      const newResponses = {
        ...prev.responses,
        [currentSection.id]: {
          ...prev.responses[currentSection.id],
          [currentQuestion.id]: response,
        },
      };

      return {
        ...prev,
        responses: newResponses,
        lastUpdated: Date.now(),
      };
    });
  }, [sections]);

  // Reset progress
  const resetProgress = useCallback(() => {
    setProgress(initialProgress);
    localStorage.removeItem(progressConfig.storageKey);
  }, []);

  // Calculate completion percentage
  const calculateProgress = useCallback(() => {
    const totalQuestions = sections.reduce((acc, section) => 
      acc + section.questions.length, 0);
    
    const answeredQuestions = Object.values(progress.responses)
      .reduce((acc, sectionResponses) => 
        acc + Object.keys(sectionResponses || {}).length, 0);

    return (answeredQuestions / totalQuestions) * 100;
  }, [sections, progress.responses]);

  return {
    progress,
    nextQuestion,
    previousQuestion,
    saveResponse,
    resetProgress,
    calculateProgress,
    currentSection: sections[progress.currentSectionIndex],
    currentQuestion: sections[progress.currentSectionIndex]?.
      questions[progress.currentQuestionIndex],
  };
}; 