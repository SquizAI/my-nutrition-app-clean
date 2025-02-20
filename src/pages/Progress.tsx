import React from 'react';
import styled from 'styled-components';
import WeightChart from '../components/progress/WeightChart';
import BodyMeasurements from '../components/progress/BodyMeasurements';
import NutrientIntakeChart from '../components/progress/NutrientIntakeChart';
import WorkoutProgress from '../components/progress/WorkoutProgress';
import GoalTracker from '../components/progress/GoalTracker';
import AIRecommendation from '../components/shared/AIRecommendation';

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
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Progress: React.FC = () => {
  return (
    <Container>
      <Title>Progress Tracking</Title>
      
      <Grid>
        <WeightChart />
        <BodyMeasurements />
      </Grid>
      
      <NutrientIntakeChart />
      
      <Grid>
        <WorkoutProgress />
        <GoalTracker />
      </Grid>
      
      <AIRecommendation 
        title="Progress Insight"
        recommendation="Your consistent workout routine is showing great results! Consider increasing your protein intake slightly to support muscle growth."
      />
    </Container>
  );
};

export default Progress;