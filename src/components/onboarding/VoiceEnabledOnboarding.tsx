import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { transcribeAudio } from '../../services/deepgramService';
import { parseOnboardingResponse } from '../../services/openaiService';

// Styled components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const QuestionText = styled.h2`
  margin-bottom: 16px;
  text-align: center;
`;

const ResponseDisplay = styled.p`
  font-size: 18px;
  color: #333;
  margin: 8px 0;
`;

const Button = styled.button`
  margin: 8px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #0070f3;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #005bb5;
  }
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

const VoiceEnabledOnboarding: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start recording audio from the user's microphone
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        try {
          // Transcribe audio using Deepgram
          const text = await transcribeAudio(audioBlob);
          setTranscript(text);
          // Parse the transcribed text with OpenAI
          const parsedAnswer = await parseOnboardingResponse(text, sampleQuestions[currentQuestionIndex].id);
          setResponses(prev => ({ ...prev, [sampleQuestions[currentQuestionIndex].id]: parsedAnswer }));
        } catch (error) {
          console.error('Error processing audio:', error);
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Move to the next question
  const nextQuestion = () => {
    setTranscript('');
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, finalize onboarding (e.g., send responses to server)
      console.log('Onboarding complete:', responses);
      // Here you might call a finalizeOnboarding() function to process all responses.
    }
  };

  return (
    <Container>
      <QuestionText>{sampleQuestions[currentQuestionIndex].text}</QuestionText>
      <div>
        {isRecording ? (
          <Button onClick={stopRecording}>Stop Recording</Button>
        ) : (
          <Button onClick={startRecording}>Start Recording</Button>
        )}
      </div>
      {transcript && (
        <div>
          <h3>Transcript:</h3>
          <ResponseDisplay>{transcript}</ResponseDisplay>
        </div>
      )}
      {responses[sampleQuestions[currentQuestionIndex].id] && (
        <div>
          <h3>Parsed Answer:</h3>
          <ResponseDisplay>{responses[sampleQuestions[currentQuestionIndex].id]}</ResponseDisplay>
        </div>
      )}
      <Button onClick={nextQuestion}>Next Question</Button>
    </Container>
  );
};

export default VoiceEnabledOnboarding; 