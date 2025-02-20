import { create } from 'zustand';
import { logInfo, logError } from './loggingService';

export interface UserStats {
  age: number;
  gender: 'male' | 'female';
  weight: number; // in lbs
  height: number; // in inches
  bodyFatPercentage?: number;
  activityLevel: 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'active' | 'veryActive';
  goal: 'lose' | 'maintain' | 'gain';
  unitSystem: 'metric' | 'imperial';
  stepsPerDay: number;
  workoutsPerWeek: number;
}

interface MacroBreakdown {
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MacroCalculatorStore {
  userStats: UserStats | null;
  macros: MacroBreakdown | null;
  setUserStats: (stats: UserStats) => void;
  calculateMacros: () => void;
  convertToMetric: (stats: Partial<UserStats>) => Partial<UserStats>;
  convertToImperial: (stats: Partial<UserStats>) => Partial<UserStats>;
}

// Activity level multipliers based on gender and activity level
const ACTIVITY_MULTIPLIERS = {
  male: {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    active: 1.725,
    veryActive: 1.9
  },
  female: {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    active: 1.725,
    veryActive: 1.9
  }
};

// Goal adjustments
const GOAL_ADJUSTMENTS = {
  lose: 0.8, // 20% deficit
  maintain: 1.0,
  gain: 1.15 // 15% surplus
};

export const useMacroCalculator = create<MacroCalculatorStore>((set, get) => ({
  userStats: null,
  macros: null,

  setUserStats: (stats: UserStats) => {
    logInfo('macro', 'Setting user stats', stats);
    
    // Convert to metric if needed for calculations
    const metricStats = stats.unitSystem === 'imperial' 
      ? get().convertToMetric(stats)
      : stats;
    
    set({ userStats: metricStats as UserStats });
    get().calculateMacros();
  },

  calculateMacros: () => {
    const stats = get().userStats;
    if (!stats) {
      logError('macro', 'Cannot calculate macros: No user stats provided');
      return;
    }

    try {
      // Calculate BMR using the Mifflin-St Jeor Equation
      let bmr;
      if (stats.gender === 'male') {
        bmr = (10 * stats.weight) + (6.25 * stats.height) - (5 * stats.age) + 5;
      } else {
        bmr = (10 * stats.weight) + (6.25 * stats.height) - (5 * stats.age) - 161;
      }

      logInfo('macro', 'Calculated BMR using Mifflin-St Jeor Equation', {
        bmr,
        inputs: {
          weight: stats.weight,
          height: stats.height,
          age: stats.age,
          gender: stats.gender
        }
      });

      // Calculate TDEE based on activity level and gender
      const tdee = bmr * ACTIVITY_MULTIPLIERS[stats.gender][stats.activityLevel];
      
      logInfo('macro', 'Calculated TDEE', {
        tdee,
        bmr,
        activityMultiplier: ACTIVITY_MULTIPLIERS[stats.gender][stats.activityLevel],
        activityLevel: stats.activityLevel
      });

      // Adjust calories based on goal
      const targetCalories = Math.round(tdee * GOAL_ADJUSTMENTS[stats.goal]);

      logInfo('macro', 'Adjusted calories based on goal', {
        tdee,
        goalAdjustment: GOAL_ADJUSTMENTS[stats.goal],
        targetCalories,
        goal: stats.goal
      });

      // Calculate protein based on body fat percentage and goal
      let proteinMultiplier = 1; // default 1g per lb
      if (stats.bodyFatPercentage) {
        if (stats.goal === 'lose') {
          if (stats.bodyFatPercentage <= 20) proteinMultiplier = 1.1;
          else if (stats.bodyFatPercentage <= 30) proteinMultiplier = 1.0;
          else if (stats.bodyFatPercentage <= 35) proteinMultiplier = 0.9;
          else if (stats.bodyFatPercentage <= 40) proteinMultiplier = 0.8;
          else proteinMultiplier = 0.6;
        } else if (stats.goal === 'gain') {
          proteinMultiplier = 1.1;
        }
      }

      // Calculate macros
      const protein = Math.round(stats.weight * proteinMultiplier);
      
      logInfo('macro', 'Calculated protein target', {
        weight: stats.weight,
        proteinMultiplier,
        protein,
        bodyFatPercentage: stats.bodyFatPercentage,
        goal: stats.goal
      });

      // Calculate fats based on goal and body fat percentage
      let fatMultiplier = stats.goal === 'lose' ? 0.27 : 0.27;
      if (stats.bodyFatPercentage && stats.bodyFatPercentage >= 40) {
        fatMultiplier = 0.22;
      }
      
      const fats = Math.round((targetCalories * fatMultiplier) / 9);
      
      logInfo('macro', 'Calculated fat target', {
        targetCalories,
        fatMultiplier,
        fats,
        bodyFatPercentage: stats.bodyFatPercentage
      });

      // Calculate remaining calories for carbs
      const proteinCalories = protein * 4;
      const fatCalories = fats * 9;
      const carbCalories = targetCalories - proteinCalories - fatCalories;
      const carbs = Math.round(carbCalories / 4);

      logInfo('macro', 'Calculated carb target', {
        targetCalories,
        proteinCalories,
        fatCalories,
        carbCalories,
        carbs
      });

      const macros = {
        targetCalories,
        protein,
        carbs,
        fats
      };

      logInfo('macro', 'Final macro calculations', macros);

      set({ macros });
    } catch (error) {
      logError('macro', 'Error calculating macros', error);
      throw error;
    }
  },

  convertToMetric: (stats: Partial<UserStats>) => {
    if (stats.unitSystem !== 'imperial') return stats;
    
    const converted: Partial<UserStats> = {
      ...stats,
      weight: stats.weight ? Math.round(stats.weight / 2.2) : undefined,
      height: stats.height ? Math.round(stats.height * 2.54) : undefined,
      unitSystem: 'metric' as const
    };

    logInfo('macro', 'Converted stats to metric', {
      original: stats,
      converted
    });

    return converted;
  },

  convertToImperial: (stats: Partial<UserStats>) => {
    if (stats.unitSystem !== 'metric') return stats;
    
    const converted: Partial<UserStats> = {
      ...stats,
      weight: stats.weight ? Math.round(stats.weight * 2.2) : undefined,
      height: stats.height ? Math.round(stats.height / 2.54) : undefined,
      unitSystem: 'imperial' as const
    };

    logInfo('macro', 'Converted stats to imperial', {
      original: stats,
      converted
    });

    return converted;
  }
}));