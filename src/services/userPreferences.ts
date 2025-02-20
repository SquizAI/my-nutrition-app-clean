import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DashboardComponent {
  id: string;
  type: 'progress' | 'calories' | 'meals' | 'inventory' | 'tasks' | 'macros' | 'tdee' | 'logs' | 'mealplan';
  gridArea: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
}

export interface UserPreferences {
  name?: string;
  userType?: 'basic' | 'advanced';
  dashboardLayout: DashboardComponent[];
  automationLevel: 'minimal' | 'balanced' | 'full';
  dietaryRestrictions: string[];
  favoriteIngredients: string[];
  dislikedIngredients: string[];
  cookingStyle: 'simple' | 'gourmet' | 'balanced';
  groceryPreference: 'budget' | 'organic' | 'local' | 'no-preference';
  mealPrepHelp: boolean;
  notifications: {
    mealReminders: boolean;
    workoutReminders: boolean;
    groceryReminders: boolean;
    geofencing: boolean;
    quietHours: {
      start: string;
      end: string;
    };
  };
  quickLogPreferences: {
    favoriteItems: string[];
    recentItems: string[];
    customShortcuts: {
      name: string;
      action: string;
    }[];
  };
  profile?: {
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-say';
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'active' | 'veryActive';
    healthConditions?: string[];
    allergies?: string[];
    goals?: {
      type: 'lose' | 'maintain' | 'gain';
      target?: number;
      timeframe?: number;
    };
  };
}

export interface UserPreferencesState {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  dietaryPreferences: string[];
  allergies: string[];
  dashboardLayout: any[]; // You might want to type this properly
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  setNotifications: (enabled: boolean) => void;
  setDietaryPreferences: (preferences: string[]) => void;
  setAllergies: (allergies: string[]) => void;
  updateDashboardLayout: (layout: any[]) => void;
}

const defaultPreferences: UserPreferences = {
  dashboardLayout: [],
  automationLevel: 'balanced',
  dietaryRestrictions: [],
  favoriteIngredients: [],
  dislikedIngredients: [],
  cookingStyle: 'balanced',
  groceryPreference: 'no-preference',
  mealPrepHelp: false,
  notifications: {
    mealReminders: true,
    workoutReminders: true,
    groceryReminders: true,
    geofencing: false,
    quietHours: {
      start: '22:00',
      end: '07:00',
    },
  },
  quickLogPreferences: {
    favoriteItems: [],
    recentItems: [],
    customShortcuts: [],
  },
};

export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      notifications: true,
      dietaryPreferences: [],
      allergies: [],
      dashboardLayout: [],
      
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setNotifications: (notifications) => set({ notifications }),
      setDietaryPreferences: (preferences) => set({ dietaryPreferences: preferences }),
      setAllergies: (allergies) => set({ allergies }),
      updateDashboardLayout: (layout) => set({ dashboardLayout: layout })
    }),
    {
      name: 'user-preferences'
    }
  )
); 