import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

export const Container = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const StyledFormGroup = styled(motion.div)`
  margin-bottom: ${theme.spacing.xl};
  position: relative;
  background: rgba(30, 30, 30, 0.95);
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.large};
  border: 2px solid ${theme.colors.border.default};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.hover};
  }

  &:focus-within {
    border-color: ${theme.colors.primary};
    background: rgba(49, 229, 255, 0.05);
  }
`;

export const StyledLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  margin-bottom: ${theme.spacing.md};
  font-weight: ${theme.typography.fontWeights.medium};

  svg {
    color: ${theme.colors.primary};
    font-size: 20px;
  }
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}30;
    background: rgba(49, 229, 255, 0.05);
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}30;
    background: rgba(49, 229, 255, 0.05);
  }

  option {
    background: ${theme.colors.background.card};
    color: ${theme.colors.text.primary};
    padding: ${theme.spacing.md};
  }
`;

export const VoiceButton = styled(motion.button)`
  position: absolute;
  right: ${theme.spacing.md};
  top: ${theme.spacing.md};
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.round};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${theme.colors.border.default};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(49, 229, 255, 0.1);
    border-color: ${theme.colors.primary};
    transform: scale(1.1);
  }

  &[data-recording="true"] {
    background: rgba(255, 77, 77, 0.2);
    border-color: ${theme.colors.error};
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

export const ErrorMessage = styled(motion.div)`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSizes.sm};
  margin-top: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  svg {
    color: ${theme.colors.error};
  }
`;

export const HelpText = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.sm};
  margin-top: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  svg {
    color: ${theme.colors.text.secondary};
  }
`;

export const AudioVisualizerContainer = styled(motion.div)`
  margin-top: ${theme.spacing.md};
  width: 100%;
  overflow: hidden;
`;

export const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const Title = styled.h2`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  text-align: center;
  margin-bottom: ${theme.spacing.md};
`;

export const Description = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.md};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
`;

export const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
`;

export const Option = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.large};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(49, 229, 255, 0.05);
    border-color: ${theme.colors.primary};
  }

  svg {
    font-size: 24px;
    color: ${theme.colors.primary};
  }
`; 