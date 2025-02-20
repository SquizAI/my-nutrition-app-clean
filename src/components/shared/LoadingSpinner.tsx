import React from 'react';
import styled, { keyframes } from 'styled-components';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  fullPage?: boolean;
  label?: string;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const getSpinnerSize = (size: SpinnerSize) => {
  switch (size) {
    case 'sm':
      return '24px';
    case 'md':
      return '40px';
    case 'lg':
      return '64px';
  }
};

const SpinnerContainer = styled.div<{ $fullPage: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  ${({ $fullPage }) => $fullPage && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.background.main}E6;
    backdrop-filter: blur(4px);
    z-index: ${({ theme }) => theme.zIndex.overlay};
  `}
`;

const SpinnerWrapper = styled.div<{ $size: SpinnerSize }>`
  width: ${({ $size }) => getSpinnerSize($size)};
  height: ${({ $size }) => getSpinnerSize($size)};
  position: relative;
`;

const SpinnerRing = styled.div<{ $size: SpinnerSize }>`
  width: 100%;
  height: 100%;
  border: 3px solid ${({ theme }) => theme.colors.button.background};
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
`;

const SpinnerAnimation = styled(SpinnerRing)`
  border-color: ${({ theme }) => theme.colors.primary} transparent transparent transparent;
  animation: ${spin} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
`;

const SpinnerLabel = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`;

export const LoadingSpinner: React.FC<SpinnerProps> = ({
  size = 'md',
  fullPage = false,
  label,
}) => {
  return (
    <SpinnerContainer $fullPage={fullPage}>
      <SpinnerWrapper $size={size}>
        <SpinnerRing $size={size} />
        <SpinnerAnimation $size={size} />
      </SpinnerWrapper>
      {label && <SpinnerLabel>{label}</SpinnerLabel>}
    </SpinnerContainer>
  );
}; 