import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader, Heart, Clock, BarChart } from 'lucide-react';
import { getNutritionAdvice } from '../../services/aiService';

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  cookingTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisineType: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface AdvancedFilters {
  cookingTime: number;
  difficulty: string;
  cuisineType: string;
}

const RecipeSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
  });
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    cookingTime: 60,
    difficulty: '',
    cuisineType: '',
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteRecipes');
    if (savedFavorites) {
      setFavoriteRecipes(JSON.parse(savedFavorites));
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const filtersString = Object.entries(filters)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .join(', ');
      
      const schema = {
        type: "object",
        properties: {
          recipes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                ingredients: { 
                  type: "array",
                  items: { type: "string" }
                },
                instructions: { type: "string" },
                cookingTime: { type: "number" },
                difficulty: { type: "string" },
                cuisineType: { type: "string" },
                nutritionalInfo: {
                  type: "object",
                  properties: {
                    calories: { type: "number" },
                    protein: { type: "number" },
                    carbs: { type: "number" },
                    fat: { type: "number" }
                  }
                }
              },
              required: ["name", "ingredients", "instructions", "cookingTime", "difficulty", "cuisineType", "nutritionalInfo"]
            }
          }
        },
        required: ["recipes"]
      };
  
      const prompt = `Search for recipes with the following criteria: ${searchTerm}. 
        Dietary restrictions: ${filtersString}. 
        Cooking time: up to ${advancedFilters.cookingTime} minutes. 
        Difficulty: ${advancedFilters.difficulty || 'Any'}. 
        Cuisine type: ${advancedFilters.cuisineType || 'Any'}. 
        Provide 3 recipes in JSON format with name, ingredients, instructions, cooking time, difficulty, cuisine type, and nutritional information.`;
      
      const response = await getNutritionAdvice(prompt, schema);
      setRecipes(response.recipes);
    } catch (error) {
      console.error('Error searching recipes:', error);
      setError('Failed to fetch recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (recipeId: string) => {
    setFavoriteRecipes(prev => {
      const newFavorites = prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId];
      localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">AI-Powered Recipe Search</h3>
      <form onSubmit={handleSearch}>
        <div className="flex mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipes..."
            className="flex-grow px-4 py-2 border rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700">
            <Search size={20} />
          </button>
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <Filter size={20} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Dietary Filters:</span>
          {Object.entries(filters).map(([key, value]) => (
            <label key={key} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={() => setFilters({ ...filters, [key]: !value })}
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-sm text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="mb-4 text-indigo-600 hover:text-indigo-800"
        >
          {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>
        {showAdvancedFilters && (
          <div className="mb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cooking Time (minutes)</label>
              <input
                type="range"
                min="15"
                max="120"
                value={advancedFilters.cookingTime}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, cookingTime: parseInt(e.target.value) })}
                className="w-full"
              />
              <span>{advancedFilters.cookingTime} minutes</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                value={advancedFilters.difficulty}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, difficulty: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Any</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cuisine Type</label>
              <input
                type="text"
                value={advancedFilters.cuisineType}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, cuisineType: e.target.value })}
                placeholder="e.g., Italian, Chinese, Mexican"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )}
      </form>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin text-blue-500" size={24} />
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="mt-6 space-y-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-medium text-gray-900 mb-2">{recipe.name}</h4>
                <button
                  onClick={() => toggleFavorite(recipe.id)}
                  className={`text-${favoriteRecipes.includes(recipe.id) ? 'red' : 'gray'}-500 hover:text-red-700`}
                >
                  <Heart size={20} />
                </button>
              </div>
              <div className="flex items-center space-x-4 mb-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {recipe.cookingTime} min
                </span>
                <span>{recipe.difficulty}</span>
                <span>{recipe.cuisineType}</span>
              </div>
              <h5 className="text-md font-medium text-gray-700 mb-1">Ingredients:</h5>
              <ul className="list-disc list-inside mb-2">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="text-sm text-gray-600">{ingredient}</li>
                ))}
              </ul>
              <h5 className="text-md font-medium text-gray-700 mb-1">Instructions:</h5>
              <p className="text-sm text-gray-600 mb-2">{recipe.instructions}</p>
              <div className="mt-2">
                <h5 className="text-md font-medium text-gray-700 mb-1 flex items-center">
                  <BarChart size={16} className="mr-1" />
                  Nutritional Information:
                </h5>
                <p className="text-sm text-gray-600">
                  Calories: {recipe.nutritionalInfo.calories} |
                  Protein: {recipe.nutritionalInfo.protein}g |
                  Carbs: {recipe.nutritionalInfo.carbs}g |
                  Fat: {recipe.nutritionalInfo.fat}g
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeSearch;