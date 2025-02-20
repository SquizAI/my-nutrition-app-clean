import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../../styles/theme';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import { 
  FaHeartbeat, 
  FaLungs, 
  FaBrain, 
  FaAllergies,
  FaStethoscope,
  FaPills,
  FaMicrophone,
  FaStop,
  FaCheck,
  FaInfoCircle,
  FaTimes,
  FaPlus,
  FaArrowRight,
  FaWeight,
  FaRunning,
  FaAppleAlt,
  FaUserMd,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaHistory,
  FaClipboardCheck
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { parseOnboardingResponse } from '../../../services/openaiService';
import { HeartVisualization } from '../visualizations/HeartVisualization';

// Styled components (reuse existing styles)
const Container = styled(motion.div)`
  max-width: 1000px;
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

const ConditionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.xl} 0;
`;

const ConditionButton = styled(motion.button)<{ $selected?: boolean }>`
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
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;

  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    background: rgba(49, 229, 255, 0.05);
    transform: translateY(-2px);
  }

  svg {
    font-size: 20px;
    color: ${props => props.$selected ? theme.colors.primary : theme.colors.text.primary};
  }
`;

const DetailSection = styled(motion.div)`
  margin-top: ${theme.spacing.xl};
  padding: ${theme.spacing.xl};
  background: rgba(0, 0, 0, 0.2);
  border-radius: ${theme.borderRadius.large};
  border: 1px solid ${theme.colors.border.default};
`;

const QuestionGroup = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Label = styled.label`
  display: block;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  margin-bottom: ${theme.spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  margin-bottom: ${theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  resize: vertical;
  margin-bottom: ${theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
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

  &:hover {
    background: ${theme.colors.button.hover};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface VoiceToggleProps {
  $isEnabled: boolean;
}

const VoiceToggle = styled(motion.button)<VoiceToggleProps>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${props => props.$isEnabled ? theme.colors.error : theme.colors.button.background};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSizes.md};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${props => props.$isEnabled ? 
      'rgba(255, 71, 71, 0.4)' : 
      theme.colors.button.hover
    };
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TranscriptContainer = styled(motion.div)`
  margin-top: ${theme.spacing.xl};
  padding: ${theme.spacing.xl};
  background: rgba(0, 0, 0, 0.2);
  border-radius: ${theme.borderRadius.large};
  border: 1px solid ${theme.colors.border.default};
`;

const VisualizationContainer = styled(motion.div)`
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  width: 300px;
  height: 300px;
  pointer-events: none;
  z-index: 1000;
