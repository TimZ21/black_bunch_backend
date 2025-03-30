import React, { createContext, useState, useContext } from 'react';

interface SettingsContextType {
  confidenceThreshold: number;
  setConfidenceThreshold: (value: number) => void;
  boxColor: string;
  setBoxColor: (color: string) => void;
}

export const SettingsContext = createContext<SettingsContextType>({
  confidenceThreshold: 0.5,
  setConfidenceThreshold: () => {},
  boxColor: '#ff0000',
  setBoxColor: () => {},
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [boxColor, setBoxColor] = useState('#ff0000');

  return (
    <SettingsContext.Provider 
      value={{ confidenceThreshold, setConfidenceThreshold, boxColor, setBoxColor }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);