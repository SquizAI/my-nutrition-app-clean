import React, { useState, useEffect } from 'react';
import { Calendar, Loader, Settings, Edit2, RefreshCw, Download, Info, Book, ChevronLeft, ChevronRight } from 'lucide-react';
import { getNutritionAdvice } from '../../services/aiService';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useMacroCalculator } from '../../services/macroCalculator';
import { useToast } from '../shared/Toast';

interface MealPlan {
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
}

interface Preferences {
  dietaryRestrictions: string[];
  favoriteIngredients: string[];
  dislikedIngredients: string[];
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

const Container = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const MonthYear = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const NavigationButton = styled(motion.button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.small};

  &:hover {
    background: ${({ theme }) => theme.colors.button.background};
  }
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DayHeader = styled.div`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.sm};
`;

interface DayProps {
  isToday?: boolean;
  isSelected?: boolean;
  hasMeals?: boolean;
}

const Day = styled(motion.div)<DayProps>`
  aspect-ratio: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary : theme.colors.border.default};
  background: ${({ theme, isToday, isSelected }) => 
    isSelected ? theme.colors.button.background :
    isToday ? 'rgba(49, 229, 255, 0.1)' :
    'transparent'};
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.button.background};
  }
`;

const DayNumber = styled.span<{ isToday?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ isToday }) => isToday ? 600 : 400};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MealIndicator = styled.div`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xs};
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const InfoMessage = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.button.background};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.button.hover};
    border-color: ${({ theme }) => theme.colors.border.hover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const WeeklyPlanCalendar: React.FC = () => {
  const { macros } = useMacroCalculator();
  const { addToast } = useToast();
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    dietaryRestrictions: [],
    favoriteIngredients: [],
    dislikedIngredients: [],
    calorieGoal: 2000,
    proteinGoal: 150,
    carbGoal: 200,
    fatGoal: 65,
  });
  const [editingMeal, setEditingMeal] = useState<{ day: string; meal: string } | null>(null);
  const [editedMealContent, setEditedMealContent] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showNutritionalInfo, setShowNutritionalInfo] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  useEffect(() => {
    generateMealPlan();
  }, [preferences]);

  const generateMealPlan = async (day?: string, meal?: string) => {
    if (!macros) {
      addToast({
        type: 'warning',
        message: 'Please calculate your macros first using the TDEE Calculator',
      });
      return;
    }

    setIsGenerating(true);
    setIsLoading(true);
    setError(null);
    try {
      const schema = {
        type: "object",
        properties: {
          mealPlan: {
            type: "object",
            properties: Object.fromEntries(daysOfWeek.map(day => [
              day,
              {
                type: "object",
                properties: Object.fromEntries(mealTypes.map(meal => [
                  meal,
                  {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      nutritionalInfo: {
                        type: "object",
                        properties: {
                          calories: { type: "number" },
                          protein: { type: "number" },
                          carbs: { type: "number" },
                          fat: { type: "number" }
                        },
                        required: ["calories", "protein", "carbs", "fat"]
                      },
                      recipe: { type: "string" }
                    },
                    required: ["name", "nutritionalInfo"]
                  }
                ]))
              }
            ])),
            required: daysOfWeek
          }
        },
        required: ["mealPlan"]
      };
  
      let prompt = `Generate a ${day && meal ? `${meal} for ${day}` : 'weekly meal plan'} with ${day && meal ? '' : 'breakfast, lunch, dinner, and snacks for each day of the week.'}
      Consider the following preferences:
      - Dietary restrictions: ${preferences.dietaryRestrictions.join(', ')}
      - Favorite ingredients: ${preferences.favoriteIngredients.join(', ')}
      - Disliked ingredients: ${preferences.dislikedIngredients.join(', ')}
      - Daily goals: ${preferences.calorieGoal} calories, ${preferences.proteinGoal}g protein, ${preferences.carbGoal}g carbs, ${preferences.fatGoal}g fat
  
      ${day && meal ? `Respond with a single meal suggestion.` : `Respond with a complete meal plan for the week.`}`;
  
      const response = await getNutritionAdvice(prompt, schema);
  
      let newMealPlan = { ...mealPlan };
  
      if (day && meal) {
        newMealPlan = {
          ...newMealPlan,
          [day]: {
            ...newMealPlan[day],
            [meal]: response.mealPlan?.[day]?.[meal] || { name: 'Failed to generate meal', nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
          }
        };
      } else if (response.mealPlan) {
        Object.entries(response.mealPlan).forEach(([responseDay, dayPlan]) => {
          if (!newMealPlan[responseDay]) newMealPlan[responseDay] = {};
          Object.entries(dayPlan as any).forEach(([responseMeal, mealData]) => {
            newMealPlan[responseDay][responseMeal] = mealData as any;
          });
        });
      }
  
      setMealPlan(newMealPlan);
  
      // Check if the plan is incomplete
      const missingDays = daysOfWeek.filter(day => !newMealPlan[day] || Object.keys(newMealPlan[day]).length < mealTypes.length);
      if (missingDays.length > 0) {
        setError(`The meal plan is incomplete. Missing or partial days: ${missingDays.join(', ')}`);
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setError('Failed to generate meal plan. Please try again. If the problem persists, there might be an issue with the AI service.');
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof Preferences, value: string | number | string[]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleEditMeal = (day: string, meal: string) => {
    setEditingMeal({ day, meal });
    setEditedMealContent(mealPlan[day][meal].name);
  };

  const handleSaveMeal = () => {
    if (editingMeal) {
      setMealPlan(prev => ({
        ...prev,
        [editingMeal.day]: {
          ...prev[editingMeal.day],
          [editingMeal.meal]: {
            ...prev[editingMeal.day][editingMeal.meal],
            name: editedMealContent
          }
        }
      }));
      setEditingMeal(null);
    }
  };

  const handleRegenerateMeal = (day: string, meal: string) => {
    generateMealPlan(day, meal);
  };

  const exportMealPlan = () => {
    let content = "Weekly Meal Plan\n\n";

    daysOfWeek.forEach(day => {
      content += `${day}:\n`;
      mealTypes.forEach(meal => {
        if (mealPlan[day] && mealPlan[day][meal]) {
          content += `  ${meal}: ${mealPlan[day][meal].name}\n`;
          content += `    Calories: ${mealPlan[day][meal].nutritionalInfo.calories}, `;
          content += `Protein: ${mealPlan[day][meal].nutritionalInfo.protein}g, `;
          content += `Carbs: ${mealPlan[day][meal].nutritionalInfo.carbs}g, `;
          content += `Fat: ${mealPlan[day][meal].nutritionalInfo.fat}g\n`;
        }
      });
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'weekly-meal-plan.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add previous month's days
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Add next month's days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasMeals = (date: Date) => {
    // TODO: Implement meal checking logic
    return Math.random() > 0.7; // Temporary random indicator
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + (direction === 'next' ? 1 : -1),
      1
    ));
  };

  return (
    <Container>
      <Header>
        <NavigationButton
          onClick={() => navigateMonth('prev')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={24} />
        </NavigationButton>
        <MonthYear>
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </MonthYear>
        <NavigationButton
          onClick={() => navigateMonth('next')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={24} />
        </NavigationButton>
      </Header>

      <WeekGrid>
        {daysOfWeek.map(day => (
          <DayHeader key={day}>{day}</DayHeader>
        ))}
        {getDaysInMonth(currentMonth).map(({ date, isCurrentMonth }) => (
          <Day
            key={date.toISOString()}
            isToday={isToday(date)}
            isSelected={isSelected(date)}
            hasMeals={hasMeals(date)}
            onClick={() => setSelectedDate(date)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ opacity: isCurrentMonth ? 1 : 0.3 }}
          >
            <DayNumber isToday={isToday(date)}>
              {date.getDate()}
            </DayNumber>
            {hasMeals(date) && <MealIndicator />}
          </Day>
        ))}
      </WeekGrid>

      <div className="flex justify-between items-center mt-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Calendar className="mr-2" /> Dynamic Weekly Meal Plan
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Settings className="mr-2" size={16} />
            Preferences
          </button>
          {!macros ? (
            <InfoMessage>Please calculate your macros first using the TDEE Calculator</InfoMessage>
          ) : (
            <Button
              onClick={() => generateMealPlan()}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Weekly Plan'}
            </Button>
          )}
          <button
            onClick={exportMealPlan}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center"
          >
            <Download className="mr-2" size={16} />
            Export Plan
          </button>
        </div>
      </div>

      {showPreferences && (
        <div className="mb-6 p-4 border rounded">
          <h4 className="font-semibold mb-2">Meal Plan Preferences</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2">Dietary Restrictions</label>
              {['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free'].map(restriction => (
                <div key={restriction} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={restriction}
                    checked={preferences.dietaryRestrictions.includes(restriction)}
                    onChange={(e) => {
                      const newRestrictions = e.target.checked
                        ? [...preferences.dietaryRestrictions, restriction]
                        : preferences.dietaryRestrictions.filter(r => r !== restriction);
                      handlePreferenceChange('dietaryRestrictions', newRestrictions);
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={restriction}>{restriction}</label>
                </div>
              ))}
            </div>
            <div>
              <label className="block mb-2">Favorite Ingredients (comma-separated)</label>
              <input
                type="text"
                value={preferences.favoriteIngredients.join(', ')}
                onChange={(e) => handlePreferenceChange('favoriteIngredients', e.target.value.split(', ').map(item => item.trim()))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Disliked Ingredients (comma-separated)</label>
              <input
                type="text"
                value={preferences.dislikedIngredients.join(', ')}
                onChange={(e) => handlePreferenceChange('dislikedIngredients', e.target.value.split(', ').map(item => item.trim()))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Daily Calorie Goal</label>
              <input
                type="number"
                value={preferences.calorieGoal}
                onChange={(e) => handlePreferenceChange('calorieGoal', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Daily Protein Goal (g)</label>
              <input
                type="number"
                value={preferences.proteinGoal}
                onChange={(e) => handlePreferenceChange('proteinGoal', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Daily Carb Goal (g)</label>
              <input
                type="number"
                value={preferences.carbGoal}
                onChange={(e) => handlePreferenceChange('carbGoal', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Daily Fat Goal (g)</label>
              <input
                type="number"
                value={preferences.fatGoal}
                onChange={(e) => handlePreferenceChange('fatGoal', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-blue-500" size={24} />
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal</th>
                {daysOfWeek.map(day => (
                  <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mealTypes.map(meal => (
                <tr key={meal}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{meal}</td>
                  {daysOfWeek.map(day => (
                    <td key={`${meal}-${day}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="relative group">
                        {editingMeal && editingMeal.day === day && editingMeal.meal === meal ? (
                          <div className="flex flex-col">
                            <input
                              type="text"
                              value={editedMealContent}
                              onChange={(e) => setEditedMealContent(e.target.value)}
                              className="w-full p-2 border rounded mb-1"
                            />
                            <button
                              onClick={handleSaveMeal}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <>
                            {mealPlan[day] && mealPlan[day][meal] ? (
                              <div>
                                <span>{mealPlan[day][meal].name}</span>
                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex">
                                  <button
                                    className="bg-gray-200 p-1 rounded mr-1"
                                    onClick={() => handleEditMeal(day, meal)}
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    className="bg-gray-200 p-1 rounded mr-1"
                                    onClick={() => handleRegenerateMeal(day, meal)}
                                  >
                                    <RefreshCw size={12} />
                                  </button>
                                  <button
                                    className="bg-gray-200 p-1 rounded mr-1"
                                    onClick={() => setShowNutritionalInfo(!showNutritionalInfo)}
                                  >
                                    <Info size={12} />
                                  </button>
                                  {mealPlan[day][meal].recipe && (
                                    <button
                                      className="bg-gray-200 p-1 rounded"
                                      onClick={() => alert(mealPlan[day][meal].recipe)}
                                    >
                                      <Book size={12} />
                                    </button>
                                  )}
                                </div>
                                {showNutritionalInfo && (
                                  <div className="mt-2 text-xs">
                                    <p>Calories: {mealPlan[day][meal].nutritionalInfo.calories}</p>
                                    <p>Protein: {mealPlan[day][meal].nutritionalInfo.protein}g</p>
                                    <p>Carbs: {mealPlan[day][meal].nutritionalInfo.carbs}g</p>
                                    <p>Fat: {mealPlan[day][meal].nutritionalInfo.fat}g</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              'Add meal'
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
};

export default WeeklyPlanCalendar;