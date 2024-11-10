import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Smile } from 'lucide-react';

const data = [
  { name: 'Mon', mood: 7, energy: 6 },
  { name: 'Tue', mood: 8, energy: 7 },
  { name: 'Wed', mood: 6, energy: 5 },
  { name: 'Thu', mood: 9, energy: 8 },
  { name: 'Fri', mood: 7, energy: 6 },
  { name: 'Sat', mood: 8, energy: 9 },
  { name: 'Sun', mood: 9, energy: 8 },
];

const MoodEnergyTracker: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Smile className="mr-2" /> Mood & Energy Tracker
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="mood" stroke="#8884d8" name="Mood" />
          <Line type="monotone" dataKey="energy" stroke="#82ca9d" name="Energy" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodEnergyTracker;