import { useEffect } from 'react';

/**
 * Configuration options for the useNoScroll hook
 */
export interface NoScrollOptions {
  /**
   * CSS selectors for elements that should maintain scrolling capability
   * @default []
   */
  allowScrollSelectors?: string[];
  /**
   * Whether to allow scrolling within modal/overlay elements
   * @default false
   */
  allowModalScroll?: boolean;
}

/**
 * Custom hook to prevent all forms of scrolling and ensure
 * the game stays within the viewport boundaries.
 * 
 * This hook provides comprehensive scroll prevention including:
 * - Browser scroll (vertical and horizontal)
 * - Mobile pull-to-refresh
 * - Elastic bounce scrolling
 * - Keyboard navigation scrolling
 * - Touch-based scrolling
 * 
 * @param options Configuration options for selective scroll allowance
 */
export const useNoScroll = (options: NoScrollOptions = {}) => {
  const { allowScrollSelectors = [], allowModalScroll = false } = options;
  useEffect(() => {
    // Store original values to restore on cleanup
    const originalHtmlStyle = document.documentElement.style.cssText;
    const originalBodyStyle = document.body.style.cssText;

    /**
     * Check if an element or its parents are in the allowed scroll list
     */
    const isScrollAllowed = (element: Element): boolean => {
      // Check if modal scroll is allowed and element is within a modal/overlay
      if (allowModalScroll) {
        const modal = element.closest('[role="dialog"], [aria-modal="true"], .modal, .overlay');
        if (modal) return true;
      }

      // Check if element matches any allowed selectors
      for (const selector of allowScrollSelectors) {
        try {
          if (element.matches(selector) || element.closest(selector)) {
            return true;
          }
        } catch {
          console.warn('Invalid selector for useNoScroll:', selector);
        }
      }

      return false;
    };

    // Apply comprehensive scroll prevention
    const preventScroll = () => {
      // HTML element settings
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.top = '0';
      document.documentElement.style.left = '0';
      document.documentElement.style.width = '100%';
      document.documentElement.style.height = '100%';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.touchAction = 'manipulation';
      document.documentElement.style.overscrollBehavior = 'none';

      // Body element settings
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.width = '100vw';
      document.body.style.height = '100vh';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'manipulation';
      document.body.style.overscrollBehavior = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.userSelect = 'none';
      
      // Use setProperty for webkit-specific properties
      document.body.style.setProperty('-webkit-touch-callout', 'none');
      document.body.style.setProperty('-webkit-tap-highlight-color', 'transparent');
    };

    // Prevent scroll on key presses that might cause scrolling
    const preventScrollKeys = (e: KeyboardEvent) => {
      const scrollKeys = [
        'PageUp', 'PageDown', 'End', 'Home',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
      ];
      
      // Only prevent if the target is not an input or textarea
      const target = e.target as HTMLElement;
      const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      // Check if scrolling is allowed for this element
      if (isScrollAllowed(target)) {
        return;
      }
      
      if (!isInputElement && scrollKeys.includes(e.key)) {
        // Check if this is a game control (allow game controls)
        const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (gameKeys.includes(e.key)) {
          // Allow game controls but prevent page scrolling
          e.preventDefault();
          return;
        }
        
        // Prevent non-game scroll keys
        if (['PageUp', 'PageDown', 'End', 'Home'].includes(e.key)) {
          e.preventDefault();
        }
      }
    };

    // Prevent touch-based scrolling
    const preventTouchScroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      
      // Allow scrolling if target is in allowed scroll elements
      if (target && isScrollAllowed(target)) {
        return;
      }

      // Allow single touches for taps but prevent multi-touch and swipes
      if (e.touches.length > 1) {
        e.preventDefault();
        return;
      }

      // Prevent pull-to-refresh and overscroll
      const touch = e.touches[0];
      
      // Check if we're at the top or bottom and trying to scroll further
      if (target) {
        const isAtTop = window.scrollY === 0;
        const isAtBottom = window.scrollY >= document.body.scrollHeight - window.innerHeight;
        
        // Prevent overscroll
        if ((isAtTop && touch.clientY > 0) || (isAtBottom && touch.clientY < 0)) {
          e.preventDefault();
        }
      }
    };

    // Prevent wheel/trackpad scrolling
    const preventWheelScroll = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      
      // Allow scrolling if target is in allowed scroll elements
      if (target && isScrollAllowed(target)) {
        return;
      }

      // Allow zoom with ctrl key, but prevent scrolling
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    };

    // Prevent context menu which can disrupt gameplay
    const preventContextMenu = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Allow context menu if scrolling is allowed for this element
      if (target && isScrollAllowed(target)) {
        return;
      }
      
      e.preventDefault();
    };

    // Apply initial prevention
    preventScroll();

    // Add event listeners
    document.addEventListener('keydown', preventScrollKeys, { passive: false });
    document.addEventListener('touchstart', preventTouchScroll, { passive: false });
    document.addEventListener('touchmove', preventTouchScroll, { passive: false });
    document.addEventListener('wheel', preventWheelScroll, { passive: false });
    document.addEventListener('contextmenu', preventContextMenu);

    // Handle viewport changes (orientation, resize)
    const handleViewportChange = () => {
      // Small delay to ensure viewport has settled
      setTimeout(preventScroll, 100);
    };

    window.addEventListener('orientationchange', handleViewportChange);
    window.addEventListener('resize', handleViewportChange);

    // Prevent focus-based scrolling
    const preventFocusScroll = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      
      // Allow focus scrolling if target is in allowed scroll elements
      if (target && isScrollAllowed(target)) {
        return;
      }
      
      if (target && target.scrollIntoView) {
        // Override scrollIntoView to prevent automatic scrolling
        target.scrollIntoView = () => {};
      }
    };

    document.addEventListener('focus', preventFocusScroll, true);

    // Cleanup function
    return () => {
      // Remove event listeners
      document.removeEventListener('keydown', preventScrollKeys);
      document.removeEventListener('touchstart', preventTouchScroll);
      document.removeEventListener('touchmove', preventTouchScroll);
      document.removeEventListener('wheel', preventWheelScroll);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('focus', preventFocusScroll, true);
      window.removeEventListener('orientationchange', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);

      // Restore original styles
      document.documentElement.style.cssText = originalHtmlStyle;
      document.body.style.cssText = originalBodyStyle;
    };
  }, [allowScrollSelectors, allowModalScroll]);
};

/**
 * Utility function to manually prevent scroll on specific elements
 */
export const applyNoScrollToElement = (element: HTMLElement) => {
  if (!element) return;

  element.style.overflow = 'hidden';
  element.style.touchAction = 'manipulation';
  element.style.overscrollBehavior = 'none';
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';
  element.style.setProperty('-webkit-touch-callout', 'none');
};

/**
 * Utility function to check if the viewport is properly constrained
 */
export const checkViewportConstraints = (): {
  isConstrained: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  if (document.body.style.overflow !== 'hidden') {
    issues.push('Body overflow not hidden');
  }
  
  if (document.documentElement.style.overflow !== 'hidden') {
    issues.push('HTML overflow not hidden');
  }
  
  if (window.scrollY !== 0 || window.scrollX !== 0) {
    issues.push('Page is scrolled');
  }
  
  if (document.body.scrollHeight > window.innerHeight) {
    issues.push('Body height exceeds viewport');
  }
  
  if (document.body.scrollWidth > window.innerWidth) {
    issues.push('Body width exceeds viewport');
  }
  
  return {
    isConstrained: issues.length === 0,
    issues
  };
};
