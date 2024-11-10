import React from 'react';
import { Target } from 'lucide-react';

const GoalTracker: React.FC = () => {
  const goals = [
    { name: 'Weight Loss', progress: 70, target: '5 kg' },
    { name: 'Workout Frequency', progress: 80, target: '4 times/week' },
    { name: 'Daily Steps', progress: 60, target: '10,000 steps' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Target className="mr-2" /> Goal Tracker
      </h3>
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span>{goal.name}</span>
              <span>{goal.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">Target: {goal.target}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalTracker;