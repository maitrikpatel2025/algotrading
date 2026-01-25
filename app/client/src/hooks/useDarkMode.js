import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'theme';

/**
 * Custom hook for dark mode toggle with localStorage persistence
 *
 * Adds/removes .dark class on document.documentElement
 * Persists preference to localStorage with key 'theme'
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage, default to light mode
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_KEY);
      return stored === 'dark';
    }
    return false;
  });

  // Apply dark class to document when isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persist to localStorage
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return { isDark, toggleDarkMode };
}

export default useDarkMode;
