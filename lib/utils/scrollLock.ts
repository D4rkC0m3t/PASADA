/**
 * Scroll Lock Utility
 * Manages body scroll locking with multiple lock tracking
 */

const locks = new Set<string>();

/**
 * Lock or unlock page scrolling
 * @param lock - true to lock scroll, false to unlock
 * @param name - unique identifier for this lock
 */
export function scrollLock(lock: boolean, name: string): void {
  if (lock) {
    locks.add(name);
  } else {
    locks.delete(name);
  }

  if (locks.size > 0) {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}

/**
 * Check if scroll is currently locked
 */
export function isScrollLocked(): boolean {
  return locks.size > 0;
}

/**
 * Clear all scroll locks
 */
export function clearAllScrollLocks(): void {
  locks.clear();
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}
