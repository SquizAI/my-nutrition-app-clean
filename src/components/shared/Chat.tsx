import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import OpenAI from 'openai';
import { File } from '@web-std/file';
import { Button } from './Button';
import { useUserPreferences, UserPreferences } from '../../services/userPreferences';
import { useAIAgents } from '../../services/aiAgents';
import type { Recommendation } from '../../services/aiAgents';
import { useToast } from './Toast';
import { useWeather } from '../../services/weatherService';
import AudioVisualizer from './AudioVisualizer';
import { useMacroCalculator, UserStats } from '../../services/macroCalculator';
import { NutritionSection } from '../onboarding/NutritionSection';
import { OnboardingStep as BaseOnboardingStep } from '../../types';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'voice' | 'quick-action' | 'suggestion';
  timestamp: Date;
  audioUrl?: string;
  metadata?: {
    actionType?: string;
    icon?: string;
    suggestion?: {
      type: 'meal' | 'workout' | 'habit';
      confidence: number;
      category: string;
    };
    voice?: {
      waveform?: number[];
      emotions?: { type: string; confidence: number }[];
    };
  };
}

interface ChatProps {
  onSendMessage: (message: string, audioBlob?: Blob, metadata?: any) => Promise<void>;
  messages: Message[];
  isLoading?: boolean;
  placeholder?: string;
}

interface BehaviorData {
  mealTimes: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  activities: {
    water: string[];
    workout: string[];
  };
}

interface SuggestionCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface Suggestion {
  content: string;
  icon: string;
  confidence: number;
  category: string;
}

interface AudioVisualizerProps {
  stream?: MediaStream;
  audioUrl?: string;
  waveform?: number[];
}

interface EmotionData {
  type: string;
  confidence: number;
}

interface ChatOnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'legal' | 'metrics' | 'health' | 'lifestyle' | 'nutrition' | 'preferences' | 'userType';
  component: React.ReactElement;
}

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

interface StyledActivityProps {
  $selected: boolean;
}

interface VoiceInputButtonProps {
  $isRecording: boolean;
  theme?: any;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const ChatContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 90vh;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &.expanded {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: ${({ theme }) => theme.zIndex.modal};
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
`;

const ChatHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.background.main};
  height: 60px;
  flex-shrink: 0;
`;

const ChatTitle = styled.h3`
  margin: 0;
  background: ${({ theme }) => theme.gradients.text.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`;

const HeaderControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const HeaderButton = styled(motion.button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  height: 100%;
  max-height: calc(100vh - 140px); // Subtract header and input heights
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.card};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.border.hover};
    }
  }
`;

const MessageBubble = styled(motion.div)<{ $isUser: boolean }>`
  max-width: 80%;
  align-self: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
  background: ${({ theme, $isUser }) =>
    $isUser ? theme.colors.primary : theme.colors.background.card};
  color: ${({ theme, $isUser }) =>
    $isUser ? '#000000' : theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ $isUser }) => 
    $isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px'};
  border: 1px solid ${({ theme, $isUser }) =>
    $isUser ? theme.colors.primary : theme.colors.border.default};
  position: relative;
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  line-height: 1.5;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const QuickActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(49, 229, 255, 0.1);
  border: 1px solid rgba(49, 229, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(49, 229, 255, 0.2);
    border-color: rgba(49, 229, 255, 0.3);
    transform: translateY(-2px);
  }

  svg {
    font-size: 20px;
  }
`;

const VoiceMessage = styled(MessageBubble)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AudioPlayerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const AudioPlayer = styled.audio`
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const ChatInput = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.main};
  position: relative;
  height: 80px;
  flex-shrink: 0;
`;

const Input = styled.textarea`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  backdrop-filter: blur(5px);
  resize: none;
  min-height: 24px;
  max-height: 120px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(49, 229, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const InputActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: flex-end;
`;

const ActionButton = styled(motion.button)`
  height: 44px;
  width: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  font-size: 20px;
  background: ${({ theme }) => theme.colors.button.background};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.button.hover};
    border-color: ${({ theme }) => theme.colors.border.hover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.recording {
    background: ${({ theme }) => `rgba(${theme.colors.error}, 0.2)`};
    border-color: ${({ theme }) => `rgba(${theme.colors.error}, 0.3)`};
    color: ${({ theme }) => theme.colors.error};

    &:hover {
      background: ${({ theme }) => `rgba(${theme.colors.error}, 0.3)`};
    }
  }

  &.primary {
    background: ${({ theme }) => theme.gradients.primary};
    border: none;
    color: white;

    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.button};
    }
  }
`;

const ActionFeedback = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(49, 229, 255, 0.2);
  border: 1px solid rgba(49, 229, 255, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  backdrop-filter: blur(10px);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const ActionIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ActionLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SuggestionsBar = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.sm};
  background: rgba(49, 229, 255, 0.1);
  border: 1px solid rgba(49, 229, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(49, 229, 255, 0.3);
    border-radius: 2px;
  }
`;

