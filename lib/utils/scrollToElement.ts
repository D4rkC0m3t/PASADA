/**
 * Smooth scroll to element utility
 */

export interface ScrollToElementOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
  offset?: number;
}

/**
 * Smoothly scroll to a specific element
 * @param element - The element to scroll to
 * @param options - Scroll options
 */
export function scrollToElement(
  element: Element | null,
  options: ScrollToElementOptions = {}
): void {
  if (!element) return;

  const {
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest',
    offset = 0,
  } = options;

  if (offset !== 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior,
    });
  } else {
    element.scrollIntoView({
      behavior,
      block,
      inline,
    });
  }
}
