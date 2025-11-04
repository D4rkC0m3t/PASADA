/**
 * Tailwind CSS Class Merger
 * Combines clsx with tailwind-merge for proper class merging
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function twcx(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Alias for convenience
export const cn = twcx;
