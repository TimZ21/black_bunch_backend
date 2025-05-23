# Welcome to Agrivision 👋

## **Black Bunch Detection Mobile Application – Project Brief**

The **Black Bunch Detection Mobile Application** is an object detection system designed to identify **black bunches** in oil palm plantations using an optimized **YOLOv5 model**. Developed with **React Native (Expo)** and **TensorFlow.js**, the app allows users—particularly plantation workers and smallholders—to capture or upload images of oil palm trees, detect black bunches with **bounding boxes**, and save results directly to their device gallery. The solution is lightweight and runs entirely **offline** on mobile devices, ensuring functionality in rural areas without internet connectivity.

🏆 **Award**: This project was recognized as the **Best Industry Project** for **COMP2019 (2024–2025)** University of Nottingham Malaysia.

**Project Repository**: [https://github.com/TimZ21/black_bunch_detection](https://github.com/TimZ21/black_bunch_detection)

--- 

## Guide to Install Environment and Run the Black Bunch Detection App

This guide will walk you through the steps required to set up your development environment and run the Black Bunch Detection mobile application using Expo and React Native.

### 1. **Prerequisites**

Before getting started, you’ll need to have the following software installed:

- **Node.js**: The app uses JavaScript, and Node.js is required to run the development server and install dependencies.
  - Download Node.js from [https://nodejs.org/](https://nodejs.org/).
  - Choose the LTS (Long-Term Support) version.

- **Expo CLI**: Expo is a framework for building React Native applications. It helps streamline the development and testing process.
  - Install Expo CLI globally using npm (which comes with Node.js):
    ```bash
    npm install -g expo-cli
    ```

- **Git**: Git is required to clone the project repository.
  - Install Git from [https://git-scm.com/](https://git-scm.com/).

- **Expo Go App (Optional)**: The Expo Go app is available for testing the app on a physical device.
  - **iOS**: Available on the App Store.
  - **Android**: Available on Google Play.

### 2. **Clone the Repository**

Clone the repository containing the project’s source code to your local machine.

```bash
git clone https://github.com/TimZ21/black_bunch_detection.git
```

Navigate to the project directory:

```bash
cd black_bunch_detection
```

### 3. **Install Dependencies**

Once you have the project files on your local machine, run the following command to install the project’s dependencies:

```bash
npm install
```

This command installs all the necessary libraries and packages required to run the app.
If this command doesn't work, please try:
```bash
npm install --force
```

### 4. **Start the Expo Development Server**

Now that your environment is set up and dependencies are installed, you can start the Expo development server.

To start the app, run the following command:

```bash
expo start
```
or
```bash
npx expo start
```
This command will open the Expo developer tools in your browser.

### 5. **Run the App on a Device**

#### Option 1: Run on Physical Device using Expo Go

1. **Install Expo Go**:
   - **iOS**: Download it from the [App Store](https://apps.apple.com/us/app/expo-go/id982107779).
   - **Android**: Download it from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).

2. **Scan the QR Code**:
   - In the Expo developer tools (opened automatically in your browser), you will see a QR code.
   - Open the Expo Go app on your mobile device and scan the QR code. This will load the app on your phone.

#### Option 2: Run on an Emulator/Simulator

1. **For iOS (Mac only)**:
   - If you’re using a Mac, you can run the app on the iOS Simulator by running the following command:
     ```bash
     expo ios
     ```
   - This will open the iOS Simulator and automatically run the app.

2. **For Android**:
   - You can run the app on an Android emulator. First, ensure that you have Android Studio installed.
   - Launch the Android emulator, and then run the following command:
     ```bash
     expo android
     ```

### 6. **Running the App in Production Mode (Optional)**

For a production build, you may want to run the app in a production-like environment. To do this, you need to create a production build for either Android or iOS.

- **For Android**:
  ```bash
  expo build:android
  ```

- **For iOS**:
  ```bash
  expo build:ios
  ```

Once the build is complete, you will receive a link to download the `.apk` (Android) or `.ipa` (iOS) file for installation.

### 7. **Additional Configuration (Optional)**

If you are working with the codebase and need to modify specific configurations, you can edit the `app.json` file to set custom settings for the app, such as app name, icon, splash screen, and more.

### 8. **Known Issues and Troubleshooting**

- **App not loading on the device**: Make sure your device is on the same Wi-Fi network as your development machine.
- **Expo Go crashes or freezes**: Try restarting the app on your device or emulator by scanning the QR code again or restarting the app using `expo start`.

### 9. **Dependencies Used in the App**

This project uses the following major dependencies:
- **TensorFlow.js**: For running the YOLOv5 model.
- **expo-image-picker**: To allow users to select images for detection.
- **react-native-svg**: To display bounding boxes on the images.
- **tensorflow/tfjs-react-native**: For TensorFlow.js compatibility with React Native.

Make sure you have the necessary versions of these dependencies installed by running `npm install`.

---

This guide should help you get started with setting up the environment and running the Black Bunch Detection app using Expo and React Native. If you encounter any issues, please feel free to ask for further clarification or assistance.

# Code Explanation
## Expo Software Code:
### Folder: app -> (tabs)
### `_layout.tsx`

This file defines the global layout for the app using Expo Router's `Tabs` navigation. It sets up the tab-based navigation structure and wraps the app with a `SettingsProvider` context to manage settings across screens. The bottom tab bar is hidden via styles, and a consistent background color is applied for visual unity across all pages.

### `camera.tsx`

This file implements the **Camera Screen** of the app, allowing users to capture images using the device camera and perform object detection on captured images using a TensorFlow.js YOLO model.

Key features:
- Opens the camera using `expo-image-picker`.
- Processes and resizes the selected image for model input.
- Runs inference using a pre-trained model to detect objects (e.g., black bunch).
- Displays bounding boxes around detected objects with confidence scores.
- Allows saving the result image (with bounding boxes) to the gallery.
- Includes UI feedback such as loading spinners, detection results, and error prompts.

The screen is integrated with the app's navigation and settings system, providing a responsive and customizable detection experience.

### `index.tsx`

This file defines the **Home Screen** of the app, serving as the entry point for users.

Key features:
- Displays the app logo, title, and a brief description explaining the app's purpose: black bunch detection for informed harvest decisions.
- Provides a "Get Started" button that triggers model loading and navigates to the upload screen.
- Shows a loading spinner with "Loading Model..." text while the TensorFlow/ML model is being loaded.
- Uses Expo Router for navigation and integrates with the app's overall color scheme and layout.

This screen guides the user to begin using the app by loading the detection model before proceeding to image capture or upload.

### `modelLoader.ts`

This file handles **TensorFlow.js model loading** for the application, ensuring efficient and reusable access to the trained object detection model.

Key features:
- Loads a pre-trained TensorFlow/ML model (`model.json` and weight files) from local assets.
- Converts and prepares model artifacts (topology, weights) for use with TensorFlow.js.
- Uses `tf.loadGraphModel` to load the model into memory for inference.
- Implements caching via `isModelLoaded` to avoid reloading the model on subsequent calls.
- Provides helper functions to access the loaded model (`getModel`) and check its status (`checkModelLoaded`).

This module is essential for enabling real-time object detection in the app using a locally stored YOLO model.

### `setting.tsx`

This file implements the **Settings Screen** of the app, allowing users to customize detection behavior and visual preferences.

Key features:
- Adjusts **confidence threshold** using a slider to control detection sensitivity.
- Changes **bounding box and text color** via a dropdown picker with multiple color options.
- Toggles display settings for **object labels** and **confidence percentages** using switches.
- Preserves user preferences using a React context (`settingsContext`).
- Includes bottom navigation to switch between app screens (Upload, Camera, Settings).

This screen enhances user experience by offering real-time customization of the object detection interface and behavior.

### `settingsContext.tsx`

This file defines a **React Context** for managing and sharing detection settings across the app.

Key features:
- Provides global access to detection display settings including:
  - `confidenceThreshold`: minimum confidence level for displaying detections
  - `boxColor`: color of bounding boxes and text labels
  - `showConfidence`: toggle to show/hide confidence percentages
  - `showLabel`: toggle to show/hide object labels
- Uses `useState` to manage settings values and provide update functions.
- Exposes a `useSettings()` hook for easy access to the context in functional components.

This module ensures consistent and persistent detection visualization preferences throughout the app.

### `upload.tsx`

This file implements the **Upload Screen** of the app, allowing users to select an image from their device gallery and perform object detection using a TensorFlow/ML model.

Key features:
- Lets users **select an image** from their gallery using `expo-image-picker`.
- **Resizes and preprocesses** the selected image for model input.
- Runs **object detection** using a pre-trained YOLO model loaded via `modelLoader`.
- Displays **bounding boxes** around detected objects (e.g., palm fruits) with confidence scores.
- Allows saving the result image (with bounding boxes) to the gallery via `ViewShot` and `MediaLibrary`.
- Integrates with the app’s **settings system** to customize display of labels, confidence values, and bounding box colors.
- Includes **bottom navigation** to switch between Upload, Camera, and Settings screens.

This screen provides a user-friendly way to detect black bunch in existing images and is essential for offline or post-capture analysis.

## Model Training Scripts:
### Folder: python_scripts -> model_training

### `yolo5_nano.py`

This script automates the **training and validation** of a **YOLOv5 Nano** object detection model.

Key features:
- Configures essential training parameters such as dataset path, model type (`yolov5n.pt`), number of epochs, batch size, image size, and output directory.
- Uses Python’s `subprocess` module to run YOLOv5’s built-in `train.py` and `val.py` scripts from the command line.
- Enables GPU acceleration when available, and falls back to CPU otherwise.
- Optimizes performance by caching the dataset during training and using **mixed-precision** during evaluation to reduce memory usage.
- Includes system-level optimizations to avoid CUDA/GitPython errors and improve stability.

This script is ideal for efficiently training a lightweight YOLOv5 model on limited hardware while maintaining good performance.

### `yolov5_small.py`

This script automates the **training and validation** of a **YOLOv5 Small** object detection model.

Key features:
- Sets up training parameters such as dataset path, model version (`yolov5s.pt`), number of epochs, batch size, and image size.
- Uses Python’s `subprocess` module to call YOLOv5's built-in `train.py` and `val.py` scripts for training and evaluation.
- Automatically utilizes GPU if available, and falls back to CPU otherwise.
- Implements optimizations like dataset caching and controlled worker count to improve performance and stability.
- Ensures safe execution by suppressing GitPython warnings and handling CUDA module loading carefully.
- Includes automatic Git configuration to avoid directory safety errors when running in a cloned repo.

This script is ideal for training a balanced-performance YOLOv5 model with moderate GPU resource usage while maintaining good accuracy.

### `yolov5_large.py`

This script automates the **training and validation** of a **YOLOv5 Large** object detection model.

Key features:
- Sets up training parameters such as dataset path, model version (`yolov5l.pt`), number of epochs (200), batch size (8), image size (640x640), and output directory.
- Uses Python’s `subprocess` module to run YOLOv5's built-in `train.py` and `val.py` scripts for training and evaluation.
- Utilizes GPU acceleration when available, falling back to CPU if necessary.
- Includes performance optimizations like dataset caching during training and **mixed-precision inference** during validation to reduce memory usage.
- Ensures smoother execution by suppressing GitPython warnings and managing CUDA behavior properly.
- Automatically configures Git safe directories for compatibility with cloned repositories.

This script is ideal for training high-accuracy models on capable hardware setups, particularly when maximizing detection precision is a priority.

### `yolov5_small_test.py`

This script performs **object detection** on a **single image** using a trained **YOLOv5 Small** model.

Key features:
- Runs YOLOv5’s built-in `detect.py` script via the command line to generate predictions.
- Detects objects, draws bounding boxes, and saves the output image along with detection labels.
- Clears previous detection results before each run to avoid overlapping or outdated results.
- Counts total number of detected objects and specifically counts instances of `"Black Bunch"` class.
- Displays the resulting image with bounding boxes using **OpenCV** and **Matplotlib**.
- Automatically uses **GPU (CUDA)** if available, otherwise falls back to CPU.

This script is useful for quick testing, validation, and visual analysis of YOLOv5 Small model performance on individual images.

### `yolov5_nano_test.py`

This script performs **object detection** on a **single image** using a trained **YOLOv5 Nano** model.

Key features:
- Runs YOLOv5’s built-in `detect.py` script via the command line to generate predictions.
- Detects objects, draws bounding boxes, and saves the output image along with detection labels.
- Clears previous detection results before each run to avoid overlapping or outdated results.
- Counts total number of detected objects and specifically counts instances of `"Black Bunch"` class.
- Displays the resulting image with bounding boxes using **OpenCV** and **Matplotlib**.
- Automatically uses **GPU (CUDA)** if available, otherwise falls back to CPU.

This script is useful for quick testing, validation, and visual analysis of YOLOv5 Nano model performance on individual images.

### `yolov8s_training.py`

This script automates the **training and evaluation** of a **YOLOv8 Small** object detection model using the official Ultralytics API.

Key features:
- Sets up training parameters such as dataset path, model version (`yolov8s.pt`), number of epochs, batch size, image size, and output directory.
- Uses the **Ultralytics YOLO API** for streamlined training and validation with GPU support.
- Enables performance optimizations like dataset caching to speed up training.
- Saves trained weights and logs results in a custom project folder.
- Includes a validation step that prints detailed **evaluation metrics** and **confusion matrix**.
- Ensures smoother execution by suppressing GitPython warnings and managing CUDA module loading carefully.

This script is ideal for training compact, high-performance models on standard GPU setups while keeping training logs and outputs well-organized.

## Data Processing and Annotation Scripts:
### Folder: python_scripts -> data_processing_annotation

### `annotation_checker.py`

This script is used to **visualize YOLO-format annotations** by drawing bounding boxes on the corresponding image.

Key features:
- Loads and parses `.txt` annotation files in YOLO format (normalized coordinates).
- Converts bounding box coordinates from relative to absolute pixel values.
- Draws bounding boxes and class labels (`Black Bunch`) on the image using OpenCV.
- Displays the annotated image using Matplotlib for easy visual verification.

This is a useful utility during dataset preparation and model evaluation to ensure that annotations are correctly formatted and aligned with their images.


### `COCO_annotation_checker.py`

This script is used to **visualize COCO-format annotations** by drawing bounding boxes on the corresponding images.

Key features:
- Loads a **COCO JSON annotation file** and maps each image to its annotations.
- Converts image filenames to their corresponding IDs and bounding box data.
- Displays a selected image with its ground-truth bounding boxes using **OpenCV** and **Matplotlib**.
- Draws **bounding boxes** and adds **class labels** for visual verification.
- Accepts user input to specify which image to visualize via filename.

Use this tool during dataset preparation or evaluation to verify that **COCO-style annotations are correctly formatted and aligned** with the corresponding image.

### `split_dataset.py`

This script **splits a YOLO-formatted dataset** into training and validation subsets.

Key features:
- Organizes images and corresponding label files into `train` and `val` directories under `images` and `labels` folders.
- Splits the dataset based on a specified ratio (default is 80% train, 20% validation).
- Randomly shuffles the image list for balanced data distribution.
- Preserves class labels by copying both image and annotation files together.

This utility helps prepare datasets for YOLO model training while ensuring file structure compatibility with standard YOLO implementations.

### `json2txt.py`

This script **converts annotated object data from JSON format to YOLO-compatible TXT format**.

Key features:
- Parses JSON files containing segmentation data and image dimensions.
- Normalizes polygon coordinates based on image width and height.
- Outputs annotations in YOLO TXT format, preserving structure for segmentation tasks.
- Automatically assigns a predefined class label (e.g., `1` for "Black Bunch").

This utility facilitates seamless conversion from custom or third-party annotation formats to YOLO format, enabling smooth integration into training pipelines.

### `label_correction.py`

This script **updates YOLO-format annotation files by modifying class IDs**, allowing refinement of label definitions.

Key features:
- Changes all class ID `1` entries to `0`, making "Black Bunch" the sole label.
- Processes every `.txt` annotation file within the specified directory.
- Saves the updated annotation files to a separate output directory to preserve the original data.
- Ensures compatibility with YOLO training pipelines by maintaining standard annotation structure.

This utility helps clean and unify class labels, especially when reassigning or simplifying categories during dataset preparation.

### `qua_classifier.py`

This script **automatically classifies images as 'clear' or 'blurred'** using a combination of OpenCV-based blurriness detection and a trained CNN model.

Key features:
- Detects image blurriness using the Laplacian variance method with a customizable threshold.
- Automatically organizes images into `clear` and `blurred` directories for dataset preparation.
- Trains a Convolutional Neural Network (CNN) on the classified images to enable future automated quality assessment.
- Includes real-time GPU memory configuration and model checkpointing to optimize training efficiency and save the best model.


### `tojpg.py`

This script **converts image files (e.g., PNG, WEBP) to JPEG format** using the Python Imaging Library (Pillow).

Key features:
- Supports input formats like PNG, WEBP, and others compatible with Pillow.
- Converts images to RGB mode before saving as JPEG to ensure compatibility.
- Automatically renames and saves the converted image with a `.jpg` extension in the specified output directory.
- Includes basic error handling to catch and report failed conversions.

This utility simplifies batch or single-image format conversion for compatibility with systems or applications requiring JPEG format.

### `yolo_format_convert.py`

This script **converts polygon-based annotations to YOLO bounding box format** and **copies all associated images**—annotated or not—into a new dataset directory to improve model robustness.

#### Key Features:
- **Polygon to YOLO Conversion**: Reads `.txt` files containing class ID and polygon coordinates, then calculates and writes normalized YOLO format bounding boxes (`center_x center_y width height`).
- **Robustness Enhancement**: Copies both annotated and non-annotated images to the output directory to help the model learn from real-world noise and edge cases.
- **Directory Management**: Automatically organizes output into `images/` and annotation files in the root of the target folder.
- **Progress Tracking**: Uses `tqdm` for live progress bars during annotation conversion and image copying.

This utility is ideal for preparing real-world image datasets with polygon annotations for YOLOv5/v8 training.

### `yolo_to_coco.py`

This script **converts YOLO-format annotations to COCO-format JSON**, making it easier to evaluate or visualize YOLO-trained datasets with COCO-compatible tools (e.g. COCOEval, FiftyOne, CVAT).

#### Key Features:
- **Format Conversion**: Transforms YOLO normalized bounding boxes (`class_id x_center y_center width height`) into absolute COCO format (`[xmin, ymin, width, height]`).
- **Image Metadata Extraction**: Reads image dimensions using Pillow to calculate bounding box positions accurately.
- **Flexible Category Support**: Customize the `categories` list to match your dataset class structure.
- **Fully Structured COCO Output**: Includes `images`, `annotations`, and `categories` fields in the standard COCO dataset format.


## Active Learning Related Scripts:
### Folder: python_scripts -> active_learning
Certainly! Here's the brief introduction for your `find_FNsample.py` script in a similar format:

---

### `find_FPsample.py`

This script **identifies false positive predictions** from a YOLOv5 model inference and **moves the corresponding images** to a separate folder for further review and retraining. It aids in improving model performance through **active learning** by using the false positives to refine the model.

#### Key Features:
- **False Positive Detection**: Processes images in batches, runs inference on each image, and checks for incorrect object detections (false positives).
- **Efficient Image Management**: Automatically moves images with false positives to a dedicated output folder for easy access and further analysis.
- **Batch Processing**: Optimized to process large datasets in batches for faster inference using GPU acceleration.
- **Model Robustness Enhancement**: The identified false positive images can be used to augment the training dataset, improving model accuracy and robustness over time.

This utility is essential for **active learning workflows**, where incorrect predictions are leveraged to continually improve a YOLO-based model's performance.