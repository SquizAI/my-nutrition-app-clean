import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { analyzeHealthTrends } from '../../services/aiService';

// This would typically come from a backend API
const mockData = [
  { date: '1/1', weight: 70, bodyFat: 20, muscle: 40 },
  { date: '2/1', weight: 69, bodyFat: 19, muscle: 41 },
  { date: '3/1', weight: 68, bodyFat: 18, muscle: 42 },
  { date: '4/1', weight: 67, bodyFat: 17, muscle: 43 },
  { date: '5/1', weight: 66, bodyFat: 16, muscle: 44 },
];

const HealthTrendAnalysis: React.FC = () => {
  const [data, setData] = useState(mockData);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    performAnalysis();
  }, []);

  const performAnalysis = async () => {
    setIsLoading(true);
    try {
      const aiAnalysis = await analyzeHealthTrends(data);
      setAnalysis(aiAnalysis);
    } catch (error) {
      console.error('Error analyzing health trends:', error);
      setAnalysis('Unable to perform analysis at this time.');
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <TrendingUp className="mr-2" /> Health Trend Analysis
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="weight" stroke="#8884d8" />
          <Line type="monotone" dataKey="bodyFat" stroke="#82ca9d" />
          <Line type="monotone" dataKey="muscle" stroke="#ffc658" />
        </LineChart>
      </ResponsiveContainer>
      {isLoading ? (
        <p className="mt-4 text-sm text-gray-600">Analyzing your health trends...</p>
      ) : (
        <p className="mt-4 text-sm text-gray-600">AI Analysis: {analysis}</p>
      )}
    </div>
  );
};

export default HealthTrendAnalysis;