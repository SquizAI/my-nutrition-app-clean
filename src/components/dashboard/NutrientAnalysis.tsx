import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';

const data = [
  { name: 'Vitamin A', actual: 80, recommended: 100 },
  { name: 'Vitamin C', actual: 120, recommended: 100 },
  { name: 'Vitamin D', actual: 60, recommended: 100 },
  { name: 'Iron', actual: 90, recommended: 100 },
  { name: 'Calcium', actual: 100, recommended: 100 },
];

const NutrientAnalysis: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BarChart2 className="mr-2" /> Nutrient Analysis
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="actual" fill="#8884d8" name="Actual Intake" />
          <Bar dataKey="recommended" fill="#82ca9d" name="Recommended" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NutrientAnalysis;