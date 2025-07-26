// Color palette for the application
export const colors = {
  // Primary background
  primary: '#6366f1',
  
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.9)',
    muted: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },
  
  // Status colors
  error: '#ff6b6b',
  
  // Interactive elements
  interactive: {
    border: 'rgba(255, 255, 255, 0.2)',
    borderHover: 'rgba(255, 255, 255, 0.3)',
    borderFocus: 'rgba(255, 255, 255, 0.4)',
    background: 'rgba(255, 255, 255, 0.1)',
    backgroundHover: 'rgba(255, 255, 255, 0.15)',
    backgroundActive: 'rgba(255, 255, 255, 0.2)',
    backgroundButton: 'rgba(255, 255, 255, 0.2)',
    backgroundButtonHover: 'rgba(255, 255, 255, 0.3)',
  },
  
  // Effects
  shadow: {
    glow: 'rgba(255, 255, 255, 0.15)',
    glowStrong: 'rgba(255, 255, 255, 0.2)',
    focus: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

// Type for better TypeScript support
export type Colors = typeof colors;
