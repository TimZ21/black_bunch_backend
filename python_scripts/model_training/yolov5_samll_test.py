# Author: Zhang Shuning
# This script performs object detection using a trained YOLOv5 small model on a single image.
# It runs the YOLOv5 detection script via CLI to generate predictions, saves the output with bounding boxes,
# and displays the resulting image using OpenCV and Matplotlib.

import os
import torch
import subprocess
import sys
import cv2
import shutil
import matplotlib.pyplot as plt

# Path to YOLOv5 directory, trained weights, and dataset
yolov5_directory = r'D:\UniDoc\y2s1\SEGP\yolov5'
weights_path = r"D:\UniDoc\y2s1\SEGP\yolov5\yolov5_training_project_small\exp12\weights\best.pt"
img_size = 640
image_path = r"D:\UniDoc\y2s1\SEGP\yolov5\yolov5_training_project_small\exp12\73b3e4c93c45477dcf48683e0e48637.jpg"
output_folder = r'D:\UniDoc\y2s1\SEGP\yolov5\runs\detect\exp'

# List of class names (update this list according to your dataset)
class_names = ['Black Bunch']

# Target class to count
target_class_name = 'Black Bunch'

# Function to test YOLOv5 model using CLI
def test_yolov5():
    if not os.path.exists(weights_path):
        print(f"Error: No weights file found at {weights_path}")
        return

    detect_script_path = os.path.join(yolov5_directory, 'detect.py')
    if not os.path.exists(detect_script_path):
        print(f"Error: detect.py not found at {detect_script_path}")
        return

    # Remove old detection results to prevent duplicate bounding boxes
    if os.path.exists(output_folder):
        shutil.rmtree(output_folder)  # Deletes the folder and its contents
        print("Previous detection results cleared.")

    command = [ 
        sys.executable, detect_script_path,
        '--weights', weights_path,
        '--img', str(img_size),
        '--source', image_path,
        '--device', '0' if torch.cuda.is_available() else 'cpu',
        '--conf-thres', '0.4',  
        '--save-txt',
        '--save-conf',
        '--project', 'runs/detect',
        '--name', 'exp',
        '--exist-ok'
    ]
    subprocess.run(command, cwd=yolov5_directory)

# Function to count the number of "Black Bunch" objects detected
def count_black_bunch_objects():
    label_folder = os.path.join(output_folder, 'labels')
    label_file = os.path.join(label_folder, os.path.splitext(os.path.basename(image_path))[0] + '.txt')

    if not os.path.exists(label_file):
        print(f"Error: No label file found at {label_file}")
        return 0

    black_bunch_count = 0
    with open(label_file, 'r') as file:
        lines = file.readlines()
        for line in lines:
            class_id = int(line.split()[0])
            class_name = class_names[class_id]
            if class_name == target_class_name:
                black_bunch_count += 1

    print(f"Number of 'Black Bunch' objects detected: {black_bunch_count}")
    return black_bunch_count

# Function to count the total number of bounding boxes drawn
def count_bounding_boxes():
    label_folder = os.path.join(output_folder, 'labels')
    label_file = os.path.join(label_folder, os.path.splitext(os.path.basename(image_path))[0] + '.txt')

    if not os.path.exists(label_file):
        print(f"Error: No label file found at {label_file}")
        return 0

    # Count the total number of lines in the label file (each line represents a bounding box)
    with open(label_file, 'r') as file:
        total_boxes = len(file.readlines())

    print(f"Total number of bounding boxes drawn: {total_boxes}")
    return total_boxes

# Function to show the output image with detections
def show_output_image():
    output_image_path = os.path.join(output_folder, os.path.basename(image_path))
    if not os.path.exists(output_image_path):
        print(f"Error: No output image found at {output_image_path}")
        return

    image = cv2.imread(output_image_path)
    if image is None:
        print(f"Error: Could not load image from {output_image_path}")
        return

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    plt.imshow(image)
    plt.axis('off')
    plt.show()

if __name__ == '__main__':
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")

    # Test YOLOv5
    test_yolov5()

    # Count and display the number of "Black Bunch" objects detected
    black_bunch_count = count_black_bunch_objects()

    # Count and display the total number of bounding boxes drawn
    total_boxes_count = count_bounding_boxes()

    # Show the output image
    show_output_image()

    print("Testing completed!")
