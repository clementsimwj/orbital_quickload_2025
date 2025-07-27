import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import * as SecureStore from 'expo-secure-store';


type PreferencesContextType = {
  preferredMachines: string[];
  addMachine: (machineId: string) => Promise<void>;
  removeMachine: (machineId: string) => Promise<void>;
  isPreferred: (machineId: string) => boolean;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

type PreferencesProviderProps = {
  children: ReactNode;
};

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const [preferredMachines, setPreferredMachines] = useState<string[]>([]);
  const { username } = useAuth();

  const prefKey = username ? `preferred_machines_${username}` : null;

  useEffect(() => {
    const loadPreferences = async () => {
      if (!prefKey) return;
      try {
        const stored = await SecureStore.getItemAsync(prefKey);
        if (stored) {
          setPreferredMachines(JSON.parse(stored));
        } else {
          setPreferredMachines([]); // Clear state if no stored data
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, [prefKey]);

  const savePreferences = async (prefs: string[]) => {
    if (!prefKey) return;
    try {
      await SecureStore.setItemAsync(prefKey, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const addMachine = async (machineId: string) => {
    if (!preferredMachines.includes(machineId)) {
      const updated = [...preferredMachines, machineId];
      setPreferredMachines(updated);
      await savePreferences(updated);
    }
  };

  const removeMachine = async (machineId: string) => {
    const updated = preferredMachines.filter(id => id !== machineId);
    setPreferredMachines(updated);
    await savePreferences(updated);
  };

  const isPreferred = (machineId: string): boolean => {
    return preferredMachines.includes(machineId);
  };

  return (
    <PreferencesContext.Provider value={{ preferredMachines, addMachine, removeMachine, isPreferred }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
