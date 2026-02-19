/**
 * Design tokens — Institutional Light (bank-grade).
 * Claro, sobrio, preciso.
 */
export const tokens = {
  colors: {
    bg: {
      app: '#F6F8FB',
      surface: '#FFFFFF',
      surface2: '#F1F4F8',
    },
    border: '#D8E0EA',
    text: {
      primary: '#0B1220',
      secondary: '#4B5563',
      muted: '#6B7280',
    },
    accent: {
      primary: '#1D4ED8',
      subtle: 'rgba(29, 78, 216, 0.08)',
    },
    focus: {
      ring: 'rgba(29, 78, 216, 0.35)',
    },
    semantic: {
      success: '#15803D',
      warning: '#B45309',
      danger: '#B91C1C',
    },
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
  },
  shadow: {
    sm: '0 1px 2px rgba(11, 18, 32, 0.04)',
    md: '0 2px 4px rgba(11, 18, 32, 0.06)',
  },
  transition: {
    fast: '150ms ease',
    base: '180ms ease',
    slow: '220ms ease',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },
} as const;
