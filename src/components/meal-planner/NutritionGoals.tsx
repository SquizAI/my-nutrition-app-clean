import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Loader, UserPlus, TrendingUp, Activity, Target, Zap } from 'lucide-react';
import { getNutritionAdvice } from '../../services/aiService';
import { useMacroCalculator } from '../../services/macroCalculator';
import styled from 'styled-components';
import { motion } from 'framer-motion';

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

const Container = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const GoalCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.main};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const GoalLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const GoalValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.button.background};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow: hidden;
`;

interface ProgressFillProps {
  progress: number;
}

const ProgressFill = styled.div<ProgressFillProps>`
  height: 100%;
  width: ${({ progress }) => `${Math.min(progress, 100)}%`};
  background: ${({ theme }) => theme.gradients.primary};
  transition: width 0.3s ease;
`;

const MacroBreakdown = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const MacroTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MacroGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const MacroCard = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const MacroValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MacroLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

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
  const { macros } = useMacroCalculator();

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

  const dailyProgress = {
    calories: 1500,
    protein: 80,
    carbs: 150,
    fats: 50,
  };

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  return (
    <Container>
      <Title>
        <Target size={24} />
        Daily Nutrition Goals
      </Title>

      <GoalsGrid>
        <GoalCard whileHover={{ scale: 1.02 }}>
          <GoalLabel>
            <Zap size={16} />
            Calories
          </GoalLabel>
          <GoalValue>
            {dailyProgress.calories} / {macros?.targetCalories || 2000}
          </GoalValue>
          <ProgressBar>
            <ProgressFill 
              progress={calculateProgress(
                dailyProgress.calories, 
                macros?.targetCalories || 2000
              )} 
            />
          </ProgressBar>
        </GoalCard>

        <GoalCard whileHover={{ scale: 1.02 }}>
          <GoalLabel>
            <TrendingUp size={16} />
            Overall Progress
          </GoalLabel>
          <GoalValue>75%</GoalValue>
          <ProgressBar>
            <ProgressFill progress={75} />
          </ProgressBar>
        </GoalCard>
      </GoalsGrid>

      <MacroBreakdown>
        <MacroTitle>Macro Breakdown</MacroTitle>
        <MacroGrid>
          <MacroCard>
            <MacroValue>
              {dailyProgress.protein}g / {macros?.protein || 150}g
            </MacroValue>
            <MacroLabel>Protein</MacroLabel>
            <ProgressBar>
              <ProgressFill 
                progress={calculateProgress(
                  dailyProgress.protein, 
                  macros?.protein || 150
                )} 
              />
            </ProgressBar>
          </MacroCard>

          <MacroCard>
            <MacroValue>
              {dailyProgress.carbs}g / {macros?.carbs || 200}g
            </MacroValue>
            <MacroLabel>Carbs</MacroLabel>
            <ProgressBar>
              <ProgressFill 
                progress={calculateProgress(
                  dailyProgress.carbs, 
                  macros?.carbs || 200
                )} 
              />
            </ProgressBar>
          </MacroCard>

          <MacroCard>
            <MacroValue>
              {dailyProgress.fats}g / {macros?.fats || 65}g
            </MacroValue>
            <MacroLabel>Fats</MacroLabel>
            <ProgressBar>
              <ProgressFill 
                progress={calculateProgress(
                  dailyProgress.fats, 
                  macros?.fats || 65
                )} 
              />
            </ProgressBar>
          </MacroCard>
        </MacroGrid>
      </MacroBreakdown>

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
    </Container>
  );
};

export default NutritionGoals;