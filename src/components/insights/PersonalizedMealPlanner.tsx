import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateMealPlan } from '../../services/aiService';

const PersonalizedMealPlanner: React.FC = () => {
  const [meals, setMeals] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMealPlan();
  }, []);

  const fetchMealPlan = async () => {
    setIsLoading(true);
    try {
      const preferences = "Balanced diet with a focus on protein"; // This could be dynamically set based on user preferences
      const mealPlanString = await generateMealPlan(preferences);
      const mealPlan = JSON.parse(mealPlanString);
      setMeals(mealPlan);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setMeals({});
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Calendar className="mr-2" /> AI-Generated Meal Plan
      </h3>
      <div className="flex justify-between items-center mb-4">
        <button className="p-2 rounded-full bg-gray-200" onClick={fetchMealPlan}><ChevronLeft size={20} /></button>
        <span className="font-medium">Today's Meals</span>
        <button className="p-2 rounded-full bg-gray-200" onClick={fetchMealPlan}><ChevronRight size={20} /></button>
      </div>
      {isLoading ? (
        <div className="text-center">Generating meal plan...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(meals).map(([mealName, description], index) => (
            <div key={index} className="border-b pb-2">
              <h4 className="font-medium">{mealName}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalizedMealPlanner;