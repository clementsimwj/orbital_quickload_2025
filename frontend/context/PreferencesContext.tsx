import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const PREF_KEY = 'preferred_machines';

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

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await SecureStore.getItemAsync(PREF_KEY);
        if (stored) {
          setPreferredMachines(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  const savePreferences = async (prefs: string[]) => {
    try {
      await SecureStore.setItemAsync(PREF_KEY, JSON.stringify(prefs));
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
