import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from 'react-grid-layout';
import { useUserPreferences } from '../services/userPreferences';
import { useAIAgents } from '../services/aiAgents';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import CalorieCard from '../components/dashboard/CalorieCard';
import ProgressCard from '../components/dashboard/ProgressCard';
import MealCard from '../components/dashboard/MealCard';
import TDEECalculator from '../components/TDEECalculator';
import { MealPlan } from '../components/MealPlan';
import LogViewer from '../components/dashboard/LogViewer';
import { Settings, Sparkles } from 'lucide-react';
import type { DashboardComponent } from '../services/userPreferences';
import { useMacroCalculator } from '../services/macroCalculator';
import { useMealGenerator } from '../services/mealGenerator';
import { useNutrition } from '../services/nutritionService';
import AdvancedOnboarding from '../components/onboarding/AdvancedOnboarding';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 20px;
  color: white;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const DashboardTitle = styled.h1`
  font-size: 28px;
  background: linear-gradient(135deg, #31E5FF 0%, #9747FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const DashboardControls = styled.div`
  display: flex;
  gap: 15px;
`;

const ControlButton = styled(motion.button)`
  padding: 10px 20px;
  border-radius: 8px;
  background: rgba(49, 229, 255, 0.1);
  border: 1px solid rgba(49, 229, 255, 0.2);
  color: #31E5FF;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(49, 229, 255, 0.2);
  }
`;

const Button = styled(motion.button)`
  background: rgba(129, 230, 217, 0.1);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  color: #81e6d9;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(129, 230, 217, 0.2);
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-areas:
    "calories meals"
    "tdee mealplan"
    "logs logs";
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  padding: 24px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
`;

const GridItem = styled.div<{ $gridArea: string }>`
  grid-area: ${({ $gridArea }) => $gridArea};
  min-height: 300px;
`;

const DashboardCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(49, 229, 255, 0.1);
  padding: 20px;
  height: 100%;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  &:hover {
    border-color: rgba(49, 229, 255, 0.3);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #31E5FF;
`;

const CardControls = styled.div`
  display: flex;
  gap: 8px;
`;

const CardButton = styled(motion.button)`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  font-size: 16px;

  &:hover {
    color: #31E5FF;
  }
`;

const OnboardingButton = styled(motion.button)`
  padding: 10px 20px;
  background: linear-gradient(135deg, #31E5FF 0%, #9747FF 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    opacity: 0.9;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const OnboardingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const defaultLayout: DashboardComponent[] = [
  {
    id: 'calories',
    type: 'calories',
    gridArea: 'calories',
    position: { x: 0, y: 0 },
    size: { width: 2, height: 2 },
    visible: true
  },
  {
    id: 'meals',
    type: 'meals',
    gridArea: 'meals',
    position: { x: 2, y: 0 },
    size: { width: 2, height: 2 },
    visible: true
  },
  {
    id: 'tdee',
    type: 'tdee',
    gridArea: 'tdee',
    position: { x: 0, y: 2 },
    size: { width: 2, height: 3 },
    visible: true
  },
  {
    id: 'mealplan',
    type: 'mealplan',
    gridArea: 'mealplan',
    position: { x: 2, y: 2 },
    size: { width: 2, height: 3 },
    visible: true
  },
  {
    id: 'logs',
    type: 'logs',
    gridArea: 'logs',
    position: { x: 0, y: 5 },
    size: { width: 4, height: 3 },
    visible: true
  }
];

const Dashboard: React.FC = () => {
  const { updateDashboardLayout } = useUserPreferences();
  const { macros } = useMacroCalculator();
  const { currentPlan } = useMealGenerator();
  const [layout, setLayout] = useState<DashboardComponent[]>(defaultLayout);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    updateDashboardLayout(defaultLayout);
  }, []);

  const handleLayoutChange = (newLayout: DashboardComponent[]) => {
    setLayout(newLayout);
    updateDashboardLayout(newLayout);
  };

  const renderComponent = (component: DashboardComponent) => {
    switch (component.type) {
      case 'calories':
        return (
          <DashboardCard>
            <CardHeader>
              <CardTitle>Calories Today</CardTitle>
              <CardControls>
                <CardButton whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  ⚙️
                </CardButton>
              </CardControls>
            </CardHeader>
            <CalorieCard
              currentCalories={macros?.targetCalories || 0}
              goalCalories={macros?.targetCalories || 0}
              macros={{
                protein: macros?.protein || 0,
                carbs: macros?.carbs || 0,
                fat: macros?.fats || 0,
              }}
            />
          </DashboardCard>
        );

      case 'meals':
        return (
          <DashboardCard>
            <CardHeader>
              <CardTitle>Today's Meals</CardTitle>
              <CardControls>
                <CardButton
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {/* TODO: Implement add meal dialog */}}
                >
                  ➕
                </CardButton>
              </CardControls>
            </CardHeader>
            {currentPlan ? (
              <MealCard
                meals={currentPlan.meals}
                onAddMeal={(type) => {
                  console.log('Add meal:', type);
                  // TODO: Implement add meal functionality
                }}
                onEditMeal={(meal) => {
                  console.log('Edit meal:', meal);
                  // TODO: Implement edit meal functionality
                }}
                onDeleteMeal={(meal) => {
                  console.log('Delete meal:', meal);
                  // TODO: Implement delete meal functionality
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>No meal plan generated yet.</p>
                <p>Use the TDEE Calculator to get started.</p>
              </div>
            )}
          </DashboardCard>
        );

      case 'tdee':
        return (
          <DashboardCard>
            <CardHeader>
              <CardTitle>TDEE Calculator</CardTitle>
            </CardHeader>
            <TDEECalculator />
          </DashboardCard>
        );

      case 'mealplan':
        return (
          <DashboardCard>
            <CardHeader>
              <CardTitle>Meal Plan</CardTitle>
            </CardHeader>
            <MealPlan />
          </DashboardCard>
        );

      case 'logs':
        return (
          <DashboardCard>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <LogViewer />
          </DashboardCard>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Dashboard</DashboardTitle>
        <DashboardControls>
          <OnboardingButton
            onClick={() => setShowOnboarding(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles /> Start Onboarding
          </OnboardingButton>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {/* TODO: Implement settings */}}
          >
            <Settings size={20} />
          </Button>
        </DashboardControls>
      </DashboardHeader>

      <DashboardGrid>
        {layout.map((component) => (
          <GridItem
            key={component.id}
            $gridArea={component.gridArea}
          >
            {renderComponent(component)}
          </GridItem>
        ))}
      </DashboardGrid>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdvancedOnboarding />
          </OnboardingOverlay>
        )}
      </AnimatePresence>
    </DashboardContainer>
  );
};

export default Dashboard;