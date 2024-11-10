import React from 'react';
import WeeklyPlanCalendar from '../components/meal-planner/WeeklyPlanCalendar';
import RecipeSearch from '../components/meal-planner/RecipeSearch';
import NutritionGoals from '../components/meal-planner/NutritionGoals';
import GroceryList from '../components/meal-planner/GroceryList';

const MealPlanner: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">AI-Powered Meal Planner</h2>
      
      <WeeklyPlanCalendar />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <RecipeSearch />
        </div>
        <div className="space-y-8">
          <NutritionGoals />
          <GroceryList />
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;