import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { mood: 'Happy', songs: 15 },
  { mood: 'Sad', songs: 10 },
  { mood: 'Energetic', songs: 20 },
  { mood: 'Calm', songs: 12 },
  { mood: 'Stressed', songs: 8 },
];

const MoodMusicCorrelation: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Mood & Music Correlation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mood" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="songs" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodMusicCorrelation;