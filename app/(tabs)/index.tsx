import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';

const HomeScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Add the logo image */}
        <Image
          source={require('../../assets/images/AgriVisionLogo-noBG.png')} // Adjust the path to your logo.png
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}></Text>
        <Text style={styles.subtitle}>Black Bunch Detection</Text>
        <Text style={styles.description}>Make informed harvest decisions</Text>
        <Text style={styles.description}>anytime, anywhere</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/upload')} // Navigate to another page
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
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
});

export default HomeScreen;