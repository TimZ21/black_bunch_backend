import * as tf from '@tensorflow/tfjs';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as B64toAB from 'base64-arraybuffer';

let model: tf.GraphModel | null = null;
let loadingPromise: Promise<void> | null = null;
let isModelLoaded = false;

export const loadModel = async () => {
  if (isModelLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
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
      isModelLoaded = true;
    } catch (error) {
      console.error('Model loading failed:', error);
      throw error;
    }
  })();

  return loadingPromise;
};

export const getModel = () => {
  if (!model) throw new Error('Model not loaded');
  return model;
};
export const checkModelLoaded = () => !!model;