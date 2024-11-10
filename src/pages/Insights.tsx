import React from 'react';
import NutritionAIAssistant from '../components/insights/NutritionAIAssistant';
import PersonalizedMealPlanner from '../components/insights/PersonalizedMealPlanner';
import HealthTrendAnalysis from '../components/insights/HealthTrendAnalysis';
import AIFitnessCoach from '../components/insights/AIFitnessCoach';
import NutrientOptimizer from '../components/insights/NutrientOptimizer';
import BehavioralInsights from '../components/insights/BehavioralInsights';

const Insights: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
      
      <NutritionAIAssistant />
      <PersonalizedMealPlanner />
      <HealthTrendAnalysis />
      <AIFitnessCoach />
      <NutrientOptimizer />
      <BehavioralInsights />
    </div>
  );
};

export default Insights;