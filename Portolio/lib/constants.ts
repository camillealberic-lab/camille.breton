// Centralized constants used across the project
// Colors are defined once in globals.css as CSS custom properties
// and in tailwind.config.ts for utility classes — no JS duplication needed.

export const NAV_HEIGHT = 'clamp(56px, 12vw, 172px)';

export const SCROLL_THRESHOLD = 300;
export const SCROLL_THRESHOLD_PROJECT = 260;

export const CONTACT = {
  EMAIL: 'camille.breton@ynov.com',
  LINKEDIN: 'https://www.linkedin.com/in/camille-breton-489439386/',
} as const;
