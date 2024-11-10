import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon } from 'lucide-react';

const data = [
  { name: 'Mon', hours: 7, quality: 8 },
  { name: 'Tue', hours: 6, quality: 6 },
  { name: 'Wed', hours: 8, quality: 9 },
  { name: 'Thu', hours: 7, quality: 7 },
  { name: 'Fri', hours: 6, quality: 5 },
  { name: 'Sat', hours: 9, quality: 9 },
  { name: 'Sun', hours: 8, quality: 8 },
];

const SleepQuality: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Moon className="mr-2" /> Sleep Quality
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="hours" stackId="1" stroke="#8884d8" fill="#8884d8" name="Hours Slept" />
          <Area type="monotone" dataKey="quality" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Sleep Quality" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepQuality;