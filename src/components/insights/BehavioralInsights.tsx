import React from 'react';
import { Brain } from 'lucide-react';

const BehavioralInsights: React.FC = () => {
  const insights = [
    "You tend to eat more on weekends. Try planning healthier weekend meals in advance.",
    "Your workouts are most consistent in the mornings. Consider scheduling important tasks for this time.",
    "Stress seems to trigger snacking. We recommend mindfulness exercises during high-stress periods.",
    "You're more likely to stick to your diet when meal prepping. Try to make this a weekly habit.",
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Brain className="mr-2" /> Behavioral Insights
      </h3>
      <ul className="list-disc list-inside space-y-2">
        {insights.map((insight, index) => (
          <li key={index} className="text-sm text-gray-600">{insight}</li>
        ))}
      </ul>
    </div>
  );
};

export default BehavioralInsights;