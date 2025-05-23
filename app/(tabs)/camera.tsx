// Author: Zhang Shuning (Main functionality) Sanya(Save Image Button, UI) Yi Rou(UI)
// Purpose: Camera capture screen for real-time Black Bunch detection using YOLO model
// Adapted from: https://docs.expo.dev/ and https://github.com/tensorflow/tfjs
// Description: Uses TensorFlow.js to run a YOLOv5 model on captured images,
//               detects 'Black Bunch' in palm fruit images, displays bounding boxes,
//               and allows saving results to the gallery.
// Libraries used: expo-image-picker, react-native-svg, tensorflow/tfjs-react-native

import React, { useState, useEffect, useRef } from 'react';
import { Alert, View, Image, Text, SafeAreaView, Dimensions, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ViewShot from "react-native-view-shot";
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as ImageManipulator from 'expo-image-manipulator';
import * as B64toAB from 'base64-arraybuffer';
import Svg, { Rect, Text as SVGText } from "react-native-svg";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { getModel, loadModel } from './modelLoader';
import { useSettings } from './settingsContext';

export default function CameraScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState("");
  const [detections, setDetections] = useState<number[][]>([]);
  const [camera, setCamera] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

    const { confidenceThreshold, boxColor, showConfidence, showLabel } = useSettings();

  const isCameraPage = true; // Indicates the current page is the camera page

  // Function to reset everything
    const resetState = () => {
        setImageUri("");
        setDetections([]);
        setTimeTaken(0);
    };

  const model = getModel();

  useEffect(() => {
    const checkModel = async () => {
      try {
        await loadModel(); // From your modelLoader
        setModelReady(true);
      } catch (e) {
        console.error('Model failed to load');
      }
    };
    checkModel();
  }, []);

  const openCamera = async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    let waitTime = 0;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'You need to grant camera access to use this feature.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });

    // Function to reset everything
    if (result.canceled) {
      resetState();
      return;
    }
    resetState();
    setImageUri(result.assets[0].uri);
    await processImage(result.assets[0].uri);
  };


  const computeIoU = (detection1: number[], detection2: number[]) => {
    const [x1g, x2g, y1g, y2g] = detection1; // Ground truth box
    const [x1, x2, y1, y2] = detection2; // Predicted box

    // Compute intersection
    const xi1 = Math.max(x1, x1g);
    const yi1 = Math.max(y1, y1g);
    const xi2 = Math.min(x2, x2g);
    const yi2 = Math.min(y2, y2g);
    const interWidth = Math.max(0, xi2 - xi1);
    const interHeight = Math.max(0, yi2 - yi1);
    const intersection = interWidth * interHeight;

    // Compute union
    const box1Area = (x2 - x1) * (y2 - y1);
    const box2Area = (x2g - x1g) * (y2g - y1g);
    const union = box1Area + box2Area - intersection;

    return union === 0 ? 0 : intersection / union;
  };

  const processImage = async (uri) => {
      startSpinning();
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    let waitTime = 0;

    if (!modelReady) {
      Alert.alert('Model loading...');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'You need to grant gallery access to use this feature.');
      return;
    }

    try {
      const startTime = performance.now();

      console.log('Loading image to be processed');

      let jpegLocalFilePath = uri;

      if (!camera) {
        // Load image
        const jpegAsset = Asset.fromModule(require('../../assets/models/test.jpeg'));
        jpegLocalFilePath = `${FileSystem.cacheDirectory}test.jpeg`;
        await FileSystem.downloadAsync(jpegAsset.uri, jpegLocalFilePath);
      }

      // Resize image
      const resizedJpeg = await ImageManipulator.manipulateAsync(
        jpegLocalFilePath,
        [{ resize: { width: 640, height: 640 } }], // Resize to model input size
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Set imageUri state for reload
      setImageUri(resizedJpeg.uri);

      // Load and preprocess image tensor to scale to float, normalize to 255 add 1 additional dimension for batch size
      const resizedJpegB64 = await FileSystem.readAsStringAsync(resizedJpeg.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const rawImageTensor = decodeJpeg(new Uint8Array(B64toAB.decode(resizedJpegB64)));
      const preprocessedImageTensor = (rawImageTensor.toFloat().div(tf.scalar(255))).expandDims(0);

      console.log("Image Tensor Loaded and Preprocessed");

      // Call for model prediction
      const outputTensor = model.predict(preprocessedImageTensor);
      const predictionArray = await outputTensor.array();

      // Choose only prediction more confident threshold than set confidence
      let confidentDetections: number[][] = predictionArray[0].filter((prediction: number[]) => prediction[4] >= confidenceThreshold);
      console.log("Confidence Threshold: ", confidenceThreshold);
      confidentDetections = confidentDetections.sort((a: number[], b: number[]) => a[4] - b[4]);

      // Transform the format of outputTensor into something more usable
      for (let i = 0; i < confidentDetections.length; i++) {
        let xStart = confidentDetections[i][0] - (confidentDetections[i][2] / 2.0);
        let yStart = confidentDetections[i][1] - (confidentDetections[i][3] / 2.0);

        confidentDetections[i][0] = xStart;
        confidentDetections[i][1] = xStart + confidentDetections[i][2];
        confidentDetections[i][2] = yStart;
        confidentDetections[i][3] = yStart + confidentDetections[i][3];
      }

      let cleanDetections: number[][] = [];
      // Select detections with IOU limit
      if (confidentDetections.length > 0) {
        cleanDetections.push(confidentDetections[0]);
      }
      for (let confi = 1; confi < confidentDetections.length; confi++) {
        let cleanFlag = true;

        for (let clean = 0; clean < cleanDetections.length; clean++) {
          if (computeIoU(cleanDetections[clean], confidentDetections[confi]) > 0.4)
            cleanFlag = false;
        }

        if (cleanFlag)
          cleanDetections.push(confidentDetections[confi]);
      }

      setDetections(cleanDetections);

      console.log("Prediction Complete");

      const endTime = performance.now();

      setTimeTaken(Math.round(endTime - startTime));
    } catch (error) {
      console.error('Error running YOLO model:', error);
    }
  };

    const viewShotRef = useRef(null);

    const ImageWithBoundingBoxes = ({ imageUri, boxes }) => {
      const { width: widthHeight } = Dimensions.get("window"); // Screen size

        if (boxes.length === 0) {
          // Render only the image if no bounding boxes
          return (
            <Image source={{ uri: imageUri }} style={{ width: widthHeight, height: widthHeight }} resizeMode="contain" />
          );
        }
        else {
            return (
                  <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1 }}>
                    <View style={{ flex: 1 }}>
                      {/* Display Image */}
                      <Image source={{ uri: imageUri }} style={{ width: widthHeight, height: widthHeight }} resizeMode="contain" />

                      {/* Draw Bounding Boxes */}
                      <Svg style={{ position: "absolute", top: 0, left: 0, width: widthHeight, height: widthHeight }}>
                        {boxes.map((box: number[], index: number) => {
                          let [xStart, xEnd, yStart, yEnd, confidence] = box;
                          xStart = (xStart / 640) * widthHeight;
                          xEnd = (xEnd / 640) * widthHeight;
                          yStart = (yStart / 640) * widthHeight;
                          yEnd = (yEnd / 640) * widthHeight;

                          let width = xEnd - xStart;
                          let height = yEnd - yStart;

                          return (
                            <React.Fragment key={index}>
                              {/* Bounding Box */}
                              <Rect x={xStart} y={yStart} width={width} height={height} stroke={boxColor} strokeWidth="2" fill="transparent" />
                              {/* Show lable and confidence */}
                              {showConfidence && showLabel && (
                                <SVGText x={xStart} y={yStart - 5} fill={boxColor} fontSize="14">
                                  Black Bunch ({(confidence * 100).toFixed(1)}%)
                                </SVGText>
                              )}

                              {/* Only show confidence */}
                              {showConfidence && !showLabel && (
                                <SVGText x={xStart} y={yStart - 5} fill={boxColor} fontSize="14">
                                  {(confidence * 100).toFixed(1)}%
                                </SVGText>
                              )}

                              {/* Only show label */}
                              {!showConfidence && showLabel && (
                                <SVGText x={xStart} y={yStart - 5} fill={boxColor} fontSize="14">
                                  Black Bunch
                                </SVGText>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </Svg>
                    </View>
                  </ViewShot>
                );
              };
            }
    // Save Image
    const saveImageToGallery = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to grant permission to save images to your gallery.');
        return;
      }

      try {
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Saved', 'Image with bounding boxes saved to gallery!');
      } catch (error) {
        Alert.alert('Error', 'Failed to save image');
        console.error('Failed to save image:', error);
      }
    };

  const spinValue = useRef(new Animated.Value(0)).current;

  const startSpinning = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

    return (
        <SafeAreaView style={styles.container}>
          {/* Top Content */}
          <View style={styles.topContent}>
            <Text style={styles.header}>Camera</Text>
            <Text style={styles.subHeader}>Capture an image to detect palm fruits</Text>

            {timeTaken > 0 && (
              <View style={styles.resultsContainer}>
                {detections.length === 0 ? (
                  <Ionicons name="alert-circle-outline" size={55} color="#ff4d4d" />
                ) : (
                  <Ionicons name="checkmark-circle-outline" size={55} color="#4CAF50" />
                )}
                <View style={styles.resultsTextContainer}>
                  {detections.length === 0 ? (
                    <Text style={[styles.detectionText, { color: "#ff4d4d" }]}>Not Detected</Text>
                  ) : (
                    <Text style={[styles.detectionText, { color: "#4CAF50" }]}>Detected</Text>
                  )}
                  <Text style={styles.resultsText}>Objects Detected: {detections.length}</Text>
                  <Text style={styles.resultsText}>Time Taken: {timeTaken} ms</Text>
                </View>
              </View>
            )}
          </View>

          {/* Middle Content */}
          <View style={styles.middleContent}>
            {imageUri === "" && (
              <TouchableOpacity style={styles.galleryButton} onPress={openCamera}>
                <Ionicons name="image-outline" size={60} color="#2fa69d" />
                <Text style={styles.galleryButtonText}>Open Camera</Text>
              </TouchableOpacity>
            )}

            {timeTaken <= 0 && imageUri !== "" && (
              <View style={styles.detectingContainer}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="sync-circle-outline" size={50} color="#2fa69d" />
                </Animated.View>
                <Text style={styles.detectingText}>Detecting Palm Fruits...</Text>
              </View>
            )}

            {timeTaken <= 0 && imageUri === "" && <Text style={styles.loadingText}>Ready to Detect Objects</Text>}

            {imageUri !== "" && (
              <>
                <ImageWithBoundingBoxes imageUri={imageUri} boxes={detections} />

                {detections.length === 0 && timeTaken > 0 && (
                  <View style={styles.noResultContainer}>
                    <Text style={styles.tryAnotherText}>Please try uploading a clearer image.</Text>
                    <TouchableOpacity style={styles.n_reuploadButton} onPress={openCamera}>
                      <Ionicons name="image-outline" size={20} color="#fff" />
                      <Text style={styles.reuploadButtonText}>CAMERA</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>

          {detections.length > 0 && (
            <View style={styles.bottomActionContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={saveImageToGallery}>
                <Ionicons name="save-outline" size={20} color="white" />
                <Text style={styles.saveButtonText}>SAVE IMAGE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reuploadButton} onPress={openCamera}>
                <Ionicons name="image-outline" size={20} color="#fff" />
                <Text style={styles.reuploadButtonText}>CAMERA</Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/upload')} enabled>
              <Ionicons name="image-outline" size={24} color="white" />
              <Text style={styles.navText}>Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.navButton, isCameraPage && styles.disabledButton]}
              onPress={() => router.push('/camera')}
              disabled={isCameraPage}>
              <Ionicons name="camera-outline" size={24} color={isCameraPage ? '#ccc' : 'black'} />
              <Text style={[styles.navText, isCameraPage && styles.disabledText]}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/setting')} enabled>
            <Ionicons name="settings-outline" size={24} color="white" />
            <Text style={styles.navText}>Setting</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#e3fdfb',
      paddingBottom: 60, 
    },

    topContent: {
      alignItems: 'center',
      paddingTop: 20,
    },
    header: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#000',
    },
    subHeader: {
      fontSize: 18,
      color: '#000',
      marginTop: 5,
    },
    middleContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 70, // Add margin for navigation
    },
    galleryButton: {
      alignItems: 'center',
      padding: 20,
      borderWidth: 2,
      borderColor: '#2fa69d',
      borderRadius: 10,
    },
    galleryButtonText: {
      fontSize: 18,
      color: '#2fa69d',
      marginTop: 10,
    },

    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff6f61',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
        shadowColor: '#ff3b2f',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
        bottom: Platform.select({
          ios: 30,  // Increased height for iOS
          android: 0
        }),
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
    },

    loadingText: {
      fontSize: 16,
      color: '#000',
      marginBottom: 20,
      fontWeight: '500',
      marginTop: 50,
    },

    resultsContainer: {
        flexDirection: 'row',  // Align icon and text side by side
        alignItems: 'center',  // Center vertically
        marginTop: 15,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
      },

      resultText: {
        marginTop: 10,
        fontSize: 20,
        fontWeight: '500',
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

    noResultContainer: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 15,
    },

    detectionText: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    tryAnotherText: {
      fontSize: 15,
      fontWeight: '500',
      color: '#666',
      textAlign: 'center',
      marginBottom: 10,
      lineHeight: 22,
    },

    reuploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2fa69d',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 8,
      shadowColor: '#ff3b2f',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
      bottom: Platform.select({
        ios: 30,  // Increased height for iOS
        android: 0
      }),
    },

    n_reuploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2fa69d',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 8,
      shadowColor: '#ff3b2f',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },

    reuploadButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 6,
    },

    detectedResultContainer: {
        alignItems: 'center',
    },

    bottomActionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 30,
    },

    detectingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        gap: 12,  // Space between spinner and text
    },

    detectingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2fa69d',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

});