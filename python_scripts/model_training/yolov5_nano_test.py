# Author: Zhang Shuning
# This script performs object detection using a trained YOLOv5 nano model on a single image.
# It runs the YOLOv5 detection script via CLI to generate predictions, saves the output with bounding boxes,
# and displays the resulting image using OpenCV and Matplotlib.

import os
import torch
import subprocess
import sys
import cv2
import matplotlib.pyplot as plt

# Path to YOLOv5 directory, trained weights, and dataset
yolov5_directory = r'D:\UniDoc\y2s1\SEGP\yolov5'  # Update to where YOLOv5 repository is located
weights_path = r'D:\UniDoc\y2s1\SEGP\yolov5\yolov5_training_project\exp7\weights\best.pt'  # Path to the trained weights file
img_size = 640  # Set the image size to use during testing
image_path = r"D:\UniDoc\y2s1\SEGP\dataset\yolo_dataset_splited\images\val\0008f9ecf8_001.jpg"  # Path to the image you want to test
output_folder = r'D:\UniDoc\y2s1\SEGP\yolov5\runs\detect\exp'  # Folder where results are saved

# Function to test YOLOv5 model using CLI
def test_yolov5():
    # Check if 'best.pt' exists
    if not os.path.exists(weights_path):
        print(f"Error: No weights file found at {weights_path}")
        return

    # Path to detect.py inside YOLOv5 directory
    detect_script_path = os.path.join(yolov5_directory, 'detect.py')
    if not os.path.exists(detect_script_path):
        print(f"Error: detect.py not found at {detect_script_path}")
        return

    # Command to run detection
    command = [
        sys.executable, detect_script_path,  # Use the full path to 'detect.py'
        '--weights', weights_path,
        '--img', str(img_size),
        '--source', image_path,  # Path to the input image or folder of images
        '--device', '0' if torch.cuda.is_available() else 'cpu',  # Ensure GPU is used if available
        '--conf-thres', '0.25',  # Confidence threshold for detection
        '--save-txt',  # Save detection results in text files
        '--save-conf',  # Save confidences in text files
        '--project', 'runs/detect',  # Output project folder
        '--name', 'exp',  # Name of the experiment (subfolder)
        '--exist-ok'  # Overwrite the folder if it already exists
    ]
    subprocess.run(command, cwd=yolov5_directory)  # Set working directory to YOLOv5

def show_output_image():
    # Path to the output image
    output_image_path = os.path.join(output_folder, os.path.basename(image_path))
    
    # Check if the output image exists
    if not os.path.exists(output_image_path):
        print(f"Error: No output image found at {output_image_path}")
        return

    # Load and display the processed image
    image = cv2.imread(output_image_path)
    if image is None:
        print(f"Error: Could not load image from {output_image_path}")
        return

    # Convert BGR (OpenCV default) to RGB for displaying with Matplotlib
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Display the image with bounding boxes
    plt.imshow(image)
    plt.axis('off')  # Hide axis
    plt.show()

if __name__ == '__main__':
    # Check if GPU is available
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")

    # Test YOLOv5
    test_yolov5()

    # Show the output image
    show_output_image()

    print("Testing completed!")
