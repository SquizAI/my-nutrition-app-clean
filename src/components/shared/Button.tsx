import React from 'react';
import styled, { css } from 'styled-components';
import { motion, HTMLMotionProps, MotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  isLoading?: boolean;
};

type ButtonProps = ButtonBaseProps & Omit<HTMLMotionProps<'button'>, keyof ButtonBaseProps | 'color'>;

const MotionButton = motion.button;

const StyledButton = styled(MotionButton)<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $hasIcon: boolean;
  $iconPosition: 'left' | 'right';
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}

  ${({ $size, theme }) => {
    switch ($size) {
      case 'sm':
        return css`
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: ${theme.typography.fontSizes.sm};
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSizes.lg};
        `;
      default:
        return css`
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSizes.md};
        `;
    }
  }}

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background: ${theme.gradients.primary};
          color: ${theme.colors.text.primary};
          box-shadow: ${theme.shadows.button};

          &:hover {
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.hover};
          }

          &:active {
            transform: translateY(0);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              to right,
              transparent,
              rgba(255, 255, 255, 0.1),
              transparent
            );
            transform: translateX(-100%);
            transition: transform 0.5s ease;
          }

          &:hover::before {
            transform: translateX(100%);
          }
        `;
      case 'secondary':
        return css`
          background: ${theme.colors.button.background};
          color: ${theme.colors.text.primary};
          border: 1px solid ${theme.colors.border.default};

          &:hover {
            background: ${theme.colors.button.hover};
            border-color: ${theme.colors.border.hover};
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.text.primary};

          &:hover {
            background: ${theme.colors.button.background};
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `;
    }
  }}

  ${({ $iconPosition }) =>
    $iconPosition === 'right' &&
    css`
      flex-direction: row-reverse;
    `}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  isLoading = false,
  disabled,
  ...props
}, ref) => {
  const motionProps: MotionProps = {
    initial: false,
    whileHover: !disabled && !isLoading ? { scale: 1.02 } : undefined,
    whileTap: !disabled && !isLoading ? { scale: 0.98 } : undefined,
  };

  return (
    <StyledButton
      ref={ref}
      $variant={variant}
      $size={size}
      $hasIcon={!!icon}
      $iconPosition={iconPosition}
      $fullWidth={fullWidth}
      disabled={disabled || isLoading}
      {...motionProps}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </StyledButton>
  );
});

Button.displayName = 'Button';

export default Button; 