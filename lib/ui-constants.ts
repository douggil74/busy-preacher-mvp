/**
 * The Busy Christian - UI Design System
 * Centralized constants for consistent UI across all pages
 */

// ========================================
// SPACING SCALE
// ========================================
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

// ========================================
// TYPOGRAPHY
// ========================================
export const typography = {
  // Headings
  h1: 'text-3xl font-bold leading-tight',           // 30px - Page titles
  h2: 'text-2xl font-semibold leading-snug',        // 24px - Section headers
  h3: 'text-xl font-semibold leading-snug',         // 20px - Card titles
  h4: 'text-lg font-semibold leading-normal',       // 18px - Subsections

  // Body text
  body: 'text-base leading-relaxed',                // 16px - Main content
  bodyLarge: 'text-lg leading-relaxed',             // 18px - Emphasized content
  small: 'text-sm leading-normal',                  // 14px - Supporting text
  xs: 'text-xs leading-tight',                      // 12px - Fine print

  // Special
  quote: 'text-lg italic leading-relaxed',          // 18px - Quotations
  code: 'font-mono text-sm',                        // 14px - Code snippets
} as const;

// ========================================
// COLORS (Semantic)
// ========================================
export const colors = {
  // Primary brand
  primary: 'yellow-400',
  primaryHover: 'yellow-300',
  primaryText: 'slate-900',

  // Secondary
  secondary: 'amber-500',
  secondaryHover: 'amber-400',

  // Status colors
  success: 'green-500',
  successBg: 'green-500/5',
  successBorder: 'green-500/30',

  warning: 'amber-600',
  warningBg: 'amber-500/5',
  warningBorder: 'amber-500/30',

  danger: 'red-500',
  dangerBg: 'red-500/5',
  dangerBorder: 'red-500/30',

  info: 'blue-400',
  infoBg: 'blue-500/5',
  infoBorder: 'blue-500/30',

  // Text colors
  text: {
    primary: 'white',               // Headings
    secondary: 'white/80',          // Body text
    tertiary: 'white/60',           // Supporting text
    muted: 'white/40',              // Placeholders
    inverse: 'slate-900',           // Dark text on light bg
  },

  // Background colors
  bg: {
    primary: 'slate-950',
    secondary: 'slate-900',
    tertiary: 'slate-800',
    overlay: 'black/70',
  },
} as const;

// ========================================
// CARD VARIANTS
// ========================================
export const card = {
  // Base card class (always use this)
  base: 'rounded-xl p-6 backdrop-blur border',

  // Variants
  default: 'rounded-xl p-6 backdrop-blur border border-white/10 bg-white/5',

  highlight: 'rounded-xl p-6 backdrop-blur border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-400/5 to-transparent',

  success: 'rounded-xl p-6 backdrop-blur border border-green-500/30 bg-green-500/5',

  warning: 'rounded-xl p-6 backdrop-blur border border-amber-500/30 bg-amber-500/5',

  danger: 'rounded-xl p-6 backdrop-blur border border-red-500/30 bg-red-500/5',

  info: 'rounded-xl p-6 backdrop-blur border border-blue-500/30 bg-blue-500/5',

  // Card spacing
  spacing: {
    compact: 'p-4',        // Tight spacing
    default: 'p-6',        // Standard spacing
    comfortable: 'p-8',    // Generous spacing
  },

  // Card shadows
  shadow: {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg shadow-black/20',
    xl: 'shadow-xl shadow-black/30',
  },
} as const;

// ========================================
// BUTTON VARIANTS
// ========================================
export const button = {
  // Primary - Main call-to-action
  primary: 'px-6 py-3 bg-yellow-400 text-slate-900 rounded-lg font-semibold hover:bg-yellow-300 active:scale-95 transition-all shadow-lg shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed',

  // Secondary - Supporting actions
  secondary: 'px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/15 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed',

  // Tertiary - Low emphasis
  tertiary: 'px-4 py-2 text-yellow-400 hover:text-yellow-300 underline underline-offset-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',

  // Danger - Destructive actions
  danger: 'px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg font-medium hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed',

  // Success - Confirmations
  success: 'px-6 py-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg font-medium hover:bg-green-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed',

  // Ghost - Minimal style
  ghost: 'px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',

  // Sizes
  size: {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  },
} as const;

