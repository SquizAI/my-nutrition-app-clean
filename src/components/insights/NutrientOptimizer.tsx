import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet } from 'lucide-react';

const data = [
  { name: 'Protein', current: 80, optimal: 100 },
  { name: 'Carbs', current: 120, optimal: 100 },
  { name: 'Fat', current: 90, optimal: 100 },
  { name: 'Fiber', current: 70, optimal: 100 },
  { name: 'Vitamin C', current: 110, optimal: 100 },
  { name: 'Iron', current: 60, optimal: 100 },
];

const NutrientOptimizer: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Droplet className="mr-2" /> Nutrient Optimizer
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="current" fill="#8884d8" name="Current Intake" />
          <Bar dataKey="optimal" fill="#82ca9d" name="Optimal Intake" />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-4 text-sm text-gray-600">
        AI Recommendation: Consider increasing your iron intake and slightly reducing carbohydrates to optimize your nutrient balance.
      </p>
    </div>
  );
};

export default NutrientOptimizer;