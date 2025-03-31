import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, Animated} from 'react-native';
import { useRouter } from 'expo-router';
import { loadModel } from './modelLoader';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading, spinValue]);

  const handleGetStarted = async () => {
    try {
      setLoading(true);
      await loadModel();
      router.push('/upload');
    } catch (error) {
      console.error('Model load failed:', error);
      alert('Failed to load model. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

    const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Add the logo image */}
      <Image
      source={require('../../assets/images/AgriVisionLogo-noBG.png')} // Adjust the path to your logo.png
      style={styles.logo}
      resizeMode="contain"
      />
            <Image
      source={require('../../assets/images/AppTitle-noBG.png')} // Adjust the path to your logo.png
      style={styles.title_img}
      resizeMode="contain"
      />
      <Text style={styles.title}></Text>
      <Text style={styles.subtitle}>Black Bunch Detection</Text>
      <Text style={styles.description}>Make informed harvest decisions</Text>
      <Text style={styles.description}>anytime, anywhere</Text>
      {/* ... existing UI elements ... */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGetStarted}
        disabled={loading}
      >
        {/* The content display when loading */}
        {loading ? (
          <View style={styles.detectingContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="sync-circle-outline" size={50} color="#fff" />
          </Animated.View>
          <Text style={styles.detectingText}>Loading Model...</Text>
        </View>
        ) :
        
        // The content before loading
        (
          <Text style={styles.buttonText}>Get Started</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3fdfb', // White background
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 280, // Adjust the width as needed
    height: 280, // Adjust the height as needed
    marginBottom: 20, // Space between the logo and the title
  },
  title_img: {
    width: 200, // Adjust the width as needed
    height: 80, // Adjust the height as needed
    marginBottom: 20, // Space between the logo and the title
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000', // Black text
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000', // Black text
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#000', // Black text
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#256a65', // Black button
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF', // White text
  },

  detectingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  detectingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default HomeScreen;