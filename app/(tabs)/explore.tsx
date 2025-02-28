import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// import { openCamera } from './camera';

const UPLOAD_URL = 'https://your-server.com/upload'; // Replace with your API endpoint

const ExploreScreen: React.FC = () => {
  const router = useRouter();
  const isGalleryPage = false; // Change this based on your logic


  // Function to pick an image and upload it
  const pickImageAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'You need to allow access to the gallery to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const fileName = uri.split('/').pop();
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: fileName,
        type: 'image/jpeg',
      } as any);

      try {
        const response = await fetch(UPLOAD_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const json = await response.json();
        Alert.alert('Upload Successful', 'Your image has been uploaded successfully.');
      } catch (error) {
        Alert.alert('Upload Failed', 'There was an error uploading your image.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContent}>
        <Text style={styles.header}>Album</Text>
        <Text style={styles.subHeader}>No images processed yet.</Text>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, isGalleryPage && styles.disabledButton]}
          onPress={() => router.push('/gallery')}
          disabled={isGalleryPage}
        >
          <Ionicons name="images-outline" size={24} color={isGalleryPage ? '#ccc' : 'white'} />
          <Text style={[styles.navText, isGalleryPage && styles.disabledText]}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}
        //  onPress={openCamera}
        onPress={() => router.push('/camera')}>
          <Ionicons name="camera-outline" size={24} color="white" />
          <Text style={styles.navText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/real-time')}>
          <Ionicons name="videocam-outline" size={24} color="white" />
          <Text style={styles.navText}>Real Time</Text>
        </TouchableOpacity>

        {/* Upload Image Button */}
        <TouchableOpacity style={styles.navButton} onPress={() => pickImageAndUpload}>
          <Ionicons name="cloud-upload-outline" size={24} color="white" />
          <Text style={styles.navText}>Upload</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3fdfb',
  },
  topContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    color: '#000',
    marginBottom: 30,
  },
  bottomNav: {
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
    opacity: 0.5,
  },
  disabledText: {
    color: '#ccc',
  },
});

export default ExploreScreen;