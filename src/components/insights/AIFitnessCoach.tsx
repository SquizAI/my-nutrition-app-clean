import React from 'react';
import { Activity, Check } from 'lucide-react';

const AIFitnessCoach: React.FC = () => {
  const workouts = [
    { name: 'High-Intensity Interval Training', duration: '30 min', intensity: 'High' },
    { name: 'Strength Training: Lower Body', duration: '45 min', intensity: 'Medium' },
    { name: 'Yoga for Flexibility', duration: '60 min', intensity: 'Low' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Activity className="mr-2" /> AI Fitness Coach
      </h3>
      <p className="mb-4 text-sm text-gray-600">
        Based on your goals and recent activity, here are your recommended workouts for the week:
      </p>
      <div className="space-y-4">
        {workouts.map((workout, index) => (
          <div key={index} className="flex items-center bg-gray-100 p-3 rounded">
            <div className="mr-4">
              <Check className="text-green-500" />
            </div>
            <div>
              <h4 className="font-medium">{workout.name}</h4>
              <p className="text-sm text-gray-600">Duration: {workout.duration} | Intensity: {workout.intensity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIFitnessCoach;