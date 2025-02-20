import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../../styles/theme';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import { textToHeight, textToWeight } from '../../../utils/unitConversion';
import { 
  FaRuler, 
  FaWeight, 
  FaMicrophone, 
  FaStop, 
  FaCheck,
  FaInfoCircle,
  FaArrowRight
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { openai, parseMeasurements } from '../../../services/openai';

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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.xl};
  margin: ${theme.spacing.xl} 0;
`;

const MetricCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border.default};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.hover};
    background: linear-gradient(135deg, rgba(49, 229, 255, 0.1) 0%, rgba(151, 71, 255, 0.1) 100%);
  }

  &:focus-within {
    border-color: ${theme.colors.primary};
    background: linear-gradient(135deg, rgba(49, 229, 255, 0.15) 0%, rgba(151, 71, 255, 0.15) 100%);
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};

  svg {
    font-size: 24px;
    color: ${theme.colors.primary};
  }
`;

const MetricTitle = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.lg};
  margin: 0;
`;

const InputGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  position: relative;
`;

const Input = styled.input`
  flex: 1;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: linear-gradient(135deg, rgba(49, 229, 255, 0.05) 0%, rgba(151, 71, 255, 0.05) 100%);
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: linear-gradient(135deg, rgba(49, 229, 255, 0.05) 0%, rgba(151, 71, 255, 0.05) 100%);
  }

  option {
    background: #1a1a1a;
  }
`;

const VoicePrompt = styled.div`
  text-align: center;
  margin: ${theme.spacing.xl} 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  margin-top: ${theme.spacing.xl};
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(49, 229, 255, 0.2) 0%, rgba(151, 71, 255, 0.2) 100%);
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSizes.md};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(49, 229, 255, 0.3) 0%, rgba(151, 71, 255, 0.3) 100%);
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

const TranscriptContainer = styled(motion.div)`
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
`;

interface VoiceToggleProps {
  isEnabled: boolean;
}

const VoiceToggle = styled(motion.button)<VoiceToggleProps>`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${props => props.isEnabled ? theme.colors.error : 'rgba(255, 255, 255, 0.1)'};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.isEnabled ? 
      'rgba(255, 71, 71, 0.4)' : 
      'rgba(255, 255, 255, 0.2)'
    };
  }
