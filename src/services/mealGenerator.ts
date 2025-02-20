import { create } from 'zustand';
import { Meal } from '../types/meal';
import { useGeneticAlgorithm } from './geneticAlgorithm';
import { useMacroCalculator } from './macroCalculator';
import { useUserPreferences } from './userPreferences';

interface MealGeneratorStore {
  currentPlan: {
    meals: Meal[];
    nutritionalScore: number;
    varietyScore: number;
    preferencesScore: number;
    constraintsSatisfaction: number;
  } | null;
  isGenerating: boolean;
  error: string | null;
  generateMealPlan: () => Promise<void>;
  updateMealPlan: (meals: Meal[]) => void;
}

export const useMealGenerator = create<MealGeneratorStore>((set, get) => {
  const geneticAlgorithm = useGeneticAlgorithm.getState();
  const macroCalculator = useMacroCalculator.getState();
  const userPreferences = useUserPreferences.getState();

  // Subscribe to store changes
  useGeneticAlgorithm.subscribe((state) => {
    if (state.bestSolution && !state.isRunning) {
      set({
        currentPlan: {
          meals: state.bestSolution.meals,
          nutritionalScore: state.bestSolution.nutritionalScore,
          varietyScore: state.bestSolution.varietyScore,
          preferencesScore: state.bestSolution.preferencesScore,
          constraintsSatisfaction: state.bestSolution.constraintsSatisfaction
        },
        isGenerating: false
      });
    }
  });

  return {
    currentPlan: null,
    isGenerating: false,
    error: null,

    generateMealPlan: async () => {
      try {
        set({ isGenerating: true, error: null });

        // Check if macros are available
        if (!macroCalculator.macros) {
          throw new Error('Please calculate your macros first');
        }

        const { targetCalories, protein, carbs, fats } = macroCalculator.macros;

        // Update genetic algorithm constraints based on user's macros and preferences
        geneticAlgorithm.setConstraints({
          minCalories: targetCalories * 0.95,
          maxCalories: targetCalories * 1.05,
          minProtein: protein * 0.95,
          maxProtein: protein * 1.05,
          minCarbs: carbs * 0.95,
          maxCarbs: carbs * 1.05,
          minFats: fats * 0.95,
          maxFats: fats * 1.05,
          dietaryRestrictions: userPreferences.dietaryPreferences,
          allergies: userPreferences.allergies
        });

        // Fetch meal database
        const mealDatabase = await fetchMealDatabase();

        // Initialize population with meal database
        geneticAlgorithm.initializePopulation(mealDatabase);

        // Run evolution for specified number of generations
        for (let i = 0; i < geneticAlgorithm.generations; i++) {
          if (!geneticAlgorithm.isRunning) break;
          geneticAlgorithm.evolve();
          
          // Optional: Add a small delay to prevent UI blocking
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        geneticAlgorithm.stopEvolution();

      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error occurred', isGenerating: false });
      }
    },

    updateMealPlan: (meals: Meal[]) => {
      if (!get().currentPlan) return;

      const nutritionalScore = geneticAlgorithm.calculateNutritionalScore(meals, geneticAlgorithm.constraints);
      const varietyScore = geneticAlgorithm.calculateVarietyScore(meals);
      const preferencesScore = geneticAlgorithm.calculatePreferencesScore(meals, geneticAlgorithm.constraints.dietaryRestrictions);
      const constraintsSatisfaction = geneticAlgorithm.calculateConstraintsSatisfaction(meals, geneticAlgorithm.constraints);

      set({
        currentPlan: {
          meals,
          nutritionalScore,
          varietyScore,
          preferencesScore,
          constraintsSatisfaction
        }
      });
    }
  };
});

// Helper function to fetch meal database
async function fetchMealDatabase(): Promise<Meal[]> {
  // This is a placeholder - you'll need to implement actual meal database fetching
  // You could fetch from an API, local storage, or include a static database
  
  const mockMeals: Meal[] = [
    {
      id: '1',
      name: 'Grilled Chicken Salad',
      calories: 400,
      protein: 35,
      carbs: 20,
      fats: 22,
      preparationTime: 20,
      cookingMethod: 'Grilling',
      ingredients: [
        'chicken breast',
        'mixed greens',
        'olive oil',
        'cherry tomatoes',
        'cucumber'
      ],
      instructions: [
        'Grill the chicken breast',
        'Chop vegetables',
        'Mix ingredients',
        'Add dressing'
      ],
      dietaryTags: ['high-protein', 'low-carb', 'gluten-free'],
      image: 'https://source.unsplash.com/random/800x600/?salad'
    },
    // Add more mock meals here...
  ];

  return mockMeals;
} 