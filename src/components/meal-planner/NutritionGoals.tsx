import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Loader, UserPlus, TrendingUp, Activity } from 'lucide-react';
import { getNutritionAdvice } from '../../services/aiService';

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
}

interface ProgressData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const NutritionGoals: React.FC = () => {
  const [goals, setGoals] = useState<NutritionGoals>({
    calories: 2000,
    protein: 30,
    carbs: 50,
    fat: 20,
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 30,
    gender: 'other',
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);

  useEffect(() => {
    generateNutritionGoals();
    loadProgressData();
  }, [userProfile]);

  const generateNutritionGoals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const schema = {
        type: "object",
        properties: {
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fat: { type: "number" }
        },
        required: ["calories", "protein", "carbs", "fat"]
      };

      const response = await getNutritionAdvice(
        `Suggest optimal nutrition goals for a ${userProfile.age} year old ${userProfile.gender} with height ${userProfile.height}cm, weight ${userProfile.weight}kg, and ${userProfile.activityLevel} activity level. Include daily calories and macronutrient percentages.`,
        schema
      );
      
      setGoals(response);
    } catch (error) {
      console.error('Error generating nutrition goals:', error);
      setError('Failed to generate nutrition goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGoals({ ...goals, [name]: parseInt(value) });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile({ ...userProfile, [name]: value });
  };

  const loadProgressData = () => {
    // In a real app, this would load from a database or API
    const sampleData: ProgressData[] = [
      { date: '2023-05-01', calories: 1950, protein: 28, carbs: 52, fat: 20 },
      { date: '2023-05-02', calories: 2100, protein: 32, carbs: 48, fat: 20 },
      { date: '2023-05-03', calories: 2000, protein: 30, carbs: 50, fat: 20 },
      { date: '2023-05-04', calories: 2050, protein: 31, carbs: 49, fat: 20 },
      { date: '2023-05-05', calories: 1900, protein: 29, carbs: 51, fat: 20 },
    ];
    setProgressData(sampleData);
  };

  const connectDevice = async () => {
    // Simulating device connection
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setConnectedDevices([...connectedDevices, 'Fitness Tracker XYZ']);
    } catch (error) {
      setError('Failed to connect device. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const data = [
    { name: 'Protein', value: goals.protein },
    { name: 'Carbs', value: goals.carbs },
    { name: 'Fat', value: goals.fat },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">AI-Suggested Nutrition Goals</h3>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin text-blue-500" size={24} />
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Your Goals</h4>
            <div className="mb-4">
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Daily Calories</label>
              <input
                type="number"
                name="calories"
                id="calories"
                value={goals.calories}
                onChange={handleGoalChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {Object.entries(goals).filter(([key]) => key !== 'calories').map(([key, value]) => (
              <div key={key} className="mb-4">
                <label htmlFor={key} className="block text-sm font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)} (%)</label>
                <input
                  type="number"
                  name={key}
                  id={key}
                  value={value}
                  onChange={handleGoalChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            ))}
            <button
              onClick={() => setShowProfileForm(!showProfileForm)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center"
            >
              <UserPlus className="mr-2" size={20} />
              {showProfileForm ? 'Hide Profile Form' : 'Update Profile'}
            </button>
            {showProfileForm && (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={userProfile.age}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    id="gender"
                    value={userProfile.gender}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    id="height"
                    value={userProfile.height}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    id="weight"
                    value={userProfile.weight}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">Activity Level</label>
                  <select
                    name="activityLevel"
                    id="activityLevel"
                    value={userProfile.activityLevel}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very active">Very Active</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Macronutrient Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <h4 className="text-md font-medium text-gray-700 mt-6 mb-2">Progress Tracking</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calories" stroke="#8884d8" />
                  <Line type="monotone" dataKey="protein" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="carbs" stroke="#ffc658" />
                  <Line type="monotone" dataKey="fat" stroke="#ff7300" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-700 mb-2">Connected Devices</h4>
        {connectedDevices.length > 0 ? (
          <ul className="list-disc list-inside">
            {connectedDevices.map((device, index) => (
              <li key={index}>{device}</li>
            ))}
          </ul>
        ) : (
          <p>No devices connected</p>
        )}
        <button
          onClick={connectDevice}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
        >
          <Activity className="mr-2" size={20} />
          Connect Fitness Tracker
        </button>
      </div>
      <button
        onClick={generateNutritionGoals}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
      >
        <TrendingUp className="mr-2" size={20} />
        Regenerate Goals
      </button>
    </div>
  );
};

export default NutritionGoals;