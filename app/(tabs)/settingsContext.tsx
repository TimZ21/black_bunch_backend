// Author: Zhang Shuning
// Purpose: Context provider for managing and sharing settings across the app.
// Description: This file defines a React Context to handle user preferences 
//              like confidence threshold, bounding box color, and label display options,
//              which are used in the real-time black bunch detection app.

import React, { createContext, useState, useContext } from 'react';

// Define the structure of the settings context
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

// Create the context with default values
export const SettingsContext = createContext<SettingsContextType>({
  confidenceThreshold: 0.5,   // Default threshold
  setConfidenceThreshold: () => {},   // Placeholder function
  boxColor: '#00ffff',    // Default bounding box color
  setBoxColor: () => {},  // Placeholder function
  showConfidence: true,   // Whether to display confidence values
  setShowConfidence: () => {},    // Placeholder function
  showLabel: true,    // Whether to show object labels
  setShowLabel: () => {},   // Placeholder function
});

// Context provider component to wrap around parts of the app that need settings access
export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  // Define state variables and setters for each configurable setting
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [boxColor, setBoxColor] = useState('#00ffff');
  const [showConfidence, setShowConfidence] = useState(true);
  const [showLabel, setShowLabel] = useState(true);

  // Provide the current settings and updater functions to all children components
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