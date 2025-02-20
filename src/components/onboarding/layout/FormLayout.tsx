import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../../styles/theme';
import { FormField } from '../types';
import { FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';

const FormContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const FormGroup = styled(motion.div)`
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

const Label = styled.label`
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

const Input = styled.input`
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

const Select = styled.select`
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

const HelpText = styled.div`
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

const ErrorMessage = styled(motion.div)`
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

interface FormLayoutProps {
  fields: FormField[];
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  onBlur?: (fieldId: string) => void;
  className?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  fields,
  values,
  errors,
  onChange,
  onBlur,
  className
}) => {
  return (
    <FormContainer
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {fields.map(field => (
        <FormGroup
          key={field.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Label>
            <field.icon /> {field.label}
          </Label>

          {field.type === 'select' ? (
            <Select
              name={field.id}
              value={String(values[field.id] || '')}
              onChange={(e) => onChange(field.id, e.target.value)}
              onBlur={() => onBlur?.(field.id)}
              required={field.required}
            >
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              type={field.type}
              name={field.id}
              value={String(values[field.id] || '')}
              onChange={(e) => onChange(field.id, e.target.value)}
              onBlur={() => onBlur?.(field.id)}
              placeholder={field.placeholder}
              required={field.required}
              max={field.max}
            />
          )}

          {field.helpText && (
            <HelpText>
              <FaInfoCircle /> {field.helpText}
            </HelpText>
          )}

          {errors[field.id] && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaExclamationCircle /> {errors[field.id]}
            </ErrorMessage>
          )}
        </FormGroup>
      ))}
    </FormContainer>
  );
}; 