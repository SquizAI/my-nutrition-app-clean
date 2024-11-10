import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Clock } from 'lucide-react';

interface WorkoutData {
  date: string;
  duration: number;
  intensity: number;
  caloriesBurned: number;
}

const WorkoutAnalysis: React.FC = () => {
  const [workoutData, setWorkoutData] = useState<WorkoutData[]>([]);
  const [averageDuration, setAverageDuration] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchData = async () => {
      // In a real app, this would be an API call
      const data: WorkoutData[] = [
        { date: '2023-05-01', duration: 30, intensity: 7, caloriesBurned: 250 },
        { date: '2023-05-03', duration: 45, intensity: 8, caloriesBurned: 400 },
        { date: '2023-05-05', duration: 60, intensity: 6, caloriesBurned: 450 },
        { date: '2023-05-07', duration: 40, intensity: 9, caloriesBurned: 380 },
        { date: '2023-05-09', duration: 50, intensity: 7, caloriesBurned: 420 },
      ];
      setWorkoutData(data);

      // Calculate average duration and total calories burned
      const avgDuration = data.reduce((sum, workout) => sum + workout.duration, 0) / data.length;
      setAverageDuration(Math.round(avgDuration));

      const totalCalories = data.reduce((sum, workout) => sum + workout.caloriesBurned, 0);
      setTotalCaloriesBurned(totalCalories);
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Workout Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg flex items-center">
          <Clock className="mr-2 text-blue-500" />
          <div>
            <p className="text-sm text-blue-600">Average Duration</p>
            <p className="text-2xl font-bold text-blue-800">{averageDuration} minutes</p>
          </div>
        </div>
        <div className="bg-green-100 p-4 rounded-lg flex items-center">
          <Activity className="mr-2 text-green-500" />
          <div>
            <p className="text-sm text-green-600">Total Calories Burned</p>
            <p className="text-2xl font-bold text-green-800">{totalCaloriesBurned} kcal</p>
          </div>
        </div>
      </div>
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={workoutData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="duration" stroke="#8884d8" name="Duration (min)" />
            <Line yAxisId="right" type="monotone" dataKey="intensity" stroke="#82ca9d" name="Intensity" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-sm text-gray-600">
        <p className="flex items-center">
          <TrendingUp className="mr-2 text-green-500" />
          Your workout intensity has been increasing. Keep up the good work!
        </p>
      </div>
    </div>
  );
};

export default WorkoutAnalysis;