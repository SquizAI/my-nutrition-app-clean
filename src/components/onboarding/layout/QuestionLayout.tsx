import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../../styles/theme';

const Container = styled(motion.div)`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.card};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.card};
  backdrop-filter: ${theme.blur.card};
`;

const Title = styled(motion.h2)`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.xl};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
  background: ${theme.gradients.text.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Description = styled(motion.p)`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.md};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const ContentContainer = styled(motion.div)`
  margin: ${theme.spacing.xl} 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
  justify-content: center;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.button.background};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSizes.md};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover:not(:disabled) {
    background: ${theme.colors.button.hover};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 20px;
  }
`;

interface QuestionLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  showNextButton?: boolean;
  showPreviousButton?: boolean;
  nextButtonDisabled?: boolean;
  previousButtonDisabled?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
  className?: string;
}

export const QuestionLayout: React.FC<QuestionLayoutProps> = ({
  title,
  description,
  children,
  onNext,
  onPrevious,
  showNextButton = true,
  showPreviousButton = true,
  nextButtonDisabled = false,
  previousButtonDisabled = false,
  nextButtonText = 'Next',
  previousButtonText = 'Back',
  className
}) => {
  return (
    <Container
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Title
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {title}
      </Title>

      {description && (
        <Description
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {description}
        </Description>
      )}

      <AnimatePresence mode="wait">
        <ContentContainer
          key={title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {children}
        </ContentContainer>
      </AnimatePresence>

      <ButtonGroup>
        {showPreviousButton && (
          <Button
            onClick={onPrevious}
            disabled={previousButtonDisabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {previousButtonText}
          </Button>
        )}

        {showNextButton && (
          <Button
            onClick={onNext}
            disabled={nextButtonDisabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {nextButtonText}
          </Button>
        )}
      </ButtonGroup>
    </Container>
  );
}; 