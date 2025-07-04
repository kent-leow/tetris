/**
 * Focus management utilities for accessibility
 * Provides helpers for managing focus in complex UI scenarios
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing focus trapping and restoration
 */
export interface FocusManagerOptions {
  /** Whether focus management is active */
  enabled?: boolean;
  /** Elements to exclude from focus management */
  excludeElements?: string[];
  /** Restore focus when disabled */
  restoreFocus?: boolean;
}

export function useFocusManager(options: FocusManagerOptions = {}) {
  const { enabled = true, excludeElements = [], restoreFocus = true } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Store previous focus when enabled
  useEffect(() => {
    if (enabled && restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [enabled, restoreFocus]);

  // Restore focus when disabled
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current && !enabled) {
        setTimeout(() => {
          previousFocusRef.current?.focus();
        }, 0);
      }
    };
  }, [enabled, restoreFocus]);

  const clearFocus = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element && !excludeElements.includes(selector)) {
      element.focus();
    }
  }, [excludeElements]);

  const removeFocusFromElement = useCallback((element: HTMLElement | null) => {
    if (element && element === document.activeElement) {
      element.blur();
    }
  }, []);

  return {
    containerRef,
    clearFocus,
    focusElement,
    removeFocusFromElement,
    restorePreviousFocus: () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    },
  };
}

/**
 * Hook for keyboard navigation in menus
 */
export interface MenuNavigationOptions {
  /** Menu items selector */
  itemSelector: string;
  /** Container element */
  container?: HTMLElement | null;
  /** Allow wrapping around */
  wrap?: boolean;
  /** Orientation of the menu */
  orientation?: 'horizontal' | 'vertical';
}

export function useMenuNavigation(options: MenuNavigationOptions) {
  const { itemSelector, container, wrap = true, orientation = 'vertical' } = options;

  const getCurrentIndex = useCallback(() => {
    if (!container) return -1;
    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
    const activeElement = document.activeElement;
    return items.findIndex(item => item === activeElement || item.contains(activeElement));
  }, [container, itemSelector]);

  const focusItemAt = useCallback((index: number) => {
    if (!container) return;
    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
    const item = items[index];
    if (item) {
      item.focus();
    }
  }, [container, itemSelector]);

  const focusNext = useCallback(() => {
    if (!container) return;
    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
    const currentIndex = getCurrentIndex();
    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= items.length) {
      nextIndex = wrap ? 0 : items.length - 1;
    }
    
    focusItemAt(nextIndex);
  }, [container, itemSelector, getCurrentIndex, focusItemAt, wrap]);

  const focusPrevious = useCallback(() => {
    if (!container) return;
    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
    const currentIndex = getCurrentIndex();
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = wrap ? items.length - 1 : 0;
    }
    
    focusItemAt(prevIndex);
  }, [container, itemSelector, getCurrentIndex, focusItemAt, wrap]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isVertical = orientation === 'vertical';
    const nextKeys = isVertical ? ['ArrowDown'] : ['ArrowRight'];
    const prevKeys = isVertical ? ['ArrowUp'] : ['ArrowLeft'];

    if (nextKeys.includes(event.key)) {
      event.preventDefault();
      focusNext();
    } else if (prevKeys.includes(event.key)) {
      event.preventDefault();
      focusPrevious();
    }
  }, [orientation, focusNext, focusPrevious]);

  return {
    getCurrentIndex,
    focusItemAt,
    focusNext,
    focusPrevious,
    handleKeyDown,
  };
}
