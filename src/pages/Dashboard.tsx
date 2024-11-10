import React from 'react';
import CalorieBalance from '../components/dashboard/CalorieBalance';
import MacronutrientChart from '../components/dashboard/MacronutrientChart';
import NutrientAnalysis from '../components/dashboard/NutrientAnalysis';
import MoodEnergyTracker from '../components/dashboard/MoodEnergyTracker';
import SleepQuality from '../components/dashboard/SleepQuality';
import AIRecommendation from '../components/shared/AIRecommendation';
import FeatureCard from '../components/shared/FeatureCard';
import QuickActions from '../components/dashboard/QuickActions';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CalorieBalance className="lg:col-span-2" />
        <MacronutrientChart />
        <NutrientAnalysis className="lg:col-span-2" />
        <MoodEnergyTracker />
        <SleepQuality />
      </div>
      
      <AIRecommendation 
        title="AI-Powered Meal Suggestion"
        recommendation="Based on your nutritional goals and preferences, we recommend trying our new 'Quinoa and Grilled Chicken Bowl' recipe. It's high in protein and complex carbs, perfect for your current training regimen."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          icon="TrendingDown"
          title="Smart Calorie Adjustment"
          description="AI-driven calorie recommendations based on your activity level and weight goals."
        />
        <FeatureCard
          icon="Book"
          title="Personalized Learning"
          description="Tailored nutrition education modules based on your dietary preferences and health conditions."
        />
        <FeatureCard
          icon="Globe"
          title="Global Cuisine Explorer"
          description="Discover and integrate diverse, nutritious recipes from around the world into your meal plan."
        />
        <FeatureCard
          icon="Users"
          title="Peer Support Groups"
          description="Join AI-matched support groups with users who have similar goals and challenges."
        />
      </div>
      
      <QuickActions />
    </div>
  );
};

export default Dashboard;