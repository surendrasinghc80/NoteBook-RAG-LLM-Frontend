"use client";

import { createContext, useContext, useReducer, useEffect } from 'react';
import {
  getStoredSources,
  saveStoredSources,
  getStoredMessages,
  saveStoredMessages,
  getStoredAppState,
  saveStoredAppState
} from '@/lib/storage-utils';

// Create context
const PersistentDataContext = createContext();

// Action types
const ACTIONS = {
  LOAD_INITIAL_DATA: 'LOAD_INITIAL_DATA',
  ADD_SOURCES: 'ADD_SOURCES',
  DELETE_SOURCE: 'DELETE_SOURCE',
  UPDATE_SOURCE: 'UPDATE_SOURCE',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  SET_MESSAGES: 'SET_MESSAGES',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  CLEAR_ALL_DATA: 'CLEAR_ALL_DATA'
};

// Initial state
const initialState = {
  sources: [],
  messages: [],
  isLoaded: false,
  lastUpdated: null
};

// Reducer function
const persistentDataReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_INITIAL_DATA:
      return {
        ...state,
        sources: action.payload.sources || [],
        messages: action.payload.messages || [],
        isLoaded: true,
        lastUpdated: action.payload.lastUpdated
      };

    case ACTIONS.ADD_SOURCES:
      const newSources = [...state.sources, ...action.payload];
      return {
        ...state,
        sources: newSources
      };

    case ACTIONS.DELETE_SOURCE:
      const filteredSources = state.sources.filter(source => source.id !== action.payload);
      return {
        ...state,
        sources: filteredSources
      };

    case ACTIONS.UPDATE_SOURCE:
      const updatedSources = state.sources.map(source =>
        source.id === action.payload.id ? { ...source, ...action.payload.updates } : source
      );
      return {
        ...state,
        sources: updatedSources
      };

    case ACTIONS.ADD_MESSAGE:
      const newMessages = [...state.messages, action.payload];
      return {
        ...state,
        messages: newMessages
      };

    case ACTIONS.UPDATE_MESSAGE:
      const updatedMessages = state.messages.map(message =>
        message.id === action.payload.id ? { ...message, ...action.payload.updates } : message
      );
      return {
        ...state,
        messages: updatedMessages
      };

    case ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };

    case ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        messages: []
      };

    case ACTIONS.CLEAR_ALL_DATA:
      return {
        ...initialState,
        isLoaded: true
      };

    default:
      return state;
  }
};

// Provider component
export const PersistentDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(persistentDataReducer, initialState);

  // Load initial data from localStorage on mount
  useEffect(() => {
    const loadInitialData = () => {
      const sources = getStoredSources();
      const messages = getStoredMessages();
      const appState = getStoredAppState();

      // Convert string dates back to Date objects for sources
      const processedSources = sources.map(source => ({
        ...source,
        uploadedAt: source.uploadedAt ? new Date(source.uploadedAt) : new Date(),
        timestamp: source.timestamp ? new Date(source.timestamp) : new Date()
      }));

      // Convert string dates back to Date objects for messages
      const processedMessages = messages.map(message => ({
        ...message,
        timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
      }));

      dispatch({
        type: ACTIONS.LOAD_INITIAL_DATA,
        payload: {
          sources: processedSources,
          messages: processedMessages,
          lastUpdated: appState.lastUpdated
        }
      });
    };

    loadInitialData();
  }, []);

  // Save sources to localStorage whenever they change
  useEffect(() => {
    if (state.isLoaded) {
      saveStoredSources(state.sources);
    }
  }, [state.sources, state.isLoaded]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (state.isLoaded) {
      saveStoredMessages(state.messages);
    }
  }, [state.messages, state.isLoaded]);

  // Save app state whenever data changes
  useEffect(() => {
    if (state.isLoaded) {
      saveStoredAppState({
        version: '1.0.0',
        sourcesCount: state.sources.length,
        messagesCount: state.messages.length
      });
    }
  }, [state.sources.length, state.messages.length, state.isLoaded]);

  // Action creators
  const actions = {
    addSources: (sources) => {
      dispatch({ type: ACTIONS.ADD_SOURCES, payload: sources });
    },

    deleteSource: (sourceId) => {
      dispatch({ type: ACTIONS.DELETE_SOURCE, payload: sourceId });
    },

    updateSource: (sourceId, updates) => {
      dispatch({ type: ACTIONS.UPDATE_SOURCE, payload: { id: sourceId, updates } });
    },

    addMessage: (message) => {
      dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message });
    },

    updateMessage: (messageId, updates) => {
      dispatch({ type: ACTIONS.UPDATE_MESSAGE, payload: { id: messageId, updates } });
    },

    setMessages: (messages) => {
      dispatch({ type: ACTIONS.SET_MESSAGES, payload: messages });
    },

    clearMessages: () => {
      dispatch({ type: ACTIONS.CLEAR_MESSAGES });
    },

    clearAllData: () => {
      dispatch({ type: ACTIONS.CLEAR_ALL_DATA });
    }
  };

  const contextValue = {
    ...state,
    ...actions
  };

  return (
    <PersistentDataContext.Provider value={contextValue}>
      {children}
    </PersistentDataContext.Provider>
  );
};

// Custom hook to use the context
export const usePersistentData = () => {
  const context = useContext(PersistentDataContext);
  if (!context) {
    throw new Error('usePersistentData must be used within a PersistentDataProvider');
  }
  return context;
};

export default PersistentDataContext;
