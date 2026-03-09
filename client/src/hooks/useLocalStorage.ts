import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with automatic synchronization
 * Handles JSON serialization/deserialization and provides type safety
 *
 * @param key - localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns [value, setValue] tuple similar to useState
 *
 * @example
 * const [name, setName] = useLocalStorage('user-name', 'Guest');
 * const [settings, setSettings] = useLocalStorage('app-settings', { theme: 'dark' });
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state from localStorage or use default
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      // Try to parse as JSON, fall back to raw string for backwards compatibility
      try {
        return JSON.parse(item) as T;
      } catch {
        // If it's not valid JSON, return as-is (handles legacy string values)
        return item as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Update localStorage whenever state changes
  useEffect(() => {
    try {
      // Handle string values specially to maintain backwards compatibility
      const valueToStore = typeof state === 'string' ? state : JSON.stringify(state);
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.warn(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  // Wrapper function that accepts both direct values and updater functions (like useState)
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function for functional updates
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
    } catch (error) {
      console.warn(`Error updating localStorage key "${key}":`, error);
    }
  };

  return [state, setValue];
}
