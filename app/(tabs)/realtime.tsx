import * as ImagePicker from 'expo-image-picker';
import { Alert, View, Image, Text, Button, SafeAreaView, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as ImageManipulator from 'expo-image-manipulator';
import * as B64toAB from 'base64-arraybuffer';
import Svg, { Rect, Text as SVGText } from "react-native-svg";

let model: tf.GraphModel;

export default function GalleryScreen() {
  const [imageUri, setImageUri] = useState("");
  const [detections, setDetections] = useState<number[][]>([]);
  const [modelLoaded, setModelLoaded] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready(); // Ensure TensorFlow.js is initialized
        console.log("TensorFlow Ready");

        // Load model asset
        const jsonAsset = JSON.stringify(require('../../assets/models/model.json'), null, 2);
        const binAsset = Asset.fromModule(require('../../assets/models/group1-shard1of1.bin'));

        // Create a local file path to save the downloaded file
        const jsonLocalFilePath = `${FileSystem.cacheDirectory}model.json`;
        const binLocalFilePath = `${FileSystem.cacheDirectory}shard1of1.bin`;

        // Download the file from the remote URL to the local file path
        await FileSystem.writeAsStringAsync(jsonLocalFilePath, jsonAsset, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await FileSystem.downloadAsync(binAsset.uri, binLocalFilePath);

        console.log("Model File Loaded");

        // Load the Json and Bin file into necessary format for model
        const modelJsonStr = await FileSystem.readAsStringAsync(jsonLocalFilePath);
        const modelJson = JSON.parse(modelJsonStr);
        const modelBinB64 = await FileSystem.readAsStringAsync(binLocalFilePath, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const modelBinArrayBuffer = B64toAB.decode(modelBinB64);

        // Load model details into ModelArtifact 
        const modelArtifacts = {
          modelTopology: modelJson.modelTopology, // The network architecture
          weightSpecs: modelJson.weightsManifest[0].weights, // Weight descriptions
          weightData: modelBinArrayBuffer, // The actual binary weights
        };

        console.log("ModelArtifact Ready");

        // Use ModelArtifact to load GraphModel
        model = await tf.loadGraphModel(tf.io.fromMemory(modelArtifacts));

        console.log("GraphModel Loaded");

        // Set state for model loaded
        setModelLoaded(1);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    loadModel();
  }, []);

  const openGallery = async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    let waitTime = 0;

    while (!modelLoaded) {
      await sleep(100); // Wait for 100ms
      waitTime += 100;
      console.log("Loading Model");

      if (waitTime > 120000)
        break;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'You need to grant gallery access to use this feature.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    setDetections([]);
    setTimeTaken(0);

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      await processImage(result.assets[0].uri);
    }
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
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    let waitTime = 0;

    while (!modelLoaded) {
      await sleep(100); // Wait for 100ms
      waitTime += 100;

      if (waitTime > 120000)
        break;
    }

    if (!modelLoaded) {
      Alert.alert('Model not loaded yet. Please wait...');
      return;
    }

    try {
      const startTime = performance.now();

      console.log('Loading image to be processed');

      // Resize image
      const resizedJpeg = await ImageManipulator.manipulateAsync(
        uri,
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

      // Choose only prediction more confident than 0.55
      let confidentDetections: number[][] = predictionArray[0].filter((prediction: number[]) => prediction[4] >= 0.55);
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

      setTimeTaken(endTime - startTime);
    } catch (error) {
      console.error('Error running YOLO model:', error);
    }
  };

  const ImageWithBoundingBoxes = ({ imageUri, boxes }) => {
    const { width: widthHeight } = Dimensions.get("window"); // Screen size

    return (
      <View style={{ flex: 1 }}>
        {/* Display Image */}
        <Image source={{ uri: imageUri }} style={{ width: widthHeight, height: widthHeight }} resizeMode="contain" />

        {/* Draw Bounding Boxes */}
        {detections.length > 0 &&
          <Svg style={{ position: "absolute", top: 0, left: 0, width: widthHeight, height: widthHeight }}>
            {boxes.map((box: number[], index: number) => {
              let [xStart, xEnd, yStart, yEnd, confidence, label] = box;
              xStart = xStart / 640 * widthHeight;
              xEnd = xEnd / 640 * widthHeight;
              yStart = yStart / 640 * widthHeight;
              yEnd = yEnd / 640 * widthHeight;

              let width = xEnd - xStart;
              let height = yEnd - yStart;

              return (
                <React.Fragment key={index}>
                  {/* Bounding Box */}
                  <Rect
                    x={xStart}
                    y={yStart}
                    width={width}
                    height={height}
                    stroke="red"
                    strokeWidth="2"
                    fill="transparent"
                  />
                  {/* Label */}
                  <SVGText x={xStart} y={yStart - 5} fill="red" fontSize="14">
                    {`Black Bunch (${(confidence * 100).toFixed(1)}%)`}
                  </SVGText>
                </React.Fragment>
              );
            })}
          </Svg>
        }
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View>
        {modelLoaded == 1 && <Button title="Open Gallery" onPress={openGallery} />}
        {detections.length > 0 && <Button title="Save Image" onPress={() => console.log('Save function here')} />}
        {timeTaken <= 0 && modelLoaded == 0 && <Text>Loading Model ...... </Text>}
        {timeTaken <= 0 && modelLoaded == 1 && imageUri != "" && <Text>Detecting Objects ...... </Text>}
        {timeTaken <= 0 && modelLoaded == 1 && imageUri == "" && <Text>Ready to Detect Objects ...... </Text>}
        {timeTaken > 0 && <Text>Objects Detected: {detections.length}</Text>}
        {timeTaken > 0 && <Text>Time Taken: {timeTaken}</Text>}
        {(imageUri != "") && <ImageWithBoundingBoxes imageUri={imageUri} boxes={detections}></ImageWithBoundingBoxes>}
      </View>
    </SafeAreaView>
  );
}