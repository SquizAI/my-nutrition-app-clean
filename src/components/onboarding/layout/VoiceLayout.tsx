import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../../styles/theme';
import { FaMicrophone, FaStop, FaInfoCircle, FaWaveSquare } from 'react-icons/fa';
import { AudioVisualizer } from '../../shared/AudioVisualizer';

const VoiceContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  margin: ${theme.spacing.lg} 0;
  position: relative;
  z-index: 2;
`;

const RecordingIndicator = styled(motion.div)`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: ${theme.colors.error};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSizes.sm};
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${theme.colors.error};
    border-radius: 50%;
  }
`;

const VoiceButton = styled(motion.button)<{ $isRecording?: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.$isRecording ? 
    'rgba(255, 77, 77, 0.2)' : 
    theme.colors.primary
  };
  border: 2px solid ${props => props.$isRecording ? 
    theme.colors.error : 
    theme.colors.primary
  };
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$isRecording ?
      'radial-gradient(circle, rgba(255,77,77,0.2) 0%, rgba(255,77,77,0) 70%)' :
      'radial-gradient(circle, rgba(49,229,255,0.2) 0%, rgba(49,229,255,0) 70%)'
    };
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: scale(1.05);
    
    &::before {
      opacity: 1;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 24px;
    color: ${props => props.$isRecording ?
      theme.colors.error :
      theme.colors.text.primary
    };
  }
`;

const InfoButton = styled(VoiceButton)`
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid ${theme.colors.border.default};
  
  &:hover:not(:disabled) {
    border-color: ${theme.colors.border.hover};
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    font-size: 18px;
  }
`;

const TranscriptContainer = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.xl};
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.large};
  margin-top: ${theme.spacing.md};
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const TranscriptText = styled(motion.div)`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.lg};
  font-family: inherit;
  line-height: 1.6;
  min-height: 100px;
  position: relative;

  &::after {
    content: '|';
    animation: blink 1s infinite;
    opacity: 1;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const VisualizerContainer = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  opacity: 0.3;
  pointer-events: none;
`;

const WaveformBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  svg {
    font-size: 120px;
    color: ${theme.colors.primary};
  }
`;

interface VoiceLayoutProps {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  audioStream: MediaStream | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTranscriptChange?: (text: string) => void;
  onInfoClick?: () => void;
  infoText?: string;
  className?: string;
}

export const VoiceLayout: React.FC<VoiceLayoutProps> = ({
  isRecording,
  isProcessing,
  transcript,
  audioStream,
  onStartRecording,
  onStopRecording,
  onTranscriptChange,
  onInfoClick,
  infoText,
  className
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (transcript && transcript !== displayText) {
      setIsTyping(true);
      let currentIndex = 0;
      
      const typeText = () => {
        if (currentIndex <= transcript.length) {
          setDisplayText(transcript.slice(0, currentIndex));
          currentIndex++;
          timeoutRef.current = setTimeout(typeText, 30);
        } else {
          setIsTyping(false);
        }
      };

      typeText();
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [transcript]);

  return (
    <VoiceContainer
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <ControlsContainer>
        {isRecording && (
          <RecordingIndicator
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            Recording...
          </RecordingIndicator>
        )}
        
        <VoiceButton
          $isRecording={isRecording}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isProcessing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isRecording ? {
            scale: [1, 1.1, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
            }
          } : {}}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
        </VoiceButton>

        {infoText && (
          <InfoButton
            onClick={onInfoClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaInfoCircle />
          </InfoButton>
        )}
      </ControlsContainer>

      <AnimatePresence>
        {(isRecording || transcript) && (
          <TranscriptContainer
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <WaveformBackground>
              <FaWaveSquare />
            </WaveformBackground>
            
            <TranscriptText
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {displayText}
            </TranscriptText>

            {isRecording && audioStream && (
              <VisualizerContainer
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
              >
                <AudioVisualizer
                  stream={audioStream}
                  isRecording={isRecording}
                />
              </VisualizerContainer>
            )}
          </TranscriptContainer>
        )}
      </AnimatePresence>
    </VoiceContainer>
  );
}; 