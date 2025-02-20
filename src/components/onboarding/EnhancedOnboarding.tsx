import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { OnboardingOrchestrator } from './OnboardingOrchestrator';
import { theme } from '../../styles/theme';

// Full-screen background with debug styles
const Background = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${theme.colors.background.main};
  background-image: ${theme.colors.background.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
`;

const EnhancedOnboarding: React.FC = () => {
  return (
    <Background>
      <OnboardingOrchestrator />
    </Background>
  );
};

export default EnhancedOnboarding; 