import React, { useState, useRef } from 'react';
import OpenAI from 'openai';
import { File } from '@web-std/file';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ActionButton, OnboardingSection, OnboardingTitle, OnboardingDescription, TextArea, Select } from '../shared/StyledComponents';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface OnboardingStepProps {
  userResponses: Record<string, any>;
  handleResponse: (section: string, field: string, value: any) => void;
}

interface VoiceInputButtonProps {
  $isRecording: boolean;
  theme?: any;
}

const VoiceInputButton = styled(ActionButton)<VoiceInputButtonProps>`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  background: ${({ theme, $isRecording }) => 
    $isRecording ? `rgba(${theme.colors.error}, 0.2)` : theme.colors.button.background};
  border-color: ${({ theme, $isRecording }) => 
    $isRecording ? `rgba(${theme.colors.error}, 0.3)` : theme.colors.border.default};
  color: ${({ theme, $isRecording }) => 
    $isRecording ? theme.colors.error : theme.colors.text.primary};
`;

const VoiceInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const NutritionSection: React.FC<OnboardingStepProps> = ({ userResponses, handleResponse }) => {
  const [isRecordingWeekday, setIsRecordingWeekday] = useState(false);
  const [isRecordingWeekend, setIsRecordingWeekend] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [currentRecordingField, setCurrentRecordingField] = useState<'weekday' | 'weekend' | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);

  const startRecording = async (field: 'weekday' | 'weekend') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await processAudioToText(audioBlob, field);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setCurrentRecordingField(field);
      if (field === 'weekday') setIsRecordingWeekday(true);
      if (field === 'weekend') setIsRecordingWeekend(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setCurrentRecordingField(null);
      setIsRecordingWeekday(false);
      setIsRecordingWeekend(false);
    }
  };

  const processAudioToText = async (audioBlob: Blob, field: 'weekday' | 'weekend') => {
    try {
      const file = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
      
      const response = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
      });

      if (response.text) {
        handleResponse('nutrition', field, response.text);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  return (
    <OnboardingSection
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <OnboardingTitle>Food & Cooking</OnboardingTitle>
      <OnboardingDescription>
        Tell us about your eating habits and preferences. You can type or use voice input.
      </OnboardingDescription>
      
      <VoiceInputContainer>
        <TextArea
          placeholder="What does a typical weekday of eating look like for you?"
          value={userResponses.nutrition?.weekday || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
            handleResponse('nutrition', 'weekday', e.target.value)}
        />
        <VoiceInputButton
          $isRecording={isRecordingWeekday}
          onClick={() => isRecordingWeekday ? stopRecording() : startRecording('weekday')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRecordingWeekday ? '⏹️' : '🎤'}
        </VoiceInputButton>
      </VoiceInputContainer>

      <VoiceInputContainer>
        <TextArea
          placeholder="What does a typical weekend of eating look like for you?"
          value={userResponses.nutrition?.weekend || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
            handleResponse('nutrition', 'weekend', e.target.value)}
        />
        <VoiceInputButton
          $isRecording={isRecordingWeekend}
          onClick={() => isRecordingWeekend ? stopRecording() : startRecording('weekend')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRecordingWeekend ? '⏹️' : '🎤'}
        </VoiceInputButton>
      </VoiceInputContainer>

      <Select
        value={userResponses.nutrition?.cookingStyle || ''}
        onChange={(e) => handleResponse('nutrition', 'cookingStyle', e.target.value)}
      >
        <option value="">Preferred Cooking Style</option>
        <option value="simple">Simple & Fast</option>
        <option value="gourmet">Gourmet & Complex</option>
        <option value="balanced">Balanced</option>
      </Select>
    </OnboardingSection>
  );
}; 