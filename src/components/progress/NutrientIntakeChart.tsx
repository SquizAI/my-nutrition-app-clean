import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clipboard } from 'lucide-react';

const data = [
  { name: 'Protein', actual: 75, goal: 80 },
  { name: 'Carbs', actual: 250, goal: 300 },
  { name: 'Fat', actual: 65, goal: 60 },
  { name: 'Fiber', actual: 20, goal: 25 },
  { name: 'Vitamin C', actual: 85, goal: 90 },
  { name: 'Iron', actual: 15, goal: 18 },
];

const NutrientIntakeChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Clipboard className="mr-2" /> Nutrient Intake
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="actual" fill="#8884d8" name="Actual Intake" />
          <Bar dataKey="goal" fill="#82ca9d" name="Goal" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NutrientIntakeChart;