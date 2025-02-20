export const theme = {
  colors: {
    primary: '#31E5FF', // Cyan
    secondary: '#9747FF', // Purple
    accent: '#FF47B1', // Pink
    background: {
      main: '#0A0A0A',
      card: 'rgba(20, 20, 20, 0.8)',
      gradient: 'linear-gradient(135deg, rgba(49, 229, 255, 0.1) 0%, rgba(151, 71, 255, 0.1) 100%)'
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      focus: 'rgba(49, 229, 255, 0.5)'
    },
    button: {
      background: 'rgba(49, 229, 255, 0.2)',
      hover: 'rgba(49, 229, 255, 0.3)',
      active: 'rgba(49, 229, 255, 0.4)'
    },
    error: '#FF4747',
    success: '#47FF9C',
    warning: '#FFB347'
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #31E5FF 0%, #9747FF 100%)',
    secondary: 'linear-gradient(135deg, #9747FF 0%, #FF47B1 100%)',
    text: {
      primary: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)'
    }
  },

  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', 'Roboto Mono', Menlo, Courier, monospace"
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '3rem'
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '4rem'
  },

  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    full: '9999px'
  },

  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.25)',
    hover: '0 8px 30px rgba(49, 229, 255, 0.15)',
    focus: '0 0 0 3px rgba(49, 229, 255, 0.3)'
  },

  blur: {
    card: 'blur(20px)',
    modal: 'blur(30px)'
  },

  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease'
  },

  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  zIndices: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500
  }
} as const;

export type Theme = typeof theme;