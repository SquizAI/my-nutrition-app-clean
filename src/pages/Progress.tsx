import React from 'react';
import WeightChart from '../components/progress/WeightChart';
import BodyMeasurements from '../components/progress/BodyMeasurements';
import NutrientIntakeChart from '../components/progress/NutrientIntakeChart';
import WorkoutProgress from '../components/progress/WorkoutProgress';
import GoalTracker from '../components/progress/GoalTracker';
import AIRecommendation from '../components/shared/AIRecommendation';

const Progress: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeightChart />
        <BodyMeasurements />
      </div>
      
      <NutrientIntakeChart />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutProgress />
        <GoalTracker />
      </div>
      
      <AIRecommendation 
        title="Progress Insight"
        recommendation="Your consistent workout routine is showing great results! Consider increasing your protein intake slightly to support muscle growth."
      />
    </div>
  );
};

export default Progress;