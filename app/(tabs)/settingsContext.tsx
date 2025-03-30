import React, { createContext, useState, useContext } from 'react';

interface SettingsContextType {
  confidenceThreshold: number;
  setConfidenceThreshold: (value: number) => void;
  boxColor: string;
  setBoxColor: (color: string) => void;
  showConfidence: boolean;
  setShowConfidence: (value: boolean) => void;
  showLabel: boolean;
  setShowLabel: (value: boolean) => void;
}

export const SettingsContext = createContext<SettingsContextType>({
  confidenceThreshold: 0.5,
  setConfidenceThreshold: () => {},
  boxColor: '#00ffff',
  setBoxColor: () => {},
  showConfidence: true,
  setShowConfidence: () => {},
  showLabel: true,
  setShowLabel: () => {},
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [boxColor, setBoxColor] = useState('#00ffff');
  const [showConfidence, setShowConfidence] = useState(true);
  const [showLabel, setShowLabel] = useState(true);

  return (
    <SettingsContext.Provider 
      value={{ 
        confidenceThreshold, 
        setConfidenceThreshold, 
        boxColor, 
        setBoxColor,
        showConfidence,
        setShowConfidence,
        showLabel,
        setShowLabel
     }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);