const SuggestionChip = styled(motion.button)<{ $confidence: number }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ $confidence }) => `rgba(49, 229, 255, ${0.1 + ($confidence * 0.2)})`};
  border: 1px solid rgba(49, 229, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background: rgba(49, 229, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
`;

const CategoryTab = styled(motion.button)<{ $isActive: boolean; $color: string }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ $isActive, $color }) => 
    $isActive ? `rgba(${$color}, 0.2)` : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${({ $isActive, $color }) => 
    $isActive ? `rgba(${$color}, 0.3)` : 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $color }) => `rgba(${$color}, 0.15)`};
    transform: translateY(-1px);
  }
`;

const WaveformContainer = styled.div`
  width: 100%;
  height: 60px;
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  position: relative;
  overflow: hidden;
`;

const WaveformCanvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

const EmotionTag = styled(motion.div)<{ $confidence: number }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ theme, $confidence }) => `rgba(49, 229, 255, ${$confidence})`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const OnboardingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.background.main};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
`;

const OnboardingContent = styled(motion.div)`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const OnboardingHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const OnboardingLogo = styled(motion.div)`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
`;

const OnboardingTitle = styled(motion.h2)`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`;

const OnboardingDescription = styled(motion.p)`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: ${({ theme }) => theme.spacing.xl} auto;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.button.background};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow: hidden;
`;

const Progress = styled(motion.div)<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => `${$progress}%`};
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const NavigationButton = styled(motion.button)`
  background: ${({ theme }) => theme.gradients.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  cursor: pointer;
  width: 100%;
  max-width: 300px;
  margin: ${({ theme }) => theme.spacing.xl} auto 0;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OnboardingSection = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  box-shadow: ${({ theme }) => theme.shadows.card};
  width: 100%;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const OptionButton = styled(motion.button)<{ $selected?: boolean }>`
  background: ${({ theme, $selected }) => 
    $selected ? theme.colors.button.hover : theme.colors.button.background};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme, $selected }) => 
    $selected ? theme.colors.primary : theme.colors.border.default};
  cursor: pointer;
  width: 100%;
  text-align: left;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.button.hover};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const InputGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  label {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  }
`;

const OnboardingInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const UnitInput = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  
  input {
    flex: 1;
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSizes.sm};
    min-width: 40px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }

  option {
    background: ${({ theme }) => theme.colors.background.card};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const MultiSelectContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const MultiSelectOption = styled(OptionButton)`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange }) => {
  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(s => s !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  return (
    <MultiSelectContainer>
      {options.map(option => (
        <MultiSelectOption
          key={option}
          onClick={() => toggleOption(option)}
          $selected={selected.includes(option)}
        >
          {option}
        </MultiSelectOption>
      ))}
    </MultiSelectContainer>
  );
};

const HealthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.xl} 0;
`;

const HealthConditionButton = styled(motion.button)<{ $selected: boolean }>`
  background: ${({ theme, $selected }) => 
    $selected ? theme.gradients.primary : 'rgba(49, 229, 255, 0.1)'};
  color: ${({ theme, $selected }) => 
    $selected ? '#000' : theme.colors.text.primary};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme, $selected }) => 
    $selected ? 'transparent' : theme.colors.border.default};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $selected }) => 
      $selected ? theme.gradients.primary : 'rgba(49, 229, 255, 0.2)'};
    transform: translateY(-2px);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const HealthNotes = styled(TextArea)`
  margin-top: ${({ theme }) => theme.spacing.xl};
  min-height: 150px;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  line-height: 1.6;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  line-height: 1.6;
  font-style: italic;
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => theme.spacing.xl} 0;
`;

const ActivityCard = styled(motion.button)<{ $selected: boolean }>`
  background: ${({ theme, $selected }) => 
    $selected ? theme.gradients.primary : 'rgba(49, 229, 255, 0.05)'};
  color: ${({ theme, $selected }) => 
    $selected ? '#000' : theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  border: 1px solid ${({ theme, $selected }) => 
    $selected ? 'transparent' : theme.colors.border.default};
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $selected }) => 
      $selected ? theme.gradients.primary : 'rgba(49, 229, 255, 0.1)'};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const ActivityIcon = styled.div`
  font-size: 32px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ActivityTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  margin: 0;
`;

const ActivityDescription = styled.p<StyledActivityProps>`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: ${({ theme, $selected }) => 
    $selected ? 'rgba(0, 0, 0, 0.8)' : theme.colors.text.secondary};
  margin: 0;
  line-height: 1.6;
`;

const ExampleText = styled.div<StyledActivityProps>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme, $selected }) => 
    $selected ? 'rgba(0, 0, 0, 0.7)' : theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-style: italic;
`;

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

interface OnboardingStepProps {
  userResponses: Record<string, any>;
  handleResponse: (section: string, field: string, value: any) => void;
}

