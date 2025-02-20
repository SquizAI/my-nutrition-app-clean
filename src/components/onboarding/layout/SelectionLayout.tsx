import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../../styles/theme';
import { FaCheck } from 'react-icons/fa';

const SelectionContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.xl} 0;
`;

interface OptionCardProps {
  $selected: boolean;
  $color?: string;
}

const OptionCard = styled(motion.button)<OptionCardProps>`
  position: relative;
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${props => props.$selected ? 
    'rgba(49, 229, 255, 0.1)' : 
    'rgba(255, 255, 255, 0.05)'
  };
  border: 2px solid ${props => props.$selected ? 
    props.$color || theme.colors.primary : 
    theme.colors.border.default
  };
  border-radius: ${theme.borderRadius.large};
  color: ${theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(49, 229, 255, 0.05);
    border-color: ${props => props.$color || theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.hover};
  }

  svg {
    font-size: 24px;
    color: ${props => props.$color || theme.colors.primary};
  }
`;

const OptionTitle = styled.span`
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  text-align: center;
`;

const OptionDescription = styled.span`
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
`;

const CheckIcon = styled(motion.div)`
  position: absolute;
  top: ${theme.spacing.sm};
  right: ${theme.spacing.sm};
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export interface SelectionOption {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType;
  color?: string;
}

interface SelectionLayoutProps {
  options: SelectionOption[];
  selectedValues: string[];
  onChange: (value: string) => void;
  multiSelect?: boolean;
  className?: string;
}

export const SelectionLayout: React.FC<SelectionLayoutProps> = ({
  options,
  selectedValues,
  onChange,
  multiSelect = false,
  className
}) => {
  const handleSelect = (value: string) => {
    if (multiSelect) {
      if (selectedValues.includes(value)) {
        onChange(value); // Will be handled by parent to remove
      } else {
        onChange(value); // Will be handled by parent to add
      }
    } else {
      onChange(value);
    }
  };

  return (
    <SelectionContainer
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <OptionsGrid>
        {options.map(option => {
          const isSelected = selectedValues.includes(option.value);
          const Icon = option.icon;

          return (
            <OptionCard
              key={option.value}
              $selected={isSelected}
              $color={option.color}
              onClick={() => handleSelect(option.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon />
              <OptionTitle>{option.label}</OptionTitle>
              <OptionDescription>{option.description}</OptionDescription>
              {isSelected && (
                <CheckIcon
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <FaCheck />
                </CheckIcon>
              )}
            </OptionCard>
          );
        })}
      </OptionsGrid>
    </SelectionContainer>
  );
}; 