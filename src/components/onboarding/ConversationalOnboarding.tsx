import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { transcribeAudio } from '../../services/deepgramService';
import { parseOnboardingResponse } from '../../services/openaiService';
import { theme } from '../../styles/theme';
import { FaMicrophone, FaStop, FaCheck, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const Container = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${theme.colors.background.card};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.card};
  backdrop-filter: ${theme.blur.card};
`;

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = styled.div<ProgressBarProps>`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-bottom: ${theme.spacing.xl};
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    height: 100%;
    background: ${theme.gradients.primary};
    transition: width 0.3s ease;
    width: ${props => props.progress}%;
  }
`;

const QuestionText = styled(motion.h2)`
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  background: ${theme.gradients.text.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Instructions = styled.p`
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSizes.md};
`;

interface RecordingButtonProps {
  isRecording: boolean;
}

const RecordingButton = styled(motion.button)<RecordingButtonProps>`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.round};
  border: none;
  background: ${props => props.isRecording ? theme.colors.error : theme.colors.primary};
  color: ${theme.colors.text.inverse};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${theme.transitions.default};
  box-shadow: ${theme.shadows.button};
  animation: ${props => props.isRecording ? pulseAnimation : 'none'} 2s infinite;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.hover};
  }

  svg {
    font-size: 24px;
  }
`;

const TranscriptContainer = styled(motion.div)`
  width: 100%;
  margin: ${theme.spacing.lg} 0;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
`;

const TranscriptTextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: ${theme.spacing.md};
  background: transparent;
  border: none;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${theme.colors.focus};
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.button.background};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.button.hover};
    transform: translateY(-2px);
  }

  svg {
    font-size: 18px;
  }
`;

const ResponseDisplay = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.success}10;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.success}30;
  margin: ${theme.spacing.md} 0;
  color: ${theme.colors.text.primary};
`;

// Define a question interface
interface Question {
  id: string;
  text: string;
}

// Sample questions for onboarding
const sampleQuestions: Question[] = [
  { id: 'name', text: 'What is your name?' },
  { id: 'age', text: 'How old are you?' },
  { id: 'diet', text: 'Do you have any dietary restrictions or preferences?' }
];

const ConversationalOnboarding: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const progress = ((currentQuestionIndex + 1) / sampleQuestions.length) * 100;

  // Function to handle starting the recording
  const startRecording = async () => {
    window.speechSynthesis.cancel();
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const text = await transcribeAudio(audioBlob);
          setTranscript(text);
        } catch (error) {
          console.error('Error processing audio:', error);
          // TODO: Add error toast notification
        } finally {
          setIsProcessing(false);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      // TODO: Add error toast notification
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Function to confirm the transcript answer and parse it via OpenAI
  const confirmAnswer = async () => {
    try {
      const parsedAnswer = await parseOnboardingResponse(transcript, sampleQuestions[currentQuestionIndex].id);
      setResponses((prev) => ({
        ...prev,
        [sampleQuestions[currentQuestionIndex].id]: parsedAnswer
      }));
    } catch (error) {
      console.error('Error confirming answer:', error);
    }
  };

  // Function to move to next question
  const nextQuestion = () => {
    setTranscript('');
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      console.log('Onboarding complete:', responses);
      // Finalize onboarding process here (e.g., send responses to server)
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ProgressBar progress={progress} />
      
      <QuestionText
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={currentQuestionIndex}
      >
        {sampleQuestions[currentQuestionIndex].text}
      </QuestionText>

      <Instructions>
        {isRecording 
          ? "I'm listening... Click stop when you're done speaking."
          : "Click the microphone button and start speaking when ready."}
      </Instructions>

      <RecordingButton
        isRecording={isRecording}
        onClick={isRecording ? stopRecording : startRecording}
        whileTap={{ scale: 0.95 }}
      >
        {isRecording ? <FaStop /> : <FaMicrophone />}
      </RecordingButton>

      <AnimatePresence>
        {transcript && (
          <TranscriptContainer
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3>Review your response:</h3>
            <TranscriptTextArea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your transcribed response will appear here..."
            />
            {!responses[sampleQuestions[currentQuestionIndex].id] && (
              <ActionButton
                onClick={confirmAnswer}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaCheck /> Confirm Answer
              </ActionButton>
            )}
          </TranscriptContainer>
        )}

        {responses[sampleQuestions[currentQuestionIndex].id] && (
          <ResponseDisplay
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>Confirmed Response:</h3>
            <p>{responses[sampleQuestions[currentQuestionIndex].id]}</p>
            <ActionButton
              onClick={nextQuestion}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Continue</span> <FaArrowRight />
            </ActionButton>
          </ResponseDisplay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default ConversationalOnboarding; 