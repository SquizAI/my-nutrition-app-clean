import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { theme } from '../../../styles/theme';
import { 
  FaMicrophone, FaStop, FaCheck, FaArrowRight, FaInfoCircle, 
  FaHeartbeat, FaLungs, FaBrain, FaAllergies, FaStethoscope,
  FaPills, FaWeight, FaRunning, FaAppleAlt, FaUserMd, FaPlus
} from 'react-icons/fa';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import toast from 'react-hot-toast';
import { z } from 'zod';

// Styled components
const Container = styled(motion.div)`
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

const QuestionText = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.lg};
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.xl} 0;
`;

const OptionButton = styled(motion.button)<{ $selected?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${props => props.$selected ? 
    'rgba(49, 229, 255, 0.1)' : 
    'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.$selected ? 
    theme.colors.primary : 
    theme.colors.border.default
  };
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(49, 229, 255, 0.05);
    transform: translateY(-2px);
  }

  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
  justify-content: center;
  flex-wrap: wrap;
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

  &:hover {
    background: ${theme.colors.button.hover};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Add styled components for Other input
const OtherConditionInput = styled(motion.div)`
  margin-top: ${theme.spacing.md};
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

// Zod schema for medical conditions
export const MedicalConditionSchema = z.object({
  conditions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    diagnosed: z.boolean()
  })),
  requiresDietaryModifications: z.boolean(),
  hasRegularCheckups: z.boolean()
});

export type MedicalConditionResponses = z.infer<typeof MedicalConditionSchema>;

interface MedicalConditionSectionProps {
  onComplete: (responses: MedicalConditionResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<MedicalConditionResponses>;
}

// Define initial medical conditions
const INITIAL_CONDITIONS = [
  {
    id: 'hypertension',
    name: 'Hypertension',
    description: 'High blood pressure'
  },
  {
    id: 'diabetes',
    name: 'Diabetes',
    description: 'Type 1 or Type 2 diabetes'
  },
  {
    id: 'high_cholesterol',
    name: 'High Cholesterol',
    description: 'Elevated blood lipids'
  },
  {
    id: 'thyroid',
    name: 'Thyroid Condition',
    description: 'Thyroid disorders'
  }
];

export const MedicalConditionSection: React.FC<MedicalConditionSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(
    new Set(initialResponses.conditions?.map(c => c.id) || [])
  );

  const {
    isRecording,
    isProcessing,
    transcript,
    startRecording,
    stopRecording,
    speak,
    hasPermission,
  } = useVoiceInteraction({
    onTranscriptionComplete: (text) => {
      handleVoiceResponse(text);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handle condition selection
  const handleConditionSelect = (conditionId: string) => {
    const newSelected = new Set(selectedConditions);
    if (newSelected.has(conditionId)) {
      newSelected.delete(conditionId);
    } else {
      newSelected.add(conditionId);
    }
    setSelectedConditions(newSelected);
  };

  // Handle voice responses
  const handleVoiceResponse = useCallback((text: string) => {
    INITIAL_CONDITIONS.forEach(condition => {
      if (text.toLowerCase().includes(condition.name.toLowerCase())) {
        handleConditionSelect(condition.id);
      }
    });
  }, []);

  // Complete section
  const handleComplete = () => {
    const conditions = Array.from(selectedConditions).map(id => {
      const condition = INITIAL_CONDITIONS.find(c => c.id === id);
      return {
        id,
        name: condition?.name || '',
        diagnosed: true
      };
    });

    onComplete({
      conditions,
      requiresDietaryModifications: conditions.length > 0,
      hasRegularCheckups: true
    });
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Title>Medical Conditions</Title>
      
      <QuestionText>
        Do you have any medical conditions we should know about?
      </QuestionText>

      <OptionsGrid>
        {INITIAL_CONDITIONS.map(condition => (
          <OptionButton
            key={condition.id}
            $selected={selectedConditions.has(condition.id)}
            onClick={() => handleConditionSelect(condition.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {condition.name}
            {selectedConditions.has(condition.id) && <FaCheck />}
          </OptionButton>
        ))}
      </OptionsGrid>

      <ButtonGroup>
        <Button onClick={onPrevious}>
          Back
        </Button>
        
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
          {isRecording ? 'Stop' : 'Start'} Recording
        </Button>
      </ButtonGroup>
    </Container>
  );
}; 