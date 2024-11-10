import React from 'react';
import { Activity } from 'lucide-react';

const WorkoutProgress: React.FC = () => {
  const workouts = [
    { name: 'Running', duration: '30 min', calories: 300 },
    { name: 'Weight Training', duration: '45 min', calories: 200 },
    { name: 'Yoga', duration: '60 min', calories: 150 },
    { name: 'Cycling', duration: '40 min', calories: 350 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Activity className="mr-2" /> Workout Progress
      </h3>
      <div className="space-y-4">
        {workouts.map((workout, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="font-medium">{workout.name}</span>
            <div className="text-right">
              <span className="block text-sm text-gray-600">{workout.duration}</span>
              <span className="block text-sm text-gray-600">{workout.calories} kcal</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutProgress;