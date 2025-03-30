import React, { createContext, useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Create context
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

// Provider component
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

// Settings screen component
const SettingsScreen = () => {
    const { confidenceThreshold, setConfidenceThreshold, boxColor, setBoxColor } = useContext(SettingsContext);
    const router = useRouter();
    const [displayValue, setDisplayValue] = useState(confidenceThreshold); // Local

  const isSettingPage = true;


  const handleSliderComplete = (value: number) => {
    setDisplayValue(value);
    setConfidenceThreshold(value); // Update context only when released
    console.log("Confidence Updated:", value);
  };

  const handleColorChange = (color: string) => {
    setBoxColor(color);
    console.log('Bounding Box Color Updated:', color); // Log box color
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confidence Threshold</Text>
        <Slider
          value={displayValue}
          onSlidingComplete={handleSliderComplete}
          minimumValue={0.1}
          maximumValue={0.9}
          step={0.01}
          thumbTintColor="#2fa69d"
          minimumTrackTintColor="#256a65"
          style={styles.slider}
        />
        <Text style={styles.value}>{displayValue.toFixed(2)}</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Bounding Box Color</Text>
        
        <View style={styles.pickerContainer}>
          <Picker selectedValue={boxColor} onValueChange={setBoxColor} style={styles.picker} >
            <Picker.Item label="Red" value="#ff0000" />
            <Picker.Item label="Green" value="#00ff00" />
            <Picker.Item label="Blue" value="#0000ff" />
            <Picker.Item label="Yellow" value="#ffff00" />
            <Picker.Item label="Cyan" value="#00ffff" />
          </Picker>
        </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/upload')}>
          <Ionicons name="images-outline" size={24} color="white" />
          <Text style={styles.navText}>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/camera')}>
          <Ionicons name="camera-outline" size={24} color="white" />
          <Text style={styles.navText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, isSettingPage && styles.disabledButton]}
          onPress={() => router.push('/setting')}
          disabled={isSettingPage}
        >
          <Ionicons name="settings-outline" size={24} color={isSettingPage ? '#ccc' : 'black'} />
          <Text style={[styles.navText, isSettingPage && styles.disabledText]}>Setting</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e3fdfb',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    marginVertical: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#2fa69d',
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 5,
  },

  disabledButton: {
    opacity: 0.5, // Reduce opacity to indicate the button is disabled
  },
  disabledText: {
    color: '#ccc', // Change text color to indicate the button is disabled
  }
});
