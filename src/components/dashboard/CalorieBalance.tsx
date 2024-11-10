import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Flame, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import WarningSuppressor from './WarningSuppressor';

const data = [
  { name: 'Mon', consumed: 1800, burned: 2200, goal: 2000 },
  { name: 'Tue', consumed: 2100, burned: 2300, goal: 2000 },
  { name: 'Wed', consumed: 1900, burned: 2100, goal: 2000 },
  { name: 'Thu', consumed: 2000, burned: 2400, goal: 2000 },
  { name: 'Fri', consumed: 2200, burned: 2000, goal: 2000 },
  { name: 'Sat', consumed: 2300, burned: 2500, goal: 2000 },
  { name: 'Sun', consumed: 1950, burned: 2150, goal: 2000 },
];

const CalorieBalance: React.FC<{ className?: string }> = ({ className }) => {
  const [selectedDay, setSelectedDay] = useState(data[data.length - 1]);

  const totalConsumed = data.reduce((sum, day) => sum + day.consumed, 0);
  const totalBurned = data.reduce((sum, day) => sum + day.burned, 0);
  const avgConsumed = Math.round(totalConsumed / data.length);
  const avgBurned = Math.round(totalBurned / data.length);
  const netCalories = avgConsumed - avgBurned;

  const handleMouseEnter = (data: any) => {
    setSelectedDay(data);
  };

  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <p className="font-bold">{data.name}</p>
          <p className="text-blue-500">Consumed: {data.consumed} kcal</p>
          <p className="text-green-500">Burned: {data.burned} kcal</p>
          <p className="text-gray-500">Goal: {data.goal} kcal</p>
          <p className="font-bold text-purple-500">
            Net: {data.consumed - data.burned} kcal
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Flame className="mr-2 text-orange-500" /> Calorie Balance
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Avg. Daily Consumed</p>
          <p className="text-2xl font-bold text-blue-500">{avgConsumed} kcal</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg. Daily Burned</p>
          <p className="text-2xl font-bold text-green-500">{avgBurned} kcal</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg. Net Calories</p>
          <p className={`text-2xl font-bold ${netCalories > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {netCalories > 0 ? '+' : ''}{netCalories} kcal
          </p>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-500">Selected Day: {selectedDay.name}</p>
        <p className="text-xl font-bold">
          {selectedDay.consumed} / {selectedDay.goal} kcal
          <span className="text-sm font-normal text-gray-500 ml-2">
            Consumed / Goal
          </span>
        </p>
      </div>
      <WarningSuppressor>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            onMouseEnter={handleMouseEnter}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={renderTooltip} />
            <Legend />
            <ReferenceLine y={2000} label="Goal" stroke="red" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="consumed" stroke="#3b82f6" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="burned" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </WarningSuppressor>
      <div className="mt-4">
        <h4 className="font-semibold mb-2 flex items-center">
          <AlertCircle className="mr-2 text-yellow-500" /> Insights
        </h4>
        <ul className="list-disc list-inside text-sm text-gray-600">
          <li>Your average daily calorie intake is {avgConsumed > 2000 ? 'above' : 'below'} your goal.</li>
          <li>You're burning an average of {avgBurned} calories per day.</li>
          <li>
            {netCalories > 0 ? (
              <>
                <TrendingUp className="inline mr-1 text-red-500" />
                You're in a calorie surplus. Consider increasing activity or reducing intake for weight loss.
              </>
            ) : (
              <>
                <TrendingDown className="inline mr-1 text-green-500" />
                You're in a calorie deficit. Great for weight loss, but ensure it's not too extreme.
              </>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CalorieBalance;