// Centralized SVG icons for the application
export const icons = {
  search: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </>
    )
  },
  reload: {
    viewBox: "0 0 24 24", 
    path: (
      <>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
      </>
    )
  },
  history: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </>
    )
  },
  delete: {
    viewBox: "0 0 24 24",
    path: (
      <path 
        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
    )
  },
  arrow: {
    viewBox: "0 0 24 24",
    path: (
      <path d="M19 12H5M12 19l-7-7 7-7" />
    )
  },
  arrow_back: {
    viewBox: "0 0 24 24",
    path: (
      <path d="M19 12H5M12 19l-7-7 7-7" />
    )
  },
  arrow_forward: {
    viewBox: "0 0 24 24",
    path: (
      <path d="M5 12h14M12 5l7 7-7 7" />
    )
  }
} as const;

// Common SVG props
export const defaultSvgProps = {
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: "2" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const
};

// Icon component type
export type IconName = keyof typeof icons;
