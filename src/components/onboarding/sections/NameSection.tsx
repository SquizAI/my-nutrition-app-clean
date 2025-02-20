import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../../styles/theme';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { AudioVisualizer } from '../../shared/AudioVisualizer';
import { FaMicrophone, FaStop, FaCheck, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

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

const InputCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border.default};
  transition: all 0.3s ease;
  margin: ${theme.spacing.xl} 0;

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

const Label = styled.label`
  display: block;
  color: ${theme.colors.text.secondary};
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
  font-size: ${theme.typography.fontSizes.lg};
  margin-bottom: ${theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: linear-gradient(135deg, rgba(49, 229, 255, 0.05) 0%, rgba(151, 71, 255, 0.05) 100%);
  }
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

const VoicePrompt = styled.div`
  text-align: center;
  margin: ${theme.spacing.xl} 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.md};
`;

interface NameSectionProps {
  onComplete: (name: string) => void;
  initialName?: string;
}

export const NameSection: React.FC<NameSectionProps> = ({
  onComplete,
  initialName = ''
}) => {
  const [name, setName] = useState(initialName);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const processingRef = useRef(false);

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
      if (processingRef.current) return;
      processingRef.current = true;
      handleVoiceInput(text);
      processingRef.current = false;
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleVoiceInput = useCallback((text: string) => {
    // Try to extract name from common phrases
    const namePatterns = [
      /my name is (.+)/i,
      /i am (.+)/i,
      /i'm (.+)/i,
      /call me (.+)/i,
      /(.+) is my name/i
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        const extractedName = match[1].trim();
        setName(extractedName);
        if (voiceEnabled) {
          speak(`Nice to meet you, ${extractedName}!`);
        }
        toast.success('Name updated successfully');
        return;
      }
    }

    // If no patterns match, just use the entire text
    const cleanName = text.trim();
    setName(cleanName);
    if (voiceEnabled) {
      speak(`I heard ${cleanName}, is that correct?`);
    }
    toast.success('Name updated');
  }, [speak, voiceEnabled]);

  const handleSubmit = useCallback(() => {
    if (name.trim()) {
      onComplete(name.trim());
    } else {
      toast.error('Please enter your name');
    }
  }, [name, onComplete]);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Title>What's Your Name?</Title>

      <VoicePrompt>
        {isRecording
          ? "I'm listening..."
          : "Click the microphone and say your name, or type it below"}
      </VoicePrompt>

      <InputCard>
        <Label htmlFor="name">Your Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          autoFocus
        />
      </InputCard>

      <ButtonGroup>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
          {isRecording ? 'Stop' : 'Start'} Recording
        </Button>

        <Button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {voiceEnabled ? 'Disable' : 'Enable'} Voice
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!name.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue <FaArrowRight />
        </Button>
      </ButtonGroup>

      {isRecording && audioStream && (
        <AudioVisualizer stream={audioStream} isRecording={isRecording} />
      )}

      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: theme.spacing.lg, textAlign: 'center' }}
        >
          <p>{transcript}</p>
        </motion.div>
      )}
    </Container>
  );
}; 