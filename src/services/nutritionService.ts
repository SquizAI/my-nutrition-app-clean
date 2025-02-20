import { create } from 'zustand';
import { useMacroCalculator } from './macroCalculator';
import { useMealGenerator } from './mealGenerator';
import { logCalculation, logMeal, logInfo, logError } from './loggingService';

interface NutritionState {
  isGeneratingPlan: boolean;
  error: string | null;
  generateMealPlanFromMacros: () => Promise<void>;
  adjustMealPlanToMacros: () => Promise<void>;
  getMacroBreakdown: () => MacroBreakdown | null;
}

interface MacroBreakdown {
  daily: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snacks: number;
  };
}

// Fix logging category types
const logInfo = (message: string, data?: any) => {
  logInfo('meal', message, data);
};

export const useNutrition = create<NutritionState>((set, get) => ({
  isGeneratingPlan: false,
  error: null,

  generateMealPlanFromMacros: async () => {
    set({ isGeneratingPlan: true, error: null });
    
    try {
      const macros = useMacroCalculator.getState().macros;
      if (!macros) {
        throw new Error('Please calculate your macros first');
      }

      logInfo('Starting meal plan generation from macros', macros);

      // Calculate meal breakdowns
      const breakdown = {
        breakfast: 0.25, // 25% of daily calories
        lunch: 0.35, // 35% of daily calories
        dinner: 0.30, // 30% of daily calories
        snacks: 0.10 // 10% of daily calories
      };

      const mealMacros = {
        breakfast: {
          calories: Math.round(macros.targetCalories * breakdown.breakfast),
          protein: Math.round(macros.protein * breakdown.breakfast),
          carbs: Math.round(macros.carbs * breakdown.breakfast),
          fats: Math.round(macros.fats * breakdown.breakfast)
        },
        lunch: {
          calories: Math.round(macros.targetCalories * breakdown.lunch),
          protein: Math.round(macros.protein * breakdown.lunch),
          carbs: Math.round(macros.carbs * breakdown.lunch),
          fats: Math.round(macros.fats * breakdown.lunch)
        },
        dinner: {
          calories: Math.round(macros.targetCalories * breakdown.dinner),
          protein: Math.round(macros.protein * breakdown.dinner),
          carbs: Math.round(macros.carbs * breakdown.dinner),
          fats: Math.round(macros.fats * breakdown.dinner)
        },
        snacks: {
          calories: Math.round(macros.targetCalories * breakdown.snacks),
          protein: Math.round(macros.protein * breakdown.snacks),
          carbs: Math.round(macros.carbs * breakdown.snacks),
          fats: Math.round(macros.fats * breakdown.snacks)
        }
      };

      logCalculation('Meal Breakdown', 'Calculated meal-specific macro targets', mealMacros);

      // Generate the meal plan
      await useMealGenerator.getState().generateMealPlan();

      logMeal('Meal Plan Generated', 'Successfully generated meal plan based on macro targets');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate meal plan';
      set({ error: errorMessage });
      logError('meal', errorMessage, error);
    } finally {
      set({ isGeneratingPlan: false });
    }
  },

  adjustMealPlanToMacros: async () => {
    set({ isGeneratingPlan: true, error: null });
    
    try {
      const macros = useMacroCalculator.getState().macros;
      const currentPlan = useMealGenerator.getState().currentPlan;

      if (!macros) {
        throw new Error('Please calculate your macros first');
      }

      if (!currentPlan) {
        throw new Error('No meal plan to adjust');
      }

      logInfo('Starting meal plan adjustment to match macros', {
        targetMacros: macros,
        currentPlan
      });

      // Calculate the differences
      const differences = {
        calories: macros.targetCalories - currentPlan.totalNutrition.calories,
        protein: macros.protein - currentPlan.totalNutrition.protein,
        carbs: macros.carbs - currentPlan.totalNutrition.carbs,
        fats: macros.fats - currentPlan.totalNutrition.fats
      };

      logCalculation('Macro Differences', 'Calculated differences between target and current macros', differences);

      // If differences are significant, regenerate the plan
      const threshold = 0.1; // 10% difference threshold
      const needsRegeneration = Object.values(differences).some(diff => 
        Math.abs(diff) / macros.targetCalories > threshold
      );

      if (needsRegeneration) {
        logInfo('Starting meal plan adjustment to match macros', 'Differences exceed threshold, regenerating meal plan');
        await useMealGenerator.getState().generateMealPlan();
      } else {
        logInfo('Starting meal plan adjustment to match macros', 'Differences within acceptable range, making minor adjustments');
        // Make minor adjustments to portion sizes
        currentPlan.meals.forEach((meal, index) => {
          const adjustmentFactor = macros.targetCalories / currentPlan.totalNutrition.calories;
          useMealGenerator.getState().adjustMeal(index, {
            calories: Math.round(meal.calories * adjustmentFactor),
            protein: Math.round(meal.protein * adjustmentFactor),
            carbs: Math.round(meal.carbs * adjustmentFactor),
            fats: Math.round(meal.fats * adjustmentFactor)
          });
        });
      }

      logMeal('Meal Plan Adjusted', 'Successfully adjusted meal plan to match macro targets');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to adjust meal plan';
      set({ error: errorMessage });
      logError('meal', errorMessage, error);
    } finally {
      set({ isGeneratingPlan: false });
    }
  },

  getMacroBreakdown: () => {
    const macros = useMacroCalculator.getState().macros;
    if (!macros) return null;

    const breakdown: MacroBreakdown = {
      daily: {
        calories: macros.targetCalories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats
      },
      meals: {
        breakfast: Math.round(macros.targetCalories * 0.25),
        lunch: Math.round(macros.targetCalories * 0.35),
        dinner: Math.round(macros.targetCalories * 0.30),
        snacks: Math.round(macros.targetCalories * 0.10)
      }
    };

    logCalculation('Macro Breakdown', 'Generated macro breakdown by meal', breakdown);
    return breakdown;
  }
})); 