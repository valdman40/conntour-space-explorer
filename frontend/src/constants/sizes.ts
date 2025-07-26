// Size system for the application using rem/em units for scalability
export const sizes = {
  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
  },

  // Padding
  padding: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    xxl: '2rem',
  },

  // Margins
  margin: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  // Border radius
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    pill: '25rem',    // Very large for pill-shaped elements
    circle: '50%',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  // Icon sizes
  icon: {
    xs: '1rem',       // 16px
    sm: '1.25rem',    // 20px
    md: '1.5rem',     // 24px
    lg: '2rem',       // 32px
    xl: '2.5rem',     // 40px
  },

  // Button sizes
  button: {
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
    },
  },

  // Input sizes
  input: {
    padding: '0.75rem 3rem 0.75rem 1rem',
    height: '3rem',   // 48px
  },

  // Layout
  layout: {
    containerPadding: '2rem',
    maxWidth: '25rem', // 400px for search bar
    headerHeight: '5rem',
  },

  // Effects
  effects: {
    transform: {
      lift: 'translateY(-0.125rem)', // 2px lift
      down: 'translateY(0)',
    },
    shadow: {
      sm: '0 0.125rem 0.9375rem', // 0 2px 15px
      md: '0 0.25rem 1.25rem',     // 0 4px 20px
      focus: '0 0 0 0.1875rem',    // 0 0 0 3px
    },
  },

  // Z-index scale
  zIndex: {
    base: 1,
    dropdown: 10,
    sticky: 10,
    modal: 100,
    tooltip: 200,
  },
} as const;

// Type for better TypeScript support
export type Sizes = typeof sizes;
