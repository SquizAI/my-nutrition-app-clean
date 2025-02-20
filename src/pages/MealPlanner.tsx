import React from 'react';
import styled from 'styled-components';
import WeeklyPlanCalendar from '../components/meal-planner/WeeklyPlanCalendar';
import RecipeSearch from '../components/meal-planner/RecipeSearch';
import NutritionGoals from '../components/meal-planner/NutritionGoals';
import GroceryList from '../components/meal-planner/GroceryList';
import { MealPlanProvider } from '../services/mealPlanContext';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.gradient};
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  background: ${({ theme }) => theme.gradients.text.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const MealPlannerContent: React.FC = () => {
  return (
    <Container>
      <Title>AI-Powered Meal Planner</Title>
      
      <WeeklyPlanCalendar />
      
      <Grid>
        <Column>
          <RecipeSearch />
        </Column>
        <Column>
          <NutritionGoals />
          <GroceryList />
        </Column>
      </Grid>
    </Container>
  );
};

const MealPlanner: React.FC = () => {
  return (
    <MealPlanProvider>
      <MealPlannerContent />
    </MealPlanProvider>
  );
};

export default MealPlanner;