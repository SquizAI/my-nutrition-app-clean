import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeightChart: React.FC = () => {
  const [weightData, setWeightData] = useState([
    { date: '2023-01-01', weight: 70 },
    { date: '2023-01-08', weight: 69.5 },
    { date: '2023-01-15', weight: 69.2 },
    { date: '2023-01-22', weight: 68.8 },
    { date: '2023-01-29', weight: 68.5 },
    { date: '2023-02-05', weight: 68.3 },
  ]);

  const [newWeight, setNewWeight] = useState('');

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeight) {
      const today = new Date().toISOString().split('T')[0];
      setWeightData([...weightData, { date: today, weight: parseFloat(newWeight) }]);
      setNewWeight('');
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Weight Progress</h3>
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <form onSubmit={handleAddWeight} className="flex items-center">
        <input
          type="number"
          step="0.1"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          placeholder="Enter weight"
          className="flex-grow mr-2 px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Add Weight
        </button>
      </form>
    </div>
  );
};

export default WeightChart;