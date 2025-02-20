import { useCallback } from 'react';
import { useAIAgents } from '../services/aiAgents';
import { useLoadingState } from './useLoadingState';
import { useToast } from '../components/shared/Toast';

interface BehaviorAnalysisResult {
  behavior: {
    mealTimes: {
      breakfast: string[];
      lunch: string[];
      dinner: string[];
      snacks: string[];
    };
    frequentLocations: {
      groceryStores: string[];
      restaurants: string[];
      gyms: string[];
    };
    dietaryPatterns: {
      preferences: string[];
      restrictions: string[];
      commonIngredients: string[];
    };
    activityPatterns: {
      workoutTimes: string[];
      activeHours: string[];
      restDays: string[];
    };
  };
  confidence: number;
}

interface Recommendation {
  id: string;
  type: 'meal' | 'workout' | 'grocery' | 'habit';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  actionable: boolean;
  action?: {
    type: string;
    payload: any;
  };
}

export const useAIFeatures = () => {
  const { recommendationAgent, learningAgent } = useAIAgents();
  const { addToast } = useToast();
  
  const {
    isLoading: isGeneratingRecommendations,
    error: recommendationError,
    execute: executeRecommendation,
  } = useLoadingState({
    showErrorToast: true,
    errorMessage: 'Failed to generate recommendations',
  });

  const {
    isLoading: isAnalyzingBehavior,
    error: behaviorError,
    execute: executeBehaviorAnalysis,
  } = useLoadingState({
    showErrorToast: true,
    errorMessage: 'Failed to analyze behavior',
  });

  const generateRecommendations = useCallback(async () => {
    const result = await executeRecommendation<Recommendation[]>(
      new Promise((resolve) => {
        recommendationAgent.generateRecommendations();
        resolve(recommendationAgent.currentRecommendations);
      })
    );

    if (result && result.length > 0) {
      addToast({
        type: 'info',
        message: 'New recommendations available!',
        duration: 5000,
      });
    }

    return result;
  }, [executeRecommendation, recommendationAgent, addToast]);

  const analyzeBehavior = useCallback(async () => {
    const result = await executeBehaviorAnalysis<BehaviorAnalysisResult>(
      new Promise((resolve) => {
        learningAgent.analyzeBehavior();
        resolve({
          behavior: learningAgent.behavior,
          confidence: learningAgent.confidence,
        });
      })
    );

    if (result && result.confidence > 0.8) {
      addToast({
        type: 'success',
        message: 'Behavior analysis complete with high confidence',
        duration: 5000,
      });
    }

    return result;
  }, [executeBehaviorAnalysis, learningAgent, addToast]);

  const acceptRecommendation = useCallback(
    (id: string) => {
      recommendationAgent.acceptRecommendation(id);
      addToast({
        type: 'success',
        message: 'Recommendation accepted',
        duration: 3000,
      });
    },
    [recommendationAgent, addToast]
  );

  const rejectRecommendation = useCallback(
    (id: string) => {
      recommendationAgent.rejectRecommendation(id);
      addToast({
        type: 'info',
        message: 'Recommendation rejected',
        duration: 3000,
      });
    },
    [recommendationAgent, addToast]
  );

  return {
    // Recommendations
    recommendations: recommendationAgent.currentRecommendations,
    recommendationHistory: recommendationAgent.history,
    isGeneratingRecommendations,
    recommendationError,
    generateRecommendations,
    acceptRecommendation,
    rejectRecommendation,

    // Behavior Learning
    behavior: learningAgent.behavior,
    confidence: learningAgent.confidence,
    isAnalyzingBehavior,
    behaviorError,
    analyzeBehavior,
    updateBehavior: learningAgent.updateBehavior,
  };
}; 