import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const data = [
  { name: 'Protein', value: 30, color: '#FF6B6B' },
  { name: 'Carbs', value: 50, color: '#4ECDC4' },
  { name: 'Fat', value: 20, color: '#45B7D1' },
];

const MacronutrientChart: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <PieChartIcon className="mr-2 text-blue-500" /> Macronutrients
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MacronutrientChart;