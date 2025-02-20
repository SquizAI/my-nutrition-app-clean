import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { onboardingSections } from '../../config/onboardingConfig';
import { theme } from '../../styles/theme';
import { LegalSection } from './sections/LegalSection';
import { NameSection } from './sections/NameSection';
import { Toaster } from 'react-hot-toast';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { HealthHistorySection } from './sections/HealthHistorySection';
import { BaselineMetricsSection } from './sections/BaselineMetricsSection';
import { useNavigate } from 'react-router-dom';
import { LifestyleSection } from './sections/LifestyleSection';
import { EatingSection } from './sections/EatingSection';
import { FitnessSection } from './sections/FitnessSection';
import { HydrationSleepSection } from './sections/HydrationSleepSection';
import { PersonalizationSection } from './sections/PersonalizationSection';
import { CookingPreferencesSection } from './sections/CookingPreferencesSection';
import { FoodCuisineSection } from './sections/FoodCuisineSection';
import { GroceryPreferencesSection } from './sections/GroceryPreferencesSection';
import { toast } from 'react-hot-toast';
import { LegalResponses } from './sections/LegalSection';
import { BaselineMetricsResponses } from './sections/BaselineMetricsSection';

const Container = styled(motion.div)`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.main};
  background-image: ${theme.colors.background.gradient};
`;

const ProgressContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 1000;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  background: ${theme.gradients.primary};
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const SectionIndicator = styled.div`
  position: fixed;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.sm};
  backdrop-filter: blur(10px);
`;

const KeyboardShortcutsOverlay = styled(motion.div)`
  position: fixed;
  bottom: ${theme.spacing.lg};
  left: 50%;
  transform: translateX(-50%);
  padding: ${theme.spacing.md};
  background: rgba(0, 0, 0, 0.8);
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.sm};
  display: flex;
  gap: ${theme.spacing.md};
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ShortcutKey = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.small};
  margin-right: ${theme.spacing.xs};
`;

const Title = styled.h1`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.xl};
  margin-bottom: ${theme.spacing.lg};
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.primary};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSizes.md};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.focus};
  }
`;

// Types
type Section = 
  | 'name'
  | 'legal' 
  | 'baseline' 
  | 'health' 
  | 'lifestyle' 
  | 'eating' 
  | 'cooking'
  | 'cuisine'
  | 'grocery'
  | 'fitness' 
  | 'hydration' 
  | 'personalization' 
  | 'complete';

interface OnboardingResponses {
  name?: string;
  legal?: LegalResponses;
  baseline?: BaselineMetricsResponses;
  health?: any;
  lifestyle?: any;
  eating?: any;
  cooking?: any;
  cuisine?: any;
  grocery?: any;
  fitness?: any;
  hydration?: any;
  personalization?: any;
}

// Define sections array at the top level
const ONBOARDING_SECTIONS: Section[] = [
  'name',
  'legal',
  'baseline',
  'health',
  'lifestyle',
  'eating',
  'cooking',
  'cuisine',
  'grocery',
  'fitness',
  'hydration',
  'personalization',
  'complete'
];

interface OnboardingProgress {
  currentSection: Section;
  responses: OnboardingResponses;
}