export const Chat: React.FC<ChatProps> = ({
  onSendMessage,
  messages,
  isLoading,
  placeholder = 'Type a message...'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActionFeedback, setShowActionFeedback] = useState<{ icon: string; label: string } | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [emotions, setEmotions] = useState<EmotionData[]>([]);
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const audioChunks = useRef<BlobPart[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { quickLogPreferences } = useUserPreferences();
  const { learningAgent, recommendationAgent } = useAIAgents();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { currentWeather, fetchWeather } = useWeather();
  const { setUserStats } = useMacroCalculator();
  const { updatePreferences } = useUserPreferences();

  const quickActions = [
    { id: 'breakfast', icon: '🍳', label: 'Breakfast', category: 'meal' },
    { id: 'lunch', icon: '🥪', label: 'Lunch', category: 'meal' },
    { id: 'dinner', icon: '🍽️', label: 'Dinner', category: 'meal' },
    { id: 'snacks', icon: '🍎', label: 'Snack', category: 'meal' },
    { id: 'workout', icon: '💪', label: 'Workout', category: 'activity' },
    { id: 'water', icon: '💧', label: 'Water', category: 'activity' },
    { id: 'mood', icon: '😊', label: 'Mood', category: 'wellness' },
    { id: 'sleep', icon: '😴', label: 'Sleep', category: 'wellness' },
    { id: 'meditation', icon: '🧘', label: 'Meditation', category: 'wellness' },
    ...quickLogPreferences.customShortcuts.map(shortcut => ({
      id: shortcut.name,
      icon: '⭐',
      label: shortcut.name,
      category: 'custom',
      action: shortcut.action
    }))
  ];

  const categories: SuggestionCategory[] = [
    { id: 'all', label: 'All', icon: '🌟', color: '49, 229, 255' },
    { id: 'meal', label: 'Meals', icon: '🍳', color: '255, 149, 0' },
    { id: 'activity', label: 'Activities', icon: '💪', color: '98, 255, 134' },
    { id: 'wellness', label: 'Wellness', icon: '🧘', color: '255, 126, 179' },
    { id: 'custom', label: 'Custom', icon: '⭐', color: '147, 155, 255' }
  ];

  const handleResponse = useCallback((section: string, field: string, value: any) => {
    setUserResponses(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
  }, []);

  const onboardingSteps: ChatOnboardingStep[] = [
    {
      id: 'userType',
      title: 'Select Your Experience',
      description: 'Choose between Basic onboarding (quick setup with essential features) or Advanced/Pro onboarding (full customization with voice integration and advanced features).',
      type: 'userType',
      component: (
        <OnboardingSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OnboardingTitle>Select Your Experience</OnboardingTitle>
          <OnboardingDescription>
            Choose between Basic onboarding (quick setup with essential features) or Advanced/Pro onboarding (full customization with voice integration and advanced features).
          </OnboardingDescription>
          <OptionButton
            onClick={() => handleResponse('userType', 'selection', 'basic')}
            $selected={userResponses.userType?.selection === 'basic'}
          >
            Basic
          </OptionButton>
          <OptionButton
            onClick={() => handleResponse('userType', 'selection', 'advanced')}
            $selected={userResponses.userType?.selection === 'advanced'}
          >
            Advanced/Pro
          </OptionButton>
        </OnboardingSection>
      )
    },
    {
      id: 'legal',
      title: 'Welcome to JME AI',
      description: 'Before we begin, let\'s quickly go through some important agreements to ensure you get the best and safest experience.',
      type: 'legal',
      component: (
        <OnboardingSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OnboardingTitle>Legal Agreements</OnboardingTitle>
          <OnboardingDescription>
            Please review and accept the following agreements to continue:
          </OnboardingDescription>
          <OptionButton
            onClick={() => handleResponse('legal', 'terms', true)}
            $selected={userResponses.legal?.terms}
          >
            I accept the Terms & Conditions
          </OptionButton>
          <OptionButton
            onClick={() => handleResponse('legal', 'privacy', true)}
            $selected={userResponses.legal?.privacy}
          >
            I accept the Privacy Policy
          </OptionButton>
          <OptionButton
            onClick={() => handleResponse('legal', 'medical', true)}
            $selected={userResponses.legal?.medical}
          >
            I understand this is not medical advice
          </OptionButton>
        </OnboardingSection>
      )
    },
    {
      id: 'metrics',
      title: 'Basic Information',
      description: 'Let\'s start with some basic information to help us personalize your experience.',
      type: 'metrics',
      component: (
        <OnboardingSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OnboardingTitle>Your Profile</OnboardingTitle>
          <OnboardingDescription>
            Please provide your basic metrics so we can calculate your nutritional needs accurately.
          </OnboardingDescription>
          
          <InputGroup>
            <label>Age</label>
            <OnboardingInput
              type="number"
              placeholder="Enter your age"
              value={userResponses.metrics?.age || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleResponse('metrics', 'age', e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <label>Gender</label>
            <Select
              value={userResponses.metrics?.gender || ''}
              onChange={(e) => handleResponse('metrics', 'gender', e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Non-binary</option>
              <option value="prefer-not-say">Prefer not to say</option>
            </Select>
          </InputGroup>

          <InputGroup>
            <label>Height</label>
            <UnitInput>
              <OnboardingInput
                type="number"
                placeholder="Feet"
                value={userResponses.metrics?.heightFeet || ''}
                onChange={(e) => {
                  handleResponse('metrics', 'heightFeet', e.target.value);
                  // Convert to cm for internal storage
                  const feet = parseInt(e.target.value) || 0;
                  const inches = parseInt(userResponses.metrics?.heightInches) || 0;
                  const cm = (feet * 12 + inches) * 2.54;
                  handleResponse('metrics', 'height', cm);
                }}
              />
              <OnboardingInput
                type="number"
                placeholder="Inches"
                value={userResponses.metrics?.heightInches || ''}
                onChange={(e) => {
                  handleResponse('metrics', 'heightInches', e.target.value);
                  // Convert to cm for internal storage
                  const feet = parseInt(userResponses.metrics?.heightFeet) || 0;
                  const inches = parseInt(e.target.value) || 0;
                  const cm = (feet * 12 + inches) * 2.54;
                  handleResponse('metrics', 'height', cm);
                }}
              />
              <span>ft/in</span>
            </UnitInput>
          </InputGroup>

          <InputGroup>
            <label>Weight</label>
            <UnitInput>
              <OnboardingInput
                type="number"
                placeholder="Weight"
                value={userResponses.metrics?.weightLbs || ''}
                onChange={(e) => {
                  handleResponse('metrics', 'weightLbs', e.target.value);
                  // Convert to kg for internal storage
                  const lbs = parseInt(e.target.value) || 0;
                  const kg = lbs * 0.453592;
                  handleResponse('metrics', 'weight', kg);
                }}
              />
              <span>lbs</span>
            </UnitInput>
          </InputGroup>
        </OnboardingSection>
      )
    },
    {
      id: 'health',
      title: 'Health Information',
      description: 'Understanding your health background helps us provide safer and more personalized recommendations.',
      type: 'health',
      component: (
        <OnboardingSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OnboardingTitle>Health History</OnboardingTitle>
          <OnboardingDescription>
            Please select any conditions that apply to you. This information helps us provide safer and more personalized recommendations.
          </OnboardingDescription>
          
          <HealthGrid>
            {[
              { id: 'diabetes', label: 'Diabetes', icon: '🩺' },
              { id: 'celiac', label: 'Celiac Disease', icon: '🌾' },
              { id: 'hypertension', label: 'Hypertension', icon: '❤️' },
              { id: 'pcos', label: 'PCOS', icon: '🔬' },
              { id: 'ibs', label: 'IBS', icon: '🔄' },
              { id: 'lactose', label: 'Lactose Intolerance', icon: '🥛' },
              { id: 'thyroid', label: 'Thyroid Conditions', icon: '⚕️' },
              { id: 'allergies', label: 'Food Allergies', icon: '🚫' }
            ].map(condition => (
              <HealthConditionButton
                key={condition.id}
                $selected={userResponses.health?.conditions?.includes(condition.id)}
                onClick={() => {
                  const currentConditions = userResponses.health?.conditions || [];
                  const newConditions = currentConditions.includes(condition.id)
                    ? currentConditions.filter((c: string) => c !== condition.id)
                    : [...currentConditions, condition.id];
                  
                  handleResponse('health', 'conditions', newConditions);
                  
                  // Call OpenAI to get condition-specific insights
                  if (!currentConditions.includes(condition.id)) {
                    getHealthInsights(condition.id, condition.label);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{condition.icon}</span>
                {condition.label}
              </HealthConditionButton>
            ))}
          </HealthGrid>

          <HealthNotes
            placeholder="Please provide any additional details about your health conditions, medications, or specific dietary restrictions. This helps us provide better recommendations and ensure your meal plans are safe and appropriate for your needs."
            value={userResponses.health?.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              handleResponse('health', 'notes', e.target.value);
              // Debounce the API call to avoid too many requests
              if (e.target.value.length > 50) {
                getHealthInsights('other', 'Additional Health Information', e.target.value);
              }
            }}
          />

          <InfoText>
            Your health information is kept private and secure. It's used only to personalize your meal plans and ensure they align with your health needs.
          </InfoText>
        </OnboardingSection>
      )
    },
    {
      id: 'lifestyle',
      title: 'Activity Level',
      description: 'Help us understand how active you are in your daily life so we can provide the right nutrition plan.',
      type: 'lifestyle',
      component: (
        <OnboardingSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OnboardingTitle>How Active Are You?</OnboardingTitle>
          <OnboardingDescription>
            Select the option that best matches your typical daily activity level. This helps us calculate your energy needs accurately.
          </OnboardingDescription>
          
          <ActivityGrid>
            {[
              {
                id: 'sedentary',
                icon: '🪑',
                title: 'Not Very Active',
                description: 'I spend most of my day sitting (e.g., desk job) and do little to no planned exercise',
                examples: 'Example: Office worker who drives to work and doesn\'t exercise'
              },
              {
                id: 'lightlyActive',
                icon: '🚶',
                title: 'Lightly Active',
                description: 'I spend a good part of the day on my feet or do light exercise 1-3 times per week',
                examples: 'Example: Teacher, retail worker, or light exercise 1-3 times weekly'
              },
              {
                id: 'moderatelyActive',
                icon: '🏃',
                title: 'Moderately Active',
                description: 'I\'m regularly active throughout the day or exercise 3-5 times per week',
                examples: 'Example: Server, delivery person, or regular gym-goer'
              },
              {
                id: 'veryActive',
                icon: '💪',
                title: 'Very Active',
                description: 'I do physically demanding work daily or intense exercise 6+ times per week',
                examples: 'Example: Construction worker, athlete, or daily intense workouts'
              }
            ].map(level => (
              <ActivityCard
                key={level.id}
                $selected={userResponses.lifestyle?.activityLevel === level.id}
                onClick={() => handleResponse('lifestyle', 'activityLevel', level.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ActivityIcon>{level.icon}</ActivityIcon>
                <ActivityTitle>{level.title}</ActivityTitle>
                <ActivityDescription $selected={userResponses.lifestyle?.activityLevel === level.id}>
                  {level.description}
                </ActivityDescription>
                <ExampleText $selected={userResponses.lifestyle?.activityLevel === level.id}>
                  {level.examples}
                </ExampleText>
              </ActivityCard>
            ))}
          </ActivityGrid>

          <InfoText>
            Not sure? Pick the lower option. You can always adjust this later if needed.
          </InfoText>
        </OnboardingSection>
      )
    },
    {
      id: 'nutrition',
      title: 'Nutrition Preferences',
      description: 'Help us understand your food preferences and cooking habits.',
      type: 'nutrition',
      component: <NutritionSection userResponses={userResponses} handleResponse={handleResponse} />
    },
    {
      id: 'preferences',
      title: 'Final Preferences',
      description: 'Let\'s customize your experience further.',
      type: 'preferences',
      component: (
        <OnboardingSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OnboardingTitle>Customization</OnboardingTitle>
          <OnboardingDescription>
            These final preferences will help us tailor your experience.
          </OnboardingDescription>
          <Select
            value={userResponses.preferences?.groceryType || ''}
            onChange={(e) => handleResponse('preferences', 'groceryType', e.target.value)}
          >
            <option value="">Grocery Shopping Preference</option>
            <option value="budget">Budget-Friendly</option>
            <option value="organic">Organic & Natural</option>
            <option value="local">Local Markets</option>
            <option value="no-preference">No Preference</option>
          </Select>
          <OptionButton
            onClick={() => handleResponse('preferences', 'mealPrep', !userResponses.preferences?.mealPrep)}
            $selected={userResponses.preferences?.mealPrep}
          >
            I would like help with meal prep strategies
          </OptionButton>
          <TextArea
            placeholder="Any additional information you'd like to share?"
            value={userResponses.preferences?.additional || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleResponse('preferences', 'additional', e.target.value)}
          />
        </OnboardingSection>
      )
    }
  ];

  const getHealthInsights = useCallback(async (conditionId: string, conditionLabel: string, additionalInfo?: string) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a professional nutritionist and healthcare advisor. Analyze the user's health condition and provide specific dietary and lifestyle considerations.`
          },
          {
            role: "user",
            content: `Provide comprehensive dietary and health insights for a person with ${conditionLabel}.
            ${additionalInfo ? `Additional information: ${additionalInfo}` : ''}`
          }
        ],
        response_format: { "type": "json_object" },
        functions: [
          {
            name: "health_insights",
            description: "Generate structured health insights",
            parameters: {
              type: "object",
              properties: {
                dietary_restrictions: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of foods to avoid"
                },
                recommended_nutrients: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nutrient: { type: "string" },
                      importance: { type: "string" },
                      sources: { 
                        type: "array",
                        items: { type: "string" }
                      }
                    }
                  }
                },
                meal_timing: {
                  type: "object",
                  properties: {
                    frequency: { type: "string" },
                    spacing: { type: "string" },
                    considerations: { 
                      type: "array",
                      items: { type: "string" }
                    }
                  }
                },
                medication_interactions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      food: { type: "string" },
                      medication_type: { type: "string" },
                      recommendation: { type: "string" }
                    }
                  }
                },
                warning_signs: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: [
                "dietary_restrictions",
                "recommended_nutrients",
                "meal_timing",
                "medication_interactions",
                "warning_signs"
              ]
            }
          }
        ],
        function_call: { name: "health_insights" }
      });

      const functionCall = response.choices[0].message.function_call;
      if (functionCall && functionCall.arguments) {
        const insights = JSON.parse(functionCall.arguments);
        handleResponse('health', `insights_${conditionId}`, insights);
      }
    } catch (error) {
      console.error('Error getting health insights:', error);
    }
  }, [handleResponse]);

  const handleNextStep = () => {
    // Validate current step
    const currentStepData = onboardingSteps[currentStep];
    if (!validateStep(currentStepData.type)) {
      return;
    }

    if (currentStep === onboardingSteps.length - 1) {
      // Complete onboarding
      completeOnboarding();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const validateStep = (type: string): boolean => {
    switch (type) {
      case 'legal':
        return userResponses.legal?.terms && userResponses.legal?.privacy && userResponses.legal?.medical;
      
      case 'metrics':
        return (
          !!userResponses.metrics?.age &&
          !!userResponses.metrics?.gender &&
          !!userResponses.metrics?.height &&
          !!userResponses.metrics?.weight
        );
      
      case 'health':
        // Health conditions are optional, but if they select conditions, they should specify which ones
        if (userResponses.health?.conditions?.length > 0) {
          return true;
        }
        // If they haven't selected conditions, they should at least acknowledge by selecting "None"
        return userResponses.health?.conditions === undefined || userResponses.health?.conditions.includes('None');
      
      case 'lifestyle':
        return (
          !!userResponses.lifestyle?.activityLevel
        );
      
      case 'nutrition':
        return (
          !!userResponses.nutrition?.weekday &&
          !!userResponses.nutrition?.weekend &&
          !!userResponses.nutrition?.cookingStyle
        );
      
      case 'preferences':
        return (
          !!userResponses.preferences?.groceryType &&
          userResponses.preferences?.mealPrep !== undefined
        );
      
      default:
        return true;
    }
  };

  const completeOnboarding = () => {
    // Process all collected data
    const userStats = processUserStats(userResponses);
    setUserStats(userStats);
    updatePreferences(processPreferences(userResponses));
    setIsFirstTime(false);
  };

  const handleQuickAction = async (actionId: string, label: string, icon: string) => {
    const timestamp = new Date().toISOString();
    
    // Show visual feedback
    setShowActionFeedback({ icon, label });
    setTimeout(() => setShowActionFeedback(null), 1500);
    
    // Update learning agent with new behavior data
    if (actionId === 'workout') {
      learningAgent.updateBehavior({
        activityPatterns: {
          ...learningAgent.behavior.activityPatterns,
          workoutTimes: [...learningAgent.behavior.activityPatterns.workoutTimes, timestamp]
        }
      });
    } else if (['breakfast', 'lunch', 'dinner', 'snacks'].includes(actionId)) {
      learningAgent.updateBehavior({
        mealTimes: {
          ...learningAgent.behavior.mealTimes,
          [actionId]: [...learningAgent.behavior.mealTimes[actionId as keyof typeof learningAgent.behavior.mealTimes], timestamp]
        }
      });
    }

    // Generate AI suggestions based on the action
    recommendationAgent.generateRecommendations();
    const recommendations = recommendationAgent.currentRecommendations;
    
    if (recommendations.length > 0) {
      const actionTypeMap: Record<string, Recommendation['type']> = {
        workout: 'workout',
        breakfast: 'meal',
        lunch: 'meal',
        dinner: 'meal',
        snacks: 'meal',
        water: 'habit',
        mood: 'habit',
        sleep: 'habit',
        meditation: 'habit'
      };

      const relevantRecs = recommendations.filter((rec: Recommendation) => 
        rec.confidence > 0.7 && rec.type === actionTypeMap[actionId]
      );
      
      if (relevantRecs.length > 0) {
        addToast({
          type: 'info',
          message: 'New suggestions available based on your activity!',
          duration: 5000,
        });
      }
    }

    await onSendMessage(`${label} logged at ${new Date().toLocaleTimeString()}`, undefined, {
      actionType: actionId,
      icon,
    });
    setShowQuickActions(false);
  };

  useEffect(() => {
    // Get user's location for weather data
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [fetchWeather]);

  const generateWeatherBasedSuggestions = () => {
    if (!currentWeather) return [];
    
    const suggestions = [];
    
    // Outdoor activity suggestions based on weather
    if (currentWeather.isOutdoorFriendly) {
      suggestions.push({
        content: `Perfect weather for outdoor exercise! ${currentWeather.temperature}°C`,
        icon: '🌤️',
        confidence: 0.9,
        category: 'activity'
      });
    }
    
    // Hydration reminders based on temperature
    if (currentWeather.temperature > 25) {
      suggestions.push({
        content: 'Stay hydrated in this warm weather!',
        icon: '💧',
        confidence: 0.95,
        category: 'wellness'
      });
    }
    
    // Meal suggestions based on weather
    if (currentWeather.temperature < 15) {
      suggestions.push({
        content: 'How about a warm, hearty meal?',
        icon: '🍲',
        confidence: 0.85,
        category: 'meal'
      });
    } else if (currentWeather.temperature > 25) {
      suggestions.push({
        content: 'Consider a light, refreshing meal',
        icon: '🥗',
        confidence: 0.85,
        category: 'meal'
      });
    }
    
    return suggestions;
  };

  const generateTimeSensitiveSuggestions = () => {
    const suggestions: Suggestion[] = [];
    const hour = new Date().getHours();
    
    // Meal suggestions based on time
    if (hour >= 6 && hour <= 10) {
      suggestions.push({ content: 'Time for breakfast?', icon: '🍳', confidence: 0.9, category: 'meal' });
    } else if (hour >= 11 && hour <= 14) {
      suggestions.push({ content: 'Ready for lunch?', icon: '🥪', confidence: 0.9, category: 'meal' });
    } else if (hour >= 17 && hour <= 21) {
      suggestions.push({ content: 'Time for dinner?', icon: '🍽️', confidence: 0.9, category: 'meal' });
    }

    // Activity suggestions based on user patterns
    const { workoutTimes } = learningAgent.behavior.activityPatterns;
    if (workoutTimes.length > 0) {
      const lastWorkout = new Date(workoutTimes[workoutTimes.length - 1]);
      const daysSinceLastWorkout = (Date.now() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastWorkout >= 2) {
        suggestions.push({ 
          content: 'Time for a workout?', 
          icon: '💪', 
          confidence: 0.8,
          category: 'activity'
        });
      }
    }

    // Add weather-based suggestions
    suggestions.push(...generateWeatherBasedSuggestions());
    
    // Filter by selected category if not 'all'
    return selectedCategory === 'all'
      ? suggestions
      : suggestions.filter(s => s.category === selectedCategory);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add a new effect to handle initial scroll position
  useEffect(() => {
    const messagesContainer = document.querySelector('.chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const emotions = await detectEmotions(audioBlob);
        await onSendMessage('', audioBlob, { emotions });
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaStream) {
      mediaRecorder.stop();
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const detectEmotions = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      // Call Hume AI API for emotion detection
      const response = await fetch('https://api.hume.ai/v0/batch/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hume-Api-Key': import.meta.env.VITE_HUME_API_KEY,
          'X-Hume-Secret-Key': import.meta.env.VITE_HUME_SECRET_KEY,
        },
        body: JSON.stringify({
          data: {
            audio: base64Audio,
          },
          models: {
            prosody: {
              granularity: 'utterance',
              identify_speakers: true
            },
          },
        }),
      });

      const data = await response.json();
      // Process emotion data
      const emotions = data.prosody.predictions[0].emotions
        .map((e: any) => ({
          type: e.name,
          confidence: e.score,
        }))
        .sort((a: EmotionData, b: EmotionData) => b.confidence - a.confidence)
        .slice(0, 3);

      setEmotions(emotions);
      return emotions;
    } catch (error) {
      console.error('Error detecting emotions:', error);
      return [];
    }
  };

  // Add new function to handle chat expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setTimeout(scrollToBottom, 300); // Scroll after animation
  };

  // Show onboarding if it's the user's first time
  if (isFirstTime) {
    const currentStepData = onboardingSteps[currentStep];

    return (
      <OnboardingContainer>
        <OnboardingContent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <OnboardingHeader>
            <OnboardingLogo
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              🤖
            </OnboardingLogo>
            <OnboardingTitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentStepData.title}
            </OnboardingTitle>
            <OnboardingDescription
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {currentStepData.description}
            </OnboardingDescription>
          </OnboardingHeader>

          <ProgressContainer>
            <ProgressBar>
              <Progress
                $progress={(currentStep / (onboardingSteps.length - 1)) * 100}
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (onboardingSteps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </ProgressBar>
          </ProgressContainer>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {currentStepData.component}
          </motion.div>

          <NavigationButton
            onClick={handleNextStep}
            disabled={!validateStep(currentStepData.type)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {currentStep === onboardingSteps.length - 1 ? 'Complete Setup' : 'Continue'}
          </NavigationButton>
        </OnboardingContent>
      </OnboardingContainer>
    );
  }

  // Regular chat interface
  return (
    <ChatContainer className={isExpanded ? 'expanded' : ''}>
      <ChatHeader>
        <ChatTitle>
          <span role="img" aria-label="chat">🤖</span>
          JME AI Assistant
        </ChatTitle>
        <HeaderControls>
          <HeaderButton
            onClick={() => setShowQuickActions(!showQuickActions)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={showQuickActions ? 'Hide quick actions' : 'Show quick actions'}
          >
            {showQuickActions ? '📌' : '🔍'}
          </HeaderButton>
          <HeaderButton
            onClick={toggleExpand}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? '⊖' : '⊕'}
          </HeaderButton>
        </HeaderControls>
      </ChatHeader>

      <ChatMessages className="chat-messages">
        <AnimatePresence mode="sync">
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CategoryTabs>
                {categories.map((category) => (
                  <CategoryTab
                    key={category.id}
                    $isActive={selectedCategory === category.id}
                    $color={category.color}
                    onClick={() => setSelectedCategory(category.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{category.icon}</span>
                    {category.label}
                  </CategoryTab>
                ))}
              </CategoryTabs>

              <SuggestionsBar>
                {generateTimeSensitiveSuggestions().map((suggestion, index) => (
                  <SuggestionChip
                    key={index}
                    $confidence={suggestion.confidence}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const action = quickActions.find(a => a.icon === suggestion.icon);
                      if (action) {
                        handleQuickAction(action.id, action.label, action.icon);
                      }
                    }}
                  >
                    <span>{suggestion.icon}</span>
                    {suggestion.content}
                  </SuggestionChip>
                ))}
              </SuggestionsBar>

              <QuickActionsGrid>
                {quickActions
                  .filter(action => 
                    selectedCategory === 'all' || action.category === selectedCategory
                  )
                  .map((action) => (
                    <QuickActionButton
                      key={action.id}
                      onClick={() => handleQuickAction(action.id, action.label, action.icon)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{action.icon}</span>
                      {action.label}
                    </QuickActionButton>
                  ))}
              </QuickActionsGrid>
            </motion.div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              $isUser={message.type === 'user' || message.type === 'quick-action'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {message.type === 'voice' && message.audioUrl && (
                <>
                  <AudioVisualizer
                    audioUrl={message.audioUrl}
                    waveform={message.metadata?.voice?.waveform}
                  />
                  {message.metadata?.voice?.emotions && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {message.metadata.voice.emotions.map((emotion, index) => (
                        <EmotionTag
                          key={index}
                          $confidence={emotion.confidence}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          {emotion.type} {(emotion.confidence * 100).toFixed(0)}%
                        </EmotionTag>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div>{message.content}</div>
            </MessageBubble>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
      </ChatMessages>

      <AnimatePresence mode="sync">
        {showActionFeedback && (
          <ActionFeedback
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <ActionIcon>{showActionFeedback.icon}</ActionIcon>
            <ActionLabel>{showActionFeedback.label}</ActionLabel>
          </ActionFeedback>
        )}
      </AnimatePresence>

      <ChatInput>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (inputValue.trim()) {
                onSendMessage(inputValue);
                setInputValue('');
                setShowQuickActions(false);
              }
            }
          }}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          style={{ height: 'auto' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
        <InputActions>
          <ActionButton
            className={isRecording ? 'recording' : ''}
            onClick={isRecording ? stopRecording : startRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? '⏹️' : '🎤'}
          </ActionButton>
          <ActionButton
            className="primary"
            onClick={() => {
              if (inputValue.trim()) {
                onSendMessage(inputValue);
                setInputValue('');
                setShowQuickActions(false);
              }
            }}
            disabled={!inputValue.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Send message"
          >
            📤
          </ActionButton>
        </InputActions>
      </ChatInput>
    </ChatContainer>
  );
};

const processUserStats = (responses: Record<string, any>): UserStats => {
  return {
    age: parseInt(responses.metrics?.age || '0'),
    gender: responses.metrics?.gender || 'other',
    weight: parseInt(responses.metrics?.weight || '0'),
    height: parseInt(responses.metrics?.height || '0'),
    bodyFatPercentage: responses.metrics?.bodyFat ? parseInt(responses.metrics.bodyFat) : undefined,
    activityLevel: responses.lifestyle?.activityLevel || 'moderatelyActive',
    goal: responses.goals?.type || 'maintain',
    unitSystem: responses.metrics?.units || 'metric',
    stepsPerDay: parseInt(responses.lifestyle?.steps || '0'),
    workoutsPerWeek: parseInt(responses.lifestyle?.workouts || '0'),
  };
};

const processPreferences = (responses: Record<string, any>): Partial<UserPreferences> => {
  return {
    dietaryRestrictions: responses.nutrition?.restrictions || [],
    favoriteIngredients: responses.nutrition?.favorites || [],
    dislikedIngredients: responses.nutrition?.dislikes || [],
    cookingStyle: responses.preferences?.cookingStyle || 'balanced',
    groceryPreference: responses.preferences?.groceryType || 'no-preference',
    mealPrepHelp: responses.preferences?.mealPrep || false,
    notifications: {
      mealReminders: true,
      workoutReminders: true,
      groceryReminders: true,
      geofencing: false,
      quietHours: {
        start: '22:00',
        end: '07:00',
      },
    },
  };
};