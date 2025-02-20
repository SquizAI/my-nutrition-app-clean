import { Meal } from '../types/meal';
import { create } from 'zustand';

interface NutritionalConstraints {
  minCalories: number;
  maxCalories: number;
  minProtein: number;
  maxProtein: number;
  minCarbs: number;
  maxCarbs: number;
  minFats: number;
  maxFats: number;
  dietaryRestrictions: string[];
  allergies: string[];
}

interface MealPlanChromosome {
  meals: Meal[];
  fitness: number;
  nutritionalScore: number;
  varietyScore: number;
  preferencesScore: number;
  constraintsSatisfaction: number;
}

interface GeneticAlgorithmState {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  tournamentSize: number;
  constraints: NutritionalConstraints;
  currentPopulation: MealPlanChromosome[];
  bestSolution: MealPlanChromosome | null;
  isRunning: boolean;
  
  // Actions
  initializePopulation: (mealDatabase: Meal[]) => void;
  evolve: () => void;
  setConstraints: (constraints: Partial<NutritionalConstraints>) => void;
  stopEvolution: () => void;

  // Calculation functions
  calculateNutritionalScore: (meals: Meal[], constraints: NutritionalConstraints) => number;
  calculateVarietyScore: (meals: Meal[]) => number;
  calculatePreferencesScore: (meals: Meal[], preferences: string[]) => number;
  calculateConstraintsSatisfaction: (meals: Meal[], constraints: NutritionalConstraints) => number;
}

const calculateNutritionalScore = (meals: Meal[], constraints: NutritionalConstraints): number => {
  const totalNutrients = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fats: acc.fats + meal.fats
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  // Calculate how well the meal plan meets the nutritional constraints
  const caloriesScore = 1 - Math.abs(
    (totalNutrients.calories - (constraints.minCalories + constraints.maxCalories) / 2) /
    (constraints.maxCalories - constraints.minCalories)
  );
  
  const proteinScore = 1 - Math.abs(
    (totalNutrients.protein - (constraints.minProtein + constraints.maxProtein) / 2) /
    (constraints.maxProtein - constraints.minProtein)
  );

  const carbsScore = 1 - Math.abs(
    (totalNutrients.carbs - (constraints.minCarbs + constraints.maxCarbs) / 2) /
    (constraints.maxCarbs - constraints.minCarbs)
  );

  const fatsScore = 1 - Math.abs(
    (totalNutrients.fats - (constraints.minFats + constraints.maxFats) / 2) /
    (constraints.maxFats - constraints.minFats)
  );

  return (caloriesScore + proteinScore + carbsScore + fatsScore) / 4;
};

const calculateVarietyScore = (meals: Meal[]): number => {
  // Calculate variety based on unique ingredients and cooking methods
  const uniqueIngredients = new Set(meals.flatMap(meal => meal.ingredients));
  const uniqueMethods = new Set(meals.map(meal => meal.cookingMethod).filter(Boolean));
  
  // Calculate variety scores
  const ingredientVariety = uniqueIngredients.size / (meals.length * 5); // Assuming average 5 ingredients per meal
  const methodVariety = uniqueMethods.size / meals.length;
  
  return (ingredientVariety + methodVariety) / 2;
};

const calculatePreferencesScore = (meals: Meal[], preferences: string[]): number => {
  if (!preferences.length) return 1;
  
  const preferenceMatches = meals.reduce((matches, meal) => {
    const matchCount = preferences.filter(pref => 
      meal.dietaryTags.includes(pref) || 
      meal.ingredients.some(ing => ing.toLowerCase().includes(pref.toLowerCase()))
    ).length;
    return matches + matchCount;
  }, 0);

  return preferenceMatches / (meals.length * preferences.length);
};

const calculateConstraintsSatisfaction = (meals: Meal[], constraints: NutritionalConstraints): number => {
  // Check if any meals violate dietary restrictions or contain allergens
  const violationsCount = meals.reduce((count, meal) => {
    const hasRestriction = constraints.dietaryRestrictions.some(restriction =>
      !meal.dietaryTags.includes(restriction)
    );
    const hasAllergen = constraints.allergies.some(allergen =>
      meal.ingredients.some(ing => ing.toLowerCase().includes(allergen.toLowerCase()))
    );
    return count + (hasRestriction || hasAllergen ? 1 : 0);
  }, 0);

  return 1 - (violationsCount / meals.length);
};

const crossover = (parent1: MealPlanChromosome, parent2: MealPlanChromosome): [MealPlanChromosome, MealPlanChromosome] => {
  const crossoverPoint = Math.floor(Math.random() * parent1.meals.length);
  
  const child1Meals = [
    ...parent1.meals.slice(0, crossoverPoint),
    ...parent2.meals.slice(crossoverPoint)
  ];
  
  const child2Meals = [
    ...parent2.meals.slice(0, crossoverPoint),
    ...parent1.meals.slice(crossoverPoint)
  ];

  return [
    { ...parent1, meals: child1Meals, fitness: 0 },
    { ...parent2, meals: child2Meals, fitness: 0 }
  ];
};

const mutate = (chromosome: MealPlanChromosome, mealDatabase: Meal[], mutationRate: number): MealPlanChromosome => {
  const mutatedMeals = chromosome.meals.map(meal => {
    if (Math.random() < mutationRate) {
      // Replace meal with a random one from the database
      const randomIndex = Math.floor(Math.random() * mealDatabase.length);
      return mealDatabase[randomIndex];
    }
    return meal;
  });

  return { ...chromosome, meals: mutatedMeals, fitness: 0 };
};

export const useGeneticAlgorithm = create<GeneticAlgorithmState>((set, get) => ({
  populationSize: 100,
  generations: 50,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  elitismCount: 2,
  tournamentSize: 5,
  constraints: {
    minCalories: 1500,
    maxCalories: 2500,
    minProtein: 50,
    maxProtein: 150,
    minCarbs: 150,
    maxCarbs: 300,
    minFats: 30,
    maxFats: 80,
    dietaryRestrictions: [],
    allergies: []
  },
  currentPopulation: [],
  bestSolution: null,
  isRunning: false,

  // Expose calculation functions
  calculateNutritionalScore,
  calculateVarietyScore,
  calculatePreferencesScore,
  calculateConstraintsSatisfaction,

  initializePopulation: (mealDatabase: Meal[]) => {
    const { populationSize, constraints } = get();
    const initialPopulation: MealPlanChromosome[] = [];

    for (let i = 0; i < populationSize; i++) {
      // Create a random meal plan
      const randomMeals = Array.from({ length: 7 }, () => {
        const randomIndex = Math.floor(Math.random() * mealDatabase.length);
        return mealDatabase[randomIndex];
      });

      const nutritionalScore = calculateNutritionalScore(randomMeals, constraints);
      const varietyScore = calculateVarietyScore(randomMeals);
      const preferencesScore = calculatePreferencesScore(randomMeals, constraints.dietaryRestrictions);
      const constraintsSatisfaction = calculateConstraintsSatisfaction(randomMeals, constraints);

      const fitness = (
        nutritionalScore * 0.4 +
        varietyScore * 0.3 +
        preferencesScore * 0.2 +
        constraintsSatisfaction * 0.1
      );

      initialPopulation.push({
        meals: randomMeals,
        fitness,
        nutritionalScore,
        varietyScore,
        preferencesScore,
        constraintsSatisfaction
      });
    }

    set({ currentPopulation: initialPopulation, isRunning: true });
  },

  evolve: () => {
    const {
      currentPopulation,
      populationSize,
      elitismCount,
      tournamentSize,
      crossoverRate,
      mutationRate,
      constraints
    } = get();

    // Sort population by fitness
    const sortedPopulation = [...currentPopulation].sort((a, b) => b.fitness - a.fitness);
    
    // Keep elite individuals
    const newPopulation = sortedPopulation.slice(0, elitismCount);
    
    // Tournament selection and crossover
    while (newPopulation.length < populationSize) {
      // Tournament selection
      const tournament1 = Array.from({ length: tournamentSize }, () => 
        sortedPopulation[Math.floor(Math.random() * sortedPopulation.length)]
      );
      const tournament2 = Array.from({ length: tournamentSize }, () => 
        sortedPopulation[Math.floor(Math.random() * sortedPopulation.length)]
      );

      const parent1 = tournament1.reduce((best, current) => 
        current.fitness > best.fitness ? current : best
      );
      const parent2 = tournament2.reduce((best, current) => 
        current.fitness > best.fitness ? current : best
      );

      // Crossover
      if (Math.random() < crossoverRate) {
        const [child1, child2] = crossover(parent1, parent2);
        newPopulation.push(child1, child2);
      } else {
        newPopulation.push(parent1, parent2);
      }
    }

    // Mutation
    const mealDatabase = currentPopulation.flatMap(chromosome => chromosome.meals);
    const mutatedPopulation = newPopulation.map(chromosome => 
      mutate(chromosome, mealDatabase, mutationRate)
    );

    // Recalculate fitness for new population
    const evaluatedPopulation = mutatedPopulation.map(chromosome => {
      const nutritionalScore = calculateNutritionalScore(chromosome.meals, constraints);
      const varietyScore = calculateVarietyScore(chromosome.meals);
      const preferencesScore = calculatePreferencesScore(chromosome.meals, constraints.dietaryRestrictions);
      const constraintsSatisfaction = calculateConstraintsSatisfaction(chromosome.meals, constraints);

      const fitness = (
        nutritionalScore * 0.4 +
        varietyScore * 0.3 +
        preferencesScore * 0.2 +
        constraintsSatisfaction * 0.1
      );

      return {
        ...chromosome,
        fitness,
        nutritionalScore,
        varietyScore,
        preferencesScore,
        constraintsSatisfaction
      };
    });

    const bestSolution = evaluatedPopulation.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );

    set({ 
      currentPopulation: evaluatedPopulation,
      bestSolution: bestSolution.fitness > (get().bestSolution?.fitness ?? 0) ? bestSolution : get().bestSolution
    });
  },

  setConstraints: (newConstraints) => {
    set({ constraints: { ...get().constraints, ...newConstraints } });
  },

  stopEvolution: () => {
    set({ isRunning: false });
  }
})); 