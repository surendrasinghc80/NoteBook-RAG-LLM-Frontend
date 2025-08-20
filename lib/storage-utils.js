/**
 * Utility functions for localStorage operations with error handling
 */

const STORAGE_KEYS = {
  SOURCES: 'notebook-rag-sources',
  CHAT_MESSAGES: 'notebook-rag-chat-messages',
  APP_STATE: 'notebook-rag-app-state'
};

/**
 * Safely get data from localStorage
 */
export const getStoredData = (key, defaultValue = null) => {
  try {
    if (typeof window === 'undefined') return defaultValue;
    
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    return JSON.parse(stored);
  } catch (error) {
    console.warn(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Safely set data to localStorage
 */
export const setStoredData = (key, data) => {
  try {
    if (typeof window === 'undefined') return false;
    
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Remove data from localStorage
 */
export const removeStoredData = (key) => {
  try {
    if (typeof window === 'undefined') return false;
    
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Clear all app data from localStorage
 */
export const clearAllAppData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      removeStoredData(key);
    });
    return true;
  } catch (error) {
    console.warn('Error clearing app data:', error);
    return false;
  }
};

/**
 * Get stored sources
 */
export const getStoredSources = () => {
  return getStoredData(STORAGE_KEYS.SOURCES, []);
};

/**
 * Save sources to localStorage
 */
export const saveStoredSources = (sources) => {
  return setStoredData(STORAGE_KEYS.SOURCES, sources);
};

/**
 * Get stored chat messages
 */
export const getStoredMessages = () => {
  return getStoredData(STORAGE_KEYS.CHAT_MESSAGES, []);
};

/**
 * Save chat messages to localStorage
 */
export const saveStoredMessages = (messages) => {
  return setStoredData(STORAGE_KEYS.CHAT_MESSAGES, messages);
};

/**
 * Get stored app state
 */
export const getStoredAppState = () => {
  return getStoredData(STORAGE_KEYS.APP_STATE, {
    lastUpdated: null,
    version: '1.0.0'
  });
};

/**
 * Save app state to localStorage
 */
export const saveStoredAppState = (state) => {
  return setStoredData(STORAGE_KEYS.APP_STATE, {
    ...state,
    lastUpdated: new Date().toISOString()
  });
};

export { STORAGE_KEYS };
