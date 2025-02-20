import React from 'react';
import styled from 'styled-components';
import ChallengeBoard from '../components/community/ChallengeBoard';
import ForumDiscussions from '../components/community/ForumDiscussions';
import SuccessStories from '../components/community/SuccessStories';
import LiveEvents from '../components/community/LiveEvents';
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

const Community: React.FC = () => {
  return (
    <Container>
      <Title>Community</Title>
      
      <Grid>
        <ChallengeBoard />
        <ForumDiscussions />
      </Grid>
      
      <SuccessStories />
      
      <LiveEvents />
      
      <AIRecommendation 
        title="Community Engagement"
        recommendation="Based on your goals, we think you'd enjoy the '30-Day Mindful Eating Challenge' starting next week. It aligns well with your current nutritional focus!"
      />
    </Container>
  );
};

export default Community;