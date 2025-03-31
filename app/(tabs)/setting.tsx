import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettings } from './settingsContext';

const SettingsScreen = () => {
  const router = useRouter();
  const { 
    confidenceThreshold, 
    setConfidenceThreshold,
    boxColor, 
    setBoxColor,
    showConfidence, 
    setShowConfidence,
    showLabel, 
    setShowLabel
  } = useSettings();
  const [displayValue, setDisplayValue] = useState(confidenceThreshold);
  const isSettingPage = true;

  const handleSliderComplete = (value: number) => {
    setDisplayValue(value);
    setConfidenceThreshold(value);
    console.log("Confidence Updated:", value);
  };

  const handleColorChange = (color: string) => {
    setBoxColor(color);
    console.log('Bounding Box Color Updated:', color);
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
        <Text style={styles.label}>Bounding Box and Text Color</Text>
        <View style={styles.pickerContainer}>
          <Picker   
          selectedValue={boxColor}
          onValueChange={handleColorChange}
          style={styles.picker}
          dropdownIconColor="#000"
          mode="dropdown" // Force dropdown mode for iOS
          dropdownIconRippleColor="#2fa69d"
          numberOfLines={3}
          itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Red" value="#ff0000" />
            <Picker.Item label="Green" value="#00ff00" />
            <Picker.Item label="Blue" value="#0000ff" />
            <Picker.Item label="Yellow" value="#ffff00" />
            <Picker.Item label="Cyan" value="#00ffff" />
            <Picker.Item label="White" value="#ffffff" />
            <Picker.Item label="Silver" value="#c0c0c0" />
            <Picker.Item label="Gray" value="#808080" />
            <Picker.Item label="Black" value="#000000" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Display Object Labels</Text>
        <View style={styles.toggleContainer}>
          <Text>Show Labels</Text>
          <Switch
            value={showLabel}
            onValueChange={setShowLabel}
            trackColor={{ false: "#767577", true: "#2fa69d" }}
            thumbColor={showLabel ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Display Confidence Percentage</Text>
        <View style={styles.toggleContainer}>
          <Text>Show Confidence</Text>
          <Switch
            value={showConfidence}
            onValueChange={setShowConfidence}
            trackColor={{ false: "#767577", true: "#2fa69d" }}
            thumbColor={showConfidence ? "#f4f3f4" : "#f4f3f4"}
          />
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: Platform.select({
      ios: 80,  // Increased height for iOS
      android: 70
    }),
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#2fa69d',
    paddingBottom: Platform.select({
      ios: 10,  // Add bottom padding for iOS home indicator
      android: 0
    }),
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
  },

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
    overflow: 'hidden', // Add this for iOS dropdown
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 55, // Taller height for iOS dropdown
    width: '100%',
    color: '#000',
    backgroundColor: '#fff',
  },
  pickerItem: {
    color: '#000',
    fontSize: 16,
    height: Platform.OS === 'ios' ? 200 : 55, // Adjust item height for iOS
    backgroundColor: '#fff', // Ensure white background for items
  },
});
