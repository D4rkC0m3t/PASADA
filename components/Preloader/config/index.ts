/**
 * Preloader Configuration
 * Centralized constants for visual and functional aspects of the preloader
 */

/**
 * Wave fill color (hex format)
 */
export const WAVE_COLOR = "#C8A870"; // Gold - PASADA brand color

/**
 * Wave amplitude for desktop devices (in pixels)
 */
export const WAVE_AMPLITUDE = 50;

/**
 * Wave amplitude for mobile/tablet devices (in pixels)
 */
export const WAVE_AMPLITUDE_DEVICES = 25;

/**
 * Wave frequency (controls wave animation speed)
 * Higher values = faster wave movement
 */
export const WAVE_FREQUENCY = 0.03;

/**
 * Loading duration in seconds
 * Total time the preloader will be displayed
 */
export const LOADING_DURATION = 3;

/**
 * Animation durations for different phases (in seconds)
 */
export const ANIMATION_DURATION = {
  delay: 1,              // Initial delay before animation starts
  loadingProgress: 0.25, // Loading progress fade out
  logoScale: 1,          // Logo scale animation
  logoScaleStart: 0.9,   // When to start logo scale (90% of loading)
  componentFadeOut: 0.5, // Final component fade out
} as const;

/**
 * Logo configuration
 */
export const LOGO_CONFIG = {
  aspectRatio: 962 / 192, // Width / Height ratio
  maxWidth: {
    mobile: '80%',
    tablet: '70%',
    desktop: '740px',
    large: '965px',
  },
} as const;

/**
 * Canvas wave drawing configuration
 */
export const WAVE_CONFIG = {
  wave1Frequency: 0.02,  // First wave frequency
  wave2Frequency: 0.01,  // Second wave frequency
  wave3Frequency: 0.05,  // Third wave frequency
  xMultiplier: 3,        // X-axis drawing multiplier
} as const;

/**
 * Scroll lock configuration
 */
export const SCROLL_LOCK_NAME = 'preloader';

/**
 * Z-index for preloader overlay
 */
export const Z_INDEX = 999;

/**
 * Breakpoints for responsive behavior (in pixels)
 */
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  large: 1280,
} as const;

/**
 * Logo scale multipliers for final animation
 */
export const LOGO_SCALE = {
  mobile: 1.5,
  desktop: 2,
} as const;

/**
 * Get device pixel ratio (capped at 2 for performance)
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
}

/**
 * Check if screen is large (desktop)
 */
export function isLargeScreen(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.desktop;
}

/**
 * Type exports for TypeScript
 */
export type AnimationDuration = typeof ANIMATION_DURATION;
export type LogoConfig = typeof LOGO_CONFIG;
export type WaveConfig = typeof WAVE_CONFIG;
export type Breakpoints = typeof BREAKPOINTS;
export type LogoScale = typeof LOGO_SCALE;