// ========================================
// INPUT FIELD VARIANTS
// ========================================
export const input = {
  // Base input styles
  base: 'w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',

  // With icon (add pl-10 for left icon, pr-10 for right icon)
  withLeftIcon: 'w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200',

  withRightIcon: 'w-full pl-4 pr-10 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200',

  // Error state
  error: 'w-full px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all duration-200',

  // Success state
  success: 'w-full px-4 py-3 rounded-lg bg-green-500/5 border border-green-500/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all duration-200',

  // Textarea
  textarea: 'w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200 min-h-[120px] resize-y',
} as const;

// ========================================
// CONTAINER & LAYOUT
// ========================================
export const layout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerNarrow: 'max-w-4xl mx-auto px-4 sm:px-6',
  containerWide: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',

  // Content max-widths (for optimal reading)
  contentWidth: 'max-w-2xl',      // ~768px - Optimal for reading
  contentWidthWide: 'max-w-4xl',  // ~896px - Wide content
  contentWidthNarrow: 'max-w-xl', // ~576px - Narrow content

  // Spacing
  section: 'space-y-8',           // 32px between major sections
  stack: 'space-y-4',             // 16px between related items
  inline: 'space-x-4',            // 16px between inline items
} as const;

// ========================================
// ANIMATION & TRANSITIONS
// ========================================
export const animation = {
  // Transitions
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-200',
  slow: 'transition-all duration-300',

  // Specific transitions
  colors: 'transition-colors duration-200',
  transform: 'transition-transform duration-200',
  opacity: 'transition-opacity duration-200',

  // Hover effects
  hoverLift: 'transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl',
  hoverScale: 'transition-transform duration-200 hover:scale-105',

  // Active states
  activeScale: 'active:scale-95',
  activePress: 'active:scale-98',
} as const;

// ========================================
// BORDER RADIUS
// ========================================
export const radius = {
  none: 'rounded-none',
  sm: 'rounded-sm',      // 2px
  md: 'rounded-md',      // 6px
  lg: 'rounded-lg',      // 8px
  xl: 'rounded-xl',      // 12px
  '2xl': 'rounded-2xl',  // 16px
  full: 'rounded-full',  // Circle
} as const;

// ========================================
// SHADOWS
// ========================================
export const shadow = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg shadow-black/20',
  xl: 'shadow-xl shadow-black/30',
  '2xl': 'shadow-2xl shadow-black/40',

  // Colored shadows
  primary: 'shadow-lg shadow-yellow-400/20',
  danger: 'shadow-lg shadow-red-500/20',
  success: 'shadow-lg shadow-green-500/20',
} as const;

// ========================================
// UTILITY CLASSES
// ========================================
export const utils = {
  // Text utilities
  truncate: 'truncate',
  lineClamp2: 'line-clamp-2',
  lineClamp3: 'line-clamp-3',

  // Flex utilities
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',

  // Visibility
  srOnly: 'sr-only', // Screen reader only
  hidden: 'hidden',

  // Cursor
  pointer: 'cursor-pointer',
  notAllowed: 'cursor-not-allowed',
} as const;

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Combine multiple class strings, filtering out falsy values
 * Usage: cn('base-class', condition && 'conditional-class', 'another-class')
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get responsive padding based on breakpoint
 */
export function responsivePadding(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: 'p-4 md:p-6',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-12',
  };
  return sizes[size];
}

/**
 * Get responsive text size
 */
export function responsiveText(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: 'text-sm md:text-base',
    md: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
  };
  return sizes[size];
}
