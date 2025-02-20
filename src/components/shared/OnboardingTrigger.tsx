import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TriggerButton = styled(motion.button)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: ${({ theme }) => theme.gradients.primary};
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 24px;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  z-index: ${({ theme }) => theme.zIndex.modal - 1};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => `0 8px 20px rgba(49, 229, 255, 0.4)`};
  }
`;

export const OnboardingTrigger: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/onboarding');
  };

  return (
    <TriggerButton
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      🚀
    </TriggerButton>
  );
}; 