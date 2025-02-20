import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Search, Filter, Loader, Heart, Clock, BarChart, Flame, Tag } from 'lucide-react';
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

const Container = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const SearchHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SearchBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const IconButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.button.background};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.button.hover};
    border-color: ${({ theme }) => theme.colors.border.hover};
  }
`;

const FilterTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

interface FilterTagProps {
  isActive: boolean;
}

const FilterTag = styled(motion.button)<FilterTagProps>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ theme, isActive }) => 
    isActive ? theme.colors.button.hover : theme.colors.button.background};
  border: 1px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.button.hover};
    border-color: ${({ theme }) => theme.colors.border.hover};
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const RecipeCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.main};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  overflow: hidden;
  cursor: pointer;
`;

const RecipeImage = styled.div`
  aspect-ratio: 16/9;
  background: ${({ theme }) => theme.colors.background.card};
  position: relative;
`;

const RecipeInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const RecipeName = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const RecipeMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const RecipeSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    cookingTime: 60,
    difficulty: '',
    cuisineType: '',
  });

  const filters = [
    { icon: Clock, label: 'Quick (< 30 min)' },
    { icon: Flame, label: 'Low Calorie' },
    { icon: Tag, label: 'Vegetarian' },
    { icon: Tag, label: 'High Protein' },
  ];

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
      const filtersString = activeFilters.join(', ');
      
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

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <Container>
      <SearchHeader>
        <Title>Recipe Search</Title>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
          >
            <Search size={20} />
          </IconButton>
          <IconButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter size={20} />
          </IconButton>
        </SearchBar>
        <FilterTags>
          {filters.map(({ icon: Icon, label }) => (
            <FilterTag
              key={label}
              isActive={activeFilters.includes(label)}
              onClick={() => toggleFilter(label)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={14} />
              {label}
            </FilterTag>
          ))}
        </FilterTags>
      </SearchHeader>

      <ResultsGrid>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="animate-spin text-blue-500" size={24} />
          </div>
        ) : error ? (
          <div className="text-red-500 p-4">{error}</div>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RecipeImage />
              <RecipeInfo>
                <div className="flex justify-between items-start">
                  <RecipeName>{recipe.name}</RecipeName>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe.id);
                    }}
                    className={`text-${favoriteRecipes.includes(recipe.id) ? 'red' : 'gray'}-500 hover:text-red-700`}
                  >
                    <Heart size={20} />
                  </button>
                </div>
                <RecipeMeta>
                  <MetaItem>
                    <Clock size={14} />
                    {recipe.cookingTime} min
                  </MetaItem>
                  <MetaItem>
                    {recipe.difficulty}
                  </MetaItem>
                  <MetaItem>
                    {recipe.cuisineType}
                  </MetaItem>
                </RecipeMeta>
              </RecipeInfo>
            </RecipeCard>
          ))
        )}
      </ResultsGrid>
    </Container>
  );
};

export default RecipeSearch;