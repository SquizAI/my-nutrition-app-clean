import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LogEntry {
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'calculation';
  category: 'meal' | 'macro' | 'user' | 'system';
  message: string;
  data?: any;
}

interface LoggingStore {
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, 'timestamp'>) => void;
  clearLogs: () => void;
  getLogs: (category?: LogEntry['category']) => LogEntry[];
  exportLogs: () => string;
}

const useLoggingStore = create<LoggingStore>((set, get) => ({
  logs: [],
  
  addLog: (entry) => {
    const newEntry: LogEntry = {
      ...entry,
      timestamp: new Date(),
    };
    
    set((state) => ({
      logs: [...state.logs, newEntry]
    }));

    // Also log to console in development
    if (import.meta.env.DEV) {
      const logMethod = entry.type === 'error' ? console.error : 
                       entry.type === 'warning' ? console.warn : 
                       entry.type === 'calculation' ? console.info :
                       console.log;
      logMethod(`[${entry.category.toUpperCase()}] ${entry.message}`, entry.data || '');
    }
  },

  clearLogs: () => set({ logs: [] }),

  getLogs: (category) => {
    const logs = get().logs;
    return category ? logs.filter(log => log.category === category) : logs;
  },

  exportLogs: () => {
    const logs = get().logs;
    return JSON.stringify(logs, (key, value) => {
      if (key === 'timestamp') {
        return new Date(value).toISOString();
      }
      return value;
    }, 2);
  }
}));

// Convenience functions for common logging operations
export const logCalculation = (message: string, data?: any) => {
  useLoggingStore.getState().addLog({
    type: 'calculation',
    category: 'macro',
    message,
    data
  });
};

export const logMeal = (message: string, data?: any) => {
  useLoggingStore.getState().addLog({
    type: 'info',
    category: 'meal',
    message,
    data
  });
};

export const logMacro = (message: string, data?: any) => {
  useLoggingStore.getState().addLog({
    type: 'info',
    category: 'macro',
    message,
    data
  });
};

export const logUser = (message: string, data?: any) => {
  useLoggingStore.getState().addLog({
    type: 'info',
    category: 'user',
    message,
    data
  });
};

export const logError = (category: LogEntry['category'], message: string, data?: any) => {
  useLoggingStore.getState().addLog({
    type: 'error',
    category,
    message,
    data
  });
};

export const logWarning = (category: LogEntry['category'], message: string, data?: any) => {
  useLoggingStore.getState().addLog({
    type: 'warning',
    category,
    message,
    data
  });
};

export const logInfo = (category: LogEntry['category'], message: string, data?: any) => {
  useLoggingStore.getState().addLog({
    type: 'info',
    category,
    message,
    data
  });
};

export default useLoggingStore; 