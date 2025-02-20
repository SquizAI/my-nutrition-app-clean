import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: ${theme.colors.background.gradient};
    color: ${theme.colors.text.primary};
    line-height: 1.5;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button {
    font-family: inherit;
  }

  /* Custom scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.button.background};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.default};
    border-radius: 4px;
    
    &:hover {
      background: ${theme.colors.border.hover};
    }
  }

  /* Gradient text utility class */
  .gradient-text {
    background: ${theme.gradients.text.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Card styles */
  .card {
    background: ${theme.colors.background.card};
    border-radius: ${theme.borderRadius.medium};
    border: 1px solid ${theme.colors.border.default};
    backdrop-filter: ${theme.blur.card};
    
    &:hover {
      border-color: ${theme.colors.border.hover};
    }
  }

  /* Button styles */
  .button {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.borderRadius.small};
    background: ${theme.colors.button.background};
    border: 1px solid ${theme.colors.border.default};
    color: ${theme.colors.primary};
    cursor: pointer;
    transition: ${theme.transitions.default};
    
    &:hover {
      background: ${theme.colors.button.hover};
      border-color: ${theme.colors.border.hover};
    }
  }
`;