export const OnboardingOrchestrator: React.FC = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<Section>('name');
  const [responses, setResponses] = useState<OnboardingResponses>({});

  const handleLegalContinue = () => {
    // Save legal responses and move to next section
    setResponses(prev => ({
      ...prev,
      legal: {
        ...prev.legal,
        completedAt: new Date().toISOString()
      }
    }));
    
    // Move to the next section (baseline metrics)
    setCurrentSection('baseline');
    
    // Show success toast
    toast.success('Legal documents accepted! Moving to baseline metrics...');
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'name':
        return (
          <NameSection
            onComplete={(name: string) => {
              setResponses(prev => ({
                ...prev,
                name
              }));
              setCurrentSection('legal');
            }}
            initialName={responses.name}
          />
        );
      case 'legal':
        return (
          <LegalSection
            onComplete={(legalResponses: LegalResponses) => {
              setResponses(prev => ({
                ...prev,
                legal: legalResponses
              }));
              setCurrentSection('baseline');
            }}
            onContinue={handleLegalContinue}
            initialResponses={responses.legal}
          />
        );
      case 'baseline':
        return (
          <BaselineMetricsSection
            onComplete={(baselineResponses: BaselineMetricsResponses) => {
              setResponses(prev => ({
                ...prev,
                baseline: baselineResponses
              }));
              setCurrentSection('health');
            }}
            onPrevious={() => setCurrentSection('legal')}
            initialResponses={responses.baseline}
          />
        );
      case 'health':
        return (
          <HealthHistorySection
            onComplete={(responses) => {
              setResponses(prev => ({
                ...prev,
                health: responses
              }));
              setCurrentSection('lifestyle');
            }}
            onPrevious={() => setCurrentSection('baseline')}
            initialResponses={responses.health}
          />
        );
      case 'lifestyle':
        return (
          <LifestyleSection
            onComplete={(responses) => {
              setResponses(prev => ({
                ...prev,
                lifestyle: responses
              }));
              setCurrentSection('eating');
            }}
            onPrevious={() => setCurrentSection('health')}
            initialResponses={responses.lifestyle}
          />
        );
      case 'eating':
        return (
          <EatingSection
            onComplete={(responses) => {
              setResponses(prev => ({
                ...prev,
                eating: responses
              }));
              setCurrentSection('cooking');
            }}
            onPrevious={() => setCurrentSection('lifestyle')}
            initialResponses={responses.eating}
          />
        );
      case 'cooking':
        return (
          <CookingPreferencesSection
            onComplete={(responses) => {
              setResponses(prev => ({
                ...prev,
                cooking: responses
              }));
              setCurrentSection('cuisine');
            }}
            onPrevious={() => setCurrentSection('eating')}
            initialResponses={responses.cooking}
          />
        );
      case 'cuisine':
        return (
          <FoodCuisineSection
            onComplete={(responses) => {
              setResponses(prev => ({
                ...prev,
                cuisine: responses
              }));
              setCurrentSection('grocery');
            }}
            onPrevious={() => setCurrentSection('cooking')}
            initialResponses={responses.cuisine}
          />
        );
      case 'grocery':
        return (
          <GroceryPreferencesSection
            onComplete={(responses) => {
              setResponses(prev => ({
                ...prev,
                grocery: responses
              }));
              setCurrentSection('fitness');
            }}
            onPrevious={() => setCurrentSection('cuisine')}
            initialResponses={responses.grocery}
          />
        );
      case 'fitness':
        return (
          <FitnessSection
            onComplete={(responses) => {
              setResponses(prev => ({
                ...prev,
                fitness: responses
              }));
              setCurrentSection('hydration');
            }}
            onPrevious={() => setCurrentSection('grocery')}
            initialResponses={responses.fitness}
          />
        );
      case 'hydration':
        return (
          <HydrationSleepSection
            onComplete={(responses) => {
              setResponses(prev => ({
                ...prev,
                hydration: responses
              }));
              setCurrentSection('personalization');
            }}
            onPrevious={() => setCurrentSection('fitness')}
            initialResponses={responses.hydration}
          />
        );
      case 'personalization':
        return (
          <PersonalizationSection
            onComplete={(responses) => {
              setResponses(prev => ({
                ...prev,
                personalization: responses
              }));
              setCurrentSection('complete');
            }}
            onPrevious={() => setCurrentSection('hydration')}
            initialResponses={responses.personalization}
          />
        );
      case 'complete':
        handleCompletion();
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Title>All Set!</Title>
            <p>Thank you for completing the onboarding process.</p>
            <p>Redirecting you to the dashboard...</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const handleCompletion = () => {
    // Save all responses to localStorage or your backend
    localStorage.setItem('onboardingResponses', JSON.stringify(responses));
    localStorage.setItem('onboardingCompleted', 'true');
    // Navigate to the dashboard
    navigate('/');
  };

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    'enter': () => {
      // Confirm response
    },
    'backspace': () => {
      if (currentSection !== 'legal') {
        setCurrentSection(prev => ONBOARDING_SECTIONS[ONBOARDING_SECTIONS.indexOf(prev) - 1]);
      }
    },
    'escape': () => {
      // Cancel current action
    },
  });

  // Calculate progress percentage
  const calculateProgress = () => {
    const currentIndex = ONBOARDING_SECTIONS.indexOf(currentSection);
    return ((currentIndex + 1) / ONBOARDING_SECTIONS.length) * 100;
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      {/* Progress bar */}
      <ProgressContainer>
        <ProgressBar $progress={calculateProgress()} />
      </ProgressContainer>

      {/* Section indicator */}
      <SectionIndicator>
        Section {ONBOARDING_SECTIONS.indexOf(currentSection) + 1} of {ONBOARDING_SECTIONS.length}
      </SectionIndicator>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {renderSection()}
      </AnimatePresence>

      {/* Keyboard shortcuts overlay */}
      <KeyboardShortcutsOverlay
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <div>
          <ShortcutKey>↵</ShortcutKey>
          Confirm
        </div>
        <div>
          <ShortcutKey>⌫</ShortcutKey>
          Back
        </div>
        <div>
          <ShortcutKey>esc</ShortcutKey>
          Cancel
        </div>
      </KeyboardShortcutsOverlay>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </Container>
  );
}; 