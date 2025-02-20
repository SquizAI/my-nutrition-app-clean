import { create } from 'zustand';
import { useUserPreferences } from './userPreferences';

interface UserBehavior {
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
}

export interface Recommendation {
  id: string;
  type: 'meal' | 'workout' | 'habit' | 'grocery';
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

interface AIAgentStore {
  learningAgent: {
    behavior: UserBehavior;
    confidence: number;
    lastUpdate: string;
    updateBehavior: (newData: Partial<UserBehavior>) => void;
    analyzeBehavior: () => void;
  };
  recommendationAgent: {
    currentRecommendations: Recommendation[];
    history: Recommendation[];
    generateRecommendations: () => void;
    acceptRecommendation: (id: string) => void;
    rejectRecommendation: (id: string) => void;
  };
}

const defaultBehavior: UserBehavior = {
  mealTimes: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  },
  frequentLocations: {
    groceryStores: [],
    restaurants: [],
    gyms: [],
  },
  dietaryPatterns: {
    preferences: [],
    restrictions: [],
    commonIngredients: [],
  },
  activityPatterns: {
    workoutTimes: [],
    activeHours: [],
    restDays: [],
  },
};

export const useAIAgents = create<AIAgentStore>()((set, get) => ({
  learningAgent: {
    behavior: defaultBehavior,
    confidence: 0,
    lastUpdate: new Date().toISOString(),
    
    updateBehavior: (newData) => {
      set((state) => ({
        learningAgent: {
          ...state.learningAgent,
          behavior: {
            ...state.learningAgent.behavior,
            ...newData,
          },
          lastUpdate: new Date().toISOString(),
        },
      }));
    },
    
    analyzeBehavior: () => {
      const { behavior } = get().learningAgent;
      // Implement behavior analysis logic here
      // Update confidence based on data quantity and consistency
    },
  },
  
  recommendationAgent: {
    currentRecommendations: [],
    history: [],
    
    generateRecommendations: () => {
      const { behavior, confidence } = get().learningAgent;
      const userPrefs = useUserPreferences.getState();
      
      // Example recommendation generation logic
      const recommendations: Recommendation[] = [];
      
      // Analyze meal times and suggest adjustments
      if (behavior.mealTimes.dinner.length > 0) {
        const lateDinners = behavior.mealTimes.dinner.filter(
          time => new Date(time).getHours() >= 21
        );
        
        if (lateDinners.length > 3) {
          recommendations.push({
            id: Date.now().toString(),
            type: 'habit',
            title: 'Consider Earlier Dinners',
            description: 'You often eat dinner late. Earlier dinners can improve sleep and digestion.',
            reasoning: 'Based on your dinner time patterns over the past week.',
            confidence: 0.85,
            actionable: true,
            action: {
              type: 'SET_REMINDER',
              payload: {
                time: '19:00',
                message: 'Time to start preparing dinner!',
              },
            },
          });
        }
      }
      
      set((state) => ({
        recommendationAgent: {
          ...state.recommendationAgent,
          currentRecommendations: recommendations,
        },
      }));
    },
    
    acceptRecommendation: (id: string) => {
      set((state) => {
        const recommendation = state.recommendationAgent.currentRecommendations.find(
          (r) => r.id === id
        );
        
        if (!recommendation) return state;
        
        return {
          recommendationAgent: {
            ...state.recommendationAgent,
            currentRecommendations: state.recommendationAgent.currentRecommendations.filter(
              (r) => r.id !== id
            ),
            history: [...state.recommendationAgent.history, { ...recommendation, accepted: true }],
          },
        };
      });
    },
    
    rejectRecommendation: (id: string) => {
      set((state) => {
        const recommendation = state.recommendationAgent.currentRecommendations.find(
          (r) => r.id === id
        );
        
        if (!recommendation) return state;
        
        return {
          recommendationAgent: {
            ...state.recommendationAgent,
            currentRecommendations: state.recommendationAgent.currentRecommendations.filter(
              (r) => r.id !== id
            ),
            history: [...state.recommendationAgent.history, { ...recommendation, accepted: false }],
          },
        };
      });
    },
  },
})); 