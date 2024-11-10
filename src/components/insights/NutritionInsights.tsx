import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';

interface NutrientData {
  name: string;
  actual: number;
  recommended: number;
}

const NutritionInsights: React.FC = () => {
  const [nutrientData, setNutrientData] = useState<NutrientData[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchData = async () => {
      // In a real app, this would be an API call
      const data: NutrientData[] = [
        { name: 'Protein', actual: 75, recommended: 80 },
        { name: 'Carbs', actual: 250, recommended: 300 },
        { name: 'Fat', actual: 65, recommended: 60 },
        { name: 'Fiber', actual: 20, recommended: 25 },
        { name: 'Vitamin C', actual: 85, recommended: 90 },
        { name: 'Iron', actual: 15, recommended: 18 },
      ];
      setNutrientData(data);

      // Generate insights based on the data
      const newInsights = generateInsights(data);
      setInsights(newInsights);
    };

    fetchData();
  }, []);

  const generateInsights = (data: NutrientData[]): string[] => {
    return data.map(nutrient => {
      const diff = nutrient.actual - nutrient.recommended;
      if (diff < 0) {
        return `Your ${nutrient.name} intake is ${Math.abs(diff)}g below the recommended amount. Consider increasing your intake of ${nutrient.name}-rich foods.`;
      } else if (diff > 0) {
        return `Your ${nutrient.name} intake is ${diff}g above the recommended amount. You might want to moderate your consumption of ${nutrient.name}-rich foods.`;
      } else {
        return `Great job! Your ${nutrient.name} intake is right on target.`;
      }
    });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Nutrition Insights</h3>
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={nutrientData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="actual" fill="#8884d8" name="Actual Intake" />
            <Bar dataKey="recommended" fill="#82ca9d" name="Recommended Intake" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start">
            <Lightbulb className="mr-2 text-yellow-500 flex-shrink-0 mt-1" />
            <p className="text-sm text-gray-600">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionInsights;