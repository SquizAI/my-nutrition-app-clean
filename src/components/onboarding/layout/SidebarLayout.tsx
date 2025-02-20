import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../../styles/theme';

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled(motion.div)`
  width: 300px;
  height: 100vh;
  background: ${theme.colors.background.card};
  border-right: 1px solid ${theme.colors.border.default};
  padding: ${theme.spacing.lg};
  overflow-y: auto;
  position: sticky;
  top: 0;
  left: 0;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid ${theme.colors.border.default};
    position: relative;
  }
`;

const MainContent = styled.div`
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  padding: ${theme.spacing.xl};
  position: relative;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    height: auto;
    min-height: 0;
    flex: 1;
  }
`;

const ProgressList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ProgressItem = styled.li<{ $active?: boolean; $completed?: boolean }>`
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.medium};
  background: ${props => 
    props.$active 
      ? 'rgba(49, 229, 255, 0.1)'
      : props.$completed
      ? 'rgba(107, 255, 142, 0.1)'
      : 'transparent'
  };
  color: ${props =>
    props.$active
      ? theme.colors.primary
      : props.$completed
      ? theme.colors.success
      : theme.colors.text.secondary
  };
  border: 1px solid ${props =>
    props.$active
      ? theme.colors.primary
      : props.$completed
      ? theme.colors.success
      : 'transparent'
  };
  cursor: ${props => props.$completed ? 'pointer' : 'default'};
  transition: all 0.3s ease;

  &:hover {
    background: ${props =>
      props.$completed ? 'rgba(107, 255, 142, 0.2)' : props.$active ? 'rgba(49, 229, 255, 0.2)' : 'transparent'
    };
  }

  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    font-size: 20px;
  }
`;

interface SidebarLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  steps: Array<{
    id: string;
    title: string;
    icon: React.ComponentType;
    completed?: boolean;
  }>;
  onStepClick?: (index: number) => void;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  currentStep,
  steps,
  onStepClick
}) => {
  return (
    <Container>
      <Sidebar
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <ProgressList>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ProgressItem
                key={step.id}
                $active={currentStep === index}
                $completed={step.completed}
                onClick={() => step.completed && onStepClick?.(index)}
              >
                <Icon />
                {step.title}
              </ProgressItem>
            );
          })}
        </ProgressList>
      </Sidebar>
      <MainContent>
        {children}
      </MainContent>
    </Container>
  );
}; 