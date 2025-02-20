import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MealPlanContextType {
  mealPlan: {
    [day: string]: {
      [meal: string]: {
        name: string;
        nutritionalInfo: {
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
        recipe?: string;
      };
    };
  };
  setMealPlan: (plan: MealPlanContextType['mealPlan']) => void;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const MealPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mealPlan, setMealPlan] = useState<MealPlanContextType['mealPlan']>({});

  return (
    <MealPlanContext.Provider value={{ mealPlan, setMealPlan }}>
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
}; 