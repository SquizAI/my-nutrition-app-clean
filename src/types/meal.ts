export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  preparationTime: number;
  cookingMethod?: string;
  ingredients: string[];
  instructions: string[];
  dietaryTags: string[];
  image?: string;
} 