`;

export type HeightUnit = 'cm' | 'in';
export type WeightUnit = 'kg' | 'lbs';

export interface BaselineMetricsResponses {
  height: {
    value: number;
    unit: HeightUnit;
  };
  weight: {
    value: number;
    unit: WeightUnit;
  };
}

interface BaselineMetricsSectionProps {
  onComplete: (responses: BaselineMetricsResponses) => void;
  onPrevious: () => void;
  initialResponses?: Partial<BaselineMetricsResponses>;
}

export const BaselineMetricsSection: React.FC<BaselineMetricsSectionProps> = ({
  onComplete,
  onPrevious,
  initialResponses = {}
}) => {
  const [metrics, setMetrics] = useState<BaselineMetricsResponses>({
    height: { value: 0, unit: 'in' },
    weight: { value: 0, unit: 'lbs' },
    ...initialResponses
  } as BaselineMetricsResponses);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const processingRef = useRef(false);

  // Debug state changes
  useEffect(() => {
    const formattedMetrics = {
      height: {
        value: metrics.height.value,
        unit: metrics.height.unit,
        formatted: `${metrics.height.value} ${metrics.height.unit}`
      },
      weight: {
        value: metrics.weight.value,
        unit: metrics.weight.unit,
        formatted: `${metrics.weight.value} ${metrics.weight.unit}`
      },
      timestamp: new Date().toISOString(),
      isValid: metrics.height.value > 0 && metrics.weight.value > 0
    };

    console.log('Metrics State Update:', JSON.stringify(formattedMetrics, null, 2));
  }, [metrics]);

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
    onTranscriptionComplete: (text) => {
      console.log('Transcription received:', text);
      if (processingRef.current) return;
      processingRef.current = true;
      handleVoiceInput(text);
      processingRef.current = false;
    },
    onError: (error) => {
      console.error('Voice interaction error:', error);
      toast.error(error.message);
    }
  });

  const handleVoiceInput = useCallback(async (text: string) => {
    console.log('Processing voice input:', text);
    
    try {
      const result = await parseMeasurements(text);
      console.log('Parsed measurements:', result);

      if (result.confidence > 0.8) {
        setMetrics({
          height: {
            value: result.height.value,
            unit: result.height.unit as HeightUnit
          },
          weight: {
            value: result.weight.value,
            unit: result.weight.unit as WeightUnit
          }
        });

        if (voiceEnabled) {
          const heightStr = `${result.height.value} ${result.height.unit === 'in' ? 'inches' : 'centimeters'}`;
          const weightStr = `${result.weight.value} ${result.weight.unit === 'lbs' ? 'pounds' : 'kilograms'}`;
          speak(`I heard: height ${heightStr} and weight ${weightStr}. Is this correct?`);
        }
        toast.success('Measurements updated successfully');
      } else {
        toast.error('Could not understand measurements with high confidence. Please try again or enter manually.');
        if (voiceEnabled) {
          speak('I couldn\'t understand the measurements clearly. Please try saying something like "I am 5 feet 10 inches tall and weigh 150 pounds" or "170 centimeters and 70 kilograms"');
        }
      }
    } catch (error) {
      console.error('Error parsing measurements:', error);
      toast.error('Error processing measurements. Please try again or enter manually.');
    }
  }, [speak, voiceEnabled]);

  const handleInputChange = useCallback((
    type: 'height' | 'weight',
    field: 'value' | 'unit',
    value: string | number
  ) => {
    console.log('Input change:', { type, field, value });
    setMetrics(prev => {
      const newMetrics = { ...prev };
      if (field === 'value') {
        newMetrics[type].value = Number(value) || 0;
      } else if (field === 'unit') {
        if (type === 'height') {
          newMetrics.height.unit = value as HeightUnit;
        } else {
          newMetrics.weight.unit = value as WeightUnit;
        }
      }
      console.log('New metrics after input:', newMetrics);
      return newMetrics;
    });
  }, []);

  const handleComplete = useCallback(() => {
    if (metrics.height.value && metrics.weight.value) {
      onComplete(metrics as BaselineMetricsResponses);
    } else {
      toast.error('Please provide both height and weight');
    }
  }, [metrics, onComplete]);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <VoiceToggle 
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        isEnabled={voiceEnabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
      </VoiceToggle>

      <Title>Your Body Metrics</Title>

      <VoicePrompt>
        You can speak naturally, like "I am 5 feet 10 inches tall and weigh 150 pounds"
      </VoicePrompt>

      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <FaRuler />
            <MetricTitle>Height</MetricTitle>
          </MetricHeader>
          <InputGroup>
            <Input
              type="number"
              value={metrics.height.value === 0 ? '' : metrics.height.value}
              onChange={(e) => handleInputChange('height', 'value', e.target.value)}
              placeholder="Enter your height"
            />
            <Select
              value={metrics.height.unit}
              onChange={(e) => handleInputChange('height', 'unit', e.target.value as HeightUnit)}
            >
              <option value="in">Inches (in)</option>
              <option value="cm">Centimeters (cm)</option>
            </Select>
          </InputGroup>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <FaWeight />
            <MetricTitle>Weight</MetricTitle>
          </MetricHeader>
          <InputGroup>
            <Input
              type="number"
              value={metrics.weight.value === 0 ? '' : metrics.weight.value}
              onChange={(e) => handleInputChange('weight', 'value', e.target.value)}
              placeholder="Enter your weight"
            />
            <Select
              value={metrics.weight.unit}
              onChange={(e) => handleInputChange('weight', 'unit', e.target.value as WeightUnit)}
            >
              <option value="lbs">Pounds (lbs)</option>
              <option value="kg">Kilograms (kg)</option>
            </Select>
          </InputGroup>
        </MetricCard>
      </MetricsGrid>

      {!hasPermission ? (
        <ButtonGroup>
          <Button onClick={requestPermissions}>
            Enable Voice Features
          </Button>
        </ButtonGroup>
      ) : (
        <>
          <AudioVisualizer
            stream={audioStream}
            isRecording={isRecording}
          />

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
                  speak('Please tell me your height and weight');
                } else {
                  toast.success('Voice feedback is disabled. Click "Enable Voice" to turn it on.');
                }
              }}
            >
              <FaInfoCircle /> Help
            </Button>

            <Button
              onClick={handleComplete}
              disabled={!metrics.height.value || !metrics.weight.value}
            >
              <FaCheck /> Continue
            </Button>
          </ButtonGroup>

          {transcript && (
            <TranscriptContainer
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>{transcript}</p>
            </TranscriptContainer>
          )}
        </>
      )}
    </Container>
  );
}; 