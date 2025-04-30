# Author: Zhang Shuning
# This script performs batch object detection using a trained YOLOv5 model to identify and move images containing detected objects.
# It searches for 'img' folders recursively, runs inference on images in batches, and moves images with detections to a specified output folder.
# The script uses GPU acceleration, custom confidence thresholds, and parallel preprocessing for efficient processing.

import os
import torch
from PIL import Image
import shutil
from concurrent.futures import ThreadPoolExecutor

# Path to YOLOv5 directory, trained weights, and dataset
yolov5_directory = r'D:\UniDoc\y2s1\SEGP\yolov5'
weights_path = r"D:\UniDoc\y2s1\SEGP\yolov5\yolov5_training_project_small\exp9\weights\best.pt"
img_size = 640
root_folder = r"D:\UniDoc\y2s1\SEGP\dataset\archive"  # Root folder containing multiple subfolders
output_folder = r"D:\UniDoc\y2s1\SEGP\dataset\false_negative"  # Folder to store processed images

# Ensure the output folder exists
os.makedirs(output_folder, exist_ok=True)

# Load YOLOv5 model using Torch Hub
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = torch.hub.load(yolov5_directory, 'custom', path=weights_path, source='local').to(device)
model.conf = 0.4  # Set confidence threshold
model.iou = 0.45  # Set IoU threshold
model.max_det = 100  # Maximum number of detections per image
model.eval()

# Function to preprocess images
def preprocess_image(image_path):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((img_size, img_size))  # Resize to YOLOv5 input size
    return img

# Function to perform batch inference
def batch_inference(image_paths):
    images = [preprocess_image(path) for path in image_paths]
    results = model(images)  # Perform batch inference
    return results.pandas().xyxy  # Return detection results as pandas DataFrames

# Function to move the processed image to the output folder
def move_processed_image(image_path, output_folder):
    try:
        shutil.move(image_path, output_folder)
        print(f"Moved {image_path} to {output_folder}")
    except Exception as e:
        print(f"Error moving file: {e}")

# Function to find all img folders recursively
def find_img_folders(root_folder):
    img_folders = []
    for root, dirs, files in os.walk(root_folder):
        if 'img' in dirs:
            img_folders.append(os.path.join(root, 'img'))
    return img_folders

# Function to process all images in all img folders
def process_all_images():
    print(f"Using device: {device}")

    # Find all img folders
    img_folders = find_img_folders(root_folder)
    if not img_folders:
        print("No img folders found in the root folder.")
        return

    # Process each img folder
    for img_folder in img_folders:
        print(f"\nProcessing images in folder: {img_folder}")

        # Get all image files from the current img folder
        image_files = [f for f in os.listdir(img_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if not image_files:
            print(f"No images found in {img_folder}. Skipping.")
            continue

        # Split images into batches
        batch_size = 32  # Adjust based on GPU memory
        image_paths = [os.path.join(img_folder, f) for f in image_files]

        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i + batch_size]
            print(f"Processing batch {i // batch_size + 1} with {len(batch_paths)} images...")

            # Perform batch inference
            results = batch_inference(batch_paths)

            # Process results for each image in the batch
            for j, result in enumerate(results):
                image_path = batch_paths[j]
                if not result.empty:  # If detections exist
                    print(f"Detections found for {os.path.basename(image_path)}. Moving to output folder.")
                    move_processed_image(image_path, output_folder)
                else:
                    print(f"No detections found for {os.path.basename(image_path)}. Skipping.")

    print("\nAll images processed!")

if __name__ == '__main__':
    process_all_images()