`;

// Define medical conditions
const MEDICAL_CONDITIONS = [
  {
    id: 'hypertension',
    name: 'Hypertension',
    description: 'High blood pressure',
    icon: FaHeartbeat,
    questions: [
      { id: 'diagnosis_date', label: 'When were you diagnosed?', type: 'date' },
      { id: 'medication', label: 'Current medications', type: 'text' },
      { id: 'bp_readings', label: 'Recent blood pressure readings', type: 'text' }
    ]
  },
  {
    id: 'diabetes',
    name: 'Diabetes',
    description: 'Type 1 or Type 2',
    icon: FaPills,
    questions: [
      { id: 'type', label: 'Type of diabetes', type: 'select', options: ['Type 1', 'Type 2'] },
      { id: 'diagnosis_date', label: 'Diagnosis date', type: 'date' },
      { id: 'a1c', label: 'Latest A1C reading', type: 'text' }
    ]
  },
  {
    id: 'respiratory',
    name: 'Respiratory Condition',
    description: 'Asthma, COPD, etc.',
    icon: FaLungs,
    questions: [
      { id: 'condition', label: 'Specific condition', type: 'text' },
      { id: 'triggers', label: 'Known triggers', type: 'text' },
      { id: 'frequency', label: 'Frequency of symptoms', type: 'text' }
    ]
  },
  {
    id: 'heart',
    name: 'Heart Condition',
    description: 'Cardiovascular issues',
    icon: FaHeartbeat,
    questions: [
      { id: 'condition', label: 'Specific condition', type: 'text' },
      { id: 'procedures', label: 'Past procedures', type: 'text' },
      { id: 'medication', label: 'Current medications', type: 'text' }
    ]
  },
  {
    id: 'thyroid',
    name: 'Thyroid Condition',
    description: 'Hyper/Hypothyroidism',
    icon: FaStethoscope,
    questions: [
      { id: 'type', label: 'Type of condition', type: 'text' },
      { id: 'medication', label: 'Current medications', type: 'text' },
      { id: 'last_test', label: 'Last thyroid test date', type: 'date' }
    ]
  },
  {
    id: 'allergies',
    name: 'Severe Allergies',
    description: 'Food or environmental',
    icon: FaAllergies,
    questions: [
      { id: 'allergens', label: 'Known allergens', type: 'text' },
      { id: 'severity', label: 'Severity of reactions', type: 'text' },
      { id: 'epipen', label: 'Do you carry an EpiPen?', type: 'boolean' }
    ]
  }
];

// Additional health history questions
const HEALTH_HISTORY_QUESTIONS = [
  {
    id: 'family_history',
    label: 'Family Medical History',
    description: 'List any significant conditions in your immediate family',
    type: 'textarea'
  },
  {
    id: 'surgeries',
    label: 'Past Surgeries',
    description: 'Include dates and types of procedures',
    type: 'textarea'
  },
  {
    id: 'medications',
    label: 'Current Medications',
    description: 'Include dosage and frequency',
    type: 'textarea'
  },
  {
    id: 'supplements',
    label: 'Supplements',
    description: 'List any supplements you take regularly',
    type: 'textarea'
  },
  {
    id: 'allergies_intolerances',
    label: 'Allergies and Intolerances',
    description: 'Include both food and environmental',
    type: 'textarea'
  },
  {
    id: 'exercise_limitations',
    label: 'Exercise Limitations',
    description: 'Any physical limitations affecting exercise',
    type: 'textarea'
  }
];

export interface HealthHistoryResponses {
  conditions: Array<{
    id: string;
    details: Record<string, any>;
  }>;
  history: Record<string, string>;
}

interface HealthHistorySectionProps {
  onComplete: (responses: HealthHistoryResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<HealthHistoryResponses>;
}

export const HealthHistorySection: React.FC<HealthHistorySectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(
    new Set(initialResponses.conditions?.map(c => c.id) || [])
  );
  const [conditionDetails, setConditionDetails] = useState<Record<string, any>>(
    initialResponses.conditions?.reduce((acc, curr) => ({
      ...acc,
      [curr.id]: curr.details
    }), {}) || {}
  );
  const [historyResponses, setHistoryResponses] = useState<Record<string, string>>(
    initialResponses.history || {}
  );
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const processingRef = useRef(false);
  const activeQuestionRef = useRef<{ conditionId?: string; questionId?: string } | null>(null);

  const handleConditionSelect = useCallback((conditionId: string) => {
    setSelectedConditions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conditionId)) {
        newSet.delete(conditionId);
        // Clear condition details when unselecting
        setConditionDetails(prev => {
          const { [conditionId]: _, ...rest } = prev;
          return rest;
        });
      } else {
        newSet.add(conditionId);
      }
      return newSet;
    });
  }, []);

  const handleDetailChange = useCallback((conditionId: string, questionId: string, value: string) => {
    setConditionDetails(prev => ({
      ...prev,
      [conditionId]: {
        ...prev[conditionId],
        [questionId]: value
      }
    }));
  }, []);

  const handleHistoryChange = useCallback((questionId: string, value: string) => {
    setHistoryResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  }, []);

  const handleFocus = useCallback((conditionId?: string, questionId?: string) => {
    activeQuestionRef.current = { conditionId, questionId };
  }, []);

  const handleBlur = useCallback(() => {
    activeQuestionRef.current = null;
  }, []);

  const handleVoiceInput = useCallback(async (text: string, speak: (text: string) => void) => {
    try {
      const parsedResponse = await parseOnboardingResponse(text, 'health_history');
      const { intent, entities, details } = JSON.parse(parsedResponse);

      let handled = false;

      // Handle medical conditions
      if (entities.conditions?.length > 0) {
        entities.conditions.forEach((condition: { name: string; details?: Record<string, any> }) => {
          const matchedCondition = MEDICAL_CONDITIONS.find(c => 
            c.name.toLowerCase() === condition.name.toLowerCase()
          );
          if (matchedCondition) {
            handleConditionSelect(matchedCondition.id);
            if (condition.details) {
              setConditionDetails(prev => ({
                ...prev,
                [matchedCondition.id]: {
                  ...prev[matchedCondition.id],
                  ...condition.details
                }
              }));
            }
            handled = true;
          }
        });

        if (handled && voiceEnabled) {
          speak(`I've added ${entities.conditions.map((c: { name: string }) => c.name).join(' and ')} to your conditions.`);
        }
      }

      // Handle condition details
      if (activeQuestionRef.current && details) {
        const { conditionId, questionId } = activeQuestionRef.current;
        if (conditionId && questionId) {
          setConditionDetails(prev => ({
            ...prev,
            [conditionId]: {
              ...prev[conditionId],
              [questionId]: details
            }
          }));
          handled = true;
          if (voiceEnabled) {
            speak(`I've updated your response for that question.`);
          }
        }
      }

      // Handle health history
      if (intent === 'provide_health_history' && details) {
        Object.entries(details).forEach(([key, value]) => {
          const matchedQuestion = HEALTH_HISTORY_QUESTIONS.find(q => 
            q.id === key || q.label.toLowerCase().includes(key.toLowerCase())
          );
          if (matchedQuestion) {
            setHistoryResponses(prev => ({
              ...prev,
              [matchedQuestion.id]: String(value)
            }));
            handled = true;
          }
        });

        if (handled && voiceEnabled) {
          speak(`I've updated your health history information.`);
        }
      }

      if (!handled) {
        if (voiceEnabled) {
          speak("I heard you, but I'm not sure what information you're trying to provide. Could you try being more specific?");
        }
        toast.error('Could not understand the input. Please try being more specific.');
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast.error('Error processing voice input. Please try again.');
    }
  }, [voiceEnabled, handleConditionSelect]);

  const {
    isRecording,
    isProcessing,
    transcript,
    audioStream,
    startRecording,
    stopRecording,
    speak,
    hasPermission,
    requestPermissions
  } = useVoiceInteraction({
    onTranscriptionComplete: async (text) => {
      if (processingRef.current) return;
      processingRef.current = true;
      await handleVoiceInput(text, speak);
      processingRef.current = false;
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleComplete = useCallback(() => {
    const responses: HealthHistoryResponses = {
      conditions: Array.from(selectedConditions).map(id => ({
        id,
        details: conditionDetails[id] || {}
      })),
      history: historyResponses
    };
    onComplete(responses);
  }, [selectedConditions, conditionDetails, historyResponses, onComplete]);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <VisualizationContainer>
        <HeartVisualization
          isActive={isRecording}
          completionPercentage={
            (Array.from(selectedConditions).length / MEDICAL_CONDITIONS.length) * 100
          }
          pulseRate={isRecording ? 1.5 : 1}
        />
      </VisualizationContainer>

      <VoiceToggle 
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        $isEnabled={voiceEnabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
      </VoiceToggle>

      <Title>Health History</Title>

      <QuestionText>
        Select any medical conditions that apply to you:
      </QuestionText>

      <ConditionsGrid>
        {MEDICAL_CONDITIONS.map(condition => (
          <ConditionButton
            key={condition.id}
            $selected={selectedConditions.has(condition.id)}
            onClick={() => handleConditionSelect(condition.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <condition.icon />
            <div>
              <strong>{condition.name}</strong>
              <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{condition.description}</div>
            </div>
            {selectedConditions.has(condition.id) && <FaCheck style={{ marginLeft: 'auto' }} />}
          </ConditionButton>
        ))}
      </ConditionsGrid>

      <AnimatePresence>
        {Array.from(selectedConditions).map(conditionId => {
          const condition = MEDICAL_CONDITIONS.find(c => c.id === conditionId);
          if (!condition) return null;

          return (
            <DetailSection
              key={conditionId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 style={{ marginBottom: theme.spacing.lg }}>
                <condition.icon /> {condition.name} Details
              </h3>
              {condition.questions.map(question => (
                <QuestionGroup key={question.id}>
                  <Label>{question.label}</Label>
                  {question.type === 'text' || question.type === 'date' ? (
                    <Input
                      type={question.type}
                      value={conditionDetails[conditionId]?.[question.id] || ''}
                      onChange={(e) => handleDetailChange(conditionId, question.id, e.target.value)}
                      onFocus={() => handleFocus(conditionId, question.id)}
                      onBlur={handleBlur}
                      placeholder={`Enter ${question.label.toLowerCase()}`}
                    />
                  ) : question.type === 'select' ? (
                    <select
                      value={conditionDetails[conditionId]?.[question.id] || ''}
                      onChange={(e) => handleDetailChange(conditionId, question.id, e.target.value)}
                      onFocus={() => handleFocus(conditionId, question.id)}
                      onBlur={handleBlur}
                    >
                      <option value="">Select...</option>
                      {question.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : null}
                </QuestionGroup>
              ))}
            </DetailSection>
          );
        })}
      </AnimatePresence>

      <DetailSection
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
      >
        <h3 style={{ marginBottom: theme.spacing.lg }}>
          <FaHistory /> Additional Health History
        </h3>
        {HEALTH_HISTORY_QUESTIONS.map(question => (
          <QuestionGroup key={question.id}>
            <Label>{question.label}</Label>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
              {question.description}
            </p>
            <TextArea
              value={historyResponses[question.id] || ''}
              onChange={(e) => handleHistoryChange(question.id, e.target.value)}
              onFocus={() => handleFocus(undefined, question.id)}
              onBlur={handleBlur}
              placeholder={`Enter your ${question.label.toLowerCase()}...`}
            />
          </QuestionGroup>
        ))}
      </DetailSection>

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

        <Button
          onClick={() => {
            if (voiceEnabled) {
              speak('Please tell me about any medical conditions you have, or provide details for the selected conditions.');
            } else {
              toast.success('Voice feedback is disabled. Click "Enable Voice" to turn it on.');
            }
          }}
        >
          <FaInfoCircle /> Help
        </Button>

        <Button onClick={handleComplete}>
          <FaCheck /> Continue
        </Button>
      </ButtonGroup>

      {isRecording && audioStream && (
        <AudioVisualizer
          stream={audioStream}
          isRecording={isRecording}
        />
      )}

      {transcript && (
        <TranscriptContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>{transcript}</p>
        </TranscriptContainer>
      )}
    </Container>
  );
}; 